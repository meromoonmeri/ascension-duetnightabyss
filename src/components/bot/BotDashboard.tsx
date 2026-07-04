"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Castle, Globe, Coins, Trophy, Crown } from "lucide-react";
import { SectionSeparator, FourPointStar } from "@/components/shared/Ornaments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ==========================================
// TYPES
// ==========================================

interface BotStats {
  totalPlayers: number;
  totalKingdoms: number;
  totalContinents: number;
  totalTreasury: number;
  avgKingdomRank: number;
}

interface KingdomEntry {
  id: string;
  name: string;
  rank: number;
  treasury: number;
  taxRate: number;
  population: number;
  citizenCount: number;
  priceModifier: number;
  buybackRate: number;
  continent: string;
  rankingPosition: number;
}

interface ContinentEntry {
  id: string;
  name: string;
  description: string;
  climate: string;
  rank: number;
  rankName: string;
  treasury: number;
  kingdomCount: number;
  totalCitizens: number;
  kingdoms: {
    id: string;
    name: string;
    rank: number;
    treasury: number;
    population: number;
    citizenCount: number;
  }[];
}

interface LeaderboardEntry {
  id: string;
  rankingPosition: number;
  characterName: string;
  race: string;
  socialRank: number;
  socialRankName: string;
  ether: number;
  gold: number;
  kingdom: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const KINGDOM_RANKS: Record<number, { name: string; color: string }> = {
  1: { name: "Pauvre", color: "#9CA3AF" },
  2: { name: "En Crise", color: "#F97316" },
  3: { name: "Stable", color: "#FBBF24" },
  4: { name: "Riche", color: "#34D399" },
  5: { name: "Prospère", color: "#D4AF37" },
};

const CONTINENT_RANKS: Record<number, { name: string; color: string }> = {
  1: { name: "Ruiné", color: "#9CA3AF" },
  2: { name: "Faible", color: "#F97316" },
  3: { name: "Stable", color: "#FBBF24" },
  4: { name: "Développé", color: "#34D399" },
  5: { name: "Superpuissance", color: "#D4AF37" },
};

const RACE_COLORS: Record<string, string> = {
  Céleste: "#FBBF24",
  "Elfe Sylvestre": "#34D399",
  Humain: "#60A5FA",
  "Bête-Démon": "#EF4444",
  Vampire: "#A855F7",
  Démon: "#F97316",
  Chimère: "#EC4899",
  Néant: "#6B7280",
  Elfes: "#34D399",
  "Hommes-Bêtes": "#EF4444",
  Titans: "#F97316",
  Démons: "#F97316",
  Vampires: "#A855F7",
  Dragons: "#FBBF24",
  Fées: "#EC4899",
};

const DISCORD_URL = "https://discord.gg/svAvDbBx36";

const BOT_COMMANDS = [
  { cmd: "/register", desc: "Créer son personnage" },
  { cmd: "/profile", desc: "Fiche de personnage" },
  { cmd: "/royaume", desc: "Gérer les royaumes" },
  { cmd: "/shop", desc: "Boutique du royaume" },
  { cmd: "/marche", desc: "Marché joueur" },
  { cmd: "/salaire", desc: "Paie hebdomadaire" },
  { cmd: "/continents", desc: "Vue des continents" },
  { cmd: "/classement", desc: "Classements" },
];

// ==========================================
// ANIMATION
// ==========================================

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ==========================================
// HELPERS
// ==========================================

function fmt(n: number): string {
  return n.toLocaleString("fr-FR");
}

function getRaceColor(race: string): string {
  return RACE_COLORS[race] || "#C0C0C0";
}

// ==========================================
// LOADING SPINNER
// ==========================================

function GoldSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }}
        />
        <FourPointStar size={18} className="absolute inset-0 m-auto opacity-60" color="#D4AF37" />
      </div>
      <span className="font-display text-xs tracking-[0.2em] uppercase text-[var(--text-tertiary)]">
        Synchronisation avec le bot…
      </span>
    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <motion.div variants={staggerItem}>
      <Card
        className="relative overflow-hidden border-[var(--border-primary)] bg-[var(--bg-card)] py-5"
        style={{ boxShadow: "none" }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#D4AF37]" />
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l opacity-20" style={{ borderColor: "#D4AF37" }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r opacity-20" style={{ borderColor: "#D4AF37" }} />
        <CardContent className="px-5 pb-0 pt-0">
          <div className="flex items-start justify-between mb-3">
            <Icon size={22} strokeWidth={1.5} className="text-[#D4AF37] opacity-70" />
            <FourPointStar size={10} className="opacity-20" color="#D4AF3780" />
          </div>
          <div className="font-display text-3xl sm:text-4xl tracking-wide mb-1" style={{ color: "#D4AF37" }}>
            {value}
          </div>
          <div className="font-body text-sm text-[var(--text-tertiary)]">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ==========================================
// RANK BADGE
// ==========================================

function RankBadge({ rank, type = "kingdom" }: { rank: number; type?: "kingdom" | "continent" }) {
  const map = type === "kingdom" ? KINGDOM_RANKS : CONTINENT_RANKS;
  const info = map[rank];
  if (!info) return null;
  return (
    <Badge
      variant="outline"
      className="text-[0.65rem] font-display tracking-wider uppercase border-none"
      style={{
        color: info.color,
        backgroundColor: info.color + "18",
      }}
    >
      R{rank} — {info.name}
    </Badge>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function BotDashboard() {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [kingdoms, setKingdoms] = useState<KingdomEntry[]>([]);
  const [continents, setContinents] = useState<ContinentEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/bot/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/bot/kingdoms").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/bot/continents").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/bot/leaderboard").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([s, k, c, l]) => {
        setStats(s);
        setKingdoms(Array.isArray(k) ? k : []);
        setContinents(Array.isArray(c) ? c : []);
        setLeaderboard(Array.isArray(l) ? l : []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <GoldSpinner />
      </div>
    );
  }

  // Empty state
  if (error || !stats || (stats.totalPlayers === 0 && leaderboard.length === 0)) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <HeroHeader />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center py-32 px-4 text-center"
        >
          <div
            className="w-20 h-20 rounded-full mb-8 flex items-center justify-center"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-primary)" }}
          >
            <FourPointStar size={32} color="#D4AF3780" />
          </div>
          <h3 className="font-display text-lg tracking-[0.1em] text-[var(--text-secondary)] mb-3">
            Aucune donnée encore
          </h3>
          <p className="font-body text-sm text-[var(--text-tertiary)] max-w-md leading-relaxed">
            Le bot n&apos;a pas de joueurs enregistrés. Rejoins le serveur Discord et utilise{" "}
            <span className="font-display" style={{ color: "#D4AF37" }}>
              /register
            </span>{" "}
            pour commencer ton aventure.
          </p>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 font-display text-xs tracking-[0.15em] uppercase px-6 py-3 rounded border border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-all duration-300"
          >
            Rejoindre Discord
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ===== HERO HEADER ===== */}
      <HeroHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* ===== STATS CARDS ===== */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          <StatCard icon={Users} value={fmt(stats.totalPlayers)} label="Total Joueurs" />
          <StatCard icon={Castle} value={fmt(stats.totalKingdoms)} label="Total Royaumes" />
          <StatCard icon={Globe} value={fmt(stats.totalContinents)} label="Total Continents" />
          <StatCard icon={Coins} value={fmt(stats.totalTreasury)} label="Trésor Global" />
        </motion.section>

        <SectionSeparator />

        {/* ===== KINGDOM RANKINGS TABLE ===== */}
        {kingdoms.length > 0 && (
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="py-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <FourPointStar size={14} color="#D4AF3780" />
              <h2
                className="font-display text-xl sm:text-2xl tracking-[0.12em]"
                style={{ color: "#D4AF37" }}
              >
                CLASSEMENT DES ROYAUMES
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF3730] to-transparent" />
            </div>

            <div className="overflow-x-auto rounded-sm border border-[var(--border-primary)] bg-[var(--bg-card)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[var(--border-primary)] hover:bg-transparent">
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] text-center">
                      Rang
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)]">
                      Nom
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] hidden sm:table-cell">
                      Continent
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] hidden md:table-cell">
                      Rang
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] text-right">
                      Trésor
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] text-center hidden sm:table-cell">
                      Population
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] text-right hidden lg:table-cell">
                      Taxe
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kingdoms.map((k) => {
                    const medal =
                      k.rankingPosition === 1
                        ? "🥇"
                        : k.rankingPosition === 2
                          ? "🥈"
                          : k.rankingPosition === 3
                            ? "🥉"
                            : null;
                    return (
                      <TableRow
                        key={k.id}
                        className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-elevated)] transition-colors duration-300"
                      >
                        <TableCell className="py-3 text-center">
                          <span
                            className={`font-display text-sm ${medal ? "text-lg" : "text-[var(--text-tertiary)]"}`}
                          >
                            {medal || `#${k.rankingPosition}`}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="font-body text-sm text-[var(--text-primary)] hover:text-[#D4AF37] transition-colors duration-300">
                            {k.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <span className="font-body text-xs text-[var(--text-tertiary)]">
                            {k.continent}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 hidden md:table-cell">
                          <RankBadge rank={k.rank} type="kingdom" />
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <span className="font-body text-sm" style={{ color: "#D4AF37" }}>
                            {fmt(k.treasury)}{" "}
                            <Coins size={12} className="inline opacity-50" />
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-center hidden sm:table-cell">
                          <span className="font-body text-sm text-[var(--text-secondary)]">
                            {fmt(k.citizenCount)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-right hidden lg:table-cell">
                          <span className="font-body text-sm text-[var(--text-secondary)]">
                            {Math.round(k.taxRate * 100)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </motion.section>
        )}

        <SectionSeparator />

        {/* ===== CONTINENT OVERVIEW ===== */}
        {continents.length > 0 && (
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="py-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <FourPointStar size={14} color="#D4AF3780" />
              <h2
                className="font-display text-xl sm:text-2xl tracking-[0.12em]"
                style={{ color: "#D4AF37" }}
              >
                CONTINENTS
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF3730] to-transparent" />
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {continents.map((c) => (
                <motion.div key={c.id} variants={staggerItem}>
                  <Card
                    className="relative overflow-hidden border-[var(--border-primary)] bg-[var(--bg-card)] hover:border-[var(--border-accent)] transition-all duration-300 group"
                    style={{ boxShadow: "none" }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF3780] to-transparent opacity-50" />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle
                          className="font-display text-sm tracking-[0.08em] text-[var(--text-primary)] group-hover:text-[#D4AF37] transition-colors duration-300"
                          style={{ boxShadow: "none" }}
                        >
                          {c.name}
                        </CardTitle>
                        <RankBadge rank={c.rank} type="continent" />
                      </div>
                      {c.climate && (
                        <p className="font-body text-xs text-[var(--text-tertiary)]">
                          {c.climate}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div>
                          <span className="font-body text-[0.65rem] text-[var(--text-tertiary)] uppercase tracking-wider block mb-0.5">
                            Richesse
                          </span>
                          <span className="font-display text-xs" style={{ color: "#D4AF37" }}>
                            {fmt(c.treasury)}
                          </span>
                        </div>
                        <div>
                          <span className="font-body text-[0.65rem] text-[var(--text-tertiary)] uppercase tracking-wider block mb-0.5">
                            Royaumes
                          </span>
                          <span className="font-display text-xs text-[var(--text-secondary)]">
                            {c.kingdomCount}
                          </span>
                        </div>
                        <div>
                          <span className="font-body text-[0.65rem] text-[var(--text-tertiary)] uppercase tracking-wider block mb-0.5">
                            Citoyens
                          </span>
                          <span className="font-display text-xs text-[var(--text-secondary)]">
                            {fmt(c.totalCitizens)}
                          </span>
                        </div>
                      </div>

                      {/* Top kingdom preview */}
                      {c.kingdoms.length > 0 && (
                        <div className="pt-3 border-t border-[var(--border-primary)]">
                          <span className="font-body text-[0.6rem] text-[var(--text-tertiary)] uppercase tracking-wider">
                            Premier royaume
                          </span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-body text-xs text-[var(--text-secondary)]">
                              {c.kingdoms[0].name}
                            </span>
                            <span className="font-display text-xs" style={{ color: "#D4AF37" }}>
                              {fmt(c.kingdoms[0].treasury)}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        <SectionSeparator />

        {/* ===== LEADERBOARD ===== */}
        {leaderboard.length > 0 && (
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="py-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <FourPointStar size={14} color="#D4AF3780" />
              <h2
                className="font-display text-xl sm:text-2xl tracking-[0.12em]"
                style={{ color: "#D4AF37" }}
              >
                CLASSEMENT DES AVENTURIERS
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF3730] to-transparent" />
            </div>

            <div className="overflow-x-auto rounded-sm border border-[var(--border-primary)] bg-[var(--bg-card)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[var(--border-primary)] hover:bg-transparent">
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] text-center">
                      Rang
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)]">
                      Nom
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] hidden sm:table-cell">
                      Race
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] text-right">
                      Ether
                    </TableHead>
                    <TableHead className="font-display text-[0.65rem] tracking-[0.15em] uppercase text-[var(--text-tertiary)] text-right hidden lg:table-cell">
                      Royaume
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((p) => {
                    const medal =
                      p.rankingPosition === 1
                        ? "🥇"
                        : p.rankingPosition === 2
                          ? "🥈"
                          : p.rankingPosition === 3
                            ? "🥉"
                            : null;
                    const raceColor = getRaceColor(p.race);
                    const initial = p.characterName.charAt(0).toUpperCase();
                    return (
                      <TableRow
                        key={p.id}
                        className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-elevated)] transition-colors duration-300"
                      >
                        <TableCell className="py-3 text-center">
                          <span
                            className={`font-display text-sm ${medal ? "text-lg" : "text-[var(--text-tertiary)]"}`}
                          >
                            {medal || `#${p.rankingPosition}`}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-display font-bold shrink-0"
                              style={{
                                backgroundColor: raceColor + "22",
                                color: raceColor,
                                border: `1.5px solid ${raceColor}55`,
                              }}
                            >
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <span className="font-body text-sm text-[var(--text-primary)] block truncate">
                                {p.characterName}
                              </span>
                              <span className="text-[0.6rem] text-[var(--text-tertiary)]">
                                {p.socialRankName}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <span
                            className="font-body text-xs px-2 py-0.5 rounded-sm"
                            style={{
                              color: raceColor,
                              backgroundColor: raceColor + "15",
                              border: `1px solid ${raceColor}30`,
                            }}
                          >
                            {p.race}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <span className="font-body text-sm" style={{ color: "#D4AF37" }}>
                            {fmt(p.ether)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-right hidden lg:table-cell">
                          <span className="font-body text-xs text-[var(--text-tertiary)]">
                            {p.kingdom}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </motion.section>
        )}

        <SectionSeparator />

        {/* ===== DISCORD INTEGRATION ===== */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="py-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <FourPointStar size={14} color="#D4AF3780" />
            <h2
              className="font-display text-xl sm:text-2xl tracking-[0.12em]"
              style={{ color: "#D4AF37" }}
            >
              INTÉGRATION DISCORD
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF3730] to-transparent" />
          </div>

          {/* CTA Card */}
          <div
            className="relative overflow-hidden rounded-sm border p-8 sm:p-10 mb-10 text-center"
            style={{
              backgroundColor: "rgba(88, 101, 242, 0.08)",
              borderColor: "rgba(88, 101, 242, 0.25)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(88, 101, 242, 0.1) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(88, 101, 242, 0.15)",
                  border: "1px solid rgba(88, 101, 242, 0.3)",
                }}
              >
                <svg width="32" height="24" viewBox="0 0 28 20" fill="none" className="text-[#5865F2]">
                  <path
                    d="M23.6 1.7a23.4 23.4 0 00-5.8-1.8c-.3.5-.5 1.1-.7 1.7a21.8 21.8 0 00-6.2 0A16.3 16.3 0 0010.2-.1 23.4 23.4 0 004.4 1.7C.9 6.8-.6 11.8.2 16.7A23.6 23.6 0 007 19.5c.6-.8 1.1-1.6 1.5-2.5-.8-.3-1.6-.7-2.3-1.2.2-.1.4-.3.5-.4a17 17 0 0014.6 0l.5.4c-.7.5-1.5.9-2.3 1.2.5.9 1 1.7 1.6 2.5a23.6 23.6 0 006.7-2.8c1-5.7-.9-10.6-3.2-15zM9.3 13.8c-1.4 0-2.6-1.3-2.6-2.9s1.1-2.9 2.6-2.9 2.7 1.3 2.6 2.9c0 1.6-1.1 2.9-2.6 2.9zm9.4 0c-1.4 0-2.6-1.3-2.6-2.9s1.1-2.9 2.6-2.9 2.7 1.3 2.6 2.9c0 1.6-1.1 2.9-2.6 2.9z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg sm:text-xl tracking-[0.08em] text-[var(--text-primary)] mb-2">
                Rejoins le serveur Discord
              </h3>
              <p className="font-body text-sm text-[var(--text-tertiary)] mb-6 max-w-md mx-auto">
                Intéragis avec le bot Ascension directement sur Discord. Crée ton personnage,
                explore les royaumes, et forge ton destin parmi les aventuriers.
              </p>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-display text-xs tracking-[0.15em] uppercase px-8 py-3 rounded-sm text-white transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: "#5865F2",
                  boxShadow: "0 0 20px rgba(88, 101, 242, 0.3)",
                }}
              >
                Rejoindre le Serveur
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
          </div>

          {/* Commands Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BOT_COMMANDS.map((command) => (
              <motion.div
                key={command.cmd}
                variants={staggerItem}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-start gap-3 rounded-sm border border-[var(--border-primary)] bg-[var(--bg-card)] p-4 hover:border-[var(--border-accent)] transition-all duration-300 group"
              >
                <span className="font-mono text-sm text-[#5865F2] shrink-0 group-hover:text-[#D4AF37] transition-colors duration-300">
                  {command.cmd}
                </span>
                <span className="font-body text-xs text-[var(--text-tertiary)] leading-relaxed">
                  {command.desc}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="h-8" />
      </div>
    </div>
  );
}

// ==========================================
// HERO HEADER
// ==========================================

function HeroHeader() {
  return (
    <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(212, 175, 55, 0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.08em] mb-4"
          style={{
            color: "#D4AF37",
            textShadow:
              "0 0 40px rgba(212, 175, 55, 0.3), 0 0 80px rgba(212, 175, 55, 0.1)",
          }}
        >
          ✦ Écosystème Ascension ✦
        </motion.h1>

        {/* Animated glow ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0.95, 1.05, 1.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] pointer-events-none rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-body text-base sm:text-lg text-[var(--text-secondary)] tracking-wide"
        >
          Statistiques en temps réel — Synchronisé avec le bot Discord
        </motion.p>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="mt-8 mx-auto max-w-xs h-px origin-center"
          style={{
            background: "linear-gradient(to right, transparent, #D4AF3780, transparent)",
          }}
        />
      </div>
    </section>
  );
}