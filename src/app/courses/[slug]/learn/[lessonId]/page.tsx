import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  ClassroomPlayer, 
  SerializedSection, 
  SerializedLesson,
  SerializedAssignment 
} from "@/components/classroom/ClassroomPlayer";

interface ClassroomPageProps {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const { slug, lessonId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/courses/${slug}`);
  }

  // Fetch full course data with sections, lessons, resources, assignments, and discussions
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: true,
      quizzes: true,
      assignments: {
        include: {
          submissions: {
            where: { userId: user.id },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              resources: {
                orderBy: { createdAt: "desc" },
              },
              discussions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      role: true,
                      avatar: true,
                    },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      },
      enrollments: {
        where: { userId: user.id },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Strict server-side access control: User must be enrolled, or course instructor, or admin
  const isEnrolled = course.enrollments.length > 0;
  const isInstructor = course.instructorId === user.id || user.role === "ADMIN";

  if (!isEnrolled && !isInstructor) {
    redirect(`/courses/${slug}?enrollment=required`);
  }

  // Fetch all user's completed lessons for this course
  const allLessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id));
  const completedProgressList = await db.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: { in: allLessonIds },
      isCompleted: true,
    },
    select: { lessonId: true },
  });

  const completedLessonIds = completedProgressList.map((p) => p.lessonId);

  // Find target lesson or default to first
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const targetLesson = allLessons.find((l) => l.id === lessonId) || allLessons[0];

  if (!targetLesson) {
    notFound();
  }

  // Check if certificate exists for this user and course
  const certificate = await db.certificate.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  const userEnrollment = course.enrollments[0];
  const currentProgress = userEnrollment ? Math.round(userEnrollment.progress) : 0;

  // Serialize sections for client
  const serializedSections: SerializedSection[] = course.sections.map((sec) => ({
    id: sec.id,
    title: sec.title,
    order: sec.order,
    lessons: sec.lessons.map((les) => ({
      id: les.id,
      title: les.title,
      duration: les.duration,
      videoUrl: les.videoUrl,
      content: les.content,
      order: les.order,
      sectionId: les.sectionId,
      resources: les.resources.map((r) => ({
        id: r.id,
        title: r.title,
        fileName: r.fileName,
        fileUrl: r.fileUrl,
        fileSize: r.fileSize,
        fileType: r.fileType,
        createdAt: r.createdAt.toISOString(),
      })),
      discussions: les.discussions.map((d) => ({
        id: d.id,
        content: d.content,
        isAnswer: d.isAnswer,
        reported: d.reported,
        createdAt: d.createdAt.toISOString(),
        user: {
          id: d.user.id,
          name: d.user.name,
          role: d.user.role,
          avatar: d.user.avatar,
        },
      })),
    })),
  }));

  // Target current lesson
  const currentLessonSerialized: SerializedLesson = {
    id: targetLesson.id,
    title: targetLesson.title,
    duration: targetLesson.duration,
    videoUrl: targetLesson.videoUrl,
    content: targetLesson.content,
    order: targetLesson.order,
    sectionId: targetLesson.sectionId,
    resources: targetLesson.resources.map((r) => ({
      id: r.id,
      title: r.title,
      fileName: r.fileName,
      fileUrl: r.fileUrl,
      fileSize: r.fileSize,
      fileType: r.fileType,
      createdAt: r.createdAt.toISOString(),
    })),
    discussions: targetLesson.discussions.map((d) => ({
      id: d.id,
      content: d.content,
      isAnswer: d.isAnswer,
      reported: d.reported,
      createdAt: d.createdAt.toISOString(),
      user: {
        id: d.user.id,
        name: d.user.name,
        role: d.user.role,
        avatar: d.user.avatar,
      },
    })),
  };

  // Serialize assignments
  const serializedAssignments: SerializedAssignment[] = course.assignments.map((a) => {
    const sub = a.submissions[0] || null;
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate ? a.dueDate.toISOString() : null,
      maxScore: a.maxScore,
      mySubmission: sub
        ? {
            id: sub.id,
            textContent: sub.textContent,
            fileUrl: sub.fileUrl,
            fileName: sub.fileName,
            fileSize: sub.fileSize,
            score: sub.score,
            feedback: sub.feedback,
            status: sub.status,
            submittedAt: sub.submittedAt.toISOString(),
            gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : null,
          }
        : null,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <ClassroomPlayer
        course={{
          id: course.id,
          title: course.title,
          slug: course.slug,
          category: { name: course.category.name },
          instructor: { id: course.instructor.id, name: course.instructor.name },
          sections: serializedSections,
          quizzes: course.quizzes.map((q) => ({ id: q.id, title: q.title })),
          assignments: serializedAssignments,
        }}
        currentLesson={currentLessonSerialized}
        completedLessonIds={completedLessonIds}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        currentProgress={currentProgress}
        certificateCode={certificate?.certificateCode || null}
        isInstructor={isInstructor}
      />

      <Footer />
    </div>
  );
}
