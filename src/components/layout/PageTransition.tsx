"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { useNavigation } from "@/store/navigationStore";

/**
 * PageTransition — Cinematic Blue Archive / Genshin Impact style transition.
 *
 * Phase 1 (Entering): A horizontal light blade expands from center outward,
 * revealing a deep dark overlay with a subtle blue-purple tint at the edges.
 *
 * Midpoint: Brief white bloom/flash at full coverage, THEN the page content
 * is actually swapped (commitNavigation). This ensures the old page stays
 * visible while the overlay covers it, and the new page appears only as
 * the overlay starts to leave.
 *
 * Phase 2 (Leaving): A reverse-direction light sweep dissolves the
 * overlay with a subtle scale bump, revealing new content underneath.
 *
 * z-index: 150 (between header z-100 and preloader z-200).
 */

const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

export default function PageTransition() {
  const {
    isTransitioning,
    transitionPhase,
    commitNavigation,
    setTransitioning,
    setTransitionPhase,
  } = useNavigation();

  const overlayRef = useRef<HTMLDivElement>(null);
  const lineEnterRef = useRef<HTMLDivElement>(null);
  const lineLeaveRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const runTransition = useCallback(() => {
    const overlay = overlayRef.current;
    const lineEnter = lineEnterRef.current;
    const lineLeave = lineLeaveRef.current;
    const flash = flashRef.current;
    if (!overlay || !lineEnter || !lineLeave || !flash) return;

    // Kill any running timeline
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }

    // ── Reset all elements to initial state ──
    gsap.set(overlay, { scaleX: 0, opacity: 1, scale: 1 });
    gsap.set(lineEnter, { scaleX: 0, opacity: 1 });
    gsap.set(lineLeave, { scaleX: 0, opacity: 1 });
    gsap.set(flash, { opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        setTransitioning(false);
        setTransitionPhase("idle");
      },
    });
    tlRef.current = tl;

    // ────────────────────────────────────────────────────────────
    // Phase 1: ENTER — light blade + dark overlay expand from center
    // ────────────────────────────────────────────────────────────
    tl.to(overlay, { scaleX: 1, duration: 0.35, ease: EASE }, 0);
    tl.to(lineEnter, { scaleX: 1, duration: 0.35, ease: EASE }, 0);

    // Fade the entering line as it reaches full width
    tl.to(lineEnter, { opacity: 0, duration: 0.1, ease: "power2.in" }, 0.28);

    // ────────────────────────────────────────────────────────────
    // Midpoint: brief white flash / bloom + COMMIT PAGE SWAP
    // ────────────────────────────────────────────────────────────
    tl.to(flash, { opacity: 0.15, duration: 0.03 }, 0.35);
    tl.to(flash, { opacity: 0, duration: 0.06 }, 0.38);

    // ★ KEY: Swap page content NOW, at full coverage ★
    tl.call(() => {
      commitNavigation();
    }, [], 0.38);

    // ────────────────────────────────────────────────────────────
    // Phase 2: LEAVE — reverse line sweep + overlay dissolve
    // ────────────────────────────────────────────────────────────

    // Light line sweeps left → right (opposite of center-outward enter)
    tl.to(lineLeave, { scaleX: 1, duration: 0.3, ease: EASE }, 0.42);
    tl.to(lineLeave, { opacity: 0, duration: 0.08 }, 0.58);

    // Overlay dissolves with subtle scale bump for depth
    tl.to(overlay, { opacity: 0, scale: 1.015, duration: 0.35, ease: EASE }, 0.42);
  }, [commitNavigation, setTransitionPhase, setTransitioning]);

  useEffect(() => {
    if (isTransitioning && transitionPhase === "entering") {
      // Small delay to ensure DOM is painted before animation
      const timeout = setTimeout(() => {
        runTransition();
      }, 16);
      return () => clearTimeout(timeout);
    }

    // Cleanup on unmount or when not in entering phase
    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
    };
  }, [isTransitioning, transitionPhase, runTransition]);

  // Don't render if idle (save DOM nodes)
  if (!isTransitioning) return null;

  return (
    <>
      {/* ── Dark overlay with subtle blue-purple radial tint ── */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 150,
          pointerEvents: "none",
          willChange: "transform, opacity",
          transformOrigin: "center center",
          background:
            "radial-gradient(ellipse at center, rgba(18, 15, 30, 0.97) 0%, rgba(15, 12, 25, 1) 70%)",
          transform: "scaleX(0)",
        }}
      />

      {/* ── Entering light line — horizontal blade expanding from center ── */}
      <div
        ref={lineEnterRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          right: 0,
          height: "2px",
          zIndex: 152,
          pointerEvents: "none",
          willChange: "transform, opacity",
          transformOrigin: "center center",
          background: "#A8D8FF",
          boxShadow:
            "0 0 4px 2px #A8D8FF, 0 0 20px 6px rgba(168, 216, 255, 0.5), 0 0 60px 15px rgba(168, 216, 255, 0.2)",
          transform: "scaleX(0)",
        }}
      />

      {/* ── Leaving light line — sweeps left → right (opposite direction) ── */}
      <div
        ref={lineLeaveRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          right: 0,
          height: "1.5px",
          zIndex: 152,
          pointerEvents: "none",
          willChange: "transform, opacity",
          transformOrigin: "left center",
          background: "#A8D8FF",
          boxShadow:
            "0 0 3px 1.5px #A8D8FF, 0 0 15px 5px rgba(168, 216, 255, 0.4), 0 0 40px 10px rgba(168, 216, 255, 0.15)",
          transform: "scaleX(0)",
        }}
      />

      {/* ── Flash / bloom layer at midpoint ── */}
      <div
        ref={flashRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 153,
          pointerEvents: "none",
          willChange: "opacity",
          background: "white",
          opacity: 0,
        }}
      />
    </>
  );
}