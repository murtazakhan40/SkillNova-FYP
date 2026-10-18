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
  HelpCircle,
  UserCheck,
  Compass,
  X,
  Settings,
  Layers
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface DashboardSidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "TRAINER" | "ADMIN" | string;
    avatar?: string | null;
  };
  onCloseMobile?: () => void;
}

export function DashboardSidebar({ user, onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { label: "Dashboard Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "My Enrolled Courses", href: "/dashboard/student/courses", icon: BookOpen },
    { label: "Quizzes & Assessments", href: "/dashboard/student/quizzes", icon: HelpCircle },
    { label: "My Certificates", href: "/dashboard/student/certificates", icon: Award },
    { label: "Profile & Settings", href: "/dashboard/student/profile", icon: UserCheck },
  ];

  const trainerLinks = [
    { label: "Studio Overview", href: "/dashboard/trainer", icon: LayoutDashboard },
    { label: "Course Management", href: "/dashboard/trainer/courses", icon: BookOpen },
    { label: "Add New Course", href: "/dashboard/trainer/new-course", icon: PlusCircle },
    { label: "Enrolled Students", href: "/dashboard/trainer/students", icon: Users },
    { label: "Assessments & Quizzes", href: "/dashboard/trainer/assessments", icon: HelpCircle },
    { label: "Profile & Settings", href: "/dashboard/trainer/profile", icon: UserCheck },
  ];

  const adminLinks = [
    { label: "Platform Metrics", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Course Moderation", href: "/dashboard/admin/courses", icon: BookOpen },
    { label: "User Governance", href: "/dashboard/admin/users", icon: Users },
    { label: "Enrollment Oversight", href: "/dashboard/admin/enrollments", icon: Layers },
    { label: "Academic Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
    { label: "System Settings", href: "/dashboard/admin/settings", icon: Settings },
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
  }[user.role as "STUDENT" | "TRAINER" | "ADMIN"] || {
    label: "Student Learner",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-64 bg-[#0B1B3D] text-slate-300 h-full max-h-screen flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header - Pinned at top */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div>
          <SkillNovaLogo variant="light" size="sm" />
          <div className="mt-2.5">
            <span
              className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleBadge.color}`}
            >
              {roleBadge.label}
            </span>
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items - Independent Scrollable Area */}
      <nav className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-1.5 custom-sidebar-scrollbar">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {user.role === "ADMIN" ? "Admin Governance" : user.role === "TRAINER" ? "Faculty Studio" : "Academy Navigation"}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                isActive
                  ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/25 font-bold"
                  : "text-slate-300 hover:bg-[#132752] hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        <div className="pt-5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Public Portal
        </div>
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-[#132752] hover:text-white transition-colors"
        >
          <Compass className="w-4 h-4 text-slate-500" />
          <span>Return to Homepage</span>
        </Link>
        <Link
          href="/courses"
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-[#132752] hover:text-white transition-colors"
        >
          <BookOpen className="w-4 h-4 text-slate-500" />
          <span>Browse Full Catalog</span>
        </Link>
        <Link
          href="/verify"
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-[#132752] hover:text-white transition-colors"
        >
          <Award className="w-4 h-4 text-slate-500" />
          <span>Verify Credentials</span>
        </Link>
      </nav>

      {/* User Footer Card & Sign Out - Pinned at bottom */}
      <div className="p-4 border-t border-slate-800 bg-[#060E1E]/80 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden ring-1 ring-orange-500/40">
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
