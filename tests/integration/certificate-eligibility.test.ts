import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { testDb, initTestDatabase, resetTestState, SeededEntities } from "../setup/test-db";
import { evaluateAndIssueCertificate } from "@/lib/certificates";

describe("Integration: Certificate Eligibility & Credential Issuance Engine", () => {
  let seeded: SeededEntities;

  beforeAll(async () => {
    seeded = await initTestDatabase();
  });

  beforeEach(async () => {
    await resetTestState();
  });

  it("should reject certificate eligibility when curriculum lessons are incomplete", async () => {
    // 1. Enroll student
    await testDb.enrollment.create({
      data: {
        userId: seeded.student.id,
        courseId: seeded.paidCourse.id,
        progress: 0.0,
      },
    });

    // 0 out of 4 lessons completed
    const result = await evaluateAndIssueCertificate(
      seeded.student.id,
      seeded.paidCourse.id,
      testDb
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("Coursework incomplete");
    expect(result.certificate).toBeUndefined();
  });

  it("should reject certificate eligibility when final assessment is failed despite 100% lessons", async () => {
    // 1. Enroll student
    await testDb.enrollment.create({
      data: {
        userId: seeded.student.id,
        courseId: seeded.paidCourse.id,
        progress: 100.0,
      },
    });

    // 2. Mark all 4 lessons completed
    for (const lesson of seeded.paidLessons) {
      await testDb.lessonProgress.create({
        data: {
          userId: seeded.student.id,
          lessonId: lesson.id,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }

    // 3. Record FAILING quiz attempt (50% when passing is 70%)
    await testDb.quizSubmission.create({
      data: {
        quizId: seeded.paidQuiz.id,
        userId: seeded.student.id,
        score: 50.0,
        passed: false,
      },
    });

    const result = await evaluateAndIssueCertificate(
      seeded.student.id,
      seeded.paidCourse.id,
      testDb
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("Course assessment not passed");
    expect(result.certificate).toBeUndefined();
  });

  it("should issue certificate with verified grade when 100% lessons + passed quiz are satisfied", async () => {
    // 1. Enroll student
    await testDb.enrollment.create({
      data: {
        userId: seeded.student.id,
        courseId: seeded.paidCourse.id,
        progress: 100.0,
      },
    });

    // 2. Mark all 4 lessons completed
    for (const lesson of seeded.paidLessons) {
      await testDb.lessonProgress.create({
        data: {
          userId: seeded.student.id,
          lessonId: lesson.id,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }

    // 3. Record PASSING quiz attempt (95%)
    await testDb.quizSubmission.create({
      data: {
        quizId: seeded.paidQuiz.id,
        userId: seeded.student.id,
        score: 95.0,
        passed: true,
      },
    });

    const result = await evaluateAndIssueCertificate(
      seeded.student.id,
      seeded.paidCourse.id,
      testDb
    );

    expect(result.eligible).toBe(true);
    expect(result.newlyIssued).toBe(true);
    expect(result.certificate).toBeDefined();
    expect(result.certificate?.grade).toBe(95.0);

    // Verify format: SN-2026-XXXX-XXXX-XXXX
    const code = result.certificate!.certificateCode;
    expect(code).toMatch(/^SN-2026-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);

    // Verify persisted in database
    const inDb = await testDb.certificate.findUnique({
      where: { certificateCode: code },
    });
    expect(inDb).not.toBeNull();
    expect(inDb?.isRevoked).toBe(false);
  });

  it("should handle certificate revocation lifecycle with reason and audit timestamp", async () => {
    // Manually issue a certificate
    const cert = await testDb.certificate.create({
      data: {
        certificateCode: "SN-2026-TEST-REVK-0001",
        userId: seeded.student.id,
        courseId: seeded.paidCourse.id,
        grade: 88.0,
        isRevoked: false,
      },
    });

    // Revoke certificate
    const revoked = await testDb.certificate.update({
      where: { id: cert.id },
      data: {
        isRevoked: true,
        revokedReason: "Academic Misconduct Investigation",
        revokedAt: new Date(),
      },
    });

    expect(revoked.isRevoked).toBe(true);
    expect(revoked.revokedReason).toBe("Academic Misconduct Investigation");
    expect(revoked.revokedAt).not.toBeNull();
  });
});
