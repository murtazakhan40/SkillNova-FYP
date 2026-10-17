import React from "react";
import Link from "next/link";
import { SkillNovaLogo } from "@/components/brand/SkillNovaLogo";
import { HeroParticles } from "@/components/animations/HeroParticles";
import { loginAction, quickDemoLogin, loginWithFacultyEmail } from "@/app/actions/auth";
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  Sparkles
} from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B1B3D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient particles & glows */}
      <HeroParticles particleCount={25} />
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#FF6B00]/10 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-4">
          <SkillNovaLogo variant="light" size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 font-normal">
          Access your courses, dashboard, and learning materials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {/* Quick Demo Switcher for FYP Presentation */}
          <div className="mb-6 p-4 rounded-2xl bg-orange-50/80 border border-orange-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#0B1B3D] mb-2.5">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>FYP Evaluator One-Click Sign In:</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <form action={quickDemoLogin.bind(null, "STUDENT")}>
                <button
                  type="submit"
                  className="w-full py-2 px-2 rounded-xl text-[11px] font-heading font-bold bg-white text-blue-700 hover:bg-blue-50 border border-blue-200/80 shadow-sm btn-lift cursor-pointer text-center"
                >
                  Student (Murtaza)
                </button>
              </form>

              <form action={quickDemoLogin.bind(null, "TRAINER")}>
                <button
                  type="submit"
                  className="w-full py-2 px-2 rounded-xl text-[11px] font-heading font-bold bg-white text-orange-700 hover:bg-orange-50 border border-orange-200/80 shadow-sm btn-lift cursor-pointer text-center"
                >
                  Trainer Studio
                </button>
              </form>

              <form action={quickDemoLogin.bind(null, "ADMIN")}>
                <button
                  type="submit"
                  className="w-full py-2 px-2 rounded-xl text-[11px] font-heading font-bold bg-white text-purple-700 hover:bg-purple-50 border border-purple-200/80 shadow-sm btn-lift cursor-pointer text-center"
                >
                  Admin Console
                </button>
              </form>
            </div>

            {/* Course Faculty Directory */}
            <details className="mt-3 text-left">
              <summary className="text-[11px] font-bold text-[#0B1B3D] hover:text-[#FF6B00] cursor-pointer select-none">
                ▸ View Course Instructors & Demo Logins
              </summary>
              <div className="mt-2 pt-2 border-t border-orange-200/80 space-y-1.5 text-[11px]">
                <form action={loginWithFacultyEmail.bind(null, "adeel.qasir@skillnova.com")}>
                  <button type="submit" className="w-full text-left p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 flex justify-between items-center transition-colors cursor-pointer border border-orange-100">
                    <span>🎨 <strong>Adeel Qasir</strong> (Lead UI/UX Design)</span>
                    <span className="text-[10px] text-[#FF6B00] font-bold">1-Click Login →</span>
                  </button>
                </form>

                <form action={loginWithFacultyEmail.bind(null, "misbah.ullah@skillnova.com")}>
                  <button type="submit" className="w-full text-left p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 flex justify-between items-center transition-colors cursor-pointer border border-blue-100">
                    <span>💻 <strong>Misbah Ullah</strong> (MERN & Next.js)</span>
                    <span className="text-[10px] text-[#FF6B00] font-bold">1-Click Login →</span>
                  </button>
                </form>

                <form action={loginWithFacultyEmail.bind(null, "muhammad.ibrahim@skillnova.com")}>
                  <button type="submit" className="w-full text-left p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 flex justify-between items-center transition-colors cursor-pointer border border-emerald-100">
                    <span>📱 <strong>Muhammad Ibrahim</strong> (Mobile & Flutter)</span>
                    <span className="text-[10px] text-[#FF6B00] font-bold">1-Click Login →</span>
                  </button>
                </form>

                <form action={loginWithFacultyEmail.bind(null, "sarah.mitchell@skillnova.com")}>
                  <button type="submit" className="w-full text-left p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 flex justify-between items-center transition-colors cursor-pointer">
                    <span>🧠 <strong>Dr. Sarah Mitchell</strong> (AI / PyTorch)</span>
                    <span className="text-[10px] text-[#FF6B00] font-bold">1-Click Login →</span>
                  </button>
                </form>

                <form action={loginWithFacultyEmail.bind(null, "david.chen@skillnova.com")}>
                  <button type="submit" className="w-full text-left p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 flex justify-between items-center transition-colors cursor-pointer">
                    <span>☁️ <strong>Prof. David Chen</strong> (Cloud / Go)</span>
                    <span className="text-[10px] text-[#FF6B00] font-bold">1-Click Login →</span>
                  </button>
                </form>

                <form action={loginWithFacultyEmail.bind(null, "alex.rivera@skillnova.com")}>
                  <button type="submit" className="w-full text-left p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 flex justify-between items-center transition-colors cursor-pointer">
                    <span>🛡️ <strong>Alex Rivera</strong> (Cybersecurity)</span>
                    <span className="text-[10px] text-[#FF6B00] font-bold">1-Click Login →</span>
                  </button>
                </form>

                <form action={loginWithFacultyEmail.bind(null, "zainab.ahmed@skillnova.com")}>
                  <button type="submit" className="w-full text-left p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 flex justify-between items-center transition-colors cursor-pointer">
                    <span>💾 <strong>Dr. Zainab Ahmed</strong> (Databases)</span>
                    <span className="text-[10px] text-[#FF6B00] font-bold">1-Click Login →</span>
                  </button>
                </form>

                <form action={loginWithFacultyEmail.bind(null, "fatima.noor@skillnova.edu")}>
                  <button type="submit" className="w-full text-left p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 flex justify-between items-center transition-colors cursor-pointer">
                    <span>🎓 <strong>Fatima Noor</strong> (AI Scholar)</span>
                    <span className="text-[10px] text-[#FF6B00] font-bold">1-Click Login →</span>
                  </button>
                </form>
              </div>
            </details>

            <div className="mt-2 text-[10px] text-slate-500 text-center font-medium">
              Demo passwords: <span className="font-bold text-[#0B1B3D]">student123</span> / <span className="font-bold text-[#0B1B3D]">trainer123</span> / <span className="font-bold text-[#0B1B3D]">admin123</span>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 uppercase tracking-wider font-semibold">
                Or Sign In with Email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form action={async (formData) => {
            "use server";
            await loginAction(null, formData);
          }} className="space-y-4">
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
                  placeholder="murtazwazir.edu@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-[#FF6B00] hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-heading font-bold text-white bg-[#0B1B3D] hover:bg-[#132752] shadow-md btn-lift cursor-pointer mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-[#FF6B00] hover:text-[#EA580C] hover:underline"
            >
              Sign Up for Free
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
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
