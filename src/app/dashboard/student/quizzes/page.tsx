import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentQuizzesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student's enrolled courses with quizzes and submissions
  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          quizzes: {
            include: {
              questions: true,
              submissions: {
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  const allQuizzes = enrollments.flatMap((e) =>
    e.course.quizzes.map((q) => ({
      ...q,
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
      lastSubmission: q.submissions[0] || null,
    }))
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <Link
              href="/dashboard/student"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-[#0B1B3D]">
              Quizzes & Assessment Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify your technical competencies and pass benchmarks to unlock completion certificates.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0B1B3D]">
                Course Assessments ({allQuizzes.length} Quizzes Available)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-6">Quiz Title</th>
                    <th className="py-3 px-6">Associated Course</th>
                    <th className="py-3 px-6">Passing Score</th>
                    <th className="py-3 px-6">Latest Attempt</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {allQuizzes.map((q) => {
                    const sub = q.lastSubmission;

                    return (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-[#0B1B3D]">
                          {q.title}
                          <div className="text-[10px] text-slate-400 font-normal">
                            {q.questions.length} Questions
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-700">
                          {q.courseTitle}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-700">
                          {q.passingScore}%
                        </td>
                        <td className="py-4 px-6">
                          {sub ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded ${
                                sub.passed
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {sub.passed ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              Score: {sub.score}% on {formatDate(sub.createdAt)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Not Attempted
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/courses/${q.courseSlug}/quiz/${q.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-sm transition-all"
                          >
                            <span>{sub ? "Retake" : "Take Quiz"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
