import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { 
  TrainerStudentsClient, 
  TrainerStudentRosterItem 
} from "@/components/dashboard/TrainerStudentsClient";
import { getTrainerNotifications } from "@/lib/notifications";
import { ArrowLeft, Users, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TrainerStudentsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const [notifications, courses] = await Promise.all([
    getTrainerNotifications(user.id),
    db.course.findMany({
      where: user.role === "ADMIN" ? {} : { instructorId: user.id },
      include: {
        enrollments: {
          include: {
            user: {
              include: {
                certificates: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  const studentItems: TrainerStudentRosterItem[] = courses.flatMap((c) =>
    c.enrollments.map((enr) => ({
      id: enr.id,
      studentId: enr.user.id,
      studentName: enr.user.name,
      studentEmail: enr.user.email,
      studentAvatar: enr.user.avatar,
      studentHeadline: enr.user.headline,
      studentPhone: enr.user.phone,
      studentBio: enr.user.bio,
      courseId: c.id,
      courseTitle: c.title,
      enrolledAt: formatDate(enr.createdAt),
      progress: Math.round(enr.progress),
      hasCertificate: enr.user.certificates.some((cert) => cert.courseId === c.id),
    }))
  );

  const courseOptions = courses.map((c) => ({
    id: c.id,
    title: c.title,
  }));

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-7xl mx-auto space-y-6">
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
              Enrolled Students Roster
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-[#FF6B00]">
              <Sparkles className="w-3 h-3" />
              <span>Learner Tracking</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Track student coursework progress, identify learners who need support, and inspect verified graduation certificates.
          </p>
        </div>

        <TrainerStudentsClient
          students={studentItems}
          courses={courseOptions}
        />
      </div>
    </DashboardShell>
  );
}
