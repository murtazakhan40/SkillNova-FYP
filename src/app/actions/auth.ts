"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  verifyCredentials,
  createSession,
  destroySession,
  getCurrentUser,
} from "@/lib/auth";

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  // Strict database hash verification (no backdoor bypass)
  const user = await verifyCredentials(email, password);

  if (!user) {
    return { error: "Invalid email or password. Please verify your credentials." };
  }

  // Issue cryptographically signed HMAC-SHA256 session
  await createSession(user);

  // Safe server-side role redirection
  if (user.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (user.role === "TRAINER") {
    redirect("/dashboard/trainer");
  } else {
    redirect("/dashboard/student");
  }
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const roleInput = (formData.get("role") as string)?.toUpperCase();
  
  // Only permit student or trainer self-registration; ADMIN cannot be self-registered
  const role = roleInput === "TRAINER" ? "TRAINER" : "STUDENT";

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "An account with this email address already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      headline: role === "TRAINER" ? "Course Instructor at SkillNova" : "Student Learner",
    },
  });

  // Issue cryptographically signed session
  await createSession({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role as "STUDENT" | "TRAINER" | "ADMIN",
    avatar: newUser.avatar,
    headline: newUser.headline,
    phone: newUser.phone,
  });

  if (newUser.role === "TRAINER") {
    redirect("/dashboard/trainer");
  } else {
    redirect("/dashboard/student");
  }
}

/**
 * Development & Evaluation Helper: Quick Sign-In.
 * Strictly blocked in production environments unless explicitly authorized by server environment.
 */
export async function quickDemoLogin(
  role: "STUDENT" | "TRAINER" | "ADMIN",
  customEmailOrFormData?: string | FormData,
  redirectTo?: string
) {
  const isProduction = process.env.NODE_ENV === "production";
  const allowDemoInProd = process.env.ENABLE_DEMO_LOGINS === "true";

  if (isProduction && !allowDemoInProd) {
    redirect("/login?error=demo_disabled_in_production");
  }

  const customEmail =
    typeof customEmailOrFormData === "string" ? customEmailOrFormData : undefined;

  const emailMap = {
    STUDENT: customEmail || "murtazwazir.edu@gmail.com",
    TRAINER: customEmail || "trainer@skillnova.com",
    ADMIN: customEmail || "admin@skillnova.com",
  };

  const targetEmail = customEmail || emailMap[role];
  let user = await db.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user && role === "STUDENT") {
    user = await db.user.findFirst({
      where: { role: "STUDENT" },
    });
  }

  if (!user) {
    redirect(`/login?error=user_not_found`);
  }

  // Issue signed session
  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "STUDENT" | "TRAINER" | "ADMIN",
    avatar: user.avatar,
    headline: user.headline,
    phone: user.phone,
  });

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (user.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (user.role === "TRAINER") {
    redirect("/dashboard/trainer");
  } else {
    redirect("/dashboard/student");
  }
}

/**
 * Development & Evaluation Helper: Faculty Sign-In.
 * Strictly blocked in production environments unless explicitly authorized.
 */
export async function loginWithFacultyEmail(email: string) {
  const isProduction = process.env.NODE_ENV === "production";
  const allowDemoInProd = process.env.ENABLE_DEMO_LOGINS === "true";

  if (isProduction && !allowDemoInProd) {
    redirect("/login?error=demo_disabled_in_production");
  }

  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    redirect("/login?error=faculty_not_found");
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "STUDENT" | "TRAINER" | "ADMIN",
    avatar: user.avatar,
    headline: user.headline,
    phone: user.phone,
  });

  if (user.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (user.role === "TRAINER") {
    redirect("/dashboard/trainer");
  } else {
    redirect("/dashboard/student");
  }
}

/**
 * Direct Classroom Navigation.
 * Verifies active user session and validates that enrollment exists before entering the classroom.
 * Eliminates previous backdoor bypass.
 */
export async function directCourseClassroomAccess(courseId: string, courseSlug: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/courses/${courseSlug}`);
  }

  // Enforce server-side enrollment check
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  if (!enrollment) {
    // User is not enrolled; redirect to course landing page with checkout prompt
    redirect(`/courses/${courseSlug}?enrollment=required`);
  }

  // Find first lesson of this course
  const firstLesson = await db.lesson.findFirst({
    where: {
      section: {
        courseId,
      },
    },
    orderBy: { order: "asc" },
  });

  if (firstLesson) {
    redirect(`/courses/${courseSlug}/learn/${firstLesson.id}`);
  }

  redirect(`/courses/${courseSlug}`);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
