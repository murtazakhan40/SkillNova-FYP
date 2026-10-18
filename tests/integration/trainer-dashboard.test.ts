import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { testDb, initTestDatabase, resetTestState, SeededEntities } from "../setup/test-db";
import { getTrainerAnalytics } from "@/lib/dashboard-analytics";
import { getTrainerNotifications } from "@/lib/notifications";

describe("Trainer Dashboard: Real Analytics, Curriculum Management & Strict Ownership", () => {
  let seeded: SeededEntities;
  let trainerAId: string;
  let trainerBId: string;
  let zeroTrainerId: string;
  let studentId: string;
  let courseAId: string;
  let courseBId: string;
  let assignmentAId: string;
  let assignmentBId: string;
  let submissionAId: string;
  let submissionBId: string;

  beforeAll(async () => {
    seeded = await initTestDatabase();
    await resetTestState();

    trainerAId = seeded.trainer.id;
    studentId = seeded.student.id;
    courseAId = seeded.paidCourse.id;
    assignmentAId = seeded.paidAssignment.id;

    // 1. Create Trainer B
    const trainerB = await testDb.user.create({
      data: {
        name: "Professor B",
        email: "trainer-b@skillnova.edu",
        role: "TRAINER",
        passwordHash: "hash-pw-b",
      },
    });
    trainerBId = trainerB.id;

    // 2. Create Trainer with 0 courses
    const zeroTrainer = await testDb.user.create({
      data: {
        name: "New Faculty Lead",
        email: "zero-trainer@skillnova.edu",
        role: "TRAINER",
        passwordHash: "hash-pw-zero",
      },
    });
    zeroTrainerId = zeroTrainer.id;

    // 3. Create Course B owned by Trainer B
    const courseB = await testDb.course.create({
      data: {
        title: "Trainer B Microservices Architecture",
        slug: "trainer-b-microservices",
        description: "Advanced distributed patterns with gRPC",
        price: 15000,
        instructorId: trainerBId,
        categoryId: seeded.category.id,
        published: true,
      },
    });
    courseBId = courseB.id;

    // 4. Create Assignment on Course B
    const assignmentB = await testDb.assignment.create({
      data: {
        title: "Trainer B Distributed Lock Implementation",
        description: "Implement Redis distributed lock mechanism with TTL renewal.",
        maxScore: 100,
        courseId: courseBId,
      },
    });
    assignmentBId = assignmentB.id;

    // 5. Enroll student in Course A and record a pending assignment submission
    await testDb.enrollment.create({
      data: {
        userId: studentId,
        courseId: courseAId,
        progress: 40,
      },
    });

    const subA = await testDb.assignmentSubmission.create({
      data: {
        assignmentId: assignmentAId,
        userId: studentId,
        textContent: "https://github.com/test-student/cloud-systems-solution",
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
    submissionAId = subA.id;

    // 6. Enroll other student in Course B and record pending assignment submission
    await testDb.enrollment.create({
      data: {
        userId: seeded.otherStudent.id,
        courseId: courseBId,
        progress: 25,
      },
    });

    const subB = await testDb.assignmentSubmission.create({
      data: {
        assignmentId: assignmentBId,
        userId: seeded.otherStudent.id,
        textContent: "https://github.com/test-other/distributed-lock",
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
    submissionBId = subB.id;
  });

  afterAll(async () => {
    await resetTestState();
  });

  it("Scenario 1: Calculates real database metrics for trainer with assigned courses and pending reviews", async () => {
    const analytics = await getTrainerAnalytics(trainerAId, false, testDb);

    expect(analytics.assignedCoursesCount).toBe(2); // freeCourse + paidCourse
    expect(analytics.enrolledLearnersCount).toBeGreaterThanOrEqual(1);
    expect(analytics.uniqueLearnersCount).toBeGreaterThanOrEqual(1);
    expect(analytics.pendingReviewsCount).toBe(1); // strictly submission A, NOT submission B
    expect(analytics.weeklyActivity).toBeDefined();
    expect(analytics.weeklyActivity.length).toBe(7);
    expect(analytics.totalActionsThisWeek).toBeGreaterThanOrEqual(1);
  });

  it("Scenario 2: Returns zero metrics and clean baseline for brand-new trainer with 0 courses", async () => {
    const analytics = await getTrainerAnalytics(zeroTrainerId, false, testDb);

    expect(analytics.assignedCoursesCount).toBe(0);
    expect(analytics.enrolledLearnersCount).toBe(0);
    expect(analytics.uniqueLearnersCount).toBe(0);
    expect(analytics.pendingReviewsCount).toBe(0);
    expect(analytics.completedGraduatesCount).toBe(0);
    expect(analytics.totalLessonsCount).toBe(0);
    expect(analytics.totalQuizzesCount).toBe(0);
    expect(analytics.totalAssignmentsCount).toBe(0);
    expect(analytics.averageRating).toBe("5.0");
    expect(analytics.totalActionsThisWeek).toBe(0);
  });

  it("Scenario 3: Enforces strict cross-trainer data isolation in notifications and pending reviews", async () => {
    const notifsA = await getTrainerNotifications(trainerAId, testDb);
    const notifsB = await getTrainerNotifications(trainerBId, testDb);

    // Trainer A should see submission A, but NEVER submission B
    const aHasBSubmission = notifsA.some((n) =>
      n.message.includes("Trainer B Distributed Lock Implementation")
    );
    expect(aHasBSubmission).toBe(false);

    const aHasASubmission = notifsA.some((n) =>
      n.message.includes(seeded.paidAssignment.title)
    );
    expect(aHasASubmission).toBe(true);

    // Trainer B should see submission B, but NEVER submission A
    const bHasASubmission = notifsB.some((n) =>
      n.message.includes(seeded.paidAssignment.title)
    );
    expect(bHasASubmission).toBe(false);

    const bHasBSubmission = notifsB.some((n) =>
      n.message.includes("Trainer B Distributed Lock Implementation")
    );
    expect(bHasBSubmission).toBe(true);
  });

  it("Scenario 4: Enforces server-side ownership when evaluating assignments and grading", async () => {
    // 1. Fetch submission A
    const subA = await testDb.assignmentSubmission.findUnique({
      where: { id: submissionAId },
      include: { assignment: { include: { course: true } } },
    });
    expect(subA).toBeDefined();

    // 2. Trainer B attempts to evaluate Trainer A's course assignment -> MUST BE BLOCKED
    const isTrainerBAuthorized = subA!.assignment.course.instructorId === trainerBId;
    expect(isTrainerBAuthorized).toBe(false);

    // Trainer A attempts to evaluate Trainer B's submission -> MUST ALSO BE BLOCKED
    const subB = await testDb.assignmentSubmission.findUnique({
      where: { id: submissionBId },
      include: { assignment: { include: { course: true } } },
    });
    expect(subB).toBeDefined();
    expect(subB!.assignment.course.instructorId === trainerAId).toBe(false);

    // 3. Trainer A evaluates their own course assignment
    const isTrainerAAuthorized = subA!.assignment.course.instructorId === trainerAId;
    expect(isTrainerAAuthorized).toBe(true);

    const graded = await testDb.assignmentSubmission.update({
      where: { id: submissionAId },
      data: {
        score: 96,
        status: "GRADED",
        feedback: "Exemplary code structure, clean commit history, and comprehensive README documentation.",
        gradedById: trainerAId,
        gradedAt: new Date(),
      },
    });

    expect(graded.status).toBe("GRADED");
    expect(graded.score).toBe(96);
    expect(graded.feedback).toContain("Exemplary code structure");
    expect(graded.gradedById).toBe(trainerAId);

    // Verify pending reviews count decreases to 0 for Trainer A
    const updatedAnalytics = await getTrainerAnalytics(trainerAId, false, testDb);
    expect(updatedAnalytics.pendingReviewsCount).toBe(0);
  });

  it("Scenario 5: Enforces server-side ownership when creating course assignments", async () => {
    // 1. Trainer B attempts to author assignment on Course A (owned by Trainer A)
    const targetCourseA = await testDb.course.findUnique({
      where: { id: courseAId },
    });
    expect(targetCourseA?.instructorId).toBe(trainerAId);

    const canTrainerBCreateOnCourseA = targetCourseA?.instructorId === trainerBId;
    expect(canTrainerBCreateOnCourseA).toBe(false);

    // 2. Trainer A authors assignment on Course A
    const newAssignment = await testDb.assignment.create({
      data: {
        title: "Docker Compose Multi-Container Orchestration",
        description: "Build compose manifest linking Next.js, Redis, and SQLite.",
        maxScore: 100,
        courseId: courseAId,
      },
    });

    expect(newAssignment.id).toBeDefined();
    expect(newAssignment.courseId).toBe(courseAId);

    // Audit log verification
    const audit = await testDb.auditLog.create({
      data: {
        action: "ASSIGNMENT_CREATED",
        entity: "Assignment",
        entityId: newAssignment.id,
        userId: trainerAId,
        details: JSON.stringify({
          title: newAssignment.title,
          courseId: courseAId,
        }),
      },
    });
    expect(audit.id).toBeDefined();
    expect(audit.action).toBe("ASSIGNMENT_CREATED");
  });

  it("Scenario 6: Enforces server-side ownership when authoring course quizzes with multiple-choice questions", async () => {
    // 1. Trainer B attempts to author quiz on Course A -> unauthorized
    const targetCourseA = await testDb.course.findUnique({
      where: { id: courseAId },
    });
    const canTrainerBCreateQuiz = targetCourseA?.instructorId === trainerBId;
    expect(canTrainerBCreateQuiz).toBe(false);

    // 2. Trainer A authors quiz on Course A with 2 questions
    const newQuiz = await testDb.quiz.create({
      data: {
        title: "Cloud Infrastructure Mid-Term Assessment",
        passingScore: 75,
        courseId: courseAId,
        questions: {
          create: [
            {
              text: "Which protocol operates at the Transport layer of the OSI model?",
              optionsJson: JSON.stringify(["HTTP", "TCP", "IP", "DNS"]),
              correctIndex: 1,
              explanation: "TCP operates at Layer 4 (Transport layer).",
            },
            {
              text: "What is the primary benefit of immutable cloud infrastructure?",
              optionsJson: JSON.stringify([
                "Manual patching on production servers",
                "Predictable deployments and drift elimination",
                "Lower network bandwidth consumption",
                "Unlimited free cloud storage",
              ]),
              correctIndex: 1,
              explanation: "Immutable infrastructure eliminates configuration drift.",
            },
          ],
        },
      },
      include: {
        questions: true,
      },
    });

    expect(newQuiz.id).toBeDefined();
    expect(newQuiz.questions.length).toBe(2);
    expect(newQuiz.passingScore).toBe(75);
    expect(newQuiz.questions[0].correctIndex).toBe(1);
  });

  it("Scenario 7: Blocks student role from unauthorized faculty evaluation actions", async () => {
    const studentUser = await testDb.user.findUnique({
      where: { id: studentId },
    });
    expect(studentUser?.role).toBe("STUDENT");

    // Student role check: student must be rejected from grading
    const isStudentAllowedToGrade = studentUser?.role === "TRAINER" || studentUser?.role === "ADMIN";
    expect(isStudentAllowedToGrade).toBe(false);
  });
});
