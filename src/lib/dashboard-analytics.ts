import { db } from "@/lib/db";

export interface DayActivity {
  dayName: string;
  dateStr: string;
  count: number;
  isToday: boolean;
  heightPercent: number;
}

export interface StudentDashboardAnalytics {
  totalEnrolled: number;
  inProgressCount: number;
  completedCount: number;
  pendingQuizzesCount: number;
  pendingAssignmentsCount: number;
  averageQuizScore: number;
  certificatesCount: number;
  weeklyActivity: DayActivity[];
  totalActionsThisWeek: number;
}

export async function getStudentAnalytics(
  userId: string,
  dbClient: any = db
): Promise<StudentDashboardAnalytics> {
  // 1. Enrollments
  const enrollments = await dbClient.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          quizzes: true,
          sections: {
            include: { lessons: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalEnrolled = enrollments.length;
  const completedCount = enrollments.filter((e: any) => e.progress >= 100).length;
  const inProgressCount = totalEnrolled - completedCount;

  // 2. Quiz Submissions & Average Score
  const submissions = await dbClient.quizSubmission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const averageQuizScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((acc: number, sub: any) => acc + sub.score, 0) / submissions.length
        )
      : 0;

  // 3. Pending Quizzes
  const attemptedQuizIds = new Set(submissions.map((s: any) => s.quizId));
  const allEnrolledQuizzes = enrollments.flatMap((e: any) => e.course.quizzes);
  const pendingQuizzesCount = allEnrolledQuizzes.filter(
    (q: any) => !attemptedQuizIds.has(q.id)
  ).length;

  // 4. Pending Assignments
  const enrolledCourseIds = enrollments.map((e: any) => e.courseId);
  const totalCourseAssignments = await dbClient.assignment.findMany({
    where: { courseId: { in: enrolledCourseIds } },
    select: { id: true },
  });
  const mySubmissions = await dbClient.assignmentSubmission.findMany({
    where: { userId },
    select: { assignmentId: true },
  });
  const submittedAssignmentIds = new Set(mySubmissions.map((s: any) => s.assignmentId));
  const pendingAssignmentsCount = totalCourseAssignments.filter(
    (a: any) => !submittedAssignmentIds.has(a.id)
  ).length;

  // 5. Certificates
  const certificatesCount = await dbClient.certificate.count({
    where: { userId },
  });

  // 6. Weekly Learning Activity (7 days window)
  const now = new Date();
  const past7DaysStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  past7DaysStart.setHours(0, 0, 0, 0);

  // Lesson completions in last 7 days
  const recentLessons = await dbClient.lessonProgress.findMany({
    where: {
      userId,
      isCompleted: true,
      completedAt: { gte: past7DaysStart },
    },
    select: { completedAt: true },
  });

  // Quiz submissions in last 7 days
  const recentQuizzes = await dbClient.quizSubmission.findMany({
    where: {
      userId,
      createdAt: { gte: past7DaysStart },
    },
    select: { createdAt: true },
  });

  // Assignment submissions in last 7 days
  const recentAssignments = await dbClient.assignmentSubmission.findMany({
    where: {
      userId,
      submittedAt: { gte: past7DaysStart },
    },
    select: { submittedAt: true },
  });

  const dayBuckets: Record<string, number> = {};
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Initialize 7 days
  const daysList: { key: string; dayName: string; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split("T")[0];
    const isToday = i === 0;
    daysList.push({
      key: dateKey,
      dayName: dayNames[d.getDay()],
      isToday,
    });
    dayBuckets[dateKey] = 0;
  }

  // Count completions
  recentLessons.forEach((l: any) => {
    if (l.completedAt) {
      const key = l.completedAt.toISOString().split("T")[0];
      if (dayBuckets[key] !== undefined) {
        dayBuckets[key] += 1;
      }
    }
  });

  recentQuizzes.forEach((q: any) => {
    const key = q.createdAt.toISOString().split("T")[0];
    if (dayBuckets[key] !== undefined) {
      dayBuckets[key] += 1;
    }
  });

  recentAssignments.forEach((a: any) => {
    const key = a.submittedAt.toISOString().split("T")[0];
    if (dayBuckets[key] !== undefined) {
      dayBuckets[key] += 1;
    }
  });

  let totalActionsThisWeek = 0;
  let maxCount = 1;

  daysList.forEach((d) => {
    const count = dayBuckets[d.key] || 0;
    totalActionsThisWeek += count;
    if (count > maxCount) maxCount = count;
  });

  const weeklyActivity: DayActivity[] = daysList.map((d) => {
    const count = dayBuckets[d.key] || 0;
    // Normalize height between 15% minimum and 100%
    const heightPercent = count === 0 ? 12 : Math.round((count / maxCount) * 100);
    return {
      dayName: d.dayName,
      dateStr: d.key,
      count,
      isToday: d.isToday,
      heightPercent,
    };
  });

  return {
    totalEnrolled,
    inProgressCount,
    completedCount,
    pendingQuizzesCount,
    pendingAssignmentsCount,
    averageQuizScore,
    certificatesCount,
    weeklyActivity,
    totalActionsThisWeek,
  };
}

export interface TrainerDashboardAnalytics {
  assignedCoursesCount: number;
  enrolledLearnersCount: number;
  uniqueLearnersCount: number;
  pendingReviewsCount: number;
  completedGraduatesCount: number;
  totalLessonsCount: number;
  totalQuizzesCount: number;
  totalAssignmentsCount: number;
  averageRating: string;
  weeklyActivity: DayActivity[];
  totalActionsThisWeek: number;
}

export async function getTrainerAnalytics(
  trainerId: string,
  isAdmin: boolean = false,
  dbClient: any = db
): Promise<TrainerDashboardAnalytics> {
  // 1. Fetch courses taught by this trainer (or all if admin)
  const courses = await dbClient.course.findMany({
    where: isAdmin ? {} : { instructorId: trainerId },
    include: {
      enrollments: true,
      reviews: true,
      sections: {
        include: { lessons: true },
      },
      quizzes: true,
      assignments: true,
    },
  });

  const assignedCoursesCount = courses.length;
  const enrolledLearnersCount = courses.reduce(
    (acc: number, c: any) => acc + c.enrollments.length,
    0
  );
  const uniqueLearnerIds = new Set(
    courses.flatMap((c: any) => c.enrollments.map((e: any) => e.userId))
  );
  const uniqueLearnersCount = uniqueLearnerIds.size;

  const completedGraduatesCount = courses.reduce(
    (acc: number, c: any) =>
      acc + c.enrollments.filter((e: any) => e.progress >= 100).length,
    0
  );

  const totalLessonsCount = courses.reduce(
    (acc: number, c: any) =>
      acc +
      c.sections.reduce(
        (sAcc: number, s: any) => sAcc + s.lessons.length,
        0
      ),
    0
  );

  const totalQuizzesCount = courses.reduce(
    (acc: number, c: any) => acc + c.quizzes.length,
    0
  );

  const totalAssignmentsCount = courses.reduce(
    (acc: number, c: any) => acc + c.assignments.length,
    0
  );

  const allReviews = courses.flatMap((c: any) => c.reviews);
  const averageRating =
    allReviews.length > 0
      ? (
          allReviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
          allReviews.length
        ).toFixed(1)
      : "5.0";

  // 2. Pending assignment reviews awaiting grading
  const courseIds = courses.map((c: any) => c.id);
  const pendingReviewsCount =
    courseIds.length > 0
      ? await dbClient.assignmentSubmission.count({
          where: {
            assignment: { courseId: { in: courseIds } },
            status: "SUBMITTED",
          },
        })
      : 0;

  // 3. Weekly Course Activity (7 days window)
  const now = new Date();
  const past7DaysStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  past7DaysStart.setHours(0, 0, 0, 0);

  // Lesson completions across trainer's courses
  const recentLessons =
    courseIds.length > 0
      ? await dbClient.lessonProgress.findMany({
          where: {
            lesson: { section: { courseId: { in: courseIds } } },
            isCompleted: true,
            completedAt: { gte: past7DaysStart },
          },
          select: { completedAt: true },
        })
      : [];

  // Quiz submissions across trainer's courses
  const recentQuizzes =
    courseIds.length > 0
      ? await dbClient.quizSubmission.findMany({
          where: {
            quiz: { courseId: { in: courseIds } },
            createdAt: { gte: past7DaysStart },
          },
          select: { createdAt: true },
        })
      : [];

  // Assignment submissions across trainer's courses
  const recentAssignments =
    courseIds.length > 0
      ? await dbClient.assignmentSubmission.findMany({
          where: {
            assignment: { courseId: { in: courseIds } },
            submittedAt: { gte: past7DaysStart },
          },
          select: { submittedAt: true },
        })
      : [];

  // Enrollments across trainer's courses
  const recentEnrollments =
    courseIds.length > 0
      ? await dbClient.enrollment.findMany({
          where: {
            courseId: { in: courseIds },
            createdAt: { gte: past7DaysStart },
          },
          select: { createdAt: true },
        })
      : [];

  const dayBuckets: Record<string, number> = {};
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysList: { key: string; dayName: string; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split("T")[0];
    const isToday = i === 0;
    daysList.push({
      key: dateKey,
      dayName: dayNames[d.getDay()],
      isToday,
    });
    dayBuckets[dateKey] = 0;
  }

  recentLessons.forEach((l: any) => {
    if (l.completedAt) {
      const key = l.completedAt.toISOString().split("T")[0];
      if (dayBuckets[key] !== undefined) {
        dayBuckets[key] += 1;
      }
    }
  });

  recentQuizzes.forEach((q: any) => {
    const key = q.createdAt.toISOString().split("T")[0];
    if (dayBuckets[key] !== undefined) {
      dayBuckets[key] += 1;
    }
  });

  recentAssignments.forEach((a: any) => {
    const key = a.submittedAt.toISOString().split("T")[0];
    if (dayBuckets[key] !== undefined) {
      dayBuckets[key] += 1;
    }
  });

  recentEnrollments.forEach((e: any) => {
    const key = e.createdAt.toISOString().split("T")[0];
    if (dayBuckets[key] !== undefined) {
      dayBuckets[key] += 1;
    }
  });

  let totalActionsThisWeek = 0;
  let maxCount = 1;

  daysList.forEach((d) => {
    const count = dayBuckets[d.key] || 0;
    totalActionsThisWeek += count;
    if (count > maxCount) maxCount = count;
  });

  const weeklyActivity: DayActivity[] = daysList.map((d) => {
    const count = dayBuckets[d.key] || 0;
    const heightPercent = count === 0 ? 12 : Math.round((count / maxCount) * 100);
    return {
      dayName: d.dayName,
      dateStr: d.key,
      count,
      isToday: d.isToday,
      heightPercent,
    };
  });

  return {
    assignedCoursesCount,
    enrolledLearnersCount,
    uniqueLearnersCount,
    pendingReviewsCount,
    completedGraduatesCount,
    totalLessonsCount,
    totalQuizzesCount,
    totalAssignmentsCount,
    averageRating,
    weeklyActivity,
    totalActionsThisWeek,
  };
}

export interface AdminActivityItem {
  id: string;
  type: "ENROLLMENT" | "CERTIFICATE" | "QUIZ" | "ASSIGNMENT" | "AUDIT" | "USER";
  title: string;
  description: string;
  timestamp: string;
  rawDate: Date;
  badge: {
    label: string;
    color: string;
  };
}

export interface AdminDashboardAnalytics {
  studentCount: number;
  trainerCount: number;
  adminCount: number;
  totalUsers: number;
  courseCount: number;
  publishedCourseCount: number;
  draftCourseCount: number;
  enrollmentCount: number;
  completedEnrollmentCount: number;
  inProgressEnrollments: number;
  completionRate: number;
  certCount: number;
  totalRevenue: number;
  weeklyActivity: DayActivity[];
  totalActionsThisWeek: number;
  recentActivity: AdminActivityItem[];
}

export async function getAdminAnalytics(
  dbClient: any = db
): Promise<AdminDashboardAnalytics> {
  const [
    studentCount,
    trainerCount,
    adminCount,
    courses,
    enrollments,
    certCount,
    recentEnrollments,
    recentCerts,
    recentQuizSubs,
    recentAssignSubs,
    recentAuditLogs,
    recentUsers,
  ] = await Promise.all([
    dbClient.user.count({ where: { role: "STUDENT" } }),
    dbClient.user.count({ where: { role: "TRAINER" } }),
    dbClient.user.count({ where: { role: "ADMIN" } }),
    dbClient.course.findMany({
      select: { id: true, price: true, published: true },
    }),
    dbClient.enrollment.findMany({
      select: { id: true, progress: true, courseId: true },
    }),
    dbClient.certificate.count(),
    dbClient.enrollment.findMany({
      include: { user: true, course: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    dbClient.certificate.findMany({
      include: { user: true, course: true },
      orderBy: { issuedAt: "desc" },
      take: 3,
    }),
    dbClient.quizSubmission.findMany({
      include: { user: true, quiz: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    dbClient.assignmentSubmission.findMany({
      include: { user: true, assignment: true },
      orderBy: { submittedAt: "desc" },
      take: 3,
    }),
    dbClient.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    dbClient.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const totalUsers = studentCount + trainerCount + adminCount;
  const courseCount = courses.length;
  const publishedCourseCount = courses.filter((c: any) => c.published).length;
  const draftCourseCount = courseCount - publishedCourseCount;

  const enrollmentCount = enrollments.length;
  const completedEnrollmentCount = enrollments.filter((e: any) => e.progress >= 100).length;
  const inProgressEnrollments = enrollmentCount - completedEnrollmentCount;
  const completionRate =
    enrollmentCount > 0 ? Math.round((completedEnrollmentCount / enrollmentCount) * 100) : 0;

  // Calculate actual revenue from course price * enrollments
  const coursePriceMap = new Map<string, number>(
    courses.map((c: any) => [c.id, Number(c.price) || 0])
  );
  const totalRevenue = enrollments.reduce((acc: number, e: any) => {
    const price = coursePriceMap.get(e.courseId) ?? 0;
    return acc + price;
  }, 0);

  // Weekly platform activity (past 7 days window)
  const now = new Date();
  const past7DaysStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  past7DaysStart.setHours(0, 0, 0, 0);

  const [weekEnrollments, weekLessons, weekQuizzes, weekAssignments, weekUsers] =
    await Promise.all([
      dbClient.enrollment.findMany({
        where: { createdAt: { gte: past7DaysStart } },
        select: { createdAt: true },
      }),
      dbClient.lessonProgress.findMany({
        where: { completedAt: { gte: past7DaysStart }, isCompleted: true },
        select: { completedAt: true },
      }),
      dbClient.quizSubmission.findMany({
        where: { createdAt: { gte: past7DaysStart } },
        select: { createdAt: true },
      }),
      dbClient.assignmentSubmission.findMany({
        where: { submittedAt: { gte: past7DaysStart } },
        select: { submittedAt: true },
      }),
      dbClient.user.findMany({
        where: { createdAt: { gte: past7DaysStart } },
        select: { createdAt: true },
      }),
    ]);

  const dayBuckets: Record<string, number> = {};
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysList: { key: string; dayName: string; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split("T")[0];
    const isToday = i === 0;
    daysList.push({
      key: dateKey,
      dayName: dayNames[d.getDay()],
      isToday,
    });
    dayBuckets[dateKey] = 0;
  }

  const addToBucket = (date: Date | null) => {
    if (!date) return;
    const key = date.toISOString().split("T")[0];
    if (dayBuckets[key] !== undefined) {
      dayBuckets[key] += 1;
    }
  };

  weekEnrollments.forEach((e: any) => addToBucket(e.createdAt));
  weekLessons.forEach((l: any) => addToBucket(l.completedAt));
  weekQuizzes.forEach((q: any) => addToBucket(q.createdAt));
  weekAssignments.forEach((a: any) => addToBucket(a.submittedAt));
  weekUsers.forEach((u: any) => addToBucket(u.createdAt));

  let totalActionsThisWeek = 0;
  let maxCount = 1;

  daysList.forEach((d) => {
    const count = dayBuckets[d.key] || 0;
    totalActionsThisWeek += count;
    if (count > maxCount) maxCount = count;
  });

  const weeklyActivity: DayActivity[] = daysList.map((d) => {
    const count = dayBuckets[d.key] || 0;
    const heightPercent = count === 0 ? 12 : Math.round((count / maxCount) * 100);
    return {
      dayName: d.dayName,
      dateStr: d.key,
      count,
      isToday: d.isToday,
      heightPercent,
    };
  });

  // Construct consolidated authentic activity feed
  const rawEvents: AdminActivityItem[] = [];

  recentEnrollments.forEach((e: any) => {
    rawEvents.push({
      id: `enr-${e.id}`,
      type: "ENROLLMENT",
      title: "Course Enrollment",
      description: `${e.user?.name || "Student"} enrolled in "${e.course?.title}"`,
      timestamp: e.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawDate: e.createdAt,
      badge: {
        label: "Enrollment",
        color: "bg-blue-50 text-blue-700 border-blue-200",
      },
    });
  });

  recentCerts.forEach((c: any) => {
    rawEvents.push({
      id: `cert-${c.id}`,
      type: "CERTIFICATE",
      title: "Certificate Issued",
      description: `${c.user?.name || "Student"} certified in "${c.course?.title}" (${c.certificateCode})`,
      timestamp: c.issuedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawDate: c.issuedAt,
      badge: {
        label: "Certificate",
        color: "bg-amber-50 text-amber-700 border-amber-200",
      },
    });
  });

  recentQuizSubs.forEach((q: any) => {
    rawEvents.push({
      id: `quiz-${q.id}`,
      type: "QUIZ",
      title: q.passed ? "Quiz Assessment Passed" : "Quiz Assessment Attempted",
      description: `${q.user?.name || "Student"} scored ${q.score}% on "${q.quiz?.title}"`,
      timestamp: q.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawDate: q.createdAt,
      badge: {
        label: q.passed ? "Quiz Passed" : "Quiz Attempt",
        color: q.passed
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-700 border-slate-200",
      },
    });
  });

  recentAssignSubs.forEach((a: any) => {
    rawEvents.push({
      id: `assign-${a.id}`,
      type: "ASSIGNMENT",
      title: "Deliverable Submitted",
      description: `${a.user?.name || "Student"} submitted "${a.assignment?.title}"`,
      timestamp: a.submittedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawDate: a.submittedAt,
      badge: {
        label: "Assignment",
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
    });
  });

  recentAuditLogs.forEach((l: any) => {
    rawEvents.push({
      id: `audit-${l.id}`,
      type: "AUDIT",
      title: l.action.replace(/_/g, " "),
      description: `${l.entity} (${l.entityId}) modified by user`,
      timestamp: l.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawDate: l.createdAt,
      badge: {
        label: "Audit Log",
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      },
    });
  });

  recentUsers.forEach((u: any) => {
    rawEvents.push({
      id: `user-${u.id}`,
      type: "USER",
      title: "New Registration",
      description: `${u.name} registered as ${u.role}`,
      timestamp: u.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawDate: u.createdAt,
      badge: {
        label: u.role,
        color: "bg-teal-50 text-teal-700 border-teal-200",
      },
    });
  });

  // Sort chronological descending, take top 10
  rawEvents.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  const recentActivity = rawEvents.slice(0, 10);

  return {
    studentCount,
    trainerCount,
    adminCount,
    totalUsers,
    courseCount,
    publishedCourseCount,
    draftCourseCount,
    enrollmentCount,
    completedEnrollmentCount,
    inProgressEnrollments,
    completionRate,
    certCount,
    totalRevenue,
    weeklyActivity,
    totalActionsThisWeek,
    recentActivity,
  };
}

