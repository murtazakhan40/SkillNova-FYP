"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * -----------------------------------------------------------------------------
 * 1. Create or Retrieve Pending Order
 * -----------------------------------------------------------------------------
 * Reads canonical course price directly from database. Never trusts client price.
 */
export async function initiateCourseOrderAction(courseId: string) {
  const user = await requireAuth();

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  // Free course policy: free courses cannot go through payment checkout
  if (course.price <= 0) {
    throw new Error("Free courses do not require payment. Please use direct enrollment.");
  }

  // Check if student is already enrolled
  const existingEnrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  if (existingEnrollment) {
    redirect(`/courses/${course.slug}/learn`);
  }

  // Reuse existing pending order if created within the last 30 minutes
  const recentPendingOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      courseId: course.id,
      status: "PENDING",
      createdAt: {
        gte: new Date(Date.now() - 30 * 60 * 1000),
      },
    },
  });

  if (recentPendingOrder) {
    return {
      orderId: recentPendingOrder.id,
      orderNumber: recentPendingOrder.orderNumber,
      amount: recentPendingOrder.amount,
      currency: recentPendingOrder.currency,
      courseSlug: course.slug,
      courseTitle: course.title,
    };
  }

  const orderSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderNumber = `ORD-2026-${orderSuffix}`;
  const idempotencyKey = `idemp_${user.id}_${course.id}_${Date.now()}`;

  const newOrder = await db.order.create({
    data: {
      orderNumber,
      userId: user.id,
      courseId: course.id,
      amount: course.price, // STRICT: Canonical database price
      currency: "PKR",
      status: "PENDING",
      provider: "DEMO_SANDBOX",
      idempotencyKey,
    },
  });

  return {
    orderId: newOrder.id,
    orderNumber: newOrder.orderNumber,
    amount: newOrder.amount,
    currency: newOrder.currency,
    courseSlug: course.slug,
    courseTitle: course.title,
  };
}

/**
 * -----------------------------------------------------------------------------
 * 2. Process Simulated Demo Payment (Server-Side Webhook/Provider Simulation)
 * -----------------------------------------------------------------------------
 * Strictly verifies order status, enforces idempotency, prevents duplicate transactions,
 * and grants enrollment inside an atomic ACID transaction.
 */
export async function processSimulatedPaymentAction(formData: FormData) {
  const user = await requireAuth();

  const orderNumber = (formData.get("orderNumber") as string)?.trim();
  const paymentMethod = (formData.get("paymentMethod") as string) || "DEMO_CARD";
  const scenario = (formData.get("scenario") as string) || "SUCCESS";

  if (!orderNumber) {
    return { error: "Order reference identifier required." };
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      course: true,
      payment: true,
    },
  });

  if (!order) {
    return { error: "Order not found." };
  }

  // Strict ownership check: Only the buyer can execute this order
  if (order.userId !== user.id) {
    throw new Error("Authorization Violation: You do not own this order.");
  }

  // Idempotency check: If already completed, do not re-process or duplicate enrollment
  if (order.status === "COMPLETED") {
    return {
      success: true,
      orderNumber: order.orderNumber,
      courseSlug: order.course.slug,
      alreadyCompleted: true,
    };
  }

  // Handle Simulated Failure Scenarios (Declined Card / Insufficient Funds / Cancelled)
  if (scenario !== "SUCCESS") {
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });

      const failedTxnId = `TXN-FAIL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await tx.payment.create({
        data: {
          orderId: order.id,
          providerTxnId: failedTxnId,
          amount: order.amount,
          currency: order.currency,
          status: "FAILED",
          paymentMethod,
          metadata: JSON.stringify({
            reason: scenario,
            provider: "DEMO_SANDBOX",
            simulated: true,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    });

    return {
      success: false,
      error: `Simulated transaction was declined by bank simulator (${scenario.replace(/_/g, " ")}). Zero charges applied and no course access granted.`,
      orderNumber: order.orderNumber,
      courseSlug: order.course.slug,
    };
  }

  // Handle Successful Simulated Payment (Atomic ACID Transaction)
  const txnId = `TXN-DEMO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  await db.$transaction(async (tx) => {
    // 1. Mark Order as COMPLETED
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
      },
    });

    // 2. Persist Payment Ledger (PCI-DSS: NO card numbers or CVVs)
    await tx.payment.create({
      data: {
        orderId: order.id,
        providerTxnId: txnId,
        amount: order.amount,
        currency: order.currency,
        status: "SUCCESS",
        paymentMethod,
        metadata: JSON.stringify({
          provider: "DEMO_SANDBOX",
          simulated: true,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // 3. Grant Course Enrollment
    await tx.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: order.userId,
          courseId: order.courseId,
        },
      },
      update: {},
      create: {
        userId: order.userId,
        courseId: order.courseId,
        progress: 0.0,
      },
    });

    // 4. Record Audit Log Trace (Sanitized, NO credentials)
    await tx.auditLog.create({
      data: {
        action: "ORDER_COMPLETED",
        entity: "Order",
        entityId: order.id,
        details: JSON.stringify({
          orderNumber: order.orderNumber,
          amount: order.amount,
          currency: order.currency,
          provider: "DEMO_SANDBOX",
          txnId,
        }),
        userId: user.id,
      },
    });
  });

  revalidatePath(`/courses/${order.course.slug}`);
  revalidatePath(`/dashboard/student`);
  revalidatePath(`/dashboard/student/courses`);

  return {
    success: true,
    orderNumber: order.orderNumber,
    courseSlug: order.course.slug,
    txnId,
  };
}

/**
 * -----------------------------------------------------------------------------
 * 3. Cancel Pending Order
 * -----------------------------------------------------------------------------
 */
export async function cancelOrderAction(orderNumber: string) {
  const user = await requireAuth();

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { course: true },
  });

  if (!order || order.userId !== user.id) {
    throw new Error("Order not found or unauthorized.");
  }

  if (order.status === "PENDING") {
    await db.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
  }

  redirect(`/courses/${order.course.slug}?checkout_cancelled=true`);
}
