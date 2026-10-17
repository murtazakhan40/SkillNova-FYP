"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SkillNovaLogo } from "@/components/brand/SkillNovaLogo";
import { 
  BookOpen, 
  Award, 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  BarChart3, 
  LogOut, 
  HelpCircle
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface DashboardSidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "TRAINER" | "ADMIN";
    avatar?: string | null;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "My Enrolled Courses", href: "/dashboard/student/courses", icon: BookOpen },
    { label: "Quizzes & Scores", href: "/dashboard/student/quizzes", icon: HelpCircle },
    { label: "My Certificates", href: "/dashboard/student/certificates", icon: Award },
  ];

  const trainerLinks = [
    { label: "Studio Overview", href: "/dashboard/trainer", icon: LayoutDashboard },
    { label: "Course Management", href: "/dashboard/trainer/courses", icon: BookOpen },
    { label: "Add New Course", href: "/dashboard/trainer/new-course", icon: PlusCircle },
    { label: "Enrolled Students", href: "/dashboard/trainer/students", icon: Users },
  ];

  const adminLinks = [
    { label: "Platform Metrics", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Course Approvals", href: "/dashboard/admin/courses", icon: BookOpen },
    { label: "User Governance", href: "/dashboard/admin/users", icon: Users },
    { label: "Academic Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
  ];

  const links =
    user.role === "ADMIN"
      ? adminLinks
      : user.role === "TRAINER"
      ? trainerLinks
      : studentLinks;

  const roleBadge = {
    STUDENT: { label: "Student Learner", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    TRAINER: { label: "Course Instructor", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    ADMIN: { label: "System Administrator", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  }[user.role];

  return (
    <aside className="w-64 bg-[#0B1B3D] text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <SkillNovaLogo variant="light" size="sm" />
          <div className="mt-3">
            <span
              className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleBadge.color}`}
            >
              {roleBadge.label}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                    : "text-slate-300 hover:bg-[#132752] hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Public Site
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-[#132752] hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/courses"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-[#132752] hover:text-white transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Browse Catalog</span>
          </Link>
        </nav>
      </div>

      {/* User Footer Card & Sign Out */}
      <div className="p-4 border-t border-slate-800 bg-[#060E1E]/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-slate-300 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
