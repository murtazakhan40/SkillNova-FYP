"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  PlusCircle, 
  Edit3, 
  ExternalLink, 
  CheckCircle, 
  X, 
  Save,
  Video,
  Users
} from "lucide-react";
import { updateCourseDetailsAction } from "@/app/actions/learning";
import { formatPrice } from "@/lib/utils";

export interface TrainerCourseItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  thumbnail: string | null;
  price: number;
  level: string;
  published: boolean;
  categoryId: string;
  categoryName: string;
  enrollmentsCount: number;
  sectionsCount: number;
  lessonsCount: number;
}

export interface CategoryOption {
  id: string;
  name: string;
}

interface TrainerCoursesClientProps {
  courses: TrainerCourseItem[];
  categories: CategoryOption[];
}

export function TrainerCoursesClient({
  courses,
  categories,
}: TrainerCoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [editingCourse, setEditingCourse] = useState<TrainerCourseItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtered
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchSubtitle = c.subtitle?.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle) return false;
      }

      if (categoryFilter !== "ALL" && c.categoryId !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery, categoryFilter]);

  const handleSaveCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCourse) return;

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      await updateCourseDetailsAction(editingCourse.id, formData);
      setEditingCourse(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls: Search, Category, Add Course */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your authored courses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <Link
            href="/dashboard/trainer/new-course"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Course</span>
          </Link>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  {c.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0B1B3D] to-[#1E3A8A] flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-white/30" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[#0B1B3D]">
                      {c.categoryName}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-xs">
                      Published
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-orange-400" />
                      <span>{c.lessonsCount} Lessons</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{c.enrollmentsCount} Students</span>
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-[#0B1B3D] leading-snug line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {c.subtitle || c.description}
                  </p>
                  <div className="text-xs font-extrabold text-[#0B1B3D] pt-1">
                    {formatPrice(c.price)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                <Link
                  href={`/courses/${c.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0B1B3D]"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setEditingCourse(c)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Curriculum</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0B1B3D]">No Courses Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            No courses match your current search or category filter.
          </p>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditingCourse(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-[#0B1B3D]">
                  Edit Curriculum Metadata
                </h3>
                <p className="text-xs text-slate-500">
                  Update syllabus details, pricing, and category classification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingCourse.title}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                  Short Subtitle / Tagline
                </label>
                <input
                  type="text"
                  name="subtitle"
                  defaultValue={editingCourse.subtitle || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    defaultValue={editingCourse.categoryId}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                    Difficulty Level
                  </label>
                  <select
                    name="level"
                    defaultValue={editingCourse.level}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                    Course Fee (PKR)
                  </label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingCourse.price}
                    step="500"
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] mb-1">
                  Full Course Description & Syllabus *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingCourse.description}
                  required
                  className="w-full p-4 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving Changes..." : "Save Modifications"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
