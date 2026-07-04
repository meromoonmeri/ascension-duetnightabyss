"use client";

import React from "react";

// 4-Pointed Star SVG ornament — recurring motif from the Ascension logo
export function FourPointStar({
  size = 16,
  className = "",
  color,
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  const c = color || "var(--ornament-color)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
        fill={c}
        opacity="0.6"
      />
    </svg>
  );
}

// Decorative section separator with the 4-pointed star
export function SectionSeparator({ className = "" }: { className?: string }) {
  return (
    <div className={`star-separator ${className}`}>
      <FourPointStar size={14} />
    </div>
  );
}

// Claw/blade inspired ornamental border for cards
export function OrnateCard({
  children,
  className = "",
  glowColor,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`card-ornate relative transition-all duration-300 group cursor-pointer ${className}`}
      style={
        {
          "--glow-color": glowColor || "var(--ornament-glow)",
        } as React.CSSProperties
      }
      onClick={onClick}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `0 0 20px ${glowColor || "var(--ornament-glow)"}, inset 0 0 20px ${glowColor || "var(--ornament-glow)"}`,
        }}
      />
      {/* Claw corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l opacity-30 group-hover:opacity-60 transition-opacity" style={{ borderColor: glowColor || "var(--ornament-color)" }} />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r opacity-30 group-hover:opacity-60 transition-opacity" style={{ borderColor: glowColor || "var(--ornament-color)" }} />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l opacity-30 group-hover:opacity-60 transition-opacity" style={{ borderColor: glowColor || "var(--ornament-color)" }} />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r opacity-30 group-hover:opacity-60 transition-opacity" style={{ borderColor: glowColor || "var(--ornament-color)" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Rank badge component
export function RankBadge({ rank, className = "" }: { rank: string; className?: string }) {
  const rankLower = rank.toLowerCase();
  return (
    <span
      className={`rank-badge rank-${rankLower} ${className}`}
    >
      {rank}
    </span>
  );
}

// Metallic engraved text wrapper
export function EngravedText({
  children,
  as: Tag = "span",
  className = "",
}: {
  children: React.ReactNode;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
}) {
  return (
    <Tag className={`text-engraved ${className}`}>
      {children}
    </Tag>
  );
}