import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WeeklyActivityCard } from "@/components/dashboard/WeeklyActivityCard";
import { CopyCodeButton } from "@/components/dashboard/CopyCodeButton";
import { getStudentNotifications } from "@/lib/notifications";
import { getStudentAnalytics } from "@/lib/dashboard-analytics";
import { 
  StudentActionCenter, 
  InProgressCourseInfo, 
  UrgentActionInfo 
} from "@/components/dashboard/StudentActionCenter";
import { 
  StudentActiveCoursework, 
  StudentCourseCardItem 
} from "@/components/dashboard/StudentActiveCoursework";
import { 
  StudentAssessmentsDeliverables, 
  StudentAssignmentItem, 
  StudentQuizResultItem 
} from "@/components/dashboard/StudentAssessmentsDeliverables";
import { 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Mail,
  Phone,
  HelpCircle,
  ExternalLink,
  GraduationCap,
  Compass
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch real analytics and notifications (strict user isolation)
  const [analytics, notifications] = await Promise.all([
    getStudentAnalytics(user.id),
    getStudentNotifications(user.id),
  ]);

  // 2. Fetch student's enrolled courses with curriculum structure and progress
  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: true,
          category: true,
          sections: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                include: {
                  progress: {
                    where: { userId: user.id },
                  },
                },
              },
            },
          },
          quizzes: {
            include: {
              submissions: {
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
          assignments: {
            include: {
              submissions: {
                where: { userId: user.id },
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // 3. Fetch student's verified digital certificates
  const certificates = await db.certificate.findMany({
    where: { userId: user.id },
    include: {
      course: true,
    },
    orderBy: { issuedAt: "desc" },
  });

  // 4. Fetch student's recent quiz submissions
  const quizSubmissions = await db.quizSubmission.findMany({
    where: { userId: user.id },
    include: {
      quiz: {
        include: {
          course: { select: { title: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // 5. If new student (0 enrollments), fetch featured courses for helpful onboarding
  const featuredCourses = enrollments.length === 0
    ? await db.course.findMany({
        where: { published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          subtitle: true,
          price: true,
          level: true,
          thumbnail: true,
          category: { select: { name: true } },
          instructor: { select: { name: true } },
        },
        take: 3,
        orderBy: { createdAt: "desc" },
      })
    : [];

  // ===========================================================================
  // DATA TRANSFORMATION & ACTION PRIORITIZATION
  // ===========================================================================

  // A. Determine in-progress course and next uncompleted lesson
  const inProgressEnrollment =
    enrollments.find((e) => e.progress > 0 && e.progress < 100) ||
    enrollments.find((e) => e.progress < 100) ||
    enrollments[0] ||
    null;

  let inProgressCourseInfo: InProgressCourseInfo | null = null;
  if (inProgressEnrollment) {
    const allLessons = inProgressEnrollment.course.sections.flatMap((s) => s.lessons);
    const completedLessons = allLessons.filter((l) => l.progress.some((p) => p.isCompleted)).length;
    const nextLesson = allLessons.find((l) => !l.progress.some((p) => p.isCompleted)) || allLessons[0] || null;

    inProgressCourseInfo = {
      id: inProgressEnrollment.course.id,
      title: inProgressEnrollment.course.title,
      slug: inProgressEnrollment.course.slug,
      subtitle: inProgressEnrollment.course.subtitle,
      progress: Math.round(inProgressEnrollment.progress),
      categoryName: inProgressEnrollment.course.category.name,
      instructorName: inProgressEnrollment.course.instructor.name,
      nextLesson: nextLesson
        ? {
            id: nextLesson.id,
            title: nextLesson.title,
            duration: nextLesson.duration,
          }
        : null,
      totalLessons: allLessons.length,
      completedLessons,
    };
  }

  // B. Aggregate assignments from all enrolled courses
  const now = new Date();
  const allAssignments: StudentAssignmentItem[] = enrollments.flatMap((enr) =>
    enr.course.assignments.map((assign) => {
      const sub = assign.submissions[0] || null;
      const isOverdue = assign.dueDate ? now > new Date(assign.dueDate) : false;
      const daysRemaining = assign.dueDate
        ? Math.ceil((new Date(assign.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        id: assign.id,
        title: assign.title,
        description: assign.description,
        dueDate: assign.dueDate ? formatDate(assign.dueDate) : null,
        isOverdue,
        daysRemaining,
        maxScore: assign.maxScore,
        courseTitle: enr.course.title,
        courseSlug: enr.course.slug,
        submission: sub
          ? {
              id: sub.id,
              status: sub.status as "SUBMITTED" | "GRADED" | "RESUBMIT_REQUESTED",
              score: sub.score,
              feedback: sub.feedback,
              submittedAt: formatDate(sub.submittedAt),
            }
          : null,
      };
    })
  );

  // Sort: Overdue first, then upcoming due date, then graded
  allAssignments.sort((a, b) => {
    if (a.isOverdue && !a.submission) return -1;
    if (b.isOverdue && !b.submission) return 1;
    if (a.submission?.status === "RESUBMIT_REQUESTED") return -1;
    if (b.submission?.status === "RESUBMIT_REQUESTED") return 1;
    return 0;
  });

  // C. Determine the most critical Urgent Action
  let urgentAction: UrgentActionInfo | null = null;

  // 1. Check for assignment feedback / revision requested
  const evaluatedAssignment = allAssignments.find(
    (a) => a.submission && (a.submission.status === "RESUBMIT_REQUESTED" || (a.submission.status === "GRADED" && a.submission.feedback))
  );

  if (evaluatedAssignment && evaluatedAssignment.submission) {
    const isResubmit = evaluatedAssignment.submission.status === "RESUBMIT_REQUESTED";
    urgentAction = {
      type: "FEEDBACK",
      title: isResubmit ? "Assignment Revision Requested" : "Assignment Graded by Faculty",
      courseTitle: evaluatedAssignment.courseTitle,
      courseSlug: evaluatedAssignment.courseSlug,
      message: evaluatedAssignment.submission.feedback || (isResubmit ? "Please revise and resubmit your work." : "Evaluation complete."),
      score: evaluatedAssignment.submission.score,
      maxScore: evaluatedAssignment.maxScore,
      link: `/courses/${evaluatedAssignment.courseSlug}/learn`,
      actionText: isResubmit ? "Revise & Resubmit Solution" : "Review Graded Solution",
    };
  } else {
    // 2. Check for overdue assignment
    const overdueAssignment = allAssignments.find((a) => a.isOverdue && !a.submission);
    if (overdueAssignment) {
      urgentAction = {
        type: "ASSIGNMENT_OVERDUE",
        title: overdueAssignment.title,
        courseTitle: overdueAssignment.courseTitle,
        courseSlug: overdueAssignment.courseSlug,
        message: "This deliverable is past its target submission date. Submit your work now to complete course requirements.",
        dueDate: overdueAssignment.dueDate,
        link: `/courses/${overdueAssignment.courseSlug}/learn`,
        actionText: "Open Workspace & Submit Now",
      };
    } else {
      // 3. Check for upcoming assignment
      const upcomingAssignment = allAssignments.find((a) => !a.submission && a.dueDate);
      if (upcomingAssignment) {
        urgentAction = {
          type: "ASSIGNMENT_DUE",
          title: upcomingAssignment.title,
          courseTitle: upcomingAssignment.courseTitle,
          courseSlug: upcomingAssignment.courseSlug,
          message: `Deliverable due on ${upcomingAssignment.dueDate}. Complete your code project or solution notes before the deadline.`,
          dueDate: upcomingAssignment.dueDate,
          link: `/courses/${upcomingAssignment.courseSlug}/learn`,
          actionText: "Work on Deliverable",
        };
      } else {
        // 4. Check for failed quiz needing retake
        const failedQuizSub = quizSubmissions.find((s) => !s.passed);
        if (failedQuizSub) {
          urgentAction = {
            type: "QUIZ_RETAKE",
            title: `Retake Assessment: ${failedQuizSub.quiz.title}`,
            courseTitle: failedQuizSub.quiz.course.title,
            courseSlug: failedQuizSub.quiz.course.slug,
            message: `You scored ${failedQuizSub.score}%. Retake this benchmark assessment to meet passing requirements and qualify for certification.`,
            link: `/courses/${failedQuizSub.quiz.course.slug}/quiz/${failedQuizSub.quiz.id}`,
            actionText: "Retake Assessment Quiz",
          };
        } else {
          // 5. Check for course 100% completed without certificate
          const completedWithoutCert = enrollments.find((e) => {
            const hasCert = certificates.some((c) => c.courseId === e.courseId);
            return e.progress >= 100 && !hasCert;
          });
          if (completedWithoutCert && completedWithoutCert.course.quizzes.length > 0) {
            const targetQuiz = completedWithoutCert.course.quizzes[0];
            urgentAction = {
              type: "CLAIM_CERTIFICATE",
              title: `Complete Assessment to Claim Credential`,
              courseTitle: completedWithoutCert.course.title,
              courseSlug: completedWithoutCert.course.slug,
              message: "You have finished 100% of the lessons in this course! Pass the final assessment to issue your verified digital certificate.",
              link: `/courses/${completedWithoutCert.course.slug}/quiz/${targetQuiz.id}`,
              actionText: "Take Final Quiz for Certificate",
            };
          }
        }
      }
    }
  }

  // D. Transform course cards data with next uncompleted lesson
  const courseCardsData: StudentCourseCardItem[] = enrollments.map((enr) => {
    const allLessons = enr.course.sections.flatMap((s) => s.lessons);
    const completedLessons = allLessons.filter((l) => l.progress.some((p) => p.isCompleted)).length;
    const firstLessonId = allLessons[0]?.id || null;
    const nextUncompleted = allLessons.find((l) => !l.progress.some((p) => p.isCompleted));
    const nextLessonId = nextUncompleted?.id || firstLessonId;

    return {
      id: enr.id,
      progress: Math.round(enr.progress),
      course: {
        id: enr.course.id,
        title: enr.course.title,
        slug: enr.course.slug,
        subtitle: enr.course.subtitle,
        thumbnail: enr.course.thumbnail,
        level: enr.course.level,
        category: {
          id: enr.course.category.id,
          name: enr.course.category.name,
        },
        instructor: {
          name: enr.course.instructor.name,
          avatar: enr.course.instructor.avatar,
        },
        totalLessons: allLessons.length,
        completedLessons,
        firstLessonId,
        nextLessonId,
        nextLessonTitle: nextUncompleted ? nextUncompleted.title : "All lessons finished ✓",
        nextLessonDuration: nextUncompleted ? nextUncompleted.duration : null,
      },
    };
  });

  // E. Transform quiz results data
  const quizResultsData: StudentQuizResultItem[] = quizSubmissions.map((sub) => ({
    id: sub.id,
    quizId: sub.quiz.id,
    quizTitle: sub.quiz.title,
    courseTitle: sub.quiz.course.title,
    courseSlug: sub.quiz.course.slug,
    score: sub.score,
    passed: sub.passed,
    passingScore: sub.quiz.passingScore,
    date: formatDate(sub.createdAt),
  }));

  const totalPendingActionItems = analytics.pendingQuizzesCount + analytics.pendingAssignmentsCount;

  return (
    <DashboardShell user={user} notifications={notifications}>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* =================================================================== */}
        {/* 1. PERSONALIZED WELCOME BANNER                                      */}
        {/* =================================================================== */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#132752] to-[#0B1B3D] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[radial-gradient(ellipse_at_center,rgba(255,107,0,0.18),transparent_70%)] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.18),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-[11px] font-bold text-orange-300">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>SkillNova Academy • Official Student Dashboard</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back,{" "}
                <span className="text-[#FF6B00]">{user.name}</span>!
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Continue advancing your technical competencies. Track your curricula progress,
                complete structured module assessments, and inspect your cryptographic certificates.
              </p>

              {/* Student Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-200">
                  <Mail className="w-3.5 h-3.5 text-orange-400" />
                  <span>{user.email}</span>
                </span>
                {user.phone && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{user.phone}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>BS Computer Science FYP</span>
                </span>
              </div>
            </div>

            {/* Quick Navigation CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                href="/dashboard/student/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 transition-colors duration-150"
              >
                <BookOpen className="w-4 h-4" />
                <span>My Courses ({analytics.totalEnrolled})</span>
              </Link>
              <Link
                href="/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors duration-150"
              >
                <Compass className="w-4 h-4 text-orange-400" />
                <span>Browse Catalog</span>
              </Link>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. SUMMARY METRIC CARDS (REAL DATA ONLY)                            */}
        {/* =================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Enrolled Courses */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">Enrolled Courses</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B1B3D]">{analytics.totalEnrolled}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">Active curricula</div>
            </div>
          </div>

          {/* 2. In Progress */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">In Progress</span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#FF6B00]">{analytics.inProgressCount}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">Active coursework</div>
            </div>
          </div>

          {/* 3. Completed Courses */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">Completed</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{analytics.completedCount}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">100% syllabus finished</div>
            </div>
          </div>

          {/* 4. Pending Deliverables & Assessments */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">Action Items</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{totalPendingActionItems}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">Quizzes & assignments</div>
            </div>
          </div>

          {/* 5. Average Quiz Score */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors duration-150 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 truncate">Avg Score</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-600">
                {analytics.averageQuizScore > 0 ? `${analytics.averageQuizScore}%` : "N/A"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">Evaluated benchmarks</div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. NEW STUDENT ONBOARDING (IF 0 ENROLLMENTS)                        */}
        {/* =================================================================== */}
        {enrollments.length === 0 ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs relative overflow-hidden">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#FF6B00]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Getting Started with SkillNova Academy</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D]">
                  Welcome to Your Engineering Dashboard!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You haven&apos;t enrolled in any courses yet. SkillNova offers hands-on full-stack engineering,
                  cloud systems, and AI tracks with cryptographically verifiable completion certificates.
                </p>

                {/* 3 Step Onboarding Flow */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-[#0B1B3D] text-white flex items-center justify-center text-xs font-bold">1</div>
                    <h4 className="text-xs font-bold text-[#0B1B3D]">Explore Catalog</h4>
                    <p className="text-[11px] text-slate-500">Choose from Web, Cloud, or AI tracks.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center text-xs font-bold">2</div>
                    <h4 className="text-xs font-bold text-[#0B1B3D]">Learn & Code</h4>
                    <p className="text-[11px] text-slate-500">Complete modular lessons & submit projects.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                    <h4 className="text-xs font-bold text-[#0B1B3D]">Get Certified</h4>
                    <p className="text-[11px] text-slate-500">Pass assessment to issue verified credentials.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/25 transition-all"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Course Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Recommended Starter Tracks */}
            {featuredCourses.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-[#0B1B3D] mb-4">
                  Recommended Curriculum Tracks to Start
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {featuredCourses.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {c.category.name}
                        </span>
                        <h4 className="text-sm font-bold text-[#0B1B3D] leading-snug">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {c.subtitle}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-[#0B1B3D]">
                          {c.price > 0 ? formatPrice(c.price) : "Free Access"}
                        </span>
                        <Link
                          href={`/courses/${c.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline"
                        >
                          <span>View Track</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =================================================================== */
          /* 4. ACTIVE STUDENT SECTIONS (MAKE NEXT ACTION OBVIOUS)               */
          /* =================================================================== */
          <>
            {/* Action Center: Continue Learning + Urgent Action Deliverable */}
            <StudentActionCenter
              inProgressCourse={inProgressCourseInfo}
              urgentAction={urgentAction}
            />

            {/* Active Coursework with Search & Filters */}
            <StudentActiveCoursework courses={courseCardsData} />

            {/* Academic Deliverables & Assessment Center */}
            <StudentAssessmentsDeliverables
              assignments={allAssignments}
              quizResults={quizResultsData}
            />

            {/* Weekly Activity Heatmap Chart */}
            <WeeklyActivityCard
              activity={analytics.weeklyActivity}
              totalActionsThisWeek={analytics.totalActionsThisWeek}
            />
          </>
        )}

        {/* =================================================================== */}
        {/* 5. VERIFIED DIGITAL CERTIFICATES SHOWCASE                           */}
        {/* =================================================================== */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0B1B3D]">
                Earned Certificates & Verified Credentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic academic credentials issued upon 100% curriculum completion & quiz benchmarks
              </p>
            </div>
            <Link
              href="/dashboard/student/certificates"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#EA580C]"
            >
              <span>View Credential Gallery ({certificates.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-emerald-500/30 p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between min-w-0 hover:border-emerald-500/50 transition-colors duration-150"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                        <Award className="w-6 h-6" />
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Verified Credential
                          </span>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            Issued {formatDate(cert.issuedAt)}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-[#0B1B3D] pt-1 truncate">
                          {cert.course.title}
                        </h4>
                        {cert.grade && (
                          <div className="text-xs font-semibold text-emerald-700">
                            Verified Final Grade: {cert.grade}%
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Credential Code:</span>
                      <CopyCodeButton code={cert.certificateCode} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <Link
                      href={`/verify?code=${cert.certificateCode}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B1B3D] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Verify on Public Ledger</span>
                    </Link>

                    <Link
                      href="/dashboard/student/certificates"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline"
                    >
                      <span>View Full Certificate</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#0B1B3D]">No Certificates Earned Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Complete all course modules and pass the benchmark quiz assessment to issue authentic cryptographic credentials. Zero unearned certificates.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
