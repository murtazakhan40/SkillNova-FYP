"use client";

import React from "react";
import { BarChart3, Flame, CheckCircle2 } from "lucide-react";
import type { DayActivity } from "@/lib/dashboard-analytics";

interface WeeklyActivityCardProps {
  activity: DayActivity[];
  totalActionsThisWeek: number;
}

export function WeeklyActivityCard({
  activity,
  totalActionsThisWeek,
}: WeeklyActivityCardProps) {
  const activeDays = activity.filter((a) => a.count > 0).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B1B3D]">
              <BarChart3 className="w-4 h-4 text-[#FF6B00]" />
              <span>Weekly Learning Activity</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Genuine lesson completions & assessment submissions across the past 7 days
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/80 text-[11px] font-bold text-[#FF6B00]">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{activeDays} Active Days</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{totalActionsThisWeek} Completions</span>
            </span>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="h-40 flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2 px-2 border-b border-slate-100">
          {activity.map((day) => {
            return (
              <div
                key={day.dateStr}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
              >
                {/* Hover Tooltip */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#0B1B3D] text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-md whitespace-nowrap z-10">
                  {day.count} activity item{day.count === 1 ? "" : "s"} on {day.dateStr}
                </div>

                {/* Bar */}
                <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-full">
                  <div
                    style={{ height: `${day.heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      day.isToday
                        ? "bg-gradient-to-t from-[#FF6B00] to-amber-400 shadow-sm"
                        : day.count > 0
                        ? "bg-gradient-to-t from-[#0B1B3D] to-[#1E3A8A]"
                        : "bg-slate-200/80"
                    }`}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`text-[11px] font-semibold ${
                    day.isToday
                      ? "text-[#FF6B00] font-bold"
                      : "text-slate-500"
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 mt-2 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#FF6B00] to-amber-400" />
          <span>Today&apos;s Focus</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0B1B3D]" />
          <span>Completed Records</span>
        </span>
        <span className="hidden sm:inline text-slate-400">
          Updated in real-time from database records
        </span>
      </div>
    </div>
  );
}
