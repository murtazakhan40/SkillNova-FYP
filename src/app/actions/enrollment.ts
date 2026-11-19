"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth, getCurrentUser, createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MinorGuardianEnrollmentSchema } from "@/lib/validations";
import { sendParentAcademicReport } from "@/lib/parent-reports";

export interface GuardianStatusResult {
  isAuthenticated: boolean;
  needsGuardianConsent: boolean;
  age: number | null;
  isMinor: boolean;
  hasParentContact: boolean;
  parentName?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
}

/**
 * Check if the active student is under 18 and whether parent/guardian details are missing.
 */
export async function checkStudentGuardianStatusAction(): Promise<GuardianStatusResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      isAuthenticated: false,
      needsGuardianConsent: false,
      age: null,
      isMinor: false,
      hasParentContact: false,
    };
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      age: true,
      parentName: true,
      parentEmail: true,
      parentPhone: true,
    },
  });

  const age = dbUser?.age ?? null;
  const isMinor = age !== null && age < 18;
  const hasParentContact = Boolean(
    dbUser?.parentName && dbUser?.parentEmail && dbUser?.parentPhone
  );

  // If age is unrecorded, or if student is under 18 and lacks complete parent details
  const needsGuardianConsent = isMinor ? !hasParentContact : age === null;

  return {
    isAuthenticated: true,
    needsGuardianConsent,
    age,
    isMinor,
    hasParentContact,
    parentName: dbUser?.parentName || null,
    parentEmail: dbUser?.parentEmail || null,
    parentPhone: dbUser?.parentPhone || null,
  };
}

/**
 * Direct Free Course Enrollment Action.
 * Strictly verifies user authentication, pricing policy, and under-18 guardian consent.
 */
export async function enrollInCourseAction(courseId: string) {
  const user = await requireAuth();

  const [course, dbUser] = await Promise.all([
    db.course.findUnique({ where: { id: courseId } }),
    db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        age: true,
        parentName: true,
        parentEmail: true,
        parentPhone: true,
      },
    }),
  ]);

  if (!course) {
    throw new Error("Course not found");
  }

  // Enforce pricing policy: paid courses cannot be directly enrolled for free
  if (course.price > 0) {
    redirect(`/checkout/${course.slug}`);
  }

  // Under-18 protection: Minor students MUST provide parent details before enrollment
  const isMinor = dbUser?.age !== null && dbUser?.age !== undefined && dbUser.age < 18;
  const missingGuardian = !dbUser?.parentEmail || !dbUser?.parentPhone || !dbUser?.parentName;

  if (isMinor && missingGuardian) {
    redirect(`/courses/${course.slug}?minor_guardian_required=true`);
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

    // If student is under 18 and has parent email, dispatch initial enrollment notification to parent
    if (isMinor && dbUser?.parentEmail) {
      try {
        await sendParentAcademicReport({
          studentId: user.id,
          courseId,
          reportType: "ENROLLMENT",
          customNote: `Welcome! Your child has enrolled in "${course.title}". You will receive academic progress reports as they advance through lectures and quizzes.`,
        });
      } catch {
        // Non-blocking telemetry
      }
    }
  }

  redirect("/dashboard/student/courses");
}

export interface EnrollWithGuardianResult {
  success?: boolean;
  error?: string;
  redirectUrl?: string;
}

/**
 * Kid-Friendly & Minor Guardian Enrollment Action.
 * Atomically updates student age & parent/guardian contact info, and grants enrollment.
 */
export async function enrollWithGuardianAction(
  _prevState: EnrollWithGuardianResult | null,
  formData: FormData
): Promise<EnrollWithGuardianResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Authentication required. Please log in to enroll." };
  }

  const courseId = (formData.get("courseId") as string)?.trim();
  const ageRaw = formData.get("age");
  const parentName = (formData.get("parentName") as string)?.trim() || null;
  const parentEmail = (formData.get("parentEmail") as string)?.trim().toLowerCase() || null;
  const parentPhone = (formData.get("parentPhone") as string)?.trim() || null;
  const parentRelationship = (formData.get("parentRelationship") as string)?.trim() || null;

  const validation = MinorGuardianEnrollmentSchema.safeParse({
    courseId,
    age: ageRaw,
    parentName,
    parentEmail,
    parentPhone,
    parentRelationship,
  });

  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || "Please complete all required fields.",
    };
  }

  const validatedData = validation.data;

  const course = await db.course.findUnique({
    where: { id: validatedData.courseId },
  });

  if (!course) {
    return { error: "Requested course was not found." };
  }

  const isMinor = validatedData.age < 18;

  try {
    // 1. Update student age and guardian details
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        age: validatedData.age,
        parentName: isMinor ? validatedData.parentName : validatedData.parentName || undefined,
        parentEmail: isMinor ? validatedData.parentEmail : validatedData.parentEmail || undefined,
        parentPhone: isMinor ? validatedData.parentPhone : validatedData.parentPhone || undefined,
        parentRelationship: validatedData.parentRelationship || null,
        parentConsentGiven: isMinor,
        parentConsentAt: isMinor ? new Date() : null,
      },
    });

    // 2. Refresh active session
    await createSession({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role as "STUDENT" | "TRAINER" | "ADMIN",
      avatar: updatedUser.avatar,
      headline: updatedUser.headline,
      phone: updatedUser.phone,
      age: updatedUser.age,
      parentEmail: updatedUser.parentEmail,
    });

    // 3. For paid courses, direct to checkout with updated guardian details
    if (course.price > 0) {
      return {
        success: true,
        redirectUrl: `/checkout/${course.slug}`,
      };
    }

    // 4. For free courses, grant enrollment
    await db.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        courseId: course.id,
        progress: 0.0,
      },
    });

    // 5. If under 18, dispatch initial parent notification
    if (isMinor && updatedUser.parentEmail) {
      try {
        await sendParentAcademicReport({
          studentId: user.id,
          courseId: course.id,
          reportType: "ENROLLMENT",
          customNote: `Welcome to SkillNova Academy! Your child has enrolled in "${course.title}". Periodic academic progress reports will be sent to this email.`,
        });
      } catch {
        // Non-blocking telemetry
      }
    }

    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/dashboard/student/courses");
    revalidatePath("/dashboard/student");

    return {
      success: true,
      redirectUrl: `/courses/${course.slug}`,
    };
  } catch (err: unknown) {
    console.error("Guardian enrollment error:", err);
    return {
      error: "Unable to process enrollment. Please verify your details and try again.",
    };
  }
}
