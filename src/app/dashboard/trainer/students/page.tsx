import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ArrowLeft, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TrainerStudentsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  // Fetch all enrollments for courses taught by this trainer
  const courses = await db.course.findMany({
    where: { instructorId: user.id },
    include: {
      enrollments: {
        include: {
          user: {
            include: {
              certificates: true,
            },
          },
        },
      },
    },
  });

  const enrolledStudents = courses.flatMap((c) =>
    c.enrollments.map((e) => ({
      ...e,
      courseTitle: c.title,
      courseSlug: c.slug,
      hasCert: e.user.certificates.some((cert) => cert.courseId === c.id),
    }))
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <Link
              href="/dashboard/trainer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Trainer Studio</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-[#0B1B3D]">
              Enrolled Students Roster
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track student progress, completion percentages, and credential awards across your courses.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0B1B3D]">
                Enrolled Students ({enrolledStudents.length} Active Records)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Course</th>
                    <th className="py-3 px-6">Enrolled Date</th>
                    <th className="py-3 px-6">Curriculum Progress</th>
                    <th className="py-3 px-6 text-right">Certificate Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {enrolledStudents.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {enr.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#0B1B3D]">{enr.user.name}</div>
                          <div className="text-[10px] text-slate-400">{enr.user.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {enr.courseTitle}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {formatDate(enr.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#FF6B00]">
                            <span>{enr.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-1.5 rounded-full"
                              style={{ width: `${enr.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {enr.hasCert ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Award className="w-3.5 h-3.5" />
                            Certificate Awarded
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
