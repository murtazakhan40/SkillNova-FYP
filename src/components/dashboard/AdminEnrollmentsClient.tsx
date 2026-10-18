"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Layers, 
  Search, 
  Filter, 
  UserCheck, 
  BookOpen, 
  Trash2, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { 
  adminEnrollStudentAction, 
  adminRevokeEnrollmentAction 
} from "@/app/actions/admin";
import { formatPrice } from "@/lib/utils";

export interface AdminEnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  coursePrice: number;
  categoryName: string;
  progress: number;
  completedAt: string | null;
  createdAt: string;
}

export interface StudentOption {
  id: string;
  name: string;
  email: string;
}

export interface CourseOption {
  id: string;
  title: string;
  price: number;
}

interface AdminEnrollmentsClientProps {
  enrollments: AdminEnrollmentRecord[];
  students: StudentOption[];
  courses: CourseOption[];
}

export function AdminEnrollmentsClient({
  enrollments,
  students,
  courses,
}: AdminEnrollmentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Manual enrollment modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualStudent, setManualStudent] = useState("");
  const [manualCourse, setManualCourse] = useState("");

  // Revoke confirmation modal
  const [revokeTarget, setRevokeTarget] = useState<AdminEnrollmentRecord | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = enrollments.length;
    const completed = enrollments.filter((e) => e.progress >= 100).length;
    const inProgress = total - completed;
    const avgProgress =
      total > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / total)
        : 0;
    return { total, completed, inProgress, avgProgress };
  }, [enrollments]);

  // Filtered
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStudent = e.studentName.toLowerCase().includes(q) || e.studentEmail.toLowerCase().includes(q);
        const matchCourse = e.courseTitle.toLowerCase().includes(q);
        if (!matchStudent && !matchCourse) return false;
      }

      if (courseFilter !== "ALL" && e.courseId !== courseFilter) {
        return false;
      }

      if (statusFilter === "COMPLETED" && e.progress < 100) return false;
      if (statusFilter === "IN_PROGRESS" && e.progress >= 100) return false;

      return true;
    });
  }, [enrollments, searchQuery, courseFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEnrollments.length / pageSize) || 1;
  const paginatedEnrollments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEnrollments.slice(start, start + pageSize);
  }, [filteredEnrollments, currentPage]);

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudent || !manualCourse) return;

    setIsProcessing(true);
    setToast(null);
    try {
      await adminEnrollStudentAction(manualStudent, manualCourse);
      setToast({
        type: "success",
        message: "Successfully granted student enrollment access.",
      });
      setIsManualModalOpen(false);
      setManualStudent("");
      setManualCourse("");
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to grant enrollment.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;

    setIsProcessing(true);
    setToast(null);
    try {
      await adminRevokeEnrollmentAction(revokeTarget.id, revokeReason);
      setToast({
        type: "success",
        message: `Revoked enrollment for ${revokeTarget.studentName} from "${revokeTarget.courseTitle}".`,
      });
      setRevokeTarget(null);
      setRevokeReason("");
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to revoke enrollment.",
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

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-1">Total Enrolled Records</div>
          <div className="text-2xl font-black text-[#0B1B3D]">{metrics.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across catalog tracks</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-1">In Progress Learners</div>
          <div className="text-2xl font-black text-indigo-600">{metrics.inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active curriculum progression</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-1">Completed Graduates</div>
          <div className="text-2xl font-black text-emerald-600">{metrics.completed}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">100% course completion</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-1">Average Progress</div>
          <div className="text-2xl font-black text-[#FF6B00]">{metrics.avgProgress}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Institutional learning velocity</div>
        </div>
      </div>

      {/* Filter and Action Header */}
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
              placeholder="Search by student name, email, or course..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-7 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Courses ({courses.length})</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Manual Student Enrollment</span>
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
              All Enrollments ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("IN_PROGRESS");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              In Progress ({metrics.inProgress})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("COMPLETED");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "COMPLETED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Completed ({metrics.completed})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Showing <span className="font-bold text-slate-700">{filteredEnrollments.length}</span> of {enrollments.length} records
          </span>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {paginatedEnrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course Track</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Course Progress</th>
                  <th className="py-3.5 px-4">Enrolled Date</th>
                  <th className="py-3.5 px-4 text-right">Oversight Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEnrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {enr.studentAvatar ? (
                            <img src={enr.studentAvatar} alt={enr.studentName} className="w-full h-full object-cover" />
                          ) : (
                            enr.studentName.charAt(0)
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-[#0B1B3D] truncate">{enr.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">{enr.studentEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-[#0B1B3D] truncate">{enr.courseTitle}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tuition: {formatPrice(enr.coursePrice)}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-100">
                        {enr.categoryName}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">{Math.round(enr.progress)}%</span>
                          {enr.progress >= 100 && (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5 text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              enr.progress >= 100 ? "bg-emerald-500" : "bg-[#FF6B00]"
                            }`}
                            style={{ width: `${Math.max(4, enr.progress)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Enrolled Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {enr.createdAt}
                    </td>

                    {/* Revoke Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setRevokeTarget(enr)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                        title="Revoke student course enrollment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No enrollment records match your search criteria.</p>
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

      {/* Manual Student Enrollment Modal */}
      {isManualModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsManualModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-sm font-extrabold text-[#0B1B3D]">
                  Manual Student Course Enrollment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualEnroll} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#0B1B3D]">Select Student *</label>
                <select
                  required
                  value={manualStudent}
                  onChange={(e) => setManualStudent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B00] bg-white cursor-pointer"
                >
                  <option value="">-- Choose student learner --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Or enter student email or UUID in manual text input if needed.
                </p>
                <input
                  type="text"
                  placeholder="Or enter student email / ID..."
                  value={manualStudent}
                  onChange={(e) => setManualStudent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B00] mt-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0B1B3D]">Select Course Track *</label>
                <select
                  required
                  value={manualCourse}
                  onChange={(e) => setManualCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B00] bg-white cursor-pointer"
                >
                  <option value="">-- Choose curriculum track --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({formatPrice(c.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
                <span className="font-bold">Administrative Access Grant: </span>
                This immediately enrolls the student into the course with 0% baseline progress, bypassing sandbox checkout fees.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !manualStudent || !manualCourse}
                  className="px-5 py-2 rounded-xl font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white disabled:opacity-50 transition-all"
                >
                  {isProcessing ? "Granting Access..." : "Grant Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Enrollment Confirmation Dialog */}
      {revokeTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRevokeTarget(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-[#0B1B3D]">
              Confirm Enrollment Revocation
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to revoke{" "}
              <span className="font-bold text-[#0B1B3D]">{revokeTarget.studentName}</span>&apos;s enrollment
              from the course &quot;{revokeTarget.courseTitle}&quot;?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reason for Revocation</label>
              <input
                type="text"
                placeholder="e.g. Refund request, cohort cancellation, policy violation..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 leading-relaxed">
              <span className="font-bold">Warning: </span> The student will lose access to course lessons, quizzes, and resources. An audit log will be permanently stored on the administrative ledger.
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmRevoke}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40"
              >
                {isProcessing ? "Revoking..." : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
