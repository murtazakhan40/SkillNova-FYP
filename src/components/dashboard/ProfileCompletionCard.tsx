"use client";

import React, { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { quickUpdateAvatarAction } from "@/app/actions/profile";

interface ProfileCompletionCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    headline?: string | null;
  };
  completionPercentage?: number;
  statusText?: string;
  detailsText?: string;
  editProfileHref: string;
}

export function ProfileCompletionCard({
  user,
  completionPercentage = 90,
  statusText = "Your profile is complete.",
  detailsText,
  editProfileHref,
}: ProfileCompletionCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(user.avatar || null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute 2-letter initials (e.g., "MK" for Murtaza Khan, just like in screenshot!)
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || user.name.slice(0, 2).toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Image size must be 2 MB or less.");
      return;
    }

    setErrorMsg(null);
    const formData = new FormData();
    formData.append("avatarFile", file);

    startTransition(async () => {
      const res = await quickUpdateAvatarAction(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.avatarUrl) {
        setCurrentAvatar(res.avatarUrl);
      }
    });
  };

  const handleRemovePhoto = () => {
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("removeAvatar", "true");

    startTransition(async () => {
      const res = await quickUpdateAvatarAction(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setCurrentAvatar(null);
      }
    });
  };

  const defaultDetails =
    detailsText ||
    (user.role === "STUDENT"
      ? "Education: Current student · BS · Computer Science · The University of Agriculture, Peshawar · semester 7"
      : user.role === "TRAINER"
      ? "Faculty: Lead Instructor · Systems & Web Engineering · SkillNova Academy"
      : "Governance: Lead Administrator · System Security & Verification · Clearance Level 1");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
      <div>
        {/* Card Header Title */}
        <h2 className="text-base font-extrabold text-[#0B1B3D] tracking-tight mb-5">
          Profile completion
        </h2>

        {/* Avatar + Change Photo Section */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-amber-400 text-[#0B1B3D] flex items-center justify-center font-extrabold text-xl ring-2 ring-slate-100 shadow-xs">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {isPending && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="font-bold text-[#6D28D9] hover:text-[#5B21B6] hover:underline cursor-pointer disabled:opacity-50"
              >
                Change photo
              </button>

              {currentAvatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isPending}
                  className="text-slate-400 hover:text-red-500 font-medium cursor-pointer disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              JPG, PNG or WebP, up to 2 MB.
            </p>

            {errorMsg && (
              <p className="text-[11px] text-red-500 font-semibold">{errorMsg}</p>
            )}

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Progress Bar with Percentage Label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, completionPercentage))}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-700 shrink-0">
            {completionPercentage}%
          </span>
        </div>

        {/* Status Line */}
        <div className="space-y-1 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{statusText}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            {defaultDetails}
          </p>
        </div>
      </div>

      {/* Edit Profile Outline Button */}
      <div>
        <Link
          href={editProfileHref}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-[#0B1B3D] bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors duration-150"
        >
          Edit profile
        </Link>
      </div>
    </div>
  );
}
