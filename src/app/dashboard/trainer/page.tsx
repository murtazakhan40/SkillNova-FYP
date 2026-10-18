import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTrainerNotifications } from "@/lib/notifications";
import { getTrainerAnalytics } from "@/lib/dashboard-analytics";
import { WeeklyActivityCard } from "@/components/dashboard/WeeklyActivityCard";
import {
  TrainerDashboardActionCenter,
  TrainerCourseData,
  PendingAssignmentItem,
  RecentSubmissionFeedItem,
} from "@/components/dashboard/TrainerDashboardActionCenter";
import {
  BookOpen,
  Users,
  Star,
  CheckCircle,
  Sparkles,
  Clock,
  FileCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const isAdmin = user.role === "ADMIN";

  // Fetch real data in parallel with strict ownership checks
  const [notifications, analytics, categories, courses] = await Promise.all([
    getTrainerNotifications(user.id),
    getTrainerAnalytics(user.id, isAdmin),
    db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.course.findMany({
      where: isAdmin ? {} : { instructorId: user.id },
      include: {
        category: true,
        enrollments: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
        quizzes: true,
        assignments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const courseIds = courses.map((c) => c.id);

  // Fetch pending assignment deliverables awaiting trainer evaluation
  const pendingAssignmentRecords =
    courseIds.length > 0
      ? await db.assignmentSubmission.findMany({
          where: {
            assignment: { courseId: { in: courseIds } },
            status: "SUBMITTED",
          },
          include: {
            user: true,
            assignment: {
              include: { course: true },
            },
          },
          orderBy: { submittedAt: "desc" },
        })
      : [];

  // Fetch recent quiz submissions across trainer's courses
  const recentQuizRecords =
    courseIds.length > 0
      ? await db.quizSubmission.findMany({
          where: {
            quiz: { courseId: { in: courseIds } },
          },
          include: {
            user: true,
            quiz: {
              include: { course: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 15,
        })
      : [];

  // Fetch recent assignment submissions (both graded and submitted)
  const recentAssignmentRecords =
    courseIds.length > 0
      ? await db.assignmentSubmission.findMany({
          where: {
            assignment: { courseId: { in: courseIds } },
          },
          include: {
            user: true,
            assignment: {
              include: { course: true },
            },
          },
          orderBy: { submittedAt: "desc" },
          take: 15,
        })
      : [];

  // Transform Courses for Action Center
  const courseItems: TrainerCourseData[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    subtitle: c.subtitle,
    description: c.description,
    thumbnail: c.thumbnail,
    price: c.price,
    level: c.level,
    published: c.published,
    categoryId: c.categoryId,
    categoryName: c.category.name,
    enrollmentsCount: c.enrollments.length,
    completedLearnersCount: c.enrollments.filter((e) => e.progress >= 100).length,
    lessonsCount: c.sections.reduce((acc, s) => acc + s.lessons.length, 0),
    quizzesCount: c.quizzes.length,
    assignmentsCount: c.assignments.length,
    sections: c.sections.map((s) => ({
      id: s.id,
      title: s.title,
      lessons: s.lessons.map((l) => ({ id: l.id, title: l.title })),
    })),
  }));

  // Transform Pending Reviews
  const pendingItems: PendingAssignmentItem[] = pendingAssignmentRecords.map((p) => ({
    id: p.id,
    studentId: p.user.id,
    studentName: p.user.name,
    studentEmail: p.user.email,
    studentAvatar: p.user.avatar,
    assignmentId: p.assignment.id,
    assignmentTitle: p.assignment.title,
    courseTitle: p.assignment.course.title,
    courseSlug: p.assignment.course.slug,
    maxScore: p.assignment.maxScore,
    textContent: p.textContent,
    fileUrl: p.fileUrl,
    fileName: p.fileName,
    status: p.status,
    submittedAt: formatDate(p.submittedAt),
  }));

  // Unified Recent Submissions Feed
  const submissionsFeed: RecentSubmissionFeedItem[] = [
    ...recentAssignmentRecords.map((a) => {
      const raw: PendingAssignmentItem = {
        id: a.id,
        studentId: a.user.id,
        studentName: a.user.name,
        studentEmail: a.user.email,
        studentAvatar: a.user.avatar,
        assignmentId: a.assignment.id,
        assignmentTitle: a.assignment.title,
        courseTitle: a.assignment.course.title,
        courseSlug: a.assignment.course.slug,
        maxScore: a.assignment.maxScore,
        textContent: a.textContent,
        fileUrl: a.fileUrl,
        fileName: a.fileName,
        status: a.status,
        submittedAt: formatDate(a.submittedAt),
      };

      return {
        id: a.id,
        type: "ASSIGNMENT" as const,
        studentName: a.user.name,
        studentEmail: a.user.email,
        studentAvatar: a.user.avatar,
        title: a.assignment.title,
        courseTitle: a.assignment.course.title,
        courseSlug: a.assignment.course.slug,
        score: a.score,
        maxScore: a.assignment.maxScore,
        status: a.status,
        createdAt: formatDate(a.submittedAt),
        rawItem: raw,
      };
    }),
    ...recentQuizRecords.map((q) => ({
      id: q.id,
      type: "QUIZ" as const,
      studentName: q.user.name,
      studentEmail: q.user.email,
      studentAvatar: q.user.avatar,
      title: q.quiz.title,
      courseTitle: q.quiz.course.title,
      courseSlug: q.quiz.course.slug,
      score: q.score,
      passed: q.passed,
      createdAt: formatDate(q.createdAt),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#132752] to-[#0B1B3D] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-[11px] font-bold text-orange-300">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>SkillNova Academy • Faculty Instructor Studio</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Welcome, <span className="text-[#FF6B00]">{user.name}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Manage your assigned course curricula, review incoming assignment deliverables, evaluate student test attempts, and maintain academic excellence.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-slate-200">
                  <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                  <span>{analytics.assignedCoursesCount} Authored Tracks</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-slate-200">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{analytics.enrolledLearnersCount} Enrolled ({analytics.uniqueLearnersCount} Unique)</span>
                </span>
                {analytics.pendingReviewsCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/30 border border-orange-500/60 text-orange-300 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{analytics.pendingReviewsCount} Reviews Pending</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>All Deliverables Reviewed</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                href="/dashboard/trainer/assessments"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-102"
              >
                <FileCheck className="w-4 h-4" />
                <span>Review Submissions ({analytics.pendingReviewsCount})</span>
              </Link>
              <Link
                href="/dashboard/trainer/students"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
              >
                <Users className="w-4 h-4 text-orange-400" />
                <span>Student Roster</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 5 Real-Time Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Assigned Courses</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#0B1B3D]">
              {analytics.assignedCoursesCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Teaching portfolio</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Enrolled Learners</span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#FF6B00]">
              {analytics.enrolledLearnersCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Across {analytics.uniqueLearnersCount} students
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Pending Reviews</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600">
              {analytics.pendingReviewsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Awaiting your evaluation</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Graduates (100%)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {analytics.completedGraduatesCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Certified students</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Average Rating</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-500">
              {analytics.averageRating} / 5.0
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Based on student reviews</div>
          </div>
        </div>

        {/* 7-Day Course Activity Bar Chart */}
        <div className="grid grid-cols-1 gap-6">
          <WeeklyActivityCard
            activity={analytics.weeklyActivity}
            totalActionsThisWeek={analytics.totalActionsThisWeek}
          />
        </div>

        {/* Interactive Action Center: Course Management, Modals, and Submission Ledger */}
        <TrainerDashboardActionCenter
          courses={courseItems}
          pendingReviews={pendingItems}
          submissionsFeed={submissionsFeed}
          categories={categories}
        />
      </div>
    </DashboardShell>
  );
}
