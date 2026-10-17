"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Search, 
  Award, 
  BarChart3,
  Calendar,
  AlertCircle
} from "lucide-react";

export interface QuizItem {
  id: string;
  title: string;
  passingScore: number;
  questionCount: number;
  courseTitle: string;
  courseSlug: string;
  categoryName: string;
  lastSubmission: {
    id: string;
    score: number;
    passed: boolean;
    createdAt: string;
  } | null;
}

interface StudentQuizzesClientProps {
  quizzes: QuizItem[];
}

export function StudentQuizzesClient({ quizzes }: StudentQuizzesClientProps) {
  const [filter, setFilter] = useState<"ALL" | "PASSED" | "PENDING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Metrics
  const stats = useMemo(() => {
    const total = quizzes.length;
    const attempted = quizzes.filter((q) => q.lastSubmission !== null);
    const passed = quizzes.filter((q) => q.lastSubmission?.passed).length;
    const pending = total - passed;

    const scores = attempted.map((q) => q.lastSubmission!.score);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    return { total, passed, pending, avgScore };
  }, [quizzes]);

  // Filtered
  const filtered = useMemo(() => {
    return quizzes.filter((q) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchCourse = q.courseTitle.toLowerCase().includes(query);
        if (!matchTitle && !matchCourse) return false;
      }

      if (filter === "PASSED") {
        return q.lastSubmission?.passed === true;
      }
      if (filter === "PENDING") {
        return !q.lastSubmission || !q.lastSubmission.passed;
      }
      return true;
    });
  }, [quizzes, filter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Average Score</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">
            {stats.avgScore > 0 ? `${stats.avgScore}%` : "N/A"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {stats.passed} passed assessment{stats.passed === 1 ? "" : "s"}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Passed Benchmarks</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.passed}</div>
          <div className="text-[11px] text-slate-400 mt-1">Qualified for credentials</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Pending Assessments</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting completion</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Total Assessments</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0B1B3D]">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Enrolled track curricula</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title or course..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === "ALL"
                ? "bg-[#0B1B3D] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilter("PASSED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === "PASSED"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Passed ({stats.passed})
          </button>
          <button
            type="button"
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === "PENDING"
                ? "bg-[#FF6B00] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Pending ({stats.pending})
          </button>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#FF6B00]" />
            <span>Course Assessments & Quizzes</span>
          </h2>
          <span className="text-xs text-slate-400">
            Passing benchmark: 70% minimum score
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Assessment Title</th>
                  <th className="py-3.5 px-6">Associated Course</th>
                  <th className="py-3.5 px-6">Passing Score</th>
                  <th className="py-3.5 px-6">Latest Result</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((q) => {
                  const sub = q.lastSubmission;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#0B1B3D] text-sm">{q.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {q.questionCount} Questions • Multiple Choice
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 block w-max mb-1">
                          {q.categoryName}
                        </span>
                        <div className="font-semibold text-slate-700 truncate max-w-xs">
                          {q.courseTitle}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-700">
                        {q.passingScore}%
                      </td>
                      <td className="py-4 px-6">
                        {sub ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                sub.passed
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {sub.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {sub.passed ? "Passed" : "Needs Retake"}: {sub.score}%
                              </span>
                            </span>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Attempted {sub.createdAt}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3" />
                            <span>Not Attempted</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/courses/${q.courseSlug}/quiz/${q.id}`}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            sub?.passed
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-orange-500/20"
                          }`}
                        >
                          <span>{sub ? "Retake Quiz" : "Take Quiz"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No quizzes found matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
