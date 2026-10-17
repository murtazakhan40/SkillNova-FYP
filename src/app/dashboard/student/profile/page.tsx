import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StudentProfileForm } from "@/components/dashboard/StudentProfileForm";
import { getStudentNotifications } from "@/lib/notifications";
import { ArrowLeft, UserCheck, GraduationCap, ShieldCheck, BookOpen } from "lucide-react";

export default async function StudentProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [notifications, enrollments, certificatesCount] = await Promise.all([
    getStudentNotifications(user.id),
    db.enrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
    }),
    db.certificate.count({
      where: { userId: user.id },
    }),
  ]);

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Student Profile & Account Settings
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-700">
              <UserCheck className="w-3 h-3 text-blue-600" />
              <span>Verified Scholar</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal bio, professional headline, and contact details associated with your SkillNova academic transcripts.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          <StudentProfileForm user={user} />
        </div>

        {/* Academic Credentials & Tracks Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Enrolled Curriculum
              </span>
              <div className="text-sm font-bold text-[#0B1B3D]">
                {enrollments.length} Active Courses Enrolled
              </div>
              <div className="text-xs text-slate-500">
                BS Computer Science Final Year Project
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Accredited Credentials
              </span>
              <div className="text-sm font-bold text-[#0B1B3D]">
                {certificatesCount} Cryptographic Certificate{certificatesCount === 1 ? "" : "s"}
              </div>
              <div className="text-xs text-emerald-600 font-semibold">
                SHA-256 Ledger Verified
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
