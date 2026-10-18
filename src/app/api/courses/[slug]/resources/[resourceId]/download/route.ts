import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteProps {
  params: Promise<{
    slug: string;
    resourceId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { slug, resourceId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to access course resources." },
      { status: 401 }
    );
  }

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
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }

  const course = resource.lesson.section.course;
  if (course.slug !== slug) {
    return NextResponse.json({ error: "Invalid course context." }, { status: 400 });
  }

  // Authorization check: User must be enrolled OR course instructor OR admin
  const isInstructor = course.instructorId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isInstructor && !isAdmin) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Access Denied: You must be actively enrolled in this course to download resources." },
        { status: 403 }
      );
    }
  }

  try {
    const relativePath = resource.fileUrl.replace(/^\/?uploads\/?/, "");
    const fullFilePath = path.join(process.cwd(), "uploads", relativePath);
    const fileBuffer = await fs.readFile(fullFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": resource.fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(resource.fileName)}"`,
        "Content-Length": fileBuffer.length.toString(),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Resource download failure:", error);
    return NextResponse.json(
      { error: "Unable to retrieve resource file from storage." },
      { status: 500 }
    );
  }
}
