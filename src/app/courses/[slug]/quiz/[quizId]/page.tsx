import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { QuizClient } from "./QuizClient";

interface QuizPageProps {
  params: Promise<{
    slug: string;
    quizId: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug, quizId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/courses/${slug}`);
  }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true,
      course: {
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                select: { id: true, title: true },
              },
            },
          },
          enrollments: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  // Check enrollment status
  const isEnrolled = quiz.course.enrollments.length > 0;

  // Determine back/return URL
  // If student is enrolled, return them straight to the classroom player
  const allLessons = quiz.course.sections.flatMap((s) => s.lessons);
  const targetLessonId = allLessons[0]?.id;
  const returnUrl = isEnrolled && targetLessonId
    ? `/courses/${slug}/learn/${targetLessonId}`
    : `/courses/${slug}`;

  // Fetch previous attempts
  const previousSubmissions = await db.quizSubmission.findMany({
    where: {
      quizId: quiz.id,
      userId: user.id,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      score: true,
      passed: true,
      createdAt: true,
    },
  });

  // Parse questions options JSON safely
  const formattedQuestions = quiz.questions.map((q) => {
    let options: string[] = [];
    try {
      options = JSON.parse(q.optionsJson);
    } catch {
      options = ["Option A", "Option B", "Option C", "Option D"];
    }

    return {
      id: q.id,
      text: q.text,
      options,
      explanation: q.explanation,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <QuizClient
          quiz={quiz}
          questions={formattedQuestions}
          isEnrolled={isEnrolled}
          returnUrl={returnUrl}
          previousAttempts={previousSubmissions.map((s) => ({
            id: s.id,
            score: s.score,
            passed: s.passed,
            createdAt: s.createdAt.toISOString(),
          }))}
        />
      </main>

      <Footer />
    </div>
  );
}
