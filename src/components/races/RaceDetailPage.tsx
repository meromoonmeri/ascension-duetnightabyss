"use client";

import React, { useRef, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigation } from "@/store/navigationStore";
import { getRaceById, type RaceData, type RaceTechnique } from "@/data/races";
import { SKILL_TREES, type SkillTree } from "@/data/skillTrees";
import SkillTreeView from "@/components/skilltree/SkillTreeView";
import {
  FourPointStar,
  EngravedText,
} from "@/components/shared/Ornaments";

export default function RaceDetailPage() {
  const { pageParams, goBack, navigate } = useNavigation();
  const raceId = pageParams.raceId;
  const race: RaceData | undefined = getRaceById(raceId);
  const skillTree: SkillTree | undefined = SKILL_TREES.find(t => t.raceId === race?.id);

  const [activeTab, setActiveTab] = useState<"archives" | "skilltree">("archives");
  const tabBarRef = useRef<HTMLDivElement>(null);

  // ─── Navigate to technique detail ───
  const handleTechniqueClick = useCallback(
    (technique: RaceTechnique) => {
      navigate("race-technique", {
        raceId: race!.id,
        techniqueId: technique.id,
        techniqueName: technique.nameFr,
        raceName: race!.name,
        accentColor: race!.colors.primary,
      });
    },
    [navigate, race]
  );

  // ─── Not found state ───
  if (!race) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <FourPointStar size={48} className="mx-auto mb-6 opacity-30" />
          <h1 className="font-display text-2xl text-txt-secondary-custom mb-2">
            Race non trouvée
          </h1>
          <p className="font-body text-sm text-txt-tertiary-custom mb-6">
            Cette race n&apos;existe pas dans nos archives.
          </p>
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border-accent)] rounded text-sm font-display uppercase tracking-wider text-txt-secondary-custom hover:text-[var(--text-primary)] hover:border-[var(--silver)] transition-colors"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        </div>
      </div>
    );
  }

  const primary = race.colors.primary;
  const secondary = race.colors.secondary;
  const glow = race.colors.glow;
  const bg = race.colors.bg;

  return (
    <div
      className="relative min-h-screen pb-20"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${bg} 0%, transparent 50%), var(--bg-primary)`,
      }}
    >
      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ─── Back button + Breadcrumb ─── */}
        <div className="mb-8">
          {/* Back button */}
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-sm text-sm font-display uppercase tracking-wider transition-colors duration-200 hover:gap-3"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-tertiary)";
            }}
            aria-label="Retour"
          >
            <ArrowLeft size={16} />
            <span>Retour</span>
          </button>

          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="font-body text-sm">
            <ol className="flex items-center gap-2 text-txt-tertiary-custom">
              <li>
                <button
                  onClick={() => navigate("home")}
                  className="hover:text-txt-secondary-custom transition-colors"
                >
                  Accueil
                </button>
              </li>
              <li
                className="opacity-40"
                aria-hidden="true"
              >
                &rsaquo;
              </li>
              <li>
                <button
                  onClick={() => navigate("races")}
                  className="hover:text-txt-secondary-custom transition-colors"
                >
                  Races
                </button>
              </li>
              <li
                className="opacity-40"
                aria-hidden="true"
              >
                &rsaquo;
              </li>
              <li style={{ color: primary }} className="text-txt-secondary-custom">
                {race.name}
              </li>
            </ol>
          </nav>
        </div>

        {/* ─── RACE HEADER ─── */}
        <header className="mb-12 text-center">
          {/* Hero GIF (if available) */}
          {race.heroGif && (
            <div className="flex justify-center mb-6">
              <div
                className="relative rounded-xl overflow-hidden border"
                style={{
                  borderColor: primary + "30",
                  boxShadow: `0 0 40px ${glow}20, 0 0 80px ${bg}30`,
                  maxWidth: 480,
                }}
              >
                <img
                  src={race.heroGif}
                  alt={`${race.name} — animation`}
                  className="w-full h-auto object-contain"
                  style={{ background: `radial-gradient(ellipse at center, ${bg}40, transparent 70%)` }}
                />
              </div>
            </div>
          )}

          {/* Race icon */}
          <div className="flex justify-center mb-4" aria-hidden="true">
            <img src={race.icon} alt={race.name} className="w-16 h-16 object-contain" style={{ filter: `drop-shadow(0 0 12px ${race.colors.glow})` }} />
          </div>

          {/* Japanese name */}
          <EngravedText
            as="p"
            className="font-display text-sm tracking-[0.4em] uppercase mb-3"
          >
            {race.nameJp}
          </EngravedText>

          {/* Race name */}
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider mb-3"
            style={{ color: primary, textShadow: `0 0 30px ${glow}` }}
          >
            {race.name}
          </h1>

          {/* Subtitle */}
          <p
            className="font-body text-lg sm:text-xl italic"
            style={{ color: secondary }}
          >
            {race.subtitle}
          </p>

          {/* Decorative separator */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div
              className="h-px w-16 sm:w-24"
              style={{ background: `linear-gradient(to right, transparent, ${primary}60)` }}
            />
            <FourPointStar size={12} color={primary} />
            <div
              className="h-px w-16 sm:w-24"
              style={{ background: `linear-gradient(to left, transparent, ${primary}60)` }}
            />
          </div>
        </header>

        {/* ─── TAB BAR ─── */}
        <div
          ref={tabBarRef}
          className="flex items-center gap-0 mb-10 border-b"
          style={{ borderColor: primary + "20" }}
        >
          <button
            onClick={() => {
              setActiveTab("archives");
              tabBarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`
              relative px-6 py-3 font-display text-[0.65rem] tracking-[0.15em] uppercase transition-all duration-300
              ${activeTab === "archives" ? "text-txt-primary" : "text-txt-tertiary hover:text-txt-secondary"}
            `}
          >
            ✦ Archives
            {activeTab === "archives" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: primary }} />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("skilltree");
              tabBarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`
              relative px-6 py-3 font-display text-[0.65rem] tracking-[0.15em] uppercase transition-all duration-300
              ${activeTab === "skilltree" ? "text-txt-primary" : "text-txt-tertiary hover:text-txt-secondary"}
            `}
          >
            ✦ Arbre de Compétences
            {activeTab === "skilltree" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: primary }} />
            )}
          </button>
        </div>

        {activeTab === "archives" && (
        <>
        {/* ─── DESCRIPTION / LORE ─── */}
        <section className="mb-12" aria-labelledby="race-lore-heading">
          <div
            className="rounded-sm border p-6 sm:p-8"
            style={{
              borderColor: primary + "20",
              background: bg,
            }}
          >
            <h2
              id="race-lore-heading"
              className="font-display text-xs uppercase tracking-[0.3em] mb-4"
              style={{ color: primary }}
            >
              Archives
            </h2>
            <p className="font-body text-base leading-relaxed text-txt-secondary-custom mb-4">
              {race.description}
            </p>
            <p className="font-body text-base leading-relaxed text-txt-tertiary-custom">
              {race.lore}
            </p>
          </div>
        </section>

        {/* ─── CHARACTERISTICS (Character Sheet Style) ─── */}
        <section className="mb-16" aria-labelledby="race-characteristics-heading">
          <div className="flex items-center gap-3 mb-6">
            <h2
              id="race-characteristics-heading"
              className="font-display text-xs uppercase tracking-[0.3em]"
              style={{ color: primary }}
            >
              Caractéristiques Raciales
            </h2>
            <div
              className="flex-1 h-px"
              style={{ background: `linear-gradient(to right, ${primary}40, transparent)` }}
            />
          </div>

          <div
            className="rounded-sm border overflow-hidden"
            style={{ borderColor: primary + "20" }}
          >
            {race.characteristics.map((char, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors duration-200"
                style={{
                  borderBottom:
                    i < race.characteristics.length - 1
                      ? `1px solid ${primary}12`
                      : "none",
                }}
              >
                {/* Index number */}
                <span
                  className="font-display text-xs font-semibold mt-0.5 flex-shrink-0 w-6 text-right"
                  style={{ color: primary, opacity: 0.6 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Dot indicator */}
                <span
                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: primary, opacity: 0.5 }}
                />

                {/* Characteristic text */}
                <span className="font-body text-sm leading-relaxed text-txt-secondary-custom">
                  {char}
                </span>
              </div>
            ))}
          </div>
        </section>

        </>
        )}

        {activeTab === "skilltree" && skillTree ? (
          <section className="mb-16 -mx-4 sm:-mx-8 md:-mx-12" aria-labelledby="skilltree-heading">
            <SkillTreeView
              tree={skillTree}
              raceColor={primary}
              raceSecondary={secondary}
              raceGlow={glow}
              raceBg={bg}
            />
          </section>
        ) : activeTab === "skilltree" && !skillTree ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FourPointStar size={32} color={primary} className="opacity-30" />
            <p className="font-body text-sm text-txt-tertiary">Arbre de compétences bientôt disponible pour cette race.</p>
          </div>
        ) : null}

        {/* ─── BOTTOM ACCENT ─── */}
        <div className="mt-20 flex items-center justify-center gap-3">
          <div
            className="h-px w-16"
            style={{ background: `linear-gradient(to right, transparent, ${primary}40)` }}
          />
          <FourPointStar size={10} color={primary} className="opacity-30" />
          <div
            className="h-px w-16"
            style={{ background: `linear-gradient(to left, transparent, ${primary}40)` }}
          />
        </div>
      </main>
    </div>
  );
}