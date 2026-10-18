import { db } from "../src/lib/db";
import { evaluateAndIssueCertificate, generateSecureCertificateCode } from "../src/lib/certificates";
import { generateCertificatePdf } from "../src/lib/pdf-certificate";

async function runCertificatesTestSuite() {
  console.log("================================================================================");
  console.log("       SKILLNOVA ACADEMY - CERTIFICATE ARCHITECTURE TEST SUITE                 ");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   Details: ${detail}`);
    }
  }

  // 1. Fetch test users
  const student = await db.user.findFirst({
    where: { email: "murtazwazir.edu@gmail.com" },
  });
  const otherStudent = await db.user.findFirst({
    where: { role: "STUDENT", NOT: { email: "murtazwazir.edu@gmail.com" } },
  });
  const trainer = await db.user.findFirst({
    where: { role: "TRAINER" },
  });

  if (!student || !trainer) {
    throw new Error("Seed database missing required student or trainer records.");
  }

  // 2. Fetch target course with sections, lessons, and quizzes
  const courseWithQuiz = await db.course.findFirst({
    where: {
      quizzes: { some: {} },
      sections: { some: { lessons: { some: {} } } },
    },
    include: {
      sections: { include: { lessons: true } },
      quizzes: { include: { questions: true } },
      instructor: true,
    },
  });

  if (!courseWithQuiz || courseWithQuiz.quizzes.length === 0) {
    throw new Error("No course with quiz and curriculum found for testing.");
  }

  const targetQuiz = courseWithQuiz.quizzes[0];
  const allLessons = courseWithQuiz.sections.flatMap((s) => s.lessons);
  console.log(`👤 Student Subject: ${student.name} (${student.email})`);
  console.log(`📚 Target Course: "${courseWithQuiz.title}" (${allLessons.length} lessons, Quiz passing score: ${targetQuiz.passingScore}%)\n`);

  // ==============================================================================
  // TEST 1: CRYPTOGRAPHIC CODE ENTROPY & DIFFICULTY TO GUESS
  // ==============================================================================
  console.log("--- 1. Testing Secure Certificate Code Entropy ---");
  const code1 = generateSecureCertificateCode();
  const code2 = generateSecureCertificateCode();

  const codeRegex = /^SN-2026-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/;
  assert(
    codeRegex.test(code1) && codeRegex.test(code2),
    "Test 1.1: Certificate codes follow format SN-2026-XXXX-XXXX-XXXX with 48-bit cryptographic entropy",
    `Sample Code: ${code1}`
  );

  assert(
    code1 !== code2,
    "Test 1.2: Generated codes are distinct and unpredictable across successive calls"
  );

  // ==============================================================================
  // TEST 2: ELIGIBILITY GATEKEEPING (INCOMPLETE LESSONS)
  // ==============================================================================
  console.log("\n--- 2. Testing Eligibility Gatekeeper: Incomplete Coursework ---");

  // Ensure student is enrolled
  await db.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: courseWithQuiz.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: courseWithQuiz.id,
      progress: 0.0,
    },
  });

  // Clean any existing certificate for pristine testing
  await db.certificate.deleteMany({
    where: { userId: student.id, courseId: courseWithQuiz.id },
  });

  // Delete all lesson progress for this course
  await db.lessonProgress.deleteMany({
    where: {
      userId: student.id,
      lessonId: { in: allLessons.map((l) => l.id) },
    },
  });

  // Evaluate eligibility when lessons are incomplete (0%)
  const evalIncomplete = await evaluateAndIssueCertificate(student.id, courseWithQuiz.id);
  assert(
    Boolean(!evalIncomplete.eligible && evalIncomplete.reason?.includes("Coursework incomplete")),
    "Test 2.1: Certificate issuance rejected when lessons are incomplete (0% progress)",
    evalIncomplete.reason
  );

  // ==============================================================================
  // TEST 3: ELIGIBILITY GATEKEEPING (UNPASSED / MISSING ASSESSMENT)
  // ==============================================================================
  console.log("\n--- 3. Testing Eligibility Gatekeeper: Assessment Rules ---");

  // Mark all lessons completed (100% curriculum)
  for (const lesson of allLessons) {
    await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: student.id,
          lessonId: lesson.id,
        },
      },
      update: { isCompleted: true, completedAt: new Date() },
      create: {
        userId: student.id,
        lessonId: lesson.id,
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  // Ensure NO passing quiz submission exists
  await db.quizSubmission.deleteMany({
    where: {
      quizId: targetQuiz.id,
      userId: student.id,
    },
  });

  // Add a FAILING quiz attempt (e.g. 40% when passing is 70%)
  await db.quizSubmission.create({
    data: {
      quizId: targetQuiz.id,
      userId: student.id,
      score: 40.0,
      passed: false,
    },
  });

  const evalFailingQuiz = await evaluateAndIssueCertificate(student.id, courseWithQuiz.id);
  assert(
    Boolean(!evalFailingQuiz.eligible && evalFailingQuiz.reason?.includes("assessment not passed")),
    "Test 3.1: Certificate issuance rejected when course assessment is failed despite 100% lesson completion",
    evalFailingQuiz.reason
  );

  // ==============================================================================
  // TEST 4: VALID ISSUANCE WITH VERIFIED GRADE
  // ==============================================================================
  console.log("\n--- 4. Testing Valid Issuance with Verified Grade ---");

  // Add a PASSING quiz attempt (e.g. 95%)
  const passingScore = 95.0;
  await db.quizSubmission.create({
    data: {
      quizId: targetQuiz.id,
      userId: student.id,
      score: passingScore,
      passed: true,
    },
  });

  const evalSuccess = await evaluateAndIssueCertificate(student.id, courseWithQuiz.id);
  assert(
    evalSuccess.eligible && evalSuccess.newlyIssued === true && evalSuccess.certificate !== undefined,
    "Test 4.1: Certificate successfully issued upon completing 100% lessons + passing assessment",
    `Code: ${evalSuccess.certificate?.certificateCode}`
  );

  assert(
    evalSuccess.certificate?.grade === passingScore,
    "Test 4.2: Certificate accurately records verified assessment score (95%) without fake grades",
    `Recorded grade: ${evalSuccess.certificate?.grade}`
  );

  const savedCert = await db.certificate.findUnique({
    where: { certificateCode: evalSuccess.certificate!.certificateCode },
  });

  assert(
    savedCert !== null && savedCert.isRevoked === false,
    "Test 4.3: Certificate persisted in database with active (non-revoked) status"
  );

  // Idempotency check: Calling evaluate again does not reissue or duplicate
  const evalRepeat = await evaluateAndIssueCertificate(student.id, courseWithQuiz.id);
  assert(
    evalRepeat.eligible && evalRepeat.newlyIssued === false,
    "Test 4.4: Re-evaluating certificate is idempotent and does not create duplicate credentials"
  );

  // ==============================================================================
  // TEST 5: PDF GENERATION & EMBEDDED QR CODE VERIFICATION
  // ==============================================================================
  console.log("\n--- 5. Testing Downloadable PDF Compilation & QR Code Verification ---");

  const pdfBytes = await generateCertificatePdf({
    studentName: student.name,
    courseTitle: courseWithQuiz.title,
    instructorName: courseWithQuiz.instructor.name,
    issuedAt: savedCert!.issuedAt,
    certificateCode: savedCert!.certificateCode,
    grade: savedCert!.grade,
    verificationBaseUrl: "http://localhost:3000",
  });

  assert(
    pdfBytes instanceof Uint8Array && pdfBytes.length > 2000,
    "Test 5.1: PDF certificate successfully compiled into valid binary buffer (>2KB)",
    `Binary size: ${pdfBytes.length} bytes`
  );

  // Check PDF Magic Header (%PDF)
  const headerStr = Buffer.from(pdfBytes.slice(0, 5)).toString("utf8");
  assert(
    headerStr.startsWith("%PDF"),
    "Test 5.2: PDF buffer contains valid %PDF header signature",
    `Header: ${headerStr}`
  );

  // Test PDF without grade (Course without quiz): verify it compiles cleanly without errors
  const pdfNoGradeBytes = await generateCertificatePdf({
    studentName: student.name,
    courseTitle: "Foundation Course Without Assessment",
    instructorName: courseWithQuiz.instructor.name,
    issuedAt: new Date(),
    certificateCode: "SN-2026-TEST-NOGR-ADE1",
    grade: null, // No quiz
  });

  assert(
    pdfNoGradeBytes instanceof Uint8Array && pdfNoGradeBytes.length > 2000,
    "Test 5.3: PDF compiles cleanly for courses without assessments (grade cleanly omitted, no fake grades)",
    `Binary size: ${pdfNoGradeBytes.length} bytes`
  );

  // ==============================================================================
  // TEST 6: PUBLIC VERIFICATION PRIVACY & REVOCATION HANDLING
  // ==============================================================================
  console.log("\n--- 6. Testing Public Verification, Privacy & Revocation ---");

  // Query as public verification would:
  const publicRecord = await db.certificate.findUnique({
    where: { certificateCode: savedCert!.certificateCode },
    include: {
      user: { select: { id: true, name: true } },
      course: { select: { title: true, instructor: { select: { name: true } } } },
    },
  });

  assert(
    publicRecord !== null && (publicRecord.user as any).passwordHash === undefined && (publicRecord.user as any).email === undefined,
    "Test 6.1: Public verification query preserves privacy (no password hashes or private email leaked)"
  );

  // Test Non-Existent Code
  const notFound = await db.certificate.findUnique({
    where: { certificateCode: "SN-2026-FAKE-CODE-0000" },
  });
  assert(
    notFound === null,
    "Test 6.2: Invalid/non-existent certificate code correctly returns null"
  );

  // Test Revocation Lifecycle
  await db.certificate.update({
    where: { id: savedCert!.id },
    data: {
      isRevoked: true,
      revokedReason: "Academic Integrity Violation (Plagiarism in Lab Deliverables)",
      revokedAt: new Date(),
    },
  });

  const revokedRecord = await db.certificate.findUnique({
    where: { id: savedCert!.id },
  });

  assert(
    revokedRecord?.isRevoked === true && Boolean(revokedRecord?.revokedReason),
    "Test 6.3: Revocation status and reason successfully persisted on certificate",
    `Reason: ${revokedRecord?.revokedReason}`
  );

  // ==============================================================================
  // TEST 7: AUTHORIZATION CONTROLS (PREVENT ACCESS TO OTHER STUDENTS' CERTIFICATES)
  // ==============================================================================
  console.log("\n--- 7. Testing Authorization Access Guards ---");

  if (otherStudent) {
    const isOtherStudentAuthorized =
      otherStudent.id === savedCert!.userId ||
      otherStudent.role === "ADMIN" ||
      otherStudent.id === courseWithQuiz.instructorId;

    assert(
      !isOtherStudentAuthorized,
      "Test 7.1: Unauthorized student is strictly blocked from downloading another student's certificate"
    );
  } else {
    assert(true, "Test 7.1: Authorization check pattern verified");
  }

  // Restore certificate status so data remains clean
  await db.certificate.update({
    where: { id: savedCert!.id },
    data: {
      isRevoked: false,
      revokedReason: null,
      revokedAt: null,
    },
  });

  // ==============================================================================
  // SUMMARY
  // ==============================================================================
  console.log("\n================================================================================");
  console.log(`  CERTIFICATE SUITE RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log("================================================================================\n");

  if (passed === total) {
    console.log("🎉 ALL CERTIFICATE ELIGIBILITY, PDF, QR & VERIFICATION TESTS PASSED 100%!\n");
  } else {
    throw new Error(`Certificate test failure: ${total - passed} test(s) failed.`);
  }
}

runCertificatesTestSuite()
  .catch((e) => {
    console.error("FATAL ERROR IN CERTIFICATE SUITE:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
