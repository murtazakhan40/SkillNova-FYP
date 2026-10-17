import React from "react";
import Link from "next/link";

interface SkillNovaLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  href?: string;
  className?: string;
}

export const SkillNovaLogo: React.FC<SkillNovaLogoProps> = ({
  variant = "dark",
  size = "md",
  iconOnly = false,
  href = "/",
  className = "",
}) => {
  const isLight = variant === "light";

  const sizeDimensions = {
    sm: { icon: 30, text: "text-lg", sub: "text-[9px]" },
    md: { icon: 40, text: "text-2xl", sub: "text-[10px]" },
    lg: { icon: 52, text: "text-3xl", sub: "text-xs" },
  };

  const currentSize = sizeDimensions[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Brand Icon SVG */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Subtle Outer Glow / Ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="url(#novaGlow)"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            className="opacity-70 animate-spin"
            style={{ animationDuration: "25s" }}
          />

          {/* Navy Hexagonal Shield / Book Base */}
          <path
            d="M50 14L82 31V69L50 86L18 69V31L50 14Z"
            fill="url(#navyGradient)"
            stroke="#1B376F"
            strokeWidth="2"
          />

          {/* Stylized Open Book Pages */}
          <path
            d="M50 44L28 32V62L50 74L72 62V32L50 44Z"
            fill="#060E1E"
            opacity="0.5"
          />
          <path
            d="M50 74V44M28 32L50 44L72 32"
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Radiating 4-Point Nova Star (The Orange Spark) */}
          <path
            d="M50 20C50 33 60 40 70 40C60 40 50 47 50 60C50 47 40 40 30 40C40 40 50 33 50 20Z"
            fill="url(#orangeSpark)"
            className="filter drop-shadow-[0_0_8px_rgba(255,107,0,0.8)]"
          />

          {/* Central Bright Spark Core */}
          <circle cx="50" cy="40" r="3.5" fill="#FFFFFF" />

          {/* Gradients */}
          <defs>
            <linearGradient id="navyGradient" x1="18" y1="14" x2="82" y2="86" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1B376F" />
              <stop offset="0.6" stopColor="#0B1B3D" />
              <stop offset="1" stopColor="#060E1E" />
            </linearGradient>

            <linearGradient id="orangeSpark" x1="30" y1="20" x2="70" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFA566" />
              <stop offset="0.5" stopColor="#FF6B00" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>

            <linearGradient id="novaGlow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF6B00" />
              <stop offset="0.5" stopColor="#3B66B8" />
              <stop offset="1" stopColor="#FF6B00" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className={`font-brand font-black tracking-tight ${currentSize.text} flex items-center transition-transform duration-200 group-hover:translate-x-0.5`}>
            <span className={isLight ? "text-white" : "text-[#0B1B3D]"}>Skill</span>
            <span className="text-[#FF6B00] ml-0.5 relative">
              Nova
              <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-[#FF8533] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" />
            </span>
          </div>
          <span
            className={`font-sans font-bold tracking-[0.28em] uppercase ${currentSize.sub} mt-1 ${
              isLight ? "text-slate-300/90" : "text-slate-500"
            }`}
          >
            Academy
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
