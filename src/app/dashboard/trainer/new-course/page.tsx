import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTrainerNotifications } from "@/lib/notifications";
import { ArrowLeft, Sparkles, PlusCircle } from "lucide-react";
import { createCourseAction } from "@/app/actions/learning";

export default async function NewCoursePage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const [notifications, categories] = await Promise.all([
    getTrainerNotifications(user.id),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
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
              Create & Publish New Course
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-[#FF6B00]">
              <Sparkles className="w-3 h-3" />
              <span>Curriculum Authoring</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Add curriculum metadata, configure tuition fees, author default learning modules, and publish directly to the relational database.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <form action={createCourseAction} className="space-y-6">
            {/* Course Title */}
            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Distributed Cloud Computing with Go & Kubernetes"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00] transition-colors"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                Short Subtitle / Tagline
              </label>
              <input
                type="text"
                name="subtitle"
                placeholder="e.g. Build fault-tolerant microservices from scratch with live deployment."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00] transition-colors"
              />
            </div>

            {/* Category & Level & Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                  Academic Category *
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                  Difficulty Level
                </label>
                <select
                  name="level"
                  defaultValue="BEGINNER"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden bg-white"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                  Course Fee (PKR)
                </label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  name="price"
                  defaultValue="15000"
                  placeholder="e.g. 18500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>
            </div>

            {/* Thumbnail Image URL */}
            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                Course Thumbnail Image URL
              </label>
              <input
                type="url"
                name="thumbnail"
                defaultValue="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00]"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] mb-1.5">
                Full Course Description & Syllabus Overview *
              </label>
              <textarea
                name="description"
                required
                rows={5}
                placeholder="Describe the curriculum, technical prerequisites, syllabus modules, and expected student outcomes..."
                className="w-full p-4 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00]"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Relational foreign keys will automatically associate this track with your faculty ID.
              </span>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 transition-all hover:scale-102"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish to Platform</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
