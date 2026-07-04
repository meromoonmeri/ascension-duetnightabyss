"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, ChevronDown, MapPin } from "lucide-react";
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

const RANKS = ["S", "A", "B", "C", "D", "E", "F"];

interface CreaturesSectionProps {
  onItemClick: (item: ItemCardData) => void;
}

export default function CreaturesSection({ onItemClick }: CreaturesSectionProps) {
  const [locations, setLocations] = useState<Array<{ slug: string; label: string }>>([]);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [items, setItems] = useState<ItemCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch location parents
  useEffect(() => {
    fetch(`/api/rubrique/items/parents?category=creature`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.parents)) {
          setLocations(d.parents);
          if (d.parents.length > 0) setActiveLocation(d.parents[0].slug || d.parents[0]);
        }
      })
      .catch(console.error);
  }, []);

  const fetchItems = useCallback(
    async (p: number, reset = false) => {
      if (!activeLocation) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          section: "creatures",
          category: "creature",
          parentSlug: activeLocation,
          page: String(p),
          limit: "12",
        });
        if (search) params.set("search", search);
        if (rankFilter) params.set("rank", rankFilter);

        const res = await fetch(`/api/rubrique/items?${params}`);
        const data = await res.json();
        const mapped: ItemCardData[] = (data.items || []).map((it: Record<string, unknown>) => ({
          ...it,
          category: "creature",
          parentSlug: activeLocation,
        }));

        if (reset) {
          setItems(mapped);
        } else {
          setItems((prev) => [...prev, ...mapped]);
        }
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    },
    [activeLocation, search, rankFilter]
  );

  useEffect(() => {
    setPage(1);
    fetchItems(1, true);
  }, [activeLocation, search, rankFilter, fetchItems]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchItems(next, false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Location tabs — TEXT-ONLY with underline, DNA style */}
      <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {locations.map((loc) => {
          const isActive = activeLocation === loc.slug;
          return (
            <button
              key={loc.slug}
              onClick={() => setActiveLocation(loc.slug)}
              className="shrink-0 flex items-center gap-2 px-1 py-2 text-xs cursor-pointer transition-all relative"
              style={{
                background: "transparent",
                color: isActive ? GOLD : TEXT_TERTIARY,
                border: "none",
                borderBottom: isActive ? `1px solid ${GOLD}` : "1px solid transparent",
                fontFamily: "'WorldText', serif",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = TEXT_SECONDARY;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = TEXT_TERTIARY;
              }}
            >
              <MapPin size={12} />
              {loc.label}
            </button>
          );
        })}
      </div>

      {/* Gradient separator */}
      <div className="mb-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(224,218,187,0.15), transparent)" }} />

      {/* Search + Rank filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Rechercher une créature..."
            accentColor={GOLD}
          />
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

      {/* Content */}
      {page === 1 && loading ? (
        <GridSkeleton count={8} />
      ) : items.length === 0 ? (
        <EmptyState
          message={activeLocation ? "Aucune créature dans cette localisation" : "Sélectionnez une localisation"}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 11) * 0.04 }}
              >
                <ItemCard item={item} accentColor={GOLD} onClick={onItemClick} />
              </motion.div>
            ))}
          </div>

          {page < totalPages && (
            <div className="flex justify-center mt-8">
              {/* DNA text-only load more button */}
              <motion.button
                onClick={loadMore}
                disabled={loading}
                className="flex items-center gap-2 px-1 py-3 cursor-pointer transition-all"
                style={{
                  background: "transparent",
                  border: "none",
                  color: TEXT_MUTED,
                  fontFamily: "'Gloock', serif",
                  fontSize: "14px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = GOLD;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = TEXT_MUTED;
                }}
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ChevronDown size={14} />
                )}
                Charger plus
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "transparent",
          }}
        >
          <div className="h-36" style={{ background: "rgba(224,218,187,0.03)" }} />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4" style={{ background: "rgba(224,218,187,0.06)" }} />
            <div className="h-3 w-1/2" style={{ background: "rgba(224,218,187,0.04)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <Sparkles size={28} style={{ color: `${GOLD}33` }} className="mx-auto mb-3" />
      <p className="text-sm" style={{ color: TEXT_TERTIARY, fontFamily: "'Gloock', serif" }}>
        {message}
      </p>
    </div>
  );
}