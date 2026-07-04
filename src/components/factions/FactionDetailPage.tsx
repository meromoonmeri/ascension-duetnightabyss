"use client";

import React, { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigation } from "@/store/navigationStore";
import { FACTIONS, getFactionById, type FactionData } from "@/data/factions";
import { FourPointStar, SectionSeparator } from "@/components/shared/Ornaments";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FactionDetailPage() {
  const { pageParams, goBack } = useNavigation();
  const containerRef = useRef<HTMLDivElement>(null);
  const faction = getFactionById(pageParams.id);

  useEffect(() => {
    if (!containerRef.current || !faction) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".faction-detail-reveal",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [faction]);

  if (!faction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center" style={{ background: "var(--bg-primary)" }}>
        <FourPointStar size={32} className="opacity-30" />
        <p className="font-display text-lg text-txt-tertiary tracking-wider">Faction non trouvee</p>
        <button
          onClick={goBack}
          className="font-body text-sm text-txt-secondary hover:text-txt-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>
    );
  }

  const c = faction.colors;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* ─── Banner ─── */}
      <header
        className="relative w-full h-[180px] sm:h-[220px] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${c.bg} 0%, ${c.primary}15 50%, ${c.bg} 100%)`,
        }}
      >
        {/* Glow behind symbol */}
        <div
          className="absolute w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />
        {/* Bottom fade to bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: `linear-gradient(to top, var(--bg-primary), transparent)`,
          }}
        />
        {/* Symbol */}
        <div className="relative z-10 text-5xl sm:text-6xl mb-3 drop-shadow-lg">
          {faction.symbol}
        </div>
        {/* Name */}
        <h1
          className="relative z-10 font-display text-2xl sm:text-3xl md:text-4xl tracking-[0.12em] uppercase text-center px-4"
          style={{ color: c.primary }}
        >
          {faction.name}
        </h1>
        <p
          className="relative z-10 font-body text-sm italic mt-1 opacity-70"
          style={{ color: c.text }}
        >
          {faction.nameJp}
        </p>
      </header>

      {/* ─── Content ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back button */}
        <button
          onClick={goBack}
          className="faction-detail-reveal font-body text-sm flex items-center gap-2 mb-8 transition-colors hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-silver rounded-sm px-2 py-1"
          style={{ color: c.primary }}
          aria-label="Retour aux factions"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux Factions
        </button>

        {/* ─── Motto ─── */}
        <div className="faction-detail-reveal text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${c.primary}44)` }} />
            <FourPointStar size={12} color={c.primary} />
            <div className="w-12 h-px" style={{ background: `linear-gradient(to left, transparent, ${c.primary}44)` }} />
          </div>
          <p
            className="font-body text-base sm:text-lg italic leading-relaxed"
            style={{ color: c.text, opacity: 0.8 }}
          >
            &laquo; {faction.motto} &raquo;
          </p>
        </div>

        {/* ─── Description ─── */}
        <DetailSection title="Description" faction={faction}>
          <p className="font-body text-sm sm:text-base leading-relaxed" style={{ color: c.text, opacity: 0.85 }}>
            {faction.description}
          </p>
        </DetailSection>

        <SectionSeparator />

        {/* ─── Ideology ─── */}
        <DetailSection title="Ideologie" faction={faction}>
          <p className="font-body text-sm sm:text-base leading-relaxed" style={{ color: c.text, opacity: 0.85 }}>
            {faction.ideology}
          </p>
        </DetailSection>

        <SectionSeparator />

        {/* ─── Hierarchy ─── */}
        <DetailSection title="Hierarchie" faction={faction}>
          <ol className="space-y-1.5">
            {faction.hierarchy.map((rank, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className="font-mono text-xs w-6 text-right flex-shrink-0"
                  style={{ color: c.primary, opacity: 0.5 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.primary, opacity: 0.6 }} />
                <span className="font-body text-sm" style={{ color: c.text, opacity: 0.85 }}>
                  {rank}
                </span>
              </li>
            ))}
          </ol>
        </DetailSection>

        <SectionSeparator />

        {/* ─── Structure (organizational chart) ─── */}
        {faction.structure && faction.structure.length > 0 && (
          <>
            <DetailSection title="Structure Interne" faction={faction}>
              <div className="space-y-0">
                {faction.structure.map((entry, i) => (
                  <div key={i} className="relative">
                    {/* Connecting line */}
                    {i > 0 && (
                      <div
                        className="absolute left-[7px] -top-4 w-px h-4"
                        style={{ background: `${c.primary}33` }}
                      />
                    )}
                    <div
                      className="relative pl-6 pb-4"
                      style={{
                        borderLeft: `2px solid ${c.primary}22`,
                        marginLeft: 7,
                      }}
                    >
                      {/* Node dot */}
                      <div
                        className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full"
                        style={{
                          background: c.bg,
                          border: `2px solid ${c.primary}`,
                          boxShadow: `0 0 8px ${c.glow}`,
                        }}
                      />
                      <h4
                        className="font-display text-xs sm:text-sm tracking-[0.08em] uppercase mb-1"
                        style={{ color: c.primary }}
                      >
                        {entry.rank}
                      </h4>
                      <p
                        className="font-body text-xs font-semibold mb-1"
                        style={{ color: c.secondary, opacity: 0.9 }}
                      >
                        {entry.title}
                      </p>
                      <p
                        className="font-body text-xs sm:text-sm leading-relaxed"
                        style={{ color: c.text, opacity: 0.75 }}
                      >
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>

            <SectionSeparator />
          </>
        )}

        {/* ─── Objectives ─── */}
        <DetailSection title="Objectifs" faction={faction}>
          <ul className="space-y-2">
            {faction.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <FourPointStar size={8} color={c.primary} className="mt-1.5 flex-shrink-0 opacity-60" />
                <span className="font-body text-sm" style={{ color: c.text, opacity: 0.85 }}>
                  {obj}
                </span>
              </li>
            ))}
          </ul>
        </DetailSection>

        <SectionSeparator />

        {/* ─── Methods ─── */}
        <DetailSection title="Methodes" faction={faction}>
          <div className="flex flex-wrap gap-2">
            {faction.methods.map((method, i) => (
              <span
                key={i}
                className="inline-flex items-center font-body text-xs px-3 py-1.5 rounded-sm"
                style={{
                  color: c.text,
                  background: `${c.primary}10`,
                  border: `1px solid ${c.primary}25`,
                }}
              >
                {method}
              </span>
            ))}
          </div>
        </DetailSection>

        <SectionSeparator />

        {/* ─── Reputation ─── */}
        <DetailSection title="Reputation" faction={faction}>
          <p className="font-body text-sm sm:text-base leading-relaxed italic" style={{ color: c.text, opacity: 0.85 }}>
            {faction.reputation}
          </p>
        </DetailSection>

        {/* ─── Extra Sections ─── */}
        {faction.extraSections && faction.extraSections.length > 0 &&
          faction.extraSections.map((section, i) => (
            <React.Fragment key={i}>
              <SectionSeparator />
              <DetailSection title={section.title} faction={faction}>
                <p className="font-body text-sm sm:text-base leading-relaxed" style={{ color: c.text, opacity: 0.85 }}>
                  {section.content}
                </p>
              </DetailSection>
            </React.Fragment>
          ))
        }

        {/* Bottom accent */}
        <div className="flex items-center justify-center gap-3 mt-12 mb-4">
          <div className="w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${c.primary}33)` }} />
          <FourPointStar size={10} color={c.primary} />
          <div className="w-16 h-px" style={{ background: `linear-gradient(to left, transparent, ${c.primary}33)` }} />
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
}

// ─── Reusable Detail Section ─────────────────────────────────
function DetailSection({
  title,
  faction,
  children,
}: {
  title: string;
  faction: FactionData;
  children: React.ReactNode;
}) {
  const c = faction.colors;
  return (
    <section className="faction-detail-reveal py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ background: c.primary, opacity: 0.6 }} />
        <h2
          className="font-display text-sm sm:text-base tracking-[0.1em] uppercase"
          style={{ color: c.primary }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}