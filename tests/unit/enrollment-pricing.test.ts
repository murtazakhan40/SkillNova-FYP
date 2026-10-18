import crypto from "node:crypto";
import { describe, it, expect } from "vitest";

/**
 * Pure policy evaluation engine for enrollment & checkout routing
 */
export function evaluateCourseEnrollmentPolicy(course: {
  id: string;
  price: number;
  slug: string;
}): {
  allowedDirectEnrollment: boolean;
  requiresCheckout: boolean;
  redirectUrl: string;
} {
  if (course.price <= 0) {
    return {
      allowedDirectEnrollment: true,
      requiresCheckout: false,
      redirectUrl: "/dashboard/student/courses",
    };
  }

  return {
    allowedDirectEnrollment: false,
    requiresCheckout: true,
    redirectUrl: `/checkout/${course.slug}`,
  };
}

/**
 * Validates canonical database price invariant.
 * Server must always use canonical price regardless of client input.
 */
export function resolveOrderPrice(
  canonicalPrice: number,
  _clientSuppliedAmount?: number
): number {
  // STRICT: Client amount is completely discarded; database price is enforced
  return canonicalPrice;
}

describe("Unit: Enrollment & Course Pricing Invariants", () => {
  it("should permit direct zero-cost enrollment for free courses (price === 0)", () => {
    const freeCourse = {
      id: "course-free-1",
      slug: "ux-research-foundation",
      price: 0.0,
    };

    const policy = evaluateCourseEnrollmentPolicy(freeCourse);
    expect(policy.allowedDirectEnrollment).toBe(true);
    expect(policy.requiresCheckout).toBe(false);
    expect(policy.redirectUrl).toBe("/dashboard/student/courses");
  });

  it("should block direct free enrollment and enforce checkout for paid courses (price > 0)", () => {
    const paidCourse = {
      id: "course-paid-1",
      slug: "web-development-bootcamp",
      price: 18500.0,
    };

    const policy = evaluateCourseEnrollmentPolicy(paidCourse);
    expect(policy.allowedDirectEnrollment).toBe(false);
    expect(policy.requiresCheckout).toBe(true);
    expect(policy.redirectUrl).toBe("/checkout/web-development-bootcamp");
  });

  it("should discard client-supplied price tampering attempts and resolve canonical price", () => {
    const canonicalPrice = 18500.0;
    const attackerPrice = 1.0; // Attacker attempts to pay 1 PKR

    const resolved = resolveOrderPrice(canonicalPrice, attackerPrice);
    expect(resolved).toBe(18500.0);
    expect(resolved).not.toBe(attackerPrice);
  });

  it("should generate unique idempotency keys with high entropy", () => {
    const generateIdemp = (userId: string, courseId: string) => {
      const randomNonce = crypto.randomBytes(8).toString("hex");
      return `idemp_${userId}_${courseId}_${Date.now()}_${randomNonce}`;
    };

    const key1 = generateIdemp("u1", "c1");
    const key2 = generateIdemp("u1", "c1");

    expect(key1).not.toBe(key2);
    expect(key1.startsWith("idemp_u1_c1_")).toBe(true);
  });
});
