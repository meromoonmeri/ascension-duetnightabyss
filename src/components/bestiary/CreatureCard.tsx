"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ── Rank color map ── */
const RANK_STYLES: Record<
  string,
  { color: string; border: string; bg: string; glow: string; label: string }
> = {
  F:   { color: "#78716C", border: "rgba(120,113,108,0.4)", bg: "rgba(120,113,108,0.08)", glow: "rgba(120,113,108,0)", label: "F" },
  E:   { color: "#22C55E", border: "rgba(34,197,94,0.4)", bg: "rgba(34,197,94,0.08)", glow: "rgba(34,197,94,0)", label: "E" },
  D:   { color: "#3B82F6", border: "rgba(59,130,246,0.4)", bg: "rgba(59,130,246,0.08)", glow: "rgba(59,130,246,0.1)", label: "D" },
  C:   { color: "#A855F7", border: "rgba(168,85,247,0.4)", bg: "rgba(168,85,247,0.08)", glow: "rgba(168,85,247,0.1)", label: "C" },
  B:   { color: "#EAB308", border: "rgba(234,179,8,0.4)", bg: "rgba(234,179,8,0.08)", glow: "rgba(234,179,8,0.15)", label: "B" },
  A:   { color: "#EF4444", border: "rgba(239,68,68,0.4)", bg: "rgba(239,68,68,0.08)", glow: "rgba(239,68,68,0.15)", label: "A" },
  S:   { color: "#FF6B35", border: "rgba(255,107,53,0.4)", bg: "rgba(255,107,53,0.08)", glow: "rgba(255,107,53,0.2)", label: "S" },
  SS:  { color: "#DC2626", border: "rgba(220,38,38,0.5)", bg: "rgba(220,38,38,0.1)", glow: "rgba(220,38,38,0.25)", label: "SS" },
  SSS: { color: "#F59E0B", border: "rgba(245,158,11,0.5)", bg: "rgba(245,158,11,0.1)", glow: "rgba(245,158,11,0.3)", label: "SSS" },
};

// Fallback rank style
const DEFAULT_RANK = RANK_STYLES.F;

function DangerStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="leading-none"
          style={{
            fontSize: 10,
            color: i < level ? "#c9a25a" : "rgba(255,255,255,0.1)",
            textShadow: i < level ? "0 0 4px rgba(201,162,90,0.4)" : "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/* ── Gradient placeholder when no image ── */
function ImagePlaceholder({ rank }: { rank: string }) {
  const rs = RANK_STYLES[rank] || DEFAULT_RANK;
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, ${rs.bg} 0%, rgba(20,20,30,1) 100%)`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display text-3xl tracking-[0.15em] opacity-20"
          style={{ color: rs.color }}
        >
          {rank}
        </span>
      </div>
    </div>
  );
}

export interface CreatureCardData {
  name: string;
  slug: string;
  rank: string;
  dangerLevel: number; // 1-5
  classe: string;
  imageUrl?: string;
  tags: string[];
}

interface CreatureCardProps {
  creature: CreatureCardData;
}

export default function CreatureCard({ creature }: CreatureCardProps) {
  const rs = RANK_STYLES[creature.rank] || DEFAULT_RANK;
  const isSSS = creature.rank === "SSS";

  return (
    <Link href={`/bestiaire/creature/${encodeURIComponent(creature.slug)}`} className="block group">
      <div
        className="relative rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
        style={{
          background: "var(--bg-card)",
          border: `1px solid var(--border-primary)`,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = isSSS
            ? "transparent"
            : rs.border;
          el.style.boxShadow = isSSS
            ? `0 0 20px rgba(245,158,11,0.2), 0 0 40px rgba(168,85,247,0.15), 0 0 60px rgba(239,68,68,0.1)`
            : `0 0 15px ${rs.glow}, 0 8px 24px rgba(0,0,0,0.4)`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "var(--border-primary)";
          el.style.boxShadow = "none";
        }}
      >
        {/* SSS rainbow border (CSS gradient) */}
        {isSSS && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(135deg, #EF4444, #F59E0B, #22C55E, #3B82F6, #A855F7, #EF4444)",
              backgroundSize: "300% 300%",
              animation: "sss-rainbow 4s linear infinite",
              zIndex: 0,
              padding: 1,
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        )}

        {/* Image area */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          {creature.imageUrl ? (
            <Image
              src={creature.imageUrl}
              alt={creature.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ filter: "saturate(0.8) brightness(0.8)" }}
              unoptimized
            />
          ) : (
            <ImagePlaceholder rank={creature.rank} />
          )}

          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--bg-card) 0%, transparent 60%)",
            }}
          />

          {/* Rank badge — top right */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span
              className="font-display text-[0.65rem] tracking-[0.15em] font-bold px-2 py-0.5 rounded-sm"
              style={
                isSSS
                  ? {
                      color: "#F59E0B",
                      background:
                        "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(168,85,247,0.15))",
                      border: "1px solid rgba(245,158,11,0.3)",
                      textShadow: "0 0 8px rgba(245,158,11,0.5)",
                    }
                  : {
                      color: rs.color,
                      background: rs.bg,
                      border: `1px solid ${rs.border}`,
                    }
              }
            >
              {creature.rank}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 pt-0 relative z-10 -mt-4">
          {/* Danger stars */}
          <div className="mb-1.5">
            <DangerStars level={creature.dangerLevel} />
          </div>

          {/* Name */}
          <h3
            className="font-display text-sm tracking-[0.06em] leading-tight mb-1"
            style={{ color: "#e9e4d6" }}
          >
            {creature.name}
          </h3>

          {/* Classe */}
          <p
            className="font-mono-custom text-[0.6rem] tracking-[0.1em] uppercase mb-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            {creature.classe}
          </p>

          {/* Tags */}
          {creature.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {creature.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="font-mono-custom text-[0.5rem] tracking-[0.08em] px-1.5 py-0 h-5"
                  style={{
                    color: "var(--text-tertiary)",
                    borderColor: "var(--border-accent)",
                    background: "transparent",
                  }}
                >
                  <MapPin size={8} className="mr-0.5" />
                  {tag}
                </Badge>
              ))}
              {creature.tags.length > 3 && (
                <span
                  className="font-mono-custom text-[0.5rem] px-1 py-0.5 self-center"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  +{creature.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Inline keyframe for SSS rainbow ── */
const SssStyle = () => (
  <style>{`
    @keyframes sss-rainbow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `}</style>
);

// Export the style injector for parent to include once
export { SssStyle };