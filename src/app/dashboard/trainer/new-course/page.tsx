import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ArrowLeft, Sparkles } from "lucide-react";
import { createCourseAction } from "@/app/actions/learning";

export default async function NewCoursePage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard/trainer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Trainer Studio</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-[#0B1B3D]">
                Create & Publish New Course
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Add curriculum metadata, set pricing, and publish your course to the database.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <form action={createCourseAction} className="space-y-6">
              {/* Course Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Distributed Cloud Computing with Go & Kubernetes"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Subtitle / Tagline
                </label>
                <input
                  type="text"
                  name="subtitle"
                  placeholder="e.g. Build fault-tolerant microservices from scratch with live deployment."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>

              {/* Category & Level & Price Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Category *
                  </label>
                  <select
                    name="categoryId"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6B00] outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    name="level"
                    defaultValue="BEGINNER"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6B00] outline-none bg-white"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Fee (PKR / Rs.)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="10000"
                    max="30000"
                    name="price"
                    defaultValue="15000"
                    placeholder="e.g. 18500"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6B00] outline-none"
                  />
                </div>
              </div>

              {/* Thumbnail Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Thumbnail Image URL
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  defaultValue="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6B00] outline-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Course Description & Syllabus Overview *
                </label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  placeholder="Describe the curriculum, technical prerequisites, syllabus modules, and expected student outcomes..."
                  className="w-full p-4 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6B00] outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  This will write directly to your database with relational foreign keys.
                </span>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publish to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
