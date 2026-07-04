"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, ChevronDown } from "lucide-react";
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

interface ArtefactsSectionProps {
  onItemClick: (item: ItemCardData) => void;
}

export default function ArtefactsSection({ onItemClick }: ArtefactsSectionProps) {
  const [items, setItems] = useState<ItemCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<string | null>(null);
  const [parentSlug, setParentSlug] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [parents, setParents] = useState<string[]>([]);

  // Fetch parent slugs
  useEffect(() => {
    fetch(`/api/rubrique/items/parents?category=artefact`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.parents)) setParents(d.parents);
      })
      .catch(console.error);
  }, []);

  const fetchItems = useCallback(async (p: number, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        section: "artefacts",
        category: "artefact",
        page: String(p),
        limit: "12",
      });
      if (search) params.set("search", search);
      if (rankFilter) params.set("rank", rankFilter);
      if (parentSlug) params.set("parentSlug", parentSlug);

      const res = await fetch(`/api/rubrique/items?${params}`);
      const data = await res.json();
      const mapped: ItemCardData[] = (data.items || []).map((it: Record<string, unknown>) => ({
        ...it,
        category: "artefact",
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
  }, [search, rankFilter, parentSlug]);

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    fetchItems(1, true);
  }, [search, rankFilter, parentSlug, fetchItems]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchItems(next, false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Search + Rank filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un artefact..." accentColor={GOLD} />
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

      {/* Parent filter — TEXT-ONLY with underline, DNA style */}
      {parents.length > 0 && (
        <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setParentSlug(null)}
            className="shrink-0 px-1 py-2 text-xs cursor-pointer transition-all relative"
            style={{
              background: "transparent",
              color: !parentSlug ? GOLD : TEXT_TERTIARY,
              border: "none",
              borderBottom: !parentSlug ? `1px solid ${GOLD}` : "1px solid transparent",
              fontFamily: "'WorldText', serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => {
              if (parentSlug) e.currentTarget.style.color = TEXT_SECONDARY;
            }}
            onMouseLeave={(e) => {
              if (parentSlug) e.currentTarget.style.color = TEXT_TERTIARY;
            }}
          >
            Tous
          </button>
          {parents.map((p) => (
            <button
              key={p}
              onClick={() => setParentSlug(parentSlug === p ? null : p)}
              className="shrink-0 px-1 py-2 text-xs cursor-pointer transition-all relative capitalize"
              style={{
                background: "transparent",
                color: parentSlug === p ? GOLD : TEXT_TERTIARY,
                border: "none",
                borderBottom: parentSlug === p ? `1px solid ${GOLD}` : "1px solid transparent",
                fontFamily: "'WorldText', serif",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
              onMouseEnter={(e) => {
                if (parentSlug !== p) e.currentTarget.style.color = TEXT_SECONDARY;
              }}
              onMouseLeave={(e) => {
                if (parentSlug !== p) e.currentTarget.style.color = TEXT_TERTIARY;
              }}
            >
              {p.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* Gradient separator */}
      <div className="mb-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(224,218,187,0.15), transparent)" }} />

      {/* Grid */}
      {page === 1 && loading ? (
        <GridSkeleton count={8} />
      ) : items.length === 0 ? (
        <EmptyState message="Aucun artefact trouvé" />
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

          {/* Load more — DNA text-only button */}
          {page < totalPages && (
            <div className="flex justify-center mt-8">
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
          <div
            className="h-36"
            style={{ background: "rgba(224,218,187,0.03)" }}
          />
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