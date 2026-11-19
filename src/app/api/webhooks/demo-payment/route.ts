import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function verifyWebhookAuth(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
  
  // If in production, secret is mandatory
  if (process.env.NODE_ENV === "production" && !secret) {
    console.error("FATAL: PAYMENT_WEBHOOK_SECRET is not configured in production.");
    return false;
  }

  // If secret is set, verify either HMAC-SHA256 signature or direct secret token
  if (secret) {
    const signature = request.headers.get("x-webhook-signature");
    const headerSecret = request.headers.get("x-webhook-secret");

    if (headerSecret) {
      try {
        const secBuf = Buffer.from(secret);
        const hdrBuf = Buffer.from(headerSecret);
        if (secBuf.length === hdrBuf.length && crypto.timingSafeEqual(secBuf, hdrBuf)) {
          return true;
        }
      } catch {
        // Fall through
      }
    }

    if (signature) {
      try {
        const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
        if (signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
          return true;
        }
      } catch {
        return false;
      }
    }

    return false;
  }

  // In non-production without configured secret, allow demo simulator requests
  return true;
}

/**
 * Webhook Ingestion & Idempotent Payment Callback Simulator
 * Demonstrates production-grade webhook signature verification, replay protection,
 * duplicate callback prevention, and sanitized audit logging.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    
    // 0. Verify Webhook Authenticity
    if (!verifyWebhookAuth(request, rawBody)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing webhook signature/secret." },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Malformed payload: Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { orderNumber, providerTxnId, status, simulationScenario } = body as {
      orderNumber?: string;
      providerTxnId?: string;
      status?: string;
      simulationScenario?: string;
    };

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

        // 4. Log Operational Governance Audit Trace
        await tx.auditLog.create({
          data: {
            action: "WEBHOOK_PAYMENT_SETTLED",
            entity: "Order",
            entityId: order.id,
            details: JSON.stringify({
              orderNumber: order.orderNumber,
              providerTxnId,
              amount: order.amount,
              currency: order.currency,
              userId: order.userId,
              courseId: order.courseId,
            }),
            userId: order.userId,
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

        await tx.auditLog.create({
          data: {
            action: "WEBHOOK_PAYMENT_FAILED",
            entity: "Order",
            entityId: order.id,
            details: JSON.stringify({
              orderNumber: order.orderNumber,
              providerTxnId,
              reason: simulationScenario || "GATEWAY_DECLINE",
            }),
            userId: order.userId,
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
