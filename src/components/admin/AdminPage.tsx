"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mail,
  Image,
  Palette,
  Send,
  Save,
  RotateCcw,
  ShieldX,
  Check,
  Users,
  ImageIcon,
  Eye,
  FileText,
  Clock,
  Plus,
  Bot,
  X,
  ChevronDown,
  ChevronUp,
  Settings2,
  ArrowRight,
} from "lucide-react";
import { useNavigation } from "@/store/navigationStore";

/* ============================================================
   Constants
   ============================================================ */

const ADMIN_DISCORD_ID = "722146261381415043";
const GOLD = "#C9A84C";

const BANNER_PAGES = [
  { key: "accueil", label: "Accueil" },
  { key: "races", label: "Races" },
  { key: "arts", label: "Arts" },
  { key: "artefacts", label: "Artéfacts" },
  { key: "cosmologie", label: "Cosmologie" },
  { key: "technologie", label: "Technologie" },
  { key: "royaumes", label: "Royaumes" },
  { key: "factions", label: "Factions" },
  { key: "regions", label: "Régions" },
  { key: "nouvelles", label: "Nouvelles" },
] as const;

const DEFAULT_THEME = {
  accent: "#C9A84C",
  bgPrimary: "#0A0A0F",
  bgSecondary: "#111118",
  textPrimary: "#E8E4E0",
  textSecondary: "#B0AAA0",
  glowGold: "rgba(201, 168, 76, 0.4)",
};

const THEME_FIELDS = [
  { key: "accent", label: "Couleur d'accent", type: "color" as const },
  { key: "bgPrimary", label: "Couleur de fond principale", type: "color" as const },
  { key: "bgSecondary", label: "Couleur de fond secondaire", type: "color" as const },
  { key: "textPrimary", label: "Couleur de texte principale", type: "color" as const },
  { key: "textSecondary", label: "Couleur de texte secondaire", type: "color" as const },
  { key: "glowGold", label: "Couleur de lueur dorée (glow)", type: "color" as const },
] as const;

/* ============================================================
   Types
   ============================================================ */

interface BroadcastItem {
  id?: string;
  title: string;
  content: string;
  createdAt: string;
}

interface ConfigData {
  [key: string]: string;
}

interface SheetStats {
  [key: string]: string | number;
}

interface CharacterSheet {
  id: string;
  pseudo: string;
  discordName: string;
  discordId: string;
  race: string;
  metier: string;
  age: string;
  status: "pending" | "accepted" | "rejected" | "revision";
  histoire: string;
  description: string;
  stats: SheetStats;
  liens: string[];
  captures: string[];
  rejectionReason?: string;
  createdAt: string;
}

type SheetFilter = "all" | "pending" | "accepted" | "rejected" | "revision";

interface TupperCharacter {
  id: string;
  name: string;
  webhookDisplayName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  embedColor?: string;
  title?: string;
  description?: string;
  personality?: string;
  systemPrompt?: string;
  aiModel?: string;
  temperature?: number;
  maxResponseLength?: number;
  adminOnly: boolean;
  isNpc: boolean;
  npcContext?: string;
  active: boolean;
}

/* ============================================================
   Shared styles
   ============================================================ */

const glassCard =
  "bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl";

const goldInputBorder =
  "border-white/20 focus:border-[#C9A84C] focus:ring-[#C9A84C]/30 focus:ring-2";

const goldButton =
  "bg-[#C9A84C] hover:bg-[#d4b35a] text-black font-bold tracking-wider text-xs uppercase transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]";

const outlineGoldButton =
  "border border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C]/10 font-bold tracking-wider text-xs uppercase transition-all duration-300";

/* ============================================================
   Sub-components
   ============================================================ */

function AccessDenied() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className={`${glassCard} p-10 sm:p-14 max-w-md w-full text-center`}>
        <ShieldX
          className="w-12 h-12 mx-auto mb-6"
          style={{ color: "#C9A84C" }}
        />
        <h1
          className="text-xl sm:text-2xl tracking-[0.15em] uppercase mb-3"
          style={{
            fontFamily: "var(--font-display)",
            color: "#C9A84C",
            textShadow: "0 0 20px rgba(201,168,76,0.4)",
          }}
        >
          ACCÈS REFUSÉ
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: "var(--font-body)", color: "#B0AAA0" }}
        >
          Vous n&apos;avez pas les permissions nécessaires pour accéder au
          panneau d&apos;administration.
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-6 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      {/* Content card */}
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

/* ============================================================
   Tab 1 — Messagerie
   ============================================================ */

function MessagingTab() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [newsRes, statsRes] = await Promise.all([
          fetch("/api/admin/news"),
          fetch("/api/admin/stats"),
        ]);
        if (newsRes.ok) {
          const data = await newsRes.json();
          setBroadcasts(Array.isArray(data) ? data : data.broadcasts || []);
        }
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setMemberCount(stats.memberCount ?? stats.count ?? null);
        }
      } catch {
        // Silently fail — API routes may not exist yet
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSend = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Veuillez remplir le titre et le contenu.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de l'envoi");
      }
      const data = await res.json();
      toast.success(
        `Message envoyé à ${data.recipientCount ?? memberCount ?? "tous"} membre(s) !`
      );
      setTitle("");
      setContent("");
      // Refresh list
      const newsRes = await fetch("/api/admin/news");
      if (newsRes.ok) {
        const d = await newsRes.json();
        setBroadcasts(Array.isArray(d) ? d : d.broadcasts || []);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'envoi"
      );
    } finally {
      setSending(false);
    }
  }, [title, content, memberCount]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compose card */}
      <Card className={`${glassCard} !p-0 overflow-hidden`}>
        <CardHeader
          className="!pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              <Send className="w-4 h-4" style={{ color: GOLD }} />
            </div>
            <div>
              <CardTitle
                className="text-sm tracking-[0.12em] uppercase"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#E8E4E0",
                }}
              >
                Nouvelle diffusion
              </CardTitle>
              <p className="text-xs mt-0.5" style={{ color: "#706B63" }}>
                Envoyer un message à tous les membres
                {memberCount !== null && (
                  <span
                    className="ml-1 inline-flex items-center gap-1"
                    style={{ color: "#C9A84C" }}
                  >
                    <Users className="w-3 h-3" />
                    {memberCount} membre(s)
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="!pt-5 !px-5 !pb-5 space-y-4">
          <div className="space-y-2">
            <Label
              className="text-xs uppercase tracking-wider"
              style={{ color: "#B0AAA0", fontFamily: "var(--font-display)" }}
            >
              Titre
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du message..."
              className={`${goldInputBorder} bg-white/5 !h-11 text-sm`}
              style={{ color: "#E8E4E0" }}
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-xs uppercase tracking-wider"
              style={{ color: "#B0AAA0", fontFamily: "var(--font-display)" }}
            >
              Contenu
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Rédigez votre message..."
              rows={5}
              className={`${goldInputBorder} bg-white/5 text-sm resize-none`}
              style={{ color: "#E8E4E0" }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={sending}
              className={`${goldButton} !h-10 !px-8`}
            >
              {sending ? (
                <span className="animate-pulse">Envoi en cours...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer à tous
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent broadcasts */}
      <Card className={`${glassCard} !p-0 overflow-hidden`}>
        <CardHeader
          className="!pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-sm tracking-[0.12em] uppercase"
              style={{
                fontFamily: "var(--font-display)",
                color: "#E8E4E0",
              }}
            >
              Diffusions récentes
            </CardTitle>
            <Badge
              className="text-[0.6rem]"
              style={{
                background: "rgba(201,168,76,0.15)",
                color: GOLD,
                border: "1px solid rgba(201,168,76,0.25)",
              }}
            >
              {broadcasts.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="!p-0">
          {broadcasts.length === 0 ? (
            <div className="py-10 text-center">
              <Mail
                className="w-8 h-8 mx-auto mb-3 opacity-30"
                style={{ color: "#706B63" }}
              />
              <p className="text-xs" style={{ color: "#706B63" }}>
                Aucune diffusion envoyée
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="divide-y divide-white/5">
                {broadcasts.map((item, idx) => (
                  <div
                    key={item.id ?? idx}
                    className="px-5 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4
                          className="text-sm font-medium truncate"
                          style={{ color: "#E8E4E0" }}
                        >
                          {item.title}
                        </h4>
                        <p
                          className="text-xs mt-1 line-clamp-2"
                          style={{ color: "#706B63" }}
                        >
                          {item.content}
                        </p>
                      </div>
                      <span
                        className="text-[0.6rem] whitespace-nowrap mt-0.5"
                        style={{ color: "#706B63" }}
                      >
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
   Tab 2 — Bannières
   ============================================================ */

interface BannerEntry {
  url: string;
  color: string;
  mode: "url" | "color";
}

function BannersTab() {
  const [banners, setBanners] = useState<Record<string, BannerEntry>>(() => {
    const initial: Record<string, BannerEntry> = {};
    BANNER_PAGES.forEach((p) => {
      initial[p.key] = { url: "", color: "#0A0A0F", mode: "url" };
    });
    return initial;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | "all" | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const data: ConfigData = await res.json();
          setBanners((prev) => {
            const next = { ...prev };
            BANNER_PAGES.forEach((p) => {
              const urlVal = data[`banner_${p.key}_url`];
              const colorVal = data[`banner_${p.key}_color`];
              if (urlVal) {
                next[p.key] = { url: urlVal, color: colorVal || "#0A0A0F", mode: "url" };
              } else if (colorVal) {
                next[p.key] = { url: "", color: colorVal, mode: "color" };
              }
            });
            return next;
          });
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const updateBanner = (key: string, field: "url" | "color", value: string) => {
    setBanners((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const toggleMode = (key: string) => {
    setBanners((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        mode: prev[key].mode === "url" ? "color" : "url",
      },
    }));
  };

  const saveSingle = async (key: string) => {
    const entry = banners[key];
    setSaving(key);
    try {
      const urlKey = `banner_${key}_url`;
      const colorKey = `banner_${key}_color`;
      const payload = entry.mode === "url"
        ? { key: urlKey, value: entry.url }
        : { key: colorKey, value: entry.color };

      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur de sauvegarde");
      toast.success(`Bannière "${BANNER_PAGES.find((p) => p.key === key)?.label}" sauvegardée`);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(null);
    }
  };

  const saveAll = async () => {
    setSaving("all");
    try {
      const keys = BANNER_PAGES.map((p) => {
        const entry = banners[p.key];
        return entry.mode === "url"
          ? { key: `banner_${p.key}_url`, value: entry.url }
          : { key: `banner_${p.key}_color`, value: entry.color };
      });
      await Promise.all(
        keys.map((k) =>
          fetch("/api/admin/config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(k),
          })
        )
      );
      toast.success("Toutes les bannières ont été sauvegardées");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#706B63", fontFamily: "var(--font-body)" }}>
          Configurez les bannières de chaque page du wiki
        </p>
        <Button
          onClick={saveAll}
          disabled={saving === "all"}
          className={`${goldButton} !h-9 !px-5`}
        >
          {saving === "all" ? (
            <span className="animate-pulse">Sauvegarde...</span>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Tout sauvegarder
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {BANNER_PAGES.map((page) => {
          const entry = banners[page.key];
          const isSaving = saving === page.key;

          return (
            <Card
              key={page.key}
              className={`${glassCard} !p-0 overflow-hidden`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Preview */}
                <div
                  className="w-full sm:w-40 h-24 sm:h-auto flex-shrink-0 relative overflow-hidden"
                  style={{
                    background: entry.mode === "color"
                      ? entry.color
                      : entry.url
                        ? `url(${entry.url}) center/cover no-repeat`
                        : "linear-gradient(135deg, #1A1A24 0%, #0A0A0F 100%)",
                  }}
                >
                  {!entry.url && entry.mode === "url" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon
                        className="w-6 h-6 opacity-20"
                        style={{ color: "#B0AAA0" }}
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span
                    className="absolute bottom-2 left-3 text-[0.6rem] font-medium tracking-wider uppercase"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {page.label}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex-1 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4
                      className="text-xs font-medium tracking-wider uppercase"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "#E8E4E0",
                      }}
                    >
                      {page.label}
                    </h4>
                    <button
                      onClick={() => toggleMode(page.key)}
                      className="text-[0.6rem] px-2 py-1 rounded transition-colors"
                      style={{
                        color: "#C9A84C",
                        background: "rgba(201,168,76,0.1)",
                        border: "1px solid rgba(201,168,76,0.2)",
                      }}
                    >
                      {entry.mode === "url" ? "← Couleur" : "← URL"}
                    </button>
                  </div>

                  {entry.mode === "url" ? (
                    <Input
                      value={entry.url}
                      onChange={(e) =>
                        updateBanner(page.key, "url", e.target.value)
                      }
                      placeholder="https://example.com/banner.webp"
                      className={`${goldInputBorder} bg-white/5 !h-9 text-xs`}
                      style={{ color: "#E8E4E0" }}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={entry.color}
                        onChange={(e) =>
                          updateBanner(page.key, "color", e.target.value)
                        }
                        className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <Input
                        value={entry.color}
                        onChange={(e) =>
                          updateBanner(page.key, "color", e.target.value)
                        }
                        placeholder="#0A0A0F"
                        className={`${goldInputBorder} bg-white/5 !h-9 text-xs flex-1`}
                        style={{ color: "#E8E4E0" }}
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => saveSingle(page.key)}
                    disabled={isSaving}
                    className={`${outlineGoldButton} !h-8 !px-4 text-[0.6rem]`}
                  >
                    {isSaving ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Tab 3 — Esthétique
   ============================================================ */

function ThemeTab() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const data: ConfigData = await res.json();
          setTheme((prev) => ({
            accent: data.theme_accent ?? prev.accent,
            bgPrimary: data.theme_bgPrimary ?? prev.bgPrimary,
            bgSecondary: data.theme_bgSecondary ?? prev.bgSecondary,
            textPrimary: data.theme_textPrimary ?? prev.textPrimary,
            textSecondary: data.theme_textSecondary ?? prev.textSecondary,
            glowGold: data.theme_glowGold ?? prev.glowGold,
          }));
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const updateField = (key: keyof typeof DEFAULT_THEME, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const entries = Object.entries(theme).map(([k, v]) => ({
        key: `theme_${k}`,
        value: v,
      }));
      await Promise.all(
        entries.map((e) =>
          fetch("/api/admin/config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(e),
          })
        )
      );
      toast.success("Thème appliqué avec succès");
    } catch {
      toast.error("Erreur lors de l'application du thème");
    } finally {
      setApplying(false);
    }
  };

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
    toast.info("Thème réinitialisé aux valeurs par défaut");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Color inputs */}
      <div className="lg:col-span-2 space-y-6">
        <Card className={`${glassCard} !p-0 overflow-hidden`}>
          <CardHeader
            className="!pb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                <Palette className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <CardTitle
                className="text-sm tracking-[0.12em] uppercase"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#E8E4E0",
                }}
              >
                Couleurs du thème
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="!px-5 !py-5 space-y-5">
            {THEME_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center gap-4">
                <input
                  type="color"
                  value={theme[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Label
                    className="text-xs uppercase tracking-wider block mb-1.5"
                    style={{
                      color: "#B0AAA0",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {field.label}
                  </Label>
                  <Input
                    value={theme[field.key]}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className={`${goldInputBorder} bg-white/5 !h-9 text-xs font-mono`}
                    style={{ color: "#E8E4E0" }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleApply}
            disabled={applying}
            className={`${goldButton} !h-10 !px-8`}
          >
            {applying ? (
              <span className="animate-pulse">Application...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Appliquer
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className={`${outlineGoldButton} !h-10 !px-6`}
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:col-span-1">
        <Card className={`${glassCard} !p-0 overflow-hidden sticky top-8`}>
          <CardHeader
            className="!pb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" style={{ color: GOLD }} />
              <CardTitle
                className="text-sm tracking-[0.12em] uppercase"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#E8E4E0",
                }}
              >
                Aperçu
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="!px-5 !py-5">
            <div
              className="rounded-lg p-5 space-y-4 transition-all duration-300"
              style={{
                backgroundColor: theme.bgPrimary,
                border: `1px solid ${theme.accent}33`,
                boxShadow: `0 0 20px ${theme.glowGold}`,
              }}
            >
              {/* Swatches row */}
              <div className="flex gap-2">
                {THEME_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="flex-1 h-8 rounded-md transition-all duration-300"
                    style={{
                      backgroundColor: theme[field.key],
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    title={field.label}
                  />
                ))}
              </div>

              {/* Mini page preview */}
              <div
                className="rounded-md p-3 space-y-2"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <div
                  className="h-2 w-20 rounded-sm"
                  style={{ backgroundColor: theme.accent }}
                />
                <div
                  className="h-1.5 w-full rounded-sm"
                  style={{ backgroundColor: theme.textPrimary, opacity: 0.8 }}
                />
                <div
                  className="h-1.5 w-3/4 rounded-sm"
                  style={{ backgroundColor: theme.textSecondary, opacity: 0.5 }}
                />
                <div
                  className="h-1.5 w-5/6 rounded-sm"
                  style={{ backgroundColor: theme.textSecondary, opacity: 0.3 }}
                />
              </div>

              {/* Glow preview */}
              <div
                className="text-center text-xs font-bold tracking-widest uppercase py-3 rounded-md"
                style={{
                  color: theme.accent,
                  textShadow: `0 0 20px ${theme.glowGold}, 0 0 40px ${theme.glowGold}`,
                  fontFamily: "var(--font-display)",
                }}
              >
                ASCENSION
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Tab 4 — Fiches (Character Sheet Validation)
   ============================================================ */

const SHEET_STATUS_CONFIG: Record<
  CharacterSheet["status"],
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "En attente",
    color: "#EAB308",
    bg: "rgba(234,179,8,0.15)",
  },
  accepted: {
    label: "Acceptée",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.15)",
  },
  rejected: {
    label: "Refusée",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.15)",
  },
  revision: {
    label: "Révision",
    color: "#F97316",
    bg: "rgba(249,115,22,0.15)",
  },
};

const SHEET_FILTERS: { key: SheetFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "accepted", label: "Acceptées" },
  { key: "rejected", label: "Refusées" },
  { key: "revision", label: "Révision" },
];

function SheetsTab() {
  const [sheets, setSheets] = useState<CharacterSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SheetFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSheets = useCallback(async () => {
    try {
      const res = await fetch("/api/sheets");
      if (res.ok) {
        const data = await res.json();
        setSheets(Array.isArray(data) ? data : []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const handleAction = async (
    sheetId: string,
    action: "accept" | "revision" | "reject"
  ) => {
    setActionLoading(sheetId);
    try {
      const body: Record<string, string> = {};
      if (action === "reject" && rejectionReason.trim()) {
        body.reason = rejectionReason.trim();
      }
      const res = await fetch(`/api/sheets/${sheetId}/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur");
      }
      const actionLabels = {
        accept: "Fiche validée",
        revision: "Fiche mise en révision",
        reject: "Fiche refusée",
      };
      toast.success(actionLabels[action]);
      setRejectId(null);
      setRejectionReason("");
      fetchSheets();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'action"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSheets =
    filter === "all"
      ? sheets
      : sheets.filter((s) => s.status === filter);

  const counts = {
    all: sheets.length,
    pending: sheets.filter((s) => s.status === "pending").length,
    accepted: sheets.filter((s) => s.status === "accepted").length,
    rejected: sheets.filter((s) => s.status === "rejected").length,
    revision: sheets.filter((s) => s.status === "revision").length,
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {SHEET_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              fontFamily: "var(--font-display)",
              background:
                filter === f.key
                  ? "rgba(201,168,76,0.15)"
                  : "rgba(255,255,255,0.03)",
              color: filter === f.key ? "#C9A84C" : "#706B63",
              border:
                filter === f.key
                  ? "1px solid rgba(201,168,76,0.3)"
                  : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {f.label}
            <span
              className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded"
              style={{
                background:
                  filter === f.key
                    ? "rgba(201,168,76,0.2)"
                    : "rgba(255,255,255,0.05)",
              }}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Sheets list */}
      {filteredSheets.length === 0 ? (
        <Card className={`${glassCard} !p-0 overflow-hidden`}>
          <div className="py-12 text-center">
            <FileText
              className="w-8 h-8 mx-auto mb-3 opacity-30"
              style={{ color: "#706B63" }}
            />
            <p className="text-xs" style={{ color: "#706B63" }}>
              Aucune fiche trouvée
            </p>
          </div>
        </Card>
      ) : (
        <ScrollArea className="max-h-[700px]">
          <div className="space-y-3 pr-3">
            {filteredSheets.map((sheet) => {
              const statusCfg = SHEET_STATUS_CONFIG[sheet.status];
              const isExpanded = expandedId === sheet.id;
              const isRejecting = rejectId === sheet.id;
              const isActionable =
                sheet.status === "pending" || sheet.status === "revision";

              return (
                <Card
                  key={sheet.id}
                  className={`${glassCard} !p-0 overflow-hidden transition-all duration-300`}
                >
                  {/* Header — always visible */}
                  <div
                    className="px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : sheet.id)
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className="text-sm font-bold"
                            style={{
                              color: "#E8E4E0",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            {sheet.pseudo}
                          </span>
                          <Badge
                            className="text-[0.55rem]"
                            style={{
                              background: statusCfg.bg,
                              color: statusCfg.color,
                              border: `1px solid ${statusCfg.color}33`,
                            }}
                          >
                            {statusCfg.label}
                          </Badge>
                        </div>
                        <div
                          className="flex flex-wrap gap-x-4 gap-y-1 text-[0.65rem]"
                          style={{ color: "#706B63" }}
                        >
                          <span>{sheet.discordName}</span>
                          <span className="opacity-50">
                            ID: {sheet.discordId}
                          </span>
                          <span>
                            {sheet.race} • {sheet.metier} • {sheet.age}
                          </span>
                        </div>
                        <p
                          className="text-[0.6rem] mt-1.5"
                          style={{ color: "#504B43" }}
                        >
                          {formatDate(sheet.createdAt)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp
                            className="w-4 h-4"
                            style={{ color: "#706B63" }}
                          />
                        ) : (
                          <ChevronDown
                            className="w-4 h-4"
                            style={{ color: "#706B63" }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div
                      className="px-5 pb-5 space-y-4"
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="pt-4 space-y-4">
                        {/* Histoire */}
                        {sheet.histoire && (
                          <div>
                            <h5
                              className="text-[0.65rem] uppercase tracking-wider font-medium mb-1.5"
                              style={{
                                color: "#C9A84C",
                                fontFamily: "var(--font-display)",
                              }}
                            >
                              Histoire
                            </h5>
                            <p
                              className="text-xs leading-relaxed whitespace-pre-wrap"
                              style={{ color: "#B0AAA0" }}
                            >
                              {sheet.histoire}
                            </p>
                          </div>
                        )}

                        {/* Description */}
                        {sheet.description && (
                          <div>
                            <h5
                              className="text-[0.65rem] uppercase tracking-wider font-medium mb-1.5"
                              style={{
                                color: "#C9A84C",
                                fontFamily: "var(--font-display)",
                              }}
                            >
                              Description
                            </h5>
                            <p
                              className="text-xs leading-relaxed whitespace-pre-wrap"
                              style={{ color: "#B0AAA0" }}
                            >
                              {sheet.description}
                            </p>
                          </div>
                        )}

                        {/* Stats */}
                        {sheet.stats &&
                          Object.keys(sheet.stats).length > 0 && (
                            <div>
                              <h5
                                className="text-[0.65rem] uppercase tracking-wider font-medium mb-1.5"
                                style={{
                                  color: "#C9A84C",
                                  fontFamily: "var(--font-display)",
                                }}
                              >
                                Statistiques
                              </h5>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.entries(sheet.stats).map(
                                  ([key, val]) => (
                                    <div
                                      key={key}
                                      className="rounded-lg px-3 py-2"
                                      style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border:
                                          "1px solid rgba(255,255,255,0.06)",
                                      }}
                                    >
                                      <span
                                        className="text-[0.6rem] uppercase block"
                                        style={{
                                          color: "#706B63",
                                          fontFamily: "var(--font-display)",
                                        }}
                                      >
                                        {key}
                                      </span>
                                      <span
                                        className="text-sm font-bold"
                                        style={{ color: "#E8E4E0" }}
                                      >
                                        {val}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Liens */}
                        {sheet.liens && sheet.liens.length > 0 && (
                          <div>
                            <h5
                              className="text-[0.65rem] uppercase tracking-wider font-medium mb-1.5"
                              style={{
                                color: "#C9A84C",
                                fontFamily: "var(--font-display)",
                              }}
                            >
                              Liens
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {sheet.liens.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[0.65rem] px-2.5 py-1 rounded-md transition-colors"
                                  style={{
                                    color: "#C9A84C",
                                    background: "rgba(201,168,76,0.1)",
                                    border: "1px solid rgba(201,168,76,0.2)",
                                  }}
                                >
                                  Référence {idx + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Captures */}
                        {sheet.captures && sheet.captures.length > 0 && (
                          <div>
                            <h5
                              className="text-[0.65rem] uppercase tracking-wider font-medium mb-1.5"
                              style={{
                                color: "#C9A84C",
                                fontFamily: "var(--font-display)",
                              }}
                            >
                              Captures
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {sheet.captures.map((cap, idx) => (
                                <a
                                  key={idx}
                                  href={cap}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={cap}
                                    alt={`Capture ${idx + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg border border-white/10"
                                    loading="lazy"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rejection reason (if previously rejected) */}
                        {sheet.rejectionReason && (
                          <div
                            className="rounded-lg p-3"
                            style={{
                              background: "rgba(239,68,68,0.08)",
                              border: "1px solid rgba(239,68,68,0.2)",
                            }}
                          >
                            <h5
                              className="text-[0.65rem] uppercase tracking-wider font-medium mb-1"
                              style={{
                                color: "#EF4444",
                                fontFamily: "var(--font-display)",
                              }}
                            >
                              Raison du refus
                            </h5>
                            <p
                              className="text-xs"
                              style={{ color: "#B0AAA0" }}
                            >
                              {sheet.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <Separator
                        className="my-3"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      />
                      {isActionable ? (
                        <div>
                          {isRejecting ? (
                            /* Inline rejection form */
                            <div
                              className="space-y-3 p-3 rounded-lg"
                              style={{
                                background: "rgba(239,68,68,0.05)",
                                border: "1px solid rgba(239,68,68,0.15)",
                              }}
                            >
                              <Label
                                className="text-xs uppercase tracking-wider"
                                style={{
                                  color: "#EF4444",
                                  fontFamily: "var(--font-display)",
                                }}
                              >
                                Raison du refus
                              </Label>
                              <Textarea
                                value={rejectionReason}
                                onChange={(e) =>
                                  setRejectionReason(e.target.value)
                                }
                                placeholder="Expliquez la raison du refus..."
                                rows={3}
                                className={`${goldInputBorder} bg-white/5 text-xs resize-none`}
                                style={{ color: "#E8E4E0" }}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    handleAction(sheet.id, "reject")
                                  }
                                  disabled={
                                    actionLoading === sheet.id ||
                                    !rejectionReason.trim()
                                  }
                                  className="!h-8 !px-4 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                                >
                                  {actionLoading === sheet.id ? (
                                    <span className="animate-pulse">
                                      ...
                                    </span>
                                  ) : (
                                    "Confirmer le refus"
                                  )}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setRejectId(null);
                                    setRejectionReason("");
                                  }}
                                  className="!h-8 !px-4 text-xs bg-white/5 hover:bg-white/10 text-[#706B63] border border-white/10"
                                >
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() =>
                                  handleAction(sheet.id, "accept")
                                }
                                disabled={actionLoading === sheet.id}
                                className="!h-8 !px-4 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                              >
                                {actionLoading === sheet.id ? (
                                  <span className="animate-pulse">
                                    ...
                                  </span>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3 mr-1" />
                                    Valider
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() =>
                                  handleAction(sheet.id, "revision")
                                }
                                disabled={actionLoading === sheet.id}
                                className="!h-8 !px-4 text-xs bg-white/10 hover:bg-white/15 text-[#B0AAA0] border border-white/15"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                En attente
                              </Button>
                              <Button
                                onClick={() => setRejectId(sheet.id)}
                                disabled={actionLoading === sheet.id}
                                className="!h-8 !px-4 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Refuser
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge
                          className="text-[0.6rem]"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "#706B63",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          Fiche traitée
                        </Badge>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

/* ============================================================
   Tab 5 — Personnages (Tupperbox / NPC Management)
   ============================================================ */

const EMPTY_CHARACTER: Omit<TupperCharacter, "id"> = {
  name: "",
  webhookDisplayName: "",
  avatarUrl: "",
  bannerUrl: "",
  embedColor: "#C9A84C",
  title: "",
  description: "",
  personality: "",
  systemPrompt: "",
  aiModel: "",
  temperature: 0.7,
  maxResponseLength: 500,
  adminOnly: false,
  isNpc: false,
  npcContext: "",
  active: true,
};

function TupperboxTab() {
  const [characters, setCharacters] = useState<TupperCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CHARACTER);
  const [creating, setCreating] = useState(false);

  // Quick action states
  const [sayForm, setSayForm] = useState<Record<string, { channelId: string; message: string }>>({});
  const [embedForm, setEmbedForm] = useState<Record<string, { channelId: string; title: string; description: string; color: string }>>({});
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    try {
      const res = await fetch("/api/tupperbox/characters");
      if (res.ok) {
        const data = await res.json();
        setCharacters(Array.isArray(data) ? data : []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast.error("Le nom est requis.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/tupperbox/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la création");
      }
      toast.success("Personnage créé avec succès");
      setCreateForm(EMPTY_CHARACTER);
      setShowCreate(false);
      fetchCharacters();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSay = async (charId: string) => {
    const form = sayForm[charId];
    if (!form?.channelId || !form?.message?.trim()) {
      toast.error("Canal et message requis.");
      return;
    }
    setQuickLoading(`say-${charId}`);
    try {
      const res = await fetch("/api/tupperbox/say", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: charId,
          channelId: form.channelId,
          message: form.message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Message envoyé");
      setSayForm((prev) => {
        const next = { ...prev };
        delete next[charId];
        return next;
      });
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setQuickLoading(null);
    }
  };

  const handleEmbed = async (charId: string) => {
    const form = embedForm[charId];
    if (!form?.channelId) {
      toast.error("Canal requis.");
      return;
    }
    setQuickLoading(`embed-${charId}`);
    try {
      const res = await fetch("/api/tupperbox/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: charId,
          channelId: form.channelId,
          title: form.title,
          description: form.description,
          color: form.color || "#C9A84C",
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Embed envoyé");
      setEmbedForm((prev) => {
        const next = { ...prev };
        delete next[charId];
        return next;
      });
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setQuickLoading(null);
    }
  };

  const updateCreateField = <K extends keyof typeof EMPTY_CHARACTER>(
    key: K,
    value: (typeof EMPTY_CHARACTER)[K]
  ) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Create button */}
      <div className="flex items-center justify-between">
        <p
          className="text-xs"
          style={{
            color: "#706B63",
            fontFamily: "var(--font-body)",
          }}
        >
          Gestion des personnages Discord (Tupperbox / NPC)
        </p>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className={`${goldButton} !h-9 !px-5`}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Créer un personnage
        </Button>
      </div>

      {/* Creation form */}
      {showCreate && (
        <Card className={`${glassCard} !p-0 overflow-hidden`}>
          <CardHeader
            className="!pb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                <Plus className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <CardTitle
                className="text-sm tracking-[0.12em] uppercase"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#E8E4E0",
                }}
              >
                Nouveau personnage
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="!px-5 !py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Nom *
                </Label>
                <Input
                  value={createForm.name}
                  onChange={(e) => updateCreateField("name", e.target.value)}
                  placeholder="Nom du personnage"
                  className={`${goldInputBorder} bg-white/5 !h-9 text-xs`}
                  style={{ color: "#E8E4E0" }}
                />
              </div>

              {/* Webhook Display Name */}
              <div className="space-y-2">
                <Label
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Nom webhook
                </Label>
                <Input
                  value={createForm.webhookDisplayName || ""}
                  onChange={(e) =>
                    updateCreateField("webhookDisplayName", e.target.value)
                  }
                  placeholder="Nom d'affichage webhook"
                  className={`${goldInputBorder} bg-white/5 !h-9 text-xs`}
                  style={{ color: "#E8E4E0" }}
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-2">
                <Label
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  URL de l'avatar
                </Label>
                <Input
                  value={createForm.avatarUrl || ""}
                  onChange={(e) =>
                    updateCreateField("avatarUrl", e.target.value)
                  }
                  placeholder="https://..."
                  className={`${goldInputBorder} bg-white/5 !h-9 text-xs`}
                  style={{ color: "#E8E4E0" }}
                />
              </div>

              {/* Banner URL */}
              <div className="space-y-2">
                <Label
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  URL de la bannière
                </Label>
                <Input
                  value={createForm.bannerUrl || ""}
                  onChange={(e) =>
                    updateCreateField("bannerUrl", e.target.value)
                  }
                  placeholder="https://..."
                  className={`${goldInputBorder} bg-white/5 !h-9 text-xs`}
                  style={{ color: "#E8E4E0" }}
                />
              </div>

              {/* Embed Color */}
              <div className="space-y-2">
                <Label
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Couleur embed
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={createForm.embedColor || "#C9A84C"}
                    onChange={(e) =>
                      updateCreateField("embedColor", e.target.value)
                    }
                    className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                  />
                  <Input
                    value={createForm.embedColor || "#C9A84C"}
                    onChange={(e) =>
                      updateCreateField("embedColor", e.target.value)
                    }
                    placeholder="#C9A84C"
                    className={`${goldInputBorder} bg-white/5 !h-9 text-xs flex-1 font-mono`}
                    style={{ color: "#E8E4E0" }}
                  />
                </div>
              </div>

              {/* AI Model */}
              <div className="space-y-2">
                <Label
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Modèle IA
                </Label>
                <Input
                  value={createForm.aiModel || ""}
                  onChange={(e) =>
                    updateCreateField("aiModel", e.target.value)
                  }
                  placeholder="@cf/meta/llama-3.1-70b-instruct"
                  className={`${goldInputBorder} bg-white/5 !h-9 text-xs`}
                  style={{ color: "#E8E4E0" }}
                />
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <Label
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Température: {createForm.temperature?.toFixed(1)}
                </Label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={createForm.temperature ?? 0.7}
                  onChange={(e) =>
                    updateCreateField("temperature", parseFloat(e.target.value))
                  }
                  className="w-full accent-[#C9A84C]"
                />
              </div>

              {/* Max Response Length */}
              <div className="space-y-2">
                <Label
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Longueur max réponse
                </Label>
                <Input
                  type="number"
                  value={createForm.maxResponseLength ?? 500}
                  onChange={(e) =>
                    updateCreateField(
                      "maxResponseLength",
                      parseInt(e.target.value) || 500
                    )
                  }
                  className={`${goldInputBorder} bg-white/5 !h-9 text-xs`}
                  style={{ color: "#E8E4E0" }}
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label
                className="text-xs uppercase tracking-wider"
                style={{
                  color: "#B0AAA0",
                  fontFamily: "var(--font-display)",
                }}
              >
                Titre
              </Label>
              <Input
                value={createForm.title || ""}
                onChange={(e) => updateCreateField("title", e.target.value)}
                placeholder="Titre du personnage"
                className={`${goldInputBorder} bg-white/5 !h-9 text-xs`}
                style={{ color: "#E8E4E0" }}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                className="text-xs uppercase tracking-wider"
                style={{
                  color: "#B0AAA0",
                  fontFamily: "var(--font-display)",
                }}
              >
                Description
              </Label>
              <Textarea
                value={createForm.description || ""}
                onChange={(e) =>
                  updateCreateField("description", e.target.value)
                }
                placeholder="Description du personnage..."
                rows={3}
                className={`${goldInputBorder} bg-white/5 text-xs resize-none`}
                style={{ color: "#E8E4E0" }}
              />
            </div>

            {/* Personality */}
            <div className="space-y-2">
              <Label
                className="text-xs uppercase tracking-wider"
                style={{
                  color: "#B0AAA0",
                  fontFamily: "var(--font-display)",
                }}
              >
                Personnalité (IA)
              </Label>
              <Textarea
                value={createForm.personality || ""}
                onChange={(e) =>
                  updateCreateField("personality", e.target.value)
                }
                placeholder="Décrivez la personnalité..."
                rows={2}
                className={`${goldInputBorder} bg-white/5 text-xs resize-none`}
                style={{ color: "#E8E4E0" }}
              />
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <Label
                className="text-xs uppercase tracking-wider"
                style={{
                  color: "#B0AAA0",
                  fontFamily: "var(--font-display)",
                }}
              >
                System Prompt (IA)
              </Label>
              <Textarea
                value={createForm.systemPrompt || ""}
                onChange={(e) =>
                  updateCreateField("systemPrompt", e.target.value)
                }
                placeholder="Instructions système pour l'IA..."
                rows={3}
                className={`${goldInputBorder} bg-white/5 text-xs resize-none`}
                style={{ color: "#E8E4E0" }}
              />
            </div>

            {/* NPC Context */}
            {createForm.isNpc && (
              <div className="space-y-2">
                <Label
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Contexte NPC
                </Label>
                <Textarea
                  value={createForm.npcContext || ""}
                  onChange={(e) =>
                    updateCreateField("npcContext", e.target.value)
                  }
                  placeholder="Contexte du NPC..."
                  rows={3}
                  className={`${goldInputBorder} bg-white/5 text-xs resize-none`}
                  style={{ color: "#E8E4E0" }}
                />
              </div>
            )}

            {/* Toggles */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createForm.adminOnly}
                  onChange={(e) =>
                    updateCreateField("adminOnly", e.target.checked)
                  }
                  className="w-4 h-4 rounded accent-[#C9A84C]"
                />
                <span
                  className="text-xs"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Admin uniquement
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createForm.isNpc}
                  onChange={(e) =>
                    updateCreateField("isNpc", e.target.checked)
                  }
                  className="w-4 h-4 rounded accent-[#C9A84C]"
                />
                <span
                  className="text-xs"
                  style={{
                    color: "#B0AAA0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  NPC
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                onClick={handleCreate}
                disabled={creating}
                className={`${goldButton} !h-10 !px-8`}
              >
                {creating ? (
                  <span className="animate-pulse">Création...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Créer
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowCreate(false);
                  setCreateForm(EMPTY_CHARACTER);
                }}
                className={`${outlineGoldButton} !h-10 !px-6`}
              >
                <X className="w-4 h-4" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Characters grid */}
      {characters.length === 0 ? (
        <Card className={`${glassCard} !p-0 overflow-hidden`}>
          <div className="py-12 text-center">
            <Bot
              className="w-8 h-8 mx-auto mb-3 opacity-30"
              style={{ color: "#706B63" }}
            />
            <p className="text-xs" style={{ color: "#706B63" }}>
              Aucun personnage créé
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map((char) => (
            <Card
              key={char.id}
              className={`${glassCard} !p-0 overflow-hidden`}
            >
              {/* Character header with avatar + color */}
              <div
                className="relative px-5 py-4"
                style={{
                  borderBottom: `2px solid ${char.embedColor || "#C9A84C"}40`,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  {char.avatarUrl ? (
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${char.embedColor || "#C9A84C"}20`,
                        border: `1px solid ${char.embedColor || "#C9A84C"}30`,
                      }}
                    >
                      <Bot
                        className="w-5 h-5"
                        style={{ color: char.embedColor || "#C9A84C" }}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: "#E8E4E0",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {char.name}
                      </span>
                      {char.adminOnly && (
                        <Badge
                          className="text-[0.55rem]"
                          style={{
                            background: "rgba(201,168,76,0.15)",
                            color: "#C9A84C",
                            border: "1px solid rgba(201,168,76,0.25)",
                          }}
                        >
                          Admin
                        </Badge>
                      )}
                      {char.isNpc && (
                        <Badge
                          className="text-[0.55rem]"
                          style={{
                            background: "rgba(168,85,247,0.15)",
                            color: "#A855F7",
                            border: "1px solid rgba(168,85,247,0.25)",
                          }}
                        >
                          NPC
                        </Badge>
                      )}
                    </div>
                    {char.title && (
                      <p
                        className="text-[0.6rem] mt-0.5"
                        style={{ color: "#706B63" }}
                      >
                        {char.title}
                      </p>
                    )}
                  </div>
                  {/* Embed color swatch */}
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 mt-1"
                    style={{
                      backgroundColor: char.embedColor || "#C9A84C",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    title={char.embedColor || "#C9A84C"}
                  />
                </div>
                {char.description && (
                  <p
                    className="text-[0.65rem] mt-2 line-clamp-2"
                    style={{ color: "#B0AAA0" }}
                  >
                    {char.description}
                  </p>
                )}
              </div>

              {/* Quick actions */}
              <div className="px-5 py-3 space-y-2">
                <Separator
                  className="mb-3"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />

                {/* Say form */}
                <div>
                  <button
                    onClick={() =>
                      setSayForm((prev) =>
                        prev[char.id]
                          ? (() => {
                              const next = { ...prev };
                              delete next[char.id];
                              return next;
                            })()
                          : {
                              ...prev,
                              [char.id]: {
                                channelId: "",
                                message: "",
                              },
                            }
                      )
                    }
                    className="text-[0.6rem] uppercase tracking-wider font-medium flex items-center gap-1.5 mb-2"
                    style={{
                      color: "#C9A84C",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    <Send className="w-3 h-3" /> Dire
                  </button>
                  {sayForm[char.id] && (
                    <div className="space-y-2 p-3 rounded-lg mb-2" style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <Input
                        value={sayForm[char.id].channelId}
                        onChange={(e) =>
                          setSayForm((prev) => ({
                            ...prev,
                            [char.id]: {
                              ...prev[char.id],
                              channelId: e.target.value,
                            },
                          }))
                        }
                        placeholder="ID du canal"
                        className={`${goldInputBorder} bg-white/5 !h-8 text-[0.65rem]`}
                        style={{ color: "#E8E4E0" }}
                      />
                      <Textarea
                        value={sayForm[char.id].message}
                        onChange={(e) =>
                          setSayForm((prev) => ({
                            ...prev,
                            [char.id]: {
                              ...prev[char.id],
                              message: e.target.value,
                            },
                          }))
                        }
                        placeholder="Message..."
                        rows={2}
                        className={`${goldInputBorder} bg-white/5 text-[0.65rem] resize-none`}
                        style={{ color: "#E8E4E0" }}
                      />
                      <Button
                        onClick={() => handleSay(char.id)}
                        disabled={quickLoading === `say-${char.id}`}
                        className="!h-7 !px-3 text-[0.6rem] bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 text-[#C9A84C] border border-[#C9A84C]/30"
                      >
                        {quickLoading === `say-${char.id}` ? "..." : "Envoyer"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Embed form */}
                <div>
                  <button
                    onClick={() =>
                      setEmbedForm((prev) =>
                        prev[char.id]
                          ? (() => {
                              const next = { ...prev };
                              delete next[char.id];
                              return next;
                            })()
                          : {
                              ...prev,
                              [char.id]: {
                                channelId: "",
                                title: "",
                                description: "",
                                color: char.embedColor || "#C9A84C",
                              },
                            }
                      )
                    }
                    className="text-[0.6rem] uppercase tracking-wider font-medium flex items-center gap-1.5 mb-2"
                    style={{
                      color: "#C9A84C",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    <Palette className="w-3 h-3" /> Embed
                  </button>
                  {embedForm[char.id] && (
                    <div className="space-y-2 p-3 rounded-lg mb-2" style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <Input
                        value={embedForm[char.id].channelId}
                        onChange={(e) =>
                          setEmbedForm((prev) => ({
                            ...prev,
                            [char.id]: {
                              ...prev[char.id],
                              channelId: e.target.value,
                            },
                          }))
                        }
                        placeholder="ID du canal"
                        className={`${goldInputBorder} bg-white/5 !h-8 text-[0.65rem]`}
                        style={{ color: "#E8E4E0" }}
                      />
                      <Input
                        value={embedForm[char.id].title}
                        onChange={(e) =>
                          setEmbedForm((prev) => ({
                            ...prev,
                            [char.id]: {
                              ...prev[char.id],
                              title: e.target.value,
                            },
                          }))
                        }
                        placeholder="Titre de l'embed"
                        className={`${goldInputBorder} bg-white/5 !h-8 text-[0.65rem]`}
                        style={{ color: "#E8E4E0" }}
                      />
                      <Textarea
                        value={embedForm[char.id].description}
                        onChange={(e) =>
                          setEmbedForm((prev) => ({
                            ...prev,
                            [char.id]: {
                              ...prev[char.id],
                              description: e.target.value,
                            },
                          }))
                        }
                        placeholder="Description de l'embed..."
                        rows={2}
                        className={`${goldInputBorder} bg-white/5 text-[0.65rem] resize-none`}
                        style={{ color: "#E8E4E0" }}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={embedForm[char.id].color}
                          onChange={(e) =>
                            setEmbedForm((prev) => ({
                              ...prev,
                              [char.id]: {
                                ...prev[char.id],
                                color: e.target.value,
                              },
                            }))
                          }
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <Button
                          onClick={() => handleEmbed(char.id)}
                          disabled={quickLoading === `embed-${char.id}`}
                          className="!h-7 !px-3 text-[0.6rem] bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 text-[#C9A84C] border border-[#C9A84C]/30"
                        >
                          {quickLoading === `embed-${char.id}`
                            ? "..."
                            : "Envoyer"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CMS Redirect Tab
   ============================================================ */

function CMSTab() {
  const { navigate } = useNavigation();
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
      >
        <Settings2 size={36} style={{ color: GOLD }} />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: "#E8E4E0", fontFamily: "var(--font-display)" }}>
          Framework CMS
        </h3>
        <p className="text-sm mt-1" style={{ color: "#706B63" }}>
          Gestion complète du contenu, des couleurs, des prompts IA, des illustrations et des paramètres du site.
        </p>
      </div>
      <Button
        onClick={() => navigate("cms")}
        className="gap-2 px-6 py-2.5 rounded-lg font-medium text-sm tracking-wide transition-all duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #C9A84C, #A8873A)",
          color: "#0A0A0F",
          fontFamily: "var(--font-display)",
        }}
      >
        Ouvrir le CMS
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}

/* ============================================================
   Main Admin Page
   ============================================================ */

export default function AdminPage() {
  const { data: session, status } = useSession();

  // Session loading
  if (status === "loading") {
    return <LoadingSkeleton />;
  }

  // Not authenticated or not admin
  if (status === "unauthenticated" || !session?.user) {
    return <AccessDenied />;
  }

  // Check admin by Discord ID
  // session.user can be typed differently; check known shapes
  const discordId =
    (session.user as Record<string, unknown>)?.discordId ??
    (session.user as Record<string, unknown>)?.id ??
    "";

  if (discordId !== ADMIN_DISCORD_ID) {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-xl sm:text-2xl tracking-[0.15em] uppercase"
          style={{
            fontFamily: "var(--font-display)",
            color: "#C9A84C",
            textShadow: "0 0 20px rgba(201,168,76,0.4), 0 0 40px rgba(201,168,76,0.15)",
          }}
        >
          Panneau d&apos;Administration
        </h1>
        <p
          className="text-xs mt-1.5"
          style={{ color: "#706B63", fontFamily: "var(--font-body)" }}
        >
          Gestion du wiki Ascension — Messagerie, Bannières, Esthétique, Fiches, Personnages
        </p>
        <Separator className="mt-5" style={{ background: "rgba(201,168,76,0.15)" }} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="messagerie" className="w-full">
        <TabsList
          className="w-full sm:w-auto flex flex-col sm:flex-row gap-1 bg-transparent h-auto p-0 mb-8"
        >
          {[
            { value: "messagerie", label: "📬 Messagerie", icon: Mail },
            { value: "bannieres", label: "🖼️ Bannières", icon: Image },
            { value: "esthetique", label: "🎨 Esthétique", icon: Palette },
            { value: "fiches", label: "📄 Fiches", icon: FileText },
            { value: "personnages", label: "🎭 Personnages", icon: Bot },
            { value: "cms", label: "⚙️ CMS", icon: Settings2 },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="w-full sm:w-auto relative rounded-lg px-4 py-2.5 text-xs font-medium tracking-wider uppercase transition-all duration-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[#706B63] data-[state=active]:text-[#C9A84C] border border-transparent data-[state=active]:border-[#C9A84C]/30 data-[state=active]:bg-[#C9A84C]/5 hover:text-[#B0AAA0] data-[state=active]:shadow-[0_0_15px_rgba(201,168,76,0.15)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Icon className="w-4 h-4 sm:mr-2" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="messagerie">
          <MessagingTab />
        </TabsContent>

        <TabsContent value="bannieres">
          <BannersTab />
        </TabsContent>

        <TabsContent value="esthetique">
          <ThemeTab />
        </TabsContent>

        <TabsContent value="fiches">
          <SheetsTab />
        </TabsContent>

        <TabsContent value="personnages">
          <TupperboxTab />
        </TabsContent>

        <TabsContent value="cms">
          <CMSTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}