"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ArrowLeft, MapPin, Shield, Swords } from "lucide-react";
import { useNavigation } from "@/store/navigationStore";
import { BESTIARY_DATA } from "@/data/bestiary";
import { RACE_DATA } from "@/data/races";
import { FourPointStar } from "@/components/shared/Ornaments";

export default function BestiaryDetail() {
  const { pageParams, navigate, goBack } = useNavigation();
  const entryId = pageParams.id;
  const entry = BESTIARY_DATA.find((e) => e.id === entryId);
  const race = entry?.raceId ? RACE_DATA.find((r) => r.id === entry.raceId) : null;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  }, [entryId]);

  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-body text-txt-tertiary">Créature introuvable.</p>
        <button onClick={() => navigate("bestiary")} className="font-display text-sm tracking-wider text-silver-bright hover:text-white transition-colors">
          ← Retour au Bestiaire
        </button>
      </div>
    );
  }

  const accentColor = race?.colors?.primary || "var(--gold)";
  const stars = "★".repeat(entry.threatRank === "S+" || entry.threatRank === "EX" ? 5 : entry.threatRank === "S" || entry.threatRank === "A" ? 5 : entry.threatRank === "B" ? 4 : entry.threatRank === "C" ? 3 : entry.threatRank === "D" ? 2 : 1);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col">
      <div className="border-b border-bdr-secondary bg-surface-secondary/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => goBack()}
            className="flex items-center gap-2 text-txt-tertiary hover:text-txt-primary transition-colors mb-4 font-body text-sm"
          >
            <ArrowLeft size={16} />
            <span>Retour au Bestiaire</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Portrait */}
        <div className="relative w-full aspect-[4/3] max-h-[500px] rounded-lg overflow-hidden border border-bdr-secondary mb-8 bg-surface-secondary">
          {entry.portraitUrl ? (
            <Image
              src={entry.portraitUrl}
              alt={entry.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <FourPointStar size={48} color={accentColor} />
              <span className="font-mono text-xs text-txt-tertiary uppercase tracking-wider">Portrait non disponible</span>
            </div>
          )}
          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span
              className="px-2.5 py-1 rounded border font-display text-[0.65rem] tracking-[0.12em] uppercase"
              style={{
                borderColor: accentColor,
                color: accentColor,
                background: `${accentColor}20`,
                backdropFilter: "blur(8px)",
              }}
            >
              {entry.category}
            </span>
            {entry.threatRank && (
              <span
                className="px-2.5 py-1 rounded border font-mono text-[0.7rem] font-bold"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(8px)",
                }}
              >
                RANG {entry.threatRank}
              </span>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <h1 className="font-display text-3xl sm:text-4xl tracking-[0.08em] text-engraved" style={{ color: accentColor }}>
              {entry.name}
            </h1>
            {entry.nameJp && (
              <span className="font-body text-lg text-txt-tertiary italic mt-1">{entry.nameJp}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
            <span className="flex items-center gap-1.5 text-txt-tertiary font-body">
              <Shield size={14} /> {entry.classification}
            </span>
            {entry.regionId && (
              <span className="flex items-center gap-1.5 text-txt-tertiary font-body">
                <MapPin size={14} /> {entry.regionId}
              </span>
            )}
            {entry.threatRank && (
              <span className="flex items-center gap-1.5 font-body" style={{ color: accentColor }}>
                <Swords size={14} /> {stars}
              </span>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1" style={{ background: `${accentColor}30` }} />
          <FourPointStar size={8} color={accentColor} />
          <div className="h-px flex-1" style={{ background: `${accentColor}30` }} />
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="font-display text-xs tracking-[0.15em] uppercase mb-3" style={{ color: accentColor }}>
            Description
          </h2>
          <p className="font-body text-sm text-txt-secondary leading-relaxed">{entry.description}</p>
        </div>

        {/* Abilities */}
        {entry.abilities.length > 0 && (
          <div>
            <h2 className="font-display text-xs tracking-[0.15em] uppercase mb-3" style={{ color: accentColor }}>
              Capacités Notables
            </h2>
            <div className="space-y-2">
              {entry.abilities.map((ability, i) => (
                <div
                  key={i}
                  className="p-3 rounded border border-bdr-secondary bg-surface-secondary/50 flex items-start gap-3"
                >
                  <FourPointStar size={8} color={accentColor} className="mt-1 flex-shrink-0" />
                  <span className="font-body text-sm text-txt-secondary">{ability}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Race link */}
        {race && (
          <div className="mt-8 pt-6 border-t border-bdr-secondary">
            <button
              onClick={() => navigate("race-detail", { raceId: race.id, name: race.name })}
              className="flex items-center gap-3 p-3 rounded border border-bdr-secondary hover:border-bdr-accent transition-all group"
            >
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: `${race.colors.primary}15` }}>
                <img src={race.icon} alt={race.name} className="w-6 h-6 object-contain" />
              </div>
              <div className="text-left">
                <span className="font-display text-xs tracking-wider" style={{ color: race.colors.primary }}>{race.name}</span>
                <p className="font-body text-[0.65rem] text-txt-tertiary">Voir la fiche de race →</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}