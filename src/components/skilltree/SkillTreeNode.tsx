"use client";

import React, { useRef, useCallback } from "react";

/* ─── Props ─── */
interface SkillTreeNodeProps {
  rankLabel: string;
  title: string;
  rankColor: string;
  isUnlocked: boolean;
  isSelected: boolean;
  isOnPath: boolean;
  pathColor: string;
  isConvergence: boolean;
  orbId: string;
  onHover: () => void;
  onClick: () => void;
  isKeyboardFocused: boolean;
  onFocusNode?: () => void;
}

/* ─── Particle configurations (positioned around orb) ─── */
const PARTICLES = [
  { top: "12%", left: "22%", anim: "tensura-particle", delay: "0s", dur: "2.5s" },
  { top: "8%", left: "68%", anim: "tensura-particle-alt", delay: "0.8s", dur: "3s" },
  { top: "18%", left: "48%", anim: "tensura-particle", delay: "1.4s", dur: "2.8s" },
  { top: "6%", left: "82%", anim: "tensura-particle-alt", delay: "2.1s", dur: "3.3s" },
];

/* ─── Lock SVG icon ─── */
function LockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ─── Main Orb Component ─── */
export default function SkillTreeNode({
  rankLabel,
  title,
  rankColor,
  isUnlocked,
  isSelected,
  isOnPath,
  pathColor,
  isConvergence,
  orbId,
  onHover,
  onClick,
  isKeyboardFocused,
  onFocusNode,
}: SkillTreeNodeProps) {
  const orbRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  /* ── Derived visual state ── */
  const glowColor = isOnPath ? pathColor : rankColor;
  const orbSize = 80; // Fixed — responsive handled via container scale
  const fontSize = rankLabel.length > 1 ? "text-base" : "text-lg";

  return (
    <div className="relative flex flex-col items-center">
      {/* ── Convergence diamond marker ── */}
      {isConvergence && (
        <div className="mb-2 relative" aria-hidden="true">
          <div
            className="w-5 h-5 rotate-45 rounded-sm border-2 flex items-center justify-center"
            style={{
              borderColor: "var(--gold)",
              boxShadow:
                "0 0 12px rgba(212,175,55,0.4), 0 0 24px rgba(212,175,55,0.15)",
              background: "rgba(212,175,55,0.08)",
            }}
          >
            <div
              className="w-2 h-2 rotate-0 rounded-full"
              style={{ background: "var(--gold)" }}
            />
          </div>
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.5rem] font-mono uppercase tracking-[0.2em] opacity-60"
            style={{ color: "var(--gold)" }}
          >
            Convergence
          </span>
        </div>
      )}

      {/* ── Unlock flash ring (animated on newly unlocked) ── */}
      <div
        className="absolute rounded-full pointer-events-none tensura-unlock-flash"
        aria-hidden="true"
        style={{
          width: orbSize + 20,
          height: orbSize + 20,
          top: isConvergence ? 24 : 0,
          border: `2px solid ${rankColor}`,
          display: isUnlocked ? "block" : "none",
        }}
      />

      {/* ── The Orb ── */}
      <button
        ref={orbRef}
        type="button"
        data-orb-id={orbId}
        onClick={onClick}
        onMouseEnter={onHover}
        onFocus={onFocusNode}
        onKeyDown={handleKeyDown}
        tabIndex={isKeyboardFocused ? 0 : -1}
        className={`
          relative flex items-center justify-center rounded-full outline-none
          transition-all duration-300
          focus-visible:ring-2 focus-visible:ring-offset-2
          ${isUnlocked ? "tensura-orb-pulse cursor-pointer" : "cursor-default"}
          hover:scale-105
        `}
        style={{
          width: orbSize,
          height: orbSize,
          borderWidth: isUnlocked ? 2 : 1,
          borderStyle: "solid",
          borderColor: isUnlocked ? glowColor : "var(--border-primary)",
          background: isUnlocked
            ? `radial-gradient(circle at 35% 35%, ${glowColor}30, ${glowColor}10 60%, var(--bg-card) 100%)`
            : "var(--bg-card)",
          boxShadow: isUnlocked
            ? isSelected
              ? `0 0 20px ${glowColor}60, 0 0 40px ${glowColor}30, 0 0 60px ${glowColor}15`
              : `0 0 15px ${glowColor}40, 0 0 30px ${glowColor}20`
            : "none",
          opacity: isUnlocked ? 1 : 0.3,
          color: isUnlocked ? glowColor : "var(--text-tertiary)",
          // @ts-expect-error CSS custom property for ring color
          "--tw-ring-color": glowColor,
          "--tw-ring-offset-color": "var(--bg-primary)",
        }}
        aria-label={`Rang ${rankLabel}: ${title}${isUnlocked ? "" : " (verrouillé)"}`}
        role="treeitem"
        aria-selected={isSelected}
      >
        {/* ── Inner ring (decorative) ── */}
        {isUnlocked && (
          <div
            className="absolute rounded-full pointer-events-none"
            aria-hidden="true"
            style={{
              width: orbSize - 12,
              height: orbSize - 12,
              border: `1px solid ${glowColor}20`,
            }}
          />
        )}

        {/* ── Rank letter or lock icon ── */}
        {isUnlocked ? (
          <span
            className={`font-display ${fontSize} font-bold tracking-[0.12em] select-none relative z-10`}
            style={{
              textShadow: isSelected
                ? `0 0 12px ${glowColor}80`
                : `0 0 6px ${glowColor}40`,
            }}
          >
            {rankLabel}
          </span>
        ) : (
          <LockIcon />
        )}

        {/* ── Floating particles (CSS-only, unlocked only) ── */}
        {isUnlocked &&
          PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`${p.anim} pointer-events-none absolute rounded-full`}
              style={{
                width: 3,
                height: 3,
                top: p.top,
                left: p.left,
                background: glowColor,
                animationDelay: p.delay,
                animationDuration: p.dur,
                boxShadow: `0 0 4px ${glowColor}60`,
              }}
              aria-hidden="true"
            />
          ))}
      </button>

      {/* ── Title below orb ── */}
      <div className="mt-2 text-center max-w-[140px]">
        {isUnlocked ? (
          <span
            className="font-display text-[0.6rem] tracking-[0.1em] uppercase block leading-tight"
            style={{
              color: isOnPath ? pathColor : "var(--text-secondary)",
            }}
          >
            {title}
          </span>
        ) : (
          <span
            className="font-mono text-[0.5rem] tracking-wider uppercase block"
            style={{ color: "var(--text-tertiary)" }}
          >
            DÉBLOQUÉ AU RANG {rankLabel}
          </span>
        )}
      </div>
    </div>
  );
}