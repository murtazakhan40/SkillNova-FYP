import React from "react";
import { ShieldCheck, Award, Star } from "lucide-react";

export interface SkillNovaCertificateProps {
  studentName: string;
  courseTitle: string;
  issuedAt: string | Date;
  certificateCode: string;
  instructorName?: string;
  grade?: number | null;
  qrCodeDataUrl?: string;
  isRevoked?: boolean;
  revokedReason?: string | null;
  certificateType?: string; // e.g. "ACHIEVEMENT" | "COMPLETION" | "APPRECIATION"
  academyName?: string;
  tagline?: string;
  signerTitle?: string;
  signerName?: string;
}

export function SkillNovaCertificate({
  studentName,
  courseTitle,
  issuedAt,
  certificateCode,
  instructorName = "Lead Faculty Director",
  grade,
  qrCodeDataUrl,
  isRevoked = false,
  revokedReason,
  certificateType = "ACHIEVEMENT",
  academyName = "SKILLNOVA ACADEMY",
  tagline = "THE DIGITAL LEARNING PLATFORM",
  signerTitle = "FOUNDER & CEO",
  signerName = "Murtaza Wazir",
}: SkillNovaCertificateProps) {
  const formattedDate =
    typeof issuedAt === "string"
      ? issuedAt
      : new Date(issuedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

  // Calculate distinction tier based on grade
  const isHighHonors = grade !== null && grade !== undefined && grade >= 90;
  const isHonors = grade !== null && grade !== undefined && grade >= 80;

  return (
    <div
      className={`relative w-full aspect-[1.414/1] bg-gradient-to-b from-[#FDFAF5] via-[#FFFDF9] to-[#FBF7EE] text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-amber-900/20 select-none flex flex-col justify-between p-6 sm:p-10 lg:p-12 transition-all print:p-8 print:shadow-none print:border-none ${
        isRevoked ? "filter grayscale contrast-125 opacity-75" : ""
      }`}
      style={{
        boxShadow:
          "0 30px 70px -15px rgba(11, 27, 61, 0.25), 0 0 0 1px rgba(180, 83, 9, 0.15), inset 0 0 80px rgba(254, 243, 199, 0.35)",
      }}
    >
      {/* =========================================================================
          1. BACKGROUND SECURITY WATERMARK & GUILLOCHÉ PATTERN
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.035]">
        {/* Intricate Classical Guilloché Lattice Background */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 707"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="guillochePattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="28" fill="none" stroke="#0B1B3D" strokeWidth="0.8" />
              <circle cx="30" cy="30" r="20" fill="none" stroke="#FF6B00" strokeWidth="0.6" />
              <circle cx="30" cy="30" r="12" fill="none" stroke="#0B1B3D" strokeWidth="0.4" />
              <path d="M 0 30 Q 30 0 60 30 Q 30 60 0 30" fill="none" stroke="#0B1B3D" strokeWidth="0.5" />
              <path d="M 30 0 Q 60 30 30 60 Q 0 30 30 0" fill="none" stroke="#FF6B00" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guillochePattern)" />
        </svg>

        {/* Grand Center Emblem Watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-[500px] h-[500px] text-[#0B1B3D]" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="100,20 120,70 175,70 130,105 148,160 100,128 52,160 70,105 25,70 80,70" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="100" cy="100" r="35" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          2. DOUBLE LUXURY SECURITY BORDER WITH CORNER FLORETS
          ========================================================================= */}
      {/* Outer Border */}
      <div className="absolute inset-3 sm:inset-5 border-2 border-[#0B1B3D]/80 rounded-xl sm:rounded-2xl pointer-events-none" />
      {/* Inner Accent Hairline Border */}
      <div className="absolute inset-4 sm:inset-6 border border-[#FF6B00]/70 rounded-lg sm:rounded-xl pointer-events-none" />

      {/* Classical Corner Filigree Florets */}
      <svg className="absolute top-4 left-4 w-7 h-7 text-[#FF6B00] pointer-events-none opacity-80" viewBox="0 0 40 40" fill="none">
        <path d="M 4 4 L 28 4 C 18 8 8 18 4 28 Z" fill="#0B1B3D" />
        <circle cx="12" cy="12" r="3" fill="#FF6B00" />
        <path d="M 2 2 L 36 2 L 36 6 L 6 6 L 6 36 L 2 36 Z" fill="#FF6B00" />
      </svg>
      <svg className="absolute top-4 right-4 w-7 h-7 text-[#FF6B00] pointer-events-none opacity-80 rotate-90" viewBox="0 0 40 40" fill="none">
        <path d="M 4 4 L 28 4 C 18 8 8 18 4 28 Z" fill="#0B1B3D" />
        <circle cx="12" cy="12" r="3" fill="#FF6B00" />
        <path d="M 2 2 L 36 2 L 36 6 L 6 6 L 6 36 L 2 36 Z" fill="#FF6B00" />
      </svg>
      <svg className="absolute bottom-4 left-4 w-7 h-7 text-[#FF6B00] pointer-events-none opacity-80 -rotate-90" viewBox="0 0 40 40" fill="none">
        <path d="M 4 4 L 28 4 C 18 8 8 18 4 28 Z" fill="#0B1B3D" />
        <circle cx="12" cy="12" r="3" fill="#FF6B00" />
        <path d="M 2 2 L 36 2 L 36 6 L 6 6 L 6 36 L 2 36 Z" fill="#FF6B00" />
      </svg>
      <svg className="absolute bottom-4 right-4 w-7 h-7 text-[#FF6B00] pointer-events-none opacity-80 rotate-180" viewBox="0 0 40 40" fill="none">
        <path d="M 4 4 L 28 4 C 18 8 8 18 4 28 Z" fill="#0B1B3D" />
        <circle cx="12" cy="12" r="3" fill="#FF6B00" />
        <path d="M 2 2 L 36 2 L 36 6 L 6 6 L 6 36 L 2 36 Z" fill="#FF6B00" />
      </svg>

      {/* Flowing Modern Geometric Wave Ribbons in Corners */}
      <svg
        className="absolute top-0 left-0 w-[38%] max-w-[340px] h-auto pointer-events-none z-0"
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="certOrangeWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="35%" stopColor="#FF6B00" />
            <stop offset="70%" stopColor="#FF8533" />
            <stop offset="100%" stopColor="#FFA566" />
          </linearGradient>
          <linearGradient id="certNavyWave" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#060E1E" />
            <stop offset="60%" stopColor="#0B1B3D" />
            <stop offset="100%" stopColor="#132752" />
          </linearGradient>
        </defs>
        <path d="M0 0 H320 C240 35 195 95 150 150 C110 195 55 218 0 220 V0 Z" fill="url(#certNavyWave)" />
        <path d="M0 170 C65 165 120 145 160 115 C210 75 265 30 355 8 L365 15 C275 40 218 80 167 122 C125 155 68 180 0 182 V170 Z" fill="url(#certOrangeWave)" />
        <path d="M0 195 C55 190 100 165 135 132 C180 92 235 50 315 22" stroke="#FFA566" strokeWidth="2" fill="none" opacity="0.8" />
      </svg>

      {/* Bottom Right Wave */}
      <svg
        className="absolute bottom-0 right-0 w-[22%] max-w-[190px] h-auto pointer-events-none z-0 rotate-180"
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path d="M0 0 H320 C240 35 195 95 150 150 C110 195 55 218 0 220 V0 Z" fill="url(#certNavyWave)" />
        <path d="M0 170 C65 165 120 145 160 115 C210 75 265 30 355 8 L365 15 C275 40 218 80 167 122 C125 155 68 180 0 182 V170 Z" fill="url(#certOrangeWave)" />
      </svg>

      {/* =========================================================================
          3. TOP HEADER ROW: EMBLEM IDENTITY & AUTHENTIC FOIL ROSETTE MEDALLION
          ========================================================================= */}
      <div className="relative z-10 flex items-start justify-between w-full">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 pt-2 pl-2">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#0B1B3D] border-2 border-[#FF6B00] flex items-center justify-center shadow-lg shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L20 6.5V17.5L12 22L4 17.5V6.5L12 2Z"
                stroke="#FF6B00"
                strokeWidth="2"
                fill="#060E1E"
              />
              <path
                d="M12 7V17M7 9.5L12 12L17 9.5"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-heading font-black text-sm sm:text-lg lg:text-xl tracking-wider text-white drop-shadow-md">
              {academyName}
            </div>
            <div className="text-[9px] sm:text-[11px] font-black tracking-[0.22em] text-[#FFA566] uppercase drop-shadow-xs">
              {tagline}
            </div>
            <div className="text-[8px] sm:text-[9px] font-bold text-slate-300 tracking-wider uppercase mt-0.5">
              Accredited Technical Education
            </div>
          </div>
        </div>

        {/* Authentic Embossed 3D Gold & Orange Medallion with Hanging Satin Ribbons */}
        <div className="relative shrink-0 -mr-1 -mt-1 sm:mr-1 sm:mt-1">
          {/* Hanging Satin Ribbon Tails */}
          <div className="absolute top-16 sm:top-22 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 z-0 pointer-events-none">
            {/* Left Navy Ribbon Tail */}
            <svg className="w-5 h-9 sm:w-7 sm:h-12 drop-shadow-md" viewBox="0 0 24 48" fill="none">
              <path d="M 0 0 L 24 0 L 24 44 L 12 36 L 0 44 Z" fill="#0B1B3D" stroke="#060E1E" strokeWidth="1" />
              <path d="M 6 0 L 18 0 L 18 38 L 12 34 L 6 38 Z" fill="#FF6B00" opacity="0.6" />
            </svg>
            {/* Right Orange Ribbon Tail */}
            <svg className="w-5 h-9 sm:w-7 sm:h-12 drop-shadow-md" viewBox="0 0 24 48" fill="none">
              <path d="M 0 0 L 24 0 L 24 44 L 12 36 L 0 44 Z" fill="#FF6B00" stroke="#EA580C" strokeWidth="1" />
              <path d="M 6 0 L 18 0 L 18 38 L 12 34 L 6 38 Z" fill="#FFA566" opacity="0.8" />
            </svg>
          </div>

          {/* Medallion Rosette */}
          <div className="relative z-10 w-22 h-22 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center drop-shadow-xl">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="goldMedalFoil" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFF3B8" />
                  <stop offset="25%" stopColor="#F59E0B" />
                  <stop offset="55%" stopColor="#D97706" />
                  <stop offset="85%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#78350F" />
                </radialGradient>
                <radialGradient id="orangeCoreFoil" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="70%" stopColor="#0B1B3D" />
                  <stop offset="100%" stopColor="#060E1E" />
                </radialGradient>
              </defs>

              {/* 24-point Scalloped Starburst Rosette */}
              <path
                d="
                  M 50,2 
                  L 56,8 L 64,5 L 68,12 L 77,12 L 78,21 L 87,23 L 85,32 L 93,37 L 88,44 L 95,50 
                  L 88,56 L 93,63 L 85,68 L 87,77 L 78,79 L 77,88 L 68,88 L 64,95 L 56,92 
                  L 50,98 
                  L 44,92 L 36,95 L 32,88 L 23,88 L 22,79 L 13,77 L 15,68 L 7,63 L 12,56 
                  L 5,50 
                  L 12,44 L 7,37 L 15,32 L 13,23 L 22,21 L 23,12 L 32,12 L 36,5 L 44,8 
                  Z
                "
                fill="url(#goldMedalFoil)"
                stroke="#FDE68A"
                strokeWidth="1.2"
              />

              {/* Concentric Embossed Rims */}
              <circle cx="50" cy="50" r="39" stroke="#78350F" strokeWidth="1" />
              <circle cx="50" cy="50" r="36" stroke="#FEF3C7" strokeWidth="0.8" strokeDasharray="1.5 2" />
              <circle cx="50" cy="50" r="33" fill="url(#orangeCoreFoil)" stroke="#FF6B00" strokeWidth="1.5" />
            </svg>

            {/* Medallion Inner Star Crest & Text */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center leading-tight select-none">
              <div className="flex items-center gap-0.5 text-amber-300 mb-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
              </div>
              <span className="text-[7.5px] sm:text-[9.5px] font-black tracking-widest text-amber-100 uppercase">
                EXCELLENCE
              </span>
              <span className="text-[8px] sm:text-[10px] font-black tracking-wider text-orange-400 uppercase">
                CERTIFIED
              </span>
              <span className="text-[6.5px] sm:text-[8px] font-black tracking-widest text-amber-300 uppercase">
                SKILLNOVA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. CENTER BODY: RECIPIENT, COURSE & HONORS
          ========================================================================= */}
      <div className="relative z-10 text-center my-auto py-2">
        {/* Invalidation Alert if Revoked */}
        {isRevoked && (
          <div className="mb-3 inline-block bg-red-600 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-2 rounded-full shadow-lg border-2 border-white animate-pulse">
            REVOKED CREDENTIAL • {revokedReason || "Academic Invalidation"}
          </div>
        )}

        {/* Certificate Title */}
        <div className="font-cert-title text-4xl sm:text-6xl lg:text-7xl font-bold text-[#0B1B3D] tracking-tight leading-none drop-shadow-xs">
          Certificate
        </div>

        {/* Tracked Uppercase Subtitle */}
        <div className="inline-flex flex-col items-center mt-1 sm:mt-2 mb-2 sm:mb-3">
          <div className="font-heading text-xs sm:text-sm lg:text-base font-black tracking-[0.34em] text-[#0B1B3D] uppercase">
            OF {certificateType}
          </div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-6 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-[#FF6B00]" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#FF6B00]" />
            <span className="w-6 sm:w-12 h-[1px] bg-gradient-to-l from-transparent to-[#FF6B00]" />
          </div>
        </div>

        {/* Conferred Clause */}
        <div className="text-[10px] sm:text-xs lg:text-[13px] font-extrabold tracking-[0.28em] text-slate-700 uppercase mt-1 mb-1.5 sm:mb-2">
          THIS OFFICIAL CREDENTIAL IS PROUDLY CONFERRED UPON
        </div>

        {/* Recipient Student Name in Grand Roman Typography */}
        <div className="font-cert-title text-3xl sm:text-5xl lg:text-6xl font-black tracking-wider uppercase text-[#0B1B3D] my-1.5 sm:my-2 px-4 drop-shadow-xs">
          {studentName}
        </div>

        {/* Regal Ornamental Fleur-de-lis / Diamond Divider */}
        <div className="flex items-center justify-center gap-2 max-w-xs sm:max-w-md mx-auto my-2">
          <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#FF6B00] to-[#FF6B00]" />
          <span className="text-[#FF6B00] text-sm leading-none font-black">❖</span>
          <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-[#FF6B00] to-[#FF6B00]" />
        </div>

        {/* Curriculum Completion Clause */}
        <p className="text-[11px] sm:text-sm lg:text-[14.5px] font-semibold text-slate-800 max-w-2xl mx-auto leading-relaxed px-4 mt-2">
          for successfully completing the comprehensive technical coursework, rigorous capstone
          deliverables, and academic evaluation for
        </p>

        {/* Prominent Course Title */}
        <div className="mt-1 text-sm sm:text-lg lg:text-xl font-black text-[#0B1B3D] tracking-tight">
          <span className="border-b-2 border-[#FF6B00] pb-0.5">
            {courseTitle}
          </span>
        </div>

        {/* Verified Honors / Distinction Badge */}
        {grade !== null && grade !== undefined && !isRevoked && (
          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 border border-amber-300/80 text-amber-950 shadow-xs">
            <Award className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>
              Verified Assessment Grade: {Math.round(grade)}% •{" "}
              {isHighHonors ? "High Distinction" : isHonors ? "Honors" : "Passing Mark"}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          5. BOTTOM ROW: DUAL EXECUTIVE SIGNATURES & OFFICIAL REGISTRY SEAL
          ========================================================================= */}
      <div className="relative z-10 flex items-end justify-between w-full pt-2">
        {/* Left Signature: Faculty Director / Course Instructor */}
        <div className="text-center min-w-[110px] sm:min-w-[150px] pb-1">
          <div className="relative h-10 sm:h-12 flex items-center justify-center">
            <span
              className="font-cert-script text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B1B3D] italic tracking-wide -rotate-2 leading-none"
              style={{ fontFamily: "var(--font-cert-script), 'Great Vibes', cursive" }}
            >
              {instructorName}
            </span>
          </div>
          <div className="w-full h-[1.5px] bg-[#0B1B3D]/80" />
          <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#0B1B3D] uppercase pt-1">
            LEAD FACULTY DIRECTOR
          </div>
          <div className="text-[8px] text-slate-500 font-semibold truncate max-w-[140px] mx-auto">
            {instructorName}
          </div>
        </div>

        {/* Center: Official ISO / Academic Registry QR Code Seal */}
        <div className="flex flex-col items-center justify-center text-center px-2">
          <div className="bg-white p-1 sm:p-1.5 rounded-xl border border-slate-300/80 shadow-md flex items-center gap-2">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Verification QR Code"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded border border-orange-200"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#0B1B3D] text-[#FF6B00] flex items-center justify-center border border-[#FF6B00]">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            <div className="text-left select-none pr-1">
              <div className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider text-[#0B1B3D]">
                CRYPTOGRAPHIC REGISTRY
              </div>
              <div className="text-[8px] sm:text-[9.5px] font-mono font-bold text-[#FF6B00]">
                {certificateCode}
              </div>
              <div className="text-[7.5px] sm:text-[8.5px] font-semibold text-slate-500">
                Issued {formattedDate}
              </div>
            </div>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-slate-500 tracking-wider uppercase mt-1">
            OFFICIAL ACCREDITED RECORD
          </span>
        </div>

        {/* Right Signature: Founder & CEO */}
        <div className="text-center min-w-[110px] sm:min-w-[150px] pb-1 mr-2 sm:mr-6">
          <div className="relative h-10 sm:h-12 flex items-center justify-center">
            <span
              className="font-cert-script text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B1B3D] italic tracking-wide -rotate-3 leading-none"
              style={{ fontFamily: "var(--font-cert-script), 'Great Vibes', cursive" }}
            >
              {signerName}
            </span>
            <svg
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-3 text-[#0B1B3D] pointer-events-none"
              viewBox="0 0 160 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 6 8 Q 80 18 152 5" stroke="#0B1B3D" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="w-full h-[1.5px] bg-[#0B1B3D]/80" />
          <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#0B1B3D] uppercase pt-1">
            {signerTitle}
          </div>
          <div className="text-[8px] text-slate-500 font-semibold">
            SkillNova Academic Council
          </div>
        </div>
      </div>
    </div>
  );
}
