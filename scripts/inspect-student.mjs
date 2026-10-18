import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkStudent() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              assignments: true,
              quizzes: true,
            },
          },
        },
      },
      assignmentSubmissions: true,
      quizSubmissions: true,
      certificates: true,
    },
  });

  console.log(`Found ${students.length} students:`);
  students.forEach((s) => {
    console.log(`- ${s.name} (${s.email}):`);
    console.log(`    Enrollments: ${s.enrollments.length}`);
    console.log(`    Certificates: ${s.certificates.length}`);
    console.log(`    Quiz Submissions: ${s.quizSubmissions.length}`);
    console.log(`    Assignment Submissions: ${s.assignmentSubmissions.length}`);
  });

  const assignments = await prisma.assignment.findMany({
    include: {
      course: { select: { title: true } },
      submissions: { select: { id: true, userId: true, status: true, score: true, feedback: true } },
    },
  });
  console.log(`\nFound ${assignments.length} assignments:`);
  assignments.forEach((a) => {
    console.log(`- [${a.course.title}] ${a.title} (Due: ${a.dueDate}, MaxScore: ${a.maxScore}) - Submissions: ${a.submissions.length}`);
    a.submissions.forEach((sub) => {
      console.log(`    Sub: user=${sub.userId} status=${sub.status} score=${sub.score} feedback="${sub.feedback}"`);
    });
  });

  await prisma.$disconnect();
}

checkStudent();
