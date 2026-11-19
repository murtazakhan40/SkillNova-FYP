"use server";

import { revalidatePath } from "next/cache";
import path from "node:path";
import fs from "node:fs/promises";
import { getCurrentUser, createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserProfileSchema } from "@/lib/validations";

export interface ProfileUpdateResult {
  success?: boolean;
  error?: string;
  message?: string;
  updatedUser?: {
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    headline?: string | null;
    bio?: string | null;
    age?: number | null;
    parentName?: string | null;
    parentEmail?: string | null;
    parentPhone?: string | null;
    parentRelationship?: string | null;
  };
}

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

export async function updateStudentProfileAction(
  _prevState: ProfileUpdateResult | null,
  formData: FormData
): Promise<ProfileUpdateResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { error: "Authentication required. Please log in again." };
  }

  // 1. Extract form fields
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const headline = (formData.get("headline") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const avatarUrlOrPreset = (formData.get("avatar") as string)?.trim() || null;
  const avatarFile = formData.get("avatarFile") as File | null;

  // Minor & Guardian attributes
  const ageRaw = formData.get("age");
  const age = ageRaw !== null && ageRaw !== "" ? Number(ageRaw) : null;
  const dateOfBirth = (formData.get("dateOfBirth") as string)?.trim() || null;
  const parentName = (formData.get("parentName") as string)?.trim() || null;
  const parentEmail = (formData.get("parentEmail") as string)?.trim().toLowerCase() || null;
  const parentPhone = (formData.get("parentPhone") as string)?.trim() || null;
  const parentRelationship = (formData.get("parentRelationship") as string)?.trim() || null;

  // 2. Schema validation
  const validation = UserProfileSchema.safeParse({
    name,
    email,
    headline,
    bio,
    phone,
    avatar: avatarUrlOrPreset,
    age,
    dateOfBirth,
    parentName,
    parentEmail,
    parentPhone,
    parentRelationship,
  });

  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || "Please verify your input fields.",
    };
  }

  const validatedData = validation.data;

  // 3. Email uniqueness verification (if changed)
  if (validatedData.email !== currentUser.email.toLowerCase()) {
    const existingWithEmail = await db.user.findFirst({
      where: {
        email: validatedData.email,
        id: { not: currentUser.id },
      },
    });

    if (existingWithEmail) {
      return {
        error: "An account with this email address already exists in the institutional registry.",
      };
    }
  }

  // 4. Handle avatar image file upload (if user attached a file)
  let finalAvatar: string | null = validatedData.avatar || currentUser.avatar || null;

  if (avatarFile && avatarFile.size > 0) {
    if (avatarFile.size > MAX_AVATAR_SIZE_BYTES) {
      return { error: "Profile picture exceeds maximum allowed size limit of 5MB." };
    }

    const ext = path.extname(avatarFile.name).toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return { error: "Invalid image format. Allowed formats: PNG, JPG, JPEG, WEBP, SVG." };
    }

    try {
      const storageDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(storageDir, { recursive: true });

      const safeBaseName = avatarFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storedFileName = `avatar_${currentUser.id}_${Date.now()}_${safeBaseName}`;
      const destinationPath = path.join(storageDir, storedFileName);

      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      await fs.writeFile(destinationPath, buffer);

      finalAvatar = `/uploads/avatars/${storedFileName}`;
    } catch (uploadError) {
      console.error("Failed to write avatar file to disk:", uploadError);
      return { error: "Failed to save profile picture file. Please try again." };
    }
  } else if (formData.get("removeAvatar") === "true") {
    finalAvatar = null;
  }

  // 5. Update database record
  try {
    const isMinor = Boolean(validatedData.age !== null && validatedData.age !== undefined && validatedData.age < 18);
    const updated = await db.user.update({
      where: { id: currentUser.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        headline: validatedData.headline,
        bio: validatedData.bio,
        phone: validatedData.phone,
        avatar: finalAvatar,
        age: validatedData.age ?? null,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        parentName: validatedData.parentName || null,
        parentEmail: validatedData.parentEmail || null,
        parentPhone: validatedData.parentPhone || null,
        parentRelationship: validatedData.parentRelationship || null,
        parentConsentGiven: isMinor,
        parentConsentAt: isMinor ? new Date() : null,
      },
    });

    // 6. Refresh the active signed session cookie so navbars, headers, and UI sync immediately
    await createSession({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role as "STUDENT" | "TRAINER" | "ADMIN",
      avatar: updated.avatar,
      headline: updated.headline,
      phone: updated.phone,
      age: updated.age,
      parentEmail: updated.parentEmail,
    });

    // 7. Operational Audit Trace
    try {
      await db.auditLog.create({
        data: {
          action: "USER_PROFILE_UPDATED",
          entity: "User",
          entityId: updated.id,
          userId: updated.id,
          details: JSON.stringify({
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            age: updated.age,
            isMinor,
            parentEmail: updated.parentEmail,
            hasAvatar: Boolean(updated.avatar),
          }),
        },
      });
    } catch {
      // Non-blocking telemetry
    }

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/profile");
    revalidatePath("/dashboard/trainer");
    revalidatePath("/dashboard/trainer/profile");
    revalidatePath("/courses");

    return {
      success: true,
      message: "Profile updated successfully! Academic and parent contact details are synchronized.",
      updatedUser: {
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
        phone: updated.phone,
        headline: updated.headline,
        bio: updated.bio,
        age: updated.age,
        parentName: updated.parentName,
        parentEmail: updated.parentEmail,
        parentPhone: updated.parentPhone,
        parentRelationship: updated.parentRelationship,
      },
    };
  } catch (err: unknown) {
    console.error("Profile update error:", err);
    return {
      error: "Unable to update profile record in database. Please try again later.",
    };
  }
}

export async function quickUpdateAvatarAction(formData: FormData): Promise<{
  success?: boolean;
  error?: string;
  avatarUrl?: string | null;
}> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Authentication required." };
  }

  const avatarFile = formData.get("avatarFile") as File | null;
  const removeAvatar = formData.get("removeAvatar") === "true";

  let finalAvatar: string | null = currentUser.avatar || null;

  if (removeAvatar) {
    finalAvatar = null;
  } else if (avatarFile && avatarFile.size > 0) {
    if (avatarFile.size > MAX_AVATAR_SIZE_BYTES) {
      return { error: "Image size must be less than 5MB." };
    }
    const ext = path.extname(avatarFile.name).toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return { error: "Allowed formats: PNG, JPG, JPEG, WEBP, SVG." };
    }

    try {
      const storageDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(storageDir, { recursive: true });
      const safeBaseName = avatarFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storedFileName = `avatar_${currentUser.id}_${Date.now()}_${safeBaseName}`;
      const destinationPath = path.join(storageDir, storedFileName);
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      await fs.writeFile(destinationPath, buffer);
      finalAvatar = `/uploads/avatars/${storedFileName}`;
    } catch (err) {
      console.error("Failed to save avatar:", err);
      return { error: "Failed to upload avatar image." };
    }
  }

  try {
    const updated = await db.user.update({
      where: { id: currentUser.id },
      data: { avatar: finalAvatar },
    });

    await createSession({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role as "STUDENT" | "TRAINER" | "ADMIN",
      avatar: updated.avatar,
      headline: updated.headline,
      phone: updated.phone,
      age: updated.age,
      parentEmail: updated.parentEmail,
    });

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/trainer");
    revalidatePath("/dashboard/admin");

    return { success: true, avatarUrl: finalAvatar };
  } catch (err) {
    console.error("Failed to update user avatar:", err);
    return { error: "Could not save avatar changes." };
  }
}

