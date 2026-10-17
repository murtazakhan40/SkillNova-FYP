"use client";

import React, { useEffect, useState } from "react";

export function HeroHeadline() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const phrases = [
    { text: "Ignite", delay: 0 },
    { text: "Your", delay: 80 },
    { text: "Tech", delay: 160 },
    { text: "Career", delay: 240 },
    { text: "with", delay: 320 },
  ];

  return (
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
      <span className="inline-flex flex-wrap gap-x-3 gap-y-1 justify-center lg:justify-start">
        {phrases.map((item, index) => (
          <span
            key={index}
            className={`inline-block transition-all duration-700 ease-out ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: `${item.delay}ms`,
            }}
          >
            {item.text}
          </span>
        ))}
      </span>{" "}
      <span
        className={`inline-block mt-1 sm:mt-0 transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "420ms" }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FFA566] to-white drop-shadow-[0_2px_15px_rgba(255,107,0,0.35)] font-black">
          SkillNova Academy
        </span>
      </span>
    </h1>
  );
}
