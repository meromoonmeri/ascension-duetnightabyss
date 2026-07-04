"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigation } from "@/store/navigationStore";
import { RACE_DATA } from "@/data/races";
import { FourPointStar } from "@/components/shared/Ornaments";
import { MagicButton } from "@/components/premium";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ==========================================
// CARD SIZE CONFIG
// ==========================================
const CARD_WIDTH_DESKTOP = 240;
const CARD_WIDTH_MOBILE = 180;
const CARD_GAP = 20;

function getCardWidth() {
  if (typeof window === "undefined") return CARD_WIDTH_DESKTOP;
  return window.innerWidth < 640 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
}

// ==========================================
// RACE CARD COMPONENT
// ==========================================
function RaceCard({
  race,
  distance,
  onClick,
  cardWidth,
}: {
  race: (typeof RACE_DATA)[number];
  distance: number;
  onClick: () => void;
  cardWidth: number;
}) {
  const isCenter = distance === 0;
  const isAdjacent = Math.abs(distance) === 1;
  const isFar = Math.abs(distance) >= 2;

  // Scale / opacity / z-index based on distance
  const scale = isCenter ? 1 : isAdjacent ? 0.85 : 0.7;
  const opacity = isCenter ? 1 : isAdjacent ? 0.5 : 0.2;
  const zIndex = isCenter ? 10 : isAdjacent ? 0 : -1;
  const translateX = distance * (cardWidth + CARD_GAP);

  // Blur for far cards
  const blur = isFar ? 2 : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-0 left-1/2 flex-shrink-0 cursor-pointer focus:outline-none"
      style={{
        width: cardWidth,
        height: cardWidth * 1.45,
        transform: `translateX(calc(-50% + ${translateX}px)) scale(${scale})`,
        opacity,
        zIndex,
        filter: `blur(${blur}px)`,
        transition: "transform 300ms ease-out, opacity 300ms ease-out, filter 300ms ease-out",
        marginLeft: -cardWidth / 2,
      }}
      aria-label={`${race.name} — ${race.nameJp}`}
    >
      <div
        className="relative w-full h-full rounded-lg overflow-hidden flex flex-col items-center justify-center"
        style={{
          background: isCenter
            ? `linear-gradient(145deg, rgba(10,8,14,0.9), rgba(10,8,14,0.95))`
            : `linear-gradient(145deg, rgba(10,8,14,0.85), rgba(10,8,14,0.9))`,
          border: isCenter
            ? `1px solid rgba(200,164,92,0.3)`
            : `1px solid rgba(200,164,92,0.15)`,
          boxShadow: isCenter
            ? `0 0 40px rgba(200,164,92,0.15), 0 0 80px rgba(200,164,92,0.08), inset 0 1px 0 rgba(200,164,92,0.05)`
            : isAdjacent
              ? `0 0 20px rgba(200,164,92,0.08)`
              : "none",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(200,164,92,${isCenter ? "0.5" : "0.2"}), transparent)`,
          }}
        />

        {/* Radial glow behind icon */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: isCenter ? "70%" : "60%",
            height: isCenter ? "70%" : "60%",
            top: "15%",
            left: "15%",
            background: `radial-gradient(circle, rgba(200,164,92,0.2), transparent 70%)`,
            opacity: isCenter ? 1 : 0.4,
            transition: "opacity 300ms ease-out",
          }}
        />

        {/* Icon */}
        <div
          className="relative mb-3 flex items-center justify-center"
          style={{
            width: isCenter ? 72 : 56,
            height: isCenter ? 72 : 56,
            filter: isCenter
              ? `drop-shadow(0 0 16px rgba(200,164,92,0.5))`
              : "none",
            transition: "width 300ms ease-out, height 300ms ease-out, filter 300ms ease-out",
          }}
        >
          <img src={race.icon} alt={race.name} className="w-full h-full object-contain" />
        </div>

        {/* Race name */}
        <h3
          className="font-display tracking-[0.1em] text-center leading-tight"
          style={{
            fontSize: isCenter ? "0.8rem" : "0.65rem",
            color: "#E8D5A0",
            opacity: isCenter ? 1 : 0.6,
            textShadow:
              "0 0 20px rgba(200,164,92,0.3)",
            transition: "font-size 300ms ease-out, opacity 300ms ease-out",
          }}
        >
          {race.name.toUpperCase()}
        </h3>

        {/* Japanese name */}
        <p
          className="font-body mt-0.5 text-center"
          style={{
            fontSize: isCenter ? "0.7rem" : "0.55rem",
            color: "rgba(200,164,92,0.4)",
            opacity: isCenter ? 1 : 0.5,
            transition: "font-size 300ms ease-out, opacity 300ms ease-out",
          }}
        >
          {race.nameJp}
        </p>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(200,164,92,${isCenter ? "0.3" : "0.1"}), transparent)`,
          }}
        />

        {/* Hover overlay — only for center card */}
        {isCenter && (
          <div
            className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
            }}
          >
            <span
              className="font-body text-xs tracking-wider"
              style={{ color: "#C8A45C", opacity: 0.8 }}
            >
              Voir les détails →
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

// ==========================================
// MAIN CAROUSEL COMPONENT
// ==========================================
export default function RaceCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH_DESKTOP);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { navigate } = useNavigation();
  const total = RACE_DATA.length;

  const currentRace = RACE_DATA[currentIndex];

  // Responsive card width
  useEffect(() => {
    const updateWidth = () => setCardWidth(getCardWidth());
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex((prev) => {
        // Allow wrapping
        let next = ((index % total) + total) % total;
        return next;
      });
    },
    [total]
  );

  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  const handleCardClick = useCallback(
    (raceId: string, name: string) => {
      navigate("race-detail", { raceId, name });
    },
    [navigate]
  );

  // ---- Touch / Swipe ----
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dt = Date.now() - touchStartTime.current;
      // Swipe threshold: 50px within 500ms
      if (Math.abs(dx) > 50 && dt < 500) {
        if (dx > 0) goPrev();
        else goNext();
      }
    },
    [goPrev, goNext]
  );

  // ---- Keyboard ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // Compute visible range: show 5 cards (2 on each side of center) for desktop, 3 for mobile
  const visibleRange = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const radius = isMobile ? 1 : 2;
    const indices: number[] = [];
    for (let d = -radius; d <= radius; d++) {
      indices.push(((currentIndex + d) % total + total) % total);
    }
    return indices;
  }, [currentIndex, total, cardWidth]);

  // Compute distances for rendering
  const getDistance = useCallback(
    (raceIndex: number): number => {
      const diff = raceIndex - currentIndex;
      // Handle wrap-around shortest path
      if (Math.abs(diff) > total / 2) {
        return diff > 0 ? diff - total : diff + total;
      }
      return diff;
    },
    [currentIndex, total]
  );

  // Container height: based on card size with extra padding for glow
  const containerHeight = cardWidth * 1.45 + 40;

  return (
    <section className="py-20">
      {/* ---- Section Title ---- */}
      <div className="scroll-reveal mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="h-px w-12 sm:w-20"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--ancient-gold))",
            }}
          />
          <FourPointStar size={14} color="var(--ancient-gold)" />
          <div
            className="h-px w-12 sm:w-20"
            style={{
              background:
                "linear-gradient(to left, transparent, var(--ancient-gold))",
            }}
          />
        </div>
        <h2
          className="font-display text-xl sm:text-2xl tracking-[0.12em] text-center"
          style={{
            color: "#E8D5A0",
            textShadow:
              "0 0 20px rgba(200,164,92,0.3)",
          }}
        >
          LES HUIT RACES
        </h2>
        <p
          className="font-body text-center mt-3 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          Chaque race possède son arbre de progression, ses capacités
          uniques et sa palette chromatique
        </p>
      </div>

      {/* ---- Carousel ---- */}
      <div
        ref={containerRef}
        className="relative mx-auto max-w-4xl"
        style={{ height: containerHeight }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Sélection de race"
        tabIndex={0}
      >
        {/* Left arrow */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
          style={{
            background: "rgba(10, 8, 14, 0.6)",
            border: "1px solid rgba(200, 164, 92, 0.25)",
            color: "#C8A45C",
            boxShadow: "0 0 12px rgba(200, 164, 92, 0.08)",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(200, 164, 92, 0.12)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(200, 164, 92, 0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(10, 8, 14, 0.6)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(200, 164, 92, 0.25)";
          }}
          aria-label="Race précédente"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={goNext}
          className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
          style={{
            background: "rgba(10, 8, 14, 0.6)",
            border: "1px solid rgba(200, 164, 92, 0.25)",
            color: "#C8A45C",
            boxShadow: "0 0 12px rgba(200, 164, 92, 0.08)",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(200, 164, 92, 0.12)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(200, 164, 92, 0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(10, 8, 14, 0.6)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(200, 164, 92, 0.25)";
          }}
          aria-label="Race suivante"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
        </button>

        {/* Cards container — overflow hidden */}
        <div className="absolute inset-x-0 inset-y-0 overflow-hidden">
          {/* The "track" — all cards absolutely positioned from center */}
          <div className="relative w-full h-full">
            {visibleRange.map((raceIdx) => {
              const race = RACE_DATA[raceIdx];
              const distance = getDistance(raceIdx);
              return (
                <RaceCard
                  key={race.id}
                  race={race}
                  distance={distance}
                  cardWidth={cardWidth}
                  onClick={() => handleCardClick(race.id, race.name)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- Current race name display ---- */}
      <div className="text-center mt-6 h-14">
        {currentRace && (
          <div
            className="transition-all duration-300 ease-out"
            key={currentRace.id}
          >
            <p
              className="font-display text-sm sm:text-base tracking-[0.15em]"
              style={{
                color: "#E8D5A0",
                textShadow: "0 0 20px rgba(200,164,92,0.3)",
                transition: "color 300ms ease-out, text-shadow 300ms ease-out",
              }}
            >
              {currentRace.name}
            </p>
            <p
              className="font-body text-xs mt-1 tracking-wider"
              style={{
                color: "rgba(200,164,92,0.4)",
                opacity: 1,
              }}
            >
              {currentRace.nameJp}
            </p>
          </div>
        )}
      </div>

      {/* ---- Dot indicators ---- */}
      <div
        className="flex items-center justify-center gap-2 mt-4"
        role="tablist"
        aria-label="Indicateurs de position"
      >
        {RACE_DATA.map((race, idx) => (
          <button
            key={race.id}
            type="button"
            onClick={() => goTo(idx)}
            className="transition-all duration-300 ease-out rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-primary)]"
            style={{
              width: currentIndex === idx ? 20 : 6,
              height: 6,
              background:
                currentIndex === idx
                  ? "#C8A45C"
                  : "rgba(200,164,92,0.2)",
              boxShadow:
                currentIndex === idx ? "0 0 8px rgba(200,164,92,0.3)" : "none",
            }}
            role="tab"
            aria-selected={currentIndex === idx}
            aria-label={race.name}
          />
        ))}
      </div>

      {/* ---- CTA Button ---- */}
      <div className="text-center mt-8 scroll-reveal">
        <MagicButton
          onClick={() => navigate("races")}
          variant="secondary"
          glowColor="var(--ancient-gold, #C9A84C)"
        >
          Voir toutes les races
        </MagicButton>
      </div>
    </section>
  );
}