"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Award, 
  BarChart3, 
  Calendar,
  ExternalLink
} from "lucide-react";

export interface TrainerSubmissionItem {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  quizId: string;
  quizTitle: string;
  courseTitle: string;
  courseSlug: string;
  passingScore: number;
  score: number;
  passed: boolean;
  createdAt: string;
}

interface TrainerAssessmentsClientProps {
  submissions: TrainerSubmissionItem[];
  totalQuizzesCount: number;
}

export function TrainerAssessmentsClient({
  submissions,
  totalQuizzesCount,
}: TrainerAssessmentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PASSED" | "FAILED">("ALL");

  // Summary Metrics
  const stats = useMemo(() => {
    const total = submissions.length;
    const passed = submissions.filter((s) => s.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 100;
    const avgScore =
      total > 0
        ? Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / total)
        : 0;

    return { total, passed, failed, passRate, avgScore };
  }, [submissions]);

  // Filtered
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStudent = s.studentName.toLowerCase().includes(q);
        const matchQuiz = s.quizTitle.toLowerCase().includes(q);
        const matchCourse = s.courseTitle.toLowerCase().includes(q);
        if (!matchStudent && !matchQuiz && !matchCourse) return false;
      }

      if (statusFilter === "PASSED" && !s.passed) return false;
      if (statusFilter === "FAILED" && s.passed) return false;

      return true;
    });
  }, [submissions, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Student Attempts</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0B1B3D]">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across your teaching tracks</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Average Student Score</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">
            {stats.avgScore > 0 ? `${stats.avgScore}%` : "N/A"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Benchmark standard: 70%</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.passRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.passed} passed submissions</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Active Quizzes</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#FF6B00]">{totalQuizzesCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Embedded in curricula</div>
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
            placeholder="Search by student name or quiz title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === "ALL"
                ? "bg-[#0B1B3D] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Attempts ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PASSED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === "PASSED"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Passed ({stats.passed})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("FAILED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === "FAILED"
                ? "bg-red-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Needs Retake ({stats.failed})
          </button>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#FF6B00]" />
            <span>Student Assessment Submissions Ledger</span>
          </h2>
          <span className="text-xs text-slate-400">
            Real-time assessment results from database
          </span>
        </div>

        {filteredSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Learner</th>
                  <th className="py-3.5 px-6">Assessment Title</th>
                  <th className="py-3.5 px-6">Course Track</th>
                  <th className="py-3.5 px-6">Score & Result</th>
                  <th className="py-3.5 px-6">Submitted Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-orange-500/30">
                        {sub.studentAvatar ? (
                          <img src={sub.studentAvatar} alt={sub.studentName} className="w-full h-full object-cover" />
                        ) : (
                          sub.studentName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#0B1B3D] text-sm">{sub.studentName}</div>
                        <div className="text-[10px] text-slate-400">{sub.studentEmail}</div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {sub.quizTitle}
                    </td>

                    <td className="py-4 px-6 text-slate-600 truncate max-w-xs">
                      {sub.courseTitle}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
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
                        <span>{sub.passed ? "Passed" : "Needs Retake"}: {sub.score}%</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400 text-[11px]">
                      {sub.createdAt}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/courses/${sub.courseSlug}/quiz/${sub.quizId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#0B1B3D] transition-colors"
                      >
                        <span>Inspect Quiz</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No assessment submissions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
