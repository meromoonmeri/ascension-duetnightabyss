"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { RACE_DATA, type RaceData } from "@/data/races";
import { useNavigation } from "@/store/navigationStore";

/* ─── Design Tokens ─── */
const BG = "#0A080E";

const RACE_IMAGES: Record<string, string> = {
  humains: "/races/humain.png",
  elfes: "/races/elfe.png",
  "hommes-betes": "/races/homme-bete.png",
  titans: "/races/titan.png",
  demons: "/races/demon.png",
  vampires: "/races/vampire.png",
  dragons: "/races/dragon.png",
  fees: "/races/fee.png",
};

const TOTAL = RACE_DATA.length;

function getTransform(index: number, active: number) {
  const diff = index - active;
  // Wrap around
  let d = diff;
  if (d > TOTAL / 2) d -= TOTAL;
  if (d < -TOTAL / 2) d += TOTAL;

  const absD = Math.abs(d);
  if (absD > 2) return { transform: "translateX(0) scale(0.6)", opacity: 0, zIndex: 0 };

  const tx = d * 30; // percentage offset
  const scale = d === 0 ? 1 : 0.82;
  const rotate = d * 8; // degrees
  const zIndex = 10 - absD;
  const opacity = d === 0 ? 1 : absD === 1 ? 0.7 : 0.4;
  const translateZ = d === 0 ? 0 : -200;

  return {
    transform: `translateX(${tx}%) translateZ(${translateZ}px) rotateY(${rotate}deg) scale(${scale})`,
    opacity,
    zIndex,
    transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };
}

export default function RacesCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { navigate } = useNavigation();

  const go = useCallback((dir: number) => {
    setActiveIndex((prev) => {
      const next = (prev + dir + TOTAL) % TOTAL;
      return next;
    });
  }, []);

  // Autoplay
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => go(1), 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, go]);

  const activeRace = RACE_DATA[activeIndex];

  return (
    <section
      className="gacha-reveal relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: "url('/homepage-low-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: BG,
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(10,8,14,0.92)",
        }}
      />

      {/* Subtle dark gradient over the image */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: "linear-gradient(180deg, rgba(10,8,14,0.3) 0%, transparent 30%, transparent 70%, rgba(10,8,14,0.5) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col items-center justify-center px-4 py-16 lg:px-8">
        {/* ─── HEADER ─── */}
        <div className="mb-10 text-center lg:mb-14">
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "#E8D5A0",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              lineHeight: 1,
              marginBottom: 10,
              textShadow: "0 0 20px rgba(200,164,92,0.3)",
            }}
          >
            RACES
          </h2>
          <p
            style={{
              fontSize: "clamp(0.65rem, 1.2vw, 0.8rem)",
              fontWeight: 400,
              color: "#B8A898",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            LES PEUPLES D&apos;ASCENSION
          </p>
          <div
            className="mx-auto mt-4"
            style={{ width: 60, height: 1, backgroundColor: "rgba(200,164,92,0.3)" }}
          />
        </div>

        {/* ─── COVERFLOW CAROUSEL ─── */}
        <div className="relative mb-10 w-full lg:mb-14" style={{ maxWidth: 900, height: 420, perspective: 1200 }}>
          {/* Navigation buttons */}
          <button
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 z-30 -translate-y-1/2 hidden lg:flex"
            style={{
              width: 44,
              height: 44,
              border: "1px solid rgba(200,164,92,0.25)",
              background: "rgba(10,8,14,0.8)",
              color: "#C8A45C",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(200,164,92,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,164,92,0.5)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(10,8,14,0.8)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,164,92,0.25)"; }}
            aria-label="Race précédente"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 z-30 -translate-y-1/2 hidden lg:flex"
            style={{
              width: 44,
              height: 44,
              border: "1px solid rgba(200,164,92,0.25)",
              background: "rgba(10,8,14,0.8)",
              color: "#C8A45C",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(200,164,92,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,164,92,0.5)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(10,8,14,0.8)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,164,92,0.25)"; }}
            aria-label="Race suivante"
          >
            <ChevronRight size={18} />
          </button>

          {/* Slides */}
          <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
            {RACE_DATA.map((race, idx) => {
              const style = getTransform(idx, activeIndex);
              return (
                <div
                  key={race.id}
                  className="absolute inset-0 flex items-end justify-center"
                  style={{
                    ...style,
                    pointerEvents: idx === activeIndex ? "auto" : "none",
                  }}
                >
                  <div style={{ position: "relative", height: 400 }}>
                    <Image
                      src={RACE_IMAGES[race.id] || "/races/humain.png"}
                      alt={race.name}
                      width={400}
                      height={400}
                      className="object-contain select-none"
                      style={{
                        maxHeight: 400,
                        width: "auto",
                        maxWidth: "100%",
                        filter: idx === activeIndex
                          ? "drop-shadow(0 10px 40px rgba(255,255,255,0.08)) drop-shadow(0 10px 30px rgba(0,0,0,0.6))"
                          : "drop-shadow(0 10px 30px rgba(0,0,0,0.6)) brightness(0.7)",
                        transition: "filter 0.6s ease",
                      }}
                      draggable={false}
                      priority={race.id === "humains"}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vignette overlay around carousel area */}
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,8,14,0.6) 100%)",
            }}
          />
        </div>

        {/* ─── PAGINATION DOTS ─── */}
        <div className="relative z-10 flex items-center gap-2 mb-10 lg:mb-14">
          {RACE_DATA.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className="transition-all duration-300"
              style={{
                width: idx === activeIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: idx === activeIndex ? "#C8A45C" : "rgba(200,164,92,0.2)",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={`Race ${idx + 1}`}
            />
          ))}
        </div>

        {/* ─── ACTIVE RACE INFO ─── */}
        <div className="relative z-10 mb-10 max-w-2xl text-center lg:mb-14">
          <h3
            key={activeRace.id}
            style={{
              fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
              fontWeight: 700,
              color: "#E8D5A0",
              letterSpacing: "0.06em",
              marginBottom: 6,
              textShadow: "0 0 15px rgba(200,164,92,0.2)",
            }}
          >
            {activeRace.name}
          </h3>
          <p
            key={`sub-${activeRace.id}`}
            style={{
              fontSize: "clamp(0.75rem, 1vw, 0.85rem)",
              fontWeight: 400,
              color: "#B8A898",
              letterSpacing: "0.03em",
              fontStyle: "italic",
              maxWidth: 500,
              margin: "0 auto 10px",
            }}
          >
            {activeRace.subtitle}
          </p>
          <p
            key={`desc-${activeRace.id}`}
            className="mx-auto"
            style={{
              fontSize: "clamp(0.7rem, 0.9vw, 0.8rem)",
              fontWeight: 400,
              color: "#B8A898",
              lineHeight: 1.7,
              maxWidth: 560,
            }}
          >
            {activeRace.description.length > 180
              ? activeRace.description.slice(0, 180) + "…"
              : activeRace.description}
          </p>
        </div>

        {/* ─── CTA BUTTON ─── */}
        <div className="relative z-10">
          <button
            onClick={() => navigate("races")}
            className="group flex items-center gap-3 transition-all duration-200"
            style={{ cursor: "pointer" }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#C8A45C",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              DÉCOUVRIR LES RACES
            </span>
            <ArrowRight
              size={14}
              style={{ color: "#C8A45C", transition: "transform 0.2s" }}
              className="group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </section>
  );
}