"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Enroll in a Course.
 * Strictly verifies user authentication and enforces the course pricing policy.
 * Direct zero-dollar enrollment is restricted to free courses (price == 0).
 */
export async function enrollInCourseAction(courseId: string) {
  const user = await requireAuth();

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Enforce pricing policy: paid courses cannot be directly enrolled for free
  if (course.price > 0) {
    redirect(`/courses/${course.slug}?checkout_required=true`);
  }

  // Check if enrollment already exists
  const existing = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  if (!existing) {
    await db.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        progress: 0.0,
      },
    });
  }

  redirect("/dashboard/student/courses");
}
