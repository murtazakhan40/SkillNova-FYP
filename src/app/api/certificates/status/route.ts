import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "STUDENT") {
      const [earnedCount, inProgressCount] = await Promise.all([
        db.certificate.count({
          where: { userId: user.id },
        }),
        db.enrollment.count({
          where: {
            userId: user.id,
            progress: { lt: 100 },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        role: "STUDENT",
        earnedCount,
        inProgressCount,
      });
    }

    if (user.role === "TRAINER") {
      const [earnedCount, inProgressCount] = await Promise.all([
        db.certificate.count({
          where: { course: { instructorId: user.id } },
        }),
        db.enrollment.count({
          where: {
            course: { instructorId: user.id },
            progress: { lt: 100 },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        role: "TRAINER",
        earnedCount,
        inProgressCount,
      });
    }

    // ADMIN
    const [earnedCount, inProgressCount] = await Promise.all([
      db.certificate.count(),
      db.enrollment.count({
        where: { progress: { lt: 100 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      role: "ADMIN",
      earnedCount,
      inProgressCount,
    });
  } catch (error) {
    console.error("Failed to fetch certificate status:", error);
    return NextResponse.json(
      { error: "Internal server error fetching certificate status" },
      { status: 500 }
    );
  }
}

