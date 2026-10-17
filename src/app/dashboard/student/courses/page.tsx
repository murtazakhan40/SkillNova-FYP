import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react";

export default async function StudentCoursesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: true,
          category: true,
          sections: {
            include: { lessons: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard/student"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-[#0B1B3D]">
                My Enrolled Courses
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Pick up where you left off and complete your technical curricula.
              </p>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md transition-all shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enr) => {
              const totalLessons = enr.course.sections.reduce(
                (acc, s) => acc + s.lessons.length,
                0
              );
              const firstLessonId = enr.course.sections[0]?.lessons[0]?.id;

              return (
                <div
                  key={enr.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        {enr.course.category.name}
                      </span>
                      <span className="text-xs font-extrabold text-[#FF6B00]">
                        {enr.progress}% Complete
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#0B1B3D] mb-2 leading-snug">
                      {enr.course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {enr.course.subtitle}
                    </p>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                      <div
                        className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-2 rounded-full"
                        style={{ width: `${enr.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">
                      {totalLessons} Lessons in Curriculum
                    </span>

                    <Link
                      href={
                        firstLessonId
                          ? `/courses/${enr.course.slug}/learn/${firstLessonId}`
                          : `/courses/${enr.course.slug}`
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors"
                    >
                      <span>Enter Classroom</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
