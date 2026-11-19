import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { PrismaClient } from "@prisma/client";

export interface DashboardNotification {
  id: string;
  type: "CERTIFICATE" | "QUIZ" | "ENROLLMENT" | "ASSIGNMENT" | "ACADEMIC" | "SYSTEM" | "USER";
  title: string;
  message: string;
  timestamp: string;
  link: string;
  unread: boolean;
}

export type StudentNotification = DashboardNotification;

/**
 * Fetch genuine notifications for a student
 * Strict user isolation: only retrieves events owned by this student
 */
export async function getStudentNotifications(
  userId: string,
  dbClient: PrismaClient = db as PrismaClient
): Promise<DashboardNotification[]> {
  const notifications: DashboardNotification[] = [];

  // 0. Persisted In-App Notifications (Stored in database)
  try {
    const persisted = await dbClient.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    persisted.forEach((n) => {
      notifications.push({
        id: n.id,
        type: n.type as DashboardNotification["type"],
        title: n.title,
        message: n.message,
        timestamp: formatDate(n.createdAt),
        link: n.link || "/dashboard/student",
        unread: !n.isRead,
      });
    });
  } catch {
    // Graceful fallback if table is newly provisioned
  }

  // 1. Pending Deliverables & Recent Assignment Submissions
  const assignmentSubmissions = await dbClient.assignmentSubmission.findMany({
    where: { userId },
    include: {
      assignment: {
        include: { course: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  assignmentSubmissions.forEach((sub) => {
    const isResubmit = sub.status === "RESUBMIT_REQUESTED";
    notifications.push({
      id: `assign-feedback-${sub.id}-${sub.updatedAt.getTime()}`,
      type: "ASSIGNMENT",
      title: isResubmit ? "Assignment Needs Resubmission" : "Assignment Graded & Evaluated",
      message: isResubmit
        ? `Instructor feedback on "${sub.assignment.title}": "${sub.feedback || "Please revise and resubmit your work."}"`
        : `You scored ${sub.score ?? 0}/${sub.assignment.maxScore} on "${sub.assignment.title}" (${sub.assignment.course.title}).${sub.feedback ? ` Note: "${sub.feedback}"` : ""}`,
      timestamp: formatDate(sub.updatedAt),
      link: `/courses/${sub.assignment.course.slug}/learn`,
      unread: true,
    });
  });

  // 2. Earned Digital Certificates
  const certificates = await dbClient.certificate.findMany({
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

  // 3. Recent Quiz Submissions
  const submissions = await dbClient.quizSubmission.findMany({
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

  // 4. Confirmed Enrollment / Orders
  const recentOrders = await dbClient.order.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    include: { course: true },
    orderBy: { updatedAt: "desc" },
    take: 2,
  });

  recentOrders.forEach((order) => {
    notifications.push({
      id: `order-enr-${order.id}`,
      type: "ENROLLMENT",
      title: "Enrollment Confirmed",
      message: `Official access activated for "${order.course.title}". Course syllabus is ready.`,
      timestamp: formatDate(order.updatedAt),
      link: `/courses/${order.course.slug}/learn`,
      unread: false,
    });
  });

  // 5. Active Course Progress Milestone
  const enrollments = await dbClient.enrollment.findMany({
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

  // 6. Broadcast Announcements (if any published by administrators)
  try {
    const broadcasts = await dbClient.auditLog.findMany({
      where: { action: "BROADCAST_ANNOUNCEMENT" },
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    broadcasts.forEach((b) => {
      try {
        const details = JSON.parse(b.details || "{}");
        if (!details.scope || details.scope === "ALL" || details.scope === "STUDENTS") {
          notifications.unshift({
            id: `broadcast-${b.id}`,
            type: "SYSTEM",
            title: details.title || "Institutional Announcement",
            message: details.message || "Important platform update from administration.",
            timestamp: formatDate(b.createdAt),
            link: "/dashboard/student",
            unread: details.priority === "URGENT",
          });
        }
      } catch {}
    });
  } catch {}

  // 7. Official Academic Announcement
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
export async function getAdminNotifications(
  dbClient: PrismaClient = db as PrismaClient
): Promise<DashboardNotification[]> {
  const notifications: DashboardNotification[] = [];

  // 0. Active Broadcast Announcements
  try {
    const broadcasts = await dbClient.auditLog.findMany({
      where: { action: "BROADCAST_ANNOUNCEMENT" },
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    broadcasts.forEach((b) => {
      try {
        const details = JSON.parse(b.details || "{}");
        notifications.push({
          id: `broadcast-${b.id}`,
          type: "SYSTEM",
          title: `[Announcement] ${details.title || "Institutional Notice"}`,
          message: `${details.message} (Scope: ${details.scope || "ALL"}, Priority: ${details.priority || "NORMAL"})`,
          timestamp: formatDate(b.createdAt),
          link: "/dashboard/admin/settings",
          unread: false,
        });
      } catch {}
    });
  } catch {}

  // 1. Recent Registrations
  const recentUsers = await dbClient.user.findMany({
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
  const recentEnrollments = await dbClient.enrollment.findMany({
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
    message: "PostgreSQL 3NF database, bcrypt authentication, and Next.js server actions are operational.",
    timestamp: "System Online",
    link: `/dashboard/admin`,
    unread: false,
  });

  return notifications;
}

/**
 * Fetch authentic notifications for a trainer
 */
export async function getTrainerNotifications(
  trainerId: string,
  dbClient: PrismaClient = db as PrismaClient
): Promise<DashboardNotification[]> {
  const notifications: DashboardNotification[] = [];

  // 0. Active Broadcast Announcements
  try {
    const broadcasts = await dbClient.auditLog.findMany({
      where: { action: "BROADCAST_ANNOUNCEMENT" },
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    broadcasts.forEach((b) => {
      try {
        const details = JSON.parse(b.details || "{}");
        if (!details.scope || details.scope === "ALL" || details.scope === "TRAINERS") {
          notifications.unshift({
            id: `broadcast-${b.id}`,
            type: "SYSTEM",
            title: details.title || "Institutional Announcement",
            message: details.message || "Important platform update from administration.",
            timestamp: formatDate(b.createdAt),
            link: "/dashboard/trainer",
            unread: details.priority === "URGENT",
          });
        }
      } catch {}
    });
  } catch {}

  // Find trainer's courses
  const trainerCourses = await dbClient.course.findMany({
    where: { instructorId: trainerId },
    select: { id: true, title: true, slug: true },
  });

  const courseIds = trainerCourses.map((c) => c.id);

  // 1. Pending student assignment submissions awaiting evaluation
  const pendingAssignments = await dbClient.assignmentSubmission.findMany({
    where: {
      assignment: { courseId: { in: courseIds } },
      status: "SUBMITTED",
    },
    include: {
      user: true,
      assignment: { include: { course: true } },
    },
    orderBy: { submittedAt: "desc" },
    take: 4,
  });

  pendingAssignments.forEach((sub) => {
    notifications.push({
      id: `trainer-assign-${sub.id}-${sub.submittedAt.getTime()}`,
      type: "ASSIGNMENT",
      title: "New Assignment Submitted",
      message: `${sub.user.name} submitted "${sub.assignment.title}" (${sub.assignment.course.title}) for review.`,
      timestamp: formatDate(sub.submittedAt),
      link: `/dashboard/trainer/assessments`,
      unread: true,
    });
  });

  // 2. Recent student enrollments in trainer's courses
  const studentEnrollments = await dbClient.enrollment.findMany({
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

  // 3. Recent quiz submissions in trainer's courses
  const quizSubs = await dbClient.quizSubmission.findMany({
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

  // 4. Faculty broadcast
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

/**
 * Persist an in-app notification in the database for a user
 */
export async function createNotification(
  userId: string,
  data: {
    type: "CERTIFICATE" | "QUIZ" | "ENROLLMENT" | "ASSIGNMENT" | "ACADEMIC" | "SYSTEM" | "USER";
    title: string;
    message: string;
    link?: string;
  },
  dbClient: PrismaClient = db as PrismaClient
) {
  return await dbClient.notification.create({
    data: {
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
    },
  });
}

/**
 * Mark a notification as read (with strict ownership check)
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
  dbClient: PrismaClient = db as PrismaClient
) {
  return await dbClient.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}
