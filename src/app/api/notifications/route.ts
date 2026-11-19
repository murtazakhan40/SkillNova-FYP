import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getStudentNotifications,
  getTrainerNotifications,
  getAdminNotifications,
  markNotificationAsRead,
  type DashboardNotification,
} from "@/lib/notifications";

/**
 * GET /api/notifications
 * Enforces strict user isolation: returns only events belonging to the authenticated user.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Active session required to view notifications." },
        { status: 401 }
      );
    }

    let notifications: DashboardNotification[] = [];

    if (user.role === "STUDENT") {
      notifications = await getStudentNotifications(user.id);
    } else if (user.role === "TRAINER") {
      notifications = await getTrainerNotifications(user.id);
    } else if (user.role === "ADMIN") {
      notifications = await getAdminNotifications();
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      notifications,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal notification retrieval error";
    return NextResponse.json(
      { error: message, notifications: [] },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark a notification as read with strict user isolation
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Active session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required." },
        { status: 400 }
      );
    }

    await markNotificationAsRead(notificationId, user.id);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating notification";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
