"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Search, Filter, X, ChevronDown, ChevronRight, ChevronLeft,
  BookOpen, Shield, Skull, MapPin, Star, Zap, Eye, Pencil,
  Loader2, ArrowLeft, AlertTriangle, Swords, Sparkles, Scroll,
  TrendingUp, Users, Globe, Menu, XIcon
} from "lucide-react";
import CreatureDetail from "./CreatureDetail";
import CreatureEditModal from "./CreatureEditModal";

// ─── Types ────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────
const ADMIN_DISCORD_ID = "722146261381415043";

const RANKS = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"] as const;

const RANK_COLORS: Record<string, string> = {
  F: "#6b7280",
  E: "#9ca3af",
  D: "#34d399",
  C: "#60a5fa",
  B: "#a78bfa",
  A: "#fbbf24",
  S: "#f87171",
  SS: "#fb923c",
  SSS: "#f472b6",
};

const RANK_BG: Record<string, string> = {
  F: "rgba(107,114,128,0.15)",
  E: "rgba(156,163,175,0.15)",
  D: "rgba(52,211,153,0.15)",
  C: "rgba(96,165,250,0.15)",
  B: "rgba(167,139,250,0.15)",
  A: "rgba(251,191,36,0.15)",
  S: "rgba(248,113,113,0.15)",
  SS: "rgba(251,146,60,0.15)",
  SSS: "rgba(244,114,182,0.15)",
};

const DANGER_COLORS: Record<number, string> = {
  1: "#34d399",
  2: "#fbbf24",
  3: "#fb923c",
  4: "#f87171",
  5: "#dc2626",
};

const DANGER_LABELS: Record<number, string> = {
  1: "Minimal",
  2: "Faible",
  3: "Modéré",
  4: "Élevé",
  5: "Extrême",
};

const CLASSES_ICONS: Record<string, React.ReactNode> = {
  "Bête": <Swords size={14} />,
  "Démon": <Skull size={14} />,
  "Esprit": <Sparkles size={14} />,
  "Dragon": <Shield size={14} />,
  "Humanoïde": <Users size={14} />,
  "Végétal": <Globe size={14} />,
  "Insecte": <Zap size={14} />,
  "Aquatique": <Globe size={14} />,
};

// ─── Main Component ───────────────────────────────────────────
export default function BestiaireWiki() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.id === ADMIN_DISCORD_ID;

  // Data state
  const [realms, setRealms] = useState<Realm[]>([]);
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [rankFilter, setRankFilter] = useState<string>("");
  const [realmFilter, setRealmFilter] = useState<string>("");
  const [dangerFilter, setDangerFilter] = useState<string>("");

  // View state
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"creatures" | "realms">("creatures");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const creaturesRef = useRef<HTMLDivElement>(null);

  // ─── Fetch Realms ──────────────────────────────────────────
  useEffect(() => {
    async function fetchRealms() {
      try {
        const res = await fetch("/api/bestiary/realms");
        const data = await res.json();
        if (data.realms) setRealms(data.realms);
      } catch (err) {
        console.error("Failed to fetch realms:", err);
      }
    }
    fetchRealms();
  }, []);

  // ─── Fetch Creatures ───────────────────────────────────────
  const fetchCreatures = useCallback(async (p: number, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", "24");
      if (search) params.set("search", search);
      if (rankFilter) params.set("rank", rankFilter);
      if (realmFilter) params.set("realm", realmFilter);
      if (dangerFilter) params.set("danger", dangerFilter);

      const res = await fetch(`/api/bestiary/creatures?${params}`);
      const data = await res.json();

      if (data.creatures) {
        setCreatures(prev => append ? [...prev, ...data.creatures] : data.creatures);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch creatures:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, rankFilter, realmFilter, dangerFilter]);

  useEffect(() => {
    setPage(1);
    fetchCreatures(1, false);
  }, [fetchCreatures]);

  // ─── Search debounce ───────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
    }, 400);
  };

  // ─── Load more ─────────────────────────────────────────────
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCreatures(nextPage, true);
  };

  // ─── Clear filters ─────────────────────────────────────────
  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setRankFilter("");
    setRealmFilter("");
    setDangerFilter("");
  };

  const hasActiveFilters = search || rankFilter || realmFilter || dangerFilter;

  // ─── Edit handler ──────────────────────────────────────────
  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleEditSave = async (slug: string, data: Record<string, any>) => {
    try {
      const res = await fetch(`/api/bestiary/creatures/${slug}?XTransformPort=3000`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setEditModalOpen(false);
        fetchCreatures(1, false);
        if (selectedCreature) {
          setSelectedCreature(prev => prev ? { ...prev, ...result.creature } : null);
        }
      }
    } catch (err) {
      console.error("Failed to save creature:", err);
    }
  };

  // ─── Render: Wiki Header ───────────────────────────────────
  const renderHeader = () => (
    <header className="sticky top-0 z-50 border-b border-white/[0.06]" style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b22, #f59e0b08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <BookOpen size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide" style={{ color: "#f59e0b", fontFamily: "'Poppins', sans-serif" }}>BESTIAIRE</h1>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>Encyclopédie des Créatures</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {(["creatures", "realms"] as const).map((section) => (
              <button
                key={section}
                onClick={() => { setActiveSection(section); if (section === "creatures") creaturesRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                className="px-4 py-2 rounded-lg text-xs font-medium tracking-wide uppercase transition-all duration-200 cursor-pointer"
                style={{
                  color: activeSection === section ? "#f59e0b" : "rgba(255,255,255,0.5)",
                  background: activeSection === section ? "rgba(245,158,11,0.08)" : "transparent",
                }}
              >
                {section === "creatures" ? "Créatures" : "Royaumes"}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search toggle (mobile) */}
            <button
              className="md:hidden p-2 rounded-lg cursor-pointer"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XIcon size={20} /> : <Menu size={20} />}
            </button>

            {/* Admin badge */}
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium tracking-wide uppercase" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                <Pencil size={10} />
                Admin
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.06] px-4 py-3 space-y-1">
          {(["creatures", "realms"] as const).map((section) => (
            <button
              key={section}
              onClick={() => { setActiveSection(section); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
              style={{
                color: activeSection === section ? "#f59e0b" : "rgba(255,255,255,0.6)",
                background: activeSection === section ? "rgba(245,158,11,0.08)" : "transparent",
              }}
            >
              {section === "creatures" ? "Créatures" : "Royaumes"}
            </button>
          ))}
        </div>
      )}
    </header>
  );

  // ─── Render: Hero Section ──────────────────────────────────
  const renderHero = () => (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(245,158,11,0.06) 0%, rgba(10,10,15,0) 100%)" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 80% 50%, #ef4444 0%, transparent 50%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        {/* Japanese title */}
        <p className="text-sm tracking-[0.3em] mb-3" style={{ color: "rgba(245,158,11,0.6)", fontFamily: "'Noto Sans JP', sans-serif" }}>
          異形図鑑
        </p>

        {/* Main title */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "#f0f0f0" }}>
          BESTIAIRE
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8" style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.8" }}>
          Recueil encyclopédique des créatures, monstres et entités surnaturelles
          qui peuplent les royaumes de cet univers.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: "#f59e0b", fontFamily: "'Poppins', sans-serif" }}>
              {total || creatures.length || "—"}
            </span>
            <span className="text-[11px] tracking-widest uppercase mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Créatures</span>
          </div>
          <div className="w-px h-10" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: "#f59e0b", fontFamily: "'Poppins', sans-serif" }}>
              {realms.length || "—"}
            </span>
            <span className="text-[11px] tracking-widest uppercase mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Royaumes</span>
          </div>
          <div className="w-px h-10" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: "#f59e0b", fontFamily: "'Poppins', sans-serif" }}>
              {new Set(creatures.map(c => c.rank)).size || "—"}
            </span>
            <span className="text-[11px] tracking-widest uppercase mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Rangs</span>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: "linear-gradient(to top, #0a0a0f, transparent)" }} />
    </section>
  );

  // ─── Render: Realm Browser ─────────────────────────────────
  const renderRealms = () => {
    if (realms.length === 0) return null;

    return (
      <section id="realms-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-wide" style={{ fontFamily: "'Poppins', sans-serif", color: "#e5e7eb" }}>
              <MapPin size={18} className="inline mr-2" style={{ color: "#f59e0b" }} />
              Royaumes
            </h3>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              Explorez les différents territoires et leurs créatures
            </p>
          </div>
          {realmFilter && (
            <button
              onClick={() => setRealmFilter("")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
              style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <X size={12} /> Tout voir
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {realms.map((realm) => {
            const isActive = realmFilter === realm.slug;
            const isConnu = realm.type === "connu";
            return (
              <button
                key={realm.id}
                onClick={() => setRealmFilter(isActive ? "" : realm.slug)}
                className="flex-shrink-0 w-48 sm:w-56 rounded-xl overflow-hidden text-left cursor-pointer transition-all duration-300 group"
                style={{
                  border: isActive
                    ? `1px solid ${isConnu ? "rgba(52,211,153,0.4)" : "rgba(167,139,250,0.4)"}`
                    : "1px solid rgba(255,255,255,0.06)",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                {/* Realm image */}
                <div className="relative h-28 overflow-hidden" style={{ background: isConnu ? "rgba(52,211,153,0.06)" : "rgba(167,139,250,0.06)" }}>
                  {realm.imageUrl ? (
                    <img
                      src={realm.imageUrl}
                      alt={realm.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {isConnu ? (
                        <Globe size={32} style={{ color: "rgba(52,211,153,0.3)" }} />
                      ) : (
                        <Eye size={32} style={{ color: "rgba(167,139,250,0.3)" }} />
                      )}
                    </div>
                  )}
                  {/* Type badge */}
                  <div
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide uppercase"
                    style={{
                      background: isConnu ? "rgba(52,211,153,0.2)" : "rgba(167,139,250,0.2)",
                      color: isConnu ? "#34d399" : "#a78bfa",
                      border: isConnu ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(167,139,250,0.3)",
                    }}
                  >
                    {realm.type}
                  </div>
                  {/* Danger indicator */}
                  {realm.dangerMoy && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <AlertTriangle size={10} style={{ color: DANGER_COLORS[realm.dangerMoy] || "#666" }} />
                      <span className="text-[10px] font-medium" style={{ color: DANGER_COLORS[realm.dangerMoy] || "#666" }}>
                        {DANGER_LABELS[realm.dangerMoy] || `Danger ${realm.dangerMoy}`}
                      </span>
                    </div>
                  )}
                </div>
                {/* Realm info */}
                <div className="p-3" style={{ background: "rgba(19,19,26,0.9)" }}>
                  <h4 className="text-sm font-semibold truncate" style={{ color: "#e5e7eb" }}>{realm.name}</h4>
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {realm._count.creatures} créature{realm._count.creatures !== 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  // ─── Render: Filters Bar ───────────────────────────────────
  const renderFilters = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher une créature..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#e5e7eb",
          }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(245,158,11,0.3)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(""); setSearch(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Rank */}
        <div className="relative">
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all"
            style={{
              background: rankFilter ? RANK_BG[rankFilter] : "rgba(255,255,255,0.04)",
              border: `1px solid ${rankFilter ? RANK_COLORS[rankFilter] + "40" : "rgba(255,255,255,0.08)"}`,
              color: rankFilter ? RANK_COLORS[rankFilter] : "rgba(255,255,255,0.5)",
            }}
          >
            <option value="">Rang</option>
            {RANKS.map(r => (
              <option key={r} value={r}>Rang {r}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
        </div>

        {/* Danger */}
        <div className="relative">
          <select
            value={dangerFilter}
            onChange={(e) => setDangerFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all"
            style={{
              background: dangerFilter ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${dangerFilter ? "rgba(248,113,113,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: dangerFilter ? DANGER_COLORS[Number(dangerFilter)] : "rgba(255,255,255,0.5)",
            }}
          >
            <option value="">Danger</option>
            {[1, 2, 3, 4, 5].map(d => (
              <option key={d} value={String(d)}>{DANGER_LABELS[d]} ({d}/5)</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
          >
            <X size={12} /> Réinitialiser
          </button>
        )}
      </div>
    </div>
  );

  // ─── Render: Creature Card ─────────────────────────────────
  const renderCreatureCard = (creature: Creature) => {
    const rankColor = RANK_COLORS[creature.rank] || "#666";
    const rankBg = RANK_BG[creature.rank] || "rgba(102,102,102,0.15)";

    return (
      <button
        key={creature.id}
        onClick={() => setSelectedCreature(creature)}
        className="group rounded-xl overflow-hidden text-left cursor-pointer transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: "rgba(19,19,26,0.8)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
          {creature.imageUrl ? (
            <img
              src={creature.imageUrl}
              alt={creature.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${rankBg}, rgba(10,10,15,0.5))` }}>
              {CLASSES_ICONS[creature.classe || ""] || <Skull size={40} style={{ color: `${rankColor}33` }} />}
            </div>
          )}

          {/* Rank badge */}
          <div
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider"
            style={{ background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}33` }}
          >
            {creature.rank}
          </div>

          {/* Danger level */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", color: DANGER_COLORS[creature.dangerLevel] || "#666" }}
          >
            <AlertTriangle size={10} />
            {creature.dangerLevel}/5
          </div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: "linear-gradient(to top, rgba(10,10,15,0.9), transparent)" }} />

          {/* Admin edit hint */}
          {isAdmin && (
            <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-1.5 rounded-lg" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
                <Pencil size={12} style={{ color: "#f59e0b" }} />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold truncate" style={{ color: "#e5e7eb" }}>{creature.name}</h4>
              {creature.nameJp && (
                <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {creature.nameJp}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {creature.classe && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {creature.classe}
              </span>
            )}
            {creature.realm && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                style={{ background: "rgba(245,158,11,0.08)", color: "rgba(245,158,11,0.6)", border: "1px solid rgba(245,158,11,0.1)" }}>
                {creature.realm.name}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  // ─── Render: Creature Grid ─────────────────────────────────
  const renderCreatureGrid = () => (
    <section ref={creaturesRef} id="creatures-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-wide" style={{ fontFamily: "'Poppins', sans-serif", color: "#e5e7eb" }}>
            <Scroll size={18} className="inline mr-2" style={{ color: "#f59e0b" }} />
            Base de Données
          </h3>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            {total} créature{total !== 1 ? "s" : ""} répertoriée{total !== 1 ? "s" : ""}
            {hasActiveFilters && " (filtrées)"}
          </p>
        </div>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin mb-4" style={{ color: "#f59e0b" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Chargement du bestiaire...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && creatures.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Skull size={28} style={{ color: "rgba(255,255,255,0.15)" }} />
          </div>
          <h4 className="text-base font-semibold mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Aucune créature trouvée</h4>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            {hasActiveFilters ? "Essayez de modifier vos filtres" : "Le bestiaire est vide"}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && creatures.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {creatures.map(renderCreatureCard)}
          </div>

          {/* Load more */}
          {creatures.length < total && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.15)",
                  color: "#f59e0b",
                  opacity: loadingMore ? 0.6 : 1,
                }}
              >
                {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                {loadingMore ? "Chargement..." : "Charger plus"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );

  // ─── Render: Footer ────────────────────────────────────────
  const renderFooter = () => (
    <footer className="mt-auto border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.95)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <BookOpen size={14} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide" style={{ color: "#f59e0b", fontFamily: "'Poppins', sans-serif" }}>BESTIAIRE</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Encyclopédie des Créatures</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>{total} créatures</span>
            <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span>{realms.length} royaumes</span>
            <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span>ASCENSION RP</span>
          </div>
        </div>
      </div>
    </footer>
  );

  // ─── Main Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0f", color: "#e5e7eb" }}>
      {/* Header */}
      {renderHeader()}

      {/* Content */}
      <main className="flex-1">
        {/* Hero */}
        {renderHero()}

        {/* Realms */}
        {renderRealms()}

        {/* Creatures */}
        {renderCreatureGrid()}
      </main>

      {/* Footer */}
      {renderFooter()}

      {/* Creature Detail Overlay */}
      {selectedCreature && (
        <CreatureDetail
          creature={selectedCreature}
          onClose={() => setSelectedCreature(null)}
          onEdit={isAdmin ? handleEdit : undefined}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedCreature && (
        <CreatureEditModal
          creature={selectedCreature}
          onClose={() => setEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}