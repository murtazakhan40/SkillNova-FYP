"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SkillNovaLogo } from "@/components/brand/SkillNovaLogo";
import { 
  Bell, 
  Menu, 
  X, 
  User as UserIcon, 
  BookOpen, 
  Award, 
  HelpCircle, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Settings,
  FileCheck2
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import type { DashboardNotification } from "@/lib/notifications";

interface DashboardHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "TRAINER" | "ADMIN" | string;
    avatar?: string | null;
  };
  notifications?: DashboardNotification[];
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export function DashboardHeader({
  user,
  notifications = [],
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}: DashboardHeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadList, setUnreadList] = useState<DashboardNotification[]>(notifications);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hydrate persistent read state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`sn_read_notifs_${user.id}`);
      const readIds: string[] = raw ? JSON.parse(raw) : [];
      if (readIds.length > 0) {
        setUnreadList((prev) =>
          prev.map((n) => (readIds.includes(n.id) ? { ...n, unread: false } : n))
        );
      }
    } catch {
      // Graceful local storage fallback
    }
  }, [user.id]);

  // Periodic polling (every 45s) and window focus revalidation
  useEffect(() => {
    let isMounted = true;
    const syncNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data.notifications)) {
          const raw = localStorage.getItem(`sn_read_notifs_${user.id}`);
          const readIds: string[] = raw ? JSON.parse(raw) : [];
          setUnreadList(
            data.notifications.map((n: DashboardNotification) =>
              readIds.includes(n.id) ? { ...n, unread: false } : n
            )
          );
        }
      } catch {
        // Silent network fallback
      }
    };

    const intervalId = setInterval(syncNotifications, 45000);
    window.addEventListener("focus", syncNotifications);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", syncNotifications);
    };
  }, [user.id]);

  const unreadCount = unreadList.filter((n) => n.unread).length;

  const markAllRead = () => {
    setUnreadList((prev) => {
      const allIds = prev.map((n) => n.id);
      try {
        localStorage.setItem(`sn_read_notifs_${user.id}`, JSON.stringify(allIds));
      } catch {}
      return prev.map((n) => ({ ...n, unread: false }));
    });
  };

  const markItemRead = (id: string) => {
    setUnreadList((prev) => {
      try {
        const raw = localStorage.getItem(`sn_read_notifs_${user.id}`);
        const readIds: string[] = raw ? JSON.parse(raw) : [];
        if (!readIds.includes(id)) {
          readIds.push(id);
          localStorage.setItem(`sn_read_notifs_${user.id}`, JSON.stringify(readIds));
        }
      } catch {}
      return prev.map((n) => (n.id === id ? { ...n, unread: false } : n));
    });
  };

  const portalLabel = {
    ADMIN: "Platform Administration & System Governance",
    TRAINER: "Faculty Teaching Studio & Curriculum Management",
    STUDENT: "SkillNova Student Portal • Academic Ledger",
  }[user.role] || "SkillNova Portal";

  const roleBadge = {
    ADMIN: { label: "System Administrator", color: "bg-purple-50 text-purple-700 border-purple-200" },
    TRAINER: { label: "Course Instructor", color: "bg-orange-50 text-orange-700 border-orange-200" },
    STUDENT: { label: "Student Learner", color: "bg-blue-50 text-blue-700 border-blue-200" },
  }[user.role] || { label: "User", color: "bg-slate-100 text-slate-700 border-slate-200" };

  return (
    <header className="w-full bg-white border-b border-slate-200/90 shadow-2xs px-4 sm:px-6 lg:px-8 py-3.5 shrink-0 z-20">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Toggle + Mobile Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-colors focus:outline-hidden"
          >
            {isMobileSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Logo on mobile/tablet */}
          <div className="lg:hidden">
            <SkillNovaLogo variant="dark" size="sm" />
          </div>

          {/* Desktop Search / Breadcrumb subtitle */}
          <div className="hidden lg:flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${
              user.role === "ADMIN"
                ? "bg-purple-50 border-purple-200 text-purple-700"
                : user.role === "TRAINER"
                ? "bg-orange-50 border-orange-200 text-[#FF6B00]"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{portalLabel}</span>
            </span>
          </div>
        </div>

        {/* Right: Notification Center + Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Quick link to catalog */}
          <Link
            href="/courses"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Course Catalog</span>
          </Link>

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-colors focus:outline-hidden"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#FF6B00] ring-2 ring-white" />
              ) : (
                unreadList.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white" />
                )
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#0B1B3D]">
                      Activity Alerts & Updates
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Real-time updates from database events
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-[#FF6B00] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {unreadList.length > 0 ? (
                    unreadList.map((item) => {
                      const icon = {
                        CERTIFICATE: <Award className="w-4 h-4 text-emerald-600" />,
                        QUIZ: <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />,
                        ENROLLMENT: <Clock className="w-4 h-4 text-blue-600" />,
                        ASSIGNMENT: <FileCheck2 className="w-4 h-4 text-emerald-600" />,
                        ACADEMIC: <Sparkles className="w-4 h-4 text-purple-600" />,
                        USER: <Users className="w-4 h-4 text-indigo-600" />,
                        SYSTEM: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
                      }[item.type] || <Sparkles className="w-4 h-4 text-slate-600" />;

                      return (
                        <Link
                          key={item.id}
                          href={item.link}
                          onClick={() => {
                            markItemRead(item.id);
                            setIsNotifOpen(false);
                          }}
                          className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 transition-colors block ${
                            item.unread ? "bg-orange-50/20" : ""
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 truncate">
                                {item.unread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                                )}
                                <span className={`text-xs font-bold truncate ${item.unread ? "text-[#0B1B3D]" : "text-slate-700"}`}>
                                  {item.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {item.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                              {item.message}
                            </p>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50 rounded-b-2xl">
                  <span className="text-[10px] text-slate-400">
                    Real-time SQLite database sync
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all focus:outline-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center text-xs font-extrabold overflow-hidden ring-2 ring-orange-500/30 shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#0B1B3D] leading-tight flex items-center gap-1">
                  <span>{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-[#FF6B00] font-semibold">
                  {user.role}
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                  <div className="text-xs font-extrabold text-[#0B1B3D] truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {user.email}
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>

                <div className="py-1">
                  {user.role === "ADMIN" && (
                    <>
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-purple-600" />
                        <span>Platform Metrics</span>
                      </Link>
                      <Link
                        href="/dashboard/admin/users"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>User Governance</span>
                      </Link>
                      <Link
                        href="/dashboard/admin/courses"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>Course Moderation</span>
                      </Link>
                      <Link
                        href="/dashboard/admin/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>System Settings</span>
                      </Link>
                    </>
                  )}

                  {user.role === "TRAINER" && (
                    <>
                      <Link
                        href="/dashboard/trainer"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-orange-600" />
                        <span>Faculty Studio</span>
                      </Link>
                      <Link
                        href="/dashboard/trainer/courses"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>My Courses</span>
                      </Link>
                      <Link
                        href="/dashboard/trainer/students"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>Enrolled Students</span>
                      </Link>
                      <Link
                        href="/dashboard/trainer/assessments"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <span>Assessment Reviews</span>
                      </Link>
                      <Link
                        href="/dashboard/trainer/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Profile & Settings</span>
                      </Link>
                    </>
                  )}

                  {user.role === "STUDENT" && (
                    <>
                      <Link
                        href="/dashboard/student"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span>Learning Center</span>
                      </Link>
                      <Link
                        href="/dashboard/student/courses"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>My Courses</span>
                      </Link>
                      <Link
                        href="/dashboard/student/quizzes"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <span>Quizzes & Scores</span>
                      </Link>
                      <Link
                        href="/dashboard/student/certificates"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <Award className="w-4 h-4 text-slate-400" />
                        <span>My Certificates</span>
                      </Link>
                      <Link
                        href="/dashboard/student/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B3D]"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Profile & Settings</span>
                      </Link>
                    </>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
