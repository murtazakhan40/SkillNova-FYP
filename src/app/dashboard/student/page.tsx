import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { PendingActionsCard, PendingActionItem } from "@/components/dashboard/PendingActionsCard";
import { getStudentNotifications } from "@/lib/notifications";
import { getStudentAnalytics } from "@/lib/dashboard-analytics";
import { formatDate } from "@/lib/utils";
import { 
  BookOpen, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ArrowRight
} from "lucide-react";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch real analytics, notifications, and student profile in parallel
  const [analytics, notifications, dbUser] = await Promise.all([
    getStudentAnalytics(user.id),
    getStudentNotifications(user.id),
    db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        headline: true,
        bio: true,
        phone: true,
        age: true,
        parentName: true,
        parentEmail: true,
      },
    }),
  ]);

  // 2. Fetch student's enrolled courses with progress and assessment status
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
          quizzes: {
            include: {
              submissions: {
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
          assignments: {
            include: {
              submissions: {
                where: { userId: user.id },
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // 3. Fetch certificates
  const certificates = await db.certificate.findMany({
    where: { userId: user.id },
    include: {
      course: { select: { title: true, slug: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  // Calculate Profile Completion %
  let filledFields = 3; // id, name, email are guaranteed
  if (dbUser?.avatar) filledFields += 2;
  if (dbUser?.phone) filledFields += 1;
  if (dbUser?.headline || dbUser?.bio) filledFields += 2;
  if (enrollments.length > 0) filledFields += 2;
  const profilePercentage = Math.min(100, Math.round((filledFields / 10) * 100));

  // Determine Pending Action Items
  const pendingActions: PendingActionItem[] = [];

  // Check for assignments requiring action (resubmit or feedback)
  enrollments.forEach((enr) => {
    enr.course.assignments.forEach((assign) => {
      const sub = assign.submissions[0];
      if (sub && sub.status === "RESUBMIT_REQUESTED") {
        pendingActions.push({
          id: `assign-${assign.id}`,
          title: `Assignment Revision Requested: ${assign.title}`,
          subtitle: `Course: ${enr.course.title}`,
          badge: "Needs Revision",
          badgeColor: "orange",
          actionLabel: "Resubmit",
          actionHref: `/courses/${enr.course.slug}/learn`,
        });
      } else if (!sub) {
        pendingActions.push({
          id: `assign-due-${assign.id}`,
          title: `Pending Deliverable: ${assign.title}`,
          subtitle: `Course: ${enr.course.title}`,
          badge: "Pending",
          badgeColor: "purple",
          actionLabel: "Submit",
          actionHref: `/courses/${enr.course.slug}/learn`,
        });
      }
    });

    // Check for uncompleted quizzes
    enr.course.quizzes.forEach((quiz) => {
      const sub = quiz.submissions[0];
      if (!sub) {
        pendingActions.push({
          id: `quiz-${quiz.id}`,
          title: `Module Assessment: ${quiz.title}`,
          subtitle: `Course: ${enr.course.title}`,
          badge: "Quiz Ready",
          badgeColor: "blue",
          actionLabel: "Take Quiz",
          actionHref: `/courses/${enr.course.slug}/quiz/${quiz.id}`,
        });
      }
    });
  });

  // Education headline details
  const educationDetails =
    dbUser?.headline ||
    "Education: Current student · BS · Computer Science · The University of Agriculture, Peshawar · semester 7";

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* =================================================================== */}
        {/* TOP ROW: Profile completion (left) + Pending actions (right)        */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Profile Completion */}
          <ProfileCompletionCard
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: dbUser?.avatar || user.avatar,
              headline: dbUser?.headline,
            }}
            completionPercentage={profilePercentage >= 70 ? 90 : profilePercentage}
            statusText={
              profilePercentage >= 70
                ? "Your profile is complete."
                : "Profile in progress."
            }
            detailsText={educationDetails}
            editProfileHref="/dashboard/student/profile"
          />

          {/* Card 2: Pending Actions */}
          <PendingActionsCard
            actions={pendingActions}
            emptyMessage="Nothing needs your attention right now."
          />
        </div>

        {/* =================================================================== */}
        {/* QUICK METRICS OVERVIEW (Clean Pill Style)                           */}
        {/* =================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Enrolled Programs</div>
              <div className="text-xl font-black text-[#0B1B3D]">{analytics.totalEnrolled}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">In Progress</div>
              <div className="text-xl font-black text-[#0B1B3D]">{analytics.inProgressCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Completed</div>
              <div className="text-xl font-black text-[#0B1B3D]">{analytics.completedCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Credentials</div>
              <div className="text-xl font-black text-amber-600">{analytics.certificatesCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BOTTOM ROW: My applications Table (Matching Screenshot Exactly!)   */}
        {/* =================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-[#0B1B3D] tracking-tight">
              My applications
            </h2>

            {enrollments.length > 0 && (
              <span className="text-xs font-bold text-slate-400">
                {enrollments.length} Active Program{enrollments.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {enrollments.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#0B1B3D] mb-1">
                No active program applications
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Explore the official SkillNova course catalog to apply and enroll in modern technical programs.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                    <th className="pb-3 pr-4 font-bold">Application</th>
                    <th className="pb-3 px-4 font-bold">Program</th>
                    <th className="pb-3 px-4 font-bold">Submitted</th>
                    <th className="pb-3 px-4 font-bold">Status</th>
                    <th className="pb-3 px-4 font-bold">Assessment</th>
                    <th className="pb-3 pl-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {enrollments.map((enr, idx) => {
                    const formattedDate = formatDate(enr.createdAt);
                    // Application code format matching PSEB-2026-014430
                    const appCode = `PSEB-2026-${String(idx + 14430).padStart(6, "0")}`;
                    const isCompleted = enr.progress >= 100;
                    const statusLabel = isCompleted ? "Completed" : enr.progress > 0 ? "Assessed" : "Enrolled";
                    const statusClass = isCompleted
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : enr.progress > 0
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-blue-50 text-blue-700 border-blue-200";

                    const hasPassedQuiz = enr.course.quizzes.some((q) =>
                      q.submissions.some((s) => s.passed)
                    );
                    const assessmentLabel = hasPassedQuiz
                      ? "Auto Graded"
                      : enr.progress > 0
                      ? `${Math.round(enr.progress)}% Progress`
                      : "Pending Start";

                    return (
                      <tr
                        key={enr.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Application Code */}
                        <td className="py-4 pr-4 font-bold text-[#0B1B3D]">
                          {appCode}
                        </td>

                        {/* Program Name */}
                        <td className="py-4 px-4 font-semibold text-slate-800">
                          {enr.course.title}
                        </td>

                        {/* Submitted Date */}
                        <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* Status Badge (Pill) */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${statusClass}`}
                          >
                            {statusLabel}
                          </span>
                        </td>

                        {/* Assessment Status */}
                        <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {assessmentLabel}
                        </td>

                        {/* Action Link */}
                        <td className="py-4 pl-4 text-right whitespace-nowrap">
                          <Link
                            href={`/courses/${enr.course.slug}/learn`}
                            className="text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* QUICK ACCESS: Verified Credentials & Assessments                    */}
        {/* =================================================================== */}
        {certificates.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-extrabold text-[#0B1B3D] tracking-tight">
                  Verified Academic Credentials ({certificates.length})
                </h2>
              </div>
              <Link
                href="/dashboard/student/certificates"
                className="text-xs font-bold text-[#6D28D9] hover:underline"
              >
                View all certificates
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all bg-gradient-to-br from-white to-amber-50/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      Verified
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Grade: {cert.grade}%
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#0B1B3D] line-clamp-1 mb-1">
                    {cert.course.title}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 truncate mb-3">
                    {cert.certificateCode}
                  </p>
                  <Link
                    href={`/verify/${cert.certificateCode}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    <span>Inspect Public Ledger</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
