"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  HelpCircle, 
  Clock, 
  ArrowRight,
  MessageSquare
} from "lucide-react";

export interface StudentAssignmentItem {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  isOverdue: boolean;
  daysRemaining: number | null;
  maxScore: number;
  courseTitle: string;
  courseSlug: string;
  submission: {
    id: string;
    status: "SUBMITTED" | "GRADED" | "RESUBMIT_REQUESTED";
    score: number | null;
    feedback: string | null;
    submittedAt: string;
  } | null;
}

export interface StudentQuizResultItem {
  id: string;
  quizId: string;
  quizTitle: string;
  courseTitle: string;
  courseSlug: string;
  score: number;
  passed: boolean;
  passingScore: number;
  date: string;
}

interface StudentAssessmentsDeliverablesProps {
  assignments: StudentAssignmentItem[];
  quizResults: StudentQuizResultItem[];
}

export function StudentAssessmentsDeliverables({
  assignments,
  quizResults,
}: StudentAssessmentsDeliverablesProps) {
  const [activeTab, setActiveTab] = useState<"ASSIGNMENTS" | "QUIZZES">("ASSIGNMENTS");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-[#0B1B3D]">
            Academic Deliverables & Assessment Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track upcoming assignment deadlines, review instructor feedback notes, and inspect quiz results
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("ASSIGNMENTS")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "ASSIGNMENTS"
                ? "bg-white text-[#0B1B3D] shadow-xs"
                : "text-slate-600 hover:text-[#0B1B3D]"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Assignments ({assignments.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("QUIZZES")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "QUIZZES"
                ? "bg-white text-[#0B1B3D] shadow-xs"
                : "text-slate-600 hover:text-[#0B1B3D]"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Quizzes ({quizResults.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Assignments */}
      {activeTab === "ASSIGNMENTS" && (
        <div>
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((item) => {
                const sub = item.submission;
                const isGraded = sub?.status === "GRADED";
                const isResubmit = sub?.status === "RESUBMIT_REQUESTED";
                const isSubmitted = sub?.status === "SUBMITTED";
                const isOverdue = item.isOverdue && !sub;

                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                      isResubmit
                        ? "bg-orange-50/30 border-orange-200"
                        : isOverdue
                        ? "bg-red-50/20 border-red-200"
                        : isGraded
                        ? "bg-emerald-50/20 border-emerald-200"
                        : "bg-slate-50/50 border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            {item.courseTitle}
                          </span>

                          {/* Status Badge */}
                          {isGraded ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Evaluated: {sub.score}/{item.maxScore} pts
                            </span>
                          ) : isResubmit ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-orange-100 text-[#FF6B00] border border-orange-200">
                              Revision Requested
                            </span>
                          ) : isSubmitted ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                              Submitted • Awaiting Review
                            </span>
                          ) : isOverdue ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200">
                              Overdue Deliverable
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              Not Submitted
                            </span>
                          )}

                          {item.dueDate && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Due {item.dueDate}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-[#0B1B3D]">
                          {item.title}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 pt-1">
                        <Link
                          href={`/courses/${item.courseSlug}/learn`}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            isResubmit
                              ? "bg-[#FF6B00] text-white hover:bg-[#EA580C]"
                              : isGraded
                              ? "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                              : isOverdue
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-[#0B1B3D] text-white hover:bg-[#132752]"
                          }`}
                        >
                          <span>{sub ? "View Submission" : "Open Workspace"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Trainer Feedback Callout (if feedback exists) */}
                    {sub?.feedback && (
                      <div className="mt-3.5 p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1B3D]">
                          <MessageSquare className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>Instructor Evaluation Feedback:</span>
                        </div>
                        <p className="text-slate-600 italic pl-5">
                          &ldquo;{sub.feedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No assignments configured for your enrolled courses.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Quizzes */}
      {activeTab === "QUIZZES" && (
        <div>
          {quizResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quizResults.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 truncate">
                        {sub.courseTitle}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.passed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {sub.passed ? "Passed ✓" : "Retake Needed"}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#0B1B3D] pt-1">
                      {sub.quizTitle}
                    </h4>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">Score Achieved:</span>
                      <span className={`font-black ${sub.passed ? "text-emerald-600" : "text-red-600"}`}>
                        {sub.score}% (Passing: {sub.passingScore}%)
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{sub.date}</span>
                    <Link
                      href={`/courses/${sub.courseSlug}/quiz/${sub.quizId}`}
                      className="text-xs font-bold text-[#FF6B00] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{sub.passed ? "Review Questions" : "Retake Quiz"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No quiz attempts submitted yet.</p>
              <Link
                href="/dashboard/student/quizzes"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline"
              >
                <span>Browse Course Quizzes</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
