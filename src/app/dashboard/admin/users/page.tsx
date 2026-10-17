import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AdminUsersClient, UserDirectoryItem } from "@/components/dashboard/AdminUsersClient";
import { getAdminNotifications } from "@/lib/notifications";
import { ArrowLeft, Sparkles, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const [notifications, users] = await Promise.all([
    getAdminNotifications(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        enrollments: {
          include: { course: true },
        },
        certificates: true,
        coursesTaught: true,
      },
    }),
  ]);

  const directoryItems: UserDirectoryItem[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    headline: u.headline,
    bio: u.bio,
    phone: u.phone,
    createdAt: formatDate(u.createdAt),
    enrollmentsCount: u.enrollments.length,
    certificatesCount: u.certificates.length,
    coursesTaughtCount: u.coursesTaught.length,
    enrolledCourses: u.enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      progress: Math.round(e.progress),
    })),
  }));

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Console</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              User Governance & Role Management
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700">
              <Sparkles className="w-3 h-3" />
              <span>RBAC Authority</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Inspect registered student profiles, verify course progress, manage institutional role permissions, and maintain data security.
          </p>
        </div>

        <AdminUsersClient users={directoryItems} />
      </div>
    </DashboardShell>
  );
}
