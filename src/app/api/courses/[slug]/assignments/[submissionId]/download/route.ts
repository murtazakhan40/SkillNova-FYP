import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteProps {
  params: Promise<{
    slug: string;
    submissionId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { slug, submissionId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to access submission attachments." },
      { status: 401 }
    );
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

  if (!submission || !submission.fileUrl) {
    return NextResponse.json(
      { error: "Submission file attachment not found." },
      { status: 404 }
    );
  }

  const course = submission.assignment.course;
  if (course.slug !== slug) {
    return NextResponse.json({ error: "Invalid course context." }, { status: 400 });
  }

  // Ownership check: Student who submitted, OR course instructor, OR admin
  const isOwner = submission.userId === user.id;
  const isInstructor = course.instructorId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isInstructor && !isAdmin) {
    return NextResponse.json(
      { error: "Access Denied: You are not authorized to access this student submission." },
      { status: 403 }
    );
  }

  try {
    const relativePath = submission.fileUrl.replace(/^\/?uploads\/?/, "");
    const fullFilePath = path.join(process.cwd(), "uploads", relativePath);
    const fileBuffer = await fs.readFile(fullFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(submission.fileName || "submission_attachment.zip")}"`,
        "Content-Length": fileBuffer.length.toString(),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Assignment download failure:", error);
    return NextResponse.json(
      { error: "Unable to retrieve submission file from storage." },
      { status: 500 }
    );
  }
}
