import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function measure() {
  console.log("=== SKILLNOVA PERFORMANCE & LATENCY BENCHMARK ===");

  // 1. Courses Catalog: Full vs Optimized Select Projection
  let t0 = performance.now();
  const c1 = await prisma.course.findMany({
    where: { published: true },
    include: {
      category: true,
      instructor: true,
      sections: { include: { lessons: true } },
      reviews: true,
    },
  });
  let t1 = performance.now();
  const unoptimizedDuration = (t1 - t0).toFixed(2);
  console.log(`[1] Catalog Unoptimized (Full Objects & All Relations): ${unoptimizedDuration} ms | ${c1.length} courses loaded`);

  t0 = performance.now();
  const c2 = await prisma.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      subtitle: true,
      price: true,
      level: true,
      thumbnail: true,
      category: { select: { name: true, slug: true } },
      instructor: { select: { name: true, avatar: true } },
      sections: { select: { lessons: { select: { id: true } } } },
      reviews: { select: { rating: true } },
    },
    take: 12,
  });
  t1 = performance.now();
  const optimizedDuration = (t1 - t0).toFixed(2);
  console.log(`[2] Catalog Optimized (Selective Field Projection & take: 12): ${optimizedDuration} ms | ${c2.length} courses loaded`);

  // 2. Student Dashboard
  const student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  if (student) {
    t0 = performance.now();
    const [enrollments, certs, quizzes] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: student.id },
        include: { course: true },
      }),
      prisma.certificate.findMany({
        where: { userId: student.id },
      }),
      prisma.quizSubmission.findMany({
        where: { userId: student.id },
      }),
    ]);
    t1 = performance.now();
    console.log(`[3] Student Dashboard Parallel Aggregation: ${(t1 - t0).toFixed(2)} ms`);
  }

  // 3. Notification Aggregation
  if (student) {
    t0 = performance.now();
    const [certs, quizzes, enrollments, assignments] = await Promise.all([
      prisma.certificate.findMany({ where: { userId: student.id }, take: 3 }),
      prisma.quizSubmission.findMany({ where: { userId: student.id }, take: 3 }),
      prisma.enrollment.findMany({ where: { userId: student.id }, take: 2 }),
      prisma.assignmentSubmission.findMany({ where: { userId: student.id }, take: 3 }),
    ]);
    t1 = performance.now();
    console.log(`[4] Notification Pipeline Parallel Queries: ${(t1 - t0).toFixed(2)} ms`);
  }

  await prisma.$disconnect();
  console.log("=== BENCHMARK COMPLETED ===");
}

measure().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
