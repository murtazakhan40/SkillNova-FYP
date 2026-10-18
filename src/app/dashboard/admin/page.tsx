import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getAdminNotifications } from "@/lib/notifications";
import { getAdminAnalytics } from "@/lib/dashboard-analytics";
import { WeeklyActivityCard } from "@/components/dashboard/WeeklyActivityCard";
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Database, 
  Award, 
  Layers, 
  Sparkles,
  Server,
  Activity,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Settings,
  DollarSign,
  Bell,
  Clock,
  Radio,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect(user ? "/dashboard/student" : "/login");
  }

  // Fetch live system aggregates and analytics in parallel
  const [
    notifications,
    analytics,
    recentUsers,
    popularCourses,
  ] = await Promise.all([
    getAdminNotifications(),
    getAdminAnalytics(),
    db.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    db.course.findMany({
      include: {
        instructor: true,
        category: true,
        enrollments: true,
      },
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
      take: 5,
    }),
  ]);

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#132752] to-[#0B1B3D] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-[11px] font-bold text-purple-300">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>SkillNova Academy • Institutional Administration Console</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                System Governance & Platform Metrics
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Centralized control plane for user governance, course approval workflows,
                cryptographic credential inspection, and relational database health.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-slate-200">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Relational 3NF Engine Operational</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-slate-200">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{analytics.totalUsers} Accounts Synchronized</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BS Computer Science FYP</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                href="/dashboard/admin/users"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-102"
              >
                <Users className="w-4 h-4" />
                <span>Manage Users (RBAC)</span>
              </Link>
              <Link
                href="/dashboard/admin/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
              >
                <BookOpen className="w-4 h-4 text-purple-300" />
                <span>Moderate Courses</span>
              </Link>
              <Link
                href="/dashboard/admin/enrollments"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
              >
                <Layers className="w-4 h-4 text-emerald-300" />
                <span>Enrollment Oversight</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 6 Core Metric Cards + Revenue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {/* 1. Students */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Students</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#0B1B3D]">{analytics.studentCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Enrolled learners</div>
          </div>

          {/* 2. Trainers */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Trainers</span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#FF6B00]">{analytics.trainerCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Faculty authors</div>
          </div>

          {/* 3. Platform Courses */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Curricula</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-600">{analytics.courseCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {analytics.publishedCourseCount} active • {analytics.draftCourseCount} drafts
            </div>
          </div>

          {/* 4. Total Enrollments */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Enrollments</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-indigo-600">{analytics.enrollmentCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">{analytics.inProgressEnrollments} in progress</div>
          </div>

          {/* 5. Completion Rate */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Completion</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600">{analytics.completionRate}%</div>
            <div className="text-[11px] text-slate-400 mt-1">{analytics.completedEnrollmentCount} completed</div>
          </div>

          {/* 6. Issued Certificates */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Certificates</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600">{analytics.certCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Verified on ledger</div>
          </div>

          {/* 7. Platform Revenue */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Tuition Volume</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-teal-700 truncate">
              {formatPrice(analytics.totalRevenue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Canonical gross</div>
          </div>
        </div>

        {/* Platform 7-Day Activity Chart + Quick Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8">
            <WeeklyActivityCard
              activity={analytics.weeklyActivity}
              totalActionsThisWeek={analytics.totalActionsThisWeek}
            />
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-sm font-bold text-[#0B1B3D]">Administrative Console Shortcuts</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Direct access to high-priority platform workflows, governance actions, and moderation queues.
              </p>

              <div className="space-y-2.5">
                <Link
                  href="/dashboard/admin/users"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#0B1B3D] group-hover:text-blue-700">
                      User & Role Management
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/dashboard/admin/courses"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#0B1B3D] group-hover:text-purple-700">
                      Courses & Category Moderation
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/dashboard/admin/enrollments"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#0B1B3D] group-hover:text-emerald-700">
                      Student Enrollment Oversight
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/dashboard/admin/settings"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center font-bold text-xs">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#0B1B3D] group-hover:text-[#FF6B00]">
                      Broadcast System Announcement
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
              <span>RBAC Authority: Level 3 (Root)</span>
              <span className="font-mono text-emerald-600 font-bold">Encrypted Session</span>
            </div>
          </div>
        </div>

        {/* Live System Activity Feed (Genuine Real-Time Stream) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Live Platform Operations & Activity Stream</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time operational audit log aggregating enrollments, submissions, certificates, and system updates
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real Database Stream</span>
            </span>
          </div>

          {analytics.recentActivity.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No recent platform activity logged yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {analytics.recentActivity.map((event) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${event.badge.color}`}>
                        {event.badge.label}
                      </span>
                      <span className="font-bold text-[#0B1B3D] truncate">{event.title}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed truncate">
                      {event.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>{event.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Popularity Leaderboard + User Directory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Course Popularity Leaderboard (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
                    <span>Course Popularity & Enrollment Distribution</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time enrollment tallies derived from relational database records
                  </p>
                </div>
                <Link
                  href="/dashboard/admin/courses"
                  className="text-xs font-bold text-[#FF6B00] hover:underline"
                >
                  View All ({analytics.courseCount})
                </Link>
              </div>

              <div className="space-y-3.5">
                {popularCourses.map((c, index) => {
                  const percentOfTotal = analytics.enrollmentCount > 0
                    ? Math.round((c.enrollments.length / analytics.enrollmentCount) * 100)
                    : 0;

                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-[#0B1B3D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-bold text-[#0B1B3D] truncate">
                            {c.title}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-[#FF6B00] shrink-0">
                          {c.enrollments.length} Student{c.enrollments.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                        <span>Instructor: {c.instructor.name}</span>
                        <span>{formatPrice(c.price)} • {c.category.name}</span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-1.5 rounded-full"
                          style={{ width: `${Math.max(10, percentOfTotal)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between text-xs text-slate-500">
              <span>Platform catalog active & monitored</span>
              <Link
                href="/dashboard/admin/reports"
                className="font-bold text-slate-700 hover:text-[#0B1B3D] inline-flex items-center gap-1"
              >
                <span>Academic Reporting</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
              </Link>
            </div>
          </div>

          {/* Recent Registrations (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Recent Account Registrations</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latest student, trainer, and administrator accounts
                  </p>
                </div>
                <Link
                  href="/dashboard/admin/users"
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  Manage Users
                </Link>
              </div>

              <div className="space-y-3">
                {recentUsers.map((u) => {
                  const roleBadgeClass = {
                    ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
                    TRAINER: "bg-orange-50 text-orange-700 border-orange-200",
                    STUDENT: "bg-blue-50 text-blue-700 border-blue-200",
                  }[u.role];

                  return (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-[#0B1B3D] truncate">{u.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleBadgeClass}`}>
                          {u.role}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatDate(u.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between text-xs text-slate-500">
              <span>RBAC Security Enforced</span>
              <Link
                href="/dashboard/admin/users"
                className="font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
              >
                <span>User Governance Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Technical Architecture & FYP Rigor Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B1B3D] to-[#132752] text-white shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            <Server className="w-4 h-4" />
            <span>BS Computer Science Final Year Project Architecture Overview</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold">
            SkillNova Academy Technical Rigor Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#FF6B00]" />
                <span>3NF Relational DB</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Prisma ORM with strict cascade deletions, multi-column unique indices, and foreign key relations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bcrypt & RBAC Security</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                10-round salted Bcrypt password hashing with HTTP-only session tokens and Server Action guardrails.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Next.js App Router</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Zero-bundle server components, dynamic server actions, TypeScript type safety, and Tailwind CSS tokens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
