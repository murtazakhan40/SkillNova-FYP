import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WeeklyActivityCard } from "@/components/dashboard/WeeklyActivityCard";
import { CopyCodeButton } from "@/components/dashboard/CopyCodeButton";
import { getStudentNotifications } from "@/lib/notifications";
import { getStudentAnalytics } from "@/lib/dashboard-analytics";
import { 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  ArrowRight, 
  Sparkles,
  Mail,
  Phone,
  HelpCircle,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch real analytics and genuine notifications
  const [analytics, notifications] = await Promise.all([
    getStudentAnalytics(user.id),
    getStudentNotifications(user.id),
  ]);

  // 2. Fetch full student enrollments with relations
  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: true,
          category: true,
          sections: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                include: {
                  progress: {
                    where: { userId: user.id },
                  },
                },
              },
            },
          },
          quizzes: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // 3. Fetch verified certificates
  const certificates = await db.certificate.findMany({
    where: { userId: user.id },
    include: {
      course: true,
    },
    orderBy: { issuedAt: "desc" },
  });

  // 4. Find the most relevant in-progress course for "Continue Learning" Hero Card
  const inProgressEnrollment =
    enrollments.find((e) => e.progress > 0 && e.progress < 100) ||
    enrollments.find((e) => e.progress < 100) ||
    enrollments[0] ||
    null;

  let nextLesson = null;
  if (inProgressEnrollment) {
    const allLessons = inProgressEnrollment.course.sections.flatMap((s) => s.lessons);
    nextLesson =
      allLessons.find((l) => !l.progress.some((p) => p.isCompleted)) ||
      allLessons[0] ||
      null;
  }

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#132752] to-[#0B1B3D] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[radial-gradient(ellipse_at_center,rgba(255,107,0,0.18),transparent_70%)] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.18),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-[11px] font-bold text-orange-300">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>SkillNova Academy • Official Student Dashboard</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back,{" "}
                <span className="text-[#FF6B00]">{user.name}</span>!
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Continue advancing your technical competencies. Track your curricula progress,
                complete structured module assessments, and inspect your cryptographic certificates.
              </p>

              {/* Contact & Degree Info Pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-200">
                  <Mail className="w-3.5 h-3.5 text-orange-400" />
                  <span>{user.email}</span>
                </span>
                {user.phone && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{user.phone}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>BS Computer Science FYP</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                href="/dashboard/student/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 transition-colors duration-150"
              >
                <BookOpen className="w-4 h-4" />
                <span>My Courses</span>
              </Link>
              <Link
                href="/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors duration-150"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* 5 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Total Enrolled */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">Enrolled Courses</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B1B3D]">{analytics.totalEnrolled}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">Across 4 tracks</div>
            </div>
          </div>

          {/* 2. In Progress */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">In Progress</span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#FF6B00]">{analytics.inProgressCount}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">Active coursework</div>
            </div>
          </div>

          {/* 3. Completed */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">Completed</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{analytics.completedCount}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">100% syllabus verified</div>
            </div>
          </div>

          {/* 4. Pending Assessments */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">Pending Quizzes</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{analytics.pendingQuizzesCount}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">Awaiting review</div>
            </div>
          </div>

          {/* 5. Average Quiz Score */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">Avg Quiz Score</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-600">
                {analytics.averageQuizScore > 0 ? `${analytics.averageQuizScore}%` : "N/A"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">Genuine submissions</div>
            </div>
          </div>
        </div>

        {/* Continue Learning Hero Card + Weekly Activity Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Continue Learning Hero (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] shadow-2xs shrink-0" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Continue Learning
                  </h2>
                </div>
                {inProgressEnrollment && (
                  <span className="text-xs font-bold text-[#FF6B00] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                    {inProgressEnrollment.progress}% Completed
                  </span>
                )}
              </div>

              {inProgressEnrollment ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {inProgressEnrollment.course.category.name}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0B1B3D] mt-2">
                      {inProgressEnrollment.course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {inProgressEnrollment.course.subtitle}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Curriculum Progress</span>
                      <span className="font-extrabold text-[#0B1B3D]">
                        {inProgressEnrollment.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-3 rounded-full transition-[width] duration-500"
                        style={{ width: `${inProgressEnrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Next Lesson Preview */}
                  {nextLesson && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
                          <PlayCircle className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Up Next
                          </span>
                          <span className="text-xs font-bold text-[#0B1B3D] truncate block">
                            {nextLesson.title}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                        {nextLesson.duration}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">You are not currently enrolled in any course.</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Instructor:{" "}
                <span className="font-bold text-slate-700">
                  {inProgressEnrollment?.course.instructor.name || "SkillNova Faculty"}
                </span>
              </span>

              {inProgressEnrollment && (
                <Link
                  href={
                    nextLesson
                      ? `/courses/${inProgressEnrollment.course.slug}/learn/${nextLesson.id}`
                      : `/courses/${inProgressEnrollment.course.slug}`
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0B1B3D] hover:bg-[#132752] text-white shadow-sm transition-all"
                >
                  <span>Resume Next Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
                </Link>
              )}
            </div>
          </div>

          {/* Weekly Activity Card (5 Cols) */}
          <div className="lg:col-span-5">
            <WeeklyActivityCard
              activity={analytics.weeklyActivity}
              totalActionsThisWeek={analytics.totalActionsThisWeek}
            />
          </div>
        </div>

        {/* Active Coursework Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0B1B3D]">
                Enrolled Curricula & Modules
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your active coursework, review lessons, and take module assessments
              </p>
            </div>
            <Link
              href="/dashboard/student/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#EA580C]"
            >
              <span>View All Courses ({enrollments.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((enr) => {
                const totalLessons = enr.course.sections.reduce(
                  (acc, s) => acc + s.lessons.length,
                  0
                );
                const completedLessons = enr.course.sections.reduce(
                  (acc, s) =>
                    acc + s.lessons.filter((l) => l.progress.some((p) => p.isCompleted)).length,
                  0
                );
                const firstLessonId = enr.course.sections[0]?.lessons[0]?.id;

                return (
                  <div
                    key={enr.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-colors duration-150 group min-w-0"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          {enr.course.category.name}
                        </span>
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            enr.progress >= 100
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-orange-50 text-[#FF6B00] border border-orange-200"
                          }`}
                        >
                          {enr.progress >= 100 ? "Completed ✓" : `${enr.progress}% Complete`}
                        </span>
                      </div>

                      {/* Course Title & Subtitle */}
                      <h3 className="text-base font-bold text-[#0B1B3D] group-hover:text-[#FF6B00] transition-colors leading-snug mb-1.5">
                        {enr.course.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {enr.course.subtitle}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">
                            {completedLessons} of {totalLessons} Lessons Completed
                          </span>
                          <span className="font-bold text-slate-700">
                            {enr.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-[width] duration-500 ${
                              enr.progress >= 100
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-[#FF6B00] to-amber-400"
                            }`}
                            style={{ width: `${enr.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer with Instructor & Action Button */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0 overflow-hidden">
                          {enr.course.instructor.avatar ? (
                            <img
                              src={enr.course.instructor.avatar}
                              alt={enr.course.instructor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            enr.course.instructor.name.charAt(0)
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-600 truncate">
                          {enr.course.instructor.name}
                        </span>
                      </div>

                      <Link
                        href={
                          firstLessonId
                            ? `/courses/${enr.course.slug}/learn/${firstLessonId}`
                            : `/courses/${enr.course.slug}`
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shrink-0"
                      >
                        <span>{enr.progress >= 100 ? "Review Material" : "Resume"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#0B1B3D]">No Courses Enrolled Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Explore our catalog to begin learning with hands-on coding modules.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white shadow-md"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </div>

        {/* Verified Certificates Showcase */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0B1B3D]">
                Earned Certificates & Verified Credentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic academic credentials issued upon 100% curriculum completion
              </p>
            </div>
            <Link
              href="/dashboard/student/certificates"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#EA580C]"
            >
              <span>View Credential Gallery ({certificates.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-emerald-500/30 p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between min-w-0 hover:border-emerald-500/50 transition-colors duration-150"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                        <Award className="w-6 h-6" />
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Verified Credential
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Issued {formatDate(cert.issuedAt)}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-[#0B1B3D] pt-1">
                          {cert.course.title}
                        </h4>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Credential Code:</span>
                      <CopyCodeButton code={cert.certificateCode} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <Link
                      href={`/verify?code=${cert.certificateCode}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B1B3D] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Verify on Public Ledger</span>
                    </Link>

                    <Link
                      href="/dashboard/student/certificates"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline"
                    >
                      <span>View Full Certificate</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#0B1B3D]">No Certificates Earned Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Complete all course modules and achieve passing benchmark scores on quizzes to earn your verified credentials.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
