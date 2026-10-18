"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  BookOpen, 
  ArrowRight, 
  PlayCircle, 
  CheckCircle2, 
  X,
  ExternalLink
} from "lucide-react";

export interface EnrolledCourseItem {
  id: string;
  progress: number;
  completedAt: string | null;
  updatedAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    thumbnail: string | null;
    level: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    instructor: {
      name: string;
      avatar: string | null;
      headline: string | null;
    };
    totalLessons: number;
    completedLessons: number;
    firstLessonId: string | null;
    nextLessonId: string | null;
  };
}

interface StudentCoursesClientProps {
  initialCourses: EnrolledCourseItem[];
}

export function StudentCoursesClient({ initialCourses }: StudentCoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "PROGRESS" | "TITLE">("RECENT");

  // Extract unique categories
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    initialCourses.forEach((c) => {
      map.set(c.course.category.id, c.course.category.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [initialCourses]);

  // Counts
  const counts = useMemo(() => {
    const total = initialCourses.length;
    const completed = initialCourses.filter((c) => c.progress >= 100).length;
    const inProgress = total - completed;
    return { total, inProgress, completed };
  }, [initialCourses]);

  // Filter & Sort
  const filteredCourses = useMemo(() => {
    return initialCourses
      .filter((item) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.course.title.toLowerCase().includes(q);
          const matchSubtitle = item.course.subtitle?.toLowerCase().includes(q);
          const matchInstructor = item.course.instructor.name.toLowerCase().includes(q);
          if (!matchTitle && !matchSubtitle && !matchInstructor) return false;
        }

        // Status
        if (statusFilter === "IN_PROGRESS" && item.progress >= 100) return false;
        if (statusFilter === "COMPLETED" && item.progress < 100) return false;

        // Category
        if (categoryFilter !== "ALL" && item.course.category.id !== categoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "PROGRESS") {
          return b.progress - a.progress;
        }
        if (sortBy === "TITLE") {
          return a.course.title.localeCompare(b.course.title);
        }
        // RECENT
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [initialCourses, searchQuery, statusFilter, categoryFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setSortBy("RECENT");
  };

  if (initialCourses.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#0B1B3D]">
          You Haven&apos;t Enrolled in Any Courses Yet
        </h2>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          SkillNova offers comprehensive technical curricula in web engineering, distributed systems,
          deep learning, and cloud architectures.
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/25 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Full Course Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls: Search, Status Tabs, Category & Sort */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top row: Search input + Category & Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course title, topic, or instructor..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters: Category & Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="pl-8 pr-7 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:border-[#FF6B00] transition-colors"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort courses"
                className="pl-8 pr-7 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:border-[#FF6B00] transition-colors"
              >
                <option value="RECENT">Sort: Most Recent</option>
                <option value="PROGRESS">Sort: Highest Progress</option>
                <option value="TITLE">Sort: Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom row: Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "ALL"
                  ? "bg-[#0B1B3D] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Courses ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-[#FF6B00] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              In Progress ({counts.inProgress})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "COMPLETED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Completed ({counts.completed})
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Showing <span className="font-bold text-slate-700">{filteredCourses.length}</span> of{" "}
            {initialCourses.length} enrolled courses
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((item) => {
            const { course, progress } = item;
            const targetLessonId = course.nextLessonId || course.firstLessonId;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-colors duration-150 flex flex-col justify-between overflow-hidden group min-w-0"
              >
                <div>
                  {/* Thumbnail / Header Area */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0B1B3D] to-[#1E3A8A] flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category & Status Pill on top of image */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[#0B1B3D] shadow-xs">
                        {course.category.name}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs ${
                          progress >= 100
                            ? "bg-emerald-500 text-white"
                            : "bg-[#FF6B00] text-white"
                        }`}
                      >
                        {progress >= 100 ? "Completed ✓" : `${progress}%`}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="w-3.5 h-3.5 text-orange-400" />
                        <span>{course.totalLessons} Lessons</span>
                      </span>
                      <span>{course.level}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-[#0B1B3D] group-hover:text-[#FF6B00] transition-colors leading-snug line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.subtitle}
                    </p>

                    {/* Progress Bar & Lesson Count */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          {course.completedLessons} of {course.totalLessons} Completed
                        </span>
                        <span className="font-bold text-[#0B1B3D]">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            progress >= 100
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-[#FF6B00] to-amber-400"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Instructor & Action Buttons */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0 overflow-hidden">
                        {course.instructor.avatar ? (
                          <img
                            src={course.instructor.avatar}
                            alt={course.instructor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          course.instructor.name.charAt(0)
                        )}
                      </div>
                      <span className="text-xs text-slate-600 truncate">
                        {course.instructor.name}
                      </span>
                    </div>

                    <Link
                      href={`/courses/${course.slug}`}
                      className="text-[11px] font-semibold text-slate-500 hover:text-[#0B1B3D] inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Syllabus</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>

                  {/* Primary CTA */}
                  <Link
                    href={
                      targetLessonId
                        ? `/courses/${course.slug}/learn/${targetLessonId}`
                        : `/courses/${course.slug}`
                    }
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      progress >= 100
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-orange-500/20"
                    }`}
                  >
                    <span>
                      {progress >= 100 ? "Review Classroom" : "Continue Learning"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0B1B3D]">No Courses Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            No enrolled courses match your current search and filter settings.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
