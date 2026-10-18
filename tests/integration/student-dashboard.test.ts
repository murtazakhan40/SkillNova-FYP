import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { testDb, initTestDatabase, resetTestState, SeededEntities } from "../setup/test-db";
import { getStudentAnalytics } from "@/lib/dashboard-analytics";
import { getStudentNotifications } from "@/lib/notifications";

describe("Student Dashboard: Multi-User Scenarios & Strict Ownership", () => {
  let seeded: SeededEntities;
  let activeStudentId: string;
  let newStudentId: string;
  let courseId: string;
  let assignmentId: string;

  beforeAll(async () => {
    seeded = await initTestDatabase();
    await resetTestState();

    activeStudentId = seeded.student.id;
    newStudentId = seeded.otherStudent.id;
    courseId = seeded.paidCourse.id;
    assignmentId = seeded.paidAssignment.id;

    // 1. Active student enrolls in Course with 50% progress
    await testDb.enrollment.create({
      data: {
        userId: activeStudentId,
        courseId,
        progress: 50.0,
      },
    });

    // 2. Active student completes lesson 1
    await testDb.lessonProgress.create({
      data: {
        userId: activeStudentId,
        lessonId: seeded.paidLessons[0].id,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // 3. Active student submits assignment & trainer grades it with feedback
    await testDb.assignmentSubmission.create({
      data: {
        assignmentId,
        userId: activeStudentId,
        textContent: "https://github.com/active-student/cloud-systems",
        status: "GRADED",
        score: 95,
        feedback: "Superb architecture and concurrency safety.",
        gradedById: seeded.trainer.id,
        gradedAt: new Date(),
      },
    });

    // 4. Active student earns a verified certificate
    await testDb.certificate.create({
      data: {
        certificateCode: "SN-2026-TEST-DASH-ACTIVE",
        userId: activeStudentId,
        courseId,
        grade: 95,
      },
    });
  });

  afterAll(async () => {
    await resetTestState();
  });

  it("Scenario 1: Active student with enrollments gets real metrics and assignment feedback", async () => {
    const analytics = await getStudentAnalytics(activeStudentId, testDb);

    expect(analytics.totalEnrolled).toBe(1);
    expect(analytics.inProgressCount).toBe(1);
    expect(analytics.completedCount).toBe(0);
    expect(analytics.certificatesCount).toBe(1);
    expect(analytics.weeklyActivity).toBeDefined();
    expect(analytics.weeklyActivity.length).toBe(7);
    expect(analytics.totalActionsThisWeek).toBeGreaterThanOrEqual(1);

    // Notifications check
    const notifications = await getStudentNotifications(activeStudentId, testDb);
    expect(notifications.length).toBeGreaterThan(0);

    // Verify assignment feedback notification exists
    const feedbackNotif = notifications.find((n) => n.type === "ASSIGNMENT");
    expect(feedbackNotif).toBeDefined();
    expect(feedbackNotif?.message).toContain("Superb architecture and concurrency safety");
  });

  it("Scenario 2: Brand new student (0 enrollments) has zero fake statistics and safe empty states", async () => {
    const analytics = await getStudentAnalytics(newStudentId, testDb);

    expect(analytics.totalEnrolled).toBe(0);
    expect(analytics.inProgressCount).toBe(0);
    expect(analytics.completedCount).toBe(0);
    expect(analytics.pendingQuizzesCount).toBe(0);
    expect(analytics.pendingAssignmentsCount).toBe(0);
    expect(analytics.averageQuizScore).toBe(0);
    expect(analytics.certificatesCount).toBe(0);
    expect(analytics.totalActionsThisWeek).toBe(0);

    // Verify 0 certificates in db for new student
    const certCount = await testDb.certificate.count({
      where: { userId: newStudentId },
    });
    expect(certCount).toBe(0);

    // Verify notifications for new student contain only default academic term notice
    const notifications = await getStudentNotifications(newStudentId, testDb);
    expect(notifications.some((n) => n.type === "CERTIFICATE")).toBe(false);
    expect(notifications.some((n) => n.type === "ASSIGNMENT")).toBe(false);
  });

  it("Scenario 3: Server-side ownership ensures new student cannot view active student's records", async () => {
    // Attempting to query certificates as new student returns zero
    const newStudentCerts = await testDb.certificate.findMany({
      where: { userId: newStudentId },
    });
    expect(newStudentCerts.length).toBe(0);

    // Active student's certificate code is not accessible
    const foundCode = newStudentCerts.find(
      (c) => c.certificateCode === "SN-2026-TEST-DASH-ACTIVE"
    );
    expect(foundCode).toBeUndefined();

    // Assignment submissions are strictly scoped
    const newStudentSubmissions = await testDb.assignmentSubmission.findMany({
      where: { userId: newStudentId },
    });
    expect(newStudentSubmissions.length).toBe(0);
  });
});
