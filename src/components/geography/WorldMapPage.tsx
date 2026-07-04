"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigation } from "@/store/navigationStore";
import InteractiveMap from "./InteractiveMap";

export default function WorldMapPage() {
  const { navigate } = useNavigation();
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".map-title",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
      gsap.fromTo(
        ".map-subtitle",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: "power2.out" }
      );
      gsap.fromTo(
        ".map-hint",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 0.4, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative flex flex-col">
      {/* ─── Title bar (overlaid on map) ─── */}
      <div
        ref={titleRef}
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-4 sm:px-6 pt-4 pb-8"
        style={{
          background:
            "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-primary)/60% 40%, transparent 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="map-title flex items-center gap-3">
            <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[var(--ornament-color)]" />
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl tracking-[0.12em] text-engraved text-txt-primary">
              LE MONDE CONNU
            </h1>
            <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[var(--ornament-color)]" />
          </div>
          <div className="map-subtitle mt-2 flex items-center gap-3">
            <span className="font-body text-xs sm:text-sm text-txt-secondary tracking-wider">
              世界地図 — Carte interactive du monde d&apos;Ascension
            </span>
          </div>
          <div className="map-hint mt-3">
            <span className="inline-flex items-center gap-1.5 font-body text-[0.65rem] text-txt-tertiary opacity-60">
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="8" cy="8" r="6" />
                <line x1="8" y1="11" x2="8" y2="8" />
                <line x1="8" y1="8" x2="11" y2="6" />
              </svg>
              Survolez les régions pour explorer • Molette pour zoomer • Glissez pour vous déplacer
            </span>
          </div>
        </div>
      </div>

      {/* ─── Interactive Map ─── */}
      <InteractiveMap />
    </div>
  );
}
