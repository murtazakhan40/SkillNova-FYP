import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";

// Dedicated isolated Prisma Client connected strictly to test.db
export const testDb = new PrismaClient({
  datasources: {
    db: {
      url: "file:./test.db",
    },
  },
  log: ["error"],
});

export interface SeededEntities {
  student: any;
  trainer: any;
  admin: any;
  otherStudent: any;
  category: any;
  freeCourse: any;
  paidCourse: any;
  paidLessons: any[];
  paidQuiz: any;
  paidAssignment: any;
}

let cachedEntities: SeededEntities | null = null;

/**
 * Initialize test database schema and seed pristine, synthetic test fixtures.
 * Never touches or mutates development/production databases.
 */
export async function initTestDatabase(): Promise<SeededEntities> {
  if (cachedEntities) {
    return cachedEntities;
  }

  // 1. Ensure test database schema is pushed
  try {
    execSync("npx prisma db push --schema=prisma/schema.prisma --skip-generate", {
      stdio: "pipe",
      env: {
        ...process.env,
        DATABASE_URL: "file:./test.db",
      },
    });
  } catch (err) {
    console.error("Failed to push schema to test.db:", err);
  }

  // 2. Clear all tables in test database to guarantee clean baseline
  await testDb.auditLog.deleteMany({});
  await testDb.payment.deleteMany({});
  await testDb.order.deleteMany({});
  await testDb.certificate.deleteMany({});
  await testDb.assignmentSubmission.deleteMany({});
  await testDb.assignment.deleteMany({});
  await testDb.lessonDiscussion.deleteMany({});
  await testDb.lessonResource.deleteMany({});
  await testDb.quizSubmission.deleteMany({});
  await testDb.question.deleteMany({});
  await testDb.quiz.deleteMany({});
  await testDb.lessonProgress.deleteMany({});
  await testDb.lesson.deleteMany({});
  await testDb.section.deleteMany({});
  await testDb.enrollment.deleteMany({});
  await testDb.review.deleteMany({});
  await testDb.course.deleteMany({});
  await testDb.category.deleteMany({});
  await testDb.user.deleteMany({});

  const passwordHash = await bcrypt.hash("TestPassword123!", 10);

  // 3. Seed Synthetic Users with upsert (Zero real data)
  const student = await testDb.user.upsert({
    where: { email: "test-student@skillnova.edu" },
    update: {},
    create: {
      email: "test-student@skillnova.edu",
      name: "Test Student",
      role: "STUDENT",
      passwordHash,
      phone: "+1-555-0101",
      headline: "Enrolled Computer Science Student",
    },
  });

  const otherStudent = await testDb.user.upsert({
    where: { email: "test-other@skillnova.edu" },
    update: {},
    create: {
      email: "test-other@skillnova.edu",
      name: "Test Other Student",
      role: "STUDENT",
      passwordHash,
      phone: "+1-555-0102",
      headline: "Independent Enrolled Student",
    },
  });

  const trainer = await testDb.user.upsert({
    where: { email: "test-trainer@skillnova.edu" },
    update: {},
    create: {
      email: "test-trainer@skillnova.edu",
      name: "Test Faculty Trainer",
      role: "TRAINER",
      passwordHash,
      phone: "+1-555-0103",
      headline: "Senior Cloud & Security Instructor",
    },
  });

  const admin = await testDb.user.upsert({
    where: { email: "test-admin@skillnova.edu" },
    update: {},
    create: {
      email: "test-admin@skillnova.edu",
      name: "Test System Administrator",
      role: "ADMIN",
      passwordHash,
      phone: "+1-555-0104",
      headline: "Platform Operations Director",
    },
  });

  // 4. Seed Category
  const category = await testDb.category.upsert({
    where: { slug: "cloud-systems" },
    update: {},
    create: {
      name: "Cloud & Systems",
      slug: "cloud-systems",
      icon: "Cloud",
    },
  });

  // 5. Seed Free Course (price === 0.0)
  const freeCourse = await testDb.course.upsert({
    where: { slug: "test-free-foundation-track" },
    update: {},
    create: {
      title: "Test Free Foundation Track",
      slug: "test-free-foundation-track",
      description: "Introductory course available at zero cost for verification.",
      price: 0.0,
      level: "Beginner",
      published: true,
      categoryId: category.id,
      instructorId: trainer.id,
    },
  });

  // 6. Seed Paid Course (price > 0.0)
  const paidCourse = await testDb.course.upsert({
    where: { slug: "test-advanced-cloud-systems" },
    update: {},
    create: {
      title: "Test Advanced Cloud Systems",
      slug: "test-advanced-cloud-systems",
      description: "Rigorous paid course requiring checkout, quizzes, and project review.",
      price: 18000.0,
      level: "Advanced",
      published: true,
      categoryId: category.id,
      instructorId: trainer.id,
    },
  });

  // 7. Seed Curriculum Sections & Lessons for Paid Course
  const section1 = await testDb.section.create({
    data: {
      title: "Module 1: Infrastructure Architecture",
      order: 1,
      courseId: paidCourse.id,
    },
  });

  const section2 = await testDb.section.create({
    data: {
      title: "Module 2: Resiliency & Security",
      order: 2,
      courseId: paidCourse.id,
    },
  });

  const lesson1 = await testDb.lesson.create({
    data: {
      title: "Lesson 1.1: Virtual Networks",
      order: 1,
      sectionId: section1.id,
      duration: "20 min",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  });

  const lesson2 = await testDb.lesson.create({
    data: {
      title: "Lesson 1.2: Compute Clustering",
      order: 2,
      sectionId: section1.id,
      duration: "25 min",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  });

  const lesson3 = await testDb.lesson.create({
    data: {
      title: "Lesson 2.1: Identity Federation",
      order: 1,
      sectionId: section2.id,
      duration: "30 min",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  });

  const lesson4 = await testDb.lesson.create({
    data: {
      title: "Lesson 2.2: Disaster Recovery",
      order: 2,
      sectionId: section2.id,
      duration: "35 min",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  });

  // 8. Seed Assessment Quiz for Paid Course
  const paidQuiz = await testDb.quiz.create({
    data: {
      title: "Cloud Systems Benchmark Assessment",
      passingScore: 70, // 70% threshold
      courseId: paidCourse.id,
    },
  });

  await testDb.question.create({
    data: {
      quizId: paidQuiz.id,
      text: "Which architectural pattern guarantees sub-second failover across regions?",
      optionsJson: JSON.stringify([
        "Active-Active Geo-Replication",
        "Cold Backup Restoration",
        "Single Node VM",
        "Manual DNS Switch",
      ]),
      correctIndex: 0,
      explanation: "Active-Active Geo-Replication provides sub-second failover with continuous sync.",
    },
  });

  await testDb.question.create({
    data: {
      quizId: paidQuiz.id,
      text: "What principle ensures minimal privilege across service boundaries?",
      optionsJson: JSON.stringify([
        "Zero Trust and Role-Based Access Control",
        "Global Superuser Accounts",
        "Hardcoded API Keys",
        "Public S3 Buckets",
      ]),
      correctIndex: 0,
      explanation: "Zero Trust and RBAC ensure least-privilege access.",
    },
  });

  // 9. Seed Assignment for Paid Course
  const paidAssignment = await testDb.assignment.create({
    data: {
      title: "Cloud Infrastructure Capstone Deliverable",
      description: "Submit your comprehensive architectural blueprint and terraform manifest.",
      maxScore: 100,
      courseId: paidCourse.id,
    },
  });

  cachedEntities = {
    student,
    trainer,
    admin,
    otherStudent,
    category,
    freeCourse,
    paidCourse,
    paidLessons: [lesson1, lesson2, lesson3, lesson4],
    paidQuiz,
    paidAssignment,
  };

  return cachedEntities;
}

/**
 * Clean up ephemeral submissions, enrollments, certificates, and orders
 * between test runs to ensure test isolation.
 */
export async function resetTestState() {
  await testDb.auditLog.deleteMany({});
  await testDb.payment.deleteMany({});
  await testDb.order.deleteMany({});
  await testDb.certificate.deleteMany({});
  await testDb.assignmentSubmission.deleteMany({});
  await testDb.lessonDiscussion.deleteMany({});
  await testDb.quizSubmission.deleteMany({});
  await testDb.lessonProgress.deleteMany({});
  await testDb.enrollment.deleteMany({});
}
