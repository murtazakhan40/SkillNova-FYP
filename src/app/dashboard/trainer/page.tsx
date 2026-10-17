import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { 
  BookOpen, 
  Users, 
  Star, 
  PlusCircle, 
  CheckCircle, 
  ArrowUpRight,
  Sparkles,
  Video
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch trainer's courses
  const courses = await db.course.findMany({
    where: { instructorId: user.id },
    include: {
      category: true,
      enrollments: {
        include: { user: true },
      },
      sections: {
        include: { lessons: true },
      },
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCourses = courses.length;
  const totalStudents = courses.reduce(
    (acc, c) => acc + c.enrollments.length,
    0
  );

  const totalLessons = courses.reduce(
    (acc, c) =>
      acc +
      c.sections.reduce((sAcc, s) => sAcc + s.lessons.length, 0),
    0
  );

  // Recent student enrollments across trainer's courses
  const recentEnrollments = courses
    .flatMap((c) =>
      c.enrollments.map((e) => ({
        ...e,
        courseTitle: c.title,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B00] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instructor Studio & Curriculum Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Trainer Dashboard • {user.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Publish courses, structure learning modules, and monitor student progress.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Active Courses</div>
              <div className="text-2xl font-extrabold text-[#0B1B3D] mt-1">{totalCourses}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Total Enrolled Students</div>
              <div className="text-2xl font-extrabold text-[#FF6B00] mt-1">{totalStudents}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Authored Lessons</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{totalLessons}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Average Rating</div>
              <div className="text-2xl font-extrabold text-amber-500 mt-1">4.9 / 5.0</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Course Catalog Management Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0B1B3D]">
                My Authored Courses
              </h2>
              <p className="text-xs text-slate-400">
                Curriculum tracks managed by your faculty profile.
              </p>
            </div>
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

        {/* Recent Student Roster */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-[#0B1B3D] mb-4">
            Recent Student Enrollments
          </h2>
          {recentEnrollments.length > 0 ? (
            <div className="space-y-3">
              {recentEnrollments.map((enr) => (
                <div
                  key={enr.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold">
                      {enr.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[#0B1B3D]">
                        {enr.user.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Enrolled in: {enr.courseTitle}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-[#FF6B00]">
                      {enr.progress}% Completed
                    </div>
                    <div className="text-[10px] text-slate-400">Active Learner</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No student enrollments yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
