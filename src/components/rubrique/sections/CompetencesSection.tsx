"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2, Sparkles, Swords, Users } from "lucide-react";
import { ART_DATA, type ArtData } from "@/data/arts";
import { RACE_DATA, type RaceData } from "@/data/races";
import SearchBar from "../shared/SearchBar";
import ItemCard, { type ItemCardData } from "../shared/ItemCard";

/* ─── DNA Design Tokens ─── */
const GOLD = "#E0DABB";
const GOLD_LIGHT = "#E0DABB";
const GOLD_DARK = "#BAAE93";
const GOLD_BORDER = "rgba(224, 218, 187, 0.15)";
const GOLD_BORDER_HOVER = "rgba(224, 218, 187, 0.35)";
const GOLD_GLOW = "rgba(224, 218, 187, 0.1)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_ACTIVE = "rgba(255, 255, 255, 0.9)";
const TEXT_SECONDARY = "#C1B8A2";
const TEXT_BODY = "#C1B8A2";
const TEXT_TERTIARY = "#A4A4A4";
const TEXT_MUTED = "#A7A7A7";

const RANKS = ["S", "A", "B", "C", "D", "E", "F", "EX"];

interface CompetencesSectionProps {
  onItemClick: (item: ItemCardData) => void;
}

export default function CompetencesSection({ onItemClick }: CompetencesSectionProps) {
  const [tab, setTab] = useState<"arts" | "racial">("arts");
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<string | null>(null);
  const [expandedArt, setExpandedArt] = useState<string | null>(null);
  const [expandedRace, setExpandedRace] = useState<string | null>(null);

  // Items fetched per parent
  const [artItems, setArtItems] = useState<Record<string, ItemCardData[]>>({});
  const [raceItems, setRaceItems] = useState<Record<string, ItemCardData[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Track in-flight requests to prevent duplicates
  const fetchingRef = useRef<Record<string, boolean>>({});

  const fetchItems = useCallback(
    async (category: string, parentSlug: string) => {
      const key = `${category}-${parentSlug}`;
      if (fetchingRef[key]) return;
      fetchingRef[key] = true;
      setLoading((prev) => ({ ...prev, [key]: true }));

      try {
        const params = new URLSearchParams({
          section: "competences",
          category,
          parentSlug,
          limit: "100",
        });
        if (search) params.set("search", search);
        if (rankFilter) params.set("rank", rankFilter);

        const res = await fetch(`/api/rubrique/items?${params}`);
        const data = await res.json();
        const items: ItemCardData[] = (data.items || []).map((it: Record<string, unknown>) => ({
          ...it,
          category,
          parentSlug,
        }));

        if (category === "technique-art") {
          setArtItems((prev) => ({ ...prev, [parentSlug]: items }));
        } else {
          setRaceItems((prev) => ({ ...prev, [parentSlug]: items }));
        }
      } catch (err) {
        console.error(err);
      }

      setLoading((prev) => ({ ...prev, [key]: false }));
      fetchingRef[key] = false;
    },
    [search, rankFilter]
  );

  // Re-fetch when search/rank changes
  useEffect(() => {
    const key = tab === "arts" ? expandedArt : expandedRace;
    const cat = tab === "arts" ? "technique-art" : "technique-racial";
    if (key) {
      fetchItems(cat, key);
    }
  }, [search, rankFilter, tab, expandedArt, expandedRace]);

  // Auto-expand first when switching tabs
  useEffect(() => {
    if (tab === "arts" && !expandedArt && ART_DATA.length > 0) {
      setExpandedArt(ART_DATA[0].id);
    }
    if (tab === "racial" && !expandedRace && RACE_DATA.length > 0) {
      setExpandedRace(RACE_DATA[0].id);
    }
  }, [tab, expandedArt, expandedRace]);

  const handleToggleArt = (id: string) => {
    const next = expandedArt === id ? null : id;
    setExpandedArt(next);
    if (next) fetchItems("technique-art", next);
  };

  const handleToggleRace = (id: string) => {
    const next = expandedRace === id ? null : id;
    setExpandedRace(next);
    if (next) fetchItems("technique-racial", next);
  };

  const filterItems = (items: ItemCardData[]) => {
    if (!search && !rankFilter) return items;
    return items.filter((it) => {
      if (rankFilter && it.rank?.toUpperCase() !== rankFilter.toUpperCase()) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (it.name || "").toLowerCase().includes(q) ||
          (it.nameJp || "").toLowerCase().includes(q) ||
          (it.subtitle || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Sub-tabs — TEXT-ONLY with underline, DNA style */}
      <div className="flex items-center gap-6 mb-6">
        <TabButton
          active={tab === "arts"}
          onClick={() => setTab("arts")}
          icon={<Swords size={14} />}
          label="Techniques par Art"
        />
        <TabButton
          active={tab === "racial"}
          onClick={() => setTab("racial")}
          icon={<Users size={14} />}
          label="Techniques Racial"
        />
      </div>

      {/* Search + Rank filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une technique..." accentColor={GOLD} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {RANKS.map((r) => (
            <button
              key={r}
              onClick={() => setRankFilter(rankFilter === r ? null : r)}
              className="px-1 py-1 text-[11px] cursor-pointer transition-all relative"
              style={{
                background: "transparent",
                color: rankFilter === r ? GOLD : TEXT_TERTIARY,
                border: "none",
                borderBottom: rankFilter === r ? `1px solid ${GOLD}` : "1px solid transparent",
                fontFamily: "'WorldText', serif",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
              onMouseEnter={(e) => {
                if (rankFilter !== r) {
                  e.currentTarget.style.color = TEXT_SECONDARY;
                }
              }}
              onMouseLeave={(e) => {
                if (rankFilter !== r) {
                  e.currentTarget.style.color = TEXT_TERTIARY;
                }
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ARTS TAB */}
      <AnimatePresence mode="wait">
        {tab === "arts" && (
          <motion.div
            key="arts"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-3">
              {ART_DATA.map((art, i) => (
                <ArtCategory
                  key={art.id}
                  art={art}
                  index={i}
                  expanded={expandedArt === art.id}
                  loading={!!loading[`technique-art-${art.id}`]}
                  items={filterItems(artItems[art.id] || [])}
                  onToggle={() => handleToggleArt(art.id)}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          </motion.div>
        )}

        {tab === "racial" && (
          <motion.div
            key="racial"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-3">
              {RACE_DATA.map((race, i) => (
                <RaceCategory
                  key={race.id}
                  race={race}
                  index={i}
                  expanded={expandedRace === race.id}
                  loading={!!loading[`technique-racial-${race.id}`]}
                  items={filterItems(raceItems[race.id] || [])}
                  onToggle={() => handleToggleRace(race.id)}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Tab Button — TEXT-ONLY with underline, DNA style ─── */
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-1 py-2 text-xs cursor-pointer transition-all relative"
      style={{
        background: "transparent",
        color: active ? GOLD : TEXT_TERTIARY,
        border: "none",
        borderBottom: active ? `1px solid ${GOLD}` : "1px solid transparent",
        fontFamily: "'WorldText', serif",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = TEXT_SECONDARY;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = TEXT_TERTIARY;
        }
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ─── Art Category (expandable) — text-only with underline, DNA style ─── */
function ArtCategory({
  art,
  index,
  expanded,
  loading,
  items,
  onToggle,
  onItemClick,
}: {
  art: ArtData;
  index: number;
  expanded: boolean;
  loading: boolean;
  items: ItemCardData[];
  onToggle: () => void;
  onItemClick: (item: ItemCardData) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        borderBottom: expanded ? `1px solid ${GOLD_BORDER}` : "1px solid transparent",
      }}
    >
      {/* Header — text-only clickable row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-3 text-left cursor-pointer"
        style={{
          background: "transparent",
          border: "none",
          borderBottom: expanded ? "none" : undefined,
        }}
      >
        <span className="text-lg">{art.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm" style={{ color: TEXT_ACTIVE, fontFamily: "'Gloock', serif" }}>
            {art.name}
          </h3>
          <p className="text-[11px] truncate" style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}>
            {art.subtitle}
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: TEXT_MUTED }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Expanded content — no border panel, just indented list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pl-8 pb-4 space-y-0.5 max-h-96 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: `${GOLD_BORDER} transparent` }}>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin" style={{ color: GOLD }} />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles size={20} style={{ color: `${GOLD}33` }} className="mx-auto mb-2" />
                  <p className="text-xs" style={{ color: TEXT_TERTIARY, fontFamily: "'Gloock', serif" }}>
                    Aucune technique enregistrée
                  </p>
                </div>
              ) : (
                items.map((item, j) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: j * 0.03 }}
                  >
                    <ItemCard item={item} accentColor={GOLD} onClick={onItemClick} variant="compact" />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Race Category (expandable) — text-only with underline, DNA style ─── */
function RaceCategory({
  race,
  index,
  expanded,
  loading,
  items,
  onToggle,
  onItemClick,
}: {
  race: RaceData;
  index: number;
  expanded: boolean;
  loading: boolean;
  items: ItemCardData[];
  onToggle: () => void;
  onItemClick: (item: ItemCardData) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        borderBottom: expanded ? `1px solid ${GOLD_BORDER}` : "1px solid transparent",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-3 text-left cursor-pointer"
        style={{
          background: "transparent",
          border: "none",
        }}
      >
        {race.icon.startsWith('/') ? (
          <img src={race.icon} alt={race.name} className="w-7 h-7 object-cover flex-shrink-0" />
        ) : (
          <span className="text-lg">{race.icon}</span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm" style={{ color: TEXT_ACTIVE, fontFamily: "'Gloock', serif" }}>
              {race.name}
            </h3>
            <span className="text-xs" style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}>
              {race.nameJp}
            </span>
          </div>
          <p className="text-[11px] truncate" style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}>
            {race.subtitle}
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: TEXT_MUTED }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pl-8 pb-4 space-y-0.5 max-h-96 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: `${GOLD_BORDER} transparent` }}>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin" style={{ color: GOLD }} />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles size={20} style={{ color: `${GOLD}33` }} className="mx-auto mb-2" />
                  <p className="text-xs" style={{ color: TEXT_TERTIARY, fontFamily: "'Gloock', serif" }}>
                    Aucune technique raciale enregistrée
                  </p>
                </div>
              ) : (
                items.map((item, j) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: j * 0.03 }}
                  >
                    <ItemCard item={item} accentColor={GOLD} onClick={onItemClick} variant="compact" />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}