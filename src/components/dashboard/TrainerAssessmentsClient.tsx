"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Award, 
  BarChart3, 
  ExternalLink,
  FileCheck,
  Download,
  Edit3,
  Clock,
  Loader2,
  X
} from "lucide-react";
import { gradeAssignmentAction } from "@/app/actions/classroom";

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

export interface TrainerAssignmentSubmissionItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  assignmentId: string;
  assignmentTitle: string;
  courseTitle: string;
  courseSlug: string;
  maxScore: number;
  textContent: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  score: number | null;
  feedback: string | null;
  status: string;
  submittedAt: string;
  gradedAt: string | null;
}

interface TrainerAssessmentsClientProps {
  submissions: TrainerSubmissionItem[];
  assignmentSubmissions: TrainerAssignmentSubmissionItem[];
  totalQuizzesCount: number;
  totalAssignmentsCount: number;
}

export function TrainerAssessmentsClient({
  submissions,
  assignmentSubmissions,
  totalQuizzesCount,
  totalAssignmentsCount,
}: TrainerAssessmentsClientProps) {
  const [activeTab, setActiveTab] = useState<"QUIZZES" | "ASSIGNMENTS">("QUIZZES");
  const [searchQuery, setSearchQuery] = useState("");
  const [quizStatusFilter, setQuizStatusFilter] = useState<"ALL" | "PASSED" | "FAILED">("ALL");
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<"ALL" | "SUBMITTED" | "GRADED">("ALL");

  // Grading Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<TrainerAssignmentSubmissionItem | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>("");
  const [gradeStatus, setGradeStatus] = useState<string>("GRADED");
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Quiz Stats
  const quizStats = useMemo(() => {
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

  // Assignment Stats
  const assignmentStats = useMemo(() => {
    const total = assignmentSubmissions.length;
    const pending = assignmentSubmissions.filter((s) => s.status === "SUBMITTED").length;
    const graded = assignmentSubmissions.filter((s) => s.status === "GRADED").length;
    const gradedList = assignmentSubmissions.filter((s) => s.score !== null);
    const avgScore =
      gradedList.length > 0
        ? Math.round(gradedList.reduce((acc, s) => acc + (s.score || 0), 0) / gradedList.length)
        : 0;

    return { total, pending, graded, avgScore };
  }, [assignmentSubmissions]);

  // Filtered Quizzes
  const filteredQuizzes = useMemo(() => {
    return submissions.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStudent = s.studentName.toLowerCase().includes(q);
        const matchQuiz = s.quizTitle.toLowerCase().includes(q);
        const matchCourse = s.courseTitle.toLowerCase().includes(q);
        if (!matchStudent && !matchQuiz && !matchCourse) return false;
      }

      if (quizStatusFilter === "PASSED" && !s.passed) return false;
      if (quizStatusFilter === "FAILED" && s.passed) return false;

      return true;
    });
  }, [submissions, searchQuery, quizStatusFilter]);

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignmentSubmissions.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStudent = s.studentName.toLowerCase().includes(q);
        const matchAssignment = s.assignmentTitle.toLowerCase().includes(q);
        const matchCourse = s.courseTitle.toLowerCase().includes(q);
        if (!matchStudent && !matchAssignment && !matchCourse) return false;
      }

      if (assignmentStatusFilter === "SUBMITTED" && s.status !== "SUBMITTED") return false;
      if (assignmentStatusFilter === "GRADED" && s.status !== "GRADED") return false;

      return true;
    });
  }, [assignmentSubmissions, searchQuery, assignmentStatusFilter]);

  const openGradingModal = (sub: TrainerAssignmentSubmissionItem) => {
    setSelectedSubmission(sub);
    setGradeScore(sub.score !== null ? sub.score : 85);
    setGradeFeedback(sub.feedback || "");
    setGradeStatus(sub.status === "RESUBMIT_REQUESTED" ? "RESUBMIT_REQUESTED" : "GRADED");
    setGradingError(null);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setGradingError(null);
    const formData = new FormData();
    formData.set("submissionId", selectedSubmission.id);
    formData.set("score", gradeScore.toString());
    formData.set("feedback", gradeFeedback.trim());
    formData.set("status", gradeStatus);

    startTransition(async () => {
      try {
        await gradeAssignmentAction(formData);
        setSelectedSubmission(null);
      } catch (err: unknown) {
        setGradingError(err instanceof Error ? err.message : "Grading evaluation failed.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Assessment Mode Tab Selector */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("QUIZZES")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "QUIZZES"
              ? "bg-[#0B1B3D] text-white shadow-xs"
              : "text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#FF6B00]" />
          <span>Multiple Choice Quizzes ({submissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ASSIGNMENTS")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ASSIGNMENTS"
              ? "bg-[#0B1B3D] text-white shadow-xs"
              : "text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100"
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Project Assignments ({assignmentSubmissions.length})
            {assignmentStats.pending > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold">
                {assignmentStats.pending} New
              </span>
            )}
          </span>
        </button>
      </div>

      {activeTab === "QUIZZES" ? (
        /* QUIZ ASSESSMENTS VIEW */
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
              <div className="text-2xl font-black text-[#0B1B3D]">{quizStats.total}</div>
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
                {quizStats.avgScore > 0 ? `${quizStats.avgScore}%` : "N/A"}
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
              <div className="text-2xl font-black text-emerald-600">{quizStats.passRate}%</div>
              <div className="text-[11px] text-slate-400 mt-1">{quizStats.passed} passed submissions</div>
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

          {/* Filter Bar */}
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
                onClick={() => setQuizStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  quizStatusFilter === "ALL"
                    ? "bg-[#0B1B3D] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Attempts ({quizStats.total})
              </button>
              <button
                type="button"
                onClick={() => setQuizStatusFilter("PASSED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  quizStatusFilter === "PASSED"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Passed ({quizStats.passed})
              </button>
              <button
                type="button"
                onClick={() => setQuizStatusFilter("FAILED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  quizStatusFilter === "FAILED"
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Needs Retake ({quizStats.failed})
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
                Live assessment scoring from database
              </span>
            </div>

            {filteredQuizzes.length > 0 ? (
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
                    {filteredQuizzes.map((sub) => (
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
                <p className="text-xs font-semibold">No assessment attempts found.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PROJECT ASSIGNMENTS VIEW */
        <div className="space-y-6">
          {/* Assignment Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Total Submissions</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#0B1B3D]">{assignmentStats.total}</div>
              <div className="text-[11px] text-slate-400 mt-1">Student project deliveries</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Pending Review</span>
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#FF6B00]">{assignmentStats.pending}</div>
              <div className="text-[11px] text-slate-400 mt-1">Awaiting evaluation</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Graded Deliveries</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-600">{assignmentStats.graded}</div>
              <div className="text-[11px] text-slate-400 mt-1">Evaluated by faculty</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Curriculum Assignments</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-600">{totalAssignmentsCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Published projects</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name or assignment title..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAssignmentStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  assignmentStatusFilter === "ALL"
                    ? "bg-[#0B1B3D] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Projects ({assignmentStats.total})
              </button>
              <button
                type="button"
                onClick={() => setAssignmentStatusFilter("SUBMITTED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  assignmentStatusFilter === "SUBMITTED"
                    ? "bg-[#FF6B00] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Pending Review ({assignmentStats.pending})
              </button>
              <button
                type="button"
                onClick={() => setAssignmentStatusFilter("GRADED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  assignmentStatusFilter === "GRADED"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Graded ({assignmentStats.graded})
              </button>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#FF6B00]" />
                <span>Student Project Submissions & Evaluation Queue</span>
              </h2>
              <span className="text-xs text-slate-400">
                Grade solutions and provide feedback
              </span>
            </div>

            {filteredAssignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Learner</th>
                      <th className="py-3.5 px-6">Assignment Title</th>
                      <th className="py-3.5 px-6">Course Track</th>
                      <th className="py-3.5 px-6">Submission Files</th>
                      <th className="py-3.5 px-6">Status & Grade</th>
                      <th className="py-3.5 px-6">Submitted</th>
                      <th className="py-3.5 px-6 text-right">Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAssignments.map((sub) => (
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
                          {sub.assignmentTitle}
                        </td>

                        <td className="py-4 px-6 text-slate-600 truncate max-w-xs">
                          {sub.courseTitle}
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {sub.fileUrl && (
                              <a
                                href={`/api/courses/${sub.courseSlug}/assignments/${sub.id}/download`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-700 transition-colors"
                                download
                              >
                                <Download className="w-3 h-3" />
                                <span>{sub.fileName || "Project Archive"}</span>
                              </a>
                            )}
                            {sub.textContent && (
                              <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                                {sub.textContent.substring(0, 45)}...
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {sub.status === "GRADED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{sub.score} / {sub.maxScore} Pts</span>
                            </span>
                          ) : sub.status === "RESUBMIT_REQUESTED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Resubmit Requested</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Review</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-slate-400 text-[11px]">
                          {sub.submittedAt}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => openGradingModal(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white transition-all shadow-xs cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{sub.status === "GRADED" ? "Regrade" : "Grade"}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No project submissions match current filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grading & Feedback Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0B1B3D] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  Faculty Evaluation Studio
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Grade & Review: {selectedSubmission.assignmentTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-5">
              {gradingError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {gradingError}
                </div>
              )}

              {/* Student Details */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0B1B3D]">{selectedSubmission.studentName}</span>
                  <span className="text-slate-400 ml-2">({selectedSubmission.studentEmail})</span>
                </div>
                <span className="text-slate-500 font-mono">
                  Submitted: {selectedSubmission.submittedAt}
                </span>
              </div>

              {/* Solution Preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">
                  Student Submission Content & Notes:
                </span>
                {selectedSubmission.textContent ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {selectedSubmission.textContent}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No notes entered by student.</div>
                )}

                {selectedSubmission.fileUrl && (
                  <div className="pt-2">
                    <a
                      href={`/api/courses/${selectedSubmission.courseSlug}/assignments/${selectedSubmission.id}/download`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#EA580C] shadow-xs"
                      download
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Solution File ({selectedSubmission.fileName || "archive.zip"})</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Score Input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Assigned Score (Max: {selectedSubmission.maxScore})
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={selectedSubmission.maxScore}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Evaluation Status
                  </label>
                  <select
                    value={gradeStatus}
                    onChange={(e) => setGradeStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#0B1B3D] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="GRADED">Approved & Graded</option>
                    <option value="RESUBMIT_REQUESTED">Request Resubmission</option>
                  </select>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Trainer Constructive Feedback & Rubric Notes
                </label>
                <textarea
                  rows={4}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Provide feedback on code structure, pattern adherence, and optimization tips..."
                  className="w-full p-3.5 rounded-xl text-xs text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
