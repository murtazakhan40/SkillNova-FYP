import React from "react";
import { ShieldCheck, Award } from "lucide-react";

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
  certificateType?: string; // e.g. "APPRECIATION" | "ACHIEVEMENT" | "COMPLETION"
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
  grade,
  qrCodeDataUrl,
  isRevoked = false,
  revokedReason,
  certificateType = "APPRECIATION",
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
          month: "short",
          day: "2-digit",
        });

  return (
    <div
      className={`relative w-full aspect-[1.414/1] bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 select-none flex flex-col justify-between p-6 sm:p-10 lg:p-12 transition-all ${
        isRevoked ? "filter grayscale contrast-125 opacity-80" : ""
      }`}
      style={{
        boxShadow: "0 25px 60px -15px rgba(11, 27, 61, 0.2), 0 0 0 1px rgba(11, 27, 61, 0.05)",
      }}
    >
      {/* =========================================================================
          1. TOP-LEFT CORNER: NAVY & VIBRANT ORANGE FLOWING WAVE RIBBONS
          ========================================================================= */}
      <svg
        className="absolute top-0 left-0 w-[42%] sm:w-[38%] max-w-[380px] h-auto pointer-events-none z-0"
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="orangeGradientTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="35%" stopColor="#FF6B00" />
            <stop offset="70%" stopColor="#FF8533" />
            <stop offset="100%" stopColor="#FFA566" />
          </linearGradient>
          <linearGradient id="navyGradientTop" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#060E1E" />
            <stop offset="60%" stopColor="#0B1B3D" />
            <stop offset="100%" stopColor="#132752" />
          </linearGradient>
          <linearGradient id="orangeAccentTop" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFA566" />
            <stop offset="50%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FFD8B8" />
          </linearGradient>
        </defs>

        {/* Outer Deep Navy Ribbon Wave */}
        <path
          d="M0 0 H360 C260 40 210 110 160 170 C120 215 60 238 0 240 V0 Z"
          fill="url(#navyGradientTop)"
        />

        {/* Dynamic Vibrant SkillNova Orange Swoop 1 */}
        <path
          d="M0 190 C70 185 130 160 175 125 C230 80 290 35 390 10 L400 18 C300 45 238 90 182 138 C135 175 72 202 0 205 V190 Z"
          fill="url(#orangeGradientTop)"
        />

        {/* Fine Accent Orange Hairline */}
        <path
          d="M0 220 C60 215 110 185 150 148 C200 102 260 55 350 24"
          stroke="url(#orangeAccentTop)"
          strokeWidth="2.5"
          fill="none"
          opacity="0.9"
        />

        {/* Inner Midnight Wave Accent */}
        <path
          d="M0 0 H240 C190 25 150 65 110 105 C75 140 40 165 0 170 V0 Z"
          fill="#060E1E"
          opacity="0.5"
        />
      </svg>

      {/* =========================================================================
          2. BOTTOM-RIGHT CORNER: NAVY & VIBRANT ORANGE FLOWING WAVE RIBBONS (MIRRORED)
          ========================================================================= */}
      <svg
        className="absolute bottom-0 right-0 w-[24%] sm:w-[20%] max-w-[210px] h-auto pointer-events-none z-0 rotate-180"
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="orangeGradientBottom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="35%" stopColor="#FF6B00" />
            <stop offset="70%" stopColor="#FF8533" />
            <stop offset="100%" stopColor="#FFA566" />
          </linearGradient>
          <linearGradient id="navyGradientBottom" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#060E1E" />
            <stop offset="60%" stopColor="#0B1B3D" />
            <stop offset="100%" stopColor="#132752" />
          </linearGradient>
        </defs>

        <path
          d="M0 0 H360 C260 40 210 110 160 170 C120 215 60 238 0 240 V0 Z"
          fill="url(#navyGradientBottom)"
        />
        <path
          d="M0 190 C70 185 130 160 175 125 C230 80 290 35 390 10 L400 18 C300 45 238 90 182 138 C135 175 72 202 0 205 V190 Z"
          fill="url(#orangeGradientBottom)"
        />
        <path
          d="M0 220 C60 215 110 185 150 148 C200 102 260 55 350 24"
          stroke="#FF8533"
          strokeWidth="2.5"
          fill="none"
          opacity="0.9"
        />
      </svg>

      {/* =========================================================================
          3. TOP HEADER ROW: BRAND IDENTITY (LEFT) & ORANGE ROSETTE MEDALLION (RIGHT)
          ========================================================================= */}
      <div className="relative z-10 flex items-start justify-between w-full">
        {/* Top-Left: SkillNova Academy Logo & Tagline */}
        <div className="flex items-center gap-3 pt-1 pl-1">
          {/* Stylized Hexagonal Icon in Navy & Brand Orange */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0B1B3D] border-2 border-[#FF6B00] flex items-center justify-center shadow-md shrink-0">
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
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-heading font-black text-sm sm:text-lg lg:text-xl tracking-wider text-white drop-shadow-md">
              {academyName}
            </div>
            <div className="text-[9.5px] sm:text-xs font-black tracking-[0.22em] text-[#FFA566] uppercase drop-shadow-xs">
              {tagline}
            </div>
          </div>
        </div>

        {/* Top-Right: Orange & Navy Scalloped Rosette Medallion "LEARN IMPLEMENT GROW" */}
        <div className="shrink-0 -mr-2 -mt-2 sm:mr-0 sm:mt-0">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center drop-shadow-lg">
            {/* Scalloped Medallion Outer Teeth */}
            <svg
              className="absolute inset-0 w-full h-full animate-spin-none"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="medalOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA566" />
                  <stop offset="25%" stopColor="#FF8533" />
                  <stop offset="50%" stopColor="#FF6B00" />
                  <stop offset="75%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
                <linearGradient id="rimOrange" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF8533" />
                  <stop offset="50%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#FFA566" />
                </linearGradient>
              </defs>

              {/* 24-point Scalloped Star/Petal Rosette */}
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
                fill="url(#medalOrange)"
                stroke="url(#rimOrange)"
                strokeWidth="1.2"
              />

              {/* Inner Outer Ring */}
              <circle cx="50" cy="50" r="39" stroke="url(#rimOrange)" strokeWidth="1.5" />
              {/* Inner Dotted Ring */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeDasharray="1.5 2"
                opacity="0.85"
              />
              {/* Inner Solid Navy Medallion Core */}
              <circle cx="50" cy="50" r="33" fill="#0B1B3D" stroke="#FF6B00" strokeWidth="1.5" />
            </svg>

            {/* Medallion Core Text */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center leading-tight select-none">
              <span className="text-[8px] sm:text-[10px] lg:text-[11px] font-black tracking-widest text-[#FFD8B8] uppercase">
                LEARN
              </span>
              <span className="text-[8.5px] sm:text-[11px] lg:text-[12px] font-black tracking-wider text-white uppercase my-0.5">
                IMPLEMENT
              </span>
              <span className="text-[8px] sm:text-[10px] lg:text-[11px] font-black tracking-widest text-[#FFA566] uppercase">
                GROW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. CENTER BODY: CERTIFICATE TITLE, PRESENTED TO, NAME & CURRICULUM
          ========================================================================= */}
      <div className="relative z-10 text-center my-auto py-1 sm:py-2">
        {/* Revocation Warning Overlay if Revoked */}
        {isRevoked && (
          <div className="mb-4 inline-block bg-red-600 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-2 rounded-full shadow-lg border-2 border-white animate-pulse">
            REVOKED CREDENTIAL • {revokedReason || "Academic Invalidation"}
          </div>
        )}

        {/* Grand High-Contrast Title: "Certificate" */}
        <div className="font-cert-title text-4xl sm:text-6xl lg:text-7xl font-bold text-[#0B1B3D] tracking-tight leading-none select-none drop-shadow-xs">
          Certificate
        </div>

        {/* Tracked Uppercase Subtitle with crisp underline: "OF APPRECIATION" */}
        <div className="inline-flex flex-col items-center mt-1 sm:mt-2 mb-2 sm:mb-3">
          <div className="font-heading text-xs sm:text-sm lg:text-base font-black tracking-[0.32em] text-[#0B1B3D] uppercase">
            OF {certificateType}
          </div>
          <div className="w-28 sm:w-44 h-[2px] bg-[#0B1B3D] mt-1" />
        </div>

        {/* Presentation Statement */}
        <div className="text-[10.5px] sm:text-xs lg:text-[13.5px] font-extrabold tracking-[0.25em] text-slate-800 uppercase mt-1 mb-1.5 sm:mb-2">
          THIS CERTIFICATE IS PROUDLY PRESENTED TO
        </div>

        {/* Recipient Student Name in High-Contrast Majestic SkillNova Midnight Navy */}
        <div className="font-cert-title text-3xl sm:text-5xl lg:text-6xl font-black tracking-wider uppercase text-[#0B1B3D] my-1.5 sm:my-2 px-4 drop-shadow-xs">
          {studentName}
        </div>

        {/* SkillNova Brand Orange Crisp Ornamental Divider */}
        <div className="flex items-center justify-center gap-2.5 max-w-xs sm:max-w-md mx-auto my-1.5 sm:my-2.5">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] shrink-0" />
          <div className="h-[2px] flex-1 bg-[#FF6B00]" />
          <span className="text-[#FF6B00] text-sm leading-none shrink-0 font-bold">◆</span>
          <div className="h-[2px] flex-1 bg-[#FF6B00]" />
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] shrink-0" />
        </div>

        {/* Curriculum Completion Clause */}
        <p className="text-[11.5px] sm:text-sm lg:text-[15.5px] font-extrabold tracking-wide text-slate-900 max-w-2xl mx-auto uppercase leading-relaxed px-4 mt-2 sm:mt-2.5">
          ON COMPLETION OF THE COURSE -{" "}
          <span className="text-[#0B1B3D] font-black border-b-2 border-[#FF6B00] pb-0.5">
            {courseTitle}
          </span>{" "}
          FROM {academyName}. WE WISH YOU ALL THE BEST.
        </p>

        {/* Optional Verified Grade Display */}
        {grade !== null && grade !== undefined && !isRevoked && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-orange-50 border border-orange-300 text-orange-950 shadow-xs">
            <Award className="w-4 h-4 text-[#FF6B00]" />
            <span>Verified Assessment Grade: {Math.round(grade)}% (Passed)</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          5. BOTTOM ROW: DATE & OFFICIAL ACCREDITATION SEAL (LEFT) & SIGNATURE (RIGHT)
          ========================================================================= */}
      <div className="relative z-10 flex items-end justify-between w-full pt-1">
        {/* Bottom-Left: Date Line & Official Certified Seal */}
        <div className="flex items-end gap-3 sm:gap-5">
          {/* Official Academy Registry / ISO Seal Stamp */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/95 p-1.5 sm:p-2 rounded-xl border border-slate-200 shadow-xs">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Verification QR Code"
                className="w-11 h-11 sm:w-13 sm:h-13 rounded border border-orange-200"
              />
            ) : (
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-lg bg-[#0B1B3D] text-[#FF6B00] flex items-center justify-center border-2 border-[#FF6B00]">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
            <div className="text-left select-none">
              <div className="flex items-center gap-1">
                {/* Micro Emblem */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z"
                    fill="#FF6B00"
                  />
                </svg>
                <span className="font-heading font-black text-xs sm:text-sm tracking-wider text-[#0B1B3D]">
                  SKILLNOVA ACADEMY
                </span>
              </div>
              <div className="text-[8.5px] sm:text-[10px] font-black text-slate-700 uppercase tracking-wider">
                OFFICIAL CERTIFIED CREDENTIAL
              </div>
              <div className="text-[8px] sm:text-[9.5px] font-mono text-[#0B1B3D] font-black">
                {certificateCode}
              </div>
            </div>
          </div>

          {/* Date Column */}
          <div className="text-center min-w-[90px] sm:min-w-[120px]">
            <div className="text-xs sm:text-base font-black text-[#0B1B3D] pb-0.5">
              {formattedDate}
            </div>
            <div className="w-full h-[2px] bg-[#0B1B3D]" />
            <div className="text-[9.5px] sm:text-xs font-black tracking-widest text-[#0B1B3D] uppercase pt-1">
              DATE
            </div>
          </div>
        </div>

        {/* Bottom-Right: Digital Signature & Founder & CEO Label with proper margin from corner ribbon */}
        <div className="text-center min-w-[130px] sm:min-w-[180px] pb-1 mr-4 sm:mr-10 lg:mr-16">
          {/* Authentic Elegant Executive Calligraphy Signature */}
          <div className="relative h-11 sm:h-14 flex items-center justify-center">
            <span
              className="font-cert-script text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0B1B3D] select-none italic tracking-wide -rotate-3 leading-none drop-shadow-xs"
              style={{ fontFamily: "var(--font-cert-script), 'Great Vibes', cursive" }}
            >
              {signerName}
            </span>
            {/* Dynamic Pen Underline Flourish */}
            <svg
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 sm:w-44 h-4 text-[#0B1B3D] pointer-events-none"
              viewBox="0 0 160 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 6 8 Q 80 18 152 5"
                stroke="#0B1B3D"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="155" cy="5" r="1.8" fill="#0B1B3D" />
            </svg>
          </div>

          {/* Solid Signature Underline in Midnight Navy */}
          <div className="w-full h-[2px] bg-[#0B1B3D]" />

          {/* Signer Title */}
          <div className="text-[9.5px] sm:text-xs font-black tracking-widest text-[#0B1B3D] uppercase pt-1.5">
            {signerTitle}
          </div>
        </div>
      </div>
    </div>
  );
}
