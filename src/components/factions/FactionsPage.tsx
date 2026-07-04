"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useNavigation } from "@/store/navigationStore";
import { FACTIONS, type FactionData } from "@/data/factions";
import { FourPointStar } from "@/components/shared/Ornaments";

// ─── Constants ───────────────────────────────────────────────
const CARD_WIDTH = 220;
const CARD_HEIGHT = 330;
const FAN_SPREAD = 50;
const FAN_RADIUS = 600;
const HOVER_LIFT = 60;
const HOVER_Z = 50;
const SPREAD_EXTRA = 8;

export default function FactionsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fanRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const { navigate } = useNavigation();

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const rml = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqlHandler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const rmlHandler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", mqlHandler);
    rml.addEventListener("change", rmlHandler);
    return () => {
      mql.removeEventListener("change", mqlHandler);
      rml.removeEventListener("change", rmlHandler);
    };
  }, []);

  const getBaseTransform = useCallback(
    (index: number): { rotate: number; x: number; z: number } => {
      const total = FACTIONS.length;
      const step = FAN_SPREAD / (total - 1);
      const rotate = -FAN_SPREAD / 2 + step * index;
      const rad = (rotate * Math.PI) / 180;
      const x = Math.sin(rad) * FAN_RADIUS * 0.45;
      const z = (1 - Math.cos(rad)) * FAN_RADIUS * 0.3;
      return { rotate, x, z };
    },
    []
  );

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current || isMobile || prefersReduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".faction-header-anim",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.15 }
      );
      gsap.fromTo(
        ".faction-card-tarot",
        { opacity: 0, y: 60, rotateX: -15, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.4,
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [isMobile, prefersReduced]);

  // GSAP hover animation
  useEffect(() => {
    if (isMobile || prefersReduced) return;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const base = getBaseTransform(i);

      if (hoveredIndex === null) {
        gsap.to(card, {
          rotation: base.rotate,
          x: base.x,
          z: base.z,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          transformPerspective: 1200,
        });
      } else {
        const dist = Math.abs(i - hoveredIndex);
        let targetRotate = base.rotate;
        let targetX = base.x;
        let targetY = 0;
        const targetZ = base.z;

        if (i === hoveredIndex) {
          targetRotate = 0;
          targetX = 0;
          targetY = -HOVER_LIFT;
        } else if (dist === 1) {
          const direction = i < hoveredIndex ? -1 : 1;
          targetRotate = base.rotate + direction * SPREAD_EXTRA;
          targetX = base.x + direction * 30;
          targetY = -15;
        } else if (dist === 2) {
          targetY = -5;
        }

        gsap.to(card, {
          rotation: targetRotate,
          x: targetX,
          z: i === hoveredIndex ? HOVER_Z : targetZ,
          y: targetY,
          duration: 0.5,
          ease: "power2.out",
          transformPerspective: 1200,
        });
      }
    });
  }, [hoveredIndex, isMobile, prefersReduced, getBaseTransform]);

  const handleCardClick = (faction: FactionData) => {
    navigate("faction-detail", { id: faction.id, name: faction.name });
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Animated ornamental particles (CSS only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="faction-particle" style={{ left: "10%", animationDelay: "0s", animationDuration: "18s" }} />
        <div className="faction-particle" style={{ left: "25%", animationDelay: "3s", animationDuration: "22s" }} />
        <div className="faction-particle" style={{ left: "40%", animationDelay: "6s", animationDuration: "16s" }} />
        <div className="faction-particle" style={{ left: "55%", animationDelay: "2s", animationDuration: "20s" }} />
        <div className="faction-particle" style={{ left: "70%", animationDelay: "8s", animationDuration: "24s" }} />
        <div className="faction-particle" style={{ left: "85%", animationDelay: "4s", animationDuration: "19s" }} />
        <div className="faction-particle" style={{ left: "15%", animationDelay: "10s", animationDuration: "21s" }} />
        <div className="faction-particle" style={{ left: "60%", animationDelay: "12s", animationDuration: "17s" }} />
      </div>

      {/* Page Header */}
      <section className="relative pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 text-center z-10">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(192,192,192,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="faction-header-anim font-body text-sm text-txt-tertiary tracking-widest uppercase mb-3">
            Factions
          </p>
          <h1 className="faction-header-anim font-display text-3xl sm:text-4xl md:text-5xl tracking-[0.12em] text-engraved text-txt-primary mb-4">
            FACTIONS
          </h1>
          <p className="faction-header-anim font-body text-sm text-txt-tertiary italic">
            勢力 — Les pouvoirs qui faconnent le monde
          </p>
        </div>
      </section>

      {/* Desktop: Tarot Card Fan */}
      {!isMobile && !prefersReduced ? (
        <div className="relative flex items-center justify-center py-12 sm:py-20" style={{ perspective: "1200px" }}>
          <div
            className="absolute w-[600px] h-[400px] rounded-full pointer-events-none"
            style={{
              background:
                hoveredIndex !== null
                  ? `radial-gradient(ellipse, ${FACTIONS[hoveredIndex].colors.glow} 0%, transparent 70%)`
                  : "radial-gradient(ellipse, rgba(192,192,192,0.04) 0%, transparent 70%)",
              transition: "background 0.6s ease",
              filter: "blur(30px)",
            }}
          />
          <div
            ref={fanRef}
            className="relative flex items-end justify-center"
            style={{
              width: FAN_RADIUS * 1.1,
              height: CARD_HEIGHT + HOVER_LIFT + 40,
              transformStyle: "preserve-3d",
            }}
          >
            {FACTIONS.map((faction, i) => {
              const base = getBaseTransform(i);
              return (
                <div
                  key={faction.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="faction-card-tarot absolute cursor-pointer"
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    bottom: 0,
                    left: "50%",
                    marginLeft: -CARD_WIDTH / 2,
                    transformOrigin: `center ${CARD_HEIGHT + FAN_RADIUS * 0.8}px`,
                    transform: `rotate(${base.rotate}deg) translateX(${base.x}px) translateZ(${base.z}px)`,
                    transformStyle: "preserve-3d",
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleCardClick(faction)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleCardClick(faction);
                  }}
                  aria-label={`Voir les details de ${faction.name}`}
                >
                  <TarotCard faction={faction} isHovered={hoveredIndex === i} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Mobile / Reduced Motion: Simple Grid */
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FACTIONS.map((faction) => (
              <button
                key={faction.id}
                onClick={() => handleCardClick(faction)}
                className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-silver"
                aria-label={`Voir les details de ${faction.name}`}
              >
                <div
                  className="relative rounded-sm overflow-hidden p-5 transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(180deg, ${faction.colors.bg} 0%, ${faction.colors.bg}cc 100%)`,
                    border: `1px solid ${faction.colors.primary}33`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${faction.colors.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div className="text-3xl mb-3">{faction.symbol}</div>
                  <h3
                    className="font-display text-sm sm:text-base tracking-[0.1em] uppercase mb-1"
                    style={{ color: faction.colors.primary }}
                  >
                    {faction.name}
                  </h3>
                  <p className="font-body text-xs italic mb-2" style={{ color: faction.colors.secondary }}>
                    {faction.nameJp}
                  </p>
                  <p
                    className="font-body text-xs italic mb-3 line-clamp-2"
                    style={{ color: faction.colors.text, opacity: 0.7 }}
                  >
                    &laquo; {faction.motto} &raquo;
                  </p>
                  <p
                    className="font-body text-xs leading-relaxed line-clamp-3"
                    style={{ color: faction.colors.text, opacity: 0.6 }}
                  >
                    {faction.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-16" />
    </div>
  );
}

// ─── Individual Tarot Card ───────────────────────────────────
function TarotCard({
  faction,
  isHovered,
}: {
  faction: FactionData;
  isHovered: boolean;
}) {
  return (
    <div
      className="relative w-full h-full rounded-sm overflow-hidden"
      style={{
        boxShadow: isHovered
          ? `0 0 40px ${faction.colors.glow}, 0 0 80px ${faction.colors.glow}, inset 0 0 30px ${faction.colors.glow}`
          : `0 4px 20px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Gradient border via pseudo-approach: outer wrapper with gradient bg + inner with dark bg */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          background: `linear-gradient(180deg, ${faction.colors.primary}88, ${faction.colors.primary}22, ${faction.colors.primary}88)`,
          padding: 2,
        }}
      >
        <div
          className="w-full h-full rounded-sm"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${faction.colors.primary}18 0%, transparent 60%), linear-gradient(180deg, ${faction.colors.bg}ee 0%, ${faction.colors.bg} 40%, ${faction.colors.bg}cc 100%)`,
          }}
        />
      </div>

      {/* Inner ornamental border */}
      <div
        className="absolute inset-[8px] rounded-sm pointer-events-none"
        style={{
          border: `1px solid ${faction.colors.primary}22`,
        }}
      />

      {/* Corner ornaments */}
      <CornerOrnament position="top-left" color={faction.colors.primary} />
      <CornerOrnament position="top-right" color={faction.colors.primary} />
      <CornerOrnament position="bottom-left" color={faction.colors.primary} />
      <CornerOrnament position="bottom-right" color={faction.colors.primary} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-5 pt-8 pb-6 text-center">
        {/* Symbol */}
        <div className="text-5xl mb-2 drop-shadow-lg" role="img" aria-label={faction.symbol}>
          {faction.symbol}
        </div>

        {/* Name + Motto */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2
            className="font-display text-xs sm:text-sm tracking-[0.15em] uppercase leading-tight mb-2"
            style={{ color: faction.colors.primary }}
          >
            {faction.name}
          </h2>
          <p
            className="font-body text-[10px] sm:text-xs italic leading-snug max-w-[90%]"
            style={{ color: faction.colors.secondary, opacity: 0.85 }}
          >
            &laquo; {faction.motto} &raquo;
          </p>
        </div>

        {/* Decorative separator */}
        <div
          className="w-3/4 flex items-center gap-2 mb-3"
          style={{ color: faction.colors.primary }}
        >
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${faction.colors.primary}44)` }} />
          <FourPointStar size={10} color={faction.colors.primary} />
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${faction.colors.primary}44)` }} />
        </div>

        {/* Description (first 2 lines) */}
        <p
          className="font-body text-[9px] sm:text-[10px] leading-relaxed line-clamp-2"
          style={{ color: faction.colors.text, opacity: 0.65 }}
        >
          {faction.description}
        </p>

        {/* Bottom ornamental pattern */}
        <div className="mt-3 opacity-30" style={{ color: faction.colors.primary }}>
          <svg width="80" height="20" viewBox="0 0 80 20" fill="none" aria-hidden="true">
            <path d="M0 10 L10 10 L15 4 L20 16 L25 4 L30 16 L35 4 L40 10 L80 10" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="40" cy="10" r="2" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Corner Ornament ─────────────────────────────────────────
function CornerOrnament({
  position,
  color,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color: string;
}) {
  const isTop = position.includes("top");
  const isLeft = position.includes("left");
  const flipH = isLeft ? 1 : -1;
  const flipV = isTop ? 1 : -1;

  return (
    <svg
      className="absolute w-4 h-4 pointer-events-none z-20"
      style={{
        top: isTop ? 3 : undefined,
        bottom: isTop ? undefined : 3,
        left: isLeft ? 3 : undefined,
        right: isLeft ? undefined : 3,
        color,
        opacity: 0.4,
        transform: `scaleX(${flipH}) scaleY(${flipV})`,
      }}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M16 0 L16 5 L5 5" stroke="currentColor" strokeWidth="1" strokeLinejoin="miter" />
    </svg>
  );
}