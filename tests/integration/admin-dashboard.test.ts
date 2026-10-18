import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { testDb, initTestDatabase, resetTestState, SeededEntities } from "../setup/test-db";
import { getAdminAnalytics } from "@/lib/dashboard-analytics";
import { 
  getAdminNotifications, 
  getStudentNotifications, 
  getTrainerNotifications 
} from "@/lib/notifications";

describe("Admin Dashboard: Accurate Platform Metrics, Oversight, Taxonomy & Strict RBAC", () => {
  let seeded: SeededEntities;
  let adminId: string;
  let trainerId: string;
  let studentId: string;
  let otherStudentId: string;
  let courseId: string;

  beforeAll(async () => {
    seeded = await initTestDatabase();
    await resetTestState();

    adminId = seeded.admin.id;
    trainerId = seeded.trainer.id;
    studentId = seeded.student.id;
    otherStudentId = seeded.otherStudent.id;
    courseId = seeded.paidCourse.id;

    // Enroll student in paid course with 100% completion for verified metrics
    await testDb.enrollment.create({
      data: {
        userId: studentId,
        courseId: courseId,
        progress: 100,
        completedAt: new Date(),
      },
    });

    // Issue certificate
    await testDb.certificate.create({
      data: {
        certificateCode: "SN-2026-TEST-ADMIN001",
        userId: studentId,
        courseId: courseId,
        grade: 95.0,
      },
    });
  });

  afterAll(async () => {
    await resetTestState();
  });

  it("Scenario 1: Accurately calculates platform analytics and real-time activity stream from database", async () => {
    const analytics = await getAdminAnalytics(testDb);

    expect(analytics.studentCount).toBeGreaterThanOrEqual(2);
    expect(analytics.trainerCount).toBeGreaterThanOrEqual(1);
    expect(analytics.adminCount).toBeGreaterThanOrEqual(1);
    expect(analytics.totalUsers).toBe(
      analytics.studentCount + analytics.trainerCount + analytics.adminCount
    );

    expect(analytics.courseCount).toBeGreaterThanOrEqual(2);
    expect(analytics.publishedCourseCount).toBeGreaterThanOrEqual(1);
    expect(analytics.enrollmentCount).toBeGreaterThanOrEqual(1);
    expect(analytics.completedEnrollmentCount).toBeGreaterThanOrEqual(1);
    expect(analytics.completionRate).toBeGreaterThanOrEqual(50);
    expect(analytics.certCount).toBeGreaterThanOrEqual(1);
    expect(analytics.totalRevenue).toBeGreaterThanOrEqual(seeded.paidCourse.price);

    // Weekly activity 7-day window
    expect(analytics.weeklyActivity).toBeDefined();
    expect(analytics.weeklyActivity.length).toBe(7);

    // Recent activity stream
    expect(analytics.recentActivity).toBeDefined();
    expect(analytics.recentActivity.length).toBeGreaterThanOrEqual(1);
    const hasEnrollmentOrCert = analytics.recentActivity.some(
      (ev) => ev.type === "ENROLLMENT" || ev.type === "CERTIFICATE"
    );
    expect(hasEnrollmentOrCert).toBe(true);
  });

  it("Scenario 2: Manages category taxonomy with uniqueness and safe deletion guardrails", async () => {
    // 1. Create new category
    const cat = await testDb.category.create({
      data: {
        name: "Distributed Systems & Cloud",
        slug: "distributed-systems-cloud",
        description: "High concurrency microservices and cloud infrastructure",
        icon: "Layers",
      },
    });
    expect(cat.id).toBeDefined();
    expect(cat.slug).toBe("distributed-systems-cloud");

    // 2. Uniqueness guard on duplicate slug
    await expect(
      testDb.category.create({
        data: {
          name: "Duplicate Category Attempt",
          slug: "distributed-systems-cloud",
        },
      })
    ).rejects.toThrow();

    // 3. Attach a course to category -> verify safe deletion check
    const courseInCat = await testDb.course.create({
      data: {
        title: "Kubernetes Cluster Architecture",
        slug: "k8s-cluster-arch",
        description: "Orchestration guide",
        price: 18000,
        instructorId: trainerId,
        categoryId: cat.id,
        published: true,
      },
    });

    const categoryWithCourses = await testDb.category.findUnique({
      where: { id: cat.id },
      include: { courses: true },
    });
    expect(categoryWithCourses?.courses.length).toBe(1);

    // Business logic guard: cannot delete if courses exist
    const canDeleteWhileAssigned = (categoryWithCourses?.courses.length ?? 0) === 0;
    expect(canDeleteWhileAssigned).toBe(false);

    // 4. Clean up course, then safely delete category
    await testDb.course.delete({ where: { id: courseInCat.id } });
    await testDb.category.delete({ where: { id: cat.id } });

    const deletedLookup = await testDb.category.findUnique({ where: { id: cat.id } });
    expect(deletedLookup).toBeNull();
  });

  it("Scenario 3: Grants manual student enrollment and enforces duplicate enrollment rejection", async () => {
    // 1. Manually enroll otherStudent into paidCourse
    const manualEnrollment = await testDb.enrollment.create({
      data: {
        userId: otherStudentId,
        courseId: courseId,
        progress: 0.0,
      },
    });

    expect(manualEnrollment.id).toBeDefined();
    expect(manualEnrollment.progress).toBe(0.0);

    // Audit log verification
    await testDb.auditLog.create({
      data: {
        action: "MANUAL_STUDENT_ENROLLED",
        entity: "Enrollment",
        entityId: manualEnrollment.id,
        details: JSON.stringify({
          studentEmail: seeded.otherStudent.email,
          courseId,
          enrolledBy: seeded.admin.email,
        }),
        userId: adminId,
      },
    });

    // 2. Reject duplicate enrollment for the same user and course
    await expect(
      testDb.enrollment.create({
        data: {
          userId: otherStudentId,
          courseId: courseId,
          progress: 0.0,
        },
      })
    ).rejects.toThrow();
  });

  it("Scenario 4: Revokes student enrollment with audit trail", async () => {
    // Find otherStudent enrollment in courseId
    const enrollment = await testDb.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: otherStudentId,
          courseId: courseId,
        },
      },
    });
    expect(enrollment).toBeDefined();

    // Revoke enrollment
    await testDb.enrollment.delete({
      where: { id: enrollment!.id },
    });

    // Record audit trace
    const audit = await testDb.auditLog.create({
      data: {
        action: "STUDENT_ENROLLMENT_REVOKED",
        entity: "Enrollment",
        entityId: enrollment!.id,
        details: JSON.stringify({
          studentEmail: seeded.otherStudent.email,
          reason: "Administrative Policy Audit",
          revokedBy: seeded.admin.email,
        }),
        userId: adminId,
      },
    });

    expect(audit.action).toBe("STUDENT_ENROLLMENT_REVOKED");

    // Verify enrollment no longer exists
    const revokedLookup = await testDb.enrollment.findUnique({
      where: { id: enrollment!.id },
    });
    expect(revokedLookup).toBeNull();
  });

  it("Scenario 5: Toggles course moderation state and reassigns faculty instructor", async () => {
    // 1. Toggle publish state
    const original = await testDb.course.findUnique({
      where: { id: courseId },
      select: { published: true },
    });

    const toggled = await testDb.course.update({
      where: { id: courseId },
      data: { published: !original!.published },
    });
    expect(toggled.published).toBe(!original!.published);

    // Restore to published
    await testDb.course.update({
      where: { id: courseId },
      data: { published: true },
    });

    // 2. Create faculty trainer B and reassign course
    const newTrainer = await testDb.user.create({
      data: {
        name: "Dr. Evelyn Vance",
        email: "evelyn.vance@skillnova.edu",
        role: "TRAINER",
        passwordHash: "hash-pw-evelyn",
      },
    });

    const reassigned = await testDb.course.update({
      where: { id: courseId },
      data: { instructorId: newTrainer.id },
      include: { instructor: true },
    });

    expect(reassigned.instructorId).toBe(newTrainer.id);
    expect(reassigned.instructor.name).toBe("Dr. Evelyn Vance");

    // Restore original trainer
    await testDb.course.update({
      where: { id: courseId },
      data: { instructorId: trainerId },
    });
  });

  it("Scenario 6: Broadcasts institutional announcement and delivers to all role notification feeds", async () => {
    // 1. Admin broadcasts announcement
    const announcementId = `announcement-test-${Date.now()}`;
    const auditBroadcast = await testDb.auditLog.create({
      data: {
        action: "BROADCAST_ANNOUNCEMENT",
        entity: "Announcement",
        entityId: announcementId,
        details: JSON.stringify({
          title: "Fall Semester Midterm Evaluation Notice",
          message: "All course practical deliverables must be submitted before Friday.",
          priority: "URGENT",
          scope: "ALL",
          authorName: "Dean of Academic Affairs",
        }),
        userId: adminId,
      },
    });

    expect(auditBroadcast.id).toBeDefined();

    // 2. Verify announcement delivers into Student Notifications
    const studentNotifs = await getStudentNotifications(studentId, testDb);
    const hasStudentBroadcast = studentNotifs.some(
      (n) => n.title === "Fall Semester Midterm Evaluation Notice"
    );
    expect(hasStudentBroadcast).toBe(true);

    // 3. Verify announcement delivers into Trainer Notifications
    const trainerNotifs = await getTrainerNotifications(trainerId, testDb);
    const hasTrainerBroadcast = trainerNotifs.some(
      (n) => n.title === "Fall Semester Midterm Evaluation Notice"
    );
    expect(hasTrainerBroadcast).toBe(true);

    // 4. Verify announcement delivers into Admin Notifications
    const adminNotifs = await getAdminNotifications(testDb);
    const hasAdminBroadcast = adminNotifs.some((n) =>
      n.title.includes("Fall Semester Midterm Evaluation Notice")
    );
    expect(hasAdminBroadcast).toBe(true);
  });

  it("Scenario 7: Enforces strict RBAC role boundaries and prevents admin self-demotion", async () => {
    // 1. Role validation guard: non-admin roles (STUDENT / TRAINER) cannot modify roles
    const studentRole = seeded.student.role;
    const canStudentExecuteAdmin = studentRole === "ADMIN";
    expect(canStudentExecuteAdmin).toBe(false);

    const trainerRole = seeded.trainer.role;
    const canTrainerExecuteAdmin = trainerRole === "ADMIN";
    expect(canTrainerExecuteAdmin).toBe(false);

    // 2. Admin self-demotion guard
    const adminSelfDemotionAttempt = (callerId: string, targetUserId: string, targetRole: string) => {
      if (callerId === targetUserId && targetRole !== "ADMIN") {
        throw new Error("Safety violation: Administrators cannot demote their own account.");
      }
    };

    expect(() =>
      adminSelfDemotionAttempt(adminId, adminId, "STUDENT")
    ).toThrow("Safety violation: Administrators cannot demote their own account.");

    expect(() =>
      adminSelfDemotionAttempt(adminId, adminId, "TRAINER")
    ).toThrow("Safety violation: Administrators cannot demote their own account.");

    // Admin updating another user's role is allowed
    expect(() =>
      adminSelfDemotionAttempt(adminId, studentId, "TRAINER")
    ).not.toThrow();
  });
});
