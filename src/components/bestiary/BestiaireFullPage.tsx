"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Preloader from "./Preloader";
import RealmCarousel, { type RealmData } from "./RealmCarousel";
import CreatureCard, { type CreatureCardData, SssStyle } from "./CreatureCard";
import ObjetCard, { type ObjetCardData } from "./ObjetCard";
import CreatureDetail, { type CreatureDetailData } from "./CreatureDetail";
import CreatureEditModal from "./CreatureEditModal";
import { Search, X, Loader2, Filter, ArrowLeft, Pencil } from "lucide-react";

const ADMIN_DISCORD_ID = "722146261381415043";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type ViewTab = "bestiaire" | "objets" | "creature-detail";

interface CreatureListItem {
  name: string;
  slug: string;
  rank: string;
  dangerLevel: number;
  classe: string;
  imageUrl?: string;
  tags: string[];
}

interface ObjetListItem {
  name: string;
  slug: string;
  rank: string;
  type: string;
  imageUrl?: string;
}

const RANKS = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"];

/* ═══════════════════════════════════════════════════════════════
   HELPERS — Parse raw DB strings into structured data
   ═══════════════════════════════════════════════════════════════ */

function parseShinsou(raw: string | null | undefined): CreatureDetailData["shinsou"] {
  if (!raw) return { flux: "", resonance: "", effets: [] };
  try {
    const p = JSON.parse(raw);
    return {
      flux: p.flux || "",
      resonance: p.resonance || "",
      effets: Array.isArray(p.effets) ? p.effets : [],
    };
  } catch {
    return { flux: raw, resonance: "", effets: [] };
  }
}

function parseVariantes(raw: string | null | undefined): CreatureDetailData["variantes"] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function parseCaracteristiques(
  raw: string | null | undefined
): CreatureDetailData["caracteristiques"] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function BestiaireFullPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as Record<string, unknown>)?.discordId === ADMIN_DISCORD_ID;

  /* ─── Preloader ─── */
  const [preloaderDone, setPreloaderDone] = useState(false);

  /* ─── View state ─── */
  const [view, setView] = useState<ViewTab>("bestiaire");
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<CreatureDetailData | null>(null);

  /* ─── Realms ─── */
  const [realms, setRealms] = useState<RealmData[]>([]);

  /* ─── Creatures state ─── */
  const [creatures, setCreatures] = useState<CreatureListItem[]>([]);
  const [creaturePage, setCreaturePage] = useState(1);
  const [creatureTotal, setCreatureTotal] = useState(0);
  const [loadingCreatures, setLoadingCreatures] = useState(false);
  const [creatureSearch, setCreatureSearch] = useState("");
  const [creatureRank, setCreatureRank] = useState("");
  const [selectedRealmSlug, setSelectedRealmSlug] = useState<string | null>(null);
  const creatureSearchDebounced = useRef<string>("");
  const creatureSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Objets state ─── */
  const [objets, setObjets] = useState<ObjetListItem[]>([]);
  const [objetPage, setObjetPage] = useState(1);
  const [objetTotal, setObjetTotal] = useState(0);
  const [loadingObjets, setLoadingObjets] = useState(false);
  const [objetSearch, setObjetSearch] = useState("");
  const [objetRank, setObjetRank] = useState("");
  const objetSearchDebounced = useRef<string>("");
  const objetSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Detail loading ─── */
  const [loadingDetail, setLoadingDetail] = useState(false);

  /* ─── Filter panel open ─── */
  const [showCreatureFilters, setShowCreatureFilters] = useState(false);
  const [showObjetFilters, setShowObjetFilters] = useState(false);

  /* ─── Edit modal ─── */
  const [editModalOpen, setEditModalOpen] = useState(false);

  /* ═══════════════════════════════════════════════════════════════
     DATA FETCHING
     ═══════════════════════════════════════════════════════════════ */

  // Fetch realms on mount (in parallel with preloader)
  useEffect(() => {
    fetch("/api/bestiary/realms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.realms)) setRealms(data.realms);
      })
      .catch(console.error);
  }, []);

  // Fetch creatures
  const fetchCreatures = useCallback(
    async (page: number, append = false) => {
      setLoadingCreatures(true);
      try {
        const params = new URLSearchParams({ limit: "12", page: String(page) });
        const search = creatureSearchDebounced.current;
        if (search) params.set("search", search);
        if (creatureRank) params.set("rank", creatureRank);
        if (selectedRealmSlug) params.set("realm", selectedRealmSlug);

        const res = await fetch(`/api/bestiary/creatures?${params}`);
        const data = await res.json();
        const list: CreatureListItem[] = Array.isArray(data.creatures)
          ? data.creatures
          : [];
        setCreatures((prev) => (append ? [...prev, ...list] : list));
        setCreatureTotal(data.total || 0);
        setCreaturePage(page);
      } catch (err) {
        console.error("[BestiaireFullPage] fetchCreatures:", err);
      } finally {
        setLoadingCreatures(false);
      }
    },
    [creatureRank, selectedRealmSlug]
  );

  // Fetch objets
  const fetchObjets = useCallback(
    async (page: number, append = false) => {
      setLoadingObjets(true);
      try {
        const params = new URLSearchParams({ limit: "12", page: String(page) });
        const search = objetSearchDebounced.current;
        if (search) params.set("search", search);
        if (objetRank) params.set("rank", objetRank);

        const res = await fetch(`/api/objets?${params}`);
        const data = await res.json();
        const list: ObjetListItem[] = Array.isArray(data.objets) ? data.objets : [];
        setObjets((prev) => (append ? [...prev, ...list] : list));
        setObjetTotal(data.total || 0);
        setObjetPage(page);
      } catch (err) {
        console.error("[BestiaireFullPage] fetchObjets:", err);
      } finally {
        setLoadingObjets(false);
      }
    },
    [objetRank]
  );

  // Fetch creature detail
  const fetchDetail = useCallback(async (slug: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(
        `/api/bestiary/creatures/${encodeURIComponent(slug)}`
      );
      if (!res.ok) {
        setDetailData(null);
        return;
      }
      const d = await res.json();

      // Build description array
      let descArray: string[];
      if (Array.isArray(d.description)) {
        descArray = d.description;
      } else if (typeof d.description === "string" && d.description) {
        descArray = d.description.split("\n").filter((s: string) => s.trim());
      } else {
        descArray = [];
      }

      // Parse pouvoirs
      let pouvoirsArray = Array.isArray(d.pouvoirs)
        ? d.pouvoirs
        : [];
      // If pouvoirs are raw strings, wrap them
      if (pouvoirsArray.length > 0 && typeof pouvoirsArray[0] === "string") {
        pouvoirsArray = pouvoirsArray.map((p: string) => ({
          nom: p,
          description: "",
        }));
      }

      const detail: CreatureDetailData = {
        name: d.name,
        slug: d.slug,
        subtitle: d.nameJp || undefined,
        citation: d.citation || undefined,
        imageUrl: d.imageUrl || undefined,
        rank: d.rank || "F",
        dangerLevel: d.dangerLevel || 3,
        classe: d.classe || "",
        localisation: Array.isArray(d.localisation) ? d.localisation : [],
        description: descArray,
        comportement: d.comportement || "",
        shinsou: parseShinsou(d.signatureShinso),
        pouvoirs: pouvoirsArray,
        variantes: parseVariantes(d.variantes),
        caracteristiques: parseCaracteristiques(d.caracteristiques),
      };
      setDetailData(detail);
    } catch (err) {
      console.error("[BestiaireFullPage] fetchDetail:", err);
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     EFFECTS — trigger fetches when conditions change
     ═══════════════════════════════════════════════════════════════ */

  // Initial load after preloader
  const hasFetchedInitial = useRef(false);
  useEffect(() => {
    if (!preloaderDone || hasFetchedInitial.current) return;
    hasFetchedInitial.current = true;
    fetchCreatures(1);
  }, [preloaderDone, fetchCreatures]);

  // Re-fetch creatures when rank or realm filter changes
  useEffect(() => {
    if (!preloaderDone) return;
    fetchCreatures(1);
  }, [creatureRank, selectedRealmSlug, preloaderDone, fetchCreatures]);

  // Re-fetch objets when rank filter changes
  useEffect(() => {
    if (!preloaderDone || view !== "objets") return;
    fetchObjets(1);
  }, [objetRank, preloaderDone, view, fetchObjets]);

  // Fetch detail when entering creature-detail view
  useEffect(() => {
    if (view === "creature-detail" && detailSlug) {
      fetchDetail(detailSlug);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [view, detailSlug, fetchDetail]);

  // Load objets when switching to objets tab
  const hasFetchedObjets = useRef(false);
  useEffect(() => {
    if (view === "objets" && preloaderDone && !hasFetchedObjets.current) {
      hasFetchedObjets.current = true;
      fetchObjets(1);
    }
  }, [view, preloaderDone, fetchObjets]);

  /* ═══════════════════════════════════════════════════════════════
     HANDLERS
     ═══════════════════════════════════════════════════════════════ */

  const handlePreloaderReady = useCallback(() => setPreloaderDone(true), []);

  const handleTabChange = useCallback((tab: "bestiaire" | "objets") => {
    setView(tab);
    setDetailSlug(null);
    setDetailData(null);
  }, []);

  const handleRealmExplore = useCallback(
    (realm: RealmData) => {
      setSelectedRealmSlug((prev) => (prev === realm.slug ? null : realm.slug));
    },
    []
  );

  const handleCreatureSelect = useCallback((slug: string) => {
    setDetailSlug(slug);
    setView("creature-detail");
  }, []);

  const handleBack = useCallback(() => {
    setView("bestiaire");
    setDetailSlug(null);
    setDetailData(null);
  }, []);

  const handleLoadMoreCreatures = useCallback(() => {
    fetchCreatures(creaturePage + 1, true);
  }, [creaturePage, fetchCreatures]);

  const handleLoadMoreObjets = useCallback(() => {
    fetchObjets(objetPage + 1, true);
  }, [objetPage, fetchObjets]);

  // Debounced creature search
  const handleCreatureSearchChange = useCallback(
    (value: string) => {
      setCreatureSearch(value);
      if (creatureSearchTimer.current) clearTimeout(creatureSearchTimer.current);
      creatureSearchTimer.current = setTimeout(() => {
        creatureSearchDebounced.current = value;
        if (preloaderDone && view === "bestiaire") {
          fetchCreatures(1);
        }
      }, 400);
    },
    [preloaderDone, view, fetchCreatures]
  );

  // Debounced objet search
  const handleObjetSearchChange = useCallback(
    (value: string) => {
      setObjetSearch(value);
      if (objetSearchTimer.current) clearTimeout(objetSearchTimer.current);
      objetSearchTimer.current = setTimeout(() => {
        objetSearchDebounced.current = value;
        if (preloaderDone && view === "objets") {
          fetchObjets(1);
        }
      }, 400);
    },
    [preloaderDone, view, fetchObjets]
  );

  const clearCreatureFilters = useCallback(() => {
    setCreatureSearch("");
    creatureSearchDebounced.current = "";
    setCreatureRank("");
    setSelectedRealmSlug(null);
    if (creatureSearchTimer.current) clearTimeout(creatureSearchTimer.current);
  }, []);

  const clearObjetFilters = useCallback(() => {
    setObjetSearch("");
    objetSearchDebounced.current = "";
    setObjetRank("");
    if (objetSearchTimer.current) clearTimeout(objetSearchTimer.current);
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     COMPUTED
     ═══════════════════════════════════════════════════════════════ */

  const hasMoreCreatures = creatures.length < creatureTotal;
  const hasMoreObjets = objets.length < objetTotal;
  const hasActiveCreatureFilters =
    creatureSearch || creatureRank || selectedRealmSlug;
  const hasActiveObjetFilters = objetSearch || objetRank;

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen w-full" style={{ background: "#050508" }}>
      <SssStyle />

      {/* ─── PRELOADER ─── */}
      {!preloaderDone && <Preloader onReady={handlePreloaderReady} />}

      {/* ─── MAIN CONTENT ─── */}
      <div
        className="transition-opacity duration-700"
        style={{ opacity: preloaderDone ? 1 : 0 }}
      >
        {/* ═══ TAB BAR ═══ */}
        {view !== "creature-detail" && (
          <header
            className="sticky top-0 z-40 border-b"
            style={{
              background: "rgba(5,5,8,0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Tabs */}
              <nav className="flex items-center gap-0" role="tablist">
                {(
                  [
                    { id: "bestiaire" as const, label: "Bestiaire" },
                    { id: "objets" as const, label: "Objets" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={view === tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className="relative font-display text-xs sm:text-sm tracking-[0.18em] uppercase px-5 sm:px-8 py-4 transition-colors cursor-pointer"
                    style={{
                      color:
                        view === tab.id ? "#c9a25a" : "var(--text-tertiary)",
                    }}
                    onMouseEnter={(e) => {
                      if (view !== tab.id)
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      if (view !== tab.id)
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-tertiary)";
                    }}
                  >
                    {tab.label}
                    {/* Gold underline */}
                    <span
                      className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, #c9a25a, transparent)",
                        opacity: view === tab.id ? 1 : 0,
                      }}
                    />
                  </button>
                ))}
              </nav>
            </div>
          </header>
        )}

        {/* ═══ BESTIAIRE VIEW ═══ */}
        {view === "bestiaire" && (
          <div>
            {/* Realm Carousel */}
            {realms.length > 0 && (
              <section className="max-w-7xl mx-auto">
                <RealmCarousel
                  realms={realms}
                  onExplore={handleRealmExplore}
                />
              </section>
            )}

            {/* Active realm filter indicator */}
            {selectedRealmSlug && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono-custom text-[0.6rem] tracking-[0.1em] uppercase"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Filtré par royaume :
                  </span>
                  <span
                    className="font-display text-xs tracking-[0.08em] px-3 py-1 rounded-sm"
                    style={{
                      color: "#c9a25a",
                      border: "1px solid rgba(201,162,90,0.3)",
                      background: "rgba(201,162,90,0.06)",
                    }}
                  >
                    {realms.find((r) => r.slug === selectedRealmSlug)?.name ||
                      selectedRealmSlug}
                  </span>
                  <button
                    onClick={clearCreatureFilters}
                    className="p-1 rounded transition-colors cursor-pointer"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#c9a25a";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-tertiary)";
                    }}
                    aria-label="Réinitialiser les filtres"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Search + Filter Row */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <input
                    type="text"
                    value={creatureSearch}
                    onChange={(e) => handleCreatureSearchChange(e.target.value)}
                    placeholder="Rechercher une créature…"
                    className="w-full font-body text-sm pl-9 pr-4 py-2.5 rounded-lg outline-none transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(201,162,90,0.4)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--border-primary)";
                    }}
                  />
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowCreatureFilters((v) => !v)}
                  className="flex items-center gap-2 font-display text-[0.65rem] tracking-[0.15em] uppercase px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  style={{
                    background:
                      showCreatureFilters || creatureRank
                        ? "rgba(201,162,90,0.08)"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      showCreatureFilters || creatureRank
                        ? "rgba(201,162,90,0.3)"
                        : "var(--border-primary)"
                    }`,
                    color:
                      showCreatureFilters || creatureRank
                        ? "#c9a25a"
                        : "var(--text-tertiary)",
                  }}
                >
                  <Filter size={13} />
                  Rang
                </button>

                {/* Clear filters */}
                {hasActiveCreatureFilters && (
                  <button
                    onClick={clearCreatureFilters}
                    className="flex items-center gap-1.5 font-body text-xs px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
                    style={{
                      color: "var(--text-tertiary)",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-primary)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-tertiary)";
                    }}
                  >
                    <X size={12} />
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Rank filter dropdown */}
              {showCreatureFilters && (
                <div
                  className="mt-3 flex flex-wrap gap-2 p-3 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  {RANKS.map((r) => {
                    const isActive = creatureRank === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setCreatureRank(isActive ? "" : r)}
                        className="font-display text-[0.6rem] tracking-[0.12em] px-3 py-1.5 rounded-sm transition-all cursor-pointer"
                        style={{
                          color: isActive ? "#050508" : "var(--text-tertiary)",
                          background: isActive
                            ? "#c9a25a"
                            : "rgba(255,255,255,0.04)",
                          border: isActive
                            ? "1px solid #c9a25a"
                            : "1px solid var(--border-primary)",
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Creature Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              {loadingCreatures && creatures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2
                    size={24}
                    className="animate-spin mb-3"
                    style={{ color: "#c9a25a" }}
                  />
                  <span
                    className="font-mono-custom text-[0.6rem] tracking-[0.15em] uppercase"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Chargement des créatures…
                  </span>
                </div>
              ) : creatures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <span
                    className="text-4xl mb-4 opacity-20"
                    role="img"
                    aria-label="Aucune créature"
                  >
                    🐉
                  </span>
                  <p
                    className="font-body text-sm mb-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Aucune créature trouvée
                  </p>
                  <p
                    className="font-body text-xs"
                    style={{ color: "var(--text-tertiary)", opacity: 0.6 }}
                  >
                    Modifiez vos filtres pour affiner la recherche
                  </p>
                </div>
              ) : (
                <>
                  {/* Results count */}
                  <p
                    className="font-mono-custom text-[0.6rem] tracking-[0.1em] uppercase mb-4"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {creatureTotal} créature
                    {creatureTotal !== 1 ? "s" : ""}
                    {selectedRealmSlug || creatureRank
                      ? " (filtré"
                      : ""}
                    {selectedRealmSlug || creatureRank ? ")" : ""}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {creatures.map((c) => (
                      <div
                        key={c.slug}
                        className="[&_a]:pointer-events-none"
                        onClick={() => handleCreatureSelect(c.slug)}
                      >
                        <CreatureCard
                          creature={{
                            name: c.name,
                            slug: c.slug,
                            rank: c.rank,
                            dangerLevel: c.dangerLevel,
                            classe: c.classe || "",
                            imageUrl: c.imageUrl,
                            tags: c.tags || [],
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Load more */}
                  {hasMoreCreatures && (
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={handleLoadMoreCreatures}
                        disabled={loadingCreatures}
                        className="flex items-center gap-2 font-display text-[0.65rem] tracking-[0.2em] uppercase px-8 py-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        style={{
                          color: "#c9a25a",
                          border: "1px solid rgba(201,162,90,0.25)",
                          background: "rgba(201,162,90,0.04)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(201,162,90,0.08)";
                          e.currentTarget.style.borderColor =
                            "rgba(201,162,90,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(201,162,90,0.04)";
                          e.currentTarget.style.borderColor =
                            "rgba(201,162,90,0.25)";
                        }}
                      >
                        {loadingCreatures ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : null}
                        {loadingCreatures
                          ? "Chargement…"
                          : "Charger plus"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}

        {/* ═══ OBJETS VIEW ═══ */}
        {view === "objets" && (
          <div>
            {/* Search + Filter Row */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <input
                    type="text"
                    value={objetSearch}
                    onChange={(e) => handleObjetSearchChange(e.target.value)}
                    placeholder="Rechercher un objet…"
                    className="w-full font-body text-sm pl-9 pr-4 py-2.5 rounded-lg outline-none transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(201,162,90,0.4)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--border-primary)";
                    }}
                  />
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowObjetFilters((v) => !v)}
                  className="flex items-center gap-2 font-display text-[0.65rem] tracking-[0.15em] uppercase px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  style={{
                    background:
                      showObjetFilters || objetRank
                        ? "rgba(201,162,90,0.08)"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      showObjetFilters || objetRank
                        ? "rgba(201,162,90,0.3)"
                        : "var(--border-primary)"
                    }`,
                    color:
                      showObjetFilters || objetRank
                        ? "#c9a25a"
                        : "var(--text-tertiary)",
                  }}
                >
                  <Filter size={13} />
                  Rang
                </button>

                {/* Clear filters */}
                {hasActiveObjetFilters && (
                  <button
                    onClick={clearObjetFilters}
                    className="flex items-center gap-1.5 font-body text-xs px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
                    style={{
                      color: "var(--text-tertiary)",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-primary)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-tertiary)";
                    }}
                  >
                    <X size={12} />
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Rank filter dropdown */}
              {showObjetFilters && (
                <div
                  className="mt-3 flex flex-wrap gap-2 p-3 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  {RANKS.map((r) => {
                    const isActive = objetRank === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setObjetRank(isActive ? "" : r)}
                        className="font-display text-[0.6rem] tracking-[0.12em] px-3 py-1.5 rounded-sm transition-all cursor-pointer"
                        style={{
                          color: isActive ? "#050508" : "var(--text-tertiary)",
                          background: isActive
                            ? "#c9a25a"
                            : "rgba(255,255,255,0.04)",
                          border: isActive
                            ? "1px solid #c9a25a"
                            : "1px solid var(--border-primary)",
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Objet Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              {loadingObjets && objets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2
                    size={24}
                    className="animate-spin mb-3"
                    style={{ color: "#c9a25a" }}
                  />
                  <span
                    className="font-mono-custom text-[0.6rem] tracking-[0.15em] uppercase"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Chargement des objets…
                  </span>
                </div>
              ) : objets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <span
                    className="text-4xl mb-4 opacity-20"
                    role="img"
                    aria-label="Aucun objet"
                  >
                    🗡️
                  </span>
                  <p
                    className="font-body text-sm mb-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Aucun objet trouvé
                  </p>
                  <p
                    className="font-body text-xs"
                    style={{ color: "var(--text-tertiary)", opacity: 0.6 }}
                  >
                    Modifiez vos filtres pour affiner la recherche
                  </p>
                </div>
              ) : (
                <>
                  {/* Results count */}
                  <p
                    className="font-mono-custom text-[0.6rem] tracking-[0.1em] uppercase mb-4"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {objetTotal} objet{objetTotal !== 1 ? "s" : ""}
                    {objetRank ? " (filtré)" : ""}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {objets.map((o) => (
                      <ObjetCard
                        key={o.slug}
                        objet={{
                          name: o.name,
                          slug: o.slug,
                          rank: o.rank,
                          type: o.type,
                          imageUrl: o.imageUrl,
                        }}
                      />
                    ))}
                  </div>

                  {/* Load more */}
                  {hasMoreObjets && (
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={handleLoadMoreObjets}
                        disabled={loadingObjets}
                        className="flex items-center gap-2 font-display text-[0.65rem] tracking-[0.2em] uppercase px-8 py-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        style={{
                          color: "#c9a25a",
                          border: "1px solid rgba(201,162,90,0.25)",
                          background: "rgba(201,162,90,0.04)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(201,162,90,0.08)";
                          e.currentTarget.style.borderColor =
                            "rgba(201,162,90,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(201,162,90,0.04)";
                          e.currentTarget.style.borderColor =
                            "rgba(201,162,90,0.25)";
                        }}
                      >
                        {loadingObjets ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : null}
                        {loadingObjets
                          ? "Chargement…"
                          : "Charger plus"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}

        {/* ═══ CREATURE DETAIL VIEW ═══ */}
        {editModalOpen && detailData && (
          <CreatureEditModal
            creature={detailData}
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={(updated) => {
              setDetailData(updated);
              setEditModalOpen(false);
            }}
          />
        )}

        {view === "creature-detail" && (
          <div>
            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2
                  size={24}
                  className="animate-spin mb-3"
                  style={{ color: "#c9a25a" }}
                />
                <span
                  className="font-mono-custom text-[0.6rem] tracking-[0.15em] uppercase"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Chargement de la créature…
                </span>
              </div>
            ) : detailData ? (
              <div className="relative">
                {isAdmin && (
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="fixed top-4 right-4 z-50 flex items-center gap-2 font-display text-[0.6rem] tracking-[0.12em] uppercase px-4 py-2 rounded-lg border border-[#c9a25a]/30 text-[#c9a25a] transition-all hover:bg-[#c9a25a]/10 hover:border-[#c9a25a]/50 cursor-pointer"
                    style={{ background: "rgba(201,162,90,0.06)", backdropFilter: "blur(8px)" }}
                  >
                    <Pencil size={13} />
                    Éditer
                  </button>
                )}
                <CreatureDetail creature={detailData} onBack={handleBack} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p
                  className="font-body text-sm mb-4"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Créature introuvable
                </p>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 font-display text-[0.65rem] tracking-[0.15em] uppercase px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                  style={{
                    color: "#c9a25a",
                    border: "1px solid rgba(201,162,90,0.25)",
                    background: "rgba(201,162,90,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(201,162,90,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(201,162,90,0.04)";
                  }}
                >
                  <ArrowLeft size={14} />
                  Retour au Bestiaire
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}