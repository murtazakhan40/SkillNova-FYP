import React, { Suspense } from "react";
import Link from "next/link";
import { SkillNovaLogo } from "@/components/brand/SkillNovaLogo";
import { HeroParticles } from "@/components/animations/HeroParticles";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Loader2
} from "lucide-react";

export const metadata = {
  title: "Create Your Account | SkillNova Academy",
  description:
    "Register as a Student to enroll in industry-aligned courses, or join as a Faculty Trainer to mentor and publish technical curricula.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0B1B3D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Interactive Elements */}
      <HeroParticles particleCount={30} />
      <div 
        className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#FF6B00]/10 blur-3xl pointer-events-none animate-pulse-glow" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-3xl pointer-events-none animate-pulse-glow" 
        style={{ animationDelay: "2s" }} 
        aria-hidden="true" 
      />

      {/* Header Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center relative z-10 mb-8">
        <div className="flex justify-center mb-5">
          <SkillNovaLogo variant="light" size="lg" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-semibold backdrop-blur-sm border border-white/15 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>SkillNova Academy Onboarding</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
          Join SkillNova Academy
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-normal">
          Register before enrolling in technical courses or applying as an accredited faculty trainer.
        </p>

        {/* Value Highlights Pill Row */}
        <div className="mt-5 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
            <span>Accredited Certifications</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
            <span>Faculty Authoring Studio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
            <span>Under-18 Guardian Oversight</span>
          </div>
        </div>
      </div>

      {/* Registration Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100 backdrop-blur-sm">
          <Suspense
            fallback={
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
                <p className="text-xs font-medium">Preparing onboarding registration...</p>
              </div>
            }
          >
            <RegisterForm />
          </Suspense>

          {/* Card Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Already have an active account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#0B1B3D] hover:text-[#FF6B00] transition-colors underline"
              >
                Sign In
              </Link>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>TLS 256-bit Encrypted Registration</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            ← Return to SkillNova Academy Home
          </Link>
        </div>
      </div>
    </div>
  );
}
