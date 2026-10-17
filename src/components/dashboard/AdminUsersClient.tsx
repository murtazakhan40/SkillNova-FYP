"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X, 
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { updateUserRole } from "@/app/actions/learning";

export interface UserDirectoryItem {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TRAINER" | "ADMIN" | string;
  avatar: string | null;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  createdAt: string;
  enrollmentsCount: number;
  certificatesCount: number;
  coursesTaughtCount: number;
  enrolledCourses: {
    id: string;
    title: string;
    progress: number;
  }[];
}

interface AdminUsersClientProps {
  users: UserDirectoryItem[];
}

export function AdminUsersClient({ users }: AdminUsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "STUDENT" | "TRAINER" | "ADMIN">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected user for inspection drawer
  const [inspectUser, setInspectUser] = useState<UserDirectoryItem | null>(null);

  // Role change confirmation state
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: UserDirectoryItem;
    targetRole: string;
  } | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  // Counts
  const counts = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === "STUDENT").length;
    const trainers = users.filter((u) => u.role === "TRAINER").length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    return { total, students, trainers, admins };
  }, [users]);

  // Filtered
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchHeadline = u.headline?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchHeadline) return false;
      }

      if (roleFilter !== "ALL" && u.role !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    setIsUpdating(true);
    try {
      await updateUserRole(pendingRoleChange.user.id, pendingRoleChange.targetRole);
      setPendingRoleChange(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Role Filter Tabs */}
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
              placeholder="Search by name, email, or title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B00] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setRoleFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === "ALL"
                  ? "bg-[#0B1B3D] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleFilter("STUDENT");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === "STUDENT"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Students ({counts.students})
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleFilter("TRAINER");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === "TRAINER"
                  ? "bg-[#FF6B00] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Trainers ({counts.trainers})
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleFilter("ADMIN");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === "ADMIN"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Admins ({counts.admins})
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span>
            Showing {filteredUsers.length} matching user{filteredUsers.length === 1 ? "" : "s"}
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Platform User Directory (RBAC Engine)</span>
          </h2>
          <span className="text-xs text-slate-400">
            Click &quot;Inspect&quot; to review student course progression
          </span>
        </div>

        {paginatedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">User Account</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Assigned Role</th>
                  <th className="py-3.5 px-6">Academic Activity</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Governance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedUsers.map((u) => {
                  const roleBadgeClass = {
                    ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
                    TRAINER: "bg-orange-50 text-orange-700 border-orange-200",
                    STUDENT: "bg-blue-50 text-blue-700 border-blue-200",
                  }[u.role] || "bg-slate-50 text-slate-700 border-slate-200";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-orange-500/30">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#0B1B3D] text-sm">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {u.headline || "Registered Learner"}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {u.email}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeClass}`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-[11px] text-slate-500">
                        {u.role === "STUDENT" && (
                          <span>
                            {u.enrollmentsCount} Course{u.enrollmentsCount === 1 ? "" : "s"} • {u.certificatesCount} Cert{u.certificatesCount === 1 ? "" : "s"}
                          </span>
                        )}
                        {u.role === "TRAINER" && (
                          <span>{u.coursesTaughtCount} Course{u.coursesTaughtCount === 1 ? "" : "s"} Authored</span>
                        )}
                        {u.role === "ADMIN" && (
                          <span className="text-purple-700 font-bold">Full Platform Authority</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-slate-400 text-[11px]">
                        {u.createdAt}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectUser(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>Inspect</span>
                          </button>

                          {/* Role Selection Dropdown */}
                          <select
                            value={u.role}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              if (newRole !== u.role) {
                                setPendingRoleChange({ user: u, targetRole: newRole });
                              }
                            }}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-hidden"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="TRAINER">TRAINER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No user records match your search criteria.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="font-semibold text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Sensitive Action Confirmation Modal */}
      {pendingRoleChange && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPendingRoleChange(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-[#0B1B3D]">
              Confirm Role Governance Change
            </h3>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to change the role for{" "}
              <span className="font-bold text-[#0B1B3D]">{pendingRoleChange.user.name}</span> from{" "}
              <span className="font-bold text-slate-700">{pendingRoleChange.user.role}</span> to{" "}
              <span className="font-extrabold text-purple-700">{pendingRoleChange.targetRole}</span>?
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 mt-4">
              This action immediately adjusts session capabilities, permissions, and administrative access rights.
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingRoleChange(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmRoleChange}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all disabled:opacity-50"
              >
                {isUpdating ? "Updating Role..." : "Confirm & Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Inspection Drawer */}
      {inspectUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
          onClick={() => setInspectUser(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-extrabold text-[#0B1B3D]">
                    Account Dossier
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Overview */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 ring-2 ring-orange-500/20">
                  {inspectUser.avatar ? (
                    <img src={inspectUser.avatar} alt={inspectUser.name} className="w-full h-full object-cover" />
                  ) : (
                    inspectUser.name.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#0B1B3D]">{inspectUser.name}</h4>
                  <div className="text-xs text-slate-500">{inspectUser.headline || "Registered Member"}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Role: {inspectUser.role}
                  </span>
                </div>
              </div>

              {/* Contact Pills */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{inspectUser.email}</span>
                </div>
                {inspectUser.phone && (
                  <div className="flex items-center gap-2 text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>{inspectUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Account Created: {inspectUser.createdAt}</span>
                </div>
              </div>

              {/* Bio */}
              {inspectUser.bio && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Candidate Biography
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-100">
                    {inspectUser.bio}
                  </p>
                </div>
              )}

              {/* Enrolled Courses & Progress */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Enrolled Course Progress ({inspectUser.enrolledCourses.length})
                </span>

                {inspectUser.enrolledCourses.length > 0 ? (
                  <div className="space-y-2.5">
                    {inspectUser.enrolledCourses.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0B1B3D] truncate">{c.title}</span>
                          <span className="font-extrabold text-[#FF6B00]">{c.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              c.progress >= 100 ? "bg-emerald-500" : "bg-[#FF6B00]"
                            }`}
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No active course enrollments on record.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setInspectUser(null)}
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
