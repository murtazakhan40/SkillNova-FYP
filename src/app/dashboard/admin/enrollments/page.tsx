import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { 
  AdminEnrollmentsClient, 
  AdminEnrollmentRecord, 
  StudentOption, 
  CourseOption 
} from "@/components/dashboard/AdminEnrollmentsClient";
import { getAdminNotifications } from "@/lib/notifications";
import { ArrowLeft, Layers, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminEnrollmentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const [notifications, enrollments, students, courses] = await Promise.all([
    getAdminNotifications(),
    db.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            category: { select: { name: true } },
          },
        },
      },
    }),
    db.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    db.course.findMany({
      select: { id: true, title: true, price: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const enrollmentRecords: AdminEnrollmentRecord[] = enrollments.map((e) => ({
    id: e.id,
    studentId: e.userId,
    studentName: e.user.name,
    studentEmail: e.user.email,
    studentAvatar: e.user.avatar,
    courseId: e.courseId,
    courseTitle: e.course.title,
    courseSlug: e.course.slug,
    coursePrice: e.course.price,
    categoryName: e.course.category.name,
    progress: Math.round(e.progress),
    completedAt: e.completedAt ? formatDate(e.completedAt) : null,
    createdAt: formatDate(e.createdAt),
  }));

  const studentOptions: StudentOption[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
  }));

  const courseOptions: CourseOption[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    price: c.price,
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
            <span>Back to Platform Metrics</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
                  Student Enrollment Oversight
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                  <Layers className="w-3 h-3 text-emerald-600" />
                  <span>Cohort Registry</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Inspect institutional student course enrollments, track learning velocity, grant manual admissions, and handle policy revocations.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 text-xs font-bold shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{enrollments.length} Active Records on Ledger</span>
            </div>
          </div>
        </div>

        <AdminEnrollmentsClient
          enrollments={enrollmentRecords}
          students={studentOptions}
          courses={courseOptions}
        />
      </div>
    </DashboardShell>
  );
}
