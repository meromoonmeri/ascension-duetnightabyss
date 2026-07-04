"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigation } from "@/store/navigationStore";
import { RACE_DATA } from "@/data/races";
import { ART_DATA } from "@/data/arts";
import { COSMOLOGY_DATA, GEOGRAPHY_DATA } from "@/data/cosmology";
import { Search, X } from "lucide-react";

interface SearchResult {
  type: "race" | "art" | "technique" | "cosmology" | "geography";
  id: string;
  title: string;
  subtitle: string;
  color: string;
  navigateTo: { page: string; params: Record<string, string> };
}

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, navigate } = useNavigation();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus input when opened — reset query via ref to avoid setState in effect
  const prevSearchOpenRef = useRef(searchOpen);
  useEffect(() => {
    if (searchOpen && !prevSearchOpenRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        setQuery("");
      }, 100);
    }
    prevSearchOpenRef.current = searchOpen;
  }, [searchOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [searchOpen, setSearchOpen]);

  // Build search index
  const searchIndex = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];

    // Races
    RACE_DATA.forEach((race) => {
      results.push({
        type: "race",
        id: race.id,
        title: race.name,
        subtitle: race.subtitle,
        color: race.colors.primary,
        navigateTo: { page: "race-detail", params: { raceId: race.id, name: race.name } },
      });
      // Race techniques
      race.techniques.forEach((tech) => {
        results.push({
          type: "technique",
          id: tech.id,
          title: tech.nameFr,
          subtitle: `${race.name} — ${tech.nameJp} — Rang ${tech.rank}`,
          color: race.colors.primary,
          navigateTo: {
            page: "race-technique",
            params: {
              raceId: race.id,
              techniqueId: tech.id,
              techniqueName: tech.nameFr,
              raceName: race.name,
              accentColor: race.colors.primary,
            },
          },
        });
      });
    });

    // Arts
    ART_DATA.forEach((art) => {
      results.push({
        type: "art",
        id: art.id,
        title: art.name,
        subtitle: art.subtitle,
        color: art.colors.primary,
        navigateTo: { page: "art-detail", params: { artId: art.id, name: art.name } },
      });
    });

    // Cosmology
    COSMOLOGY_DATA.forEach((section) => {
      results.push({
        type: "cosmology",
        id: section.id,
        title: section.title,
        subtitle: section.subtitle,
        color: "var(--silver)",
        navigateTo: {
          page: "cosmology-detail",
          params: { id: section.id, title: section.title, type: "cosmology" },
        },
      });
    });

    // Geography
    GEOGRAPHY_DATA.forEach((section) => {
      results.push({
        type: "geography",
        id: section.id,
        title: section.title,
        subtitle: section.titleJp,
        color: "var(--gold)",
        navigateTo: {
          page: "geography-detail",
          params: { id: section.id, title: section.title, type: "geography" },
        },
      });
    });

    return results;
  }, []);

  // Filter results
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return searchIndex.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }, [query, searchIndex]);

  // Group by type
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    filtered.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [filtered]);

  const typeLabels: Record<string, string> = {
    race: "Races",
    art: "Arts",
    technique: "Techniques",
    cosmology: "Cosmologie",
    geography: "Géographie",
  };

  if (!searchOpen) return null;

  const handleSelect = (result: SearchResult) => {
    setSearchOpen(false);
    navigate(result.navigateTo.page as never, result.navigateTo.params);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={(e) => {
        if (e.target === overlayRef.current) setSearchOpen(false);
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Search container */}
      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* Search input */}
        <div className="flex items-center gap-3 border border-bdr-accent bg-surface-elevated rounded px-4 py-3 shadow-lg">
          <Search className="w-5 h-5 text-txt-tertiary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une race, un art, une technique..."
            className="flex-1 bg-transparent font-body text-base text-txt-primary placeholder:text-txt-tertiary outline-none"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="text-txt-tertiary hover:text-txt-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="mt-2 max-h-[50vh] overflow-y-auto bg-surface-elevated border border-bdr-secondary rounded shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-6 py-8 text-center text-txt-tertiary font-body">
                Aucun résultat pour &laquo; {query} &raquo;
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(grouped).map(([type, items]) => (
                  <div key={type} className="mb-2">
                    <div className="px-4 py-1.5 font-display text-[0.6rem] tracking-[0.2em] uppercase text-txt-tertiary">
                      {typeLabels[type] || type} ({items.length})
                    </div>
                    {items.map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelect(item)}
                        className="w-full text-left px-4 py-2.5 hover:bg-surface-tertiary transition-colors flex items-center gap-3 group"
                      >
                        <div
                          className="w-1 h-8 rounded-full flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0">
                          <div className="font-display text-sm tracking-wide text-txt-primary group-hover:text-silver-bright transition-colors truncate">
                            {item.title}
                          </div>
                          <div className="font-body text-xs text-txt-tertiary truncate">
                            {item.subtitle}
                          </div>
                        </div>
                        <span className="ml-auto font-mono text-[0.6rem] text-txt-tertiary opacity-40 flex-shrink-0 uppercase">
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}