import { db } from "../src/lib/db";
import fs from "node:fs/promises";
import path from "node:path";

async function seedClassroomData() {
  console.log("🌱 Seeding realistic Classroom content (Assignments, Resources, Discussions)...");

  // 1. Web Development Course
  const webCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: "Web Development" },
        { slug: "fullstack-nextjs-typescript" },
      ],
    },
    include: {
      sections: {
        include: { lessons: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (webCourse) {
    // A. Assignment
    const existingAssignment = await db.assignment.findFirst({
      where: { courseId: webCourse.id },
    });

    if (!existingAssignment) {
      const assignment = await db.assignment.create({
        data: {
          title: "Full-Stack Portfolio Project with Next.js 16 & Server Actions",
          description: `**Project Brief:**
Develop a responsive personal developer portfolio website using Next.js 16 App Router, React 19, and Tailwind CSS.

**Core Requirements:**
1. Dynamic project catalog with filterable tags.
2. Interactive contact form powered by Next.js Server Actions with server-side validation.
3. Mobile-first responsive layout with clean modern typography.
4. Clean GitHub repository with informative README.md documentation.

**Submission Guidelines:**
Provide your public GitHub repository URL or a ZIP archive containing your project files.`,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          maxScore: 100,
          courseId: webCourse.id,
        },
      });
      console.log(`   ✅ Created Assignment for '${webCourse.title}' (ID: ${assignment.id})`);

      // Seed a sample submission from Murtaza Wazir (Student)
      const student = await db.user.findFirst({
        where: { email: "murtazwazir.edu@gmail.com" },
      });

      if (student) {
        await db.assignmentSubmission.upsert({
          where: {
            assignmentId_userId: {
              assignmentId: assignment.id,
              userId: student.id,
            },
          },
          update: {},
          create: {
            assignmentId: assignment.id,
            userId: student.id,
            textContent: "GitHub Repo: https://github.com/murtazakhan40/SkillNova-FYP\nLive Demo: https://skillnovaacademy.com\n\nImplemented Next.js 16 App Router, 3NF Prisma schema, dynamic progress tracking, and cryptographic certificate issuance.",
            status: "SUBMITTED",
          },
        });
        console.log(`   ✅ Seeded sample student assignment submission for '${student.name}'`);
      }
    }

    // B. Lesson Resources for Lesson 1
    const firstLesson = webCourse.sections[0]?.lessons[0];
    if (firstLesson) {
      const existingResource = await db.lessonResource.findFirst({
        where: { lessonId: firstLesson.id },
      });

      if (!existingResource) {
        // Create sample resource file on disk
        const resourceDir = path.join(process.cwd(), "uploads", "resources", firstLesson.id);
        await fs.mkdir(resourceDir, { recursive: true });

        const sampleFilePath = path.join(resourceDir, "web_dev_architecture_guide.pdf");
        await fs.writeFile(
          sampleFilePath,
          Buffer.from("%PDF-1.4\nSkillNova Academy — Web Development Architecture & Engineering Notes\n")
        );

        await db.lessonResource.create({
          data: {
            title: "Web Engineering Architecture & React 19 Cheatsheet (PDF)",
            fileName: "web_dev_architecture_guide.pdf",
            fileUrl: `/uploads/resources/${firstLesson.id}/web_dev_architecture_guide.pdf`,
            fileSize: 450560,
            fileType: "application/pdf",
            lessonId: firstLesson.id,
          },
        });

        const sampleZipPath = path.join(resourceDir, "starter_boilerplate.zip");
        await fs.writeFile(
          sampleZipPath,
          Buffer.from("PK\x03\x04Starter Template Files for Next.js 16 Classroom\n")
        );

        await db.lessonResource.create({
          data: {
            title: "Starter Boilerplate & Configuration Template (ZIP)",
            fileName: "starter_boilerplate.zip",
            fileUrl: `/uploads/resources/${firstLesson.id}/starter_boilerplate.zip`,
            fileSize: 1248576,
            fileType: "application/zip",
            lessonId: firstLesson.id,
          },
        });

        console.log(`   ✅ Seeded 2 authorized downloadable resources for '${firstLesson.title}'`);
      }

      // C. Discussion Q&A
      const existingDiscussion = await db.lessonDiscussion.findFirst({
        where: { lessonId: firstLesson.id },
      });

      if (!existingDiscussion) {
        const student = await db.user.findFirst({ where: { role: "STUDENT" } });
        const trainer = await db.user.findFirst({ where: { role: "TRAINER" } });

        if (student && trainer) {
          const q = await db.lessonDiscussion.create({
            data: {
              lessonId: firstLesson.id,
              userId: student.id,
              content: "What is the recommended design pattern for validating user form inputs inside Next.js 16 Server Actions?",
              isAnswer: false,
            },
          });

          await db.lessonDiscussion.create({
            data: {
              lessonId: firstLesson.id,
              userId: trainer.id,
              content: "Great question! We recommend performing strict server-side schema validation (e.g., Zod or manual type narrowing) at the top of your server action before touching Prisma. Then call revalidatePath() to refresh cached layouts.",
              isAnswer: true,
            },
          });

          console.log(`   ✅ Seeded academic Q&A exchange between student and faculty`);
        }
      }
    }
  }

  // 2. Backend Development Course
  const backendCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: "Backend Development" },
        { slug: "advanced-backend-go-grpc" },
      ],
    },
  });

  if (backendCourse) {
    const existingBackendAssignment = await db.assignment.findFirst({
      where: { courseId: backendCourse.id },
    });

    if (!existingBackendAssignment) {
      await db.assignment.create({
        data: {
          title: "High-Throughput Microservice with Prisma & JWT Security",
          description: `**Project Brief:**
Construct a production-ready RESTful service with RBAC authentication, relational PostgreSQL/SQLite models, and structured audit logs.

**Evaluation Rubric:**
- 3NF relational data integrity (30 pts)
- Cryptographic session authentication & role authorization (30 pts)
- Unit and integration test coverage (20 pts)
- API endpoint documentation (20 pts)`,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          maxScore: 100,
          courseId: backendCourse.id,
        },
      });
      console.log(`   ✅ Created Assignment for '${backendCourse.title}'`);
    }
  }

  console.log("✨ Classroom content seeding completed successfully!\n");
}

seedClassroomData().catch((err) => {
  console.error("Seeding classroom content failed:", err);
  process.exit(1);
});
