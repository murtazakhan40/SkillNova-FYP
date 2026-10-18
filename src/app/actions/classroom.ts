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
export async function gradeAssignmentAction(
  formData: FormData,
  dbClient: any = db
) {
  const reviewer = await requireRole(["TRAINER", "ADMIN"]);

  const submissionId = formData.get("submissionId") as string;
  const scoreRaw = formData.get("score") as string;
  const feedbackRaw = (formData.get("feedback") as string) || "";
  const status = (formData.get("status") as string) || "GRADED";

  if (!submissionId) {
    throw new Error("Submission ID required.");
  }

  const submission = await dbClient.assignmentSubmission.findUnique({
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

  await dbClient.assignmentSubmission.update({
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
  await dbClient.auditLog.create({
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

  try {
    revalidatePath(`/courses/${submission.assignment.course.slug}/learn`);
    revalidatePath(`/dashboard/trainer/assessments`);
    revalidatePath(`/dashboard/student`);
  } catch {
    // Graceful fallback in non-Next.js runtime (e.g. unit tests)
  }

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

/**
 * -----------------------------------------------------------------------------
 * 8. ASSIGNMENTS: Authorized Trainer/Admin Create Assignment
 * -----------------------------------------------------------------------------
 */
export async function createCourseAssignmentAction(
  formData: FormData,
  dbClient: any = db
) {
  const user = await requireRole(["TRAINER", "ADMIN"]);

  const courseId = formData.get("courseId") as string;
  const titleRaw = (formData.get("title") as string)?.trim();
  const descriptionRaw = (formData.get("description") as string)?.trim();
  const dueDateRaw = formData.get("dueDate") as string;
  const maxScoreRaw = formData.get("maxScore") as string;

  if (!courseId || !titleRaw || !descriptionRaw) {
    throw new Error("Course ID, assignment title, and description are required.");
  }

  const course = await dbClient.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  // Strict ownership enforcement
  if (user.role !== "ADMIN" && course.instructorId !== user.id) {
    throw new Error("Authorization Violation: You can only create assignments for your own assigned courses.");
  }

  const title = sanitizeText(titleRaw);
  const description = sanitizeText(descriptionRaw);
  if (title.length < 3) {
    throw new Error("Assignment title must be at least 3 characters.");
  }

  const parsedMaxScore = parseInt(maxScoreRaw, 10);
  const maxScore = isNaN(parsedMaxScore) || parsedMaxScore <= 0 ? 100 : parsedMaxScore;
  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;

  const assignment = await dbClient.assignment.create({
    data: {
      title,
      description,
      dueDate,
      maxScore,
      courseId,
    },
  });

  await dbClient.auditLog.create({
    data: {
      action: "ASSIGNMENT_CREATED",
      entity: "Assignment",
      entityId: assignment.id,
      details: JSON.stringify({
        title,
        courseId,
        maxScore,
        instructorId: user.id,
      }),
      userId: user.id,
    },
  });

  try {
    revalidatePath("/dashboard/trainer");
    revalidatePath("/dashboard/trainer/assessments");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath(`/courses/${course.slug}/learn`);
  } catch {
    // Non-Next runtime fallback
  }

  return { success: true, assignmentId: assignment.id };
}

/**
 * -----------------------------------------------------------------------------
 * 9. QUIZZES: Authorized Trainer/Admin Create Quiz with Questions
 * -----------------------------------------------------------------------------
 */
export async function createCourseQuizAction(
  formData: FormData,
  dbClient: any = db
) {
  const user = await requireRole(["TRAINER", "ADMIN"]);

  const courseId = formData.get("courseId") as string;
  const titleRaw = (formData.get("title") as string)?.trim();
  const passingScoreRaw = formData.get("passingScore") as string;
  const questionsRaw = formData.get("questions") as string;

  if (!courseId || !titleRaw) {
    throw new Error("Course ID and quiz title are required.");
  }

  const course = await dbClient.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  // Strict ownership enforcement
  if (user.role !== "ADMIN" && course.instructorId !== user.id) {
    throw new Error("Authorization Violation: You can only create quizzes for your own assigned courses.");
  }

  const title = sanitizeText(titleRaw);
  const parsedPassing = parseInt(passingScoreRaw, 10);
  const passingScore = isNaN(parsedPassing) ? 70 : Math.max(10, Math.min(100, parsedPassing));

  let questions: Array<{
    text: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }> = [];

  try {
    questions = JSON.parse(questionsRaw || "[]");
  } catch {
    throw new Error("Invalid questions JSON payload.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("A quiz must include at least one multiple-choice question.");
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Question #${i + 1} must include question text and at least 2 options.`);
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      throw new Error(`Question #${i + 1} has an invalid correct option index.`);
    }
  }

  const quiz = await dbClient.quiz.create({
    data: {
      title,
      passingScore,
      courseId,
      questions: {
        create: questions.map((q) => ({
          text: sanitizeText(q.text),
          optionsJson: JSON.stringify(q.options.map((opt) => sanitizeText(opt))),
          correctIndex: q.correctIndex,
          explanation: q.explanation ? sanitizeText(q.explanation) : null,
        })),
      },
    },
  });

  await dbClient.auditLog.create({
    data: {
      action: "QUIZ_CREATED",
      entity: "Quiz",
      entityId: quiz.id,
      details: JSON.stringify({
        title,
        courseId,
        questionsCount: questions.length,
        passingScore,
        instructorId: user.id,
      }),
      userId: user.id,
    },
  });

  try {
    revalidatePath("/dashboard/trainer");
    revalidatePath("/dashboard/trainer/assessments");
    revalidatePath(`/courses/${course.slug}`);
  } catch {
    // Non-Next runtime fallback
  }

  return { success: true, quizId: quiz.id };
}

/**
 * -----------------------------------------------------------------------------
 * 10. CURRICULUM: Authorized Trainer/Admin Create Section
 * -----------------------------------------------------------------------------
 */
export async function createCourseSectionAction(
  formData: FormData,
  dbClient: any = db
) {
  const user = await requireRole(["TRAINER", "ADMIN"]);

  const courseId = formData.get("courseId") as string;
  const titleRaw = (formData.get("title") as string)?.trim();

  if (!courseId || !titleRaw) {
    throw new Error("Course ID and section title are required.");
  }

  const course = await dbClient.course.findUnique({
    where: { id: courseId },
    include: { sections: true },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  if (user.role !== "ADMIN" && course.instructorId !== user.id) {
    throw new Error("Authorization Violation: You can only add sections to your own courses.");
  }

  const title = sanitizeText(titleRaw);
  const nextOrder = course.sections.length + 1;

  const section = await dbClient.section.create({
    data: {
      title,
      order: nextOrder,
      courseId,
    },
  });

  try {
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath(`/courses/${course.slug}/learn`);
    revalidatePath("/dashboard/trainer");
    revalidatePath("/dashboard/trainer/courses");
  } catch {
    // Non-Next runtime fallback
  }

  return { success: true, sectionId: section.id };
}

/**
 * -----------------------------------------------------------------------------
 * 11. CURRICULUM: Authorized Trainer/Admin Create Lesson
 * -----------------------------------------------------------------------------
 */
export async function createCourseLessonAction(
  formData: FormData,
  dbClient: any = db
) {
  const user = await requireRole(["TRAINER", "ADMIN"]);

  const sectionId = formData.get("sectionId") as string;
  const titleRaw = (formData.get("title") as string)?.trim();
  const durationRaw = (formData.get("duration") as string)?.trim();
  const videoUrlRaw = (formData.get("videoUrl") as string)?.trim();
  const contentRaw = (formData.get("content") as string)?.trim();
  const isFree = formData.get("isFree") === "true";

  if (!sectionId || !titleRaw) {
    throw new Error("Section ID and lesson title are required.");
  }

  const section = await dbClient.section.findUnique({
    where: { id: sectionId },
    include: {
      course: true,
      lessons: true,
    },
  });

  if (!section) {
    throw new Error("Curriculum section not found.");
  }

  if (user.role !== "ADMIN" && section.course.instructorId !== user.id) {
    throw new Error("Authorization Violation: You can only add lessons to your own courses.");
  }

  const title = sanitizeText(titleRaw);
  const duration = durationRaw || "10 mins";
  const videoUrl = videoUrlRaw || null;
  const content = contentRaw ? sanitizeText(contentRaw) : null;
  const nextOrder = section.lessons.length + 1;

  const lesson = await dbClient.lesson.create({
    data: {
      title,
      duration,
      videoUrl,
      content,
      isFree,
      order: nextOrder,
      sectionId,
    },
  });

  try {
    revalidatePath(`/courses/${section.course.slug}`);
    revalidatePath(`/courses/${section.course.slug}/learn`);
    revalidatePath("/dashboard/trainer");
    revalidatePath("/dashboard/trainer/courses");
  } catch {
    // Non-Next runtime fallback
  }

  return { success: true, lessonId: lesson.id };
}
