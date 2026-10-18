import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const trainers = await prisma.user.findMany({
    where: { role: "TRAINER" },
    include: {
      coursesTaught: {
        include: {
          enrollments: true,
          assignments: { include: { submissions: true } },
          quizzes: { include: { submissions: true } },
          sections: { include: { lessons: { include: { resources: true } } } },
        },
      },
    },
  });

  console.log("Trainers found:", trainers.length);
  for (const t of trainers) {
    console.log(`- Trainer: ${t.name} (${t.email}), Courses: ${t.coursesTaught.length}`);
    for (const c of t.coursesTaught) {
      console.log(
        `    Course: [${c.id}] "${c.title}" - Enrollments: ${c.enrollments.length}, Assignments: ${c.assignments.length}, Quizzes: ${c.quizzes.length}`
      );
      for (const a of c.assignments) {
        console.log(`      Assignment: "${a.title}" (Submissions: ${a.submissions.length})`);
      }
    }
  }

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { name: true, email: true },
  });
  console.log("\nAdmins found:", admins.length);
  for (const a of admins) {
    console.log(`- Admin: ${a.name} (${a.email})`);
  }
}

main().finally(() => prisma.$disconnect());
