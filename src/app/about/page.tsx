import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Mail,
  Phone
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-[#0B1B3D] text-white py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#132752] border border-[#1B376F] text-[#FF6B00] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BS Computer Science Final Year Project (FYP)</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              About SkillNova Academy
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
              SkillNova Academy is a comprehensive, production-standard Web-based Learning Management Platform (LMS)
              developed to bridge the gap between academic theory and enterprise computer science practices.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-16">
        {/* Project Objectives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
              Project Mission
            </h2>
            <h3 className="text-2xl font-extrabold text-[#0B1B3D]">
              Engineered with High Academic Rigor & Industry Standards
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Traditional university LMS systems often lack modern reactive user interfaces, verifiable digital credentials,
              and seamless multi-role workflows. SkillNova Academy was conceived to solve these challenges with modern software design patterns.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Next.js App Router for server-rendered speed and SEO efficiency</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Relational database modeling with strict foreign key constraints in 3NF</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Role-Based Access Control (RBAC) across Students, Instructors, and Admins</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Cryptographically verifiable certificate code system (e.g. SN-2026-X89J21)</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6">
            <h4 className="text-base font-bold text-[#0B1B3D] border-b border-slate-100 pb-3">
              Final Year Project Specifications
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Degree Program</span>
                <span className="font-bold text-[#0B1B3D]">BS Computer Science</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Architecture</span>
                <span className="font-bold text-[#0B1B3D]">Full-Stack App Router</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Database & ORM</span>
                <span className="font-bold text-[#0B1B3D]">Prisma + SQLite/Postgres</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Security Standard</span>
                <span className="font-bold text-[#0B1B3D]">Bcrypt + RBAC Session</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/courses"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#0B1B3D] hover:bg-[#132752] text-white transition-colors"
              >
                <span>Explore the Live Catalog</span>
                <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Project Lead & Developer Profile Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0B1B3D] via-[#10224D] to-[#060E1E] text-white shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Project Author & Lead Engineer</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Murtaza Wazir
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                BS Computer Science final year student and lead architect of SkillNova Academy. Engineered the end-to-end full-stack Next.js architecture, relational 3NF database schema, role-based access control, interactive classroom, and cryptographic certificate verification system.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <a 
                  href="mailto:murtazwazir.edu@gmail.com"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Official Email</div>
                    <div className="text-xs font-semibold text-white truncate">murtazwazir.edu@gmail.com</div>
                  </div>
                </a>

                <a 
                  href="tel:03029983146"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone / WhatsApp</div>
                    <div className="text-xs font-semibold text-white truncate">0302-9983146 (+92 302 9983146)</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-orange-400 p-1 mb-4 shadow-xl shadow-orange-500/30 overflow-hidden">
                <img
                  src="/murtaza-wazir.jpg"
                  alt="Murtaza Wazir"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
              <h4 className="font-bold text-white text-base">Murtaza Wazir</h4>
              <p className="text-xs text-orange-400 font-semibold mt-0.5">Final Year Project Lead</p>
              <div className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/15">
                Dept. of Computer Science & IT
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
