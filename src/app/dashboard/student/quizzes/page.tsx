import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StudentQuizzesClient, QuizItem } from "@/components/dashboard/StudentQuizzesClient";
import { getStudentNotifications } from "@/lib/notifications";
import { ArrowLeft, Sparkles, HelpCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentQuizzesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [notifications, enrollments] = await Promise.all([
    getStudentNotifications(user.id),
    db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            category: true,
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
    }),
  ]);

  const quizzes: QuizItem[] = enrollments.flatMap((e) =>
    e.course.quizzes.map((q) => {
      const sub = q.submissions[0] || null;

      return {
        id: q.id,
        title: q.title,
        passingScore: q.passingScore,
        questionCount: q.questions.length,
        courseTitle: e.course.title,
        courseSlug: e.course.slug,
        categoryName: e.course.category.name,
        lastSubmission: sub
          ? {
              id: sub.id,
              score: sub.score,
              passed: sub.passed,
              createdAt: formatDate(sub.createdAt),
            }
          : null,
      };
    })
  );

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Quizzes & Assessment Center
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] font-bold text-[#FF6B00]">
              <Sparkles className="w-3 h-3" />
              <span>Certified Benchmarks</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Verify your theoretical knowledge and architectural competencies. Passing these benchmarks
            unlocks verified certificates.
          </p>
        </div>

        <StudentQuizzesClient quizzes={quizzes} />
      </div>
    </DashboardShell>
  );
}
