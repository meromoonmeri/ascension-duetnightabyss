"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import RankBadge from "./shared/RankBadge";

/* ─── DNA Design Tokens ─── */
const GOLD = "#c9b89a";
const GOLD_LIGHT = "#d6bb8a";
const GOLD_BORDER = "rgba(201, 184, 154, 0.2)";
const GOLD_BORDER_HOVER = "rgba(201, 184, 154, 0.5)";
const GOLD_GLOW = "rgba(201, 184, 154, 0.15)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#a1a1a1";
const TEXT_TERTIARY = "#858585";

const ADMIN_DISCORD_ID = "722146261381415043";

export interface FicheItem {
  id: string;
  sectionId: string;
  category: string;
  parentSlug?: string | null;
  name: string;
  nameJp?: string | null;
  subtitle?: string | null;
  rank?: string | null;
  description?: string | null;
  vueEnsemble?: string | null;
  imageUrl?: string | null;
  backgroundImage?: string | null;
  gifUrl?: string | null;
  metadata?: string | null;
  order: number;
  [key: string]: unknown;
}

interface ParsedMetadata {
  classification?: string;
  nature?: string;
  vecteur?: string;
  portee?: string;
  style?: string;
  effets?: string[];
  fonctionnement?: string[];
  faiblesses?: string[];
  histoire?: string;
  proprietes?: string[];
  rarete?: string;
  comportement?: string;
  pouvoirs?: string[];
  localisation?: string;
  caracteristiques?: string[];
  danger?: number;
  sections?: { title: string; content: string }[];
  [key: string]: unknown;
}

interface RubriqueFicheProps {
  item: FicheItem;
  accentColor: string;
  sectionSlug: string;
  onBack: () => void;
  onEdit: (item: FicheItem) => void;
}

function parseMetadata(raw: string | null | undefined): ParsedMetadata {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ParsedMetadata;
  } catch {
    return {};
  }
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Gold separator line */}
      <div
        className="h-px w-full mb-3"
        style={{
          background: `linear-gradient(90deg, ${GOLD_BORDER_HOVER}, ${GOLD_BORDER}, transparent)`,
        }}
      />
      <h3
        className="text-xs font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2"
        style={{
          color: GOLD,
          fontFamily: "'WorldText', serif",
        }}
      >
        <ChevronRight size={14} />
        {title}
      </h3>
      <div>{children}</div>
    </motion.div>
  );
}

function ContentText({ text }: { text: string }) {
  return (
    <p
      className="text-sm leading-relaxed"
      style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}
    >
      {text}
    </p>
  );
}

function ContentList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-sm"
          style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}
        >
          <span
            className="mt-1.5 w-1 h-1 rounded-full shrink-0"
            style={{ background: GOLD }}
          />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function RubriqueFiche({ item, accentColor, sectionSlug, onBack, onEdit }: RubriqueFicheProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.id === ADMIN_DISCORD_ID;
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const meta = parseMetadata(item.metadata);

  useEffect(() => {
    setLoaded(false);
    setImageError(false);
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, [item.id]);

  const isTechnique = item.category === "technique-art" || item.category === "technique-racial";
  const isArtefact = item.category === "artefact";
  const isCreature = item.category === "creature";
  const isDimension = item.category === "dimension";

  const heroImage = item.gifUrl || item.imageUrl || item.backgroundImage;

  return (
    <AnimatePresence>
      {loaded && (
        <motion.div
          className="fixed inset-0 z-[150] overflow-y-auto"
          style={{ background: "#000000" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Admin edit — gold outlined button */}
          {isAdmin && (
            <motion.button
              onClick={() => onEdit(item)}
              className="fixed top-16 right-6 z-[160] flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all"
              style={{
                background: "transparent",
                border: `1px solid ${GOLD_BORDER}`,
                backdropFilter: "blur(16px)",
                color: GOLD,
                fontFamily: "'WorldText', serif",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = GOLD;
                e.currentTarget.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = GOLD;
              }}
            >
              <Pencil size={14} />
              <span className="hidden sm:inline">Éditer</span>
            </motion.button>
          )}

          <div className="min-h-screen">
            {/* Hero Image */}
            {heroImage && !imageError && (
              <motion.div
                className="relative h-72 sm:h-96 overflow-hidden"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={heroImage}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                {/* Gradient overlays */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, #000000 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)`,
                  }}
                />
                {/* Side vignette */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)`,
                  }}
                />
                {/* Gold accent shimmer at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${GOLD_BORDER_HOVER}, transparent)`,
                  }}
                />
              </motion.div>
            )}

            {/* Title area */}
            <motion.div
              className="px-6 pt-6 pb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  {item.rank && <RankBadge rank={item.rank} size="lg" />}
                  {isCreature && meta.danger != null && (
                    <span
                      className="text-xs px-2.5 py-1 rounded font-bold"
                      style={{
                        background: meta.danger >= 80 ? "rgba(239,68,68,0.15)" : meta.danger >= 50 ? `${GOLD}20` : "rgba(201,184,154,0.08)",
                        color: meta.danger >= 80 ? "#f87171" : meta.danger >= 50 ? GOLD : GOLD_DARK,
                        border: `1px solid ${meta.danger >= 80 ? "rgba(239,68,68,0.3)" : meta.danger >= 50 ? GOLD_BORDER_HOVER : GOLD_BORDER}`,
                        fontFamily: "'WorldText', serif",
                      }}
                    >
                      Danger {meta.danger}%
                    </span>
                  )}
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ color: TEXT_PRIMARY, fontFamily: "'WorldText', serif" }}
                >
                  {item.name}
                </h1>

                <div className="flex items-center gap-3 mt-1.5">
                  {item.nameJp && (
                    <span className="text-base" style={{ color: GOLD, fontFamily: "'Gloock', serif" }}>
                      {item.nameJp}
                    </span>
                  )}
                  {item.subtitle && (
                    <>
                      <span style={{ color: GOLD_BORDER }}>—</span>
                      <span className="text-sm" style={{ color: TEXT_TERTIARY, fontFamily: "'Gloock', serif" }}>
                        {item.subtitle}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Gold separator */}
            <div className="max-w-3xl mx-auto px-6 mt-4">
              <div
                className="h-px w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${GOLD_BORDER}, transparent)`,
                }}
              />
            </div>

            {/* Quick metadata bar (techniques only) */}
            {isTechnique && (
              <motion.div
                className="px-6 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
                  {meta.classification && (
                    <Tag label={meta.classification} />
                  )}
                  {meta.style && (
                    <Tag label={meta.style} />
                  )}
                  {meta.nature && (
                    <Tag label={`Nature: ${meta.nature}`} />
                  )}
                  {meta.vecteur && (
                    <Tag label={`Vecteur: ${meta.vecteur}`} />
                  )}
                  {meta.portee && (
                    <Tag label={`Portée: ${meta.portee}`} />
                  )}
                  {isArtefact && meta.rarete && (
                    <Tag label={`Rareté: ${meta.rarete}`} />
                  )}
                </div>
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              className="px-6 py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <div className="max-w-3xl mx-auto">
                {/* ─── TECHNIQUE SECTIONS ─── */}
                {isTechnique && (
                  <>
                    {item.vueEnsemble && (
                      <SectionBlock title="Vue d'ensemble">
                        <ContentText text={item.vueEnsemble} />
                      </SectionBlock>
                    )}
                    {item.description && (
                      <SectionBlock title="Description">
                        <ContentText text={item.description} />
                      </SectionBlock>
                    )}
                    {meta.effets && meta.effets.length > 0 && (
                      <SectionBlock title="Effets">
                        <ContentList items={meta.effets} />
                      </SectionBlock>
                    )}
                    {meta.fonctionnement && meta.fonctionnement.length > 0 && (
                      <SectionBlock title="Fonctionnement">
                        <ContentList items={meta.fonctionnement} />
                      </SectionBlock>
                    )}
                    {meta.faiblesses && meta.faiblesses.length > 0 && (
                      <SectionBlock title="Faiblesses">
                        <ContentList items={meta.faiblesses} />
                      </SectionBlock>
                    )}
                    {meta.classification && (
                      <SectionBlock title="Classification">
                        <ContentText text={meta.classification} />
                      </SectionBlock>
                    )}
                    {meta.nature && (
                      <SectionBlock title="Nature">
                        <ContentText text={meta.nature} />
                      </SectionBlock>
                    )}
                    {meta.vecteur && (
                      <SectionBlock title="Vecteur">
                        <ContentText text={meta.vecteur} />
                      </SectionBlock>
                    )}
                    {meta.portee && (
                      <SectionBlock title="Portée">
                        <ContentText text={meta.portee} />
                      </SectionBlock>
                    )}
                  </>
                )}

                {/* ─── ARTEFACT SECTIONS ─── */}
                {isArtefact && (
                  <>
                    {item.description && (
                      <SectionBlock title="Description">
                        <ContentText text={item.description} />
                      </SectionBlock>
                    )}
                    {meta.histoire && (
                      <SectionBlock title="Histoire & Origine">
                        <ContentText text={meta.histoire} />
                      </SectionBlock>
                    )}
                    {meta.proprietes && meta.proprietes.length > 0 && (
                      <SectionBlock title="Propriétés & Effets">
                        <ContentList items={meta.proprietes} />
                      </SectionBlock>
                    )}
                    {meta.rarete && (
                      <SectionBlock title="Rareté">
                        <ContentText text={meta.rarete} />
                      </SectionBlock>
                    )}
                  </>
                )}

                {/* ─── CREATURE SECTIONS ─── */}
                {isCreature && (
                  <>
                    {item.description && (
                      <SectionBlock title="Description">
                        <ContentText text={item.description} />
                      </SectionBlock>
                    )}
                    {meta.comportement && (
                      <SectionBlock title="Comportement">
                        <ContentText text={meta.comportement} />
                      </SectionBlock>
                    )}
                    {meta.pouvoirs && meta.pouvoirs.length > 0 && (
                      <SectionBlock title="Pouvoirs">
                        <ContentList items={meta.pouvoirs} />
                      </SectionBlock>
                    )}
                    {meta.localisation && (
                      <SectionBlock title="Localisation">
                        <ContentText text={meta.localisation} />
                      </SectionBlock>
                    )}
                    {meta.caracteristiques && meta.caracteristiques.length > 0 && (
                      <SectionBlock title="Caractéristiques">
                        <ContentList items={meta.caracteristiques} />
                      </SectionBlock>
                    )}
                  </>
                )}

                {/* ─── DIMENSION SECTIONS ─── */}
                {isDimension && (
                  <>
                    {item.description && (
                      <SectionBlock title="Description">
                        <ContentText text={item.description} />
                      </SectionBlock>
                    )}
                    {item.vueEnsemble && (
                      <SectionBlock title="Vue d'ensemble">
                        <ContentText text={item.vueEnsemble} />
                      </SectionBlock>
                    )}
                    {meta.sections && meta.sections.length > 0 && (
                      meta.sections.map((s, i) => (
                        <SectionBlock key={i} title={s.title}>
                          <ContentText text={s.content} />
                        </SectionBlock>
                      ))
                    )}
                  </>
                )}

                {/* Generic description fallback */}
                {!isTechnique && !isArtefact && !isCreature && !isDimension && item.description && (
                  <SectionBlock title="Description">
                    <ContentText text={item.description} />
                  </SectionBlock>
                )}
              </div>
            </motion.div>

            {/* Bottom padding */}
            <div className="h-20" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span
      className="text-[11px] px-2.5 py-1 rounded font-medium"
      style={{
        background: `${GOLD}08`,
        color: GOLD,
        border: `1px solid ${GOLD_BORDER}`,
        fontFamily: "'Gloock', serif",
      }}
    >
      {label}
    </span>
  );
}