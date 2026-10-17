import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";
import {
  SessionUser,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  signSessionToken,
  verifySessionToken,
} from "./token";

export * from "./token";

/**
 * Verify user credentials against the database.
 * Strictly uses bcrypt hash verification. Zero backdoor or hardcoded fallback credentials.
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  // Strict bcrypt validation
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "STUDENT" | "TRAINER" | "ADMIN",
    avatar: user.avatar,
    headline: user.headline,
    phone: user.phone,
  };
}

/**
 * Create an HttpOnly, Secure, SameSite, cryptographically signed session cookie.
 */
export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  const token = signSessionToken(user);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Read current logged-in user from signed session cookie.
 * Returns null if missing, forged, or expired.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    return verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Terminate current session by clearing the cookie with maxAge=0.
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Server-Side Assertion: Require an authenticated session.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required.");
  }
  return user;
}

/**
 * Server-Side Assertion: Require a specific user role.
 */
export async function requireRole(
  allowedRoles: ("STUDENT" | "TRAINER" | "ADMIN")[]
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Forbidden: Access denied. Required role: [${allowedRoles.join(
        ", "
      )}]. Current: [${user.role}].`
    );
  }
  return user;
}

/**
 * Server-Side Assertion: Verify that a student is actively enrolled in a course.
 */
export async function requireCourseEnrollment(
  userId: string,
  courseId: string
): Promise<boolean> {
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    throw new Error("Forbidden: Active course enrollment is required.");
  }

  return true;
}
