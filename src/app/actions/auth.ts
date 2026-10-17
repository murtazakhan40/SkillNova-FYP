"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { verifyCredentials, createSession, destroySession } from "@/lib/auth";

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const user = await verifyCredentials(email, password);

  if (!user) {
    return { error: "Invalid email or password. Please try again." };
  }

  await createSession(user);

  // Redirect based on role
  if (user.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (user.role === "TRAINER") {
    redirect("/dashboard/trainer");
  } else {
    redirect("/dashboard/student");
  }
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "STUDENT";

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await db.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: role.toUpperCase(),
      headline: role === "TRAINER" ? "Instructor at SkillNova" : "Student Learner",
    },
  });

  await createSession({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role as "STUDENT" | "TRAINER" | "ADMIN",
    avatar: newUser.avatar,
    headline: newUser.headline,
    phone: newUser.phone,
  });

  if (newUser.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (newUser.role === "TRAINER") {
    redirect("/dashboard/trainer");
  } else {
    redirect("/dashboard/student");
  }
}

export async function quickDemoLogin(
  role: "STUDENT" | "TRAINER" | "ADMIN",
  customEmailOrFormData?: string | FormData,
  redirectTo?: string
) {
  const customEmail = typeof customEmailOrFormData === "string" ? customEmailOrFormData : undefined;
  const emailMap = {
    STUDENT: customEmail || "murtazwazir.edu@gmail.com",
    TRAINER: customEmail || "trainer@skillnova.com",
    ADMIN: customEmail || "admin@skillnova.com",
  };

  const targetEmail = customEmail || emailMap[role];
  let user = await db.user.findUnique({
    where: { email: targetEmail },
  });

  // Backward compatibility fallback
  if (!user && role === "STUDENT") {
    user = await db.user.findUnique({
      where: { email: "student@skillnova.com" },
    });
  }

  if (user) {
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "STUDENT" | "TRAINER" | "ADMIN",
      avatar: user.avatar,
      headline: user.headline,
      phone: user.phone,
    });
  }

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (role === "TRAINER") {
    redirect("/dashboard/trainer");
  } else {
    redirect("/dashboard/student");
  }
}

export async function loginWithFacultyEmail(email: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (user) {
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "STUDENT" | "TRAINER" | "ADMIN",
      avatar: user.avatar,
      headline: user.headline,
      phone: user.phone,
    });

    if (user.role === "ADMIN") {
      redirect("/dashboard/admin");
    } else if (user.role === "TRAINER") {
      redirect("/dashboard/trainer");
    } else {
      redirect("/dashboard/student");
    }
  }
}

export async function directCourseClassroomAccess(courseId: string, courseSlug: string) {
  let user = await db.user.findUnique({
    where: { email: "murtazwazir.edu@gmail.com" },
  });
  if (!user) {
    user = await db.user.findFirst({
      where: { role: "STUDENT" },
    });
  }

  if (user) {
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "STUDENT" | "TRAINER" | "ADMIN",
      avatar: user.avatar,
      headline: user.headline,
      phone: user.phone,
    });

    // Ensure enrollment exists
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (!existingEnrollment) {
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: courseId,
          progress: 15.0,
        },
      });
    }

    // Find first lesson of this course
    const firstLesson = await db.lesson.findFirst({
      where: {
        section: {
          courseId: courseId,
        },
      },
      orderBy: { order: "asc" },
    });

    if (firstLesson) {
      redirect(`/courses/${courseSlug}/learn/${firstLesson.id}`);
    }
  }

  redirect(`/courses/${courseSlug}`);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
