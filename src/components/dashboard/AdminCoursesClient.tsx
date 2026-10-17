"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  UserCheck,
  ChevronDown
} from "lucide-react";
import { toggleCoursePublish, assignCourseInstructorAction } from "@/app/actions/learning";
import { formatPrice } from "@/lib/utils";

export interface AdminCourseItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  thumbnail: string | null;
  price: number;
  level: string;
  published: boolean;
  categoryId: string;
  categoryName: string;
  instructorId: string;
  instructorName: string;
  enrollmentsCount: number;
  sectionsCount: number;
  lessonsCount: number;
}

export interface TrainerOption {
  id: string;
  name: string;
  email: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

interface AdminCoursesClientProps {
  courses: AdminCourseItem[];
  trainers: TrainerOption[];
  categories: CategoryOption[];
}

export function AdminCoursesClient({
  courses,
  trainers,
  categories,
}: AdminCoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  // Confirmation state for publish/unpublish
  const [confirmToggle, setConfirmToggle] = useState<{
    course: AdminCourseItem;
    targetState: boolean;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  // Counts
  const counts = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.published).length;
    const draft = total - published;
    return { total, published, draft };
  }, [courses]);

  // Filtered
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchSubtitle = c.subtitle?.toLowerCase().includes(q);
        const matchInstructor = c.instructorName.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchInstructor) return false;
      }

      if (categoryFilter !== "ALL" && c.categoryId !== categoryFilter) {
        return false;
      }

      if (statusFilter === "PUBLISHED" && !c.published) return false;
      if (statusFilter === "DRAFT" && c.published) return false;

      return true;
    });
  }, [courses, searchQuery, categoryFilter, statusFilter]);

  const handleExecuteToggle = async () => {
    if (!confirmToggle) return;
    setIsProcessing(true);
    try {
      await toggleCoursePublish(confirmToggle.course.id, confirmToggle.targetState);
      setConfirmToggle(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignTrainer = async (courseId: string, instructorId: string) => {
    try {
      await assignCourseInstructorAction(courseId, instructorId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls: Search, Category, Status */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, topic, or instructor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-8 pr-7 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "ALL"
                  ? "bg-[#0B1B3D] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Curricula ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PUBLISHED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "PUBLISHED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Live & Published ({counts.published})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DRAFT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "DRAFT"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Draft / Hidden ({counts.draft})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Showing <span className="font-bold text-slate-700">{filteredCourses.length}</span> of {courses.length} courses
          </span>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Course Catalog & Moderation Control</span>
          </h2>
          <span className="text-xs text-slate-400">
            Real-time publishing toggles & trainer assignment
          </span>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Course Curriculum</th>
                  <th className="py-3.5 px-6">Domain / Category</th>
                  <th className="py-3.5 px-6">Assigned Instructor</th>
                  <th className="py-3.5 px-6">Enrollments</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <div className="font-bold text-[#0B1B3D] text-sm mb-0.5">{c.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mb-1">{c.subtitle}</div>
                      <div className="text-[10px] text-slate-400">
                        {c.sectionsCount} Sections • {c.lessonsCount} Lessons • {formatPrice(c.price)}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {c.categoryName}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {/* Trainer Reassignment Selector */}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={c.instructorId}
                          onChange={(e) => handleAssignTrainer(c.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 focus:outline-hidden hover:border-slate-300"
                        >
                          {trainers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-[#FF6B00]">
                      {c.enrollmentsCount} Student{c.enrollmentsCount === 1 ? "" : "s"}
                    </td>

                    <td className="py-4 px-6">
                      {c.published ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Live</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/courses/${c.slug}`}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-[#0B1B3D] transition-colors inline-flex items-center gap-1"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmToggle({
                              course: c,
                              targetState: !c.published,
                            })
                          }
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs ${
                            c.published
                              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {c.published ? "Unpublish" : "Publish Live"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No courses match your filter settings.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmToggle && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmToggle(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-[#0B1B3D]">
              Confirm Moderation Status Change
            </h3>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to{" "}
              <span className="font-bold text-[#0B1B3D]">
                {confirmToggle.targetState ? "Publish" : "Unpublish"}
              </span>{" "}
              the course &quot;{confirmToggle.course.title}&quot;?
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 mt-4">
              {confirmToggle.targetState
                ? "This course will become immediately visible in the public catalog and available for student enrollments."
                : "This course will be hidden from the public catalog. Existing enrolled students retain access."}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmToggle(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteToggle}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md disabled:opacity-50 ${
                  confirmToggle.targetState
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isProcessing
                  ? "Processing..."
                  : confirmToggle.targetState
                  ? "Confirm & Publish"
                  : "Confirm & Unpublish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
