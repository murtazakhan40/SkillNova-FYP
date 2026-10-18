"use client";

import React from "react";
import Link from "next/link";
import { 
  PlayCircle, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  FileText, 
  HelpCircle,
  Sparkles,
  BookOpen
} from "lucide-react";

export interface NextActionLesson {
  id: string;
  title: string;
  duration: string;
}

export interface InProgressCourseInfo {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  progress: number;
  categoryName: string;
  instructorName: string;
  nextLesson: NextActionLesson | null;
  totalLessons: number;
  completedLessons: number;
}

export interface UrgentActionInfo {
  type: "FEEDBACK" | "ASSIGNMENT_DUE" | "ASSIGNMENT_OVERDUE" | "QUIZ_RETAKE" | "CLAIM_CERTIFICATE";
  title: string;
  courseTitle: string;
  courseSlug: string;
  message: string;
  score?: number | null;
  maxScore?: number | null;
  dueDate?: string | null;
  link: string;
  actionText: string;
}

interface StudentActionCenterProps {
  inProgressCourse: InProgressCourseInfo | null;
  urgentAction: UrgentActionInfo | null;
}

export function StudentActionCenter({
  inProgressCourse,
  urgentAction,
}: StudentActionCenterProps) {
  if (!inProgressCourse && !urgentAction) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* 1. Continue Learning Hero Card (7 or 12 cols) */}
      <div className={`${urgentAction ? "lg:col-span-7" : "lg:col-span-12"} bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between hover:border-slate-300 transition-colors duration-150`}>
        {inProgressCourse ? (
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] shadow-2xs shrink-0" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Continue Learning • Primary Track
                </h2>
              </div>
              <span className="text-xs font-bold text-[#FF6B00] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                {inProgressCourse.progress}% Completed
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {inProgressCourse.categoryName}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#0B1B3D] mt-2 line-clamp-1">
                  {inProgressCourse.title}
                </h3>
                {inProgressCourse.subtitle && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {inProgressCourse.subtitle}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">
                    Curriculum Progress ({inProgressCourse.completedLessons} of {inProgressCourse.totalLessons} lessons)
                  </span>
                  <span className="font-extrabold text-[#0B1B3D]">
                    {inProgressCourse.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-3 rounded-full transition-[width] duration-500"
                    style={{ width: `${inProgressCourse.progress}%` }}
                  />
                </div>
              </div>

              {/* Next Lesson Box */}
              {inProgressCourse.nextLesson ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Up Next In Curriculum
                      </span>
                      <span className="text-xs font-bold text-[#0B1B3D] truncate block">
                        {inProgressCourse.nextLesson.title}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                    {inProgressCourse.nextLesson.duration}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-800">
                    All video & markdown lessons completed! Proceed to final evaluation.
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">No active in-progress courses.</p>
          </div>
        )}

        {inProgressCourse && (
          <div className="pt-6 border-t border-slate-100 mt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Instructor:{" "}
              <span className="font-bold text-slate-700">
                {inProgressCourse.instructorName}
              </span>
            </span>

            <Link
              href={
                inProgressCourse.nextLesson
                  ? `/courses/${inProgressCourse.slug}/learn/${inProgressCourse.nextLesson.id}`
                  : `/courses/${inProgressCourse.slug}`
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0B1B3D] hover:bg-[#132752] text-white shadow-xs transition-colors"
            >
              <span>{inProgressCourse.progress >= 100 ? "Review Classroom" : "Resume Next Lesson"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. Urgent Action / High-Priority Academic Deliverable Card (5 cols) */}
      {urgentAction && (
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between hover:border-slate-300 transition-colors duration-150">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  urgentAction.type === "ASSIGNMENT_OVERDUE"
                    ? "bg-red-500"
                    : urgentAction.type === "FEEDBACK"
                    ? "bg-emerald-500"
                    : "bg-[#FF6B00]"
                } shadow-2xs shrink-0`} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {urgentAction.type === "FEEDBACK"
                    ? "Instructor Feedback Ready"
                    : urgentAction.type === "ASSIGNMENT_OVERDUE"
                    ? "Action Overdue"
                    : "Action Required"}
                </h2>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                urgentAction.type === "ASSIGNMENT_OVERDUE"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : urgentAction.type === "FEEDBACK"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-orange-50 text-[#FF6B00] border-orange-200"
              }`}>
                {urgentAction.type === "FEEDBACK" ? "Evaluated" : "Upcoming"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  urgentAction.type === "FEEDBACK"
                    ? "bg-emerald-50 text-emerald-600"
                    : urgentAction.type === "ASSIGNMENT_OVERDUE"
                    ? "bg-red-50 text-red-600"
                    : "bg-orange-50 text-[#FF6B00]"
                }`}>
                  {urgentAction.type === "FEEDBACK" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : urgentAction.type === "QUIZ_RETAKE" ? (
                    <HelpCircle className="w-5 h-5" />
                  ) : urgentAction.type === "CLAIM_CERTIFICATE" ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-semibold text-slate-400 block truncate">
                    {urgentAction.courseTitle}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#0B1B3D] leading-snug">
                    {urgentAction.title}
                  </h3>
                </div>
              </div>

              {/* Message / Feedback text */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                {urgentAction.score !== undefined && urgentAction.score !== null && (
                  <div className="flex items-center gap-2 font-bold text-[#0B1B3D] mb-1.5 pb-1.5 border-b border-slate-200">
                    <span>Grade Score:</span>
                    <span className="text-emerald-600 text-sm">{urgentAction.score}/{urgentAction.maxScore ?? 100}</span>
                  </div>
                )}
                <p className="line-clamp-3 italic">
                  &ldquo;{urgentAction.message}&rdquo;
                </p>
                {urgentAction.dueDate && (
                  <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>Due: {urgentAction.dueDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              href={urgentAction.link}
              className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                urgentAction.type === "FEEDBACK"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-[#FF6B00] hover:bg-[#EA580C] text-white"
              }`}
            >
              <span>{urgentAction.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
