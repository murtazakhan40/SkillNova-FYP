"use client";

import React, { useState, useTransition, useId } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import {
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Briefcase,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Users,
  Globe,
  Award,
} from "lucide-react";

interface RegisterFormProps {
  initialRole?: "STUDENT" | "TRAINER";
  initialRedirect?: string;
}

export function RegisterForm({ initialRole = "STUDENT", initialRedirect }: RegisterFormProps) {
  const searchParams = useSearchParams();
  const redirectParam = initialRedirect || searchParams.get("redirect") || "";
  const roleParam = searchParams.get("role")?.toUpperCase();

  const [role, setRole] = useState<"STUDENT" | "TRAINER">(
    roleParam === "TRAINER" || initialRole === "TRAINER" ? "TRAINER" : "STUDENT"
  );

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Student specific state
  const [studentAge, setStudentAge] = useState<string>("");
  const isMinor = Boolean(studentAge && Number(studentAge) > 0 && Number(studentAge) < 18);

  // Form IDs for accessibility
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const phoneId = useId();
  const ageId = useId();
  const headlineId = useId();
  const domainId = useId();
  const expId = useId();
  const portfolioId = useId();
  const bioId = useId();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("role", role);
    if (redirectParam) {
      formData.set("redirectTo", redirectParam);
    }

    startTransition(async () => {
      try {
        const res = await registerAction(null, formData);
        if (res && res.error) {
          setErrorMessage(res.error);
        }
      } catch (err: unknown) {
        // Next.js redirect throws NEXT_REDIRECT which is expected on successful navigation
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          return;
        }
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during registration. Please try again."
        );
      }
    });
  };

  return (
    <div className="w-full">
      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200/80">
        <button
          type="button"
          onClick={() => {
            setRole("STUDENT");
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
            role === "STUDENT"
              ? "bg-[#0B1B3D] text-white shadow-md shadow-slate-900/10 scale-[1.01]"
              : "text-slate-600 hover:text-[#0B1B3D] hover:bg-white/60"
          }`}
        >
          <GraduationCap className={`w-4 h-4 ${role === "STUDENT" ? "text-[#FF6B00]" : "text-slate-400"}`} />
          <span>Student Account</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRole("TRAINER");
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
            role === "TRAINER"
              ? "bg-[#0B1B3D] text-white shadow-md shadow-slate-900/10 scale-[1.01]"
              : "text-slate-600 hover:text-[#0B1B3D] hover:bg-white/60"
          }`}
        >
          <Briefcase className={`w-4 h-4 ${role === "TRAINER" ? "text-[#FF6B00]" : "text-slate-400"}`} />
          <span>Trainer / Faculty</span>
        </button>
      </div>

      {/* Role Guidance Header */}
      <div className="mb-6 p-4 rounded-xl border bg-slate-50/70 border-slate-200/60 flex items-start gap-3">
        {role === "STUDENT" ? (
          <>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0B1B3D] font-heading">
                Learner Registration & Course Enrollment
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Register to enroll in accredited courses, track lesson progress, take quizzes, and earn verifiable certificates. Learners under 18 can provide guardian details for progress reports.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0B1B3D] font-heading">
                Faculty Instructor Onboarding
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Register to author technical curricula, design student quizzes, review and evaluate assignment project submissions, and train prospective engineers.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-xs animate-shake"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row: Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={nameId} className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id={nameId}
                type="text"
                name="name"
                required
                disabled={isPending}
                placeholder={role === "STUDENT" ? "e.g. Murtaza Wazir" : "e.g. Dr. Sarah Jenkins"}
                className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor={emailId} className="block text-xs font-bold text-slate-700 mb-1.5">
              {role === "STUDENT" ? "Student Email" : "Professional Email"} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id={emailId}
                type="email"
                name="email"
                required
                disabled={isPending}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Row: Password & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={passwordId} className="block text-xs font-bold text-slate-700 mb-1.5">
              Create Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={8}
                disabled={isPending}
                placeholder="Min 8 characters"
                className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor={phoneId} className="block text-xs font-bold text-slate-700 mb-1.5">
              Contact Phone / WhatsApp {role === "TRAINER" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id={phoneId}
                type="tel"
                name="phone"
                required={role === "TRAINER"}
                disabled={isPending}
                placeholder="+92 300 1234567"
                className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STUDENT SPECIFIC FIELDS                                            */}
        {/* ------------------------------------------------------------------ */}
        {role === "STUDENT" && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor={ageId} className="block text-xs font-bold text-slate-700 mb-1.5">
                  Age (Years)
                </label>
                <input
                  id={ageId}
                  type="number"
                  name="age"
                  min={10}
                  max={100}
                  value={studentAge}
                  onChange={(e) => setStudentAge(e.target.value)}
                  disabled={isPending}
                  placeholder="e.g. 17"
                  className="w-full px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Education Level
                </label>
                <select
                  name="educationLevel"
                  disabled={isPending}
                  className="w-full px-3 py-2.5 text-xs text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
                >
                  <option value="">Select Level (Optional)</option>
                  <option value="High School / College">High School / O & A-Levels</option>
                  <option value="Undergraduate Student">Undergraduate (BS / BE)</option>
                  <option value="Postgraduate Student">Postgraduate (MS / PhD)</option>
                  <option value="Career Transition">Career Transition / Self-Taught</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Primary Interest
                </label>
                <select
                  name="fieldOfInterest"
                  disabled={isPending}
                  className="w-full px-3 py-2.5 text-xs text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
                >
                  <option value="">Select Domain</option>
                  <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                  <option value="Data Science & Engineering">Data Science & Engineering</option>
                  <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                  <option value="Mobile App Engineering">Mobile App Engineering</option>
                  <option value="Cyber Security">Cyber Security</option>
                </select>
              </div>
            </div>

            {/* DYNAMIC GUARDIAN CONSENT PANEL (When student age is under 18) */}
            {isMinor && (
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/90 space-y-3 transition-all animate-fadeIn">
                <div className="flex items-center gap-2 text-[#0B1B3D]">
                  <Users className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-xs font-heading font-bold">
                    Parent / Guardian Academic Oversight (Learner under 18)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  As an educational safety standard, learners under 18 must provide parent contact details so that official quiz scores and certificate completions can be shared.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Parent / Guardian Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      required={isMinor}
                      disabled={isPending}
                      placeholder="e.g. Robert Wazir"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Parent Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="parentEmail"
                      required={isMinor}
                      disabled={isPending}
                      placeholder="parent@domain.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Parent Phone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      required={isMinor}
                      disabled={isPending}
                      placeholder="+92 300 9876543"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Relationship
                    </label>
                    <select
                      name="parentRelationship"
                      disabled={isPending}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] bg-white"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-start gap-2 pt-1 text-[11px] text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="parentConsentGiven"
                    value="true"
                    defaultChecked
                    required={isMinor}
                    className="mt-0.5 accent-[#FF6B00] rounded"
                  />
                  <span>
                    I confirm that my parent or legal guardian has authorized my educational registration and agrees to receive academic progress updates.
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TRAINER SPECIFIC FIELDS                                            */}
        {/* ------------------------------------------------------------------ */}
        {role === "TRAINER" && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={headlineId} className="block text-xs font-bold text-slate-700 mb-1.5">
                  Professional Title / Role <span className="text-red-500">*</span>
                </label>
                <input
                  id={headlineId}
                  type="text"
                  name="headline"
                  required
                  disabled={isPending}
                  placeholder="e.g. Senior Software Architect at Google"
                  className="w-full px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
                />
              </div>

              <div>
                <label htmlFor={domainId} className="block text-xs font-bold text-slate-700 mb-1.5">
                  Teaching Domain <span className="text-red-500">*</span>
                </label>
                <select
                  id={domainId}
                  name="teachingDomain"
                  required
                  disabled={isPending}
                  className="w-full px-3 py-2.5 text-xs text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
                >
                  <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Data Science & Analytics">Data Science & Analytics</option>
                  <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
                  <option value="Mobile Engineering (iOS / Android)">Mobile Engineering (iOS / Android)</option>
                  <option value="Cyber Security & Forensics">Cyber Security & Forensics</option>
                  <option value="Computer Science Fundamentals">Computer Science Fundamentals</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={expId} className="block text-xs font-bold text-slate-700 mb-1.5">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  id={expId}
                  name="experienceYears"
                  required
                  disabled={isPending}
                  className="w-full px-3 py-2.5 text-xs text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
                >
                  <option value="1-3 Years">1 - 3 Years of Industry Experience</option>
                  <option value="3-5 Years">3 - 5 Years of Technical Mentorship</option>
                  <option value="5-10 Years">5 - 10 Years Senior Engineering</option>
                  <option value="10+ Years">10+ Years Principal / Faculty Lead</option>
                </select>
              </div>

              <div>
                <label htmlFor={portfolioId} className="block text-xs font-bold text-slate-700 mb-1.5">
                  Portfolio / LinkedIn / GitHub URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id={portfolioId}
                    type="url"
                    name="portfolioUrl"
                    disabled={isPending}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor={bioId} className="block text-xs font-bold text-slate-700 mb-1.5">
                Instructor Bio & Teaching Motivation <span className="text-red-500">*</span>
              </label>
              <textarea
                id={bioId}
                name="bio"
                required
                rows={3}
                minLength={20}
                disabled={isPending}
                placeholder="Share your technical experience, industry projects, and teaching philosophy with our students and academic board..."
                className="w-full px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all disabled:opacity-60 bg-white resize-y"
              />
              <span className="text-[10px] text-slate-400">Minimum 20 characters</span>
            </div>
          </div>
        )}

        {/* Honor Code & Consent */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              required
              disabled={isPending}
              defaultChecked
              className="mt-0.5 accent-[#FF6B00] rounded"
            />
            <span className="leading-relaxed">
              I agree to the{" "}
              <Link href="/about" className="font-semibold text-[#0B1B3D] underline">
                SkillNova Terms of Service
              </Link>{" "}
              and Academic Integrity Policy.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-heading font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#EA580C] hover:opacity-95 active:scale-[0.99] shadow-md shadow-orange-500/25 btn-lift cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-4"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Creating Your Account...</span>
            </>
          ) : role === "STUDENT" ? (
            <>
              <span>Complete Student Registration & Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Submit Faculty Registration & Open Studio</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

