"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, 
  Menu, 
  X, 
  Globe, 
  LogOut, 
  Award, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Users, 
  ShieldCheck, 
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
  const [unreadList, setUnreadList] = useState<DashboardNotification[]>(notifications);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hydrate persistent read state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`sn_read_notifs_${user.id}`);
      const readIds: string[] = raw ? JSON.parse(raw) : [];
      if (readIds.length > 0) {
        setUnreadList((prev) =>
          prev.map((n) => (readIds.includes(n.id) ? { ...n, unread: false } : n))
        );
      }
    } catch {}
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

  // Header Subtitle tag (matching "ADMISSIONS" in screenshot)
  const headerTag = {
    STUDENT: "ADMISSIONS",
    TRAINER: "FACULTY STUDIO",
    ADMIN: "ADMIN CONSOLE",
  }[user.role as "STUDENT" | "TRAINER" | "ADMIN"] || "ADMISSIONS";

  return (
    <header className="w-full bg-white border-b border-slate-200/90 shadow-2xs px-4 sm:px-8 py-3.5 shrink-0 z-20">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + "ADMISSIONS" Subtitle + "Welcome, [Name]" */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-colors"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#7C3AED]">
              {headerTag}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight leading-tight">
              Welcome, {user.name}
            </h1>
          </div>
        </div>

        {/* Right: Bell Icon + "View site" + "Log out" (exact match to screenshot!) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#7C3AED] ring-2 ring-white" />
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
                      Real-time database updates
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
                            item.unread ? "bg-purple-50/30" : ""
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-xs font-bold truncate ${item.unread ? "text-[#0B1B3D]" : "text-slate-700"}`}>
                                {item.title}
                              </span>
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
              </div>
            )}
          </div>

          {/* "View site" link with Globe icon */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-[#6D28D9] hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-4 h-4 text-[#7C3AED]" />
            <span>View site</span>
          </Link>

          {/* "Log out" button with exit door icon */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
