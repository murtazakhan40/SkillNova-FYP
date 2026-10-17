"use client";

import React, { useState, useMemo } from "react";
import { 
  BarChart3, 
  Download, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  Star, 
  Award,
  Layers
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export interface CourseReportItem {
  id: string;
  title: string;
  categoryName: string;
  instructorName: string;
  price: number;
  enrolledCount: number;
  completedCount: number;
  averageProgress: number;
  revenue: number;
}

interface AdminReportsClientProps {
  courses: CourseReportItem[];
  totalSubmissions: number;
  passRate: number;
  avgRating: string;
  totalReviews: number;
  totalCertificates: number;
}

export function AdminReportsClient({
  courses,
  totalSubmissions,
  passRate,
  avgRating,
  totalReviews,
  totalCertificates,
}: AdminReportsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(c.categoryName));
    return Array.from(set);
  }, [courses]);

  // Filtered
  const filteredCourses = useMemo(() => {
    if (selectedCategory === "ALL") return courses;
    return courses.filter((c) => c.categoryName === selectedCategory);
  }, [courses, selectedCategory]);

  // Overall totals
  const totalRevenue = useMemo(() => {
    return courses.reduce((acc, c) => acc + c.revenue, 0);
  }, [courses]);

  const totalEnrollments = useMemo(() => {
    return courses.reduce((acc, c) => acc + c.enrolledCount, 0);
  }, [courses]);

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      "Course ID",
      "Course Title",
      "Category",
      "Instructor",
      "Course Fee (PKR)",
      "Total Enrolled",
      "Completed (100%)",
      "Average Progress (%)",
      "Total Revenue (PKR)",
    ];

    const rows = filteredCourses.map((c) => [
      `"${c.id}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.categoryName}"`,
      `"${c.instructorName}"`,
      c.price,
      c.enrolledCount,
      c.completedCount,
      `${c.averageProgress}%`,
      c.revenue,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SkillNova_Enrollment_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 4 Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Total Program Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {formatPrice(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {totalEnrollments} active enrollments
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Quiz Benchmark Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">{passRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Based on {totalSubmissions} quiz submissions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Average Platform Rating</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-500">{avgRating} / 5.0</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verified from {totalReviews} student reviews
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Issued Certificates</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0B1B3D]">{totalCertificates}</div>
          <div className="text-[11px] text-slate-400 mt-1">SHA-256 Ledger Authenticated</div>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden"
          >
            <option value="ALL">All Disciplines & Tracks</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] hover:bg-[#132752] text-white shadow-xs transition-all"
        >
          <Download className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>Export Enrollment Report (CSV)</span>
        </button>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0B1B3D] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Course Enrollment & Academic Progression Breakdown</span>
          </h2>
          <span className="text-xs text-slate-400">
            {filteredCourses.length} Curricula evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Course Track</th>
                <th className="py-3.5 px-6">Instructor</th>
                <th className="py-3.5 px-6">Fee</th>
                <th className="py-3.5 px-6">Enrolled</th>
                <th className="py-3.5 px-6">Completed</th>
                <th className="py-3.5 px-6">Avg Progress</th>
                <th className="py-3.5 px-6 text-right">Gross Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-[#0B1B3D] max-w-xs">
                    <div>{c.title}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {c.categoryName}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-700">
                    {c.instructorName}
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-semibold">
                    {formatPrice(c.price)}
                  </td>
                  <td className="py-4 px-6 font-extrabold text-[#FF6B00]">
                    {c.enrolledCount}
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-600">
                    {c.completedCount}
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1 max-w-[120px]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>{c.averageProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-1.5 rounded-full"
                          style={{ width: `${c.averageProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-[#0B1B3D]">
                    {formatPrice(c.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
