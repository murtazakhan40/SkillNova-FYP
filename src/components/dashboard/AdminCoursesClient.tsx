"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  UserCheck,
  ChevronDown,
  PlusCircle,
  FolderPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  AlertCircle,
  Tag
} from "lucide-react";
import { 
  adminToggleCoursePublishAction, 
  adminAssignCourseInstructorAction,
  createCategoryAction,
  deleteCategoryAction
} from "@/app/actions/admin";
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
  slug?: string;
  description?: string | null;
  icon?: string | null;
  coursesCount?: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Confirmation state for publish/unpublish
  const [confirmToggle, setConfirmToggle] = useState<{
    course: AdminCourseItem;
    targetState: boolean;
  } | null>(null);

  // Category management modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryOption | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Counts
  const counts = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.published).length;
    const draft = total - published;
    return { total, published, draft };
  }, [courses]);

  // Filtered courses
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

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / pageSize) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage]);

  const handleExecuteToggle = async () => {
    if (!confirmToggle) return;
    setIsProcessing(true);
    setToast(null);
    try {
      await adminToggleCoursePublishAction(confirmToggle.course.id);
      setToast({
        type: "success",
        message: `Course "${confirmToggle.course.title}" status changed to ${
          confirmToggle.targetState ? "Published" : "Draft"
        }.`,
      });
      setConfirmToggle(null);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to toggle course publication status.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignTrainer = async (courseId: string, instructorId: string) => {
    setIsProcessing(true);
    setToast(null);
    try {
      await adminAssignCourseInstructorAction(courseId, instructorId);
      const trainer = trainers.find((t) => t.id === instructorId);
      setToast({
        type: "success",
        message: `Assigned ${trainer?.name || "faculty trainer"} to course.`,
      });
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to reassign course instructor.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setToast(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await createCategoryAction(formData);
      setToast({
        type: "success",
        message: `Successfully created new catalog category.`,
      });
      form.reset();
      setIsNewCategoryOpen(false);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to create category.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsProcessing(true);
    setToast(null);
    try {
      await deleteCategoryAction(categoryToDelete.id);
      setToast({
        type: "success",
        message: `Category "${categoryToDelete.name}" deleted successfully.`,
      });
      setCategoryToDelete(null);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to delete category.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold border ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs font-bold hover:underline opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls: Search, Category, Status, Manage Categories */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, topic, or instructor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-7 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Categories ({categories.length})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.coursesCount !== undefined ? `(${cat.coursesCount})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              <span>Manage Categories ({categories.length})</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setCurrentPage(1);
              }}
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
              onClick={() => {
                setStatusFilter("PUBLISHED");
                setCurrentPage(1);
              }}
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
              onClick={() => {
                setStatusFilter("DRAFT");
                setCurrentPage(1);
              }}
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

      {/* Courses Moderation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {paginatedCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Course Details</th>
                  <th className="py-3.5 px-4">Assigned Instructor</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4 text-center">Enrollments</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title & Stats */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-[#0B1B3D] truncate">{c.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.sectionsCount} Sections • {c.lessonsCount} Lessons • Level: {c.level}
                      </div>
                    </td>

                    {/* Instructor Assignment Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="relative inline-flex items-center">
                        <select
                          disabled={isProcessing}
                          value={c.instructorId}
                          onChange={(e) => handleAssignTrainer(c.id, e.target.value)}
                          className="pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:outline-hidden transition-colors cursor-pointer"
                        >
                          {trainers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-100">
                        {c.categoryName}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {formatPrice(c.price)}
                    </td>

                    {/* Enrollments */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-[#0B1B3D]">{c.enrollmentsCount}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {c.published ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    {/* Moderation Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/courses/${c.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B1B3D] hover:bg-slate-100 transition-colors"
                          title="Preview public course page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            setConfirmToggle({
                              course: c,
                              targetState: !c.published,
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            c.published
                              ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200"
                              : "bg-[#FF6B00] text-white hover:bg-[#EA580C]"
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page <span className="font-bold text-slate-700">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-700">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Publish / Unpublish */}
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

      {/* Categories Management Modal */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6 border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-[#0B1B3D]">
                  Category Taxonomy & Classification Management
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Header with New Category Action */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Manage curriculum topics and classifications across the academy.
              </p>
              <button
                type="button"
                onClick={() => setIsNewCategoryOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            {/* List of categories */}
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#0B1B3D] text-sm">{cat.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {cat.coursesCount ?? 0} Courses
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Slug: /{cat.slug || cat.name.toLowerCase()}
                    </div>
                    {cat.description && (
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setCategoryToDelete(cat)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Close Category Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Category Form Modal */}
      {isNewCategoryOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsNewCategoryOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-sm font-extrabold text-[#0B1B3D]">Create New Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCategoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#0B1B3D]">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Distributed Systems"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0B1B3D]">Slug (Optional, auto-generated)</label>
                <input
                  type="text"
                  name="slug"
                  placeholder="e.g. distributed-systems"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0B1B3D]">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Classification description..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0B1B3D]">Icon Identifier</label>
                <select
                  name="icon"
                  defaultValue="BookOpen"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B00]"
                >
                  <option value="BookOpen">BookOpen (Standard)</option>
                  <option value="Code">Code (Software)</option>
                  <option value="Database">Database (Data / SQL)</option>
                  <option value="Layers">Layers (Architecture)</option>
                  <option value="Sparkles">Sparkles (AI / Special)</option>
                  <option value="Globe">Globe (Web / Network)</option>
                  <option value="Cpu">Cpu (Hardware / Systems)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white disabled:opacity-50"
                >
                  {isProcessing ? "Creating..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCategoryToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-[#0B1B3D]">
              Confirm Category Deletion
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete the category &quot;{categoryToDelete.name}&quot;?
            </p>

            {(categoryToDelete.coursesCount ?? 0) > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span className="font-bold">Caution: </span> This category currently contains {categoryToDelete.coursesCount} courses.
                You must reassign or remove those courses before deletion can proceed.
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                This category has 0 courses and can be safely removed.
              </p>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing || (categoryToDelete.coursesCount ?? 0) > 0}
                onClick={handleDeleteCategory}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40"
              >
                {isProcessing ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
