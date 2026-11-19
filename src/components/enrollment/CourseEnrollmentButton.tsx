"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Users 
} from "lucide-react";
import { enrollInCourseAction } from "@/app/actions/enrollment";
import { EnrollmentWithGuardianModal } from "./EnrollmentWithGuardianModal";

interface CourseEnrollmentButtonProps {
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
    firstLessonId?: string;
  };
  currentUser: {
    id: string;
    name: string;
    email: string;
    age?: number | null;
    parentName?: string | null;
    parentEmail?: string | null;
    parentPhone?: string | null;
    parentRelationship?: string | null;
  } | null;
  isEnrolled: boolean;
}

export function CourseEnrollmentButton({
  course,
  currentUser,
  isEnrolled,
}: CourseEnrollmentButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already enrolled, direct to classroom
  if (isEnrolled) {
    return (
      <Link
        href={`/courses/${course.slug}/learn/${course.firstLessonId || ""}`}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold bg-[#0B1B3D] hover:bg-[#132752] text-white shadow-md btn-lift text-sm transition-all"
      >
        <span>Already Enrolled • Enter Classroom</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    );
  }

  // Check if student needs under-18 guardian details
  const age = currentUser?.age ?? null;
  const isMinor = age !== null && age < 18;
  const hasParentDetails = Boolean(
    currentUser?.parentName && currentUser?.parentEmail && currentUser?.parentPhone
  );
  const needsGuardianSetup = currentUser ? (isMinor ? !hasParentDetails : age === null) : false;

  const handleClick = (e: React.MouseEvent) => {
    // If user is not authenticated, redirect to login
    if (!currentUser) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }

    // If student needs guardian details or age verification, pop the modal
    if (needsGuardianSetup) {
      e.preventDefault();
      setIsModalOpen(true);
      return;
    }

    // For paid courses, direct to checkout
    if (course.price > 0) {
      router.push(`/checkout/${course.slug}`);
      return;
    }

    // For free course with age verified, direct zero-dollar enroll
    e.preventDefault();
    startTransition(async () => {
      try {
        await enrollInCourseAction(course.id);
      } catch {
        // Fallback open modal on any minor restriction
        setIsModalOpen(true);
      }
    });
  };

  return (
    <>
      <div className="space-y-2">
        {course.price <= 0 ? (
          <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white shadow-lg shadow-emerald-500/25 btn-lift text-sm cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enrolling...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enroll for Free • Start Learning</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white shadow-lg shadow-orange-500/25 btn-lift text-sm cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Proceed to Checkout</span>
          </button>
        )}

        {isMinor && hasParentDetails && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-200/70">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Parent Reporting Active ({currentUser?.parentEmail})</span>
          </div>
        )}

        {needsGuardianSetup && (
          <div className="flex items-center justify-center gap-1 text-[11px] text-amber-700 font-medium">
            <Users className="w-3 h-3 text-amber-600" />
            <span>Learners under 18 require parent/guardian contact</span>
          </div>
        )}
      </div>

      <EnrollmentWithGuardianModal
        course={course}
        currentUser={currentUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
