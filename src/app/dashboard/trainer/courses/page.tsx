import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { 
  TrainerCoursesClient, 
  TrainerCourseItem, 
  CategoryOption 
} from "@/components/dashboard/TrainerCoursesClient";
import { getTrainerNotifications } from "@/lib/notifications";
import { ArrowLeft, BookOpen, PlusCircle } from "lucide-react";

export default async function TrainerCoursesPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const [notifications, courses, categories] = await Promise.all([
    getTrainerNotifications(user.id),
    db.course.findMany({
      where: user.role === "ADMIN" ? {} : { instructorId: user.id },
      include: {
        category: true,
        enrollments: true,
        sections: {
          include: { lessons: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const courseItems: TrainerCourseItem[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    subtitle: c.subtitle,
    description: c.description,
    thumbnail: c.thumbnail,
    price: c.price,
    level: c.level,
    published: c.published,
    categoryId: c.categoryId,
    categoryName: c.category.name,
    enrollmentsCount: c.enrollments.length,
    sectionsCount: c.sections.length,
    lessonsCount: c.sections.reduce((acc, s) => acc + s.lessons.length, 0),
  }));

  const categoryOptions: CategoryOption[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/trainer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Trainer Studio</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Course Catalog Management
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Inspect curriculum modules, update course syllabi, set tuition fees, and monitor student enrollment rates.
            </p>
          </div>

          <Link
            href="/dashboard/trainer/new-course"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>

        <TrainerCoursesClient
          courses={courseItems}
          categories={categoryOptions}
        />
      </div>
    </DashboardShell>
  );
}
