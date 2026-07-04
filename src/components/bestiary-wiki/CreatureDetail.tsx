"use client";

import { useState, useEffect } from "react";
import {
  X, ArrowLeft, AlertTriangle, MapPin, Shield, Swords,
  Zap, Star, Sparkles, Globe, Eye, Pencil, BookOpen,
  Skull, Users, TrendingUp, ChevronRight, ExternalLink
} from "lucide-react";

interface Realm {
  id: string;
  name: string;
  slug: string;
  type: string;
  dangerMoy: number | null;
  imageUrl: string | null;
  _count: { creatures: number };
}

interface Creature {
  id: string;
  slug: string;
  name: string;
  nameJp: string | null;
  citation: string | null;
  classe: string | null;
  rank: string;
  dangerLevel: number;
  imageUrl: string | null;
  description: string;
  comportement: string | null;
  signatureShinso: string;
  localisation: any[];
  pouvoirs: any[];
  variantes: string;
  caracteristiques: string;
  tags: any[];
  source: string | null;
  realmId: string | null;
  realm: Realm | null;
}

const RANK_COLORS: Record<string, string> = {
  F: "#6b7280", E: "#9ca3af", D: "#34d399", C: "#60a5fa",
  B: "#a78bfa", A: "#fbbf24", S: "#f87171", SS: "#fb923c", SSS: "#f472b6",
};

const RANK_BG: Record<string, string> = {
  F: "rgba(107,114,128,0.12)", E: "rgba(156,163,175,0.12)", D: "rgba(52,211,153,0.12)",
  C: "rgba(96,165,250,0.12)", B: "rgba(167,139,250,0.12)", A: "rgba(251,191,36,0.12)",
  S: "rgba(248,113,113,0.12)", SS: "rgba(251,146,60,0.12)", SSS: "rgba(244,114,182,0.12)",
};

const DANGER_COLORS: Record<number, string> = {
  1: "#34d399", 2: "#fbbf24", 3: "#fb923c", 4: "#f87171", 5: "#dc2626",
};

const DANGER_LABELS: Record<number, string> = {
  1: "Minimal", 2: "Faible", 3: "Modéré", 4: "Élevé", 5: "Extrême",
};

function safeParse(str: string): any[] {
  try {
    const p = JSON.parse(str);
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}

interface CreatureDetailProps {
  creature: Creature;
  onClose: () => void;
  onEdit?: () => void;
}

export default function CreatureDetail({ creature, onClose, onEdit }: CreatureDetailProps) {
  const [visible, setVisible] = useState(false);
  const [fetchedCreature, setFetchedCreature] = useState<Creature | null>(null);
  const [loading, setLoading] = useState(true);

  const c = fetchedCreature || creature;
  const rankColor = RANK_COLORS[c.rank] || "#666";
  const rankBg = RANK_BG[c.rank] || "rgba(102,102,102,0.12)";

  // Parse JSON fields
  const localisations = Array.isArray(c.localisation) ? c.localisation : safeParse(c.localisation || "[]");
  const pouvoirs = Array.isArray(c.pouvoirs) ? c.pouvoirs : safeParse(c.pouvoirs || "[]");
  const tags = Array.isArray(c.tags) ? c.tags : safeParse(c.tags || "[]");
  const variantes = safeParse(c.variantes || "[]");
  const caracteristiques = safeParse(c.caracteristiques || "[]");
  const signatureShinso = safeParse(c.signatureShinso || "[]");

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Fetch full creature data
  useEffect(() => {
    async function fetchFull() {
      try {
        const res = await fetch(`/api/bestiary/creatures/${c.slug}?XTransformPort=3000`);
        if (res.ok) {
          const data = await res.json();
          setFetchedCreature(data);
        }
      } catch (err) {
        console.error("Failed to fetch full creature:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFull();
  }, [c.slug]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  // Danger bar
  const renderDangerBar = () => (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <AlertTriangle size={14} style={{ color: DANGER_COLORS[c.dangerLevel] }} />
        <span className="text-xs font-medium" style={{ color: DANGER_COLORS[c.dangerLevel] }}>
          Niveau {c.dangerLevel} — {DANGER_LABELS[c.dangerLevel]}
        </span>
      </div>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${(c.dangerLevel / 5) * 100}%`,
            background: `linear-gradient(90deg, ${DANGER_COLORS[Math.min(c.dangerLevel, 5)]}88, ${DANGER_COLORS[Math.min(c.dangerLevel, 5)]})`,
          }}
        />
      </div>
    </div>
  );

  // Info row
  const InfoRow = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | null | undefined; color?: string }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-2.5 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
          <p className="text-sm mt-0.5" style={{ color: color || "#e5e7eb" }}>{value}</p>
        </div>
      </div>
    );
  };

  // Data section
  const DataSection = ({ title, icon, items }: { title: string; icon: React.ReactNode; items: any[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h4 className="text-sm font-semibold tracking-wide" style={{ color: "#e5e7eb" }}>{title}</h4>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => {
            const name = typeof item === "string" ? item : item.name || item.title || item.power || "";
            const desc = typeof item === "string" ? null : (item.description || item.desc || item.effect || null);
            if (!name) return null;
            return (
              <div key={i} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p className="text-sm font-medium" style={{ color: "#e5e7eb" }}>{name}</p>
                {desc && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.6" }}>{desc}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex"
      style={{
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Back button */}
      <button
        onClick={handleClose}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
      >
        <ArrowLeft size={16} />
        <span className="text-xs font-medium hidden sm:inline">Retour</span>
      </button>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-xl cursor-pointer transition-colors"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
      >
        <X size={18} />
      </button>

      {/* Content */}
      <div
        className="w-full h-full overflow-y-auto"
        style={{
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "transform 0.3s ease",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-6 h-6 border-2 rounded-full animate-spin mb-4" style={{ borderColor: `${rankColor}44`, borderTopColor: rankColor }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Chargement de la fiche...</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              {/* Left: Image + Meta */}
              <div className="lg:w-[340px] flex-shrink-0">
                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4]" style={{ border: `1px solid ${rankColor}22`, background: rankBg }}>
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Skull size={64} style={{ color: `${rankColor}22` }} />
                    </div>
                  )}

                  {/* Rank overlay */}
                  <div
                    className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-base font-black tracking-wider"
                    style={{ background: `${rankColor}30`, color: rankColor, border: `1px solid ${rankColor}40`, backdropFilter: "blur(8px)", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {c.rank}
                  </div>

                  {/* Edit button */}
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="absolute top-3 right-3 p-2 rounded-lg cursor-pointer transition-colors"
                      style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", backdropFilter: "blur(4px)" }}
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                {/* Quick stats card */}
                <div className="mt-4 rounded-xl p-4 space-y-1" style={{ background: "rgba(19,19,26,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Rank */}
                  <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Rang</span>
                    <span className="text-sm font-bold" style={{ color: rankColor, fontFamily: "'Poppins', sans-serif" }}>{c.rank}</span>
                  </div>

                  {/* Classe */}
                  {c.classe && (
                    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Classe</span>
                      <span className="text-sm font-medium" style={{ color: "#e5e7eb" }}>{c.classe}</span>
                    </div>
                  )}

                  {/* Danger */}
                  <div className="py-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Dangerosité</span>
                      <span className="text-sm font-medium" style={{ color: DANGER_COLORS[c.dangerLevel] }}>{c.dangerLevel}/5</span>
                    </div>
                    {renderDangerBar()}
                  </div>

                  {/* Realm */}
                  {c.realm && (
                    <div className="flex items-center justify-between py-2 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Royaume</span>
                      <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: "#f59e0b" }}>
                        <MapPin size={12} />
                        {c.realm.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Details */}
              <div className="flex-1 min-w-0">
                {/* Citation */}
                {c.citation && (
                  <blockquote className="mb-6 pl-4 text-sm italic" style={{ borderLeft: `2px solid ${rankColor}44`, color: "rgba(255,255,255,0.5)" }}>
                    &ldquo;{c.citation}&rdquo;
                  </blockquote>
                )}

                {/* Names */}
                <div className="mb-6">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", color: "#f0f0f0" }}>
                    {c.name}
                  </h2>
                  {c.nameJp && (
                    <p className="text-lg mt-1" style={{ color: `${rankColor}88`, fontFamily: "'Noto Sans JP', sans-serif" }}>
                      {c.nameJp}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {tags.map((tag, i) => {
                      const label = typeof tag === "string" ? tag : tag.name || tag;
                      if (!label) return null;
                      return (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Description */}
                {c.description && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={14} style={{ color: "rgba(245,158,11,0.7)" }} />
                      <h4 className="text-sm font-semibold tracking-wide" style={{ color: "#e5e7eb" }}>Description</h4>
                    </div>
                    <div
                      className="text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                      dangerouslySetInnerHTML={{ __html: c.description.replace(/\n/g, "<br/>") }}
                    />
                  </div>
                )}

                {/* Comportement */}
                {c.comportement && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={14} style={{ color: "rgba(96,165,250,0.7)" }} />
                      <h4 className="text-sm font-semibold tracking-wide" style={{ color: "#e5e7eb" }}>Comportement</h4>
                    </div>
                    <div
                      className="text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                      dangerouslySetInnerHTML={{ __html: c.comportement.replace(/\n/g, "<br/>") }}
                    />
                  </div>
                )}

                {/* Pouvoirs */}
                <DataSection
                  title="Pouvoirs"
                  icon={<Zap size={14} style={{ color: "rgba(248,113,113,0.7)" }} />}
                  items={pouvoirs}
                />

                {/* Localisation */}
                <DataSection
                  title="Localisation"
                  icon={<MapPin size={14} style={{ color: "rgba(52,211,153,0.7)" }} />}
                  items={localisations}
                />

                {/* Signature Shinso */}
                <DataSection
                  title="Signature Shinso"
                  icon={<Star size={14} style={{ color: "rgba(244,114,182,0.7)" }} />}
                  items={signatureShinso}
                />

                {/* Caractéristiques */}
                {caracteristiques.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={14} style={{ color: "rgba(251,191,36,0.7)" }} />
                      <h4 className="text-sm font-semibold tracking-wide" style={{ color: "#e5e7eb" }}>Caractéristiques</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {caracteristiques.map((stat: any, i: number) => {
                        const name = typeof stat === "string" ? stat : stat.name || stat.stat || "";
                        const value = typeof stat === "string" ? null : (stat.value || stat.val || null);
                        if (!name) return null;
                        return (
                          <div key={i} className="rounded-lg px-3 py-2.5 flex items-center justify-between"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{name}</span>
                            {value !== null && <span className="text-xs font-semibold" style={{ color: "#e5e7eb" }}>{value}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Variantes */}
                <DataSection
                  title="Variantes"
                  icon={<Sparkles size={14} style={{ color: "rgba(167,139,250,0.7)" }} />}
                  items={variantes}
                />

                {/* Source */}
                {c.source && (
                  <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      Source : <span style={{ color: "rgba(255,255,255,0.4)" }}>{c.source}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}