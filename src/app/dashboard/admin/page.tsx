import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { PendingActionsCard, PendingActionItem } from "@/components/dashboard/PendingActionsCard";
import { getAdminNotifications } from "@/lib/notifications";
import { getAdminAnalytics } from "@/lib/dashboard-analytics";
import { formatDate } from "@/lib/utils";
import { 
  Users, 
  BookOpen, 
  Activity,
  Layers
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect(user ? "/dashboard/student" : "/login");
  }

  // Fetch live system aggregates and analytics in parallel
  const [
    notifications,
    analytics,
    dbUser,
    courses,
    pendingCourses,
  ] = await Promise.all([
    getAdminNotifications(),
    getAdminAnalytics(),
    db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        headline: true,
      },
    }),
    db.course.findMany({
      include: {
        instructor: true,
        category: true,
        enrollments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.course.findMany({
      where: { published: false },
      include: {
        instructor: true,
      },
      take: 5,
    }),
  ]);

  // Pending Actions for Administrator
  const pendingActions: PendingActionItem[] = pendingCourses.map((c) => ({
    id: `course-${c.id}`,
    title: `Course Moderation: ${c.title}`,
    subtitle: `Instructor: ${c.instructor.name}`,
    badge: "Pending Review",
    badgeColor: "orange",
    actionLabel: "Inspect",
    actionHref: "/dashboard/admin/courses",
  }));

  const adminDetails =
    dbUser?.headline ||
    "Governance: Lead Administrator · System Security & Verification · Clearance Level 1";

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* =================================================================== */}
        {/* TOP ROW: Profile completion (left) + Pending actions (right)        */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Administrator Profile & Clearance */}
          <ProfileCompletionCard
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: dbUser?.avatar || user.avatar,
              headline: dbUser?.headline,
            }}
            completionPercentage={100}
            statusText="Administrator account verified."
            detailsText={adminDetails}
            editProfileHref="/dashboard/admin/settings"
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
              <div className="text-[11px] font-bold text-slate-400">Total Users</div>
              <div className="text-xl font-black text-[#0B1B3D]">{analytics.totalUsers}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Active Courses</div>
              <div className="text-xl font-black text-[#0B1B3D]">{analytics.courseCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Enrollments</div>
              <div className="text-xl font-black text-[#0B1B3D]">{analytics.enrollmentCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">System State</div>
              <div className="text-xs font-black text-emerald-600">Operational</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BOTTOM ROW: Platform Applications & Courses Table (Screenshot Style)*/}
        {/* =================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-[#0B1B3D] tracking-tight">
              Platform applications & programs
            </h2>

            <Link
              href="/dashboard/admin/courses"
              className="text-xs font-bold text-[#6D28D9] hover:underline"
            >
              View all programs
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                  <th className="pb-3 pr-4 font-bold">Program</th>
                  <th className="pb-3 px-4 font-bold">Instructor</th>
                  <th className="pb-3 px-4 font-bold">Created</th>
                  <th className="pb-3 px-4 font-bold">Status</th>
                  <th className="pb-3 px-4 font-bold">Enrolled</th>
                  <th className="pb-3 pl-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {courses.map((course, idx) => {
                  const programCode = `ADM-2026-${String(idx + 101).padStart(4, "0")}`;
                  const formattedDate = formatDate(course.createdAt);
                  const statusClass = course.published
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200";

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Program Title */}
                      <td className="py-4 pr-4">
                        <div className="font-bold text-[#0B1B3D]">
                          {course.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {programCode}
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="py-4 px-4 text-slate-700 font-semibold whitespace-nowrap">
                        {course.instructor.name}
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
                          {course.published ? "Active" : "Under Review"}
                        </span>
                      </td>

                      {/* Enrolled Count */}
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {course.enrollments.length} Student{course.enrollments.length === 1 ? "" : "s"}
                      </td>

                      {/* Action Link */}
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <Link
                          href="/dashboard/admin/courses"
                          className="text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] hover:underline"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
