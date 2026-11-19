import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { PendingActionsCard, PendingActionItem } from "@/components/dashboard/PendingActionsCard";
import { getTrainerNotifications } from "@/lib/notifications";
import { getTrainerAnalytics } from "@/lib/dashboard-analytics";
import { formatDate } from "@/lib/utils";
import { 
  BookOpen, 
  Users, 
  PlusCircle, 
  HelpCircle, 
  CheckCircle2 
} from "lucide-react";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const isAdmin = user.role === "ADMIN";

  // Fetch real data in parallel with strict ownership checks
  const [notifications, analytics, dbUser, courses] = await Promise.all([
    getTrainerNotifications(user.id),
    getTrainerAnalytics(user.id, isAdmin),
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
      },
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

  // Construct Pending Action Items
  const pendingActions: PendingActionItem[] = pendingAssignmentRecords.map((sub) => ({
    id: `eval-${sub.id}`,
    title: `Submission Review: ${sub.assignment.title}`,
    subtitle: `Student: ${sub.user.name} · ${sub.assignment.course.title}`,
    badge: "Needs Evaluation",
    badgeColor: "orange",
    actionLabel: "Grade",
    actionHref: "/dashboard/trainer/assessments",
  }));

  const trainerDetails =
    dbUser?.headline ||
    `Instruction: Lead Instructor · Systems & Web Engineering · ${courses.length} Active Curricula`;

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* =================================================================== */}
        {/* TOP ROW: Profile completion (left) + Pending actions (right)        */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Faculty Profile Completion */}
          <ProfileCompletionCard
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: dbUser?.avatar || user.avatar,
              headline: dbUser?.headline,
            }}
            completionPercentage={95}
            statusText="Faculty credentials verified."
            detailsText={trainerDetails}
            editProfileHref="/dashboard/trainer/profile"
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
              <div className="text-[11px] font-bold text-slate-400">Active Curricula</div>
              <div className="text-xl font-black text-[#0B1B3D]">{courses.length}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Enrolled Students</div>
              <div className="text-xl font-black text-[#0B1B3D]">{analytics.enrolledLearnersCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Pending Reviews</div>
              <div className="text-xl font-black text-[#0B1B3D]">{analytics.pendingReviewsCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Certified Graduates</div>
              <div className="text-xl font-black text-emerald-600">{analytics.completedGraduatesCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BOTTOM ROW: Course Programs Table (Matching Screenshot Style)       */}
        {/* =================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-[#0B1B3D] tracking-tight">
              My courses & programs
            </h2>

            <Link
              href="/dashboard/trainer/new-course"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Course</span>
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#0B1B3D] mb-1">
                No courses created yet
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Launch your first academic curriculum, design video lectures, and create assessment rubrics.
              </p>
              <Link
                href="/dashboard/trainer/new-course"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create First Course</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                    <th className="pb-3 pr-4 font-bold">Program</th>
                    <th className="pb-3 px-4 font-bold">Category</th>
                    <th className="pb-3 px-4 font-bold">Created</th>
                    <th className="pb-3 px-4 font-bold">Status</th>
                    <th className="pb-3 px-4 font-bold">Enrolled</th>
                    <th className="pb-3 pl-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {courses.map((course, idx) => {
                    const programCode = `CRS-2026-${String(idx + 101).padStart(4, "0")}`;
                    const formattedDate = formatDate(course.createdAt);
                    const statusClass = course.published
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200";

                    return (
                      <tr
                        key={course.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Program / Title */}
                        <td className="py-4 pr-4">
                          <div className="font-bold text-[#0B1B3D]">
                            {course.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {programCode}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 text-slate-700 font-semibold whitespace-nowrap">
                          {course.category?.name || "General"}
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${statusClass}`}
                          >
                            {course.published ? "Published" : "Draft"}
                          </span>
                        </td>

                        {/* Enrolled Count */}
                        <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {course.enrollments.length} Student{course.enrollments.length === 1 ? "" : "s"}
                        </td>

                        {/* Action Link */}
                        <td className="py-4 pl-4 text-right whitespace-nowrap">
                          <Link
                            href="/dashboard/trainer/courses"
                            className="text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] hover:underline"
                          >
                            Manage
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
      </div>
    </DashboardShell>
  );
}
