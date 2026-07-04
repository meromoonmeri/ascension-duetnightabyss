"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import gsap from "gsap";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { AURELON_KINGDOMS, type KingdomData } from "@/data/regions";
import { useNavigation } from "@/store/navigationStore";

// ─── Image mapping ────────────────────────────────────────────
const KINGDOM_IMAGES: Record<string, string> = {
  englesia: "/kingdom-englesia.jpg",
  aurelion: "/kingdom-aurelion.jpg",
  valmont: "/kingdom-valmont.jpg",
  brumel: "/kingdom-brumel.jpg",
  castellan: "/kingdom-castellan.jpg",
  rosval: "/kingdom-rosval.jpg",
  albhelios: "/kingdom-albhelios.jpg",
};

// ─── Star particle positions (deterministic for consistency) ─
const STAR_COUNT = 60;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: ((i * 137.508) % 100), // golden angle spread
  y: ((i * 97.3) % 100),
  size: 1 + (i % 3) * 0.5,
  delay: (i * 0.3) % 4,
  duration: 2 + (i % 3),
}));

// ─── Helper: pad number ──────────────────────────────────────
function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export default function KingdomsPage() {
  useNavigation(); // navigation store available for future route integration
  const containerRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [selectedKingdom, setSelectedKingdom] = useState<KingdomData | null>(null);
  const [view, setView] = useState<"grid" | "detail">("grid");

  const currentIndex = useMemo(
    () => (selectedKingdom ? AURELON_KINGDOMS.findIndex((k) => k.id === selectedKingdom.id) : 0),
    [selectedKingdom]
  );

  // ─── Navigate to kingdom detail ────────────────────────────
  const selectKingdom = useCallback((kingdom: KingdomData) => {
    if (selectedKingdom?.id === kingdom.id) return;

    const newIdx = AURELON_KINGDOMS.findIndex((k) => k.id === kingdom.id);
    const pct = ((newIdx + 1) / AURELON_KINGDOMS.length) * 100;

    // Animate out current content
    const outTargets = [contentAreaRef.current, textAreaRef.current].filter(Boolean);
    if (outTargets.length > 0) {
      gsap.to(outTargets, {
        opacity: 0,
        y: 15,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setSelectedKingdom(kingdom);
          setView("detail");
          // Animate in new content
          requestAnimationFrame(() => {
            const inTargets = [contentAreaRef.current, textAreaRef.current, imageRef.current, progressRef.current].filter(Boolean);
            if (inTargets.length > 0) {
              gsap.fromTo(
                inTargets,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }
              );
            }
            // Animate progress bar fill
            if (progressRef.current) {
              const bar = progressRef.current.querySelector(".kingdom-progress-fill") as HTMLElement;
              if (bar) {
                gsap.fromTo(bar, { width: "0%" }, { width: `${pct}%`, duration: 0.6, ease: "power2.out", delay: 0.3 });
              }
            }
          });
        },
      });
    } else {
      setSelectedKingdom(kingdom);
      setView("detail");
    }
  }, [selectedKingdom]);

  // ─── Back to grid ──────────────────────────────────────────
  const goBackToGrid = useCallback(() => {
    gsap.to(detailRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setView("grid");
        setSelectedKingdom(null);
        // Animate grid in
        requestAnimationFrame(() => {
          const cards = gridRef.current?.querySelectorAll(".kingdom-grid-card");
          if (cards) {
            gsap.fromTo(
              cards,
              { opacity: 0, y: 30, scale: 0.97 },
              { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07, ease: "power3.out" }
            );
          }
        });
      },
    });
  }, []);

  // ─── Next / Prev kingdom (decorative arrows) ───────────────
  const goToKingdom = useCallback(
    (direction: "prev" | "next") => {
      const total = AURELON_KINGDOMS.length;
      let nextIdx: number;
      if (direction === "next") {
        nextIdx = (currentIndex + 1) % total;
      } else {
        nextIdx = (currentIndex - 1 + total) % total;
      }
      selectKingdom(AURELON_KINGDOMS[nextIdx]);
    },
    [currentIndex, selectKingdom]
  );

  // ─── Entrance animation ────────────────────────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Star particles entrance
      gsap.fromTo(
        ".kingdom-star",
        { opacity: 0 },
        { opacity: 1, duration: 1.5, stagger: { each: 0.03, from: "random" }, ease: "power1.out" }
      );

      // Grid cards entrance
      const cards = gridRef.current?.querySelectorAll(".kingdom-grid-card");
      if (cards && view === "grid") {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.2 }
        );
      }

      // Detail view entrance
      if (view === "detail") {
        const targets = [sidebarRef.current, imageRef.current, textAreaRef.current, progressRef.current].filter(Boolean);
        gsap.fromTo(
          targets,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.15 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [view]);

  // ─── Re-animate when switching to detail view from grid ────
  useEffect(() => {
    if (view !== "detail" || !detailRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    gsap.fromTo(
      detailRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" }
    );

    const targets = [sidebarRef.current, imageRef.current, textAreaRef.current, progressRef.current].filter(Boolean);
    gsap.fromTo(
      targets,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.1 }
    );

    // Progress bar animation
    if (progressRef.current) {
      const bar = progressRef.current.querySelector(".kingdom-progress-fill") as HTMLElement;
      if (bar) {
        const pct = ((currentIndex + 1) / AURELON_KINGDOMS.length) * 100;
        gsap.fromTo(bar, { width: "0%" }, { width: `${pct}%`, duration: 0.7, ease: "power2.out", delay: 0.4 });
      }
    }
  }, [view, currentIndex]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0d0f1a 0%, #1a1d2e 100%)",
      }}
    >
      {/* ─── Fixed background image with dark overlay ─── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-royaumes.jpg')",
          opacity: 0.3,
        }}
      />
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-[#0d0f1a]/80 via-[#0d0f1a]/60 to-[#1a1d2e]/90" />

      {/* ─── Star particles ─── */}
      <div className="fixed inset-0 z-[2] pointer-events-none" aria-hidden="true">
        {STARS.map((star) => (
          <div
            key={star.id}
            className="kingdom-star absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0,
              animation: `kingdom-star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ─── Main content ─── */}
      <div className="relative z-10 min-h-screen">
        {/* ─── GRID VIEW ─── */}
        {view === "grid" && (
          <div ref={gridRef} className="min-h-screen px-4 sm:px-6 lg:px-8 py-12 pt-24">
            {/* Title */}
            <div className="max-w-6xl mx-auto mb-10">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Les Royaumes
              </h1>
              <p
                className="text-[#a0a0a0] text-sm sm:text-base max-w-xl leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Sept nations partagent le continent d&apos;Aurelon, chacune façonnée par son histoire, ses traditions et son peuple.
              </p>
              <div className="mt-4 h-px w-32 bg-gradient-to-r from-[#00d4ff]/60 to-transparent" />
            </div>

            {/* Kingdom cards grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {AURELON_KINGDOMS.map((kingdom, idx) => (
                <button
                  key={kingdom.id}
                  onClick={() => selectKingdom(kingdom)}
                  className="kingdom-grid-card group relative text-left overflow-hidden rounded-sm cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={KINGDOM_IMAGES[kingdom.id]}
                      alt={kingdom.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading={idx < 4 ? "eager" : "lazy"}
                    />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1a] via-[#0d0f1a]/30 to-transparent" />

                    {/* Kingdom color accent bar at top */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ backgroundColor: kingdom.color }}
                    />

                    {/* Kingdom name overlaid */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <h3
                        className="text-lg sm:text-xl font-bold text-white tracking-wide"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {kingdom.name}
                      </h3>
                      {kingdom.capital && (
                        <span
                          className="text-xs text-white/50 tracking-wider uppercase"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {kingdom.capital}
                        </span>
                      )}
                    </div>

                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 60px rgba(${kingdom.colorRgb}, 0.12), 0 0 40px rgba(${kingdom.colorRgb}, 0.06)`,
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── DETAIL VIEW ─── */}
        {view === "detail" && selectedKingdom && (
          <div ref={detailRef} className="min-h-screen">
            {/* Back button */}
            <div className="pt-6 pl-4 sm:pl-8">
              <button
                onClick={goBackToGrid}
                className="group flex items-center gap-2 text-[#666] hover:text-white transition-colors duration-300 text-sm tracking-wider uppercase cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                  strokeWidth={1.5}
                />
                <span>Retour</span>
              </button>
            </div>

            {/* Layout: Sidebar (left) + Content (right) */}
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
              {/* ─── Sidebar / Horizontal tabs ─── */}
              <nav
                ref={sidebarRef}
                className="md:w-64 lg:w-72 flex-shrink-0 md:border-r border-b md:border-b-0 border-white/[0.06]"
                aria-label="Kingdoms navigation"
              >
                {/* Mobile: horizontal scroll tabs */}
                <div className="md:hidden overflow-x-auto flex gap-0 px-4 py-3 kingdom-scroll-hide">
                  {AURELON_KINGDOMS.map((kingdom) => {
                    const isActive = kingdom.id === selectedKingdom.id;
                    return (
                      <button
                        key={kingdom.id}
                        onClick={() => selectKingdom(kingdom)}
                        className={`
                          flex-shrink-0 px-4 py-2 text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer whitespace-nowrap relative
                          ${isActive ? "text-white" : "text-[#666] hover:text-[#999]"}
                        `}
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {kingdom.name.replace(/^Royaume (d[e']? )?/i, "").replace(/^Saint-Empire d'/i, "")}
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00d4ff]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Desktop: vertical sidebar list */}
                <div className="hidden md:flex flex-col py-8 px-4 lg:px-6">
                  {AURELON_KINGDOMS.map((kingdom) => {
                    const isActive = kingdom.id === selectedKingdom.id;
                    return (
                      <button
                        key={kingdom.id}
                        onClick={() => selectKingdom(kingdom)}
                        className={`
                          group relative text-left py-3 px-3 transition-all duration-300 cursor-pointer
                          ${isActive ? "text-white" : "text-[#666] hover:text-[#999]"}
                        `}
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {/* Active indicator */}
                        <span
                          className={`
                            absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all duration-300
                            ${isActive ? "h-6 bg-[#00d4ff]" : "h-0 bg-transparent group-hover:h-4 group-hover:bg-[#00d4ff]/40"}
                          `}
                        />
                        <span className="text-xs tracking-[0.1em] uppercase leading-tight">
                          {kingdom.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* ─── Main content area ─── */}
              <div ref={contentAreaRef} className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-10 p-4 sm:p-6 lg:p-8 lg:pr-12">
                {/* Left column: Text */}
                <div ref={textAreaRef} className="lg:w-5/12 flex flex-col justify-center">
                  {/* Kingdom name */}
                  <h2
                    className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-white tracking-wide leading-tight mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {selectedKingdom.name}
                  </h2>

                  {/* Cyan underline */}
                  <div
                    className="h-[2px] w-24 mb-6 bg-[#00d4ff]/70"
                    style={{
                      boxShadow: "0 0 12px rgba(0,212,255,0.3)",
                    }}
                  />

                  {/* Capital */}
                  {selectedKingdom.capital && (
                    <p
                      className="text-xs tracking-[0.2em] uppercase text-[#00d4ff]/60 mb-4"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Capitale : {selectedKingdom.capital}
                    </p>
                  )}

                  {/* Description */}
                  <p
                    className="text-[#a0a0a0] text-sm sm:text-base leading-[1.8] max-w-lg"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {selectedKingdom.description}
                  </p>

                  {/* Kingdom color accent dot + label */}
                  <div className="mt-8 flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: selectedKingdom.color,
                        boxShadow: `0 0 10px rgba(${selectedKingdom.colorRgb}, 0.5)`,
                      }}
                    />
                    <span
                      className="text-xs tracking-[0.15em] uppercase text-white/30"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Aurelon
                    </span>
                  </div>
                </div>

                {/* Right column: Image card */}
                <div className="lg:w-7/12 flex items-center justify-center">
                  <div
                    ref={imageRef}
                    className="relative w-full max-w-xl group"
                  >
                    {/* Image card */}
                    <div
                      className="relative overflow-hidden rounded-sm"
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <img
                        src={KINGDOM_IMAGES[selectedKingdom.id]}
                        alt={selectedKingdom.name}
                        className="w-full aspect-[16/10] object-cover"
                      />

                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

                      {/* Navigation arrows (decorative but functional) */}
                      <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => { e.stopPropagation(); goToKingdom("prev"); }}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 border border-white/10 transition-all duration-200 cursor-pointer"
                          aria-label="Kingdom précédent"
                        >
                          <ChevronLeft size={16} className="text-white" strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => { e.stopPropagation(); goToKingdom("next"); }}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 border border-white/10 transition-all duration-200 cursor-pointer"
                          aria-label="Kingdom suivant"
                        >
                          <ChevronRight size={16} className="text-white" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div
                      ref={progressRef}
                      className="mt-3 flex items-center gap-3"
                    >
                      <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="kingdom-progress-fill h-full bg-[#00d4ff]/60 rounded-full"
                          style={{ width: `${((currentIndex + 1) / AURELON_KINGDOMS.length) * 100}%` }}
                        />
                      </div>
                      <span
                        className="text-[10px] tracking-[0.15em] text-white/30 tabular-nums"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {pad(currentIndex + 1)}/{pad(AURELON_KINGDOMS.length)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Star twinkle keyframes & scrollbar hide ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes kingdom-star-twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.7; }
        }
        .kingdom-scroll-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .kingdom-scroll-hide::-webkit-scrollbar {
          display: none;
        }
      ` }} />
    </div>
  );
}