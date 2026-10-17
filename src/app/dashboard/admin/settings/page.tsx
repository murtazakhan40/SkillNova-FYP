import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getAdminNotifications } from "@/lib/notifications";
import { 
  ArrowLeft, 
  Settings, 
  ShieldCheck, 
  Database, 
  Server, 
  Bell, 
  CheckCircle2, 
  Lock,
  Sparkles,
  Save
} from "lucide-react";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const notifications = await getAdminNotifications();

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Console</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Platform Configuration & System Governance
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700">
              <ShieldCheck className="w-3 h-3" />
              <span>System Operations</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Inspect core architectural flags, manage academic term schedules, broadcast announcements, and verify cryptography engine parameters.
          </p>
        </div>

        {/* System Settings Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0B1B3D]">
                SkillNova Academy Institutional Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Global settings applied across student, trainer, and catalog modules
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Production Ready</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#0B1B3D]">Institution Brand Name</label>
              <input
                type="text"
                defaultValue="SkillNova Academy"
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#0B1B3D]">Academic Term Cycle</label>
              <input
                type="text"
                defaultValue="Spring/Fall FYP Evaluation 2026"
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#0B1B3D]">Authentication Engine</label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 space-y-1">
                <div>• Bcrypt Salt Rounds: 10</div>
                <div>• Session Transport: HTTP-Only SameSite Cookie</div>
                <div>• RBAC Gatekeeper: Server-Side Enforced</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#0B1B3D]">Database Architecture</label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 space-y-1">
                <div>• Engine: SQLite 3NF Normalized Schema</div>
                <div>• ORM: Prisma Client 6.x</div>
                <div>• Integrity: Foreign Key Cascades & Indices</div>
              </div>
            </div>
          </div>

          {/* Broadcast Announcement Preview */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#FF6B00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Active Institutional Broadcast Announcement
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Official FYP Evaluator Notice: </span>
                SkillNova digital credentials are authenticated via SHA-256 cryptographic verification.
                Evaluators can inspect full student coursework progression and test live role switching.
              </div>
            </div>
          </div>
        </div>

        {/* Security & Cryptography Spec Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B1B3D]">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>Cryptographic Credential Ledger</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every course completion automatically mints a unique identifier format <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">SN-2026-XXXXXX</code> linked to the public ledger for public authentication.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B1B3D]">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Full-Stack Next.js 16 Runtime</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Server-rendered components with Turbopack compilation ensure zero unauthorized client-side leaks of private student and administrative data.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
