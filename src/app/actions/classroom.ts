"use server";

import { revalidatePath } from "next/cache";
import path from "node:path";
import fs from "node:fs/promises";
import { getCurrentUser, requireAuth, requireRole, requireCourseEnrollment } from "@/lib/auth";
import { db } from "@/lib/db";

// File upload constraints
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 Megabytes

const ALLOWED_FILE_EXTENSIONS = new Set([
  ".pdf", ".zip", ".rar", ".7z", ".tar", ".gz",
  ".doc", ".docx", ".txt", ".md", ".json", ".csv",
  ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".cpp", ".c", ".cs",
  ".html", ".css", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ipynb",
]);

const DISALLOWED_DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".php", ".vbs", ".ps1", ".msi", ".bin", ".scr", ".jar", ".dll",
]);

/**
 * Sanitize filename to prevent directory traversal and filesystem attacks
 */
function sanitizeFileName(originalName: string): string {
  const base = path.basename(originalName);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Sanitize text to prevent stored XSS injection
 */
function sanitizeText(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * -----------------------------------------------------------------------------
 * 1. ASSIGNMENTS: Student Submits Solution
 * -----------------------------------------------------------------------------
 */
export async function submitAssignmentAction(formData: FormData) {
  const user = await requireAuth();

  const assignmentId = formData.get("assignmentId") as string;
  const courseSlug = formData.get("courseSlug") as string;
  const textContentRaw = (formData.get("textContent") as string) || "";
  const file = formData.get("file") as File | null;

  if (!assignmentId) {
    throw new Error("Invalid request: Assignment identifier required.");
  }

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: { course: true },
  });

  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  // Enforce server-side course enrollment authorization
  await requireCourseEnrollment(user.id, assignment.courseId);

  // Check deadline (if configured)
  const isPastDeadline = assignment.dueDate ? new Date() > new Date(assignment.dueDate) : false;

  const textContent = sanitizeText(textContentRaw);

  let fileUrl: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;

  // Process file upload if provided
  if (file && file.size > 0) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error("File exceeds maximum allowed size limit of 15MB.");
    }

    const ext = path.extname(file.name).toLowerCase();
    if (DISALLOWED_DANGEROUS_EXTENSIONS.has(ext)) {
      throw new Error(`Security Violation: Executable file type (${ext}) is strictly prohibited.`);
    }

    if (!ALLOWED_FILE_EXTENSIONS.has(ext)) {
      throw new Error(`Invalid file type (${ext}). Allowed formats: PDF, ZIP, DOCX, Code archives.`);
    }

    const safeName = sanitizeFileName(file.name);
    const storageDir = path.join(process.cwd(), "uploads", "assignments", assignmentId);
    await fs.mkdir(storageDir, { recursive: true });

    const storedFileName = `${user.id}_${Date.now()}_${safeName}`;
    const destinationPath = path.join(storageDir, storedFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(destinationPath, buffer);

    fileUrl = `/uploads/assignments/${assignmentId}/${storedFileName}`;
    fileName = safeName;
    fileSize = file.size;
  }

  if (!textContent && !fileUrl) {
    throw new Error("Please provide either solution notes/repository URL or attach a project file.");
  }

  // Upsert single submission per student per assignment
  await db.assignmentSubmission.upsert({
    where: {
      assignmentId_userId: {
        assignmentId,
        userId: user.id,
      },
    },
    update: {
      textContent: textContent || undefined,
      ...(fileUrl ? { fileUrl, fileName, fileSize } : {}),
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      userId: user.id,
      textContent,
      fileUrl,
      fileName,
      fileSize,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  revalidatePath(`/courses/${courseSlug}/learn`);
  revalidatePath(`/dashboard/student`);
  revalidatePath(`/dashboard/trainer/assessments`);

  return { success: true, isPastDeadline };
}

/**
 * -----------------------------------------------------------------------------
 * 2. ASSIGNMENTS: Trainer Review, Grading & Feedback
 * -----------------------------------------------------------------------------
 */
export async function gradeAssignmentAction(formData: FormData) {
  const reviewer = await requireRole(["TRAINER", "ADMIN"]);

  const submissionId = formData.get("submissionId") as string;
  const scoreRaw = formData.get("score") as string;
  const feedbackRaw = (formData.get("feedback") as string) || "";
  const status = (formData.get("status") as string) || "GRADED";

  if (!submissionId) {
    throw new Error("Submission ID required.");
  }

  const submission = await db.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: {
        include: { course: true },
      },
      user: true,
    },
  });

  if (!submission) {
    throw new Error("Target assignment submission was not found.");
  }

  // Strict ownership enforcement: trainer must author this course (or be admin)
  if (reviewer.role !== "ADMIN" && submission.assignment.course.instructorId !== reviewer.id) {
    throw new Error("Authorization Violation: You can only evaluate assignments for your own authored courses.");
  }

  const score = parseFloat(scoreRaw);
  if (isNaN(score) || score < 0 || score > submission.assignment.maxScore) {
    throw new Error(`Grade score must be between 0 and ${submission.assignment.maxScore}.`);
  }

  const feedback = sanitizeText(feedbackRaw);

  await db.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      score,
      feedback,
      status: status === "RESUBMIT_REQUESTED" ? "RESUBMIT_REQUESTED" : "GRADED",
      gradedAt: new Date(),
      gradedById: reviewer.id,
    },
  });

  // Record sanitized audit trace (strictly zero credentials)
  await db.auditLog.create({
    data: {
      action: "ASSIGNMENT_EVALUATED",
      entity: "AssignmentSubmission",
      entityId: submissionId,
      details: JSON.stringify({
        assignmentTitle: submission.assignment.title,
        studentEmail: submission.user.email,
        assignedScore: score,
        maxScore: submission.assignment.maxScore,
        status,
      }),
      userId: reviewer.id,
    },
  });

  revalidatePath(`/courses/${submission.assignment.course.slug}/learn`);
  revalidatePath(`/dashboard/trainer/assessments`);
  revalidatePath(`/dashboard/student`);

  return { success: true };
}

/**
 * -----------------------------------------------------------------------------
 * 3. RESOURCES: Authorized Trainer Upload
 * -----------------------------------------------------------------------------
 */
export async function uploadLessonResourceAction(formData: FormData) {
  const trainer = await requireRole(["TRAINER", "ADMIN"]);

  const lessonId = formData.get("lessonId") as string;
  const titleRaw = (formData.get("title") as string)?.trim();
  const file = formData.get("file") as File | null;

  if (!lessonId || !titleRaw || !file || file.size === 0) {
    throw new Error("Lesson ID, resource title, and attachment file are required.");
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      section: {
        include: { course: true },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found.");
  }

  // Strict ownership check: trainer must author the course
  if (trainer.role !== "ADMIN" && lesson.section.course.instructorId !== trainer.id) {
    throw new Error("Authorization Violation: You can only upload resources to your own courses.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File exceeds maximum size limit of 15MB.");
  }

  const ext = path.extname(file.name).toLowerCase();
  if (DISALLOWED_DANGEROUS_EXTENSIONS.has(ext)) {
    throw new Error(`Security Violation: Disallowed file extension (${ext}).`);
  }

  if (!ALLOWED_FILE_EXTENSIONS.has(ext)) {
    throw new Error(`Unsupported file type (${ext}). Allowed: PDF, ZIP, DOCX, Code archives.`);
  }

  const safeFileName = sanitizeFileName(file.name);
  const storageDir = path.join(process.cwd(), "uploads", "resources", lessonId);
  await fs.mkdir(storageDir, { recursive: true });

  const storedFileName = `${Date.now()}_${safeFileName}`;
  const destinationPath = path.join(storageDir, storedFileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(destinationPath, buffer);

  const title = sanitizeText(titleRaw);

  const resource = await db.lessonResource.create({
    data: {
      title,
      fileName: safeFileName,
      fileUrl: `/uploads/resources/${lessonId}/${storedFileName}`,
      fileSize: file.size,
      fileType: file.type || "application/octet-stream",
      lessonId,
    },
  });

  revalidatePath(`/courses/${lesson.section.course.slug}/learn/${lessonId}`);

  return { success: true, resourceId: resource.id };
}

/**
 * -----------------------------------------------------------------------------
 * 4. RESOURCES: Trainer Delete
 * -----------------------------------------------------------------------------
 */
export async function deleteLessonResourceAction(resourceId: string) {
  const trainer = await requireRole(["TRAINER", "ADMIN"]);

  const resource = await db.lessonResource.findUnique({
    where: { id: resourceId },
    include: {
      lesson: {
        include: {
          section: {
            include: { course: true },
          },
        },
      },
    },
  });

  if (!resource) {
    throw new Error("Resource not found.");
  }

  if (trainer.role !== "ADMIN" && resource.lesson.section.course.instructorId !== trainer.id) {
    throw new Error("Unauthorized to remove this resource.");
  }

  // Attempt file removal from disk
  try {
    const relativePath = resource.fileUrl.replace(/^\/?uploads\/?/, "");
    const filePath = path.join(process.cwd(), "uploads", relativePath);
    await fs.unlink(filePath);
  } catch {
    // Continue even if file already pruned
  }

  await db.lessonResource.delete({
    where: { id: resourceId },
  });

  revalidatePath(`/courses/${resource.lesson.section.course.slug}/learn`);

  return { success: true };
}

/**
 * -----------------------------------------------------------------------------
 * 5. DISCUSSIONS: Post Academic Question / Peer Inquiry
 * -----------------------------------------------------------------------------
 */
export async function postLessonDiscussionAction(formData: FormData) {
  const user = await requireAuth();

  const lessonId = formData.get("lessonId") as string;
  const contentRaw = (formData.get("content") as string) || "";
  const isAnswer = formData.get("isAnswer") === "true";

  if (!lessonId) {
    throw new Error("Lesson ID required.");
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      section: {
        include: { course: true },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found.");
  }

  // Enforce enrollment or instructor authorization
  if (user.role !== "ADMIN" && lesson.section.course.instructorId !== user.id) {
    await requireCourseEnrollment(user.id, lesson.section.course.id);
  }

  const content = sanitizeText(contentRaw);
  if (content.length < 3 || content.length > 1500) {
    throw new Error("Discussion message must be between 3 and 1500 characters.");
  }

  await db.lessonDiscussion.create({
    data: {
      lessonId,
      userId: user.id,
      content,
      isAnswer: isAnswer && (user.role === "TRAINER" || user.role === "ADMIN"),
    },
  });

  revalidatePath(`/courses/${lesson.section.course.slug}/learn/${lessonId}`);

  return { success: true };
}

/**
 * -----------------------------------------------------------------------------
 * 6. DISCUSSIONS: Report Message (Student / Faculty Moderation)
 * -----------------------------------------------------------------------------
 */
export async function reportLessonDiscussionAction(discussionId: string) {
  await requireAuth();

  const discussion = await db.lessonDiscussion.findUnique({
    where: { id: discussionId },
    include: {
      lesson: {
        include: {
          section: {
            include: { course: true },
          },
        },
      },
    },
  });

  if (!discussion) {
    throw new Error("Discussion entry not found.");
  }

  await db.lessonDiscussion.update({
    where: { id: discussionId },
    data: { reported: true },
  });

  revalidatePath(`/courses/${discussion.lesson.section.course.slug}/learn/${discussion.lessonId}`);

  return { success: true };
}

/**
 * -----------------------------------------------------------------------------
 * 7. DISCUSSIONS: Delete Message (Author, Trainer, or Admin)
 * -----------------------------------------------------------------------------
 */
export async function deleteLessonDiscussionAction(discussionId: string) {
  const user = await requireAuth();

  const discussion = await db.lessonDiscussion.findUnique({
    where: { id: discussionId },
    include: {
      lesson: {
        include: {
          section: {
            include: { course: true },
          },
        },
      },
    },
  });

  if (!discussion) {
    throw new Error("Discussion message not found.");
  }

  const isAuthor = discussion.userId === user.id;
  const isTrainer = discussion.lesson.section.course.instructorId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isAuthor && !isTrainer && !isAdmin) {
    throw new Error("Unauthorized: Only the comment author or course instructor can delete this entry.");
  }

  await db.lessonDiscussion.delete({
    where: { id: discussionId },
  });

  revalidatePath(`/courses/${discussion.lesson.section.course.slug}/learn/${discussion.lessonId}`);

  return { success: true };
}
