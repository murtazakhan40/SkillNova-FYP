import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { testDb, initTestDatabase, resetTestState, SeededEntities } from "../setup/test-db";
import { 
  generateStudentAcademicReport, 
  sendParentAcademicReport 
} from "@/lib/parent-reports";

describe("Integration: Under-18 Minor Guardian Registration & Parent Progress Reporting Lifecycle", () => {
  let seeded: SeededEntities;

  beforeAll(async () => {
    seeded = await initTestDatabase();
  });

  beforeEach(async () => {
    await resetTestState();
  });

  it("should record young learner age and parent/guardian contact details on student profile", async () => {
    // 1. Update test student as a 15-year-old minor with parent contact details
    const updated = await testDb.user.update({
      where: { id: seeded.student.id },
      data: {
        age: 15,
        parentName: "Ali Wazir",
        parentEmail: "ali.wazir.parent@example.com",
        parentPhone: "+92 300 9876543",
        parentRelationship: "Father",
        parentConsentGiven: true,
        parentConsentAt: new Date(),
      },
    });

    expect(updated.age).toBe(15);
    expect(updated.parentName).toBe("Ali Wazir");
    expect(updated.parentEmail).toBe("ali.wazir.parent@example.com");
    expect(updated.parentConsentGiven).toBe(true);
  });

  it("should generate a comprehensive academic progress report for parents", async () => {
    // 1. Setup minor student
    await testDb.user.update({
      where: { id: seeded.student.id },
      data: {
        age: 14,
        parentName: "Fatima Wazir",
        parentEmail: "fatima.parent@example.com",
        parentPhone: "+92 301 1234567",
        parentRelationship: "Mother",
      },
    });

    // 2. Enroll student in paid course and complete 2 out of 4 lessons
    await testDb.enrollment.create({
      data: {
        userId: seeded.student.id,
        courseId: seeded.paidCourse.id,
        progress: 50.0,
      },
    });

    await testDb.lessonProgress.create({
      data: {
        userId: seeded.student.id,
        lessonId: seeded.paidLessons[0].id,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    await testDb.lessonProgress.create({
      data: {
        userId: seeded.student.id,
        lessonId: seeded.paidLessons[1].id,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // 3. Record passing quiz attempt
    await testDb.quizSubmission.create({
      data: {
        userId: seeded.student.id,
        quizId: seeded.paidQuiz.id,
        score: 95.0,
        passed: true,
      },
    });

    // 4. Generate academic report for parent
    const report = await generateStudentAcademicReport(
      seeded.student.id,
      seeded.paidCourse.id,
      testDb
    );

    expect(report.student.name).toBe(seeded.student.name);
    expect(report.student.age).toBe(14);
    expect(report.student.isMinor).toBe(true);
    expect(report.student.parentName).toBe("Fatima Wazir");
    expect(report.student.parentEmail).toBe("fatima.parent@example.com");

    expect(report.course).toBeDefined();
    expect(report.course?.title).toBe(seeded.paidCourse.title);
    expect(report.course?.totalLessons).toBe(4);
    expect(report.course?.completedLessons).toBe(2);
    expect(report.course?.progressPercent).toBe(50);
    expect(report.course?.quizzes.length).toBe(1);
    expect(report.course?.quizzes[0].score).toBe(95);
    expect(report.course?.quizzes[0].passed).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it("should dispatch parent academic progress report and persist record in ParentReport audit ledger", async () => {
    // 1. Setup minor student
    await testDb.user.update({
      where: { id: seeded.student.id },
      data: {
        age: 16,
        parentName: "Zahid Khan",
        parentEmail: "zahid.khan@example.com",
        parentPhone: "+92 302 5556677",
        parentRelationship: "Guardian",
      },
    });

    // 2. Enroll student
    await testDb.enrollment.create({
      data: {
        userId: seeded.student.id,
        courseId: seeded.freeCourse.id,
        progress: 25.0,
      },
    });

    // 3. Send report
    const result = await sendParentAcademicReport({
      studentId: seeded.student.id,
      courseId: seeded.freeCourse.id,
      reportType: "PROGRESS_UPDATE",
      customNote: "Student participated actively in classroom discussions today.",
      prismaClient: testDb,
    });

    expect(result.success).toBe(true);
    expect(result.recipientEmail).toBe("zahid.khan@example.com");

    // 4. Verify report record in database
    const savedReport = await testDb.parentReport.findFirst({
      where: { studentId: seeded.student.id },
    });

    expect(savedReport).not.toBeNull();
    expect(savedReport?.recipientEmail).toBe("zahid.khan@example.com");
    expect(savedReport?.deliveryStatus).toBe("DELIVERED");
    expect(savedReport?.reportType).toBe("PROGRESS_UPDATE");

    const summaryJson = JSON.parse(savedReport?.summary || "{}");
    expect(summaryJson.studentName).toBe(seeded.student.name);
    expect(summaryJson.parentName).toBe("Zahid Khan");
    expect(summaryJson.customNote).toContain("participated actively");

    // 5. Verify student received in-app notification
    const studentNotification = await testDb.notification.findFirst({
      where: { userId: seeded.student.id, type: "ACADEMIC" },
    });
    expect(studentNotification).not.toBeNull();
    expect(studentNotification?.title).toContain("Academic Report Sent to Parent");

    // 6. Verify audit log trace
    const auditLog = await testDb.auditLog.findFirst({
      where: { action: "PARENT_REPORT_DISPATCHED", entityId: savedReport?.id },
    });
    expect(auditLog).not.toBeNull();
  });

  it("should gracefully reject sending report when student has no registered parent email", async () => {
    // Adult student without parent email
    await testDb.user.update({
      where: { id: seeded.otherStudent.id },
      data: {
        age: 22,
        parentEmail: null,
      },
    });

    const result = await sendParentAcademicReport({
      studentId: seeded.otherStudent.id,
      courseId: seeded.freeCourse.id,
      prismaClient: testDb,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("No parent or guardian email");
  });
});
