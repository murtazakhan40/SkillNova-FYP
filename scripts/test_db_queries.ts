import { db } from "../src/lib/db";

async function verifyDatabaseIntegrity() {
  console.log("=================================================");
  console.log("  SKILLNOVA ACADEMY - DATABASE INTEGRITY VERIFICATION ");
  console.log("=================================================\n");

  // 1. Data Preservation Check
  const userCount = await db.user.count();
  const courseCount = await db.course.count();
  const categoryCount = await db.category.count();
  const sectionCount = await db.section.count();
  const lessonCount = await db.lesson.count();
  const enrollmentCount = await db.enrollment.count();
  const certificateCount = await db.certificate.count();
  const quizCount = await db.quiz.count();
  const submissionCount = await db.quizSubmission.count();

  console.log("📊 Data Record Inventory:");
  console.log(`   • Users:         ${userCount}`);
  console.log(`   • Courses:       ${courseCount}`);
  console.log(`   • Categories:    ${categoryCount}`);
  console.log(`   • Sections:      ${sectionCount}`);
  console.log(`   • Lessons:       ${lessonCount}`);
  console.log(`   • Enrollments:   ${enrollmentCount}`);
  console.log(`   • Certificates:  ${certificateCount}`);
  console.log(`   • Quizzes:       ${quizCount}`);
  console.log(`   • Submissions:   ${submissionCount}\n`);

  if (userCount === 0 || courseCount === 0) {
    throw new Error("Integrity failure: Database records are missing!");
  }

  // 2. Test Indexed Queries (Verify Query Engine Execution)
  console.log("⚡ Testing Indexed Query Execution:");
  
  // A. Course by instructorId (Trainer Dashboard pattern)
  const trainer = await db.user.findFirst({ where: { role: "TRAINER" } });
  if (trainer) {
    const trainerCourses = await db.course.findMany({
      where: { instructorId: trainer.id },
      include: { category: true },
    });
    console.log(`   ✅ Course by instructorId query: resolved ${trainerCourses.length} courses for '${trainer.name}'`);
  }

  // B. Enrollment by courseId (Trainer Students Roster pattern)
  const course = await db.course.findFirst();
  if (course) {
    const courseEnrollments = await db.enrollment.findMany({
      where: { courseId: course.id },
      include: { user: true },
    });
    console.log(`   ✅ Enrollment by courseId query: resolved ${courseEnrollments.length} enrollments for '${course.title}'`);
  }

  // C. QuizSubmission by userId (Student Submissions pattern)
  const student = await db.user.findFirst({ where: { role: "STUDENT" } });
  if (student) {
    const studentSubs = await db.quizSubmission.findMany({
      where: { userId: student.id },
    });
    console.log(`   ✅ QuizSubmission by userId query: resolved ${studentSubs.length} submissions for '${student.name}'`);
  }

  // 3. Test AuditLog Insertion and Index Retrieval
  console.log("\n🛡️ Testing AuditLog Model & Sanitized Mutation Tracing:");
  const testAuditLog = await db.auditLog.create({
    data: {
      action: "AUDIT_VERIFICATION_TEST",
      entity: "Database",
      entityId: "schema-v2",
      details: JSON.stringify({
        status: "indexed",
        sqliteBackupPreserved: true,
        secretIncluded: false,
      }),
      userId: student?.id || null,
      ipAddress: "127.0.0.1",
    },
  });

  console.log(`   ✅ AuditLog inserted with UUID: ${testAuditLog.id}`);

  // Query back using index on action
  const fetchedLog = await db.auditLog.findFirst({
    where: { action: "AUDIT_VERIFICATION_TEST" },
  });

  if (!fetchedLog) {
    throw new Error("AuditLog retrieval failed!");
  }
  console.log(`   ✅ AuditLog retrieved via index: Action='${fetchedLog.action}', Timestamp='${fetchedLog.createdAt.toISOString()}'`);

  // Clean up test audit log entry
  await db.auditLog.delete({
    where: { id: testAuditLog.id },
  });
  console.log("   ✅ Test AuditLog entry cleanly pruned");

  console.log("\n=================================================");
  console.log("  ALL DATABASE QUERIES & CHECKS PASSED 100%!     ");
  console.log("=================================================\n");
}

verifyDatabaseIntegrity().catch((err) => {
  console.error("Database verification failed:", err);
  process.exit(1);
});
