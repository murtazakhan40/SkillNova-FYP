"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

/**
 * Admin: Update User Role (RBAC)
 * Strictly enforces ADMIN caller. Prevents self-demotion. Logs in AuditLog without secrets.
 */
export async function updateUserRoleAction(
  userId: string,
  newRole: string,
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  // Guard against self-demotion
  if (userId === admin.id && newRole !== "ADMIN") {
    throw new Error("Safety violation: Administrators cannot demote their own account.");
  }

  const role = newRole.toUpperCase().trim();
  if (!["STUDENT", "TRAINER", "ADMIN"].includes(role)) {
    throw new Error("Invalid role requested.");
  }

  const targetUser = await dbClient.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true, name: true },
  });

  if (!targetUser) {
    throw new Error("Target user account not found.");
  }

  const updated = await dbClient.user.update({
    where: { id: userId },
    data: { role },
  });

  // Log sanitized operational audit trace (NO secrets, passwords, or tokens)
  await dbClient.auditLog.create({
    data: {
      action: "USER_ROLE_UPDATED",
      entity: "User",
      entityId: userId,
      details: JSON.stringify({
        targetEmail: targetUser.email,
        targetName: targetUser.name,
        previousRole: targetUser.role,
        updatedRole: role,
        changedByEmail: admin.email,
      }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  return { success: true, user: updated };
}

/**
 * Admin: Update User Profile Metadata
 */
export async function adminUpdateUserProfileAction(
  userId: string,
  formData: FormData,
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  const name = (formData.get("name") as string)?.trim();
  const headline = (formData.get("headline") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!name || name.length < 2) {
    throw new Error("A valid full name is required.");
  }

  const updated = await dbClient.user.update({
    where: { id: userId },
    data: { name, headline, bio, phone },
  });

  await dbClient.auditLog.create({
    data: {
      action: "USER_PROFILE_ADMIN_MUTATION",
      entity: "User",
      entityId: userId,
      details: JSON.stringify({ name, headline, phone }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin/users");
  return { success: true, user: updated };
}

/**
 * Admin: Create New Course Category
 */
export async function createCategoryAction(
  formData: FormData,
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  const name = (formData.get("name") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const description = (formData.get("description") as string)?.trim() || null;
  const icon = (formData.get("icon") as string)?.trim() || "BookOpen";

  if (!name || name.length < 2) {
    throw new Error("Category title must be at least 2 characters long.");
  }

  if (!slug) {
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Validate uniqueness
  const existing = await dbClient.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existing) {
    throw new Error("A category with this name or slug already exists.");
  }

  const category = await dbClient.category.create({
    data: { name, slug, description, icon },
  });

  await dbClient.auditLog.create({
    data: {
      action: "CATEGORY_CREATED",
      entity: "Category",
      entityId: category.id,
      details: JSON.stringify({ name, slug, icon }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
  return { success: true, category };
}

/**
 * Admin: Delete Category (Safe validation: prevents deleting if courses are attached)
 */
export async function deleteCategoryAction(
  categoryId: string,
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  const category = await dbClient.category.findUnique({
    where: { id: categoryId },
    include: { courses: { select: { id: true, title: true } } },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  if (category.courses.length > 0) {
    throw new Error(
      `Cannot delete category "${category.name}". It currently has ${category.courses.length} assigned courses. Please reassign those courses first.`
    );
  }

  await dbClient.category.delete({
    where: { id: categoryId },
  });

  await dbClient.auditLog.create({
    data: {
      action: "CATEGORY_DELETED",
      entity: "Category",
      entityId: categoryId,
      details: JSON.stringify({ name: category.name, slug: category.slug }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
  return { success: true };
}

/**
 * Admin: Toggle Course Published State
 */
export async function adminToggleCoursePublishAction(
  courseId: string,
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  const course = await dbClient.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, published: true },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  const updated = await dbClient.course.update({
    where: { id: courseId },
    data: { published: !course.published },
  });

  await dbClient.auditLog.create({
    data: {
      action: updated.published ? "COURSE_PUBLISHED" : "COURSE_UNPUBLISHED",
      entity: "Course",
      entityId: courseId,
      details: JSON.stringify({
        title: course.title,
        status: updated.published ? "PUBLISHED" : "DRAFT",
      }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
  return { success: true, course: updated };
}

/**
 * Admin: Assign Trainer/Instructor to Course
 */
export async function adminAssignCourseInstructorAction(
  courseId: string,
  instructorId: string,
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  const instructor = await dbClient.user.findUnique({
    where: { id: instructorId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!instructor || (instructor.role !== "TRAINER" && instructor.role !== "ADMIN")) {
    throw new Error("Selected user is not an approved faculty trainer or administrator.");
  }

  const updated = await dbClient.course.update({
    where: { id: courseId },
    data: { instructorId },
    include: { instructor: true },
  });

  await dbClient.auditLog.create({
    data: {
      action: "COURSE_INSTRUCTOR_ASSIGNED",
      entity: "Course",
      entityId: courseId,
      details: JSON.stringify({
        courseTitle: updated.title,
        instructorName: instructor.name,
        instructorEmail: instructor.email,
      }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/trainer");
  revalidatePath("/courses");
  return { success: true, course: updated };
}

/**
 * Admin: Manual Student Enrollment
 * Grants direct course access for scholarships, manual payments, or institutional cohorts.
 */
export async function adminEnrollStudentAction(
  studentIdentifier: string,
  courseId: string,
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  const idOrEmail = studentIdentifier.trim();
  if (!idOrEmail) {
    throw new Error("Student email or ID is required.");
  }

  // Find target user
  const student = await dbClient.user.findFirst({
    where: {
      OR: [{ id: idOrEmail }, { email: idOrEmail.toLowerCase() }],
    },
    select: { id: true, name: true, email: true },
  });

  if (!student) {
    throw new Error(`Student account with identifier "${idOrEmail}" was not found.`);
  }

  // Find target course
  const course = await dbClient.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, price: true },
  });

  if (!course) {
    throw new Error("Target course was not found.");
  }

  // Check existing enrollment
  const existing = await dbClient.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: course.id,
      },
    },
  });

  if (existing) {
    throw new Error(`Student ${student.name} is already enrolled in "${course.title}".`);
  }

  const enrollment = await dbClient.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      progress: 0.0,
    },
  });

  await dbClient.auditLog.create({
    data: {
      action: "MANUAL_STUDENT_ENROLLED",
      entity: "Enrollment",
      entityId: enrollment.id,
      details: JSON.stringify({
        studentEmail: student.email,
        studentName: student.name,
        courseTitle: course.title,
        enrolledBy: admin.email,
      }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/enrollments");
  revalidatePath("/dashboard/admin/reports");
  revalidatePath("/dashboard/student/courses");
  return { success: true, enrollment };
}

/**
 * Admin: Revoke Student Enrollment (Destructive action with confirmation audit)
 */
export async function adminRevokeEnrollmentAction(
  enrollmentId: string,
  reason: string = "Administrative Policy Decision",
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  const enrollment = await dbClient.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment record not found.");
  }

  await dbClient.enrollment.delete({
    where: { id: enrollmentId },
  });

  await dbClient.auditLog.create({
    data: {
      action: "STUDENT_ENROLLMENT_REVOKED",
      entity: "Enrollment",
      entityId: enrollmentId,
      details: JSON.stringify({
        studentEmail: enrollment.user.email,
        studentName: enrollment.user.name,
        courseTitle: enrollment.course.title,
        reason: reason.trim() || "Administrative Decision",
        revokedBy: admin.email,
      }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/enrollments");
  revalidatePath("/dashboard/admin/reports");
  revalidatePath("/dashboard/student/courses");
  return { success: true };
}

/**
 * Admin: Broadcast Institutional Announcement
 */
export async function broadcastAnnouncementAction(
  formData: FormData,
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  const title = (formData.get("title") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const priority = ((formData.get("priority") as string) || "NORMAL").toUpperCase();
  const scope = ((formData.get("scope") as string) || "ALL").toUpperCase();

  if (!title || title.length < 3) {
    throw new Error("Announcement headline must be at least 3 characters.");
  }

  if (!message || message.length < 5) {
    throw new Error("Announcement message must be at least 5 characters.");
  }

  const announcementId = `announcement-${Date.now()}`;

  const entry = await dbClient.auditLog.create({
    data: {
      action: "BROADCAST_ANNOUNCEMENT",
      entity: "Announcement",
      entityId: announcementId,
      details: JSON.stringify({
        title,
        message,
        priority: ["NORMAL", "HIGH", "URGENT"].includes(priority) ? priority : "NORMAL",
        scope: ["ALL", "STUDENTS", "TRAINERS"].includes(scope) ? scope : "ALL",
        authorName: admin.name,
        authorEmail: admin.email,
      }),
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/trainer");
  return { success: true, announcement: entry };
}

/**
 * Admin: Delete/Revoke Broadcast Announcement
 */
export async function deleteBroadcastAnnouncementAction(
  auditLogId: string,
  dbClient: any = db
) {
  const admin = await requireRole(["ADMIN"]);

  const entry = await dbClient.auditLog.findUnique({
    where: { id: auditLogId },
  });

  if (!entry || entry.action !== "BROADCAST_ANNOUNCEMENT") {
    throw new Error("Target announcement was not found.");
  }

  await dbClient.auditLog.delete({
    where: { id: auditLogId },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/trainer");
  return { success: true };
}
