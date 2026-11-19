"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  verifyCredentials,
  createSession,
  destroySession,
  getCurrentUser,
} from "@/lib/auth";
import { LoginSchema, RegisterSchema } from "@/lib/validations";

// In-Memory Sliding Window Rate Limiter for Brute-Force Defense
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}
const loginAttempts = new Map<string, RateLimitEntry>();
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(key: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) return { allowed: true };

  // Check if locked
  if (entry.lockedUntil && now < entry.lockedUntil) {
    const waitMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  // Reset window if expired
  if (now - entry.firstAttempt > WINDOW_DURATION_MS) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(key: string): { isNowLocked: boolean; remainingAttempts: number } {
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.firstAttempt > WINDOW_DURATION_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
    return { isNowLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - 1 };
  }

  entry.count += 1;
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    return { isNowLocked: true, remainingAttempts: 0 };
  }

  return { isNowLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - entry.count };
}

function clearRateLimit(key: string) {
  loginAttempts.delete(key);
}

export async function loginAction(prevState: unknown, formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please enter both email and password." };
  }

  const { email, password } = parsed.data;

  // 1. Enforce Rate Limiting & Brute Force Lockout
  const rateLimitStatus = checkRateLimit(email);
  if (!rateLimitStatus.allowed) {
    return {
      error: `Too many failed login attempts. For security reasons, please wait ${rateLimitStatus.waitMinutes} minute(s) before trying again.`,
    };
  }

  // 2. Strict database hash verification with timing attack protection
  const user = await verifyCredentials(email, password);

  if (!user) {
    const { isNowLocked, remainingAttempts } = recordFailedAttempt(email);

    // Audit log failed login without storing credentials
    try {
      await db.auditLog.create({
        data: {
          action: "AUTH_LOGIN_FAILED",
          entity: "User",
          entityId: email,
          details: JSON.stringify({
            email,
            isLocked: isNowLocked,
            remainingAttempts,
          }),
        },
      });
    } catch {
      // Non-blocking telemetry
    }

    if (isNowLocked) {
      return {
        error: "Too many failed login attempts. Account temporarily locked for 10 minutes.",
      };
    }

    return {
      error: `Invalid email or password. (${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining before temporary lockout)`,
    };
  }

  // Clear rate limit record on successful authentication
  clearRateLimit(email);

  // 3. Issue cryptographically signed HMAC-SHA256 session
  await createSession(user);

  // 4. Audit log successful login
  try {
    await db.auditLog.create({
      data: {
        action: "AUTH_LOGIN_SUCCESS",
        entity: "User",
        entityId: user.id,
        userId: user.id,
        details: JSON.stringify({ email: user.email, role: user.role }),
      },
    });
  } catch {
    // Non-blocking telemetry
  }

  // 5. Open Redirect Protection: Only permit local, relative destinations
  const rawRedirect = formData.get("redirectTo") || formData.get("redirect");
  let targetRedirect: string | null = null;
  if (
    typeof rawRedirect === "string" &&
    rawRedirect.startsWith("/") &&
    !rawRedirect.startsWith("//") &&
    !rawRedirect.startsWith("/\\")
  ) {
    targetRedirect = rawRedirect;
  }

  if (targetRedirect) {
    redirect(targetRedirect);
  }

  // Role-based default destination
  if (user.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (user.role === "TRAINER") {
    redirect("/dashboard/trainer");
  } else {
    redirect("/dashboard/student");
  }
}

/**
 * Account Recovery: Request Password Reset Token
 */
export async function requestPasswordResetAction(prevState: unknown, formData: FormData) {
  const emailRaw = (formData.get("email") as string)?.toLowerCase().trim();
  if (!emailRaw) {
    return { error: "Please enter your registered email address." };
  }

  const user = await db.user.findUnique({
    where: { email: emailRaw },
  });

  // Always return identical message to avoid email enumeration
  if (!user) {
    return {
      success: true,
      message: "If an account exists with this email address, password recovery instructions have been initiated.",
    };
  }

  // Generate cryptographically random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

  await db.passwordResetToken.create({
    data: {
      email: user.email,
      token,
      expiresAt,
    },
  });

  await db.auditLog.create({
    data: {
      action: "AUTH_PASSWORD_RESET_REQUESTED",
      entity: "User",
      entityId: user.id,
      userId: user.id,
      details: JSON.stringify({ email: user.email }),
    },
  });

  return {
    success: true,
    message: "Password recovery instructions have been recorded. In demo mode, your token is active.",
    demoToken: process.env.NODE_ENV !== "production" ? token : undefined,
  };
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const roleInput = (formData.get("role") as string)?.toUpperCase();
  // Only permit student or trainer self-registration; ADMIN cannot be self-registered
  const role = roleInput === "TRAINER" ? "TRAINER" : "STUDENT";

  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "All fields are required." };
  }

  const { name, email, password } = parsed.data;

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
