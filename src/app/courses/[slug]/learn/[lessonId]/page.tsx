import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  BookOpen, 
  FileText, 
  HelpCircle
} from "lucide-react";
import { toggleLessonProgress } from "@/app/actions/learning";

interface ClassroomPageProps {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const { slug, lessonId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/courses/${slug}`);
  }

  // Fetch course, sections, lessons, and current user progress
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: true,
      quizzes: true,
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
      enrollments: {
        where: { userId: user.id },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Fetch all user's completed lessons for this course
  const allLessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id));
  const completedProgressList = await db.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: { in: allLessonIds },
      isCompleted: true,
    },
  });

  const completedLessonIdSet = new Set(completedProgressList.map((p) => p.lessonId));

  // Find current lesson
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = allLessons[currentLessonIndex] || allLessons[0];

  if (!currentLesson) {
    notFound();
  }

  const isCurrentCompleted = completedLessonIdSet.has(currentLesson.id);
  const userEnrollment = course.enrollments[0];
  const currentProgress = userEnrollment ? userEnrollment.progress : 0;

  // Previous & Next Lesson
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Check if certificate exists for this user and course
  const certificate = await db.certificate.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Classroom Breadcrumb & Header */}
      <div className="bg-[#0B1B3D] text-white py-4 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${course.slug}`}
              className="p-2 rounded-lg bg-[#132752] text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                {course.category.name}
              </span>
              <h1 className="text-base sm:text-lg font-bold truncate max-w-md sm:max-w-xl">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-white">
                Course Progress: {currentProgress}%
              </div>
              <div className="text-[10px] text-slate-400">
                {completedProgressList.length} of {allLessons.length} lessons completed
              </div>
            </div>
            <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Banner if 100% completed */}
      {certificate && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-300 shrink-0" />
              <span>
                <strong>Curriculum Completed!</strong> Your official certificate has been issued with Code: <strong>{certificate.certificateCode}</strong>
              </span>
            </div>
            <Link
              href={`/verify?code=${certificate.certificateCode}`}
              className="px-3 py-1 bg-white text-emerald-800 font-bold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              View Certificate
            </Link>
          </div>
        </div>
      )}

      {/* Main Classroom Split Screen */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Video & Content Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Embedded Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative border border-slate-800">
              {currentLesson.videoUrl ? (
                <iframe
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <PlayCircle className="w-16 h-16 text-[#FF6B00] mb-2" />
                  <p className="text-sm">Video content for this lesson</p>
                </div>
              )}
            </div>

            {/* Lesson Title & Interactive Completion Button */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400">
                  Lesson {currentLessonIndex + 1} of {allLessons.length} • {currentLesson.duration}
                </span>
                <h2 className="text-xl font-extrabold text-[#0B1B3D] mt-0.5">
                  {currentLesson.title}
                </h2>
              </div>

              {/* Functional Database Trigger: Mark Completed */}
              <form action={toggleLessonProgress.bind(null, currentLesson.id, course.slug)}>
                <button
                  type="submit"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isCurrentCompleted
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                      : "bg-[#FF6B00] hover:bg-[#EA580C] text-white hover:scale-105"
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isCurrentCompleted ? "text-emerald-600" : "text-white"}`} />
                  <span>{isCurrentCompleted ? "Completed ✓" : "Mark as Completed"}</span>
                </button>
              </form>
            </div>

            {/* Lesson Notes & Theory Content */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0B1B3D] border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-[#FF6B00]" />
                <span>Lecture Notes & Engineering Overview</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {currentLesson.content ||
                  "In this lecture, students delve into software engineering design patterns, state hydration paradigms, and scalable architecture."}
              </p>
            </div>

            {/* Navigation between lessons */}
            <div className="flex items-center justify-between pt-2">
              {prevLesson ? (
                <Link
                  href={`/courses/${course.slug}/learn/${prevLesson.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous: {prevLesson.title.substring(0, 24)}...</span>
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link
                  href={`/courses/${course.slug}/learn/${nextLesson.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors"
                >
                  <span>Next: {nextLesson.title.substring(0, 24)}...</span>
                  <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
                </Link>
              ) : course.quizzes.length > 0 ? (
                <Link
                  href={`/courses/${course.slug}/quiz/${course.quizzes[0].id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#EA580C] shadow-md transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Take Assessment Quiz</span>
                </Link>
              ) : null}
            </div>
          </div>

          {/* Side Playlist: Course Syllabus Breakdown */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-xs text-[#0B1B3D] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF6B00]" />
                <span>Course Modules</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {allLessons.length} Total Lessons
              </span>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
              {course.sections.map((sec, sIdx) => (
                <div key={sec.id} className="p-3">
                  <div className="text-xs font-bold text-slate-700 mb-2 px-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#0B1B3D] text-white text-[10px] flex items-center justify-center font-bold">
                      {sIdx + 1}
                    </span>
                    <span>{sec.title}</span>
                  </div>

                  <div className="space-y-1">
                    {sec.lessons.map((les) => {
                      const isCompleted = completedLessonIdSet.has(les.id);
                      const isCurrent = les.id === currentLesson.id;

                      return (
                        <Link
                          key={les.id}
                          href={`/courses/${course.slug}/learn/${les.id}`}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                            isCurrent
                              ? "bg-orange-50 border border-orange-200 font-bold text-[#FF6B00]"
                              : "hover:bg-slate-50 text-slate-600 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                            <span className="line-clamp-1">{les.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                            {les.duration}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Assessment Quiz Link in Sidebar */}
              {course.quizzes.length > 0 && (
                <div className="p-4 bg-orange-50/50">
                  <Link
                    href={`/courses/${course.slug}/quiz/${course.quizzes[0].id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-orange-200 text-xs font-bold text-[#0B1B3D] hover:border-[#FF6B00] transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-[#FF6B00]">
                      <HelpCircle className="w-4 h-4" />
                      <span>{course.quizzes[0].title}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                      Quiz
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
