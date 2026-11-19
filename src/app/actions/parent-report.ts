"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  generateStudentAcademicReport, 
  sendParentAcademicReport,
  SendReportResult,
  StudentAcademicReportData 
} from "@/lib/parent-reports";

/**
 * Student action to dispatch their own academic progress report to their parent/guardian.
 */
export async function dispatchStudentParentReportAction(
  courseId?: string,
  customNote?: string
): Promise<SendReportResult> {
  const user = await requireAuth();

  const student = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      age: true,
      parentEmail: true,
      parentName: true,
    },
  });

  if (!student) {
    return { success: false, message: "Student account not found." };
  }

  if (!student.parentEmail) {
    return {
      success: false,
      message: "Please add your parent or guardian email in your profile before sending reports.",
    };
  }

  const result = await sendParentAcademicReport({
    studentId: student.id,
    courseId,
    reportType: "PROGRESS_UPDATE",
    customNote,
  });

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/student/profile");
  if (courseId) {
    revalidatePath(`/courses`);
  }

  return result;
}

/**
 * Trainer / Admin action to dispatch an official academic progress report to a student's parent.
 */
export async function trainerDispatchParentReportAction(
  studentId: string,
  courseId: string,
  customNote?: string
): Promise<SendReportResult> {
  const user = await requireAuth();

  if (user.role !== "TRAINER" && user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized. Faculty or administrator credentials required." };
  }

  const result = await sendParentAcademicReport({
    studentId,
    courseId,
    reportType: "PROGRESS_UPDATE",
    customNote,
  });

  revalidatePath("/dashboard/trainer/students");
  revalidatePath("/dashboard/admin/users");

  return result;
}

/**
 * Fetch current student's full academic report data for preview.
 */
export async function getStudentAcademicReportAction(
  courseId?: string
): Promise<{ success: boolean; data?: StudentAcademicReportData; error?: string }> {
  const user = await requireAuth();

  try {
    const reportData = await generateStudentAcademicReport(user.id, courseId);
    return { success: true, data: reportData };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unable to generate academic report.",
    };
  }
}

/**
 * Fetch student's sent parent reports history.
 */
export async function getStudentParentReportHistoryAction() {
  const user = await requireAuth();

  const reports = await db.parentReport.findMany({
    where: { studentId: user.id },
    include: {
      course: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { sentAt: "desc" },
    take: 10,
  });

  return reports.map((r) => ({
    id: r.id,
    title: r.title,
    recipientEmail: r.recipientEmail,
    recipientPhone: r.recipientPhone,
    reportType: r.reportType,
    sentAt: r.sentAt.toISOString(),
    deliveryStatus: r.deliveryStatus,
    courseTitle: r.course?.title || null,
  }));
}
