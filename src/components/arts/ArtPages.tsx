"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ART_DATA, type ArtData, type ArtTechnique, type SubBranch, getArtById } from "@/data/arts";
import { useNavigation } from "@/store/navigationStore";
import {
  OrnateCard,
  SectionSeparator,
  FourPointStar,
} from "@/components/shared/Ornaments";
import { useTheme } from "@/components/layout/ThemeProvider";
import TechniqueCard from "@/components/technique/TechniqueCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ==========================================
// UTILITY: Truncate text to ~2 lines
// ==========================================
function truncateLines(text: string, maxLines: number = 2): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let result = "";
  let lineCount = 0;

  for (const sentence of sentences) {
    const candidate = result ? `${result} ${sentence}` : sentence;
    if (candidate.length > lineCount * 80 && lineCount >= maxLines) break;
    result = candidate;
    lineCount = Math.ceil(result.length / 80);
  }

  if (result !== text) {
    return result.endsWith(".") ? result.slice(0, -1) + "…" : result + "…";
  }
  return result;
}

// ==========================================
// ART GRID PAGE
// ==========================================
export function ArtGridPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { navigate } = useNavigation();
  const { isDark } = useTheme();

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const titleEl = containerRef.current?.querySelector(".art-grid-title");
      if (titleEl) {
        gsap.fromTo(
          titleEl,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: titleEl,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      const gridEl = containerRef.current?.querySelector(".art-card-grid");
      if (gridEl) {
        const cards = gridEl.querySelectorAll(".art-card-item");
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: gridEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
    >
      {/* Title Section */}
      <div className="art-grid-title text-center mb-12 sm:mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--ornament-color)]" />
          <FourPointStar size={16} />
          <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--ornament-color)]" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-txt-accent tracking-[0.12em] text-engraved">
          LES HUIT ARTS
        </h1>
        <p className="font-body text-sm sm:text-base text-txt-tertiary mt-3 max-w-2xl mx-auto leading-relaxed">
          Huit arts de magie couvrant l&apos;ensemble des pratiques d&apos;Ascension
          — de la manipulation élémentaire aux Arts Défendus les plus dangereux.
        </p>
      </div>

      <SectionSeparator />

      {/* Art Grid — 2x4 on desktop, 2 cols on mobile */}
      <div className="art-card-grid grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12">
        {ART_DATA.map((art) => {
          const colors = isDark ? art.colors : art.dayColors;
          const excerpt = truncateLines(art.description, 2);

          return (
            <OrnateCard
              key={art.id}
              glowColor={art.colors.glow}
              className="art-card-item"
              onClick={() =>
                navigate("art-detail", { artId: art.id, name: art.name })
              }
            >
              <div className="p-4 sm:p-6 flex flex-col h-full">
                {/* Icon */}
                <div
                  className="text-3xl sm:text-4xl mb-3 transition-transform duration-300 group-hover:scale-110"
                  role="img"
                  aria-label={`Icône ${art.name}`}
                >
                  {art.icon}
                </div>

                {/* Art Name */}
                <h2
                  className="font-display text-xs sm:text-sm tracking-[0.08em] text-engraved leading-tight"
                  style={{ color: colors.text }}
                >
                  {art.name.toUpperCase()}
                </h2>

                {/* Subtitle */}
                <p
                  className="font-body text-[0.65rem] sm:text-xs mt-2 italic opacity-70"
                  style={{ color: colors.text }}
                >
                  {art.subtitle}
                </p>

                {/* Brief description excerpt */}
                <p className="font-body text-xs sm:text-sm text-txt-tertiary mt-3 leading-relaxed line-clamp-2">
                  {excerpt}
                </p>

                {/* Sub-branch count */}
                <div className="mt-auto pt-3">
                  <span
                    className="font-mono-custom text-[0.6rem] px-2 py-0.5 rounded"
                    style={{
                      color: colors.text,
                      backgroundColor: `${colors.primary}15`,
                      border: `1px solid ${colors.primary}25`,
                    }}
                  >
                    {art.subBranches.filter((b) => !b.isForbidden).length} branches
                    {art.subBranches.some((b) => b.isForbidden) && (
                      <span
                        className="ml-1.5"
                        style={{ color: "#DC2626" }}
                      >
                        + interdits
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </OrnateCard>
          );
        })}
      </div>

      {/* Bottom spacer */}
      <div className="h-16" />
    </div>
  );
}

// ==========================================
// ART TECHNIQUE GENERATOR (AI)
// ==========================================
function ArtTechniqueGenerator({
  art,
  colors,
}: {
  art: ArtData;
  colors: ArtData["colors"];
}) {
  const c = art.colors;
  const [generated, setGenerated] = useState<ArtTechnique | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<ArtTechnique[]>([]);

  const generateTechnique = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-technique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artId: art.id,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      setGenerated(data.technique);
      setGenerationHistory((prev) => [data.technique, ...prev].slice(0, 10));
      setCustomPrompt("");
      setShowPrompt(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsGenerating(false);
    }
  }, [art.id, customPrompt]);

  const downloadDocx = useCallback(async (technique: ArtTechnique) => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/download-technique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technique, artName: art.name, artColor: c.primary }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${technique.nameFr.replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return (
    <section className="art-scroll-reveal mt-12 sm:mt-16">
      <h2
        className="font-display text-sm sm:text-base tracking-[0.15em] mb-6 text-center"
        style={{ color: colors.text }}
      >
        GÉNÉRATEUR DE TECHNIQUE
      </h2>

      <div
        className="rounded-lg p-6 sm:p-8"
        style={{
          background: art.colors.bg,
          border: `1px solid ${c.primary}20`,
        }}
      >
        <p className="font-body text-sm text-txt-secondary mb-6 text-center leading-relaxed">
          Générez une technique unique pour les {art.name} grâce à
          l&apos;intelligence artificielle.
        </p>

        {/* Custom prompt toggle */}
        <div className="text-center mb-4">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="font-body text-xs text-txt-tertiary hover:text-txt-secondary transition-colors underline underline-offset-2"
          >
            {showPrompt ? "Masquer le champ personnalisé" : "Ajouter une description personnalisée"}
          </button>
        </div>

        {showPrompt && (
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Décrivez la technique que vous souhaitez..."
            className="w-full rounded p-3 mb-4 font-body text-sm bg-transparent border border-bdr-secondary text-txt-primary placeholder:text-txt-tertiary/50 focus:outline-none focus:border-[var(--gold)]/50 resize-none h-20"
            maxLength={500}
          />
        )}

        {/* Generate button */}
        <div className="flex justify-center">
          <button
            onClick={generateTechnique}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] uppercase px-6 py-3 rounded transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              color: c.text,
              border: `1px solid ${c.primary}55`,
              background: `${c.primary}15`,
            }}
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Génération...
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Générer une technique
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 text-center">
            <p className="font-body text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Generated technique display */}
      {generated && (
        <div className="mt-8">
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => downloadDocx(generated)}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded transition-all duration-300 disabled:opacity-50"
              style={{
                color: c.text,
                border: `1px solid ${c.primary}44`,
                background: `${c.primary}0A`,
              }}
            >
              {isDownloading ? (
                <svg
                  className="animate-spin h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              Télécharger .docx
            </button>
            <button
              onClick={generateTechnique}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded transition-all duration-300 disabled:opacity-50 hover:border-[var(--silver)] hover:text-[var(--silver)]"
              style={{
                color: "var(--text-tertiary)",
                border: "1px solid var(--border-accent)",
              }}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Régénérer
            </button>
          </div>

          <TechniqueCard
            data={{
              ...generated,
              artColor: c.primary,
            }}
          />
        </div>
      )}

      {/* Generation history */}
      {generationHistory.length > 1 && (
        <div className="mt-10">
          <h3
            className="font-display text-xs tracking-[0.15em] mb-4 text-center uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            Historique de génération
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
            {generationHistory.slice(1).map((tech, i) => (
              <div
                key={`${tech.nameJp}-${i}`}
                className="flex items-center justify-between rounded px-4 py-3 transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: c.bg,
                  border: `1px solid ${c.primary}15`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="font-mono-custom text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      color: c.text,
                      backgroundColor: `${c.primary}22`,
                      border: `1px solid ${c.primary}33`,
                    }}
                  >
                    {tech.rank}
                  </span>
                  <span
                    className="font-display text-xs truncate"
                    style={{ color: c.text }}
                  >
                    {tech.nameFr}
                  </span>
                  <span className="font-body text-[0.65rem] opacity-40 truncate hidden sm:inline">
                    {tech.nameJp}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setGenerated(tech)}
                    className="font-body text-xs text-txt-tertiary hover:text-txt-secondary transition-colors px-2 py-1"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => downloadDocx(tech)}
                    className="font-body text-xs text-txt-tertiary hover:text-txt-secondary transition-colors px-2 py-1"
                  >
                    .docx
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ==========================================
// SUB-BRANCH ACCORDION ITEM
// ==========================================
function SubBranchCard({
  branch,
  artColors,
  index,
}: {
  branch: SubBranch;
  artColors: ArtData["colors"];
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [isOpen]);

  const isForbidden = branch.isForbidden;

  return (
    <div
      className="art-scroll-reveal"
      style={{
        animationDelay: `${index * 0.08}s`,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left group"
        aria-expanded={isOpen}
      >
        <div
          className={`
            rounded-lg p-4 sm:p-5 transition-all duration-300
            ${isForbidden
              ? "border border-red-900/50 bg-red-950/20 hover:border-red-800/60"
              : "border hover:scale-[1.005]"
            }
          `}
          style={
            !isForbidden
              ? {
                  borderColor: `${artColors.primary}25`,
                  background: artColors.bg,
                }
              : undefined
          }
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {/* Branch indicator */}
              <span
                className={`
                  inline-block w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 transition-all duration-300
                  ${isOpen ? "scale-125" : ""}
                `}
                style={{
                  backgroundColor: isForbidden
                    ? "#DC2626"
                    : isOpen
                      ? artColors.secondary
                      : artColors.primary,
                  boxShadow: isOpen
                    ? `0 0 10px ${isForbidden ? "rgba(220,38,38,0.5)" : artColors.glow}`
                    : "none",
                }}
              />
              <div className="min-w-0">
                <h3
                  className={`
                    font-display text-xs sm:text-sm tracking-[0.08em] text-engraved leading-tight
                    ${isForbidden ? "text-red-400" : ""}
                  `}
                  style={!isForbidden ? { color: artColors.text } : undefined}
                >
                  {isForbidden && "⚠ "}
                  {branch.name.toUpperCase()}
                </h3>
                <p
                  className={`
                    font-body text-xs sm:text-sm mt-1.5 leading-relaxed line-clamp-2
                    ${isForbidden ? "text-red-300/70" : "text-txt-tertiary"}
                  `}
                >
                  {branch.description}
                </p>
              </div>
            </div>

            {/* Chevron */}
            <svg
              className={`
                w-4 h-4 flex-shrink-0 mt-1 transition-transform duration-300
                ${isForbidden ? "text-red-500/60" : ""}
              `}
              style={
                !isForbidden
                  ? { color: `${artColors.text}88` }
                  : undefined
              }
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Expandable content */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-400 ease-out"
        style={{
          maxHeight: `${contentHeight}px`,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="pt-2 pb-1 pl-4 sm:pl-6 border-l-2 ml-[5px]"
          style={{
            borderColor: isForbidden
              ? "rgba(220,38,38,0.3)"
              : `${artColors.primary}30`,
          }}
        >
          <ul className="space-y-2.5 mt-2">
            {branch.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                {/* Bullet */}
                <span
                  className="inline-block w-1 h-1 rounded-full mt-2 flex-shrink-0"
                  style={{
                    backgroundColor: isForbidden
                      ? "#DC2626"
                      : artColors.secondary,
                    opacity: 0.7,
                  }}
                />
                <span
                  className={`
                    font-body text-xs sm:text-sm leading-relaxed
                    ${isForbidden ? "text-red-300/80" : "text-txt-secondary"}
                  `}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ART DETAIL PAGE
// ==========================================
export function ArtDetailPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pageParams, navigate } = useNavigation();
  const { isDark } = useTheme();

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Find art from params
  const art: ArtData | undefined = useMemo(
    () => (pageParams.artId ? getArtById(pageParams.artId) : undefined),
    [pageParams.artId]
  );

  // Colors
  const colors = useMemo(
    () =>
      art ? (isDark ? art.colors : art.dayColors) : null,
    [art, isDark]
  );

  // GSAP animations
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current || !art) return;

    const ctx = gsap.context(() => {
      // Header reveal
      const headerEl = containerRef.current?.querySelector(".art-detail-header");
      if (headerEl) {
        gsap.fromTo(
          headerEl,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerEl,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Scroll-reveal sections
      gsap.utils
        .toArray<HTMLElement>(".art-scroll-reveal")
        .forEach((el) => {
          gsap.fromTo(
            el,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, art]);

  if (!art || !colors) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <FourPointStar size={40} className="mx-auto mb-6 opacity-30" />
        <h1 className="font-display text-xl text-txt-accent tracking-[0.12em] text-engraved mb-4">
          ART INTROUVABLE
        </h1>
        <p className="font-body text-sm text-txt-tertiary mb-8">
          L&apos;Art demandé n&apos;existe pas dans nos archives.
        </p>
        <button
          onClick={() => navigate("arts")}
          className="font-display text-xs tracking-[0.15em] uppercase border border-bdr-accent text-txt-accent hover:border-silver hover:text-silver px-6 py-3 rounded transition-all duration-300"
        >
          Retour aux Arts
        </button>
      </div>
    );
  }

  const normalBranches = art.subBranches.filter((b) => !b.isForbidden);
  const forbiddenBranches = art.subBranches.filter((b) => b.isForbidden);

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* ===== BREADCRUMB ===== */}
      <nav aria-label="Fil d'Ariane" className="mb-8 sm:mb-12 art-scroll-reveal">
        <ol className="flex items-center gap-2 text-xs sm:text-sm font-body">
          <li>
            <button
              onClick={() => navigate("home")}
              className="text-txt-tertiary hover:text-silver transition-colors"
            >
              Accueil
            </button>
          </li>
          <li aria-hidden="true" className="text-txt-tertiary opacity-40">
            &gt;
          </li>
          <li>
            <button
              onClick={() => navigate("arts")}
              className="text-txt-tertiary hover:text-silver transition-colors"
            >
              Arts
            </button>
          </li>
          <li aria-hidden="true" className="text-txt-tertiary opacity-40">
            &gt;
          </li>
          <li style={{ color: colors.text }} className="truncate max-w-[200px]">
            {art.name}
          </li>
        </ol>
      </nav>

      {/* ===== HEADER ===== */}
      <header className="art-detail-header text-center mb-12 sm:mb-16">
        {/* Icon */}
        <div
          className="text-5xl sm:text-6xl mb-6 inline-block"
          role="img"
          aria-label={`Icône ${art.name}`}
        >
          {art.icon}
        </div>

        {/* Title */}
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] text-engraved leading-tight"
          style={{ color: colors.text }}
        >
          {art.name.toUpperCase()}
        </h1>

        {/* Subtitle */}
        <p
          className="font-body text-sm sm:text-base mt-4 italic opacity-70 max-w-xl mx-auto"
          style={{ color: colors.text }}
        >
          {art.subtitle}
        </p>

        {/* Accent line */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div
            className="h-px w-16 sm:w-24"
            style={{
              background: `linear-gradient(to right, transparent, ${art.colors.primary})`,
            }}
          />
          <FourPointStar size={14} color={art.colors.primary} />
          <div
            className="h-px w-16 sm:w-24"
            style={{
              background: `linear-gradient(to left, transparent, ${art.colors.primary})`,
            }}
          />
        </div>
      </header>

      <SectionSeparator />

      {/* ===== DESCRIPTION ===== */}
      <section className="art-scroll-reveal mt-12 sm:mt-16">
        <h2
          className="font-display text-sm sm:text-base tracking-[0.15em] mb-4"
          style={{ color: colors.text }}
        >
          DESCRIPTION
        </h2>
        <div
          className="rounded p-5 sm:p-8"
          style={{
            background: art.colors.bg,
            borderLeft: `3px solid ${art.colors.primary}`,
          }}
        >
          <p className="font-body text-sm sm:text-base text-txt-primary leading-relaxed">
            {art.description}
          </p>
        </div>
      </section>

      {/* ===== LORE ===== */}
      <section className="art-scroll-reveal mt-10 sm:mt-14">
        <h2
          className="font-display text-sm sm:text-base tracking-[0.15em] mb-4"
          style={{ color: colors.text }}
        >
          LORE
        </h2>
        <div
          className="rounded p-5 sm:p-8"
          style={{
            background: art.colors.bg,
            borderLeft: `3px solid ${art.colors.primary}`,
          }}
        >
          <p className="font-body text-sm sm:text-base text-txt-secondary leading-relaxed italic">
            {art.lore}
          </p>
        </div>
      </section>

      <SectionSeparator className="mt-12 sm:mt-16" />

      {/* ===== SUB-BRANCHES ===== */}
      <section className="art-scroll-reveal mt-12 sm:mt-16">
        <h2
          className="font-display text-sm sm:text-base tracking-[0.15em] mb-2 text-center"
          style={{ color: colors.text }}
        >
          BRANCHES & SOUS-DISCIPLINES
        </h2>
        <p className="font-body text-xs text-txt-tertiary text-center mb-8">
          {normalBranches.length} branche{normalBranches.length > 1 ? "s" : ""} documentée{normalBranches.length > 1 ? "s" : ""}
          {forbiddenBranches.length > 0 &&
            ` · ${forbiddenBranches.length} section${forbiddenBranches.length > 1 ? "s" : ""} interdite${forbiddenBranches.length > 1 ? "s" : ""}`}
        </p>

        <div className="space-y-3">
          {art.subBranches.map((branch, i) => (
            <SubBranchCard
              key={branch.id}
              branch={branch}
              artColors={art.colors}
              index={i}
            />
          ))}
        </div>
      </section>

      <SectionSeparator className="mt-12 sm:mt-16" />

      {/* ===== AI TECHNIQUE GENERATION ===== */}
      <ArtTechniqueGenerator art={art} colors={colors} />

      {/* ===== BACK BUTTON ===== */}
      <div className="art-scroll-reveal mt-12 sm:mt-16 text-center">
        <button
          onClick={() => navigate("arts")}
          className="font-display text-xs tracking-[0.15em] uppercase border border-bdr-accent text-txt-tertiary hover:border-silver hover:text-silver px-6 py-3 rounded transition-all duration-300"
        >
          ← Retour aux Arts
        </button>
      </div>

      {/* Bottom spacer */}
      <div className="h-16" />
    </div>
  );
}