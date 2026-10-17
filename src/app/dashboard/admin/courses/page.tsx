import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { 
  AdminCoursesClient, 
  AdminCourseItem, 
  TrainerOption, 
  CategoryOption 
} from "@/components/dashboard/AdminCoursesClient";
import { getAdminNotifications } from "@/lib/notifications";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";

export default async function AdminCoursesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const [notifications, courses, trainers, categories] = await Promise.all([
    getAdminNotifications(),
    db.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        instructor: true,
        category: true,
        enrollments: true,
        sections: {
          include: { lessons: true },
        },
      },
    }),
    db.user.findMany({
      where: { role: "TRAINER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const courseItems: AdminCourseItem[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    subtitle: c.subtitle,
    thumbnail: c.thumbnail,
    price: c.price,
    level: c.level,
    published: c.published,
    categoryId: c.categoryId,
    categoryName: c.category.name,
    instructorId: c.instructorId,
    instructorName: c.instructor.name,
    enrollmentsCount: c.enrollments.length,
    sectionsCount: c.sections.length,
    lessonsCount: c.sections.reduce((acc, s) => acc + s.lessons.length, 0),
  }));

  const trainerOptions: TrainerOption[] = trainers.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
  }));

  const categoryOptions: CategoryOption[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
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
            <span>Back to Admin Console</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Course Catalog Moderation & Governance
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700">
              <Sparkles className="w-3 h-3" />
              <span>Curriculum Control</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review academic curricula, manage publication states, and reassign course instructors across faculties.
          </p>
        </div>

        <AdminCoursesClient
          courses={courseItems}
          trainers={trainerOptions}
          categories={categoryOptions}
        />
      </div>
    </DashboardShell>
  );
}
