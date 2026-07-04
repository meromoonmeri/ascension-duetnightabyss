"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { useNavigation } from "@/store/navigationStore";
import { FourPointStar } from "@/components/shared/Ornaments";
import { GRIMOIRE_SECTIONS, FEU_EXAMPLE, type GrimoireSection } from "@/data/grimoire";

// ─── Helpers ───────────────────────────────────────────────

function parseFormattedText(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (!line.trim()) {
      elements.push(<div key={key++} className="h-3" />);
      continue;
    }

    const isBullet = line.trimStart().startsWith("•") || line.trimStart().match(/^\d+\./);
    const isNumberedList = line.trimStart().match(/^\d+\./);

    if (isBullet) {
      const bulletMatch = line.match(/^(\s*)(\d+\.\s*|[•]\s*)(.*)/);
      if (bulletMatch) {
        const indent = bulletMatch[1] ? "ml-4 sm:ml-6" : "";
        const bullet = isNumberedList ? bulletMatch[2] : "• ";
        const content = formatInlineBold(bulletMatch[3]);
        elements.push(
          <div key={key++} className={`flex gap-2 ${indent} my-1`}>
            <span className="text-gold opacity-60 flex-shrink-0 font-display text-sm">{bullet.trim()}</span>
            <span className="font-body text-sm sm:text-base text-txt-secondary leading-relaxed">{content}</span>
          </div>
        );
      }
    } else {
      elements.push(
        <p key={key++} className="font-body text-sm sm:text-base text-txt-secondary leading-relaxed my-2">
          {formatInlineBold(line)}
        </p>
      );
    }
  }

  return elements;
}

function formatInlineBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-txt-primary font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ─── Glyph Background (CSS-only, pure SVG patterns) ────────

function GlyphBackground() {
  return (
    <div className="grimoire-glyphs" aria-hidden="true">
      {/* Rotating glyphs — SVG rune shapes */}
      <svg className="glyph glyph-1" viewBox="0 0 60 60" width="60" height="60">
        <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <path d="M30 5 L35 20 L30 55 L25 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <path d="M5 30 L20 25 L55 30 L20 35 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      </svg>

      <svg className="glyph glyph-2" viewBox="0 0 60 60" width="50" height="50">
        <polygon points="30,5 55,45 5,45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <circle cx="30" cy="32" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      </svg>

      <svg className="glyph glyph-3" viewBox="0 0 60 60" width="55" height="55">
        <rect x="10" y="10" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" transform="rotate(45 30 30)" />
        <circle cx="30" cy="30" r="12" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <path d="M30 18 L30 42 M18 30 L42 30" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      </svg>

      <svg className="glyph glyph-4" viewBox="0 0 60 60" width="45" height="45">
        <path d="M30 5 L40 22 L58 27 L44 40 L48 58 L30 50 L12 58 L16 40 L2 27 L20 22 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      </svg>

      <svg className="glyph glyph-5" viewBox="0 0 60 60" width="48" height="48">
        <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
        <path d="M30 10 L30 50 M10 30 L50 30" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
      </svg>

      <svg className="glyph glyph-6" viewBox="0 0 60 60" width="42" height="42">
        <path d="M30 5 L45 20 L55 40 L40 55 L20 55 L5 40 L15 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      </svg>

      <svg className="glyph glyph-7" viewBox="0 0 60 60" width="52" height="52">
        <path d="M30 5 L35 25 L55 30 L35 35 L30 55 L25 35 L5 30 L25 25 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      </svg>

      <svg className="glyph glyph-8" viewBox="0 0 60 60" width="46" height="46">
        <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
        <path d="M30 8 L33 24 L50 15 L37 28 L55 30 L37 32 L50 45 L33 36 L30 52 L27 36 L10 45 L23 32 L5 30 L23 28 L10 15 L27 24 Z" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
      </svg>
    </div>
  );
}

// ─── Book Cover ────────────────────────────────────────────

function BookCover({ onOpen }: { onOpen: () => void }) {
  const coverRef = useRef<HTMLDivElement>(null);
  const leftPageRef = useRef<HTMLDivElement>(null);
  const rightPageRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || hasAnimated.current) {
      onOpen();
      return;
    }
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: onOpen,
      });

      // Fade in the book
      tl.fromTo(
        ".grimoire-cover-container",
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.8 }
      );

      // Gold shimmer on the title
      tl.fromTo(
        ".grimoire-cover-title",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3"
      );

      // Hold the cover for a moment
      tl.to({}, { duration: 0.6 });

      // Open the book: front cover rotates left on Y axis
      tl.to(
        ".grimoire-front-cover",
        {
          rotateY: -160,
          duration: 1.2,
          ease: "power2.inOut",
          transformOrigin: "left center",
        },
        "+=0.1"
      );

      // Fade out the entire cover container
      tl.to(
        ".grimoire-cover-container",
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        "-=0.4"
      );
    });

    return () => ctx.revert();
  }, [onOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center grimoire-cover-container" style={{ perspective: "1200px" }}>
      <div
        className="relative w-[280px] sm:w-[340px] md:w-[400px] h-[380px] sm:h-[440px] md:h-[500px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Left page (shadow behind cover) */}
        <div
          ref={leftPageRef}
          className="absolute inset-0 rounded-sm"
          style={{
            background: "linear-gradient(135deg, #1a1510 0%, #12100c 100%)",
            border: "1px solid rgba(212,175,55,0.1)",
            transform: "translateX(-2px)",
          }}
        />

        {/* Right page (revealed content) */}
        <div
          ref={rightPageRef}
          className="absolute inset-0 rounded-sm flex items-center justify-center"
          style={{
            background: "linear-gradient(225deg, #1a1510 0%, #0f0d0a 100%)",
            border: "1px solid rgba(212,175,55,0.08)",
          }}
        >
          <FourPointStar size={40} color="rgba(212,175,55,0.15)" />
        </div>

        {/* Front cover — this pivots open */}
        <div
          ref={coverRef}
          className="grimoire-front-cover absolute inset-0 rounded-sm cursor-pointer overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            background: `
              linear-gradient(180deg, #1a150e 0%, #141008 30%, #0f0c06 70%, #1a150e 100%)
            `,
            border: "2px solid rgba(212,175,55,0.25)",
            boxShadow: `
              inset 0 0 40px rgba(0,0,0,0.5),
              inset 0 0 80px rgba(212,175,55,0.03),
              0 0 40px rgba(0,0,0,0.8),
              0 0 80px rgba(212,175,55,0.05)
            `,
            zIndex: 10,
          }}
        >
          {/* Leather texture overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 6px)
              `,
            }}
          />

          {/* Ornamental gold border inset */}
          <div
            className="absolute m-3 sm:m-4 md:m-5 pointer-events-none"
            style={{
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "2px",
            }}
          >
            <div
              className="absolute m-2 pointer-events-none"
              style={{
                border: "1px solid rgba(212,175,55,0.1)",
                borderRadius: "1px",
              }}
            />
          </div>

          {/* Corner ornaments */}
          {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-6 h-6 sm:w-8 sm:h-8 pointer-events-none`}
              style={{ opacity: 0.3 }}
            >
              <svg viewBox="0 0 32 32" className="w-full h-full text-gold">
                <path
                  d="M2 2 L14 2 L14 4 L4 4 L4 14 L2 14 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  className={
                    pos.includes("right")
                      ? pos.includes("bottom")
                        ? "scale-x-[-1] scale-y-[-1]"
                        : "scale-x-[-1]"
                      : pos.includes("bottom")
                        ? "scale-y-[-1]"
                        : ""
                  }
                />
              </svg>
            </div>
          ))}

          {/* Title content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4">
            <FourPointStar size={24} color="rgba(212,175,55,0.5)" />
            <h1
              className="grimoire-cover-title font-display text-3xl sm:text-4xl md:text-5xl tracking-[0.2em] text-transparent bg-clip-text opacity-0"
              style={{
                backgroundImage: "linear-gradient(180deg, #D4AF37 0%, #F5E6A3 40%, #D4AF37 60%, #A8892B 100%)",
                textShadow: "0 0 20px rgba(212,175,55,0.3)",
              }}
            >
              GRIMOIRE
            </h1>
            <div className="w-20 sm:w-28 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <p className="font-body text-xs sm:text-sm tracking-[0.15em] text-gold/40 uppercase">
              Système de Magie
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Renderers ─────────────────────────────────────

function TextSection({ section }: { section: GrimoireSection }) {
  return <div className="space-y-1">{parseFormattedText(section.content)}</div>;
}

function TableSection({ section }: { section: GrimoireSection }) {
  if (!section.tableData) return null;

  return (
    <div className="space-y-4">
      <p className="font-body text-sm sm:text-base text-txt-secondary leading-relaxed">
        {formatInlineBold(section.content)}
      </p>
      <div className="overflow-x-auto rounded-sm border border-bdr-primary">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-bdr-accent bg-surface-secondary/50">
              {section.tableData.headers.map((h) => (
                <th
                  key={h}
                  className="font-display text-[0.65rem] sm:text-xs tracking-[0.15em] uppercase text-gold/70 px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.tableData.rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-bdr-secondary last:border-b-0 hover:bg-surface-tertiary/30 transition-colors duration-200"
              >
                <td className="font-display text-xs sm:text-sm tracking-[0.05em] text-txt-primary px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap w-[140px] sm:w-[180px]">
                  {row.col1}
                </td>
                <td className="font-body text-xs sm:text-sm text-txt-secondary px-3 sm:px-4 py-2.5 sm:py-3 leading-relaxed">
                  {row.col2}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InteractiveSection({ section }: { section: GrimoireSection }) {
  const [activePlan, setActivePlan] = useState<number | null>(null);
  const effectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePlan === null || !effectRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    gsap.fromTo(
      effectRef.current,
      { opacity: 0, y: 10, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
    );
  }, [activePlan]);

  return (
    <div className="space-y-5">
      <div className="space-y-1">{parseFormattedText(section.content)}</div>

      {/* Plan cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-4">
        {FEU_EXAMPLE.map((item, i) => {
          const isActive = activePlan === i;
          return (
            <button
              key={item.plan}
              onClick={() => setActivePlan(isActive ? null : i)}
              className={`
                group relative text-left p-3 sm:p-4 rounded-sm border transition-all duration-300
                ${
                  isActive
                    ? "border-opacity-60 scale-[1.02]"
                    : "border-bdr-primary hover:border-bdr-accent"
                }
              `}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}15, ${item.color}05)`
                  : "var(--bg-card)",
                borderColor: isActive ? item.color : undefined,
                boxShadow: isActive ? `0 0 20px ${item.color}15, inset 0 0 20px ${item.color}08` : undefined,
              }}
              aria-pressed={isActive}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg sm:text-xl">{item.icon}</span>
                <span
                  className="font-display text-xs sm:text-sm tracking-[0.1em] uppercase"
                  style={{ color: isActive ? item.color : "var(--text-primary)" }}
                >
                  {item.plan}
                </span>
              </div>
              {isActive && (
                <div
                  ref={effectRef}
                  className="font-body text-xs sm:text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.effect}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuoteSection({ section }: { section: GrimoireSection }) {
  return (
    <div className="flex items-center justify-center py-6 sm:py-10">
      <div className="relative max-w-lg text-center">
        {/* Decorative top ornament */}
        <div className="flex justify-center mb-6">
          <FourPointStar size={20} color="rgba(212,175,55,0.4)" />
        </div>

        {/* Decorative quote borders */}
        <div
          className="relative px-6 sm:px-10 py-6 sm:py-8"
          style={{
            borderLeft: `2px solid rgba(212,175,55,0.3)`,
            borderRight: `2px solid rgba(212,175,55,0.3)`,
            borderTop: `1px solid rgba(212,175,55,0.15)`,
            borderBottom: `1px solid rgba(212,175,55,0.15)`,
          }}
        >
          <div
            className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2"
            style={{ borderColor: "rgba(212,175,55,0.4)" }}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2"
            style={{ borderColor: "rgba(212,175,55,0.4)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2"
            style={{ borderColor: "rgba(212,175,55,0.4)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2"
            style={{ borderColor: "rgba(212,175,55,0.4)" }}
          />

          <p className="font-body text-base sm:text-lg md:text-xl italic leading-relaxed" style={{ color: "var(--gold)" }}>
            « {section.content} »
          </p>
        </div>

        {/* Decorative bottom ornament */}
        <div className="flex justify-center mt-6">
          <FourPointStar size={20} color="rgba(212,175,55,0.4)" />
        </div>
      </div>
    </div>
  );
}

// ─── Page Content Router ───────────────────────────────────

function PageContent({ section }: { section: GrimoireSection }) {
  switch (section.type) {
    case "text":
      return <TextSection section={section} />;
    case "table":
      return <TableSection section={section} />;
    case "interactive":
      return <InteractiveSection section={section} />;
    case "quote":
      return <QuoteSection section={section} />;
    default:
      return null;
  }
}

// ─── Navigation Arrows ─────────────────────────────────────

function NavArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  const isLeft = direction === "left";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? "Page précédente" : "Page suivante"}
      className={`
        flex items-center justify-center
        w-10 h-10 sm:w-12 sm:h-12
        border border-bdr-primary rounded-sm
        transition-all duration-300
        hover:border-gold/40 hover:bg-surface-tertiary/50
        disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-bdr-primary disabled:hover:bg-transparent
        group
      `}
      style={{
        color: disabled ? "var(--text-tertiary)" : "var(--text-secondary)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{
          transform: isLeft ? "scaleX(-1)" : undefined,
        }}
      >
        {/* Ornamental arrow with curl */}
        <path
          d="M4 12 C4 12, 8 8, 14 8 C18 8, 20 10, 20 12 C20 14, 18 16, 14 16 C8 16, 4 12, 4 12Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:stroke-gold transition-colors duration-200"
        />
        <path
          d="M7 6 L4 12 L7 18"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:stroke-gold transition-colors duration-200"
        />
      </svg>
    </button>
  );
}

// ─── Main Grimoire Page ────────────────────────────────────

export default function GrimoirePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const { goBack } = useNavigation();
  const prefersReduced = useRef(false);

  const sections = GRIMOIRE_SECTIONS;
  const total = sections.length;
  const currentSection = sections[currentIndex];

  useEffect(() => {
    prefersReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const navigateTo = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= total || isAnimating || newIndex === currentIndex) return;
      setIsAnimating(true);

      const direction = newIndex > currentIndex ? 1 : -1;

      if (prefersReduced.current || !pageRef.current) {
        setCurrentIndex(newIndex);
        setIsAnimating(false);
        return;
      }

      const page = pageRef.current;

      gsap.to(page, {
        x: direction * -80,
        opacity: 0,
        rotateY: direction * -8,
        duration: 0.3,
        ease: "power2.in",
        transformPerspective: 1000,
        onComplete: () => {
          setCurrentIndex(newIndex);
          gsap.fromTo(
            page,
            { x: direction * 80, opacity: 0, rotateY: direction * 8 },
            {
              x: 0,
              opacity: 1,
              rotateY: 0,
              duration: 0.4,
              ease: "power2.out",
              transformPerspective: 1000,
              onComplete: () => setIsAnimating(false),
            }
          );
        },
      });
    },
    [currentIndex, total, isAnimating]
  );

  const goNext = useCallback(() => navigateTo(currentIndex + 1), [navigateTo, currentIndex]);
  const goPrev = useCallback(() => navigateTo(currentIndex - 1), [navigateTo, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, goNext, goPrev]);

  // Touch / swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

      // Only horizontal swipes (not vertical scrolls)
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) goNext();
        else goPrev();
      }
      touchStartX.current = null;
      touchStartY.current = null;
    },
    [goNext, goPrev]
  );

  const handleCoverOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Memoize the callout for the Ranks page
  const isRanksPage = currentSection.id === "rangs";

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Book opening animation */}
      {!isOpen && <BookCover onOpen={handleCoverOpen} />}

      {/* Glyph background */}
      <GlyphBackground />

      {/* Dark warm parchment gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(26,21,14,0.8) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 100%, rgba(26,21,14,0.6) 0%, transparent 50%)
          `,
        }}
      />

      {/* Main content */}
      <div
        className={`relative z-10 transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Header area with back button */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-16 sm:pt-20 pb-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 font-display text-xs tracking-[0.1em] uppercase text-txt-tertiary hover:text-gold transition-colors duration-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Retour
          </button>
          <span className="font-mono text-[0.65rem] tracking-[0.2em] text-txt-tertiary uppercase">
            {currentSection.number} / {sections[sections.length - 1].number}
          </span>
        </div>

        {/* Carousel area */}
        <div
          className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Page container with subtle 3D */}
          <div
            ref={pageRef}
            className="relative"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Section number — large gold display */}
            <div className="text-center mb-4 sm:mb-6">
              <span
                className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.1em] text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(180deg, rgba(212,175,55,0.5) 0%, rgba(212,175,55,0.15) 100%)",
                  lineHeight: 1,
                }}
              >
                {currentSection.number}
              </span>
            </div>

            {/* Decorative separator */}
            <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
              <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-gold/30" />
              <FourPointStar size={12} color="rgba(212,175,55,0.4)" />
              <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-gold/30" />
            </div>

            {/* Title */}
            <div className="text-center mb-1">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl tracking-[0.1em] text-engraved text-txt-primary">
                {currentSection.title}
              </h2>
              {currentSection.subtitle && (
                <p className="font-body text-sm text-gold/50 mt-1 tracking-wide italic">
                  {currentSection.subtitle}
                </p>
              )}
            </div>

            {/* Decorative line under title */}
            <div className="flex justify-center my-4 sm:my-6">
              <div className="w-32 sm:w-48 h-px bg-gradient-to-r from-transparent via-bdr-accent to-transparent" />
            </div>

            {/* Ranks callout box */}
            {isRanksPage && (
              <div
                className="mb-5 sm:mb-6 px-4 py-3 rounded-sm border border-gold/20 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))",
                }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }}
                />
                <p className="font-body text-xs sm:text-sm leading-relaxed" style={{ color: "var(--gold)" }}>
                  ⚡ Ce système de rangs mesure la puissance globale d&apos;un personnage (toutes races confondues), distinct des rangs de progression propres à chaque race.
                </p>
              </div>
            )}

            {/* Content */}
            <div
              className="grimoire-page-content max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] overflow-y-auto pr-1"
              style={{ scrollbarWidth: "thin" }}
            >
              <PageContent section={currentSection} />
            </div>

            {/* Bottom ornament */}
            <div className="flex justify-center mt-5 sm:mt-6">
              <div className="w-20 sm:w-28 h-px bg-gradient-to-r from-transparent via-bdr-accent to-transparent" />
            </div>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 px-4 py-6 sm:py-8">
          <NavArrow direction="left" onClick={goPrev} disabled={currentIndex === 0} />

          {/* Page indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => navigateTo(i)}
                aria-label={`Page ${s.number} — ${s.title}`}
                className={`
                  w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300
                  ${i === currentIndex
                    ? "bg-gold w-4 sm:w-6"
                    : "bg-bdr-accent hover:bg-txt-tertiary"
                  }
                `}
              />
            ))}
          </div>

          <NavArrow direction="right" onClick={goNext} disabled={currentIndex === total - 1} />
        </div>

        {/* Page number text */}
        <div className="text-center pb-8 sm:pb-12">
          <span className="font-display text-xs sm:text-sm tracking-[0.2em] text-txt-tertiary">
            {currentSection.number} <span className="text-gold/30 mx-2">—</span> {currentSection.title}
            <span className="text-gold/30 mx-2">—</span> XII
          </span>
        </div>
      </div>

      {/* Grimoire-specific styles */}
      <style jsx global>{`
        /* ─── Glyph background animations ─── */
        .grimoire-glyphs {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
          color: rgba(212, 175, 55, 0.08);
        }

        .glyph {
          position: absolute;
          opacity: 0;
          animation: glyph-drift 30s linear infinite, glyph-fade-in 2s ease-out forwards;
        }

        .glyph-1 { top: 8%; left: 5%; animation-delay: 0s, 0.5s; animation-duration: 45s, 2s; }
        .glyph-2 { top: 15%; right: 8%; animation-delay: 3s, 1.5s; animation-duration: 55s, 2s; }
        .glyph-3 { top: 40%; left: 3%; animation-delay: 6s, 2.5s; animation-duration: 50s, 2s; }
        .glyph-4 { top: 60%; right: 5%; animation-delay: 2s, 1s; animation-duration: 40s, 2s; }
        .glyph-5 { bottom: 20%; left: 10%; animation-delay: 8s, 2s; animation-duration: 60s, 2s; }
        .glyph-6 { bottom: 10%; right: 12%; animation-delay: 4s, 1.5s; animation-duration: 48s, 2s; }
        .glyph-7 { top: 70%; left: 25%; animation-delay: 10s, 3s; animation-duration: 52s, 2s; }
        .glyph-8 { top: 25%; left: 45%; animation-delay: 7s, 2s; animation-duration: 42s, 2s; }

        @keyframes glyph-drift {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes glyph-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .glyph {
            opacity: 0.4 !important;
            animation: none !important;
          }
        }

        /* ─── Grimoire page content scroll ─── */
        .grimoire-page-content::-webkit-scrollbar {
          width: 4px;
        }
        .grimoire-page-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .grimoire-page-content::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.15);
          border-radius: 2px;
        }
        .grimoire-page-content::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.3);
        }

        /* ─── Table row hover highlight ─── */
        .grimoire-page-content table tr:hover td:first-child {
          color: var(--gold);
          transition: color 0.2s;
        }
      `}</style>
    </div>
  );
}