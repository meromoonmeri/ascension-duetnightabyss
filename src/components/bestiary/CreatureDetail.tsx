"use client";

import Image from "next/image";
import { ArrowLeft, Swords, Shield, MapPin, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ═══════════════════════════════════════════════════════════════
   TYPES — CreatureDetail data shape
   ═══════════════════════════════════════════════════════════════ */

export interface ShinsouSignature {
  flux?: string;
  resonance?: string;
  effets?: string[];
}

export interface Pouvoir {
  nom: string;
  description: string;
}

export interface Variante {
  nom: string;
  description: string;
  rank?: string;
  imageUrl?: string;
}

export interface CreatureDetailData {
  name: string;
  slug: string;
  subtitle?: string;
  citation?: string;
  imageUrl?: string;
  rank: string;
  dangerLevel: number; // 1-5
  classe: string;
  localisation: string[];
  description: string[];
  comportement: string;
  shinsou: ShinsouSignature;
  pouvoirs: Pouvoir[];
  variantes: Variante[];
  caracteristiques: { label: string; value: string }[];
}

/* ── Rank color map (same as CreatureCard) ── */
const RANK_COLORS: Record<string, string> = {
  F: "#78716C",
  E: "#22C55E",
  D: "#3B82F6",
  C: "#A855F7",
  B: "#EAB308",
  A: "#EF4444",
  S: "#FF6B35",
  SS: "#DC2626",
  SSS: "#F59E0B",
};

/* ── Reusable sub-components ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xs sm:text-sm tracking-[0.2em] uppercase mb-4" style={{ color: "#c9a25a" }}>
      ✦ {children}
    </h2>
  );
}

function Separator() {
  return (
    <div className="flex items-center gap-4 my-8 sm:my-10">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,90,0.25), transparent)" }} />
      <span style={{ color: "rgba(201,162,90,0.4)", fontSize: 10 }}>✦</span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,90,0.25), transparent)" }} />
    </div>
  );
}

function DangerStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="leading-none"
          style={{
            fontSize: 14,
            color: i < level ? "#c9a25a" : "rgba(255,255,255,0.1)",
            textShadow: i < level ? "0 0 6px rgba(201,162,90,0.5)" : "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

interface CreatureDetailProps {
  creature: CreatureDetailData;
  onBack?: () => void;
}

export default function CreatureDetail({ creature, onBack }: CreatureDetailProps) {
  const rankColor = RANK_COLORS[creature.rank] || "#78716C";
  const isSSS = creature.rank === "SSS";

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "linear-gradient(180deg, #050508 0%, #0a0e1a 30%, #050508 100%)",
      }}
    >
      {/* Outer container — dark card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-6 font-body text-sm transition-colors cursor-pointer group"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#c9a25a"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; }}
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span className="italic">Retour au Bestiaire</span>
          </button>
        )}

        {/* ═══ HEADER ═══ */}
        <div className="mb-2">
          {/* ❖ NAME — SUBTITLE */}
          <h1
            className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-[0.2em] leading-tight mb-1"
            style={{
              color: "#e9e4d6",
              textShadow: isSSS
                ? "0 0 30px rgba(245,158,11,0.3), 0 0 60px rgba(168,85,247,0.15)"
                : `0 0 20px ${rankColor}30`,
            }}
          >
            ❖ {creature.name}
            {creature.subtitle && (
              <span style={{ color: "var(--text-tertiary)" }}>
                {" "}— {creature.subtitle}
              </span>
            )}
          </h1>

          {/* Citation */}
          {creature.citation && (
            <p className="font-body italic text-sm sm:text-base mt-2" style={{ color: "var(--text-accent)", letterSpacing: "0.03em" }}>
              «&nbsp;{creature.citation}&nbsp;»
            </p>
          )}
        </div>

        <Separator />

        {/* ═══ META BAR ═══ */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 mb-2">
          {/* Danger stars */}
          <div className="flex items-center gap-1.5">
            <Swords size={14} style={{ color: "#c9a25a" }} />
            <DangerStars level={creature.dangerLevel} />
          </div>

          {/* Rank badge */}
          <span
            className="font-display text-[0.7rem] tracking-[0.15em] font-bold px-2.5 py-1 rounded-sm"
            style={{
              color: rankColor,
              border: `1px solid ${rankColor}44`,
              background: `${rankColor}11`,
            }}
          >
            RANG {creature.rank}
          </span>

          {/* Classe */}
          <div className="flex items-center gap-1.5">
            <Shield size={13} style={{ color: "var(--text-tertiary)" }} />
            <span className="font-mono-custom text-[0.65rem] tracking-[0.1em] uppercase" style={{ color: "var(--text-secondary)" }}>
              {creature.classe}
            </span>
          </div>
        </div>

        {/* Localisation tags */}
        {creature.localisation.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <MapPin size={12} style={{ color: "var(--text-tertiary)", marginTop: 2 }} />
            {creature.localisation.map((loc) => (
              <Badge
                key={loc}
                variant="outline"
                className="font-mono-custom text-[0.55rem] tracking-[0.08em] px-2 py-0.5 h-5"
                style={{
                  color: "var(--text-secondary)",
                  borderColor: "var(--border-accent)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {loc}
              </Badge>
            ))}
          </div>
        )}

        {/* Portrait image (if available) */}
        {creature.imageUrl && (
          <div
            className="relative w-full aspect-[16/9] max-h-[400px] rounded-lg overflow-hidden mb-2"
            style={{
              border: `1px solid ${rankColor}25`,
              boxShadow: `0 0 30px ${rankColor}10, 0 10px 40px rgba(0,0,0,0.5)`,
            }}
          >
            <Image
              src={creature.imageUrl}
              alt={creature.name}
              fill
              className="object-cover"
              style={{ filter: "saturate(0.85) brightness(0.85)" }}
              unoptimized
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to top, var(--bg-card) 0%, transparent 40%)",
              }}
            />
          </div>
        )}

        <Separator />

        {/* ═══ DESCRIPTION ═══ */}
        <div>
          <SectionTitle>Description</SectionTitle>
          <div className="space-y-4">
            {creature.description.map((para, i) => (
              <p
                key={i}
                className="font-body text-sm sm:text-base leading-[1.85] text-[#e9e4d6]/90"
                style={{ textIndent: para.length > 80 ? "1.5em" : "0" }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        <Separator />

        {/* ═══ COMPORTEMENT ═══ */}
        <div>
          <SectionTitle>Comportement</SectionTitle>
          <p className="font-body text-sm sm:text-base leading-[1.85] text-[#e9e4d6]/90">
            {creature.comportement}
          </p>
        </div>

        <Separator />

        {/* ═══ SIGNATURE DU SHINSÔ ═══ */}
        <div>
          <SectionTitle>Signature du Shinsô</SectionTitle>
          <div className="space-y-4">
            {/* Flux */}
            {creature.shinsou.flux && (
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-secondary)",
                }}
              >
                <p className="font-display text-[0.65rem] tracking-[0.15em] uppercase mb-1.5" style={{ color: "#c9a25a" }}>
                  Flux
                </p>
                <p className="font-body text-sm leading-relaxed text-[#e9e4d6]/85">
                  {creature.shinsou.flux}
                </p>
              </div>
            )}

            {/* Résonance */}
            {creature.shinsou.resonance && (
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-secondary)",
                }}
              >
                <p className="font-display text-[0.65rem] tracking-[0.15em] uppercase mb-1.5" style={{ color: "#c9a25a" }}>
                  Résonance
                </p>
                <p className="font-body text-sm leading-relaxed text-[#e9e4d6]/85">
                  {creature.shinsou.resonance}
                </p>
              </div>
            )}

            {/* Effets */}
            {creature.shinsou.effets && creature.shinsou.effets.length > 0 && (
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-secondary)",
                }}
              >
                <p className="font-display text-[0.65rem] tracking-[0.15em] uppercase mb-2" style={{ color: "#c9a25a" }}>
                  Effets
                </p>
                <ul className="space-y-1.5">
                  {creature.shinsou.effets.map((effet, i) => (
                    <li key={i} className="flex items-start gap-2 font-body text-sm text-[#e9e4d6]/85">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: rankColor }} />
                      {effet}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* ═══ POUVOIRS ET CAPACITÉS ═══ */}
        {creature.pouvoirs.length > 0 && (
          <div>
            <SectionTitle>Pouvoirs et Capacités</SectionTitle>
            <div className="space-y-3">
              {creature.pouvoirs.map((pouvoir, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg group/pwr transition-colors duration-200"
                  style={{
                    background: "rgba(255,255,255,0.015)",
                    border: "1px solid var(--border-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = `${rankColor}25`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.015)";
                    e.currentTarget.style.borderColor = "var(--border-secondary)";
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap size={12} style={{ color: rankColor }} />
                    <span
                      className="font-display text-[0.7rem] tracking-[0.12em] uppercase"
                      style={{ color: rankColor }}
                    >
                      {pouvoir.nom}
                    </span>
                  </div>
                  <p className="font-body text-sm leading-relaxed text-[#e9e4d6]/80 pl-5">
                    {pouvoir.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ VARIANTES ═══ */}
        {creature.variantes.length > 0 && (
          <>
            <Separator />
            <div>
              <SectionTitle>Les Variantes de {creature.name}</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {creature.variantes.map((variete, i) => (
                  <div
                    key={i}
                    className="relative rounded-lg overflow-hidden"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                    }}
                  >
                    {/* Mini image or gradient */}
                    <div className="relative w-full h-32 overflow-hidden">
                      {variete.imageUrl ? (
                        <Image
                          src={variete.imageUrl}
                          alt={variete.nom}
                          fill
                          className="object-cover"
                          style={{ filter: "saturate(0.6) brightness(0.5)" }}
                          unoptimized
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${rankColor}11 0%, var(--bg-card) 100%)`,
                          }}
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(to top, var(--bg-card) 0%, transparent 60%)",
                        }}
                      />
                      {/* Variant rank */}
                      {variete.rank && (
                        <div className="absolute top-2 right-2">
                          <span
                            className="font-display text-[0.55rem] tracking-[0.12em] px-1.5 py-0.5 rounded-sm"
                            style={{
                              color: RANK_COLORS[variete.rank] || "#78716C",
                              border: `1px solid ${RANK_COLORS[variete.rank] || "#78716C"}33`,
                              background: "rgba(0,0,0,0.5)",
                              backdropFilter: "blur(4px)",
                            }}
                          >
                            {variete.rank}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 -mt-4 relative z-10">
                      <h4
                        className="font-display text-xs tracking-[0.08em] mb-1"
                        style={{ color: "#e9e4d6" }}
                      >
                        {variete.nom}
                      </h4>
                      <p className="font-body text-xs leading-relaxed text-[#e9e4d6]/60 line-clamp-3">
                        {variete.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══ CARACTÉRISTIQUES OBSERVÉES ═══ */}
        {creature.caracteristiques.length > 0 && (
          <>
            <Separator />
            <div>
              <SectionTitle>Caractéristiques Observées</SectionTitle>
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--border-secondary)",
                  background: "rgba(255,255,255,0.015)",
                }}
              >
                {creature.caracteristiques.map((carac, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3"
                    style={{
                      borderBottom:
                        i < creature.caracteristiques.length - 1
                          ? "1px solid var(--border-secondary)"
                          : "none",
                    }}
                  >
                    <span
                      className="font-display text-[0.65rem] tracking-[0.1em] uppercase min-w-[140px] sm:min-w-[180px] flex-shrink-0 pt-px"
                      style={{ color: "#c9a25a" }}
                    >
                      {carac.label}
                    </span>
                    <span className="font-body text-sm text-[#e9e4d6]/85">
                      {carac.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>

      {/* SSS rainbow keyframe */}
      {isSSS && (
        <style>{`
          @keyframes sss-rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      )}
    </div>
  );
}