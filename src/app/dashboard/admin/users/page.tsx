import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { updateUserRole } from "@/app/actions/learning";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          enrollments: true,
          coursesTaught: true,
          certificates: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Console</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-[#0B1B3D]">
              User Governance & Role Management (RBAC)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Directly inspect, manage roles, and govern permissions stored in the database.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0B1B3D]">
                Registered User Directory ({users.length} Total)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-6">User</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Current Role</th>
                    <th className="py-3 px-6">Stats</th>
                    <th className="py-3 px-6">Joined Date</th>
                    <th className="py-3 px-6 text-right">Update Role (Database Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => {
                    const roleColor = {
                      ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
                      TRAINER: "bg-orange-50 text-orange-700 border-orange-200",
                      STUDENT: "bg-blue-50 text-blue-700 border-blue-200",
                    }[u.role];

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#0B1B3D]">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.headline || "User"}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${roleColor}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[11px] text-slate-500">
                          {u.role === "STUDENT" && `${u._count.enrollments} enrollments, ${u._count.certificates} certs`}
                          {u.role === "TRAINER" && `${u._count.coursesTaught} courses authored`}
                          {u.role === "ADMIN" && "Full System Access"}
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {["STUDENT", "TRAINER", "ADMIN"].map((r) => {
                              if (r === u.role) return null;
                              return (
                                <form key={r} action={updateUserRole.bind(null, u.id, r)}>
                                  <button
                                    type="submit"
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  >
                                    Set {r}
                                  </button>
                                </form>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
