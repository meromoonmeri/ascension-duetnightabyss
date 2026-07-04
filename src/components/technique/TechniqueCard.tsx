"use client";

import React from "react";
import { RankBadge, SectionSeparator, FourPointStar } from "@/components/shared/Ornaments";
import Image from "next/image";

interface TechniqueData {
  nameJp: string;
  nameFr: string;
  subtitle: string;
  rank: string;
  classification: string;
  nature: string;
  vecteur: string;
  portee: string;
  techniqueParente: string;
  techniqueDerivee: string;
  vueEnsemble: string;
  effets: string[];
  fonctionnement: string[];
  faiblesses: string[];
  imageUrl?: string;
  techniqueNumber?: number;
  raceColor?: string;
  artColor?: string;
}

export default function TechniqueCard({ data }: { data: TechniqueData }) {
  const accentColor = data.raceColor || data.artColor || "var(--silver-dark)";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Card container */}
      <div
        className="technique-card relative"
        style={{ borderColor: accentColor }}
      >
        {/* Border glow */}
        <div
          className="card-border-glow pointer-events-none"
          style={{
            border: `1px solid ${accentColor}`,
            opacity: 0.3,
            borderRadius: "inherit",
          }}
        />

        {/* ===== HEADER BAND ===== */}
        <div className="card-header-band">
          {/* Technique number */}
          <div className="technique-number mb-3" style={{ color: accentColor }}>
            FICHE DE TECHNIQUE N°{data.techniqueNumber || "—"}
          </div>

          {/* Title block */}
          <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
            {/* Image placeholder */}
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded flex-shrink-0 flex items-center justify-center overflow-hidden border border-bdr-secondary"
              style={{ background: "var(--bg-secondary)" }}
            >
              {data.imageUrl ? (
                <Image
                  src={data.imageUrl}
                  alt={data.nameFr}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FourPointStar size={48} className="opacity-25" />
              )}
            </div>

            {/* Title text */}
            <div className="flex-1 min-w-0">
              <div className="technique-name-jp" style={{ color: accentColor }}>
                {data.nameJp}
              </div>
              <div className="technique-name-fr mt-0.5" style={{ color: "var(--text-primary)" }}>
                {data.nameFr}
              </div>
              <div className="technique-subtitle">
                {data.subtitle}
              </div>
              <div className="mt-3">
                <RankBadge rank={data.rank} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== DATA TABLE ===== */}
        <div className="px-4 sm:px-8 pt-6">
          <div className="data-table" style={{ borderColor: accentColor + "40" }}>
            <div className="data-table-row">
              <div className="data-label">Classification</div>
              <div className="data-value">{data.classification}</div>
            </div>
            <div className="data-table-row">
              <div className="data-label">Nature</div>
              <div className="data-value">{data.nature}</div>
            </div>
            <div className="data-table-row">
              <div className="data-label">Vecteur</div>
              <div className="data-value">{data.vecteur}</div>
            </div>
            <div className="data-table-row">
              <div className="data-label">Portée</div>
              <div className="data-value">{data.portee}</div>
            </div>
            <div className="data-table-row">
              <div className="data-label">T. Parente</div>
              <div className="data-value">{data.techniqueParente || "—"}</div>
            </div>
            <div className="data-table-row">
              <div className="data-label">T. Dérivée</div>
              <div className="data-value">{data.techniqueDerivee || "—"}</div>
            </div>
          </div>
        </div>

        {/* ===== CONTENT COLUMNS ===== */}
        <div className="px-4 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            {/* Vue d'ensemble */}
            <div className="section-title" style={{ borderBottomColor: accentColor + "40" }}>
              VUE D&apos;ENSEMBLE
            </div>
            <p className="font-body text-sm leading-relaxed text-txt-secondary">
              {data.vueEnsemble}
            </p>

            <SectionSeparator className="!py-3" />

            {/* Effets */}
            <div className="section-title" style={{ borderBottomColor: accentColor + "40" }}>
              EFFET
            </div>
            <ul className="space-y-2">
              {data.effets.map((effet, i) => (
                <li
                  key={i}
                  className="bullet-effect font-body text-sm text-txt-secondary leading-relaxed flex items-start"
                >
                  <span className="mr-2 opacity-50 flex-shrink-0">○</span>
                  <span>{effet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column */}
          <div>
            {/* Fonctionnement */}
            <div className="section-title" style={{ borderBottomColor: accentColor + "40" }}>
              FONCTIONNEMENT
            </div>
            <ol className="space-y-2">
              {data.fonctionnement.map((etape, i) => (
                <li
                  key={i}
                  className="font-body text-sm text-txt-secondary leading-relaxed flex items-start"
                >
                  <span
                    className="mr-2 flex-shrink-0 font-mono text-xs opacity-50"
                    style={{ color: accentColor }}
                  >
                    {["①", "②", "③", "④", "⑤"][i] || `${i + 1}.`}
                  </span>
                  <span>{etape}</span>
                </li>
              ))}
            </ol>

            <SectionSeparator className="!py-3" />

            {/* Faiblesses */}
            <div className="section-title" style={{ borderBottomColor: accentColor + "40" }}>
              FAIBLESSE
            </div>
            <ul className="space-y-2">
              {data.faiblesses.map((faiblesse, i) => (
                <li
                  key={i}
                  className="font-body text-sm text-txt-secondary leading-relaxed flex items-start"
                >
                  <span className="mr-2 opacity-60 flex-shrink-0 text-red-500/80">✕</span>
                  <span>{faiblesse}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="h-px mx-4 sm:mx-8 mb-4"
          style={{ background: `linear-gradient(to right, transparent, ${accentColor}60, transparent)` }}
        />
      </div>
    </div>
  );
}