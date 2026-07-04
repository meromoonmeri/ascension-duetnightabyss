"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import gsap from "gsap";
import { AURELON_KINGDOMS, type KingdomData } from "@/data/regions";
import { useNavigation } from "@/store/navigationStore";

/* ─── Design Tokens ─── */
const BG = "#0A080E";

const KINGDOM_IMAGES: Record<string, string> = {
  englesia: "/kingdom-englesia.jpg",
  aurelion: "/kingdom-aurelion.jpg",
  valmont: "/kingdom-valmont.jpg",
  brumel: "/kingdom-brumel.jpg",
  castellan: "/kingdom-castellan.jpg",
  rosval: "/kingdom-rosval.jpg",
  albhelios: "/kingdom-albhelios.jpg",
};

const KINGDOM_SHORT_NAMES: Record<string, string> = {
  englesia: "ENGLSIA",
  aurelion: "AURELION",
  valmont: "VALMONT",
  brumel: "BRUMEL",
  castellan: "CASTELLAN",
  rosval: "ROSVAL",
  albhelios: "ALBHELIOS",
};

export default function WorldviewSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const kingdoms = AURELON_KINGDOMS;
  const { navigate } = useNavigation();

  const kingdom = kingdoms[activeIndex];

  const goTo = useCallback(
    (idx: number) => {
      if (idx === activeIndex) return;
      const out = contentRef.current;
      if (out) {
        gsap.to(out, {
          opacity: 0,
          y: 10,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            setActiveIndex(idx);
            gsap.fromTo(
              out,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
          },
        });
      } else {
        setActiveIndex(idx);
      }
    },
    [activeIndex]
  );

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % kingdoms.length);
    }, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, kingdoms.length]);

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <section
      className="gacha-reveal relative min-h-screen w-full"
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
        style={{ background: "rgba(10,8,14,0.88)" }}
      />

      <div className="relative z-10 mx-auto flex h-full min-h-screen max-w-[1440px] flex-col lg:flex-row">
        {/* ─── LEFT SIDEBAR ─── */}
        <aside
          className="flex shrink-0 flex-row overflow-x-auto lg:w-[280px] lg:flex-col lg:overflow-x-visible"
          style={{
            padding: "clamp(2rem, 5vh, 4rem) 1.5rem",
            borderRight: "1px solid rgba(200,164,92,0.12)",
          }}
        >
          {/* Title */}
          <div className="mb-6 flex-shrink-0 lg:mb-10">
            <h2
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#E8D5A0",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: 6,
                textShadow: "0 0 15px rgba(200,164,92,0.2)",
              }}
            >
              WORLDVIEW
            </h2>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 400,
                color: "#B8A898",
                letterSpacing: "0.05em",
                lineHeight: 1.4,
              }}
            >
              LE MONDE D&apos;AURELON
            </p>
            {/* Separator */}
            <div
              style={{
                width: 40,
                height: 1,
                backgroundColor: "rgba(200,164,92,0.3)",
                marginTop: 16,
                marginBottom: 8,
              }}
            />
          </div>

          {/* Kingdom list */}
          <nav className="flex flex-row gap-2 lg:flex-col lg:gap-0">
            {kingdoms.map((k, i) => (
              <button
                key={k.id}
                onClick={() => {
                  setIsPaused(true);
                  goTo(i);
                }}
                className="group flex items-center gap-3 whitespace-nowrap rounded px-3 py-2.5 text-left transition-all duration-200 lg:py-2"
                style={{
                  background:
                    i === activeIndex
                      ? "rgba(200,164,92,0.08)"
                      : "transparent",
                  borderLeft: i === activeIndex
                    ? "2px solid #C8A45C"
                    : "2px solid transparent",
                  paddingLeft: i === activeIndex ? 10 : 12,
                }}
                onMouseEnter={(e) => {
                  if (i !== activeIndex) {
                    e.currentTarget.style.background = "rgba(200,164,92,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (i !== activeIndex) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <ChevronRight
                  size={14}
                  style={{
                    color: i === activeIndex ? "#C8A45C" : "transparent",
                    transition: "color 0.2s",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: i === activeIndex ? 600 : 400,
                    color:
                      i === activeIndex
                        ? "#E8D5A0"
                        : "#B8A898",
                    letterSpacing: "0.06em",
                    transition: "color 0.2s",
                  }}
                >
                  {k.name.replace(/Royaume d'|Saint-Empire d'/, "")}
                </span>
              </button>
            ))}
          </nav>

          {/* Voir Tous button */}
          <div className="mt-auto hidden flex-shrink-0 pt-8 lg:block">
            <button
              onClick={() => navigate("royaumes")}
              className="group flex items-center gap-2 transition-all duration-200"
              style={{ cursor: "pointer" }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "#C8A45C",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                VOIR TOUS
              </span>
              <ChevronRight
                size={12}
                style={{
                  color: "#C8A45C",
                  transition: "transform 0.2s",
                }}
                className="group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </aside>

        {/* ─── MAIN CONTENT AREA ─── */}
        <div
          ref={contentRef}
          className="flex flex-1 flex-col justify-center px-6 py-8 lg:px-12 lg:py-0"
        >
          {/* Kingdom Image */}
          <div
            className="relative mb-6 w-full overflow-hidden lg:mb-8"
            style={{
              maxHeight: "60vh",
              aspectRatio: "16/9",
              borderRadius: 4,
              borderBottom: "1px solid rgba(200,164,92,0.5)",
            }}
          >
            <Image
              src={KINGDOM_IMAGES[kingdom.id] || "/kingdom-englesia.jpg"}
              alt={kingdom.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, calc(100vw - 280px)"
              priority={activeIndex === 0}
            />
            {/* Bottom gradient overlay */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/3"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,8,14,0.8) 0%, transparent 100%)",
              }}
            />
          </div>

          {/* Kingdom Title */}
          <div className="mb-4 flex items-baseline gap-4 lg:mb-6">
            <span
              key={`num-${kingdom.id}`}
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                fontWeight: 700,
                color: "rgba(200,164,92,0.3)",
                letterSpacing: "0.05em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {pad(activeIndex)}
            </span>
            <h3
              key={`name-${kingdom.id}`}
              style={{
                fontSize: "clamp(1rem, 2vw, 1.5rem)",
                fontWeight: 600,
                color: "#E8D5A0",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              {KINGDOM_SHORT_NAMES[kingdom.id] || kingdom.name}
            </h3>
          </div>

          {/* Kingdom Description */}
          <p
            key={`desc-${kingdom.id}`}
            className="max-w-3xl"
            style={{
              fontSize: "clamp(0.75rem, 1vw, 0.88rem)",
              fontWeight: 400,
              color: "#B8A898",
              lineHeight: 1.7,
              letterSpacing: "0.01em",
            }}
          >
            {kingdom.description}
          </p>

          {/* Page counter */}
          <div className="mt-auto flex justify-end pt-8 lg:pt-4">
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "rgba(200,164,92,0.3)",
                letterSpacing: "0.15em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {pad(activeIndex)}/{pad(kingdoms.length - 1)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}