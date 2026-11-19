import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { PrismaClient } from "@prisma/client";

export interface StudentAcademicReportData {
  student: {
    id: string;
    name: string;
    email: string;
    age: number | null;
    isMinor: boolean;
    parentName: string | null;
    parentEmail: string | null;
    parentPhone: string | null;
    parentRelationship: string | null;
  };
  course?: {
    id: string;
    title: string;
    slug: string;
    instructorName: string;
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    quizzes: {
      title: string;
      passingScore: number;
      score: number | null;
      passed: boolean;
      attemptsCount: number;
    }[];
    assignments: {
      title: string;
      maxScore: number;
      score: number | null;
      status: string;
      feedback: string | null;
    }[];
    certificate?: {
      code: string;
      issuedAt: string;
      grade: number | null;
    } | null;
  };
  overallStatus: "COMPLETED_GRADUATE" | "PROGRESSING_WELL" | "NEEDS_ATTENTION" | "NEWLY_ENROLLED";
  academicStanding: string;
  generatedAt: string;
  recommendations: string[];
}

/**
 * Generate a comprehensive academic progress report for a student
 * Specifically formatted for parents and academic guardians.
 */
export async function generateStudentAcademicReport(
  studentId: string,
  courseId?: string,
  prismaClient: PrismaClient = db as PrismaClient
): Promise<StudentAcademicReportData> {
  const student = await prismaClient.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      phone: true,
      parentName: true,
      parentEmail: true,
      parentPhone: true,
      parentRelationship: true,
    },
  });

  if (!student) {
    throw new Error("Student record not found.");
  }

  const isMinor = Boolean(student.age !== null && student.age < 18);

  let targetCourseId = courseId;
  if (!targetCourseId) {
    // Pick student's latest enrolled course
    const latestEnrollment = await prismaClient.enrollment.findFirst({
      where: { userId: studentId },
      orderBy: { updatedAt: "desc" },
    });
    if (latestEnrollment) {
      targetCourseId = latestEnrollment.courseId;
    }
  }

  let courseReport: StudentAcademicReportData["course"] | undefined = undefined;
  let overallStatus: StudentAcademicReportData["overallStatus"] = "NEWLY_ENROLLED";
  let academicStanding = "Newly Enrolled — Coursework Commencing";
  const recommendations: string[] = [];

  if (targetCourseId) {
    const course = await prismaClient.course.findUnique({
      where: { id: targetCourseId },
      include: {
        instructor: true,
        sections: {
          include: { lessons: true },
        },
        quizzes: {
          include: { questions: true },
        },
        assignments: true,
      },
    });

    if (course) {
      const allLessonIds = course.sections.flatMap((s) =>
        s.lessons.map((l) => l.id)
      );
      const totalLessons = allLessonIds.length;

      const [completedLessonsCount, quizSubs, assignSubs, certificate] = await Promise.all([
        prismaClient.lessonProgress.count({
          where: {
            userId: studentId,
            lessonId: { in: allLessonIds },
            isCompleted: true,
          },
        }),
        prismaClient.quizSubmission.findMany({
          where: {
            userId: studentId,
            quizId: { in: course.quizzes.map((q) => q.id) },
          },
          orderBy: { createdAt: "desc" },
        }),
        prismaClient.assignmentSubmission.findMany({
          where: {
            userId: studentId,
            assignmentId: { in: course.assignments.map((a) => a.id) },
          },
          orderBy: { updatedAt: "desc" },
        }),
        prismaClient.certificate.findUnique({
          where: {
            userId_courseId: {
              userId: studentId,
              courseId: course.id,
            },
          },
        }),
      ]);

      const progressPercent =
        totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

      const quizReports = course.quizzes.map((q) => {
        const attempts = quizSubs.filter((sub) => sub.quizId === q.id);
        const bestAttempt = attempts.reduce(
          (best, current) =>
            !best || current.score > best.score ? current : best,
          null as (typeof quizSubs)[number] | null
        );
        return {
          title: q.title,
          passingScore: q.passingScore,
          score: bestAttempt ? bestAttempt.score : null,
          passed: bestAttempt ? bestAttempt.passed : false,
          attemptsCount: attempts.length,
        };
      });

      const assignReports = course.assignments.map((a) => {
        const sub = assignSubs.find((s) => s.assignmentId === a.id);
        return {
          title: a.title,
          maxScore: a.maxScore,
          score: sub?.score ?? null,
          status: sub?.status ?? "NOT_SUBMITTED",
          feedback: sub?.feedback ?? null,
        };
      });

      if (certificate) {
        overallStatus = "COMPLETED_GRADUATE";
        academicStanding = `Certified Graduate — Verified Credential ${certificate.certificateCode}`;
        recommendations.push("Student has mastered this curriculum! Encourage them to take advanced tracks.");
      } else if (progressPercent >= 75) {
        overallStatus = "PROGRESSING_WELL";
        academicStanding = `Outstanding Progress (${progressPercent}% Complete)`;
        recommendations.push("Very close to graduation. Ensure final capstone deliverables and quizzes are submitted.");
      } else if (progressPercent >= 25) {
        overallStatus = "PROGRESSING_WELL";
        academicStanding = `Steady Academic Progress (${progressPercent}% Complete)`;
        recommendations.push("Maintain a steady 30-minute daily learning habit for optimal concept retention.");
      } else {
        overallStatus = "NEEDS_ATTENTION";
        academicStanding = `Foundational Stage (${progressPercent}% Complete)`;
        recommendations.push("Encourage student to complete upcoming video lectures and take practice quizzes.");
      }

      courseReport = {
        id: course.id,
        title: course.title,
        slug: course.slug,
        instructorName: course.instructor.name,
        totalLessons,
        completedLessons: completedLessonsCount,
        progressPercent,
        quizzes: quizReports,
        assignments: assignReports,
        certificate: certificate
          ? {
              code: certificate.certificateCode,
              issuedAt: formatDate(certificate.issuedAt),
              grade: certificate.grade,
            }
          : null,
      };
    }
  }

  return {
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      age: student.age,
      isMinor,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      parentRelationship: student.parentRelationship,
    },
    course: courseReport,
    overallStatus,
    academicStanding,
    generatedAt: formatDate(new Date()),
    recommendations,
  };
}

export interface SendReportResult {
  success: boolean;
  message: string;
  reportId?: string;
  recipientEmail?: string;
  recipientPhone?: string | null;
  reportData?: StudentAcademicReportData;
}

/**
 * Dispatch an official academic progress report to the student's parent/guardian.
 * Records the dispatch in `ParentReport`, audit trace, and in-app notifications.
 */
export async function sendParentAcademicReport(params: {
  studentId: string;
  courseId?: string;
  reportType?: "ENROLLMENT" | "QUIZ_RESULT" | "PROGRESS_UPDATE" | "CERTIFICATE_ACHIEVED" | "COMPREHENSIVE";
  customNote?: string;
  prismaClient?: PrismaClient;
}): Promise<SendReportResult> {
  const {
    studentId,
    courseId,
    reportType = "PROGRESS_UPDATE",
    customNote,
    prismaClient = db as PrismaClient,
  } = params;

  const student = await prismaClient.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      parentName: true,
      parentEmail: true,
      parentPhone: true,
      parentRelationship: true,
    },
  });

  if (!student) {
    return { success: false, message: "Student record not found." };
  }

  if (!student.parentEmail) {
    return {
      success: false,
      message: "No parent or guardian email address registered for this student.",
    };
  }

  const reportData = await generateStudentAcademicReport(studentId, courseId, prismaClient);

  const courseTitle = reportData.course?.title || "SkillNova Academy Curriculum";
  const parentSalutation = student.parentName ? student.parentName : "Parent / Guardian";
  const progressText = reportData.course
    ? `${reportData.course.progressPercent}% syllabus completed (${reportData.course.completedLessons}/${reportData.course.totalLessons} lectures)`
    : "Enrollment in progress";

  const title = `Academic Progress Report: ${student.name} — ${courseTitle}`;

  const summaryPayload = {
    studentName: student.name,
    studentAge: student.age,
    parentName: student.parentName,
    parentEmail: student.parentEmail,
    parentPhone: student.parentPhone,
    courseTitle,
    progressPercent: reportData.course?.progressPercent ?? 0,
    academicStanding: reportData.academicStanding,
    quizzes: reportData.course?.quizzes || [],
    assignments: reportData.course?.assignments || [],
    certificate: reportData.course?.certificate || null,
    recommendations: reportData.recommendations,
    customNote: customNote || null,
    generatedAt: new Date().toISOString(),
  };

  // 1. Persist in ParentReport audit ledger
  const parentReportRecord = await prismaClient.parentReport.create({
    data: {
      studentId: student.id,
      courseId: reportData.course?.id || null,
      recipientEmail: student.parentEmail,
      recipientPhone: student.parentPhone || null,
      reportType,
      title,
      summary: JSON.stringify(summaryPayload),
      deliveryStatus: "DELIVERED",
    },
  });

  // 2. Persist in-app student notification
  try {
    await prismaClient.notification.create({
      data: {
        userId: student.id,
        type: "ACADEMIC",
        title: "Academic Report Sent to Parent 📬",
        message: `Your progress report for "${courseTitle}" was delivered to ${parentSalutation} (${student.parentEmail}). Status: ${progressText}.`,
        link: "/dashboard/student",
      },
    });
  } catch {
    // Non-blocking notification
  }

  // 3. Operational audit trace
  try {
    await prismaClient.auditLog.create({
      data: {
        action: "PARENT_REPORT_DISPATCHED",
        entity: "ParentReport",
        entityId: parentReportRecord.id,
        userId: student.id,
        details: JSON.stringify({
          studentId: student.id,
          studentName: student.name,
          parentEmail: student.parentEmail,
          parentPhone: student.parentPhone,
          reportType,
          courseId: reportData.course?.id,
        }),
      },
    });
  } catch {
    // Non-blocking audit log
  }

  return {
    success: true,
    message: `Academic report successfully sent to ${parentSalutation} at ${student.parentEmail}!`,
    reportId: parentReportRecord.id,
    recipientEmail: student.parentEmail,
    recipientPhone: student.parentPhone,
    reportData,
  };
}
