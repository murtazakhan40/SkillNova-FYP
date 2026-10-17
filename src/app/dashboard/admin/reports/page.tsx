import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AdminReportsClient, CourseReportItem } from "@/components/dashboard/AdminReportsClient";
import { getAdminNotifications } from "@/lib/notifications";
import { ArrowLeft, Sparkles, BarChart3 } from "lucide-react";

export default async function AdminReportsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect(user ? "/dashboard/student" : "/login");
  }

  const [
    notifications,
    courses,
    quizSubmissions,
    totalReviews,
    totalCertificates,
  ] = await Promise.all([
    getAdminNotifications(),
    db.course.findMany({
      include: {
        category: true,
        instructor: true,
        enrollments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.quizSubmission.findMany(),
    db.review.findMany(),
    db.certificate.count(),
  ]);

  const courseReportItems: CourseReportItem[] = courses.map((c) => {
    const enrolledCount = c.enrollments.length;
    const completedCount = c.enrollments.filter((e) => e.progress >= 100).length;
    const avgProgress = enrolledCount > 0
      ? Math.round(
          c.enrollments.reduce((acc, e) => acc + e.progress, 0) / enrolledCount
        )
      : 0;

    return {
      id: c.id,
      title: c.title,
      categoryName: c.category.name,
      instructorName: c.instructor.name,
      price: c.price,
      enrolledCount,
      completedCount,
      averageProgress: avgProgress,
      revenue: c.price * enrolledCount,
    };
  });

  const totalSubmissions = quizSubmissions.length;
  const passedCount = quizSubmissions.filter((s) => s.passed).length;
  const passRate = totalSubmissions > 0
    ? Math.round((passedCount / totalSubmissions) * 100)
    : 100;

  const avgRating = totalReviews.length > 0
    ? (totalReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews.length).toFixed(1)
    : "5.0";

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Console</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Database Analytics & Academic Reports
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700">
              <Sparkles className="w-3 h-3" />
              <span>3NF Verified Ledger</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time statistical aggregates computed directly from relational database tables with secure CSV reporting.
          </p>
        </div>

        <AdminReportsClient
          courses={courseReportItems}
          totalSubmissions={totalSubmissions}
          passRate={passRate}
          avgRating={avgRating}
          totalReviews={totalReviews.length}
          totalCertificates={totalCertificates}
        />
      </div>
    </DashboardShell>
  );
}
