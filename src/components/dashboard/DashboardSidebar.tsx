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
  HelpCircle,
  UserCheck,
  Compass,
  X,
  Settings,
  Layers,
  Bell
} from "lucide-react";

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

  // 2-Letter Initials for yellow circle
  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || user.name.slice(0, 2).toUpperCase();

  // Role-specific Navigation Groups
  const studentLinks = [
    { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "Programs", href: "/dashboard/student/courses", icon: BookOpen },
    { label: "My applications", href: "/dashboard/student/quizzes", icon: HelpCircle },
    { label: "Certificates", href: "/dashboard/student/certificates", icon: Award },
  ];

  const trainerLinks = [
    { label: "Dashboard", href: "/dashboard/trainer", icon: LayoutDashboard },
    { label: "Programs", href: "/dashboard/trainer/courses", icon: BookOpen },
    { label: "Add New Course", href: "/dashboard/trainer/new-course", icon: PlusCircle },
    { label: "Enrolled Students", href: "/dashboard/trainer/students", icon: Users },
    { label: "Assessments & Quizzes", href: "/dashboard/trainer/assessments", icon: HelpCircle },
  ];

  const adminLinks = [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Course Moderation", href: "/dashboard/admin/courses", icon: BookOpen },
    { label: "User Governance", href: "/dashboard/admin/users", icon: Users },
    { label: "Enrollment Oversight", href: "/dashboard/admin/enrollments", icon: Layers },
    { label: "Academic Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
  ];

  const roleTitle = {
    STUDENT: "APPLICANT PORTAL",
    TRAINER: "TRAINER STUDIO",
    ADMIN: "ADMIN GOVERNANCE",
  }[user.role as "STUDENT" | "TRAINER" | "ADMIN"] || "APPLICANT PORTAL";

  const sectionTitle = {
    STUDENT: "ADMISSIONS",
    TRAINER: "CURRICULUM",
    ADMIN: "GOVERNANCE",
  }[user.role as "STUDENT" | "TRAINER" | "ADMIN"] || "ADMISSIONS";

  const accountHref =
    user.role === "ADMIN"
      ? "/dashboard/admin/settings"
      : user.role === "TRAINER"
      ? "/dashboard/trainer/profile"
      : "/dashboard/student/profile";

  const links =
    user.role === "ADMIN"
      ? adminLinks
      : user.role === "TRAINER"
      ? trainerLinks
      : studentLinks;

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-64 bg-[#0B1B3D] text-slate-300 h-full max-h-screen flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div>
          <SkillNovaLogo variant="light" size="sm" />
          <div className="mt-2">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              {roleTitle}
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

      {/* Scrollable Navigation Area */}
      <nav className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-1 custom-sidebar-scrollbar">
        {/* Main Section Header */}
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
          {sectionTitle}
        </div>

        {/* Primary Links */}
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-[#132752] text-white border-l-4 border-amber-400 shadow-xs font-bold"
                  : "text-slate-300 hover:bg-[#132752]/60 hover:text-white"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-amber-400" : "text-slate-400"
                }`}
              />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* MY ACCOUNT Section */}
        <div className="pt-5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
          MY ACCOUNT
        </div>

        <Link
          href={accountHref}
          onClick={handleLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
            pathname === accountHref
              ? "bg-[#132752] text-white border-l-4 border-amber-400 shadow-xs font-bold"
              : "text-slate-300 hover:bg-[#132752]/60 hover:text-white"
          }`}
        >
          <UserCheck className="w-4 h-4 text-slate-400" />
          <span>My profile</span>
        </Link>

        <Link
          href={accountHref}
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#132752]/60 hover:text-white transition-all duration-150"
        >
          <Bell className="w-4 h-4 text-slate-400" />
          <span>Notifications</span>
        </Link>

        <Link
          href={accountHref}
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#132752]/60 hover:text-white transition-all duration-150"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Account settings</span>
        </Link>

        {/* Public Portal Return Links */}
        <div className="pt-5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
          <span>Browse Catalog</span>
        </Link>
      </nav>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-800 bg-[#060E1E] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-[#0B1B3D] flex items-center justify-center font-black text-sm shrink-0 overflow-hidden ring-1 ring-amber-300 shadow-xs">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="overflow-hidden min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {user.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
