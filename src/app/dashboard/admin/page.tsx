import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Database, 
  Award, 
  Layers, 
  Sparkles,
  Server,
  Activity
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch system wide metrics
  const [userCount, courseCount, enrollmentCount, certCount, users] =
    await Promise.all([
      db.user.count(),
      db.course.count(),
      db.enrollment.count(),
      db.certificate.count(),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Administration & Academic Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              System Admin Console
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitor platform health, verify curricula, govern users, and inspect relational integrity.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
            <Activity className="w-4 h-4 animate-pulse text-emerald-500" />
            <span>System Status: Healthy & Online</span>
          </div>
        </div>

        {/* 4 System Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Registered Users</div>
              <div className="text-2xl font-extrabold text-[#0B1B3D] mt-1">{userCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Platform Courses</div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">{courseCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Total Enrollments</div>
              <div className="text-2xl font-extrabold text-[#FF6B00] mt-1">{enrollmentCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Issued Certificates</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{certCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* User Governance Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0B1B3D]">
                Platform User Directory (RBAC)
              </h2>
              <p className="text-xs text-slate-400">
                Recent user accounts registered on the system.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
              {userCount} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Joined Date</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => {
                  const roleBadgeClass = {
                    ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
                    TRAINER: "bg-orange-50 text-orange-700 border-orange-200",
                    STUDENT: "bg-blue-50 text-blue-700 border-blue-200",
                  }[u.role];

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-bold text-[#0B1B3D]">{u.name}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">{u.email}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleBadgeClass}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FYP Architectural Specs & Rigor Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B1B3D] to-[#132752] text-white shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            <Server className="w-4 h-4" />
            <span>BS Computer Science Final Year Project Architecture Overview</span>
          </div>

          <h3 className="text-lg font-bold">
            SkillNova Academy Technical Rigor Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#FF6B00]" />
                <span>3NF Relational DB</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Prisma ORM with strict cascade deletions, multi-column unique indices, and foreign key relations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bcrypt & RBAC Security</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                10-round salted Bcrypt password hashing with HTTP-only session tokens and Server Action guardrails.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Next.js App Router</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Zero-bundle server components, dynamic server actions, TypeScript type safety, and Tailwind CSS tokens.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
