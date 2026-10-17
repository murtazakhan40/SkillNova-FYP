"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getCurrentUser,
  requireAuth,
  requireRole,
  requireCourseEnrollment,
} from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Mark a lesson as completed, calculate course progress, and auto-issue certificate at 100%.
 * Strictly requires the student to be actively enrolled in the course.
 */
export async function toggleLessonProgress(lessonId: string, courseSlug: string) {
  const user = await requireAuth();

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

  // Enforce server-side course enrollment authorization
  await requireCourseEnrollment(user.id, course.id);

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

  // Execute progress, enrollment recalculation, and certificate issuance inside an atomic ACID transaction
  await db.$transaction(async (tx) => {
    // 1. Upsert LessonProgress
    await tx.lessonProgress.upsert({
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

    // 2. Recalculate total course progress
    const allCourseLessonIds = course.sections.flatMap((s) =>
      s.lessons.map((l) => l.id)
    );
    const totalLessons = allCourseLessonIds.length;

    const completedCount = await tx.lessonProgress.count({
      where: {
        userId: user.id,
        lessonId: { in: allCourseLessonIds },
        isCompleted: true,
      },
    });

    const progressPercent =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // 3. Upsert Enrollment record
    await tx.enrollment.upsert({
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

    // 4. Automatically award certificate if 100% completed and not yet issued
    if (progressPercent === 100) {
      const existingCert = await tx.certificate.findUnique({
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

        await tx.certificate.create({
          data: {
            certificateCode: code,
            userId: user.id,
            courseId: course.id,
            issuedAt: new Date(),
          },
        });
      }
    }
  });

  revalidatePath(`/courses/${courseSlug}/learn/${lessonId}`);
  revalidatePath(`/dashboard/student`);
  revalidatePath(`/courses/${courseSlug}`);
}

/**
 * Submit Course Assessment Quiz and record attempt in database.
 * Strictly verifies the student is actively enrolled in the course.
 */
export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, number>
) {
  const user = await requireAuth();

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

  // Enforce server-side course enrollment authorization
  await requireCourseEnrollment(user.id, quiz.courseId);

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
 * Submit student review for a course.
 * Strictly checks that the student is enrolled in the course.
 */
export async function submitCourseReview(formData: FormData) {
  const user = await requireAuth();

  const courseId = formData.get("courseId") as string;
  const courseSlug = formData.get("courseSlug") as string;
  const rating = parseInt(formData.get("rating") as string, 10) || 5;
  const comment = (formData.get("comment") as string)?.trim();

  if (!courseId || !comment) {
    return;
  }

  // Enforce server-side course enrollment authorization
  await requireCourseEnrollment(user.id, courseId);

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
 * Trainer/Admin: Create New Course in Database.
 * Strictly enforces TRAINER or ADMIN role.
 */
export async function createCourseAction(formData: FormData): Promise<void> {
  const user = await requireRole(["TRAINER", "ADMIN"]);

  const title = (formData.get("title") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
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
 * Admin: Toggle course publish state.
 * Strictly enforces ADMIN role.
 */
export async function toggleCoursePublish(courseId: string, published: boolean) {
  const admin = await requireRole(["ADMIN"]);

  await db.course.update({
    where: { id: courseId },
    data: { published },
  });

  // Sanitized audit log entry
  await db.auditLog.create({
    data: {
      action: published ? "COURSE_PUBLISHED" : "COURSE_UNPUBLISHED",
      entity: "Course",
      entityId: courseId,
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/courses");
}

/**
 * Admin: Change user role in database.
 * Strictly enforces ADMIN role.
 */
export async function updateUserRole(userId: string, newRole: string) {
  const admin = await requireRole(["ADMIN"]);

  // Prevent admin from removing their own admin role
  if (userId === admin.id && newRole !== "ADMIN") {
    throw new Error("Safety violation: Administrators cannot demote their own account.");
  }

  const role = newRole.toUpperCase();
  if (!["STUDENT", "TRAINER", "ADMIN"].includes(role)) {
    throw new Error("Invalid role requested.");
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });

  await db.user.update({
    where: { id: userId },
    data: { role },
  });

  // Sanitized audit log entry (NO secrets or passwords)
  await db.auditLog.create({
    data: {
      action: "USER_ROLE_UPDATED",
      entity: "User",
      entityId: userId,
      details: JSON.stringify({
        targetEmail: targetUser?.email,
        previousRole: targetUser?.role,
        updatedRole: role,
      }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
}

/**
 * Admin: Assign Trainer to Course.
 * Strictly enforces ADMIN role.
 */
export async function assignCourseInstructorAction(courseId: string, instructorId: string) {
  await requireRole(["ADMIN"]);

  const instructor = await db.user.findUnique({
    where: { id: instructorId },
  });

  if (!instructor || (instructor.role !== "TRAINER" && instructor.role !== "ADMIN")) {
    throw new Error("Target user is not an approved faculty trainer.");
  }

  await db.course.update({
    where: { id: courseId },
    data: { instructorId },
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/trainer");
  revalidatePath("/courses");
}

/**
 * Admin or Assigned Trainer: Update Course Metadata.
 * Strictly verifies ADMIN role or matching instructor ownership.
 */
export async function updateCourseDetailsAction(courseId: string, formData: FormData) {
  const user = await requireRole(["ADMIN", "TRAINER"]);

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  // Strict ownership check for trainers
  if (user.role === "TRAINER" && course.instructorId !== user.id) {
    throw new Error("Unauthorized: Trainers can only edit their own authored courses.");
  }

  const title = (formData.get("title") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim();
  const level = (formData.get("level") as string) || course.level;
  const price = parseFloat(formData.get("price") as string) || course.price;
  const categoryId = (formData.get("categoryId") as string) || course.categoryId;

  if (!title || !description) {
    return;
  }

  await db.course.update({
    where: { id: courseId },
    data: {
      title,
      subtitle,
      description,
      level,
      price,
      categoryId,
    },
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/trainer/courses");
  revalidatePath(`/courses/${course.slug}`);
}
