import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-0 animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video bg-slate-200 relative">
        <div className="absolute top-3 left-3 w-20 h-6 rounded-md bg-slate-300" />
        <div className="absolute top-3 right-3 w-24 h-6 rounded-md bg-slate-300" />
      </div>

      {/* Body Skeleton */}
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="w-16 h-4 bg-slate-200 rounded" />
          <div className="w-20 h-4 bg-slate-200 rounded" />
        </div>
        <div className="w-3/4 h-5 bg-slate-200 rounded" />
        <div className="w-full h-4 bg-slate-100 rounded" />
        <div className="w-2/3 h-4 bg-slate-100 rounded" />

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
          </div>
          <div className="w-14 h-4 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}
