"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { RACE_DATA } from "@/data/races";
import { useNavigation } from "@/store/navigationStore";

// ─── GIF image mapping ──────────────────────────────────────
const RACE_GIFS: Record<string, string> = {
  humains: "/races/humain.gif",
  elfes: "/races/elfe.gif",
  "hommes-betes": "/races/homme-bete.gif",
  titans: "/races/titan.png",
  demons: "/races/demon.gif",
  vampires: "/races/vampire.gif",
  dragons: "/races/dragon.gif",
  fees: "/races/fee.gif",
};

// ─── Star particle positions (deterministic, same as KingdomsPage) ─
const STAR_COUNT = 60;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: (i * 137.508) % 100,
  y: (i * 97.3) % 100,
  size: 1 + (i % 3) * 0.5,
  delay: (i * 0.3) % 4,
  duration: 2 + (i % 3),
}));

export default function RaceGridPage() {
  useNavigation();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { navigate } = useNavigation();

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // ─── Entrance animation ────────────────────────────────────
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Star particles entrance
      gsap.fromTo(
        ".race-star",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.5,
          stagger: { each: 0.03, from: "random" },
          ease: "power1.out",
        }
      );

      // Grid cards entrance
      const cards = gridRef.current?.querySelectorAll(".race-grid-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0d0f1a 0%, #1a1d2e 100%)",
      }}
    >
      {/* ─── Fixed background image ─── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/homepage-low-bg.webp')",
          opacity: 0.2,
        }}
      />
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-[#0d0f1a]/80 via-[#0d0f1a]/60 to-[#1a1d2e]/90" />

      {/* ─── Star particles ─── */}
      <div className="fixed inset-0 z-[2] pointer-events-none" aria-hidden="true">
        {STARS.map((star) => (
          <div
            key={star.id}
            className="race-star absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0,
              animation: `race-star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ─── Main content ─── */}
      <div className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Title */}
        <div className="max-w-6xl mx-auto mb-10">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LES RACES D&apos;ASCENSION
          </h1>
          <p
            className="text-[#a0a0a0] text-sm sm:text-base max-w-xl leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Huit peuples façonnés par les Dragons Primordiaux
          </p>
          <div className="mt-4 h-px w-32 bg-gradient-to-r from-[#00d4ff]/60 to-transparent" />
        </div>

        {/* Race cards grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6" ref={gridRef}>
          {RACE_DATA.map((race, idx) => (
            <button
              key={race.id}
              onClick={() =>
                navigate("race-detail", {
                  raceId: race.id,
                  name: race.name,
                })
              }
              className="race-grid-card group relative text-left overflow-hidden rounded-sm cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Image container */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={RACE_GIFS[race.id] ?? "/races/titan.png"}
                  alt={race.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading={idx < 4 ? "eager" : "lazy"}
                />

                {/* Gradient overlay from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1a] via-[#0d0f1a]/40 to-transparent" />

                {/* Race-specific color accent bar at top */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: race.colors.primary }}
                />

                {/* Race name + JP name overlaid at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                  <h3
                    className="text-base sm:text-xl font-bold text-white tracking-wide"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {race.name}
                  </h3>
                  <span
                    className="text-[11px] sm:text-xs text-white/50 tracking-wider"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {race.nameJp}
                  </span>
                </div>

                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 60px ${race.colors.glow}, 0 0 40px ${race.colors.glow}`,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Star twinkle keyframes ─── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes race-star-twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.7; }
        }
      `,
        }}
      />
    </div>
  );
}