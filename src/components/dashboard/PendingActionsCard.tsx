"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export interface PendingActionItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "orange" | "blue" | "purple" | "emerald";
  actionLabel: string;
  actionHref: string;
}

interface PendingActionsCardProps {
  actions?: PendingActionItem[];
  emptyMessage?: string;
}

export function PendingActionsCard({
  actions = [],
  emptyMessage = "Nothing needs your attention right now.",
}: PendingActionsCardProps) {
  const badgeClasses = {
    orange: "bg-orange-50 text-[#FF6B00] border-orange-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-[#7C3AED] border-purple-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[#0B1B3D] tracking-tight">
            Pending actions
          </h2>
          {actions.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6B00]">
              {actions.length} action{actions.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {actions.length === 0 ? (
          <div className="flex items-center justify-start text-sm text-slate-400 py-10 font-normal">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3 py-1">
            {actions.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          badgeClasses[item.badgeColor || "orange"]
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <h3 className="text-xs font-bold text-[#0B1B3D] truncate">
                      {item.title}
                    </h3>
                  </div>
                  {item.subtitle && (
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <Link
                  href={item.actionHref}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-xs transition-colors"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {actions.length === 0 && (
        <div className="pt-4 border-t border-slate-50 flex items-center gap-1.5 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>All academic and verification tasks are up to date.</span>
        </div>
      )}
    </div>
  );
}
