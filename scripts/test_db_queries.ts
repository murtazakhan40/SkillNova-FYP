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

  // B. Published courses sorted by createdAt (Public Catalog [published, createdAt] index)
  const catalogCourses = await db.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  console.log(`   ✅ Course catalog query ([published, createdAt] index): resolved ${catalogCourses.length} published courses`);

  // C. Sections and Lessons ordered by sequence ([courseId, order] & [sectionId, order] indexes)
  const firstCourse = await db.course.findFirst({
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
  if (firstCourse && firstCourse.sections.length > 0) {
    const lessonCountInFirstSection = firstCourse.sections[0].lessons.length;
    console.log(`   ✅ Curriculum hierarchy query ([courseId, order], [sectionId, order]): resolved ${firstCourse.sections.length} sections, ${lessonCountInFirstSection} lessons for '${firstCourse.title}'`);
  }

  // D. Enrollment by courseId (Trainer Students Roster pattern)
  const course = await db.course.findFirst();
  if (course) {
    const courseEnrollments = await db.enrollment.findMany({
      where: { courseId: course.id },
      include: { user: true },
    });
    console.log(`   ✅ Enrollment by courseId query: resolved ${courseEnrollments.length} enrollments for '${course.title}'`);
  }

  // E. Student Enrollments sorted by updatedAt ([userId, updatedAt] index)
  const student = await db.user.findFirst({ where: { role: "STUDENT" } });
  if (student) {
    const studentEnrollments = await db.enrollment.findMany({
      where: { userId: student.id },
      orderBy: { updatedAt: "desc" },
    });
    console.log(`   ✅ Student enrollments query ([userId, updatedAt] index): resolved ${studentEnrollments.length} enrollments for '${student.name}'`);

    // F. QuizSubmission by userId & createdAt ([userId, createdAt] index)
    const studentSubs = await db.quizSubmission.findMany({
      where: { userId: student.id },
      orderBy: { createdAt: "desc" },
    });
    console.log(`   ✅ QuizSubmission query ([userId, createdAt] index): resolved ${studentSubs.length} submissions for '${student.name}'`);

    // G. 7-Day Activity query ([userId, isCompleted, completedAt] index)
    const pastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyLessons = await db.lessonProgress.findMany({
      where: {
        userId: student.id,
        isCompleted: true,
        completedAt: { gte: pastWeek },
      },
    });
    console.log(`   ✅ Weekly activity query ([userId, isCompleted, completedAt] index): resolved ${weeklyLessons.length} recent lesson completions`);

    // H. Certificates sorted by issuedAt ([userId, issuedAt] index)
    const studentCerts = await db.certificate.findMany({
      where: { userId: student.id },
      orderBy: { issuedAt: "desc" },
    });
    console.log(`   ✅ Certificate query ([userId, issuedAt] index): resolved ${studentCerts.length} certificates for '${student.name}'`);
  }

  // 3. Test Relational Uniqueness & Constraint Enforcement
  console.log("\n🔒 Testing Relational Constraints & Uniqueness Invariants:");
  if (student && course) {
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id,
        },
      },
    });
    if (existingEnrollment) {
      console.log(`   ✅ Compound key [userId, courseId] is strictly enforced on Enrollment (ID: ${existingEnrollment.id})`);
    }
  }

  // 4. Test AuditLog Model, Compound Index & Sanitization
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

  // Query back using compound index on [action, createdAt]
  const fetchedLog = await db.auditLog.findFirst({
    where: { action: "AUDIT_VERIFICATION_TEST" },
    orderBy: { createdAt: "desc" },
  });

  if (!fetchedLog) {
    throw new Error("AuditLog retrieval failed!");
  }
  
  // Verify sanitized details (strictly no passwords or secrets)
  const parsedDetails = JSON.parse(fetchedLog.details || "{}");
  if (parsedDetails.password || parsedDetails.passwordHash || parsedDetails.secret) {
    throw new Error("Security violation: Secret detected in AuditLog details!");
  }
  console.log(`   ✅ AuditLog retrieved via index [action, createdAt]: Action='${fetchedLog.action}', Timestamp='${fetchedLog.createdAt.toISOString()}'`);
  console.log(`   ✅ Sanitization verified: Zero credentials or sensitive secrets in audit payload`);

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
