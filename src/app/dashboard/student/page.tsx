import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  ArrowRight, 
  Sparkles,
  Mail,
  Phone
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student's enrollments with course details
  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: true,
          category: true,
          sections: {
            include: { lessons: true },
          },
          quizzes: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Fetch certificates
  const certificates = await db.certificate.findMany({
    where: { userId: user.id },
    include: {
      course: true,
    },
  });

  const totalEnrolled = enrollments.length;
  const completedCount = enrollments.filter((e) => e.progress >= 100).length;
  const inProgressCount = totalEnrolled - completedCount;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B00] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Learning Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track your coursework progress, assessments, and verifiable credentials.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 font-semibold">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>{user.email}</span>
              </span>
              {user.phone && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user.phone}</span>
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold">
                BS Computer Science FYP
              </span>
            </div>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 transition-all hover:scale-105 shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore More Courses</span>
          </Link>
        </div>

        {/* 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Enrolled Tracks</div>
              <div className="text-2xl font-extrabold text-[#0B1B3D] mt-1">{totalEnrolled}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">In Progress</div>
              <div className="text-2xl font-extrabold text-[#FF6B00] mt-1">{inProgressCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Completed Tracks</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completedCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Certificates Earned</div>
              <div className="text-2xl font-extrabold text-purple-600 mt-1">{certificates.length}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Enrolled Courses & Progress Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0B1B3D]">
              Active Coursework
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Showing {enrollments.length} Active Enrollment{enrollments.length > 1 ? "s" : ""}
            </span>
          </div>

          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrollments.map((enr) => {
                const totalLessons = enr.course.sections.reduce(
                  (acc, s) => acc + s.lessons.length,
                  0
                );

                return (
                  <div
                    key={enr.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {enr.course.category.name}
                        </span>
                        <span className="text-xs font-extrabold text-[#FF6B00]">
                          {enr.progress}% Complete
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#0B1B3D] leading-snug mb-2">
                        {enr.course.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                        {enr.course.subtitle}
                      </p>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-4">
                        <div
                          className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <PlayCircle className="w-4 h-4 text-slate-400" />
                        <span>{totalLessons} Lessons Available</span>
                      </div>

                      <Link
                        href={`/courses/${enr.course.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors"
                      >
                        <span>Resume Lesson</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#0B1B3D]">No Courses Enrolled Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Explore our catalog and start building skills today.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </div>

        {/* Certificates & Credentials Section */}
        <div>
          <h2 className="text-lg font-bold text-[#0B1B3D] mb-4">
            Earned Certificates & Verified Credentials
          </h2>

          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border-2 border-emerald-500/20 p-6 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                        Verified Credential
                      </span>
                      <h4 className="text-sm font-bold text-[#0B1B3D]">
                        {cert.course.title}
                      </h4>
                      <div className="text-xs font-mono text-slate-500">
                        Verification Code:{" "}
                        <span className="font-bold text-[#0B1B3D]">
                          {cert.certificateCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Issued on {formatDate(cert.issuedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500">
              Complete course modules and pass the assessment quiz to earn your official digital certificate.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
