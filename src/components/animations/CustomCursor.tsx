"use client";

import React, { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [cursorMode, setCursorMode] = useState<"default" | "interactive" | "text">("default");
  const [isClicking, setIsClicking] = useState(false);
  const [cursorBadge, setCursorBadge] = useState<string | null>(null);

  const cursorModeRef = useRef<"default" | "interactive" | "text">("default");

  useEffect(() => {
    cursorModeRef.current = cursorMode;
  }, [cursorMode]);

  useEffect(() => {
    // Only enable on desktop with fine mouse pointer; disable on touch/mobile
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;
    let prevRingX = -100;
    let prevRingY = -100;

    let animationFrameId: number;
    let isMoving = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isMoving) {
        setIsVisible(true);
        isMoving = true;
      }

      // Context-aware target inspection
      const target = e.target as HTMLElement | null;
      if (target) {
        // 1. Text input / textarea
        if (
          (target.tagName === "INPUT" &&
            (target as HTMLInputElement).type !== "button" &&
            (target as HTMLInputElement).type !== "submit" &&
            (target as HTMLInputElement).type !== "checkbox" &&
            (target as HTMLInputElement).type !== "radio") ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          if (cursorModeRef.current !== "text") {
            setCursorMode("text");
            setCursorBadge(null);
          }
          return;
        }

        // 2. Interactive elements (Buttons, Links, Selectors, Cards)
        const interactiveEl = target.closest(
          'a, button, [role="button"], select, label[for], summary, .card-hover-effect, .interactive-card, [data-cursor="pointer"]'
        );

        if (interactiveEl) {
          const customBadge = interactiveEl.getAttribute("data-cursor-text");
          if (cursorModeRef.current !== "interactive" || customBadge !== cursorBadge) {
            setCursorMode("interactive");
            setCursorBadge(customBadge || null);
          }
          return;
        }

        // 3. Default state
        if (cursorModeRef.current !== "default") {
          setCursorMode("default");
          setCursorBadge(null);
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => {
      setIsVisible(false);
      isMoving = false;
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Physics render loop
    const render = () => {
      // 1. Center dot: tightly tracks mouse coordinates (speed factor: 0.8)
      dotX += (mouseX - dotX) * 0.8;
      dotY += (mouseY - dotY) * 0.8;

      // 2. Fluid trailing ring: responsive spring interpolation (speed factor: 0.24)
      ringX += (mouseX - ringX) * 0.24;
      ringY += (mouseY - ringY) * 0.24;

      // Calculate instantaneous velocity for dynamic organic stretch
      const vx = ringX - prevRingX;
      const vy = ringY - prevRingY;
      prevRingX = ringX;
      prevRingY = ringY;

      const speed = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);

      // Subtle dynamic velocity squash & stretch (capped to 0.18 for executive subtlety)
      const stretch = Math.min(speed * 0.008, 0.18);
      const scaleX = 1 + stretch;
      const scaleY = 1 - stretch;

      // Apply GPU-accelerated transforms
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      }

      if (ringRef.current) {
        // When hovered on interactive element or text, keep regular lens; when moving freely, apply subtle fluid stretch
        const mode = cursorModeRef.current;
        const transformStr =
          mode === "interactive" || mode === "text"
            ? `translate3d(${ringX}px, ${ringY}px, 0)`
            : `translate3d(${ringX}px, ${ringY}px, 0) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;

        ringRef.current.style.transform = transformStr;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* 1. Executive Trailing Glass Halo / Precision Lens */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-[9998] flex items-center justify-center rounded-full will-change-transform transition-[width,height,border-color,background-color,opacity,box-shadow] duration-200 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isClicking
            ? "w-6 h-6 border-[1.5px] border-[#FF6B00] bg-orange-500/20 scale-90"
            : cursorMode === "text"
            ? "w-0 h-0 opacity-0 border-transparent"
            : cursorMode === "interactive"
            ? cursorBadge
              ? "w-20 h-20 border border-orange-400/80 bg-[#0B1B3D]/95 text-white shadow-xl shadow-orange-500/20 backdrop-blur-md"
              : "w-11 h-11 border border-[#FF6B00]/80 bg-orange-500/[0.08] shadow-md shadow-orange-500/15 backdrop-blur-[2px]"
            : "w-7 h-7 border border-slate-400/40 bg-slate-900/[0.02] shadow-xs"
        }`}
      >
        {/* Sleek Minimalist Badge (when data-cursor-text is supplied) */}
        {cursorBadge && (
          <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 select-none">
            {cursorBadge}
          </span>
        )}
      </div>

      {/* 2. Micro Precision Core Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-[9999] rounded-full will-change-transform transition-[width,height,opacity,background-color,box-shadow] duration-150 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isClicking
            ? "w-1.5 h-1.5 bg-[#FF6B00] scale-75"
            : cursorMode === "text"
            ? "w-1 h-3.5 bg-slate-700 rounded-xs"
            : cursorMode === "interactive"
            ? "w-1.5 h-1.5 bg-[#FF6B00] opacity-80"
            : "w-2 h-2 bg-[#FF6B00] ring-[1.5px] ring-white shadow-xs shadow-orange-500/40"
        }`}
      />
    </>
  );
}
