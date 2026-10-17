"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function enrollInCourseAction(courseId: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if enrollment exists
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

  redirect("/dashboard/student");
}
