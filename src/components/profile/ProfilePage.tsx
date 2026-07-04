"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import SignInDialog from "@/components/auth/SignInDialog";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";
import { useNavigation } from "@/store/navigationStore";
import { RACE_DATA, type RaceData } from "@/data/races";
import { RANK_COLORS } from "@/data/ranks";
import { Pencil, Check, X, ChevronDown, Swords, Gem, Trophy, Coins, Heart, Droplets, Sparkles, Shield, User } from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface ProfileData {
  id: string;
  userId: string;
  characterName: string | null;
  characterTitle: string | null;
  race: string | null;
  rank: string;
  description: string | null;
  backstory: string | null;
  bannerUrl: string | null;
  avatarUrl: string | null;
  bannerColor: string;
  ether: number;
  user: {
    name: string | null;
    username: string | null;
    image: string | null;
    discordId: string | null;
  };
  inventory: InventoryItem[];
}

interface InventoryItem {
  item: {
    name: string;
    rarity: string;
    type: string;
    imageUrl: string | null;
  };
}

interface BotPlayerData {
  characterName: string;
  race: string;
  socialRank: number;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  ether: number;
  kingdom: {
    id: string;
    name: string;
    continent: { name: string } | null;
  } | null;
  guild: { id: string; name: string } | null;
  registeredAt: string;
}

interface ProfileResponse {
  profile: ProfileData;
  botPlayer: BotPlayerData | null;
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const SOCIAL_RANKS: Record<number, string> = {
  1: "Citoyen",
  2: "Chevalier",
  3: "Baron",
  4: "Vicomte",
  5: "Comte",
  6: "Duc",
  7: "Roi / Reine",
};

const RARITY_COLORS: Record<string, string> = {
  Commun: "#9CA3AF",
  Rare: "#3B82F6",
  Épique: "#A855F7",
  Légendaire: "#F59E0B",
  Mythique: "#EF4444",
};

const RANK_LABELS: Record<string, string> = {
  F: "Novice",
  E: "Apprenti",
  D: "Initié",
  C: "Compétent",
  B: "Expert",
  A: "Élite",
  S: "Maître",
  "S+": "Souverain",
  EX: "Transcendant",
};

/* ═══════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function RankBadge({ rank }: { rank: string }) {
  const color = RANK_COLORS[rank] || "#78716C";
  const label = RANK_LABELS[rank] || "Inconnu";

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-extrabold"
        style={{
          background: `${color}18`,
          border: `1.5px solid ${color}55`,
          color: color,
          textShadow: `0 0 8px ${color}66`,
        }}
      >
        {rank}
      </div>
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: `${color}BB` }}
      >
        {label}
      </span>
    </div>
  );
}

function StatBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
          boxShadow: `0 0 6px ${color}55`,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { navigate } = useNavigation();
  const [signInOpen, setSignInOpen] = useState(false);
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [backstoryOpen, setBackstoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editRace, setEditRace] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editBackstory, setEditBackstory] = useState("");
  const [editBannerColor, setEditBannerColor] = useState("#1a1a2e");

  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Fetch profile data ── */
  const fetchProfile = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (!res.ok) {
        if (res.status === 401) return;
        throw new Error("Erreur serveur");
      }
      const json: ProfileResponse = await res.json();
      setData(json);
      setEditName(json.profile.characterName || "");
      setEditTitle(json.profile.characterTitle || "");
      setEditRace(json.profile.race || "");
      setEditDesc(json.profile.description || "");
      setEditBackstory(json.profile.backstory || "");
      setEditBannerColor(json.profile.bannerColor || "#1a1a2e");
    } catch {
      toast.error("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchProfile]);

  /* ── GSAP entrance animations ── */
  useEffect(() => {
    if (!data || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = containerRef.current!.querySelectorAll("[data-gsap-card]");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      const statNums = containerRef.current!.querySelectorAll("[data-count]");
      statNums.forEach((el) => {
        const target = parseFloat((el as HTMLElement).dataset.count || "0");
        gsap.fromTo(
          el,
          { innerText: "0" },
          {
            innerText: target,
            duration: 1.2,
            delay: 0.4,
            ease: "power2.out",
            snap: { innerText: 1 },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [data]);

  /* ── Save profile ── */
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: editName || null,
          characterTitle: editTitle || null,
          race: editRace || null,
          description: editDesc || null,
          backstory: editBackstory || null,
          bannerColor: editBannerColor,
        }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData((prev) => (prev ? { ...prev, profile: json.profile } : prev));
      setEditing(false);
      toast.success("Profil mis à jour");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived values ── */
  const profile = data?.profile;
  const bot = data?.botPlayer;
  const raceData: RaceData | undefined = profile?.race
    ? RACE_DATA.find((r) => r.id === profile.race || r.name === profile.race)
    : undefined;

  const bannerBaseColor = profile?.bannerColor || raceData?.colors?.primary || "#1a1a2e";

  // BotPlayer.ether is the authoritative source (synced with Profile.ether)
  const totalEther = bot?.ether ?? profile?.ether ?? 0;
  const level = bot?.level || 1;
  const socialRank = bot?.socialRank || 0;
  const socialLabel = SOCIAL_RANKS[socialRank] || "—";
  const health = bot?.health || 0;
  const maxHealth = bot?.maxHealth || 100;
  const mana = bot?.mana || 0;
  const maxMana = bot?.maxMana || 100;
  const xp = bot?.experience || 0;

  /* ═══════════════════════════════════════════════════════════════
     LOADING STATE
     ═══════════════════════════════════════════════════════════════ */
  if (status === "loading" || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full"
          style={{ border: `2px solid rgba(0,212,255,0.2)`, borderTopColor: "#00D4FF" }}
        />
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     NOT AUTHENTICATED — LOGIN GATE
     ═══════════════════════════════════════════════════════════════ */
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08]">
          <Shield className="h-8 w-8 text-[#00D4FF]" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-[#E5E7EB]">
          Connecte-toi pour voir ton profil
        </h2>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-[#9CA3AF]">
          Rejoins l&apos;univers d&apos;Ascension et consulte tes statistiques, ton rang et ton arbre de compétences.
        </p>
        <button
          onClick={() => setSignInOpen(true)}
          className="rounded-xl bg-[#00D4FF] px-8 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 hover:shadow-[0_0_24px_rgba(0,212,255,0.3)]"
        >
          Se connecter
        </button>
        <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
      </div>
    );
  }

  // ── Role validation notice (non-blocking) ──
  const hasValidatedRole = (session.user as Record<string, unknown>).hasValidatedRole as boolean | undefined;

  if (!data || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08]">
          <User className="h-8 w-8 text-[#00D4FF]" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-[#E5E7EB]">
          Profil introuvable
        </h2>
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#9CA3AF]">
          Impossible de charger tes données. Ton profil n&apos;existe pas encore ou une erreur est survenue.
        </p>
        <button
          onClick={() => fetchProfile()}
          className="rounded-xl bg-[#00D4FF] px-8 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 hover:shadow-[0_0_24px_rgba(0,212,255,0.3)] cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     INLINE EDIT INPUTS (shared style)
     ═══════════════════════════════════════════════════════════════ */

  const inputCls =
    "w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-sm text-[#E5E7EB] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#00D4FF]/40";

  const labelCls =
    "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]";

  /* ═══════════════════════════════════════════════════════════════
     MAIN PROFILE VIEW
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div
      ref={containerRef}
      className="mx-auto flex max-w-2xl flex-col gap-4 pb-20"
    >
      {/* ── 1. PROFILE HEADER CARD ── */}
      <div
        data-gsap-card
        className="relative overflow-hidden rounded-xl border border-white/[0.08]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {/* Banner gradient */}
        <div
          className="relative h-36 w-full sm:h-44"
          style={{
            background: profile.bannerUrl
              ? `url(${profile.bannerUrl}) center/cover no-repeat`
              : `linear-gradient(160deg, ${bannerBaseColor} 0%, rgba(10,10,15,0.9) 70%, ${bannerBaseColor}66 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(255,255,255,0.04)]" />
        </div>

        {/* Edit button */}
        <button
          onClick={() => {
            if (editing) {
              setEditing(false);
            } else {
              setEditName(profile.characterName || "");
              setEditTitle(profile.characterTitle || "");
              setEditRace(profile.race || "");
              setEditDesc(profile.description || "");
              setEditBackstory(profile.backstory || "");
              setEditBannerColor(profile.bannerColor || "#1a1a2e");
              setEditing(true);
            }
          }}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] backdrop-blur-sm transition-colors hover:text-[#00D4FF] border border-white/[0.08] z-10"
          title={editing ? "Annuler" : "Éditer le profil"}
        >
          {editing ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
          {editing ? "Annuler" : "Éditer"}
        </button>

        {/* Avatar + info area */}
        <div className="relative px-4 pb-5 pt-0 sm:px-6">
          {/* Avatar overlapping banner */}
          <div className="-mt-12 mb-3 flex items-end gap-4">
            <div
              className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#00D4FF] sm:h-24 sm:w-24"
              style={{
                background: `linear-gradient(135deg, ${bannerBaseColor}44 0%, rgba(26,26,36,1) 100%)`,
                boxShadow: `0 0 20px rgba(0,212,255,0.2)`,
              }}
            >
              {profile.avatarUrl || profile.user.image ? (
                <img
                  src={profile.avatarUrl || profile.user.image || undefined}
                  alt={profile.characterName || "Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl opacity-40">
                  ⚔️
                </div>
              )}
            </div>
            <div className="mb-1 min-w-0 flex-1">
              {/* Name */}
              {editing ? (
                <input
                  className={inputCls + " mb-1.5 text-lg font-bold"}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nom du personnage"
                />
              ) : (
                <h1 className="truncate text-xl font-extrabold leading-tight text-white sm:text-2xl">
                  {profile.characterName || profile.user.name || "Inconnu"}
                </h1>
              )}
              {/* Title + Race */}
              <div className="flex flex-wrap items-center gap-2">
                {editing ? (
                  <input
                    className={inputCls + " !py-1 text-xs"}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Titre"
                  />
                ) : (
                  <span className="text-xs italic text-[#9CA3AF]">
                    {profile.characterTitle || "Aventurier"}
                  </span>
                )}
                {raceData && !editing && (
                  <span className="text-xs text-[#6B7280] flex items-center gap-1">
                    <span className="text-base leading-none">{raceData.icon}</span> {raceData.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rank badge */}
          <div className="mb-0 mt-1">
            <RankBadge rank={profile.rank} />
          </div>

          {/* Edit form — expanded inline below header */}
          {editing && (
            <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
              {/* Race select */}
              <div>
                <label className={labelCls}>Race</label>
                <select
                  className={inputCls + " appearance-none cursor-pointer"}
                  value={editRace}
                  onChange={(e) => setEditRace(e.target.value)}
                >
                  <option value="">— Aucune race —</option>
                  {RACE_DATA.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: "#1A1A24", color: "#E5E7EB" }}>
                      {r.name} ({r.nameJp})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  className={inputCls + " min-h-[70px] resize-y"}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Une courte description de ton personnage..."
                />
              </div>
              <div>
                <label className={labelCls}>Histoire personnelle</label>
                <textarea
                  className={inputCls + " min-h-[90px] resize-y"}
                  value={editBackstory}
                  onChange={(e) => setEditBackstory(e.target.value)}
                  placeholder="L'histoire de ton personnage..."
                />
              </div>
              <div>
                <label className={labelCls}>Couleur de la bannière</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editBannerColor}
                    onChange={(e) => setEditBannerColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-white/[0.1] bg-transparent p-0.5"
                  />
                  <input
                    className={inputCls + " flex-1"}
                    value={editBannerColor}
                    onChange={(e) => setEditBannerColor(e.target.value)}
                    placeholder="#1a1a2e"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#00D4FF] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.25)] disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. STATS GRID (if bot player data) ── */}
      {bot && (
        <div
          data-gsap-card
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {/* Level */}
          <div
            className="rounded-xl border border-white/[0.08] p-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Swords className="h-4 w-4 text-[#6B7280]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">Niveau</span>
            </div>
            <div data-count={level} className="text-2xl font-extrabold leading-none text-white">
              {level}
            </div>
          </div>

          {/* HP */}
          <div
            className="rounded-xl border border-white/[0.08] p-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#EF4444]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">PV</span>
            </div>
            <div className="text-2xl font-extrabold leading-none text-white">
              <span data-count={health}>{health.toLocaleString("fr-FR")}</span>
            </div>
            <div className="mt-1 text-[10px] text-[#6B7280]">/ {maxHealth.toLocaleString("fr-FR")}</div>
            <StatBar value={health} max={maxHealth} color="#EF4444" />
          </div>

          {/* Mana */}
          <div
            className="rounded-xl border border-white/[0.08] p-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-[#60A5FA]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">Mana</span>
            </div>
            <div className="text-2xl font-extrabold leading-none text-white">
              <span data-count={mana}>{mana.toLocaleString("fr-FR")}</span>
            </div>
            <div className="mt-1 text-[10px] text-[#6B7280]">/ {maxMana.toLocaleString("fr-FR")}</div>
            <StatBar value={mana} max={maxMana} color="#60A5FA" />
          </div>

          {/* Gold */}
          <div
            className="rounded-xl border border-white/[0.08] p-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Coins className="h-4 w-4 text-[#F59E0B]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">Or</span>
            </div>
            <div data-count={bot.gold} className="text-2xl font-extrabold leading-none text-white">
              {bot.gold.toLocaleString("fr-FR")}
            </div>
          </div>

          {/* Ether */}
          <div
            className="rounded-xl border border-white/[0.08] p-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Gem className="h-4 w-4 text-[#00D4FF]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">Éther</span>
            </div>
            <div data-count={totalEther} className="text-2xl font-extrabold leading-none text-[#00D4FF]">
              {totalEther.toLocaleString("fr-FR")}
            </div>
          </div>

          {/* Experience */}
          <div
            className="rounded-xl border border-white/[0.08] p-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#00D4FF]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">Expérience</span>
            </div>
            <div className="text-2xl font-extrabold leading-none text-white">
              <span data-count={xp}>{xp.toLocaleString("fr-FR")}</span>
            </div>
            <StatBar value={xp % 1000} max={1000} color="#00D4FF" />
          </div>
        </div>
      )}

      {/* ── 3. CHARACTER INFO ── */}
      {/* Social rank + affiliations (only if bot data) */}
      {bot && (bot.kingdom || bot.guild || socialRank > 0) && (
        <div
          data-gsap-card
          className="rounded-xl border border-white/[0.08] p-4 sm:p-5"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#6B7280]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">
              Affiliations
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {socialRank > 0 && (
              <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-2.5">
                <span className="text-base">👑</span>
                <div>
                  <div className="text-sm font-semibold text-[#E5E7EB]">{socialLabel}</div>
                  <div className="text-[11px] text-[#6B7280]">Rang social {socialRank}/7</div>
                </div>
              </div>
            )}
            {bot.kingdom && (
              <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-2.5">
                <span className="text-base">🏰</span>
                <div>
                  <div className="text-sm font-semibold text-[#E5E7EB]">{bot.kingdom.name}</div>
                  {bot.kingdom.continent && (
                    <div className="text-[11px] text-[#6B7280]">{bot.kingdom.continent.name}</div>
                  )}
                </div>
              </div>
            )}
            {bot.guild && (
              <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-2.5">
                <span className="text-base">⚜️</span>
                <div>
                  <div className="text-sm font-semibold text-[#E5E7EB]">{bot.guild.name}</div>
                  <div className="text-[11px] text-[#6B7280]">Guilde</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Race card */}
      {raceData && !editing && (
        <div
          data-gsap-card
          className="relative overflow-hidden rounded-xl border border-white/[0.08] p-4 sm:p-5"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div
            className="absolute left-0 right-0 top-0 h-0.5"
            style={{
              background: `linear-gradient(90deg, transparent, ${raceData.colors.primary}, transparent)`,
            }}
          />
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{
                background: raceData.colors.bg,
                border: `1px solid ${raceData.colors.primary}33`,
              }}
            >
              {raceData.icon}
            </div>
            <div>
              <div className="text-base font-bold" style={{ color: raceData.colors.text }}>
                {raceData.name}
              </div>
              <div className="text-[11px] text-[#6B7280]">
                {raceData.nameJp} — {raceData.subtitle}
              </div>
            </div>
          </div>
          <p className="mb-4 line-clamp-3 text-[13px] leading-relaxed text-[#9CA3AF]">
            {raceData.description}
          </p>
          {raceData.techniques.length > 0 && (
            <>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">
                Techniques disponibles
              </div>
              <div className="mb-4 flex flex-col gap-1.5">
                {raceData.techniques.slice(0, 3).map((tech) => (
                  <div
                    key={tech.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-extrabold"
                        style={{
                          background: `${RANK_COLORS[tech.rank] || "#78716C"}18`,
                          border: `1px solid ${RANK_COLORS[tech.rank] || "#78716C"}44`,
                          color: RANK_COLORS[tech.rank] || "#78716C",
                        }}
                      >
                        {tech.rank}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-[#E5E7EB]">{tech.nameFr}</div>
                        <div className="text-[10px] text-[#6B7280]">{tech.nameJp}</div>
                      </div>
                    </div>
                    <span
                      className="rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                      style={{
                        color: `${RANK_COLORS[tech.rank] || "#78716C"}AA`,
                        background: `${RANK_COLORS[tech.rank] || "#78716C"}11`,
                        border: `1px solid ${RANK_COLORS[tech.rank] || "#78716C"}22`,
                      }}
                    >
                      {tech.classification}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          <button
            onClick={() => navigate("skilltree")}
            className="w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all hover:brightness-110"
            style={{
              background: `linear-gradient(135deg, ${raceData.colors.primary}15 0%, ${raceData.colors.primary}08 100%)`,
              border: `1.5px solid ${raceData.colors.primary}55`,
              color: raceData.colors.text,
              boxShadow: `0 0 20px ${raceData.colors.glow}`,
            }}
          >
            Voir mon Skill Tree
          </button>
        </div>
      )}

      {/* Description */}
      {profile.description && !profile.backstory && !editing && (
        <div
          data-gsap-card
          className="rounded-xl border border-white/[0.08] p-4 sm:p-5"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <p className="text-sm leading-relaxed italic text-[#9CA3AF]">
            {profile.description}
          </p>
        </div>
      )}

      {/* Backstory (collapsible) */}
      {profile.backstory && !editing && (
        <div
          data-gsap-card
          className="overflow-hidden rounded-xl border border-white/[0.08]"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <button
            onClick={() => setBackstoryOpen(!backstoryOpen)}
            className="flex w-full items-center justify-between px-4 py-3.5 sm:px-5 text-left transition-colors hover:bg-white/[0.02]"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9CA3AF]">
              📜 Histoire personnelle
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#6B7280] transition-transform duration-300 ${backstoryOpen ? "rotate-180" : ""}`}
            />
          </button>
          {backstoryOpen && (
            <div className="border-t border-white/[0.06] px-4 py-4 sm:px-5">
              <div className="rounded-lg border-l-2 border-[#00D4FF]/30 bg-[#00D4FF]/[0.03] p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed italic text-[#9CA3AF]">
                  {profile.backstory}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. EQUIPPED INVENTORY ── */}
      <div
        data-gsap-card
        className="rounded-xl border border-white/[0.08] p-4 sm:p-5"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎒</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">
              Équipement
            </span>
          </div>
          {profile.inventory.length > 0 && (
            <span className="text-[10px] text-[#6B7280]">
              {profile.inventory.length} objet{profile.inventory.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {profile.inventory.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {profile.inventory.map((inv, i) => {
              const rarityColor = RARITY_COLORS[inv.item.rarity] || "#9CA3AF";
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-xl border p-3 text-center transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: `${rarityColor}30`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${rarityColor}55`;
                    e.currentTarget.style.boxShadow = `0 0 16px ${rarityColor}18`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${rarityColor}30`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Rarity glow top */}
                  <div
                    className="absolute left-0 right-0 top-0 h-0.5"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)`,
                    }}
                  />
                  {/* Item image */}
                  <div
                    className="mx-auto mb-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border sm:h-14 sm:w-14"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: `${rarityColor}22`,
                    }}
                  >
                    {inv.item.imageUrl ? (
                      <img
                        src={inv.item.imageUrl}
                        alt={inv.item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl opacity-50">🗡️</span>
                    )}
                  </div>
                  {/* Name */}
                  <div className="mb-1 truncate text-[11px] font-semibold text-[#E5E7EB] sm:text-xs">
                    {inv.item.name}
                  </div>
                  {/* Rarity badge */}
                  <span
                    className="inline-block rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                    style={{
                      color: rarityColor,
                      background: `${rarityColor}15`,
                      border: `1px solid ${rarityColor}25`,
                    }}
                  >
                    {inv.item.rarity}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mb-2 text-3xl opacity-40">🎒</div>
            <div className="mb-1 text-sm font-semibold text-[#6B7280]">Aucun équipement</div>
            <div className="text-xs text-[#6B7280]/60">
              Ton inventaire est vide pour le moment.
            </div>
          </div>
        )}
      </div>

      {/* Registration date */}
      {bot?.registeredAt && (
        <div className="pb-4 text-center text-[11px] text-[#6B7280]/50">
          Membre depuis le{" "}
          {new Date(bot.registeredAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      )}
    </div>
  );
}