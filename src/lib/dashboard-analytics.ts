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
  averageQuizScore: number;
  certificatesCount: number;
  weeklyActivity: DayActivity[];
  totalActionsThisWeek: number;
}

export async function getStudentAnalytics(userId: string): Promise<StudentDashboardAnalytics> {
  // 1. Enrollments
  const enrollments = await db.enrollment.findMany({
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
  const completedCount = enrollments.filter((e) => e.progress >= 100).length;
  const inProgressCount = totalEnrolled - completedCount;

  // 2. Quiz Submissions & Average Score
  const submissions = await db.quizSubmission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const averageQuizScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((acc, sub) => acc + sub.score, 0) / submissions.length
        )
      : 0;

  // 3. Pending Quizzes
  const attemptedQuizIds = new Set(submissions.map((s) => s.quizId));
  const allEnrolledQuizzes = enrollments.flatMap((e) => e.course.quizzes);
  const pendingQuizzesCount = allEnrolledQuizzes.filter(
    (q) => !attemptedQuizIds.has(q.id)
  ).length;

  // 4. Certificates
  const certificatesCount = await db.certificate.count({
    where: { userId },
  });

  // 5. Weekly Learning Activity (7 days window)
  const now = new Date();
  const past7DaysStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  past7DaysStart.setHours(0, 0, 0, 0);

  // Lesson completions in last 7 days
  const recentLessons = await db.lessonProgress.findMany({
    where: {
      userId,
      isCompleted: true,
      completedAt: { gte: past7DaysStart },
    },
    select: { completedAt: true },
  });

  // Quiz submissions in last 7 days
  const recentQuizzes = await db.quizSubmission.findMany({
    where: {
      userId,
      createdAt: { gte: past7DaysStart },
    },
    select: { createdAt: true },
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
  recentLessons.forEach((l) => {
    if (l.completedAt) {
      const key = l.completedAt.toISOString().split("T")[0];
      if (dayBuckets[key] !== undefined) {
        dayBuckets[key] += 1;
      }
    }
  });

  recentQuizzes.forEach((q) => {
    const key = q.createdAt.toISOString().split("T")[0];
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
    averageQuizScore,
    certificatesCount,
    weeklyActivity,
    totalActionsThisWeek,
  };
}
