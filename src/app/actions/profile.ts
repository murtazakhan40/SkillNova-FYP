"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export interface ProfileUpdateResult {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function updateStudentProfileAction(
  _prevState: ProfileUpdateResult | null,
  formData: FormData
): Promise<ProfileUpdateResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Authentication required. Please log in again." };
  }

  const name = (formData.get("name") as string)?.trim();
  const headline = (formData.get("headline") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { error: "Full Name must be at least 2 characters long." };
  }

  if (phone && phone.length > 20) {
    return { error: "Phone number is invalid or exceeds 20 characters." };
  }

  if (bio && bio.length > 500) {
    return { error: "Bio cannot exceed 500 characters." };
  }

  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        name,
        headline,
        bio,
        phone,
      },
    });

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/profile");

    return {
      success: true,
      message: "Your student profile has been updated successfully!",
    };
  } catch (err: unknown) {
    console.error("Profile update error:", err);
    return {
      error: "Unable to update profile. Please try again later.",
    };
  }
}
