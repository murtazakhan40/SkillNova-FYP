import crypto from "crypto";
import { db } from "@/lib/db";
import type { Prisma, PrismaClient } from "@prisma/client";

export type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Generate a cryptographically secure, difficult-to-guess certificate credential code.
 * Format: SN-2026-XXXX-XXXX-XXXX (48 bits of cryptographic entropy).
 */
export function generateSecureCertificateCode(): string {
  const bytes = crypto.randomBytes(6);
  const hex = bytes.toString("hex").toUpperCase();
  const block1 = hex.substring(0, 4);
  const block2 = hex.substring(4, 8);
  const block3 = hex.substring(8, 12);
  return `SN-2026-${block1}-${block2}-${block3}`;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  certificate?: {
    id: string;
    certificateCode: string;
    grade: number | null;
    issuedAt: Date;
    isRevoked: boolean;
  };
  newlyIssued?: boolean;
}

/**
 * Evaluate actual course completion and assessment requirements.
 * Rules:
 * 1. User must be enrolled in the course.
 * 2. 100% of course lessons must be completed.
 * 3. If the course has an Assessment Quiz, the student MUST have a passing quiz submission.
 * 4. Grade is recorded only when verified from an actual passing assessment attempt.
 * 5. Issues certificate atomically if eligible and not previously issued.
 */
export async function evaluateAndIssueCertificate(
  userId: string,
  courseId: string,
  prismaClient: DbClient = db
): Promise<EligibilityResult> {
  // 1. Check enrollment
  const enrollment = await prismaClient.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    return {
      eligible: false,
      reason: "Student is not enrolled in this course.",
    };
  }

  // 2. Fetch full course structure (all sections & lessons)
  const course = await prismaClient.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        include: {
          lessons: {
            select: { id: true },
          },
        },
      },
      quizzes: true,
      assignments: true,
    },
  });

  if (!course) {
    return {
      eligible: false,
      reason: "Course not found.",
    };
  }

  const allLessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id));
  const totalLessons = allLessonIds.length;

  // 1. Lessons Rule: Verify that EVERY lesson is completed by the student (100% curriculum completion)
  if (totalLessons > 0) {
    const completedCount = await prismaClient.lessonProgress.count({
      where: {
        userId,
        lessonId: { in: allLessonIds },
        isCompleted: true,
      },
    });

    if (completedCount < totalLessons) {
      return {
        eligible: false,
        reason: `Coursework incomplete: ${completedCount}/${totalLessons} lessons completed (100% required).`,
      };
    }
  }

  // 2. Assessment Quiz Rule: If course has quizzes, student MUST pass each assessment
  let verifiedGrade: number | null = null;
  const gradeComponents: number[] = [];

  if (course.quizzes && course.quizzes.length > 0) {
    const scores: number[] = [];
    for (const q of course.quizzes) {
      const passingAttempt = await prismaClient.quizSubmission.findFirst({
        where: {
          quizId: q.id,
          userId,
          passed: true,
        },
        orderBy: { score: "desc" },
      });

      if (!passingAttempt) {
        return {
          eligible: false,
          reason: `Course assessment not passed. Minimum score of ${q.passingScore}% required.`,
        };
      }
      scores.push(passingAttempt.score);
    }

    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    gradeComponents.push(avg);
  }

  // 3. Capstone Assignment Rule: If course has project assignments, student MUST submit and pass each deliverable
  if (course.assignments && course.assignments.length > 0) {
    const assignmentPercentages: number[] = [];
    for (const a of course.assignments) {
      const submission = await prismaClient.assignmentSubmission.findUnique({
        where: {
          assignmentId_userId: {
            assignmentId: a.id,
            userId,
          },
        },
      });

      if (!submission) {
        return {
          eligible: false,
          reason: `Capstone project incomplete: "${a.title}" deliverable must be submitted.`,
        };
      }

      if (submission.status === "RESUBMIT_REQUESTED") {
        return {
          eligible: false,
          reason: `Capstone assignment "${a.title}" requires revisions before certification.`,
        };
      }

      if (submission.status !== "GRADED") {
        return {
          eligible: false,
          reason: `Capstone assignment "${a.title}" is pending faculty review. Certificate unlocks once evaluated and cleared.`,
        };
      }

      if (submission.score === null) {
        return {
          eligible: false,
          reason: `Capstone assignment "${a.title}" has not received a final grade.`,
        };
      }

      const scoreRatio = submission.score / a.maxScore;
      if (scoreRatio < 0.7) {
        return {
          eligible: false,
          reason: `Capstone assignment "${a.title}" did not achieve passing grade (${Math.round(scoreRatio * 100)}% achieved, 70% required).`,
        };
      }

      assignmentPercentages.push(scoreRatio * 100);
    }

    const assignAvg = assignmentPercentages.reduce((sum, s) => sum + s, 0) / assignmentPercentages.length;
    gradeComponents.push(assignAvg);
  }

  // Calculate composite verified grade across evaluated quizzes and assignments
  if (gradeComponents.length > 0) {
    const totalAvg = gradeComponents.reduce((sum, s) => sum + s, 0) / gradeComponents.length;
    verifiedGrade = Math.round(totalAvg * 10) / 10;
  }

  // 4. Check if Certificate already exists
  const existingCert = await prismaClient.certificate.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingCert) {
    // If existing certificate did not have grade recorded, backfill with verifiedGrade
    if (existingCert.grade === null && verifiedGrade !== null) {
      const updated = await prismaClient.certificate.update({
        where: { id: existingCert.id },
        data: { grade: verifiedGrade },
      });
      return {
        eligible: true,
        certificate: updated,
        newlyIssued: false,
      };
    }

    return {
      eligible: true,
      certificate: existingCert,
      newlyIssued: false,
    };
  }

  // 5. Generate secure, high-entropy unique certificate code
  let uniqueCode = generateSecureCertificateCode();
  // Guarantee absolute uniqueness against rare collision
  let codeCollision = await prismaClient.certificate.findUnique({
    where: { certificateCode: uniqueCode },
  });
  while (codeCollision) {
    uniqueCode = generateSecureCertificateCode();
    codeCollision = await prismaClient.certificate.findUnique({
      where: { certificateCode: uniqueCode },
    });
  }

  // 6. Issue verified certificate
  const newCertificate = await prismaClient.certificate.create({
    data: {
      certificateCode: uniqueCode,
      userId,
      courseId,
      grade: verifiedGrade,
      issuedAt: new Date(),
    },
  });

  // 7. Audit log trace
  await prismaClient.auditLog.create({
    data: {
      action: "CERTIFICATE_ISSUED",
      entity: "Certificate",
      entityId: newCertificate.id,
      details: JSON.stringify({
        certificateCode: uniqueCode,
        courseId,
        userId,
        grade: verifiedGrade,
        issuedAt: newCertificate.issuedAt.toISOString(),
      }),
      userId,
    },
  });

  return {
    eligible: true,
    certificate: newCertificate,
    newlyIssued: true,
  };
}
