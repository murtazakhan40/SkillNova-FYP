import React from "react";
import Link from "next/link";
import { SkillNovaLogo } from "@/components/brand/SkillNovaLogo";
import { registerAction } from "@/app/actions/auth";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight
} from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0B1B3D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#FF6B00]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-4">
          <SkillNovaLogo variant="light" size="lg" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Create Your Free Account
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Join thousands of learners and instructors on SkillNova Academy.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <form action={async (formData) => {
            "use server";
            await registerAction(null, formData);
          }} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registering As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 hover:bg-slate-50 has-[:checked]:border-[#FF6B00] has-[:checked]:bg-orange-50/50">
                  <input
                    type="radio"
                    name="role"
                    value="STUDENT"
                    defaultChecked
                    className="accent-[#FF6B00]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#0B1B3D] block">Student</span>
                    <span className="text-[10px] text-slate-500">Learn & get certified</span>
                  </div>
                </label>

                <label className="cursor-pointer border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 hover:bg-slate-50 has-[:checked]:border-[#FF6B00] has-[:checked]:bg-orange-50/50">
                  <input
                    type="radio"
                    name="role"
                    value="TRAINER"
                    className="accent-[#FF6B00]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#0B1B3D] block">Trainer</span>
                    <span className="text-[10px] text-slate-500">Teach & author courses</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#EA580C] shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01] mt-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#0B1B3D] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Back to SkillNova Academy Home
          </Link>
        </div>
      </div>
    </div>
  );
}
