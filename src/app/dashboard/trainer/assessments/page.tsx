import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { 
  TrainerAssessmentsClient, 
  TrainerSubmissionItem,
  TrainerAssignmentSubmissionItem
} from "@/components/dashboard/TrainerAssessmentsClient";
import { getTrainerNotifications } from "@/lib/notifications";
import { ArrowLeft, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TrainerAssessmentsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect(user ? "/dashboard/student" : "/login");
  }

  // Get courses taught by this trainer (or all if admin)
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
        assignments: {
          include: {
            submissions: {
              include: { user: true },
              orderBy: { submittedAt: "desc" },
            },
          },
        },
      },
    }),
  ]);

  const totalQuizzesCount = courses.reduce((acc, c) => acc + c.quizzes.length, 0);
  const totalAssignmentsCount = courses.reduce((acc, c) => acc + c.assignments.length, 0);

  // Transform Quiz Submissions
  const quizSubmissions: TrainerSubmissionItem[] = courses.flatMap((c) =>
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

  // Transform Assignment Submissions
  const assignmentSubmissions: TrainerAssignmentSubmissionItem[] = courses.flatMap((c) =>
    c.assignments.flatMap((a) =>
      a.submissions.map((sub) => ({
        id: sub.id,
        studentId: sub.user.id,
        studentName: sub.user.name,
        studentEmail: sub.user.email,
        studentAvatar: sub.user.avatar,
        assignmentId: a.id,
        assignmentTitle: a.title,
        courseTitle: c.title,
        courseSlug: c.slug,
        maxScore: a.maxScore,
        textContent: sub.textContent,
        fileUrl: sub.fileUrl,
        fileName: sub.fileName,
        fileSize: sub.fileSize,
        score: sub.score,
        feedback: sub.feedback,
        status: sub.status,
        submittedAt: formatDate(sub.submittedAt),
        gradedAt: sub.gradedAt ? formatDate(sub.gradedAt) : null,
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
              Student Assessments & Evaluation Studio
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-[#FF6B00]">
              <Sparkles className="w-3 h-3" />
              <span>Faculty Evaluation</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review live student test attempts, evaluate capstone project submissions, provide rubric feedback, and inspect curriculum evaluation performance.
          </p>
        </div>

        <TrainerAssessmentsClient
          submissions={quizSubmissions}
          assignmentSubmissions={assignmentSubmissions}
          totalQuizzesCount={totalQuizzesCount}
          totalAssignmentsCount={totalAssignmentsCount}
        />
      </div>
    </DashboardShell>
  );
}
