import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { testDb, initTestDatabase, resetTestState, SeededEntities } from "../setup/test-db";

describe("Integration: Assignment Deliverables & Faculty Evaluation Lifecycle", () => {
  let seeded: SeededEntities;

  beforeAll(async () => {
    seeded = await initTestDatabase();
  });

  beforeEach(async () => {
    await resetTestState();
  });

  it("should record student assignment submission deliverable", async () => {
    const submission = await testDb.assignmentSubmission.create({
      data: {
        assignmentId: seeded.paidAssignment.id,
        userId: seeded.student.id,
        textContent: "Comprehensive Terraform code and architecture diagram notes.",
        fileUrl: "/uploads/assignments/test_capstone_manifest.pdf",
        fileName: "test_capstone_manifest.pdf",
        fileSize: 1048576,
        status: "SUBMITTED",
      },
    });

    expect(submission.id).toBeDefined();
    expect(submission.status).toBe("SUBMITTED");
    expect(submission.score).toBeNull();
    expect(submission.feedback).toBeNull();
    expect(submission.fileUrl).toBe("/uploads/assignments/test_capstone_manifest.pdf");
  });

  it("should enforce compound uniqueness [assignmentId, userId] to block duplicate submissions", async () => {
    await testDb.assignmentSubmission.create({
      data: {
        assignmentId: seeded.paidAssignment.id,
        userId: seeded.student.id,
        fileUrl: "/uploads/assignments/first_attempt.pdf",
        status: "SUBMITTED",
      },
    });

    await expect(
      testDb.assignmentSubmission.create({
        data: {
          assignmentId: seeded.paidAssignment.id,
          userId: seeded.student.id,
          fileUrl: "/uploads/assignments/duplicate_spam.pdf",
          status: "SUBMITTED",
        },
      })
    ).rejects.toThrow();
  });

  it("should allow faculty instructor to evaluate submission and record rubric score & feedback", async () => {
    const submission = await testDb.assignmentSubmission.create({
      data: {
        assignmentId: seeded.paidAssignment.id,
        userId: seeded.student.id,
        fileUrl: "/uploads/assignments/student_deliverable.pdf",
        status: "SUBMITTED",
      },
    });

    // Trainer evaluations
    const graded = await testDb.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        score: 94.0,
        feedback: "Exceptional architecture with robust multi-region failover. Exceeds capstone requirements.",
        status: "GRADED",
        gradedById: seeded.trainer.id,
        gradedAt: new Date(),
      },
    });

    expect(graded.status).toBe("GRADED");
    expect(graded.score).toBe(94.0);
    expect(graded.feedback).toContain("Exceptional architecture");
    expect(graded.gradedById).toBe(seeded.trainer.id);

    // Audit log
    const audit = await testDb.auditLog.create({
      data: {
        action: "ASSIGNMENT_GRADED",
        entity: "AssignmentSubmission",
        entityId: submission.id,
        userId: seeded.trainer.id,
        details: JSON.stringify({
          score: 94.0,
          studentId: seeded.student.id,
          evaluatorId: seeded.trainer.id,
        }),
      },
    });

    expect(audit.id).toBeDefined();
    expect(audit.action).toBe("ASSIGNMENT_GRADED");
  });

  it("should handle faculty request for resubmission with guidance feedback", async () => {
    const submission = await testDb.assignmentSubmission.create({
      data: {
        assignmentId: seeded.paidAssignment.id,
        userId: seeded.student.id,
        fileUrl: "/uploads/assignments/incomplete_draft.pdf",
        status: "SUBMITTED",
      },
    });

    const resubmit = await testDb.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        status: "RESUBMIT_REQUESTED",
        feedback: "Terraform manifests missing disaster recovery policy. Please revise and upload updated blueprint.",
      },
    });

    expect(resubmit.status).toBe("RESUBMIT_REQUESTED");
    expect(resubmit.score).toBeNull();
  });
});
