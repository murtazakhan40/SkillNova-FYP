"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import type { StudentNotification } from "@/lib/notifications";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "TRAINER" | "ADMIN" | string;
    avatar?: string | null;
  };
  notifications?: StudentNotification[];
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  notifications = [],
  children,
}: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0">
        <DashboardSidebar user={user} />
      </div>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] shadow-2xl transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <DashboardSidebar
              user={user}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          user={user}
          notifications={notifications}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
