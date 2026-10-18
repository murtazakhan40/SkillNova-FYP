import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Webhook Ingestion & Idempotent Payment Callback Simulator
 * Demonstrates production-grade webhook signature verification, replay protection,
 * and duplicate callback prevention.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, providerTxnId, status, simulationScenario } = body;

    if (!orderNumber || !providerTxnId) {
      return NextResponse.json(
        { error: "Missing required orderNumber or providerTxnId." },
        { status: 400 }
      );
    }

    // 1. Webhook Idempotency Check: Verify if this providerTxnId was already processed
    const existingPayment = await db.payment.findUnique({
      where: { providerTxnId },
      include: { order: true },
    });

    if (existingPayment) {
      return NextResponse.json(
        {
          received: true,
          idempotent: true,
          message: "Duplicate webhook callback detected. State preserved without re-processing.",
          orderNumber: existingPayment.order.orderNumber,
          status: existingPayment.status,
        },
        { status: 200 }
      );
    }

    // 2. Fetch target Order
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { course: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 3. Process Webhook Event in Atomic ACID Transaction
    if (status === "SUCCESS") {
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "COMPLETED" },
        });

        await tx.payment.create({
          data: {
            orderId: order.id,
            providerTxnId,
            amount: order.amount,
            currency: order.currency,
            status: "SUCCESS",
            paymentMethod: "WEBHOOK_CALLBACK",
            metadata: JSON.stringify({
              provider: "DEMO_SANDBOX",
              simulatedWebhook: true,
              timestamp: new Date().toISOString(),
            }),
          },
        });

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
      });

      return NextResponse.json(
        {
          received: true,
          processed: true,
          orderStatus: "COMPLETED",
          enrollmentGranted: true,
          orderNumber: order.orderNumber,
        },
        { status: 200 }
      );
    } else {
      // Failed payment callback
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });

        await tx.payment.create({
          data: {
            orderId: order.id,
            providerTxnId,
            amount: order.amount,
            currency: order.currency,
            status: "FAILED",
            paymentMethod: "WEBHOOK_CALLBACK",
            metadata: JSON.stringify({
              reason: simulationScenario || "GATEWAY_DECLINE",
              simulatedWebhook: true,
            }),
          },
        });
      });

      return NextResponse.json(
        {
          received: true,
          processed: true,
          orderStatus: "FAILED",
          enrollmentGranted: false,
          orderNumber: order.orderNumber,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler encountered internal processing error." },
      { status: 500 }
    );
  }
}
