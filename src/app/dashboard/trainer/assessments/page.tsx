import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { 
  TrainerAssessmentsClient, 
  TrainerSubmissionItem 
} from "@/components/dashboard/TrainerAssessmentsClient";
import { getTrainerNotifications } from "@/lib/notifications";
import { ArrowLeft, Sparkles, HelpCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TrainerAssessmentsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect(user ? "/dashboard/student" : "/login");
  }

  // Get courses taught by this trainer
  const [notifications, courses] = await Promise.all([
    getTrainerNotifications(user.id),
    db.course.findMany({
      where: user.role === "ADMIN" ? {} : { instructorId: user.id },
      include: {
        quizzes: {
          include: {
            submissions: {
              include: { user: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    }),
  ]);

  const totalQuizzesCount = courses.reduce((acc, c) => acc + c.quizzes.length, 0);

  const submissions: TrainerSubmissionItem[] = courses.flatMap((c) =>
    c.quizzes.flatMap((q) =>
      q.submissions.map((sub) => ({
        id: sub.id,
        studentName: sub.user.name,
        studentEmail: sub.user.email,
        studentAvatar: sub.user.avatar,
        quizId: q.id,
        quizTitle: q.title,
        courseTitle: c.title,
        courseSlug: c.slug,
        passingScore: q.passingScore,
        score: sub.score,
        passed: sub.passed,
        createdAt: formatDate(sub.createdAt),
      }))
    )
  );

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/trainer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Trainer Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
              Student Assessments & Quiz Review
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-[#FF6B00]">
              <Sparkles className="w-3 h-3" />
              <span>Assessment Control</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review live student test attempts, evaluate module scores against the 70% benchmark, and inspect curriculum evaluation performance.
          </p>
        </div>

        <TrainerAssessmentsClient
          submissions={submissions}
          totalQuizzesCount={totalQuizzesCount}
        />
      </div>
    </DashboardShell>
  );
}
