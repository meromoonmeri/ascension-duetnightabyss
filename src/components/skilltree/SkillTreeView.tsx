"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import {
  type SkillTree,
  type SkillTreeRank,
  type Ability,
  type RankTier,
  RANK_ORDER,
} from "@/data/skillTrees";
import SkillTreeNode from "./SkillTreeNode";
import { useNavigation } from "@/store/navigationStore";
import { FourPointStar } from "@/components/shared/Ornaments";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const RANK_LABELS: Record<RankTier, string> = {
  F: "Novice",
  E: "Apprenti",
  D: "Adept",
  C: "Expert",
  B: "Maître",
  A: "Élite",
  S: "Souverain",
  "S+": "Transcendant",
  EX: "Légende",
};

const RANK_COLORS: Record<RankTier, string> = {
  F: "#78716C",
  E: "#9CA3AF",
  D: "#3B82F6",
  C: "#22C55E",
  B: "#A855F7",
  A: "#EF4444",
  S: "#F59E0B",
  "S+": "#D4AF37",
  EX: "#E879A8",
};

const CATEGORY_STYLES: Record<string, string> = {
  Innée: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  Acquise: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  Extra: "bg-sky-900/40 text-sky-300 border-sky-700/50",
  Unique: "bg-rose-900/40 text-rose-300 border-rose-700/50",
};

const TYPE_STYLES: Record<string, string> = {
  active: "text-orange-400",
  passive: "text-cyan-400",
  ultimate: "text-yellow-400",
};

/* ═══════════════════════════════════════════
   WEB AUDIO HOOK
   ═══════════════════════════════════════════ */

function useTensuraAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playHover = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 800;
      gain.gain.value = 0.06;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      /* ignore audio errors */
    }
  }, [getCtx]);

  const playUnlock = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      [523.25, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.1, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.2);
      });
    } catch {
      /* ignore */
    }
  }, [getCtx]);

  const playSelect = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      [261.63, 329.63, 392.0].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.02);
        osc.stop(t + 0.3);
      });
    } catch {
      /* ignore */
    }
  }, [getCtx]);

  return { playHover, playUnlock, playSelect };
}

/* ═══════════════════════════════════════════
   BRANCH ZONE HELPER
   ═══════════════════════════════════════════ */

function getBranchZone(tree: SkillTree) {
  if (tree.variants.length === 0 || !tree.convergenceRank) {
    return { startIdx: -1, endIdx: -1, hasBranches: false };
  }
  const startIdx = RANK_ORDER.indexOf(
    tree.variants[0]?.branchStartRank || "E"
  );
  const endIdx = RANK_ORDER.indexOf(tree.convergenceRank);
  return {
    startIdx,
    endIdx,
    hasBranches: startIdx >= 0 && endIdx > startIdx,
  };
}

/* ═══════════════════════════════════════════
   ABILITY CARD (detail panel)
   ═══════════════════════════════════════════ */

function AbilityCard({
  ability,
  color,
}: {
  ability: Ability;
  color: string;
}) {
  const { navigate } = useNavigation();
  const isClickable = !!ability.techniqueId;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (ability.techniqueId) {
          navigate("technique", { techniqueId: ability.techniqueId });
        }
      }}
      disabled={!isClickable}
      className={`
        group/ability w-full text-left p-3 rounded border transition-all duration-200
        ${isClickable ? "cursor-pointer hover:border-[var(--gold-dim)]" : "cursor-default opacity-80"}
      `}
      style={{
        borderColor: "var(--border-primary)",
        background: "var(--bg-card)",
      }}
      aria-label={isClickable ? `Voir la technique: ${ability.name}` : ability.name}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-xs tracking-wider" style={{ color }}>
              {ability.name}
            </span>
            {ability.nameJp && (
              <span className="font-body text-xs opacity-40">{ability.nameJp}</span>
            )}
          </div>
          {ability.subtitle && (
            <p className="font-body text-xs italic opacity-60 mt-0.5">{ability.subtitle}</p>
          )}
          <p className="font-body text-sm leading-relaxed mt-1" style={{ color: "var(--text-tertiary)" }}>
            {ability.summary}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className={`text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${
              CATEGORY_STYLES[ability.category] || "bg-gray-800 text-gray-400 border-gray-700"
            }`}
          >
            {ability.category}
          </span>
          <span className={`text-[0.6rem] font-mono uppercase tracking-wider ${TYPE_STYLES[ability.type]}`}>
            {ability.type}
          </span>
        </div>
      </div>
      {isClickable && (
        <div className="mt-2 flex items-center gap-1 opacity-0 group-hover/ability:opacity-100 transition-opacity">
          <FourPointStar size={8} color="var(--gold)" />
          <span className="text-[0.6rem] font-mono tracking-wider" style={{ color: "var(--gold)" }}>
            VOIR LA TECHNIQUE
          </span>
        </div>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

interface SkillTreeViewProps {
  tree: SkillTree;
  raceColor: string;
  raceSecondary: string;
  raceGlow: string;
  raceBg: string;
}

interface OrbPos {
  x: number;
  y: number;
}

export default function SkillTreeView({
  tree,
  raceColor,
  raceSecondary,
  raceGlow,
  raceBg,
}: SkillTreeViewProps) {
  /* ── State ── */
  const [selectedRankIdx, setSelectedRankIdx] = useState(0); // Rank simulator (0=F → 8=EX)
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [detailRank, setDetailRank] = useState<RankTier | null>(null);
  const [detailVariantId, setDetailVariantId] = useState<string | null>(null);
  const [orbPositions, setOrbPositions] = useState<Map<string, OrbPos>>(new Map());
  const [linesReady, setLinesReady] = useState(false);

  /* ── Mobile detection (useSyncExternalStore to avoid setState in effect) ── */
  const isMobile = useSyncExternalStore(
    useCallback((cb: () => void) => {
      const mq = window.matchMedia("(max-width: 768px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    }, []),
    useCallback(() => window.matchMedia("(max-width: 768px)").matches, []),
    () => false
  );

  /* ── Refs ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const treeAreaRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const prevRankIdxRef = useRef(0);
  const prefersReducedMotionRef = useRef(false);

  /* ── Audio ── */
  const { playHover, playUnlock, playSelect } = useTensuraAudio();

  /* ── Derived ── */
  const { hasBranches, startIdx, endIdx } = useMemo(
    () => getBranchZone(tree),
    [tree]
  );
  const showVariantSpread = hasBranches && tree.variants.length > 1;
  const activeVariant = tree.variants.find((v) => v.id === activeVariantId) || null;

  const isRankUnlocked = useCallback(
    (tier: RankTier) => RANK_ORDER.indexOf(tier) <= selectedRankIdx,
    [selectedRankIdx]
  );

  const detailRankData = detailRank
    ? tree.ranks.find((r) => r.rank === detailRank)
    : null;

  /* ── Reduced motion ── */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);



  /* ── Entrance animation ── */
  useEffect(() => {
    if (!containerRef.current || prefersReducedMotionRef.current) return;
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" });
  }, []);

  /* ── Measure orb positions for SVG lines ── */
  const measureOrbs = useCallback(() => {
    const area = treeAreaRef.current;
    if (!area) return;
    requestAnimationFrame(() => {
      const areaRect = area.getBoundingClientRect();
      const positions = new Map<string, OrbPos>();
      area.querySelectorAll<HTMLElement>("[data-orb-id]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const id = el.dataset.orbId!;
        positions.set(id, {
          x: rect.left + rect.width / 2 - areaRect.left,
          y: rect.top + rect.height / 2 - areaRect.top,
        });
      });
      setOrbPositions(positions);
      setLinesReady(true);
    });
  }, []);

  useEffect(() => {
    measureOrbs();
    const area = treeAreaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(measureOrbs);
    observer.observe(area);
    return () => observer.disconnect();
  }, [measureOrbs, selectedRankIdx, activeVariantId, tree]);

  /* ── Unlock flash animation ── */
  useEffect(() => {
    if (prefersReducedMotionRef.current) return;
    const prevIdx = prevRankIdxRef.current;
    const newIdx = selectedRankIdx;
    if (newIdx > prevIdx) {
      for (let i = prevIdx + 1; i <= newIdx; i++) {
        const tier = RANK_ORDER[i];
        const area = treeAreaRef.current;
        if (!area) continue;
        area.querySelectorAll<HTMLElement>(`[data-orb-id^="single-${tier}"], [data-orb-id^="var-${tier}"]`).forEach((el) => {
          gsap.fromTo(
            el,
            { boxShadow: `0 0 0px ${RANK_COLORS[tier]}` },
            {
              boxShadow: `0 0 40px ${RANK_COLORS[tier]}, 0 0 80px ${RANK_COLORS[tier]}40`,
              duration: 0.6,
              ease: "power2.out",
              clearProps: "boxShadow",
            }
          );
        });
      }
    }
    prevRankIdxRef.current = newIdx;
  }, [selectedRankIdx]);

  /* ── Detail panel animation ── */
  useEffect(() => {
    if (!detailRank) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    // Reset position
    if (isMobile) {
      gsap.set(panel, { y: "100%" });
    } else {
      gsap.set(panel, { x: "100%" });
    }
    gsap.set(backdrop, { opacity: 0, display: "block" });

    requestAnimationFrame(() => {
      if (isMobile) {
        gsap.to(panel, { y: 0, duration: 0.4, ease: "power3.out" });
      } else {
        gsap.to(panel, { x: 0, duration: 0.4, ease: "power3.out" });
      }
      gsap.to(backdrop, { opacity: 1, duration: 0.3 });
    });
  }, [detailRank, isMobile]);

  /* ── Handlers ── */
  const handleRankChange = useCallback(
    (newIdx: number) => {
      const prevIdx = selectedRankIdx;
      setSelectedRankIdx(newIdx);
      if (newIdx > prevIdx && !prefersReducedMotionRef.current) {
        playUnlock();
      }
    },
    [selectedRankIdx, playUnlock]
  );

  const handleVariantClick = useCallback((variantId: string) => {
    setActiveVariantId((prev) => (prev === variantId ? null : variantId));
    playSelect();
  }, [playSelect]);

  const handleOrbClick = useCallback(
    (rank: SkillTreeRank, variantId?: string) => {
      const tier = rank.rank as RankTier;
      if (!isRankUnlocked(tier)) return;
      setDetailRank(tier);
      setDetailVariantId(variantId || activeVariantId);
      playSelect();
    },
    [isRankUnlocked, activeVariantId, playSelect]
  );

  const closeDetailPanel = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (panel && backdrop) {
      if (isMobile) {
        gsap.to(panel, {
          y: "100%",
          duration: 0.3,
          ease: "power3.in",
        });
      } else {
        gsap.to(panel, {
          x: "100%",
          duration: 0.3,
          ease: "power3.in",
        });
      }
      gsap.to(backdrop, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (backdrop) backdrop.style.display = "none";
        },
      });
    }
    setTimeout(() => {
      setDetailRank(null);
      setDetailVariantId(null);
    }, isMobile ? 300 : 350);
  }, [isMobile]);

  /* ── Keyboard nav ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && detailRank) {
        closeDetailPanel();
      }
    },
    [detailRank, closeDetailPanel]
  );

  /* ═══════════════════════════════════════════
     SVG LINE COMPUTATION
     ═══════════════════════════════════════════ */
  const svgLines = useMemo(() => {
    if (orbPositions.size === 0) return null;
    const reversedRanks = [...tree.ranks].reverse();
    const lines: React.ReactNode[] = [];

    for (let i = 0; i < reversedRanks.length - 1; i++) {
      const upperRank = reversedRanks[i];
      const lowerRank = reversedRanks[i + 1];
      const upperTier = upperRank.rank as RankTier;
      const lowerTier = lowerRank.rank as RankTier;
      const upperIdx = RANK_ORDER.indexOf(upperTier);
      const lowerIdx = RANK_ORDER.indexOf(lowerTier);

      const upperIsBranch =
        showVariantSpread && upperIdx >= startIdx && upperIdx < endIdx;
      const lowerIsBranch =
        showVariantSpread && lowerIdx >= startIdx && lowerIdx < endIdx;

      const lowerUnlocked = isRankUnlocked(lowerTier);

      if (!upperIsBranch && !lowerIsBranch) {
        /* ─ Single → Single ─ */
        const uPos = orbPositions.get(`single-${upperTier}`);
        const lPos = orbPositions.get(`single-${lowerTier}`);
        if (uPos && lPos) {
          const lineColor = lowerUnlocked
            ? activeVariant && lowerIdx <= endIdx
              ? activeVariant.accentColor
              : raceColor
            : "var(--border-primary)";
          lines.push(
            <line
              key={`${upperTier}-${lowerTier}`}
              x1={uPos.x}
              y1={uPos.y + 42}
              x2={lPos.x}
              y2={lPos.y - 42}
              stroke={lineColor}
              strokeWidth={lowerUnlocked ? 2 : 1}
              strokeDasharray={lowerUnlocked ? "none" : "4 4"}
              opacity={lowerUnlocked ? 0.7 : 0.25}
            />
          );
        }
      } else if (!upperIsBranch && lowerIsBranch) {
        /* ─ Single → Branch (fan-out) ─ */
        const uPos = orbPositions.get(`single-${upperTier}`);
        if (uPos) {
          tree.variants.forEach((v) => {
            const lPos = orbPositions.get(`var-${lowerTier}-${v.id}`);
            if (!lPos) return;
            const isActive = !activeVariantId || activeVariantId === v.id;
            const lineColor =
              lowerUnlocked && isActive ? v.accentColor : "var(--border-primary)";
            lines.push(
              <line
                key={`${upperTier}-${lowerTier}-${v.id}`}
                x1={uPos.x}
                y1={uPos.y + 42}
                x2={lPos.x}
                y2={lPos.y - 42}
                stroke={lineColor}
                strokeWidth={lowerUnlocked && isActive ? 2 : 1}
                strokeDasharray={lowerUnlocked && isActive ? "none" : "4 4"}
                opacity={lowerUnlocked && isActive ? 0.7 : 0.12}
              />
            );
          });
        }
      } else if (upperIsBranch && lowerIsBranch) {
        /* ─ Branch → Branch (parallel) ─ */
        tree.variants.forEach((v) => {
          const uPos = orbPositions.get(`var-${upperTier}-${v.id}`);
          const lPos = orbPositions.get(`var-${lowerTier}-${v.id}`);
          if (!uPos || !lPos) return;
          const isActive = !activeVariantId || activeVariantId === v.id;
          const lineColor =
            lowerUnlocked && isActive ? v.accentColor : "var(--border-primary)";
          lines.push(
            <line
              key={`${upperTier}-${lowerTier}-${v.id}`}
              x1={uPos.x}
              y1={uPos.y + 42}
              x2={lPos.x}
              y2={lPos.y - 42}
              stroke={lineColor}
              strokeWidth={lowerUnlocked && isActive ? 2 : 1}
              strokeDasharray={lowerUnlocked && isActive ? "none" : "4 4"}
              opacity={lowerUnlocked && isActive ? 0.7 : 0.12}
            />
          );
        });
      } else if (upperIsBranch && !lowerIsBranch) {
        /* ─ Branch → Single (merge) ─ */
        const lPos = orbPositions.get(`single-${lowerTier}`);
        if (lPos) {
          tree.variants.forEach((v) => {
            const uPos = orbPositions.get(`var-${upperTier}-${v.id}`);
            if (!uPos) return;
            const isActive = !activeVariantId || activeVariantId === v.id;
            const lineColor =
              lowerUnlocked && isActive ? v.accentColor : "var(--border-primary)";
            lines.push(
              <line
                key={`${upperTier}-${lowerTier}-${v.id}`}
                x1={uPos.x}
                y1={uPos.y + 42}
                x2={lPos.x}
                y2={lPos.y - 42}
                stroke={lineColor}
                strokeWidth={lowerUnlocked && isActive ? 2 : 1}
                strokeDasharray={lowerUnlocked && isActive ? "none" : "4 4"}
                opacity={lowerUnlocked && isActive ? 0.7 : 0.12}
              />
            );
          });
        }
      }
    }

    return lines;
  }, [orbPositions, tree, showVariantSpread, startIdx, endIdx, activeVariantId, activeVariant, raceColor, isRankUnlocked]);

  /* ═══════════════════════════════════════════
     DETAIL PANEL CONTENT
     ═══════════════════════════════════════════ */
  const detailContent = useMemo(() => {
    if (!detailRankData || !detailRank) return null;
    const rank = detailRankData;
    const rankColor = RANK_COLORS[detailRank];

    // Determine which variant abilities to show
    const relevantVariantAbilities = detailVariantId
      ? rank.variantAbilities.filter((va) => va.variantId === detailVariantId)
      : rank.variantAbilities;

    const detailVariantName = detailVariantId
      ? tree.variants.find((v) => v.id === detailVariantId)?.name
      : null;

    return (
      <div className="space-y-5">
        {/* Rank title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-display text-2xl font-bold tracking-[0.1em]"
              style={{ color: rankColor }}
            >
              {detailRank}
            </span>
            {rank.isConvergence && (
              <FourPointStar size={12} color="var(--gold)" />
            )}
          </div>
          <h3
            className="font-display text-sm tracking-[0.08em] leading-tight"
            style={{ color: raceSecondary }}
          >
            {rank.title}
          </h3>
        </div>

        {/* Narrative */}
        {rank.narrative && (
          <p
            className="font-body text-sm italic leading-relaxed"
            style={{ color: "var(--text-tertiary)" }}
          >
            {rank.narrative}
          </p>
        )}

        {/* Scrollable ability sections */}
        <div className="space-y-5 max-h-[calc(60vh-200px)] md:max-h-[calc(100vh-240px)] overflow-y-auto tensura-panel-scroll pr-1">

          {/* Fundamental ability */}
          <div>
            <h4
              className="font-display text-[0.65rem] tracking-[0.15em] uppercase mb-2"
              style={{ color: rankColor }}
            >
              Capacité Fondamentale
            </h4>
            <AbilityCard ability={rank.fundamental} color={rankColor} />
          </div>

          {/* Variant abilities */}
          {relevantVariantAbilities.length > 0 && (
            <div>
              <h4
                className="font-display text-[0.65rem] tracking-[0.15em] uppercase mb-2"
                style={{ color: rankColor }}
              >
                Capacités de Variante
                {detailVariantName && (
                  <span className="opacity-50 ml-2">— {detailVariantName}</span>
                )}
              </h4>
              <div className="space-y-2">
                {relevantVariantAbilities.map((va) =>
                  va.abilities.map((ability) => (
                    <AbilityCard
                      key={ability.id}
                      ability={ability}
                      color={
                        tree.variants.find((v) => v.id === va.variantId)
                          ?.accentColor || rankColor
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Unique abilities */}
          {rank.uniqueAbilities && rank.uniqueAbilities.length > 0 && (
            <div>
              <h4
                className="font-display text-[0.65rem] tracking-[0.15em] uppercase mb-2"
                style={{ color: rankColor }}
              >
                Capacités Uniques
              </h4>
              <div className="space-y-2">
                {rank.uniqueAbilities.map(({ ability, aspectCount }) => (
                  <div key={ability.id} className="relative">
                    <AbilityCard ability={ability} color={rankColor} />
                    <span
                      className="absolute top-3 right-3 text-[0.55rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        background: `${rankColor}20`,
                        color: rankColor,
                        border: `1px solid ${rankColor}40`,
                      }}
                    >
                      {aspectCount} aspect{aspectCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evolution */}
          {rank.evolution && (
            <div>
              <h4
                className="font-display text-[0.65rem] tracking-[0.15em] uppercase mb-2"
                style={{ color: "var(--gold)" }}
              >
                Évolution de Palier
              </h4>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (rank.evolution?.techniqueId) {
                    useNavigation.getState().navigate("technique", {
                      techniqueId: rank.evolution!.techniqueId!,
                    });
                  }
                }}
                disabled={!rank.evolution.techniqueId}
                className={`w-full text-left p-3 rounded border transition-all duration-200 ${
                  rank.evolution.techniqueId
                    ? "cursor-pointer hover:border-[var(--gold-dim)]"
                    : "cursor-default"
                }`}
                style={{
                  borderColor: "var(--border-primary)",
                  background: "linear-gradient(135deg, var(--bg-card), rgba(212,175,55,0.05))",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FourPointStar size={10} color="var(--gold)" />
                  <span
                    className="font-display text-xs tracking-wider"
                    style={{ color: "var(--gold)" }}
                  >
                    {rank.evolution.name}
                  </span>
                  {rank.evolution.nameJp && (
                    <span className="font-body text-xs opacity-40">
                      {rank.evolution.nameJp}
                    </span>
                  )}
                </div>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {rank.evolution.description}
                </p>
                <p
                  className="font-body text-xs italic mt-2 opacity-60"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Prérequis : {rank.evolution.prerequisites}
                </p>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }, [detailRankData, detailRank, detailVariantId, raceSecondary, tree.variants]);

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  const currentRankTier = RANK_ORDER[selectedRankIdx];

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ background: "var(--bg-primary)" }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="tree"
      aria-label={`Arbre de compétences ${tree.raceName}`}
    >
      {/* ── RANK SIMULATOR ── */}
      <section className="px-4 pt-6 pb-4 sm:px-8" aria-label="Simulateur de rang">
        {/* Track with badges */}
        <div className="relative max-w-xl mx-auto">
          {/* Background track */}
          <div
            className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
            style={{
              background: `linear-gradient(to right, #78716C40, var(--gold)40)`,
            }}
            aria-hidden="true"
          />
          {/* Filled portion */}
          <div
            className="absolute top-1/2 left-0 h-px -translate-y-1/2 transition-all duration-500"
            style={{
              width: `${(selectedRankIdx / (RANK_ORDER.length - 1)) * 100}%`,
              background: `linear-gradient(to right, #78716C, ${RANK_COLORS[currentRankTier]})`,
            }}
            aria-hidden="true"
          />

          {/* Rank badges */}
          <div className="relative flex justify-between items-center">
            {RANK_ORDER.map((rank, idx) => {
              const isSelected = idx === selectedRankIdx;
              const unlocked = idx <= selectedRankIdx;
              return (
                <button
                  key={rank}
                  type="button"
                  onClick={() => handleRankChange(idx)}
                  onMouseEnter={playHover}
                  className={`
                    relative flex flex-col items-center gap-1.5 transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 rounded-full
                  `}
                  style={{
                    "--tw-ring-color": RANK_COLORS[rank],
                  } as React.CSSProperties}
                  aria-label={`Rang ${rank}: ${RANK_LABELS[rank]}${unlocked ? " (débloqué)" : ""}`}
                  aria-pressed={isSelected}
                >
                  {/* Orb badge */}
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-300 font-display text-xs sm:text-sm font-bold tracking-[0.1em]"
                    style={{
                      borderColor: isSelected
                        ? RANK_COLORS[rank]
                        : unlocked
                          ? `${RANK_COLORS[rank]}60`
                          : "var(--border-primary)",
                      background: isSelected
                        ? `${RANK_COLORS[rank]}20`
                        : unlocked
                          ? `${RANK_COLORS[rank]}08`
                          : "var(--bg-card)",
                      color: isSelected
                        ? RANK_COLORS[rank]
                        : unlocked
                          ? `${RANK_COLORS[rank]}CC`
                          : "var(--text-tertiary)",
                      boxShadow: isSelected
                        ? `0 0 12px ${RANK_COLORS[rank]}50, 0 0 24px ${RANK_COLORS[rank]}20`
                        : "none",
                      opacity: unlocked ? 1 : 0.4,
                    }}
                  >
                    {rank}
                  </div>
                  {/* Label */}
                  <span
                    className="text-[0.5rem] font-mono uppercase tracking-wider hidden sm:block transition-colors duration-200"
                    style={{
                      color: isSelected
                        ? RANK_COLORS[rank]
                        : "var(--text-tertiary)",
                    }}
                  >
                    {RANK_LABELS[rank]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected rank label */}
        <p className="text-center mt-4 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
          Rang sélectionné :{" "}
          <span className="font-display font-bold tracking-wider" style={{ color: RANK_COLORS[currentRankTier] }}>
            {currentRankTier}
          </span>{" "}
          — {RANK_LABELS[currentRankTier]}
        </p>
      </section>

      {/* ── VARIANT SELECTOR ── */}
      {hasBranches && (
        <section className="px-4 pb-4 sm:px-8" aria-label="Sélecteur de variante">
          <div className="flex flex-wrap justify-center gap-2">
            {tree.variants.map((variant) => {
              const isActive = activeVariantId === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => handleVariantClick(variant.id)}
                  className={`
                    px-3 py-1.5 rounded-full border font-display text-[0.6rem] tracking-[0.1em] uppercase
                    transition-all duration-200
                    ${isActive ? "ring-1" : "opacity-60 hover:opacity-100"}
                  `}
                  style={{
                    borderColor: variant.accentColor,
                    color: variant.accentColor,
                    background: isActive
                      ? `${variant.accentColor}18`
                      : "var(--bg-card)",
                    boxShadow: isActive
                      ? `0 0 12px ${variant.accentColor}40`
                      : "none",
                    ...(isActive
                      ? ({ "--tw-ring-color": variant.accentColor } as React.CSSProperties)
                      : {}),
                  }}
                  aria-pressed={isActive}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── TREE AREA ── */}
      <section
        ref={treeAreaRef}
        className="relative px-4 pt-4 pb-8 sm:px-8 overflow-x-auto"
        aria-label="Arbre de compétences"
      >
        {/* SVG connecting lines overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: linesReady ? 1 : 0, transition: "opacity 0.3s" }}
          aria-hidden="true"
        >
          {svgLines}
        </svg>

        {/* Rank orbs (top to bottom: EX → F) */}
        <div className="relative flex flex-col items-center gap-6 sm:gap-8 min-w-max mx-auto">
          {[...tree.ranks].reverse().map((rank) => {
            const tier = rank.rank as RankTier;
            const rankIdx = RANK_ORDER.indexOf(tier);
            const unlocked = isRankUnlocked(tier);
            const isInBranch =
              showVariantSpread &&
              rankIdx >= startIdx &&
              rankIdx < endIdx;
            const isConvergence = hasBranches && rankIdx === endIdx;

            // Determine path illumination for single orbs
            const onVariantPath =
              !!activeVariant && rankIdx <= endIdx;

            if (isInBranch) {
              /* ─ Branch zone: variant orbs spread horizontally ─ */
              return (
                <div
                  key={tier}
                  className="relative flex items-start justify-center"
                >
                  <div className="flex items-start justify-center gap-6 sm:gap-10 md:gap-16">
                    {tree.variants.map((variant) => {
                      const isActiveVariant = activeVariantId === variant.id;
                      const isOnPath = isActiveVariant;
                      return (
                        <SkillTreeNode
                          key={variant.id}
                          orbId={`var-${tier}-${variant.id}`}
                          rankLabel={tier}
                          title={rank.title}
                          rankColor={RANK_COLORS[tier]}
                          isUnlocked={unlocked}
                          isSelected={
                            detailRank === tier &&
                            detailVariantId === variant.id
                          }
                          isOnPath={isOnPath}
                          pathColor={variant.accentColor}
                          isConvergence={false}
                          onHover={playHover}
                          onClick={() => handleOrbClick(rank, variant.id)}
                          isKeyboardFocused={false}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            }

            /* ─ Single orb (non-branch zone) ─ */
            return (
              <SkillTreeNode
                key={tier}
                orbId={`single-${tier}`}
                rankLabel={tier}
                title={rank.title}
                rankColor={RANK_COLORS[tier]}
                isUnlocked={unlocked}
                isSelected={
                  detailRank === tier && !detailVariantId
                }
                isOnPath={onVariantPath}
                pathColor={activeVariant?.accentColor || raceColor}
                isConvergence={isConvergence}
                onHover={playHover}
                onClick={() => handleOrbClick(rank)}
                isKeyboardFocused={false}
              />
            );
          })}
        </div>
      </section>

      {/* ── DETAIL PANEL BACKDROP ── */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(0,0,0,0.6)",
          display: "none",
          backdropFilter: "blur(4px)",
        }}
        onClick={closeDetailPanel}
        onKeyDown={(e) => {
          if (e.key === "Escape") closeDetailPanel();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Détails du rang"
        tabIndex={-1}
      />

      {/* ── DETAIL PANEL ── */}
      {detailRank && (
        <div
          ref={panelRef}
          className="fixed z-50"
          style={
            isMobile
              ? {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "65vh",
                  background: "var(--bg-card)",
                  borderTop: `2px solid ${RANK_COLORS[detailRank]}`,
                  borderRadius: "16px 16px 0 0",
                  boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
                  padding: "20px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transform: "translateY(100%)",
                }
              : {
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: "400px",
                  maxWidth: "90vw",
                  background: "var(--bg-card)",
                  borderLeft: `2px solid ${RANK_COLORS[detailRank]}`,
                  boxShadow: "-8px 0 40px rgba(0,0,0,0.5)",
                  padding: "24px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transform: "translateX(100%)",
                }
          }
          role="region"
          aria-label={`Détails du rang ${detailRank}`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <span
              className="font-mono text-[0.55rem] uppercase tracking-[0.2em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Rang {detailRank} — {RANK_LABELS[detailRank]}
            </span>
            <button
              type="button"
              onClick={closeDetailPanel}
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                color: "var(--text-tertiary)",
              }}
              aria-label="Fermer le panneau"
              onMouseEnter={playHover}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 3L11 11M11 3L3 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">{detailContent}</div>
        </div>
      )}
    </div>
  );
}