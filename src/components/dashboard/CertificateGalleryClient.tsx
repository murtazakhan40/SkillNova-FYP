"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Award, 
  ExternalLink, 
  Printer, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert,
  BookOpen,
  Download
} from "lucide-react";
import { CopyCodeButton } from "@/components/dashboard/CopyCodeButton";
import { SkillNovaLogo } from "@/components/brand/SkillNovaLogo";

export interface CertificateData {
  id: string;
  certificateCode: string;
  issuedAt: string;
  studentName: string;
  grade?: number | null;
  isRevoked?: boolean;
  revokedReason?: string | null;
  qrCodeDataUrl?: string;
  course: {
    id: string;
    title: string;
    slug: string;
    categoryName: string;
    instructorName: string;
    instructorHeadline: string | null;
  };
}

export interface InProgressCourseData {
  id: string;
  title: string;
  slug: string;
  progress: number;
  remainingLessons: number;
}

interface CertificateGalleryClientProps {
  certificates: CertificateData[];
  inProgressCourses: InProgressCourseData[];
}

export function CertificateGalleryClient({
  certificates,
  inProgressCourses,
}: CertificateGalleryClientProps) {
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B1B3D] to-[#1E3A8A] text-white shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-orange-300 uppercase tracking-wider">
              Earned Credentials
            </div>
            <div className="text-3xl font-black mt-1">{certificates.length}</div>
            <div className="text-[11px] text-slate-300 mt-1">
              Verified certificates on record
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-orange-400">
            <Award className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verification Ledger
            </div>
            <div className="text-sm font-extrabold text-[#0B1B3D] mt-1">
              Cryptographic Registry
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Live QR code verification
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In-Progress Milestones
            </div>
            <div className="text-sm font-extrabold text-[#FF6B00] mt-1">
              {inProgressCourses.length} Track{inProgressCourses.length === 1 ? "" : "s"} In Progress
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Complete modules to unlock
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Earned Certificates Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0B1B3D] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF6B00]" />
              <span>Official Verified Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Awarded upon achieving 100% curriculum completion and passing benchmark assessments.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {certificates.length} Certificate{certificates.length === 1 ? "" : "s"}
          </span>
        </div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className={`bg-white rounded-3xl border-2 ${
                  cert.isRevoked ? "border-red-400/50" : "border-emerald-500/25"
                } p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Decorative Top Pattern */}
                <div
                  className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${
                    cert.isRevoked
                      ? "from-red-500/10 via-red-500/5"
                      : "from-emerald-500/10 via-emerald-500/5"
                  } to-transparent rounded-bl-full pointer-events-none`}
                />

                <div>
                  {/* Seal and Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl ${
                          cert.isRevoked
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-emerald-100/80 text-emerald-800 border border-emerald-200"
                        } flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        {cert.isRevoked ? (
                          <ShieldAlert className="w-6 h-6" />
                        ) : (
                          <Award className="w-6 h-6 text-emerald-700" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            cert.isRevoked
                              ? "text-red-700 bg-red-50 border-red-200"
                              : "text-emerald-700 bg-emerald-50 border-emerald-200"
                          } px-2 py-0.5 rounded border`}
                        >
                          {cert.isRevoked ? "Revoked Credential" : "Verified Credential"}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Issued {cert.issuedAt}
                        </div>
                      </div>
                    </div>

                    <SkillNovaLogo variant="dark" size="sm" iconOnly />
                  </div>

                  {/* Course Title */}
                  <h3 className="text-lg font-extrabold text-[#0B1B3D] mb-1.5 leading-snug">
                    {cert.course.title}
                  </h3>
                  <div className="text-xs text-slate-500 mb-3">
                    Awarded to <span className="font-bold text-[#0B1B3D]">{cert.studentName}</span> •
                    Instructor: {cert.course.instructorName}
                  </div>

                  {/* Verified Grade Badge (Only when verified and available) */}
                  {cert.grade !== null && cert.grade !== undefined && !cert.isRevoked && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-900">
                        <Award className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Verified Assessment Grade: {Math.round(cert.grade)}%</span>
                      </span>
                    </div>
                  )}

                  {/* Credential Code Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Verification Code
                      </span>
                      <CopyCodeButton code={cert.certificateCode} />
                    </div>

                    {cert.isRevoked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Revoked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tamper-Proof</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-5 border-t border-slate-100 mt-5 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/verify?code=${encodeURIComponent(cert.certificateCode)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B1B3D] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Public Verification</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    {!cert.isRevoked && (
                      <a
                        href={`/api/certificates/${encodeURIComponent(cert.certificateCode)}/download`}
                        download
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>PDF</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedCert(cert)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-xs cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-orange-400" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-lg mx-auto">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0B1B3D]">No Certificates Earned Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Complete your coursework modules and score at least 70% on course assessments to earn your official digital certificate.
            </p>
            <Link
              href="/dashboard/student/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white"
            >
              Resume Coursework
            </Link>
          </div>
        )}
      </div>

      {/* Progressing Towards Future Certificates */}
      {inProgressCourses.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>Upcoming Certificate Qualifications</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Certificates are automatically issued the moment you reach 100% course completion and pass assessments.
            </p>
          </div>

          <div className="space-y-4">
            {inProgressCourses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B1B3D]">{c.title}</span>
                    <span className="font-extrabold text-[#FF6B00]">{c.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-2 rounded-full"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 pt-0.5">
                    {c.remainingLessons} remaining lesson{c.remainingLessons === 1 ? "" : "s"} until curriculum completion
                  </div>
                </div>

                <Link
                  href={`/courses/${c.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shrink-0 transition-colors"
                >
                  <span>Continue Track</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Modal Viewer */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Controls */}
            <div className="bg-[#0B1B3D] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Award className="w-4 h-4 text-[#FF6B00]" />
                <span>SkillNova Verified Certificate • Credential Viewer</span>
              </div>
              <div className="flex items-center gap-2">
                {!selectedCert.isRevoked && (
                  <a
                    href={`/api/certificates/${encodeURIComponent(selectedCert.certificateCode)}/download`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#EA580C] text-xs font-bold text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Certificate Canvas */}
            <div className="p-8 sm:p-12 bg-radial from-white via-amber-50/20 to-slate-50 text-center relative border-8 border-double border-[#0B1B3D]/10 m-4 rounded-2xl">
              {/* Corner Accents */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#FF6B00]" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#FF6B00]" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#FF6B00]" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#FF6B00]" />

              <div className="space-y-6">
                <div className="flex justify-center">
                  <SkillNovaLogo variant="dark" size="md" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#FF6B00]">
                    Official Academic Certificate of Mastery
                  </span>
                  <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                    This certifies that
                  </h2>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-[#0B1B3D] border-b-2 border-[#0B1B3D]/10 pb-2 max-w-md mx-auto">
                  {selectedCert.studentName}
                </div>

                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  has demonstrated rigorous technical proficiency and successfully completed all
                  academic coursework, laboratory exercises, and assessments for
                </p>

                <div className="text-lg sm:text-xl font-extrabold text-[#0B1B3D] max-w-xl mx-auto">
                  {selectedCert.course.title}
                </div>

                {/* Grade display in modal only when available */}
                {selectedCert.grade !== null && selectedCert.grade !== undefined && !selectedCert.isRevoked && (
                  <div className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-900">
                    Verified Assessment Grade: {Math.round(selectedCert.grade)}% (Passed)
                  </div>
                )}

                {/* Signatures & Verification Details */}
                <div className="pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end max-w-xl mx-auto">
                  <div>
                    <div className="text-sm font-semibold text-slate-800 border-b border-slate-300 pb-1">
                      {selectedCert.course.instructorName}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                      Lead Faculty Instructor
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-center">
                    {selectedCert.qrCodeDataUrl ? (
                      <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedCert.qrCodeDataUrl}
                          alt="Verification QR Code"
                          className="w-14 h-14 rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full border-2 border-[#FF6B00] bg-orange-50 flex items-center justify-center text-[#FF6B00] shadow-sm">
                        <Award className="w-8 h-8" />
                      </div>
                    )}
                    <span className="text-[9px] uppercase font-bold text-[#FF6B00] mt-1 tracking-wider">
                      Verified QR
                    </span>
                  </div>

                  <div>
                    <div className="font-mono text-xs font-bold text-slate-800 border-b border-slate-300 pb-1">
                      {selectedCert.certificateCode}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                      Issued: {selectedCert.issuedAt}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-2">
                  Verify credential authenticity online at:{" "}
                  <Link
                    href={`/verify?code=${encodeURIComponent(selectedCert.certificateCode)}`}
                    className="font-mono text-slate-600 hover:text-[#FF6B00] underline"
                  >
                    skillnova.edu/verify?code={selectedCert.certificateCode}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
