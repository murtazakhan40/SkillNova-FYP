import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StudentProfileForm } from "@/components/dashboard/StudentProfileForm";
import { getTrainerNotifications } from "@/lib/notifications";
import { ArrowLeft, UserCheck, BookOpen, Users, Award } from "lucide-react";

export default async function TrainerProfilePage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const [notifications, courses] = await Promise.all([
    getTrainerNotifications(user.id),
    db.course.findMany({
      where: user.role === "ADMIN" ? {} : { instructorId: user.id },
      include: {
        enrollments: true,
      },
    }),
  ]);

  const totalEnrollments = courses.reduce(
    (acc, c) => acc + c.enrollments.length,
    0
  );

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/dashboard/trainer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Trainer Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Faculty Profile & Instructor Settings
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-[#FF6B00]">
              <UserCheck className="w-3 h-3" />
              <span>Approved Faculty Lead</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Update your professional designation, contact details, and faculty bio. This information is shown on your authored course syllabi.
          </p>
        </div>

        {/* Profile Edit Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          <StudentProfileForm user={user} />
        </div>

        {/* Academic Portfolio Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Authored Curricula
              </span>
              <div className="text-sm font-bold text-[#0B1B3D]">
                {courses.length} Published Courses
              </div>
              <div className="text-xs text-slate-500">
                SkillNova Verified Curriculum
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Student Reach
              </span>
              <div className="text-sm font-bold text-[#0B1B3D]">
                {totalEnrollments} Active Learners
              </div>
              <div className="text-xs text-emerald-600 font-semibold">
                Supervised Teaching Portfolio
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
