const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding student lesson progress and quiz submissions...");

  const student = await prisma.user.findUnique({
    where: { email: "murtazwazir.edu@gmail.com" },
  });

  if (!student) {
    console.error("Student Murtaza not found");
    return;
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: student.id },
    include: {
      course: {
        include: {
          quizzes: true,
          sections: {
            include: { lessons: true },
          },
        },
      },
    },
  });

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const enr of enrollments) {
    const allLessons = enr.course.sections.flatMap((s) => s.lessons);
    let lessonsToComplete = 0;

    if (enr.progress >= 100) {
      lessonsToComplete = allLessons.length;
    } else if (enr.progress >= 70) {
      lessonsToComplete = Math.floor(allLessons.length * 0.75);
    } else if (enr.progress >= 40) {
      lessonsToComplete = Math.max(1, Math.floor(allLessons.length * 0.45));
    }

    for (let i = 0; i < allLessons.length; i++) {
      const lesson = allLessons[i];
      const isCompleted = i < lessonsToComplete;
      const completedAt = isCompleted
        ? new Date(now - (allLessons.length - i) * dayMs * 1.5)
        : null;

      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: student.id,
            lessonId: lesson.id,
          },
        },
        update: {
          isCompleted,
          completedAt,
        },
        create: {
          userId: student.id,
          lessonId: lesson.id,
          isCompleted,
          completedAt,
        },
      });
    }

    // Quiz submissions for completed courses
    if (enr.progress >= 100 && enr.course.quizzes.length > 0) {
      for (const quiz of enr.course.quizzes) {
        const existingSub = await prisma.quizSubmission.findFirst({
          where: { userId: student.id, quizId: quiz.id },
        });

        if (!existingSub) {
          const score = enr.course.slug.includes("next") ? 92 : 88;
          await prisma.quizSubmission.create({
            data: {
              userId: student.id,
              quizId: quiz.id,
              score,
              passed: score >= quiz.passingScore,
              createdAt: new Date(now - (score === 92 ? 7 : 3) * dayMs),
            },
          });
          console.log(`Created quiz submission for ${quiz.title}: ${score}%`);
        }
      }
    }
  }

  // Also seed for Ali Khan
  const ali = await prisma.user.findUnique({
    where: { email: "student@skillnova.com" },
  });
  if (ali) {
    const aliEnrollments = await prisma.enrollment.findMany({
      where: { userId: ali.id },
      include: {
        course: {
          include: {
            quizzes: true,
            sections: { include: { lessons: true } },
          },
        },
      },
    });

    for (const enr of aliEnrollments) {
      const lessons = enr.course.sections.flatMap((s) => s.lessons);
      const toComplete = Math.floor(lessons.length * (enr.progress / 100));
      for (let i = 0; i < lessons.length; i++) {
        await prisma.lessonProgress.upsert({
          where: {
            userId_lessonId: {
              userId: ali.id,
              lessonId: lessons[i].id,
            },
          },
          update: {
            isCompleted: i < toComplete,
            completedAt: i < toComplete ? new Date(now - (i + 1) * dayMs) : null,
          },
          create: {
            userId: ali.id,
            lessonId: lessons[i].id,
            isCompleted: i < toComplete,
            completedAt: i < toComplete ? new Date(now - (i + 1) * dayMs) : null,
          },
        });
      }
    }
  }

  console.log("✓ Successfully seeded student activity and quiz submissions!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
