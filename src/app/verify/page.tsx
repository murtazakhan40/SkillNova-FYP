import React from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroParticles } from "@/components/animations/HeroParticles";
import { 
  Award, 
  CheckCircle2, 
  Search, 
  Calendar, 
  User, 
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Download,
  AlertTriangle,
  QrCode as QrIcon
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
  const currentUser = await getCurrentUser();

  let certificate = null;
  let qrCodeDataUrl = "";

  if (searchCode) {
    certificate = await db.certificate.findUnique({
      where: { certificateCode: searchCode },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        course: {
          include: { instructor: true },
        },
      },
    });

    if (certificate) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verifyUrl = `${baseUrl.replace(/\/$/, "")}/verify?code=${encodeURIComponent(certificate.certificateCode)}`;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
          width: 160,
          margin: 1,
          color: {
            dark: "#0B1B3D",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "M",
        });
      } catch (e) {
        console.error("QR Code generation error:", e);
      }
    }
  }

  const isOwner = currentUser && certificate && currentUser.id === certificate.user.id;
  const canDownload = isOwner || (currentUser && (currentUser.role === "ADMIN" || currentUser.id === certificate?.course.instructorId));

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-[#0B1B3D] text-white py-16 border-b border-slate-800 relative overflow-hidden">
        <HeroParticles particleCount={20} />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#FF6B00]/10 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#132752] border border-[#1B376F] text-[#FF8533] mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Cryptographic Credential Verification</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight">
            Verify SkillNova Academy Certificate
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed font-normal">
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
                  placeholder="e.g. SN-2026-A8F2-7E91-C4B3"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-[#132752] text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-xs font-heading font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md btn-lift shrink-0 cursor-pointer"
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
                SN-2026-X89J21
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* Verification Result Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full">
        {searchCode ? (
          certificate ? (
            certificate.isRevoked ? (
              /* REVOKED CERTIFICATE DISPLAY */
              <div className="bg-white rounded-3xl border-2 border-red-500/40 p-8 sm:p-12 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/10 rounded-bl-full pointer-events-none" />

                <div className="flex items-center gap-3 text-red-600 font-bold text-sm mb-6 pb-6 border-b border-red-100">
                  <ShieldAlert className="w-6 h-6 shrink-0" />
                  <span>Credential Revocation Notice: This Certificate Has Been Revoked</span>
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
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Course Curriculum
                      </span>
                      <h3 className="text-lg font-bold text-slate-700 mt-0.5">
                        {certificate.course.title}
                      </h3>
                    </div>

                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Revocation Reason:</span>
                      </div>
                      <p>{certificate.revokedReason || "Administrative or academic review action."}</p>
                      {certificate.revokedAt && (
                        <div className="text-[11px] text-red-600 pt-1">
                          Revoked on: {formatDate(certificate.revokedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-2xl border border-red-900/50 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div className="font-mono text-xs font-bold text-red-400 line-through">
                      {certificate.certificateCode}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                      SkillNova Academic Registry
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                        Invalidated / Revoked
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ACTIVE VALID VERIFIED CERTIFICATE DISPLAY */
              <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-8 sm:p-12 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <span>Officially Verified & Authenticated Credential</span>
                  </div>

                  {canDownload && (
                    <a
                      href={`/api/certificates/${encodeURIComponent(certificate.certificateCode)}/download`}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Download Official PDF</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Recipient Student
                      </span>
                      <h2 className="text-2xl font-extrabold text-[#0B1B3D] mt-0.5">
                        {certificate.user.name}
                      </h2>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Course Curriculum
                      </span>
                      <h3 className="text-lg font-bold text-[#FF6B00] mt-0.5">
                        {certificate.course.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Issued: {formatDate(certificate.issuedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Instructor: {certificate.course.instructor.name}</span>
                      </div>
                    </div>

                    {/* Grade Section: Only when verified and available */}
                    {certificate.grade !== null && certificate.grade !== undefined && (
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-900">
                          <Award className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>Verified Assessment Grade: {Math.round(certificate.grade)}% (Passed)</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Digital Certificate Badge Seal & QR Code */}
                  <div className="bg-[#0B1B3D] text-white p-6 rounded-2xl border border-slate-800 text-center space-y-3 flex flex-col items-center">
                    {qrCodeDataUrl ? (
                      <div className="bg-white p-2 rounded-xl shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrCodeDataUrl}
                          alt={`QR Code verification for ${certificate.certificateCode}`}
                          className="w-24 h-24 rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] flex items-center justify-center mx-auto shadow-inner">
                        <Award className="w-8 h-8" />
                      </div>
                    )}

                    <div className="font-mono text-xs font-bold text-[#FF6B00] tracking-wider">
                      {certificate.certificateCode}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                      SkillNova Academic Registry
                    </div>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Tamper-Proof Record
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0B1B3D]">
                Certificate Not Found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                No verified certificate found with code &ldquo;{searchCode}&rdquo;. Please verify the identifier and try again.
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
