import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StudentCoursesClient } from "@/components/dashboard/StudentCoursesClient";
import { getStudentNotifications } from "@/lib/notifications";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";

export default async function StudentCoursesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [notifications, enrollments] = await Promise.all([
    getStudentNotifications(user.id),
    db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: true,
            category: true,
            sections: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                  include: {
                    progress: {
                      where: { userId: user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // Transform data for client interactivity
  const initialCourses = enrollments.map((enr) => {
    const allLessons = enr.course.sections.flatMap((s) => s.lessons);
    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter((l) =>
      l.progress.some((p) => p.isCompleted)
    ).length;

    const firstLessonId = allLessons[0]?.id || null;
    const nextUncompleted = allLessons.find(
      (l) => !l.progress.some((p) => p.isCompleted)
    );
    const nextLessonId = nextUncompleted?.id || firstLessonId;

    return {
      id: enr.id,
      progress: enr.progress,
      completedAt: enr.completedAt ? enr.completedAt.toISOString() : null,
      updatedAt: enr.updatedAt.toISOString(),
      course: {
        id: enr.course.id,
        title: enr.course.title,
        slug: enr.course.slug,
        subtitle: enr.course.subtitle,
        thumbnail: enr.course.thumbnail,
        level: enr.course.level,
        category: {
          id: enr.course.category.id,
          name: enr.course.category.name,
          slug: enr.course.category.slug,
        },
        instructor: {
          name: enr.course.instructor.name,
          avatar: enr.course.instructor.avatar,
          headline: enr.course.instructor.headline,
        },
        totalLessons,
        completedLessons,
        firstLessonId,
        nextLessonId,
      },
    };
  });

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                My Enrolled Courses
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] font-bold text-[#FF6B00]">
                <Sparkles className="w-3 h-3" />
                <span>Active Ledger</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Track your individual module completion rates, resume interactive lessons, and access full course curricula.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 transition-all hover:scale-102 shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore More Courses</span>
          </Link>
        </div>

        {/* Client Interactive Filter & Courses Grid */}
        <StudentCoursesClient initialCourses={initialCourses} />
      </div>
    </DashboardShell>
  );
}
