"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Mark a lesson as completed, calculate course progress, and auto-issue certificate at 100%
 */
export async function toggleLessonProgress(lessonId: string, courseSlug: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Find lesson and verify course
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      section: {
        include: {
          course: {
            include: {
              sections: {
                include: { lessons: true },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const course = lesson.section.course;

  // Toggle progress in DB
  const existingProgress = await db.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: lesson.id,
      },
    },
  });

  const nextState = !existingProgress?.isCompleted;

  await db.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: lesson.id,
      },
    },
    update: {
      isCompleted: nextState,
      completedAt: nextState ? new Date() : null,
    },
    create: {
      userId: user.id,
      lessonId: lesson.id,
      isCompleted: nextState,
      completedAt: nextState ? new Date() : null,
    },
  });

  // Recalculate total course progress
  const allCourseLessonIds = course.sections.flatMap((s) =>
    s.lessons.map((l) => l.id)
  );
  const totalLessons = allCourseLessonIds.length;

  const completedCount = await db.lessonProgress.count({
    where: {
      userId: user.id,
      lessonId: { in: allCourseLessonIds },
      isCompleted: true,
    },
  });

  const progressPercent = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  // Update Enrollment record in DB
  await db.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
    update: {
      progress: progressPercent,
      completedAt: progressPercent === 100 ? new Date() : null,
    },
    create: {
      userId: user.id,
      courseId: course.id,
      progress: progressPercent,
      completedAt: progressPercent === 100 ? new Date() : null,
    },
  });

  // Automatically award certificate if 100% completed and not yet issued
  if (progressPercent === 100) {
    const existingCert = await db.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (!existingCert) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `SN-2026-${randomSuffix}`;

      await db.certificate.create({
        data: {
          certificateCode: code,
          userId: user.id,
          courseId: course.id,
          issuedAt: new Date(),
        },
      });
    }
  }

  revalidatePath(`/courses/${courseSlug}/learn/${lessonId}`);
  revalidatePath(`/dashboard/student`);
  revalidatePath(`/courses/${courseSlug}`);
}

/**
 * Submit Course Assessment Quiz and record attempt in database
 */
export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, number>
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true,
      course: true,
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  let correctCount = 0;
  quiz.questions.forEach((q) => {
    if (answers[q.id] === q.correctIndex) {
      correctCount += 1;
    }
  });

  const scorePercent =
    quiz.questions.length > 0
      ? Math.round((correctCount / quiz.questions.length) * 100)
      : 0;

  const passed = scorePercent >= quiz.passingScore;

  // Persist submission in database
  const submission = await db.quizSubmission.create({
    data: {
      quizId: quiz.id,
      userId: user.id,
      score: scorePercent,
      passed,
    },
  });

  revalidatePath(`/dashboard/student`);

  return {
    submissionId: submission.id,
    score: scorePercent,
    passed,
    passingScore: quiz.passingScore,
    correctCount,
    totalQuestions: quiz.questions.length,
  };
}

/**
 * Submit student review for a course
 */
export async function submitCourseReview(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const courseId = formData.get("courseId") as string;
  const courseSlug = formData.get("courseSlug") as string;
  const rating = parseInt(formData.get("rating") as string, 10) || 5;
  const comment = formData.get("comment") as string;

  if (!courseId || !comment) {
    return;
  }

  await db.review.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
    update: {
      rating,
      comment,
      createdAt: new Date(),
    },
    create: {
      userId: user.id,
      courseId,
      rating,
      comment,
    },
  });

  revalidatePath(`/courses/${courseSlug}`);
}

/**
 * Trainer: Create New Course in Database
 */
export async function createCourseAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const subtitle = formData.get("subtitle") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const level = (formData.get("level") as string) || "BEGINNER";
  const price = parseFloat(formData.get("price") as string) || 0;
  const thumbnail =
    (formData.get("thumbnail") as string) ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  if (!title || !description || !categoryId) {
    return;
  }

  // Generate unique slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  // Create course with default introductory section and lesson
  const newCourse = await db.course.create({
    data: {
      title,
      slug,
      subtitle,
      description,
      price,
      level,
      thumbnail,
      published: true,
      instructorId: user.id,
      categoryId,
      sections: {
        create: {
          title: "Module 1: Orientation & Core Fundamentals",
          order: 1,
          lessons: {
            create: [
              {
                title: "Welcome to the Course & Environment Setup",
                duration: "12 mins",
                content: "Detailed walkthrough of course tools, repositories, and learning objectives.",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                isFree: true,
                order: 1,
              },
            ],
          },
        },
      },
    },
  });

  revalidatePath("/courses");
  revalidatePath("/dashboard/trainer");

  redirect(`/courses/${newCourse.slug}`);
}

/**
 * Admin: Toggle course publish state
 */
export async function toggleCoursePublish(courseId: string, published: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  await db.course.update({
    where: { id: courseId },
    data: { published },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/courses");
}

/**
 * Admin: Change user role in database
 */
export async function updateUserRole(userId: string, newRole: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  await db.user.update({
    where: { id: userId },
    data: { role: newRole.toUpperCase() },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
}
