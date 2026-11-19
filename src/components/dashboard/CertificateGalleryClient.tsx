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
  Download,
  Info,
  Share2,
  Check,
  Star
} from "lucide-react";
import { CopyCodeButton } from "@/components/dashboard/CopyCodeButton";
import { SkillNovaLogo } from "@/components/brand/SkillNovaLogo";
import { SkillNovaCertificate } from "@/components/certificate/SkillNovaCertificate";

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
  const [copiedLinkCode, setCopiedLinkCode] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://skillnovaacademy.com";
    const url = `${origin}/verify?code=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkCode(code);
      setTimeout(() => setCopiedLinkCode(null), 2500);
    } catch {
      // Fallback
    }
  };

  const getLinkedInShareUrl = (cert: CertificateData) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://skillnovaacademy.com";
    const verifyUrl = `${origin}/verify?code=${encodeURIComponent(cert.certificateCode)}`;
    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      cert.course.title
    )}&organizationName=SkillNova+Academy&issueYear=2026&certUrl=${encodeURIComponent(
      verifyUrl
    )}&certId=${encodeURIComponent(cert.certificateCode)}`;
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1B3D] via-[#132752] to-[#1E3A8A] text-white shadow-lg flex items-center justify-between border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="text-xs font-bold text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-orange-400" />
              <span>Earned Credentials</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black mt-1 font-heading">{certificates.length}</div>
            <div className="text-[11px] text-slate-300 mt-1">
              Verified certificates on official record
            </div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-orange-400 border border-white/10 shadow-inner">
            <Award className="w-8 h-8" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verification Ledger</span>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#0B1B3D] mt-1 font-heading">
              Cryptographic Registry
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              256-bit instant QR validation
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#FF6B00]" />
              <span>In-Progress Milestones</span>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#FF6B00] mt-1 font-heading">
              {inProgressCourses.length} Track{inProgressCourses.length === 1 ? "" : "s"} In Progress
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Complete modules to unlock next diploma
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100 shadow-xs">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Earned Certificates Grid */}
      <div id="certificates" className="scroll-mt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B1B3D] flex items-center gap-2 font-heading">
              <Award className="w-6 h-6 text-[#FF6B00]" />
              <span>Official Verified Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Conferred upon achieving 100% curriculum completion and passing benchmark evaluations.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {certificates.length} Certificate{certificates.length === 1 ? "" : "s"}
          </span>
        </div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((cert) => {
              const isHighHonors = cert.grade !== null && cert.grade !== undefined && cert.grade >= 90;
              const isHonors = cert.grade !== null && cert.grade !== undefined && cert.grade >= 80;

              return (
                <div
                  key={cert.id}
                  className={`bg-white rounded-3xl border-2 ${
                    cert.isRevoked ? "border-red-400/50" : "border-amber-400/30"
                  } p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group`}
                >
                  {/* Decorative Subtle Corner Gradient */}
                  <div
                    className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl ${
                      cert.isRevoked
                        ? "from-red-500/10 via-red-500/5"
                        : "from-amber-400/15 via-orange-500/5"
                    } to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500`}
                  />

                  <div>
                    {/* Seal and Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl ${
                            cert.isRevoked
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-gradient-to-br from-amber-100 to-orange-100 text-[#0B1B3D] border border-amber-300"
                          } flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          {cert.isRevoked ? (
                            <ShieldAlert className="w-6 h-6" />
                          ) : (
                            <Award className="w-6 h-6 text-[#FF6B00]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                cert.isRevoked
                                  ? "text-red-700 bg-red-50 border-red-200"
                                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
                              } px-2 py-0.5 rounded border`}
                            >
                              {cert.isRevoked ? "Revoked Credential" : "Verified Credential"}
                            </span>
                            {isHighHonors && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded inline-flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
                                <span>High Distinction</span>
                              </span>
                            )}
                            {!isHighHonors && isHonors && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-orange-900 bg-orange-100/80 border border-orange-300 px-2 py-0.5 rounded">
                                Honors
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Issued {cert.issuedAt}
                          </div>
                        </div>
                      </div>

                      <SkillNovaLogo variant="dark" size="sm" iconOnly />
                    </div>

                    {/* Course Title */}
                    <h3 className="text-lg font-black text-[#0B1B3D] mb-1 leading-snug font-heading group-hover:text-[#FF6B00] transition-colors">
                      {cert.course.title}
                    </h3>
                    <div className="text-xs text-slate-500 mb-3">
                      Awarded to <span className="font-bold text-[#0B1B3D]">{cert.studentName}</span> •
                      Faculty: {cert.course.instructorName}
                    </div>

                    {/* Verified Grade Badge */}
                    {cert.grade !== null && cert.grade !== undefined && !cert.isRevoked && (
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-950">
                          <Award className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>Verified Assessment Grade: {Math.round(cert.grade)}%</span>
                        </span>
                      </div>
                    )}

                    {/* Credential Code Box with Copy Link Action */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Verification Serial Code
                        </span>
                        <CopyCodeButton code={cert.certificateCode} />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(cert.certificateCode)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#0B1B3D] px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 transition-colors shadow-2xs"
                        >
                          {copiedLinkCode === cert.certificateCode ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

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
                  </div>

                  {/* Actions Row */}
                  <div className="pt-5 border-t border-slate-100 mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/verify?code=${encodeURIComponent(cert.certificateCode)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B1B3D] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Public Registry</span>
                      </Link>

                      {!cert.isRevoked && (
                        <a
                          href={getLinkedInShareUrl(cert)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0077B5] hover:text-[#005E93] transition-colors"
                        >
                          <span>+ Add to LinkedIn</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!cert.isRevoked && (
                        <a
                          href={`/api/certificates/${encodeURIComponent(cert.certificateCode)}/download`}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>PDF</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedCert(cert)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors shadow-xs cursor-pointer group-hover:bg-[#FF6B00]"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400 group-hover:text-white" />
                        <span>View Diploma</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white shadow-md btn-lift"
            >
              Resume Coursework
            </Link>
          </div>
        )}
      </div>

      {/* Progressing Towards Future Certificates */}
      <div id="certification-status" className="scroll-mt-6">
        {inProgressCourses.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#0B1B3D] flex items-center gap-2 font-heading">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span>Upcoming Certificate Qualifications (Status)</span>
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
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#0B1B3D]">All Enrolled Courses Certified or Ready</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              You currently have no active courses pending certification. Enroll in new technical courses to earn more accredited certificates!
            </p>
            <div className="mt-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1B3D] text-white hover:bg-[#132752] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Explore Course Catalog</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Certificate Information & Academic Ledger Details */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 text-[#0B1B3D]">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading">
              About SkillNova Academic Certifications & Verification Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Essential information on credential validity, verification standards, and portfolio sharing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B1B3D]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cryptographic Integrity</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every credential is generated with a unique 48-bit cryptographic code (e.g., <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono text-[#0B1B3D]">SN-2026-XXXX-XXXX</code>) and a public QR code that anyone or prospective employers can verify instantly on the public registry.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B1B3D]">
              <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>Completion Standards</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Certificates are automatically awarded when you achieve 100% curriculum completion and score at least 70% on course benchmark quizzes and faculty evaluations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B1B3D]">
              <Download className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Sharing & Portfolio Exports</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              You can download high-resolution vector PDF certificates, print physical diplomas, or copy your public verification link to add directly to your LinkedIn profile, CV, and GitHub repositories.
            </p>
          </div>
        </div>
      </div>

      {/* Certificate Modal Viewer */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Controls */}
            <div className="bg-[#0B1B3D] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Award className="w-4 h-4 text-[#FF6B00]" />
                <span>SkillNova Verified Certificate • Official Credential Preview</span>
              </div>
              <div className="flex items-center gap-2">
                {!selectedCert.isRevoked && (
                  <a
                    href={getLinkedInShareUrl(selectedCert)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077B5] hover:bg-[#005E93] text-xs font-bold text-white transition-colors"
                  >
                    <span>+ Add to LinkedIn</span>
                  </a>
                )}
                {!selectedCert.isRevoked && (
                  <a
                    href={`/api/certificates/${encodeURIComponent(selectedCert.certificateCode)}/download`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#EA580C] text-xs font-bold text-white transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Certificate Canvas */}
            <div className="p-4 sm:p-6 bg-slate-100/60 print-certificate-container">
              <SkillNovaCertificate
                studentName={selectedCert.studentName}
                courseTitle={selectedCert.course.title}
                issuedAt={selectedCert.issuedAt}
                certificateCode={selectedCert.certificateCode}
                instructorName={selectedCert.course.instructorName}
                grade={selectedCert.grade}
                qrCodeDataUrl={selectedCert.qrCodeDataUrl}
                isRevoked={selectedCert.isRevoked}
                revokedReason={selectedCert.revokedReason}
                academyName="SKILLNOVA ACADEMY"
                tagline="THE DIGITAL LEARNING PLATFORM"
                signerTitle="FOUNDER & CEO"
                signerName="Murtaza Wazir"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
