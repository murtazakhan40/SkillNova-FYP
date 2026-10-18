"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  BookOpen, 
  ArrowRight, 
  PlayCircle, 
  CheckCircle2, 
  X
} from "lucide-react";

export interface StudentCourseCardItem {
  id: string;
  progress: number;
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
    };
    instructor: {
      name: string;
      avatar: string | null;
    };
    totalLessons: number;
    completedLessons: number;
    firstLessonId: string | null;
    nextLessonId: string | null;
    nextLessonTitle: string | null;
    nextLessonDuration: string | null;
  };
}

interface StudentActiveCourseworkProps {
  courses: StudentCourseCardItem[];
}

export function StudentActiveCoursework({ courses }: StudentActiveCourseworkProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");

  const counts = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter((c) => c.progress >= 100).length;
    const inProgress = total - completed;
    return { total, inProgress, completed };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.course.title.toLowerCase().includes(q);
        const matchSubtitle = item.course.subtitle?.toLowerCase().includes(q);
        const matchInstructor = item.course.instructor.name.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchInstructor) return false;
      }

      if (statusFilter === "IN_PROGRESS" && item.progress >= 100) return false;
      if (statusFilter === "COMPLETED" && item.progress < 100) return false;

      return true;
    });
  }, [courses, searchQuery, statusFilter]);

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header with Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0B1B3D]">
            Enrolled Curricula & Modules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continue learning your enrolled coursework, view next lessons, and track syllabus progress
          </p>
        </div>

        {/* Filter Pills + Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === "ALL"
                  ? "bg-[#0B1B3D] text-white"
                  : "text-slate-600 hover:text-[#0B1B3D]"
              }`}
            >
              All ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-[#FF6B00] text-white"
                  : "text-slate-600 hover:text-[#0B1B3D]"
              }`}
            >
              In Progress ({counts.inProgress})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === "COMPLETED"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:text-[#0B1B3D]"
              }`}
            >
              Completed ({counts.completed})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter course title..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Enrolled Courses */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((item) => {
            const { course, progress } = item;
            const targetLessonId = course.nextLessonId || course.firstLessonId;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between hover:border-slate-300 transition-colors duration-150 group min-w-0"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {course.category.name}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        progress >= 100
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-orange-50 text-[#FF6B00] border border-orange-200"
                      }`}
                    >
                      {progress >= 100 ? "Completed ✓" : `${progress}% Complete`}
                    </span>
                  </div>

                  {/* Course Title & Subtitle */}
                  <h3 className="text-base font-bold text-[#0B1B3D] group-hover:text-[#FF6B00] transition-colors leading-snug mb-1.5">
                    {course.title}
                  </h3>
                  {course.subtitle && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {course.subtitle}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {course.completedLessons} of {course.totalLessons} Lessons Completed
                      </span>
                      <span className="font-bold text-slate-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-[width] duration-500 ${
                          progress >= 100
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-[#FF6B00] to-amber-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Up Next / Last Lesson Preview Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
                        {progress >= 100 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <PlayCircle className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {progress >= 100 ? "Curriculum Status" : "Up Next in Course"}
                        </span>
                        <span className="text-xs font-semibold text-[#0B1B3D] truncate block">
                          {course.nextLessonTitle || "Interactive Curriculum Material"}
                        </span>
                      </div>
                    </div>
                    {course.nextLessonDuration && (
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {course.nextLessonDuration}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer with Instructor & CTA Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0 overflow-hidden">
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
                    <span className="text-xs font-semibold text-slate-600 truncate">
                      {course.instructor.name}
                    </span>
                  </div>

                  <Link
                    href={
                      targetLessonId
                        ? `/courses/${course.slug}/learn/${targetLessonId}`
                        : `/courses/${course.slug}`
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shrink-0 shadow-2xs"
                  >
                    <span>{progress >= 100 ? "Review Material" : "Continue Learning"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0B1B3D]">No Courses Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-3">
            No enrolled courses match your search or filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="text-xs font-bold text-[#FF6B00] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
