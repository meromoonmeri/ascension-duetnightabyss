"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";

/* ── Rank color map (consistent with CreatureCard) ── */
const RANK_STYLES: Record<
  string,
  { color: string; border: string; bg: string }
> = {
  F:   { color: "#78716C", border: "rgba(120,113,108,0.4)", bg: "rgba(120,113,108,0.08)" },
  E:   { color: "#22C55E", border: "rgba(34,197,94,0.4)", bg: "rgba(34,197,94,0.08)" },
  D:   { color: "#3B82F6", border: "rgba(59,130,246,0.4)", bg: "rgba(59,130,246,0.08)" },
  C:   { color: "#A855F7", border: "rgba(168,85,247,0.4)", bg: "rgba(168,85,247,0.08)" },
  B:   { color: "#EAB308", border: "rgba(234,179,8,0.4)", bg: "rgba(234,179,8,0.08)" },
  A:   { color: "#EF4444", border: "rgba(239,68,68,0.4)", bg: "rgba(239,68,68,0.08)" },
  S:   { color: "#FF6B35", border: "rgba(255,107,53,0.4)", bg: "rgba(255,107,53,0.08)" },
  SS:  { color: "#DC2626", border: "rgba(220,38,38,0.5)", bg: "rgba(220,38,38,0.1)" },
  SSS: { color: "#F59E0B", border: "rgba(245,158,11,0.5)", bg: "rgba(245,158,11,0.1)" },
};

/* ── Object type badge styles ── */
const TYPE_STYLES: Record<string, { color: string; bg: string }> = {
  arme:         { color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
  armure:       { color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  accessoire:   { color: "#A855F7", bg: "rgba(168,85,247,0.08)" },
  materiau:     { color: "#EAB308", bg: "rgba(234,179,8,0.08)" },
  consommable:  { color: "#22C55E", bg: "rgba(34,197,94,0.08)" },
  artefact:     { color: "#c9a25a", bg: "rgba(201,162,90,0.08)" },
  relique:      { color: "#E879A8", bg: "rgba(232,121,168,0.08)" },
};

export interface ObjetCardData {
  name: string;
  slug: string;
  rank: string;
  type: string;
  imageUrl?: string;
}

interface ObjetCardProps {
  objet: ObjetCardData;
  onClick?: (objet: ObjetCardData) => void;
}

export default function ObjetCard({ objet, onClick }: ObjetCardProps) {
  const rs = RANK_STYLES[objet.rank] || RANK_STYLES.F;
  const ts = TYPE_STYLES[objet.type.toLowerCase()] || {
    color: "var(--text-secondary)",
    bg: "rgba(255,255,255,0.03)",
  };

  return (
    <div
      className="group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
      onClick={() => onClick?.(objet)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = rs.border;
        e.currentTarget.style.boxShadow = `0 0 12px ${rs.bg}, 0 6px 20px rgba(0,0,0,0.4)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-primary)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image area */}
      <div className="relative w-full aspect-square overflow-hidden">
        {objet.imageUrl ? (
          <Image
            src={objet.imageUrl}
            alt={objet.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            style={{ filter: "saturate(0.7) brightness(0.75)" }}
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${rs.bg} 0%, var(--bg-card) 100%)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-display text-2xl tracking-[0.15em] opacity-15"
                style={{ color: rs.color }}
              >
                {objet.rank}
              </span>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, var(--bg-card) 5%, transparent 50%)",
          }}
        />

        {/* Badges — top left: type */}
        <div className="absolute top-2 left-2 z-10">
          <Badge
            variant="outline"
            className="font-mono-custom text-[0.5rem] tracking-[0.1em] uppercase px-1.5 py-0 h-4"
            style={{
              color: ts.color,
              borderColor: `${ts.color}40`,
              background: ts.bg,
              backdropFilter: "blur(4px)",
            }}
          >
            {objet.type}
          </Badge>
        </div>

        {/* Rank — top right */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className="font-display text-[0.6rem] tracking-[0.12em] font-bold px-1.5 py-0.5 rounded-sm"
            style={{
              color: rs.color,
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${rs.border}`,
              backdropFilter: "blur(4px)",
            }}
          >
            {objet.rank}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 -mt-2 relative z-10">
        <h3
          className="font-display text-xs tracking-[0.06em] leading-tight truncate"
          style={{ color: "#e9e4d6" }}
        >
          {objet.name}
        </h3>
      </div>
    </div>
  );
}