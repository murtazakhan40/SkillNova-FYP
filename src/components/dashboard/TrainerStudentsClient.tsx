"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Eye, 
  X, 
  Mail, 
  Phone, 
  Calendar 
} from "lucide-react";

export interface TrainerStudentRosterItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  studentHeadline: string | null;
  studentPhone: string | null;
  studentBio: string | null;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
  hasCertificate: boolean;
}

interface TrainerStudentsClientProps {
  students: TrainerStudentRosterItem[];
  courses: { id: string; title: string }[];
}

export function TrainerStudentsClient({
  students,
  courses,
}: TrainerStudentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [inspectStudent, setInspectStudent] = useState<TrainerStudentRosterItem | null>(null);

  // Counts
  const counts = useMemo(() => {
    const total = students.length;
    const completed = students.filter((s) => s.progress >= 100).length;
    const inProgress = total - completed;
    return { total, completed, inProgress };
  }, [students]);

  // Filtered
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.studentName.toLowerCase().includes(q);
        const matchEmail = s.studentEmail.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }

      if (courseFilter !== "ALL" && s.courseId !== courseFilter) {
        return false;
      }

      if (statusFilter === "IN_PROGRESS" && s.progress >= 100) return false;
      if (statusFilter === "COMPLETED" && s.progress < 100) return false;

      return true;
    });
  }, [students, searchQuery, courseFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Controls: Search, Course Filter, Status Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search enrolled students by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden"
            >
              <option value="ALL">All Authored Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
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
              All Students ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "COMPLETED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Certified (100%) ({counts.completed})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Showing <span className="font-bold text-slate-700">{filteredStudents.length}</span> student record{filteredStudents.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FF6B00]" />
            <span>Enrolled Students Progression Ledger</span>
          </h2>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Learner</th>
                  <th className="py-3.5 px-6">Enrolled Course</th>
                  <th className="py-3.5 px-6">Enrolled Date</th>
                  <th className="py-3.5 px-6">Curriculum Progress</th>
                  <th className="py-3.5 px-6">Credential Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-orange-500/30">
                        {s.studentAvatar ? (
                          <img src={s.studentAvatar} alt={s.studentName} className="w-full h-full object-cover" />
                        ) : (
                          s.studentName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#0B1B3D] text-sm">{s.studentName}</div>
                        <div className="text-[10px] text-slate-400">{s.studentEmail}</div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-700 max-w-xs truncate">
                      {s.courseTitle}
                    </td>

                    <td className="py-4 px-6 text-slate-400 text-[11px]">
                      {s.enrolledAt}
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#FF6B00]">
                          <span>{s.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              s.progress >= 100
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-[#FF6B00] to-amber-400"
                            }`}
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {s.hasCertificate ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Certified</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          In Progress
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectStudent(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No students match your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal Drawer */}
      {inspectStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
          onClick={() => setInspectStudent(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="text-sm font-extrabold text-[#0B1B3D]">
                    Student Progress Dossier
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Header Profile */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 ring-2 ring-orange-500/20">
                  {inspectStudent.studentAvatar ? (
                    <img src={inspectStudent.studentAvatar} alt={inspectStudent.studentName} className="w-full h-full object-cover" />
                  ) : (
                    inspectStudent.studentName.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#0B1B3D]">{inspectStudent.studentName}</h4>
                  <div className="text-xs text-slate-500">{inspectStudent.studentHeadline || "Enrolled Scholar"}</div>
                </div>
              </div>

              {/* Course & Progress Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Enrolled Course
                </span>
                <div className="text-sm font-bold text-[#0B1B3D]">
                  {inspectStudent.courseTitle}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Curriculum Progress</span>
                    <span className="font-extrabold text-[#FF6B00]">{inspectStudent.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        inspectStudent.progress >= 100 ? "bg-emerald-500" : "bg-[#FF6B00]"
                      }`}
                      style={{ width: `${inspectStudent.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Enrolled: {inspectStudent.enrolledAt}</span>
                  {inspectStudent.hasCertificate ? (
                    <span className="font-bold text-emerald-600">Certified Graduate ✓</span>
                  ) : (
                    <span className="text-slate-400">In Progress</span>
                  )}
                </div>
              </div>

              {/* Bio & Details */}
              {inspectStudent.studentBio && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Student Bio
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-100">
                    {inspectStudent.studentBio}
                  </p>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{inspectStudent.studentEmail}</span>
                </div>
                {inspectStudent.studentPhone && (
                  <div className="flex items-center gap-2 text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>{inspectStudent.studentPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
