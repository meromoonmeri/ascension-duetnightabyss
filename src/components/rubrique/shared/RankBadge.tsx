"use client";

import { motion } from "framer-motion";

/* ─── DNA Design Tokens ─── */
const GOLD = "#E0DABB";
const GOLD_LIGHT = "#E0DABB";
const GOLD_DARK = "#BAAE93";
const GOLD_BORDER = "rgba(224, 218, 187, 0.15)";
const GOLD_BORDER_HOVER = "rgba(224, 218, 187, 0.35)";
const GOLD_GLOW = "rgba(224, 218, 187, 0.1)";

const RANK_STYLES: Record<string, { bg: string; color: string; border: string; glow: string }> = {
  S: { bg: `${GOLD}18`, color: GOLD_LIGHT, border: GOLD_BORDER_HOVER, glow: `0 0 10px ${GOLD_GLOW}` },
  A: { bg: `${GOLD}14`, color: GOLD_LIGHT, border: `rgba(224, 218, 187, 0.3)`, glow: `0 0 8px ${GOLD_GLOW}` },
  B: { bg: `${GOLD}0a`, color: GOLD, border: GOLD_BORDER, glow: `0 0 6px ${GOLD_GLOW}` },
  C: { bg: `${GOLD}06`, color: GOLD_DARK, border: "rgba(186, 174, 147, 0.15)", glow: "none" },
  D: { bg: "rgba(164,164,164,0.06)", color: "#A4A4A4", border: "rgba(164,164,164,0.15)", glow: "none" },
  E: { bg: "rgba(164,164,164,0.04)", color: "#A4A4A4", border: "rgba(164,164,164,0.1)", glow: "none" },
  F: { bg: "rgba(167,167,167,0.04)", color: "#A7A7A7", border: "rgba(167,167,167,0.08)", glow: "none" },
  EX: { bg: `${GOLD}20`, color: GOLD_LIGHT, border: GOLD_BORDER_HOVER, glow: `0 0 12px ${GOLD_GLOW}` },
};

interface RankBadgeProps {
  rank?: string | null;
  size?: "sm" | "md" | "lg";
}

export default function RankBadge({ rank, size = "md" }: RankBadgeProps) {
  if (!rank) return null;

  const style = RANK_STYLES[rank] || RANK_STYLES["F"];
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <motion.span
      className={`inline-flex items-center justify-center font-black ${sizeClasses[size]}`}
      style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontFamily: "'WorldText', serif",
        letterSpacing: "0.05em",
        textShadow: style.glow !== "none" ? style.glow : "none",
      }}
      whileHover={size !== "sm" ? { scale: 1.05 } : undefined}
    >
      {rank.toUpperCase()}
    </motion.span>
  );
}