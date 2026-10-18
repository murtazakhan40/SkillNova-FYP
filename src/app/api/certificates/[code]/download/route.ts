import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCertificatePdf } from "@/lib/pdf-certificate";

interface RouteParams {
  params: Promise<{
    code: string;
  }>;
}

/**
 * Secure Certificate PDF Download Endpoint.
 * Strictly enforces authorization and revocation checks:
 * - Only the student recipient, the course instructor, or an admin can download the PDF.
 * - Prevents unauthorized students from downloading other students' credentials.
 * - Revoked certificates are strictly blocked from being downloaded.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const cleanCode = code?.trim().toUpperCase();

    if (!cleanCode) {
      return NextResponse.json(
        { error: "Certificate code is required." },
        { status: 400 }
      );
    }

    // 1. Verify User Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to download certificates." },
        { status: 401 }
      );
    }

    // 2. Fetch Certificate with Course & Instructor Relations
    const certificate = await db.certificate.findUnique({
      where: { certificateCode: cleanCode },
      include: {
        user: true,
        course: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: `Certificate with code "${cleanCode}" was not found.` },
        { status: 404 }
      );
    }

    // 3. Revocation Check
    if (certificate.isRevoked) {
      return NextResponse.json(
        {
          error: "This certificate has been revoked by the academic board and is no longer available for download.",
          revokedAt: certificate.revokedAt,
          reason: certificate.revokedReason || "Academic review",
        },
        { status: 403 }
      );
    }

    // 4. Strict Ownership & Role-Based Authorization Guard
    const isRecipient = certificate.userId === user.id;
    const isCourseInstructor = certificate.course.instructorId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isRecipient && !isCourseInstructor && !isAdmin) {
      return NextResponse.json(
        {
          error: "Authorization Violation: You do not have permission to download another student's certificate.",
        },
        { status: 403 }
      );
    }

    // 5. Generate Official PDF
    const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pdfBytes = await generateCertificatePdf({
      studentName: certificate.user.name,
      courseTitle: certificate.course.title,
      instructorName: certificate.course.instructor.name,
      issuedAt: certificate.issuedAt,
      certificateCode: certificate.certificateCode,
      grade: certificate.grade,
      verificationBaseUrl: origin,
    });

    // 6. Return PDF with secure headers
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SkillNova-Certificate-${certificate.certificateCode}.pdf"`,
        "Content-Length": pdfBytes.byteLength.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating certificate PDF download:", error);
    return NextResponse.json(
      { error: "Internal server error generating certificate document." },
      { status: 500 }
    );
  }
}
