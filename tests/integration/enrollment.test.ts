import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { testDb, initTestDatabase, resetTestState, SeededEntities } from "../setup/test-db";

describe("Integration: Database-Backed Enrollment & Payment Settlement", () => {
  let seeded: SeededEntities;

  beforeAll(async () => {
    seeded = await initTestDatabase();
  });

  beforeEach(async () => {
    await resetTestState();
  });

  it("should enroll student directly into free course with 0.0 progress without orders", async () => {
    const enrollment = await testDb.enrollment.create({
      data: {
        userId: seeded.student.id,
        courseId: seeded.freeCourse.id,
        progress: 0.0,
      },
    });

    expect(enrollment.id).toBeDefined();
    expect(enrollment.progress).toBe(0.0);
    expect(enrollment.userId).toBe(seeded.student.id);
    expect(enrollment.courseId).toBe(seeded.freeCourse.id);

    // Verify zero financial orders were created
    const orders = await testDb.order.findMany({
      where: { userId: seeded.student.id, courseId: seeded.freeCourse.id },
    });
    expect(orders.length).toBe(0);
  });

  it("should enforce compound uniqueness [userId, courseId] to prevent duplicate enrollment", async () => {
    await testDb.enrollment.create({
      data: {
        userId: seeded.student.id,
        courseId: seeded.freeCourse.id,
        progress: 0.0,
      },
    });

    // Attempting duplicate insert should trigger Prisma unique constraint error
    await expect(
      testDb.enrollment.create({
        data: {
          userId: seeded.student.id,
          courseId: seeded.freeCourse.id,
          progress: 10.0,
        },
      })
    ).rejects.toThrow();
  });

  it("should create paid course order with canonical database price and settle access atomically", async () => {
    const orderNumber = `ORD-TEST-${Date.now().toString(36).toUpperCase()}`;
    const idempKey = `idemp_${seeded.student.id}_${seeded.paidCourse.id}_${Date.now()}`;

    // 1. Order Creation
    const order = await testDb.order.create({
      data: {
        orderNumber,
        userId: seeded.student.id,
        courseId: seeded.paidCourse.id,
        amount: seeded.paidCourse.price, // Canonical DB price
        currency: "PKR",
        status: "PENDING",
        provider: "DEMO_SANDBOX",
        idempotencyKey: idempKey,
      },
    });

    expect(order.amount).toBe(18000.0);
    expect(order.status).toBe("PENDING");

    // 2. Before payment: Student has NO enrollment
    const beforePayment = await testDb.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: seeded.student.id,
          courseId: seeded.paidCourse.id,
        },
      },
    });
    expect(beforePayment).toBeNull();

    // 3. Atomic Settlement
    const txnId = `TXN-DEMO-${Date.now().toString(36).toUpperCase()}`;
    await testDb.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          providerTxnId: txnId,
          amount: order.amount,
          currency: "PKR",
          status: "SUCCESS",
          paymentMethod: "DEMO_CARD",
          metadata: JSON.stringify({ simulated: true }),
        },
      });

      await tx.enrollment.create({
        data: {
          userId: order.userId,
          courseId: order.courseId,
          progress: 0.0,
        },
      });
    });

    // 4. After settlement: Enrollment exists and order is completed
    const afterPayment = await testDb.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: seeded.student.id,
          courseId: seeded.paidCourse.id,
        },
      },
    });

    expect(afterPayment).not.toBeNull();
    expect(afterPayment?.progress).toBe(0.0);

    const completedOrder = await testDb.order.findUnique({
      where: { id: order.id },
      include: { payment: true },
    });
    expect(completedOrder?.status).toBe("COMPLETED");
    expect(completedOrder?.payment?.status).toBe("SUCCESS");
  });

  it("should strictly deny course access on declined payment", async () => {
    const orderNumber = `ORD-FAIL-${Date.now().toString(36).toUpperCase()}`;
    const idempKey = `idemp_fail_${seeded.student.id}_${seeded.paidCourse.id}_${Date.now()}`;

    const order = await testDb.order.create({
      data: {
        orderNumber,
        userId: seeded.student.id,
        courseId: seeded.paidCourse.id,
        amount: seeded.paidCourse.price,
        currency: "PKR",
        status: "PENDING",
        provider: "DEMO_SANDBOX",
        idempotencyKey: idempKey,
      },
    });

    // Simulate failure
    await testDb.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          providerTxnId: `TXN-FAIL-${Date.now()}`,
          amount: order.amount,
          currency: "PKR",
          status: "FAILED",
          paymentMethod: "DEMO_CARD",
          metadata: JSON.stringify({ reason: "INSUFFICIENT_FUNDS" }),
        },
      });
    });

    const activeEnrollment = await testDb.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: seeded.student.id,
          courseId: seeded.paidCourse.id,
        },
      },
    });

    expect(activeEnrollment).toBeNull();
  });
});
