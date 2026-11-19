"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Mail, 
  Phone, 
  User, 
  Users, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Smile
} from "lucide-react";
import { enrollWithGuardianAction } from "@/app/actions/enrollment";

interface EnrollmentWithGuardianModalProps {
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
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
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_AGES = [12, 13, 14, 15, 16, 17, 18];

export function EnrollmentWithGuardianModal({
  course,
  currentUser,
  isOpen,
  onClose,
}: EnrollmentWithGuardianModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [age, setAge] = useState<number | string>(currentUser?.age ?? 16);
  const [parentName, setParentName] = useState(currentUser?.parentName || "");
  const [parentEmail, setParentEmail] = useState(currentUser?.parentEmail || "");
  const [parentPhone, setParentPhone] = useState(currentUser?.parentPhone || "");
  const [parentRelationship, setParentRelationship] = useState(
    currentUser?.parentRelationship || "Parent"
  );

  if (!isOpen) return null;

  const numericAge = typeof age === "number" ? age : parseInt(age, 10);
  const isMinor = !isNaN(numericAge) && numericAge < 18;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isNaN(numericAge) || numericAge < 5 || numericAge > 120) {
      setErrorMessage("Please select or enter a valid age.");
      return;
    }

    if (isMinor) {
      if (!parentName.trim()) {
        setErrorMessage("Please enter your parent or guardian's full name.");
        return;
      }
      if (!parentEmail.trim() || !parentEmail.includes("@")) {
        setErrorMessage("Please enter a valid parent email address so we can send your progress reports.");
        return;
      }
      if (!parentPhone.trim() || parentPhone.trim().length < 7) {
        setErrorMessage("Please enter your parent's phone or WhatsApp number.");
        return;
      }
    }

    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set("age", String(numericAge));
    if (isMinor) {
      formData.set("parentName", parentName.trim());
      formData.set("parentEmail", parentEmail.trim().toLowerCase());
      formData.set("parentPhone", parentPhone.trim());
      formData.set("parentRelationship", parentRelationship);
    }

    startTransition(async () => {
      try {
        const result = await enrollWithGuardianAction(null, formData);
        if (result.success && result.redirectUrl) {
          router.push(result.redirectUrl);
          router.refresh();
          onClose();
        } else if (result.error) {
          setErrorMessage(result.error);
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Playful Top Header */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#132752] to-[#FF6B00] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-200 block">
                  Student Enrollment Setup
                </span>
                <h3 className="text-lg font-heading font-extrabold text-white">
                  Welcome to Your Learning Journey! 🚀
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-200 mt-2 relative z-10 leading-relaxed">
            Course: <strong className="text-white">{course.title}</strong>
          </p>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in shake duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {/* 1. Age Picker with Kid-Friendly Quick Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-[#FF6B00]" />
                <span>How old are you? (Student Age)</span>
              </label>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isMinor 
                  ? "bg-amber-100 text-amber-800 border border-amber-300/80" 
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300/80"
              }`}>
                {isMinor ? "🌟 Under 18 (Junior Scholar)" : "🎓 18 or Older (Adult Scholar)"}
              </span>
            </div>

            {/* Quick age chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {COMMON_AGES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(a)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    numericAge === a
                      ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/30 scale-105 ring-2 ring-orange-400"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {a === 18 ? "18+" : `${a} yrs`}
                </button>
              ))}
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-[11px] text-slate-400">Custom:</span>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-center text-[#0B1B3D] focus:ring-1 focus:ring-[#FF6B00] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Guardian Section (Required if student is under 18) */}
          {isMinor ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/60 border-2 border-orange-200/90 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0B1B3D]">
                    Parent / Guardian Details Required
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Because you are under 18, we will send your <strong>learning progress, quiz scores, and certificates</strong> directly to your mom, dad, or guardian! 🌟
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Parent Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Parent / Guardian Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Mom, Dad, or Guardian"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span>Relationship *</span>
                  </label>
                  <select
                    value={parentRelationship}
                    onChange={(e) => setParentRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B00]"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Parent">Parent</option>
                  </select>
                </div>

                {/* Parent Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#FF6B00]" />
                    <span>Parent Email (For Reports) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                  />
                  <p className="text-[10px] text-slate-500">
                    Where we send your progress reports and certificates.
                  </p>
                </div>

                {/* Parent Phone / WhatsApp */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Parent WhatsApp / Mobile *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                  />
                  <p className="text-[10px] text-slate-500">
                    For course milestones and academic alerts.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 border border-orange-200 text-[11px] text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Automatic updates will be emailed to your parent upon enrollment, quiz completion, and course clearance!
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">Independent Scholar Confirmed</strong>
                <span className="text-[11px] text-emerald-700">
                  Since you are 18 or older, parent/guardian contact info is completely optional. You are ready to enroll!
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl text-xs font-heading font-extrabold bg-gradient-to-r from-[#FF6B00] to-[#EA580C] hover:opacity-95 text-white shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enrolling Young Scholar...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Setup & Start Course</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
