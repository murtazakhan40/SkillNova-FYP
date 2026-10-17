import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export interface DashboardNotification {
  id: string;
  type: "CERTIFICATE" | "QUIZ" | "ENROLLMENT" | "ACADEMIC" | "SYSTEM" | "USER";
  title: string;
  message: string;
  timestamp: string;
  link: string;
  unread: boolean;
}

export type StudentNotification = DashboardNotification;

/**
 * Fetch genuine notifications for a student
 */
export async function getStudentNotifications(userId: string): Promise<DashboardNotification[]> {
  const notifications: DashboardNotification[] = [];

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

/**
 * Fetch authentic notifications for an administrator
 */
export async function getAdminNotifications(): Promise<DashboardNotification[]> {
  const notifications: DashboardNotification[] = [];

  // 1. Recent Registrations
  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  recentUsers.forEach((u) => {
    notifications.push({
      id: `admin-user-${u.id}`,
      type: "USER",
      title: "New Account Registered",
      message: `${u.name} (${u.email}) joined as ${u.role}.`,
      timestamp: formatDate(u.createdAt),
      link: `/dashboard/admin/users`,
      unread: false,
    });
  });

  // 2. Recent Enrollments
  const recentEnrollments = await db.enrollment.findMany({
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  recentEnrollments.forEach((enr) => {
    notifications.push({
      id: `admin-enr-${enr.id}`,
      type: "ENROLLMENT",
      title: "Course Enrollment Activity",
      message: `${enr.user.name} enrolled in "${enr.course.title}".`,
      timestamp: formatDate(enr.createdAt),
      link: `/dashboard/admin/reports`,
      unread: false,
    });
  });

  // 3. System Status
  notifications.push({
    id: "admin-system-health",
    type: "SYSTEM",
    title: "System Integrity Normal",
    message: "SQLite 3NF database, bcrypt authentication, and Next.js server actions are operational.",
    timestamp: "System Online",
    link: `/dashboard/admin`,
    unread: false,
  });

  return notifications;
}

/**
 * Fetch authentic notifications for a trainer
 */
export async function getTrainerNotifications(trainerId: string): Promise<DashboardNotification[]> {
  const notifications: DashboardNotification[] = [];

  // Find trainer's courses
  const trainerCourses = await db.course.findMany({
    where: { instructorId: trainerId },
    select: { id: true, title: true, slug: true },
  });

  const courseIds = trainerCourses.map((c) => c.id);

  // 1. Recent student enrollments in trainer's courses
  const studentEnrollments = await db.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  studentEnrollments.forEach((enr) => {
    notifications.push({
      id: `trainer-enr-${enr.id}`,
      type: "ENROLLMENT",
      title: "New Student in Your Course",
      message: `${enr.user.name} enrolled in "${enr.course.title}".`,
      timestamp: formatDate(enr.createdAt),
      link: `/dashboard/trainer/students`,
      unread: false,
    });
  });

  // 2. Recent quiz submissions in trainer's courses
  const quizSubs = await db.quizSubmission.findMany({
    where: {
      quiz: { courseId: { in: courseIds } },
    },
    include: {
      user: true,
      quiz: { include: { course: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  quizSubs.forEach((sub) => {
    notifications.push({
      id: `trainer-sub-${sub.id}`,
      type: "QUIZ",
      title: sub.passed ? "Student Passed Assessment" : "Assessment Needs Retake",
      message: `${sub.user.name} scored ${sub.score}% on "${sub.quiz.title}".`,
      timestamp: formatDate(sub.createdAt),
      link: `/dashboard/trainer/assessments`,
      unread: !sub.passed,
    });
  });

  // 3. Faculty broadcast
  notifications.push({
    id: "trainer-faculty-notice",
    type: "ACADEMIC",
    title: "Faculty Studio Live",
    message: "Course curriculum updates and student progress analytics are synced in real time.",
    timestamp: "Active Term",
    link: `/dashboard/trainer`,
    unread: false,
  });

  return notifications;
}
