"use client";

import { useState, useEffect, useRef } from "react";
import { RACE_DATA } from "@/data/races";
import { SKILL_TREES } from "@/data/skillTrees";
import { useNavigation } from "@/store/navigationStore";
import SkillTreeView from "./SkillTreeView";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════
   CSS KEYFRAMES (injected via style tag)
   ═══════════════════════════════════════════════════════════════ */

const SKILLTREE_CSS = `
@keyframes st-star-drift {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
  15% { opacity: 0.7; }
  85% { opacity: 0.2; }
  50% { transform: translateY(-60px) translateX(15px); }
}

@keyframes st-shimmer-sweep {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}

@keyframes st-glow-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.9; }
}

@keyframes st-header-line {
  0%, 100% { opacity: 0.5; width: 60%; }
  50% { opacity: 1; width: 80%; }
}

@keyframes st-float-icon {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(3deg); }
}

.st-star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.5);
  animation: st-star-drift linear infinite;
  pointer-events: none;
}

.st-glass {
  background: rgba(10, 10, 15, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.st-shimmer-btn {
  position: relative;
  overflow: hidden;
}

.st-shimmer-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.06) 45%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.06) 55%,
    transparent 100%
  );
  animation: st-shimmer-sweep 3.5s ease-in-out infinite;
  pointer-events: none;
}

.st-scroll-area::-webkit-scrollbar {
  height: 4px;
}
.st-scroll-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 2px;
}
.st-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
.st-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
`;

/* ═══════════════════════════════════════════════════════════════
   STAR PARTICLES (deterministic)
   ═══════════════════════════════════════════════════════════════ */

const HEADER_STARS = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 23 + 7) % 80 + 10}%`,
  w: 1.5 + (i % 3) * 1,
  dur: `${5 + (i % 4) * 1.5}s`,
  delay: `${(i * 0.7) % 6}s`,
  opacity: 0.2 + (i % 3) * 0.2,
}));

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function SkillTreePage() {
  const { navigate } = useNavigation();
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const raceBarRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  const selectedTree = selectedRaceId ? SKILL_TREES.find(t => t.raceId === selectedRaceId) : null;
  const selectedRace = selectedRaceId ? RACE_DATA.find(r => r.id === selectedRaceId) : null;

  /* ── GSAP entrance animations ── */
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
      }
      if (raceBarRef.current) {
        gsap.fromTo(raceBarRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: "power3.out" }
        );
      }
      if (treeRef.current && selectedTree) {
        gsap.fromTo(treeRef.current,
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.6, delay: 0.15, ease: "power2.out" }
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, [selectedRaceId, selectedTree]);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "#0A0A0F",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{SKILLTREE_CSS}</style>

      {/* ── Radial gradient background ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.02) 0%, transparent 40%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════
          CINEMATIC HEADER
          ═══════════════════════════════════════════════════════ */}
      <div
        ref={headerRef}
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "clamp(40px, 8vw, 80px)",
          paddingBottom: "clamp(28px, 5vw, 48px)",
          overflow: "hidden",
        }}
      >
        {/* Star particles */}
        {HEADER_STARS.map(s => (
          <div
            key={s.id}
            className="st-star"
            style={{
              left: s.left,
              top: s.top,
              width: s.w,
              height: s.w,
              animationDuration: s.dur,
              animationDelay: s.delay,
              opacity: s.opacity,
            }}
          />
        ))}

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 20px",
            textAlign: "center",
          }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate(selectedRaceId ? "races" : "home")}
            style={{
              position: "absolute",
              top: 4,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "6px 14px",
              color: "rgba(255,255,255,0.5)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)";
              e.currentTarget.style.color = "#D4AF37";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Retour</span>
          </button>

          {/* Decorative top line */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 }}>
            <div
              style={{
                height: 1,
                width: "clamp(40px, 12vw, 100px)",
                background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.6))",
              }}
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
              <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="#D4AF37" />
            </svg>
            <div
              style={{
                height: 1,
                width: "clamp(40px, 12vw, 100px)",
                background: "linear-gradient(270deg, transparent, rgba(212,175,55,0.6))",
              }}
            />
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Cinzel', 'Inter', serif",
              fontSize: "clamp(22px, 5vw, 40px)",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "#D4AF37",
              textShadow: "0 0 40px rgba(212,175,55,0.3), 0 0 80px rgba(212,175,55,0.1)",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Arbres de Compétences
          </h1>

          {/* Decorative bottom line */}
          <div
            style={{
              height: 1,
              width: "clamp(100px, 30vw, 260px)",
              margin: "0 auto",
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)",
            }}
          />

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(12px, 1.5vw, 14px)",
              color: "rgba(255,255,255,0.4)",
              maxWidth: 520,
              margin: "16px auto 0",
              lineHeight: 1.7,
              letterSpacing: "0.02em",
            }}
          >
            Explorez la progression de chaque race à travers les rangs F → EX.
            Les branches de variantes se séparent au rang E et convergent au rang B.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RACE SELECTOR — Horizontal scrollable pills
          ═══════════════════════════════════════════════════════ */}
      {!selectedRaceId && (
        <div
          ref={raceBarRef}
          className="st-scroll-area"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "0 20px 16px",
            display: "flex",
            gap: 10,
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          {RACE_DATA.map((race, i) => {
            const hasTree = SKILL_TREES.some(t => t.raceId === race.id);
            const treeCount = hasTree ? (SKILL_TREES.find(t => t.raceId === race.id)?.ranks.length || 0) : 0;
            return (
              <button
                key={race.id}
                onClick={() => hasTree && setSelectedRaceId(race.id)}
                disabled={!hasTree}
                style={{
                  position: "relative",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 20px",
                  borderRadius: 12,
                  border: `1px solid ${hasTree ? `${race.colors.primary}30` : "rgba(255,255,255,0.04)"}`,
                  background: hasTree
                    ? `linear-gradient(135deg, ${race.colors.primary}10 0%, rgba(10,10,15,0.8) 100%)`
                    : "rgba(10,10,15,0.5)",
                  color: hasTree ? race.colors.text : "rgba(255,255,255,0.2)",
                  cursor: hasTree ? "pointer" : "not-allowed",
                  opacity: hasTree ? 1 : 0.35,
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.3s ease",
                  boxShadow: hasTree ? `0 0 0px ${race.colors.primary}00` : "none",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  if (!hasTree) return;
                  e.currentTarget.style.borderColor = `${race.colors.primary}60`;
                  e.currentTarget.style.boxShadow = `0 0 20px ${race.colors.glow || race.colors.primary}30`;
                  e.currentTarget.style.background = `linear-gradient(135deg, ${race.colors.primary}20 0%, rgba(10,10,15,0.85) 100%)`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  if (!hasTree) return;
                  e.currentTarget.style.borderColor = `${race.colors.primary}30`;
                  e.currentTarget.style.boxShadow = `0 0 0px ${race.colors.primary}00`;
                  e.currentTarget.style.background = `linear-gradient(135deg, ${race.colors.primary}10 0%, rgba(10,10,15,0.8) 100%)`;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Race icon */}
                <img src={race.icon} alt={race.name} style={{ width: 22, height: 22, objectFit: "contain", animation: hasTree ? "st-float-icon 4s ease-in-out infinite" : "none", animationDelay: `${i * 0.3}s` }} />

                {/* Race name + JP */}
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {race.name}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "'Noto Sans JP', sans-serif",
                      marginTop: 1,
                    }}
                  >
                    {race.nameJp}
                  </div>
                </div>

                {/* Ranks count badge */}
                {hasTree && (
                  <div
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      minWidth: 20,
                      height: 18,
                      borderRadius: 9,
                      background: race.colors.primary,
                      color: "#0A0A0F",
                      fontSize: 9,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 5px",
                      boxShadow: `0 0 10px ${race.colors.primary}50`,
                    }}
                  >
                    {treeCount}
                  </div>
                )}

                {/* No tree label */}
                {!hasTree && (
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.2)",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    BIENTÔT
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TREE VIEW (when a race is selected)
          ═══════════════════════════════════════════════════════ */}
      {selectedRaceId && selectedTree && selectedRace ? (
        <div
          ref={treeRef}
          key={selectedRaceId}
          style={{ position: "relative" }}
        >
          {/* Tree sub-header */}
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 8,
            }}
          >
            {/* Back to races */}
            <button
              onClick={() => setSelectedRaceId(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${selectedRace.colors.primary}50`;
                e.currentTarget.style.color = selectedRace.colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
              aria-label="Retour à la sélection"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Race color accent */}
            <div
              style={{
                width: 3,
                height: 32,
                borderRadius: 2,
                background: `linear-gradient(180deg, ${selectedRace.colors.primary}, ${selectedRace.colors.primary}44)`,
              }}
            />

            {/* Race info */}
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontFamily: "'Cinzel', 'Inter', serif",
                  fontSize: "clamp(16px, 3vw, 22px)",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  color: selectedRace.colors.text,
                  lineHeight: 1.2,
                }}
              >
                {selectedTree.raceName}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontStyle: "italic",
                  }}
                >
                  {selectedTree.raceNameJp}
                </span>
                {selectedTree.variants.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {selectedTree.variants.length} variantes · convergence rang {selectedTree.convergenceRank}
                  </span>
                )}
                {selectedTree.variants.length === 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Arbre linéaire
                  </span>
                )}
              </div>
            </div>

            {/* Race icon */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${selectedRace.colors.bg}`,
                border: `1px solid ${selectedRace.colors.primary}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                boxShadow: `0 0 20px ${selectedRace.colors.glow || selectedRace.colors.primary}20`,
              }}
            >
              {selectedRace.icon}
            </div>
          </div>

          {/* Variant selector pills */}
          {selectedTree.variants.length > 0 && (
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                padding: "8px 20px 16px",
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  border: "1px solid rgba(212,175,55,0.3)",
                  background: "rgba(212,175,55,0.06)",
                  color: "#D4AF37",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                ✦ Toutes les branches
              </div>
              {selectedTree.variants.map(v => (
                <div
                  key={v.id}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: `1px solid ${v.accentColor}40`,
                    background: `${v.accentColor}08`,
                    color: v.accentColor,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {v.name}
                </div>
              ))}
            </div>
          )}

          {/* Glass container for tree */}
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              padding: "0 20px 40px",
            }}
          >
            <div
              className="st-glass"
              style={{
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <SkillTreeView
                tree={selectedTree}
                raceColor={selectedRace.colors.primary}
                raceSecondary={selectedRace.colors.secondary}
                raceGlow={selectedRace.colors.glow}
                raceBg={selectedRace.colors.bg}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════════════════
          BOTTOM BRANDING
          ═══════════════════════════════════════════════════════ */}
      {!selectedRaceId && (
        <div
          style={{
            textAlign: "center",
            padding: "20px 20px 40px",
          }}
        >
          <div
            style={{
              height: 1,
              width: "clamp(60px, 15vw, 120px)",
              margin: "0 auto 12px",
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)",
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.15)",
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Ascension — Arbres de Compétences
          </span>
        </div>
      )}
    </div>
  );
}