import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Award, 
  CheckCircle2, 
  Search, 
  Calendar, 
  User, 
  ShieldCheck,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface VerifyPageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

export default async function VerifyCertificatePage({
  searchParams,
}: VerifyPageProps) {
  const params = await searchParams;
  const searchCode = params.code?.trim().toUpperCase();

  let certificate = null;
  if (searchCode) {
    certificate = await db.certificate.findUnique({
      where: { certificateCode: searchCode },
      include: {
        user: true,
        course: {
          include: { instructor: true },
        },
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-[#0B1B3D] text-white py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#132752] border border-[#1B376F] text-[#FF6B00] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cryptographic Credential Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Verify SkillNova Academy Certificate
          </h1>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Validate the authenticity of completion certificates issued by SkillNova Academy.
            Enter the unique credential identifier below.
          </p>

          {/* Search Box */}
          <form method="GET" action="/verify" className="mt-8 max-w-md mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="code"
                  defaultValue={searchCode || ""}
                  placeholder="e.g. SN-2026-X89J21"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-[#132752] text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md transition-all shrink-0"
              >
                Verify
              </button>
            </div>
            {/* Quick Demo Code Suggestion */}
            <div className="text-[11px] text-slate-400 mt-2 text-left flex items-center justify-between">
              <span>Try test code:</span>
              <Link
                href="/verify?code=SN-2026-X89J21"
                className="font-mono text-[#FF6B00] hover:underline"
              >
                SN-2026-X89J21 (Click to Test)
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* Verification Result Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full">
        {searchCode ? (
          certificate ? (
            <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-8 sm:p-12 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-3 text-emerald-600 font-bold text-sm mb-6 pb-6 border-b border-slate-100">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <span>Officially Verified & Authenticated Credential</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recipient Student
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#0B1B3D] mt-0.5">
                      {certificate.user.name}
                    </h2>
                    <span className="text-xs text-slate-500">
                      {certificate.user.email}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Course Curriculum
                    </span>
                    <h3 className="text-lg font-bold text-[#FF6B00] mt-0.5">
                      {certificate.course.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-600 pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Issued: {formatDate(certificate.issuedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Instructor: {certificate.course.instructor.name}</span>
                    </div>
                  </div>
                </div>

                {/* Digital Certificate Badge Seal */}
                <div className="bg-[#0B1B3D] text-white p-6 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] flex items-center justify-center mx-auto shadow-inner">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="font-mono text-xs font-bold text-[#FF6B00]">
                    {certificate.certificateCode}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                    SkillNova Academic Board Verification
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Tamper-Proof Record
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0B1B3D]">
                Certificate Not Found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                No verified certificate found with code &ldquo;{searchCode}&rdquo;. Please verify the code and try again.
              </p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-lg mx-auto space-y-4">
            <Award className="w-12 h-12 text-[#FF6B00] mx-auto" />
            <h3 className="text-lg font-bold text-[#0B1B3D]">
              Certificate Verification System
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every course graduate receives a unique cryptographic certificate identifier that employers and universities can independently verify.
            </p>
            <Link
              href="/verify?code=SN-2026-X89J21"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6B00] hover:underline"
            >
              <span>Click here to test sample credential SN-2026-X89J21</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
