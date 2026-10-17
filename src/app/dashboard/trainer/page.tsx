import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTrainerNotifications } from "@/lib/notifications";
import { 
  BookOpen, 
  Users, 
  Star, 
  PlusCircle, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Video,
  HelpCircle,
  Clock,
  Award,
  Layers
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect(user ? "/dashboard/student" : "/login");
  }

  // Fetch only courses authored by this trainer (or all if admin)
  const [notifications, courses] = await Promise.all([
    getTrainerNotifications(user.id),
    db.course.findMany({
      where: user.role === "ADMIN" ? {} : { instructorId: user.id },
      include: {
        category: true,
        enrollments: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
        sections: {
          include: { lessons: true },
        },
        reviews: true,
        quizzes: {
          include: {
            submissions: {
              include: { user: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalCourses = courses.length;
  const totalStudents = courses.reduce(
    (acc, c) => acc + c.enrollments.length,
    0
  );
  const completedStudents = courses.reduce(
    (acc, c) => acc + c.enrollments.filter((e) => e.progress >= 100).length,
    0
  );
  const totalLessons = courses.reduce(
    (acc, c) =>
      acc +
      c.sections.reduce((sAcc, s) => sAcc + s.lessons.length, 0),
    0
  );

  const allReviews = courses.flatMap((c) => c.reviews);
  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)
    : "5.0";

  // Recent student enrollments across trainer's courses
  const recentEnrollments = courses
    .flatMap((c) =>
      c.enrollments.map((e) => ({
        ...e,
        courseTitle: c.title,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Recent assessment attempts across trainer's courses
  const recentSubmissions = courses
    .flatMap((c) =>
      c.quizzes.flatMap((q) =>
        q.submissions.map((s) => ({
          ...s,
          quizTitle: q.title,
          courseTitle: c.title,
        }))
      )
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

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
                Manage your authored course curricula, monitor student lesson progression,
                review assessment results, and maintain academic excellence.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-slate-200">
                  <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                  <span>{totalCourses} Authored Tracks</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-slate-200">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{totalStudents} Enrolled Learners</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Faculty Lead</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                href="/dashboard/trainer/new-course"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-102"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Course</span>
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

        {/* 5 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">My Courses</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#0B1B3D]">{totalCourses}</div>
            <div className="text-[11px] text-slate-400 mt-1">Teaching portfolio</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Enrolled Students</span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#FF6B00]">{totalStudents}</div>
            <div className="text-[11px] text-slate-400 mt-1">Active learners</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Graduated (100%)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600">{completedStudents}</div>
            <div className="text-[11px] text-slate-400 mt-1">Certified graduates</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Curriculum Lessons</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-600">{totalLessons}</div>
            <div className="text-[11px] text-slate-400 mt-1">Authored video modules</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Average Rating</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-500">{avgRating} / 5.0</div>
            <div className="text-[11px] text-slate-400 mt-1">Based on student reviews</div>
          </div>
        </div>

        {/* Authored Courses + Recent Enrollments & Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Authored Courses Table (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#FF6B00]" />
                    <span>My Authored Teaching Tracks</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Curricula actively managed by your faculty account
                  </p>
                </div>
                <Link
                  href="/dashboard/trainer/courses"
                  className="text-xs font-bold text-[#FF6B00] hover:underline"
                >
                  Manage All ({courses.length})
                </Link>
              </div>

              <div className="space-y-3">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {c.category.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {c.level}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0B1B3D]">{c.title}</h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.sections.length} Sections • {formatPrice(c.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-[#FF6B00]">
                          {c.enrollments.length} Student{c.enrollments.length === 1 ? "" : "s"}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          Published
                        </div>
                      </div>

                      <Link
                        href={`/courses/${c.slug}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B1B3D] hover:bg-[#132752] text-white transition-colors"
                      >
                        Preview
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between text-xs text-slate-500">
              <span>Curriculum tracks live on public registry</span>
              <Link
                href="/dashboard/trainer/new-course"
                className="font-bold text-[#FF6B00] hover:underline inline-flex items-center gap-1"
              >
                <span>Add Another Course</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Recent Submissions & Activity (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Recent Assessment Attempts */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span>Recent Assessment Submissions</span>
                </h3>
                <Link
                  href="/dashboard/trainer/assessments"
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  View All
                </Link>
              </div>

              {recentSubmissions.length > 0 ? (
                <div className="space-y-2.5">
                  {recentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#0B1B3D]">{sub.user.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {sub.quizTitle}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.passed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {sub.passed ? "Passed" : "Retake"}: {sub.score}%
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatDate(sub.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No assessment submissions recorded yet.
                </p>
              )}
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Recent Student Enrollments</span>
                </h3>
                <Link
                  href="/dashboard/trainer/students"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Roster ({totalStudents})
                </Link>
              </div>

              {recentEnrollments.length > 0 ? (
                <div className="space-y-2.5">
                  {recentEnrollments.map((enr) => (
                    <div
                      key={enr.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-7 h-7 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {enr.user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-[#0B1B3D] truncate">
                            {enr.user.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {enr.courseTitle}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-[#FF6B00]">
                          {enr.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No student enrollments yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
