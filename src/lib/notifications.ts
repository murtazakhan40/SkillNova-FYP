import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export interface StudentNotification {
  id: string;
  type: "CERTIFICATE" | "QUIZ" | "ENROLLMENT" | "ACADEMIC";
  title: string;
  message: string;
  timestamp: string;
  link: string;
  unread: boolean;
}

export async function getStudentNotifications(userId: string): Promise<StudentNotification[]> {
  const notifications: StudentNotification[] = [];

  // 1. Earned Certificates
  const certificates = await db.certificate.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { issuedAt: "desc" },
    take: 3,
  });

  certificates.forEach((cert) => {
    notifications.push({
      id: `cert-${cert.id}`,
      type: "CERTIFICATE",
      title: "Digital Certificate Issued",
      message: `Congratulations! Official credential ${cert.certificateCode} issued for "${cert.course.title}".`,
      timestamp: formatDate(cert.issuedAt),
      link: `/dashboard/student/certificates`,
      unread: false,
    });
  });

  // 2. Recent Quiz Submissions
  const submissions = await db.quizSubmission.findMany({
    where: { userId },
    include: {
      quiz: {
        include: { course: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  submissions.forEach((sub) => {
    notifications.push({
      id: `quiz-${sub.id}`,
      type: "QUIZ",
      title: sub.passed ? "Assessment Passed 🎉" : "Assessment Needs Retake",
      message: `You scored ${sub.score}% on "${sub.quiz.title}" (${sub.quiz.course.title}).`,
      timestamp: formatDate(sub.createdAt),
      link: `/dashboard/student/quizzes`,
      unread: !sub.passed,
    });
  });

  // 3. Active Course Progress Milestone
  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { updatedAt: "desc" },
    take: 2,
  });

  enrollments.forEach((enr) => {
    if (enr.progress > 0 && enr.progress < 100) {
      notifications.push({
        id: `enr-${enr.id}`,
        type: "ENROLLMENT",
        title: "Continue Your Learning Momentum",
        message: `You have completed ${enr.progress}% of "${enr.course.title}". Keep going!`,
        timestamp: formatDate(enr.updatedAt),
        link: `/courses/${enr.course.slug}`,
        unread: false,
      });
    }
  });

  // 4. Official Academic Announcement
  notifications.push({
    id: "academic-fyp-notice",
    type: "ACADEMIC",
    title: "FYP Academic Milestone Verification",
    message: "SkillNova digital credentials are authenticated via SHA-256 cryptographic verification.",
    timestamp: "Active Term",
    link: "/verify",
    unread: false,
  });

  return notifications;
}
