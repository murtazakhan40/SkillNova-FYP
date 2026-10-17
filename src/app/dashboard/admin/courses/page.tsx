import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toggleCoursePublish } from "@/app/actions/learning";

export default async function AdminCoursesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      instructor: true,
      category: true,
      enrollments: true,
      sections: {
        include: { lessons: true },
      },
    },
  });

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Console</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-[#0B1B3D]">
              Course Catalog Moderation & Content Approval
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Publish or unpublish curricula directly from the database.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0B1B3D]">
                Platform Curricula ({courses.length} Courses)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-6">Course</th>
                    <th className="py-3 px-6">Instructor</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Enrolled</th>
                    <th className="py-3 px-6">Current Status</th>
                    <th className="py-3 px-6 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#0B1B3D]">{c.title}</div>
                        <div className="text-[10px] text-slate-400">
                          {c.sections.length} Sections • {formatPrice(c.price)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {c.instructor.name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          {c.category.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#FF6B00]">
                        {c.enrollments.length} Students
                      </td>
                      <td className="py-4 px-6">
                        {c.published ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Live & Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" />
                            Draft / Hidden
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/courses/${c.slug}`}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-[#0B1B3D] transition-colors"
                          >
                            Preview
                          </Link>
                          <form action={toggleCoursePublish.bind(null, c.id, !c.published)}>
                            <button
                              type="submit"
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                c.published
                                  ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              }`}
                            >
                              {c.published ? "Unpublish" : "Approve & Publish"}
                            </button>
                          </form>
                        </div>
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
