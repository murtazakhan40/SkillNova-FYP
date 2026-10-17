import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { PlusCircle, ArrowLeft, ArrowUpRight, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function TrainerCoursesPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const courses = await db.course.findMany({
    where: { instructorId: user.id },
    include: {
      category: true,
      enrollments: true,
      sections: {
        include: { lessons: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard/trainer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Trainer Studio</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-[#0B1B3D]">
                Course Catalog Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage, publish, and review curriculum modules in your teaching portfolio.
              </p>
            </div>

            <Link
              href="/dashboard/trainer/new-course"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Course</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0B1B3D]">
                My Teaching Tracks ({courses.length} Courses)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-6">Course Name</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Level</th>
                    <th className="py-3 px-6">Enrolled</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#0B1B3D] text-xs">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.sections.length} Sections • {formatPrice(c.price)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          {c.category.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {c.level}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#FF6B00]">
                        {c.enrollments.length} Students
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Published
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/courses/${c.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0B1B3D] hover:text-[#FF6B00] transition-colors"
                        >
                          <span>Preview</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
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
