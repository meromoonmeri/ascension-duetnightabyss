"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Palette,
  Trophy,
  Gem,
  Flame,
  Shield,
  Bot,
  FileText,
  Key,
  ImageIcon,
  Bell,
  Crown,
  MessageSquare,
  Menu,
  X,
  Save,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Eye,
  Download,
  Sparkles,
  RotateCcw,
  ChevronRight,
  Search,
  GripVertical,
  LayoutGrid,
  ListOrdered,
  Type,
  Minus,
  Code,
  Space,
  ArrowUp,
  ArrowDown,
  Columns,
  Hash,
  ExternalLink,
  Star,
  Home,
  Users,
  Swords,
  Map,
  BookOpen,
  ShoppingBag,
  Gamepad2,
  Newspaper,
  Settings,
  Link,
} from "lucide-react";

/* ============================================================
   Constants
   ============================================================ */

const ADMIN_DISCORD_ID = "722146261381415043";
const GOLD = "#C9A84C";

const glassCard =
  "bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl";

const goldButton =
  "bg-[#C9A84C] hover:bg-[#d4b35a] text-black font-bold tracking-wider text-xs uppercase transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]";

const outlineGoldButton =
  "border border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C]/10 font-bold tracking-wider text-xs uppercase transition-all duration-300";

/* ============================================================
   Types
   ============================================================ */

type SectionId =
  | "visual"
  | "ranks"
  | "rarities"
  | "elements"
  | "badges"
  | "ai"
  | "prompts"
  | "keywords"
  | "illustrations"
  | "notifications"
  | "roles"
  | "embeds"
  | "builder"
  | "menus";

interface SidebarSection {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  emoji: string;
}

interface ConfigEntry {
  id?: string;
  key: string;
  value: string;
  group: string;
  label?: string;
}

interface Prompt {
  id?: string;
  name: string;
  label: string;
  description: string;
  category: string;
  template: string;
  variables: string;
  active: boolean;
}

interface Keyword {
  id?: string;
  keyword: string;
  category: string;
  weight: number;
  active: boolean;
}

interface IllustrationImage {
  id: string;
  name: string;
  prompt: string;
  category: string;
  url: string;
  createdAt: string;
}

/* ============================================================
   Sidebar Sections
   ============================================================ */

const SIDEBAR_SECTIONS: SidebarSection[] = [
  { id: "visual", label: "Visuel", icon: Palette, emoji: "🎨" },
  { id: "ranks", label: "Rangs", icon: Trophy, emoji: "🏷️" },
  { id: "rarities", label: "Raretés", icon: Gem, emoji: "💎" },
  { id: "elements", label: "Éléments", icon: Flame, emoji: "🔥" },
  { id: "badges", label: "Badges", icon: Shield, emoji: "📛" },
  { id: "ai", label: "IA", icon: Bot, emoji: "🤖" },
  { id: "prompts", label: "Prompts", icon: FileText, emoji: "📝" },
  { id: "keywords", label: "Mots-clés", icon: Key, emoji: "🔑" },
  { id: "illustrations", label: "Illustrations", icon: ImageIcon, emoji: "🖼️" },
  { id: "notifications", label: "Notifications", icon: Bell, emoji: "📢" },
  { id: "roles", label: "Rôles", icon: Crown, emoji: "👑" },
  { id: "embeds", label: "Embeds", icon: MessageSquare, emoji: "💬" },
  { id: "builder", label: "Page Builder", icon: LayoutGrid, emoji: "🧱" },
  { id: "menus", label: "Menus", icon: ListOrdered, emoji: "📋" },
];

/* ============================================================
   Default Data Templates
   ============================================================ */

const VISUAL_FIELDS = [
  { key: "color_primary", label: "Couleur principale" },
  { key: "color_accent", label: "Couleur d'accent" },
  { key: "color_background", label: "Arrière-plan" },
  { key: "color_card_bg", label: "Fond des cartes" },
  { key: "color_text_primary", label: "Texte principal" },
  { key: "color_text_secondary", label: "Texte secondaire" },
  { key: "color_text_tertiary", label: "Texte tertiaire" },
];

const RANK_ROWS = [
  { rank: "F" },
  { rank: "E" },
  { rank: "D" },
  { rank: "C" },
  { rank: "B" },
  { rank: "A" },
  { rank: "S" },
  { rank: "S+" },
  { rank: "EX" },
];

const PROMPT_CATEGORIES = [
  "character",
  "item",
  "location",
  "event",
  "lore",
  "system",
  "other",
];

const KEYWORD_CATEGORIES = [
  "fantasy",
  "character",
  "landscape",
  "item",
  "action",
  "mood",
  "style",
  "other",
];

const ILLUSTRATION_SIZES = [
  { value: "512x512", label: "512×512" },
  { value: "768x768", label: "768×768" },
  { value: "1024x1024", label: "1024×1024" },
  { value: "1024x1536", label: "1024×1536 (Portrait)" },
  { value: "1536x1024", label: "1536×1024 (Paysage)" },
];

const BLOCK_TYPES = [
  { value: "hero", label: "Hero Banner", icon: "🏠", desc: "Grande bannière avec titre et description" },
  { value: "text", label: "Texte", icon: "📝", desc: "Bloc de texte riche (markdown)" },
  { value: "image", label: "Image", icon: "🖼️", desc: "Image avec légende optionnelle" },
  { value: "separator", label: "Séparateur", icon: "➖", desc: "Ligne de séparation décorative" },
  { value: "cards", label: "Grille de Cartes", icon: "🃏", desc: "Grille de cartes cliquables" },
  { value: "embed", label: "Embed", icon: "🔗", desc: "Intégration vidéo / iframe externe" },
  { value: "spacer", label: "Espaceur", icon: "⬜", desc: "Espace vertical configurable" },
  { value: "html", label: "HTML Brut", icon: "💻", desc: "Code HTML personnalisé" },
];

const BUILDER_PAGES = [
  { value: "home", label: "Accueil" },
  { value: "races", label: "Races" },
  { value: "arts", label: "Arts Martiaux" },
  { value: "bestiary", label: "Bestiaire" },
  { value: "cosmology", label: "Cosmologie" },
  { value: "artefacts", label: "Artéfacts" },
  { value: "factions", label: "Factions" },
  { value: "kingdoms", label: "Royaumes" },
  { value: "technologie", label: "Technologie" },
  { value: "shop", label: "Boutique" },
  { value: "profile", label: "Profil" },
  { value: "news", label: "Nouvelles" },
  { value: "custom", label: "Page Personnalisée" },
];

const DEFAULT_MENU_ITEMS = [
  { id: "nav-home", label: "Accueil", icon: "Home", pageId: "home", sortOrder: 0, active: true },
  { id: "nav-races", label: "Races", icon: "Users", pageId: "races", sortOrder: 1, active: true },
  { id: "nav-arts", label: "Arts", icon: "Swords", pageId: "arts", sortOrder: 2, active: true },
  { id: "nav-bestiary", label: "Bestiaire", icon: "BookOpen", pageId: "bestiary", sortOrder: 3, active: true },
  { id: "nav-cosmology", label: "Cosmologie", icon: "Star", pageId: "cosmology", sortOrder: 4, active: true },
  { id: "nav-geography", label: "Géographie", icon: "Map", pageId: "geography", sortOrder: 5, active: true },
  { id: "nav-factions", label: "Factions", icon: "Shield", pageId: "factions", sortOrder: 6, active: true },
  { id: "nav-shop", label: "Boutique", icon: "ShoppingBag", pageId: "shop", sortOrder: 7, active: true },
  { id: "nav-bot", label: "Bot", icon: "Gamepad2", pageId: "bot", sortOrder: 8, active: true },
  { id: "nav-news", label: "Nouvelles", icon: "Newspaper", pageId: "news", sortOrder: 9, active: true },
  { id: "nav-profile", label: "Profil", icon: "Star", pageId: "profile", sortOrder: 10, active: true },
  { id: "nav-admin", label: "Admin", icon: "Settings", pageId: "admin", sortOrder: 11, active: true },
];

/* ============================================================
   Sub-components
   ============================================================ */

function AccessDenied() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className={`${glassCard} p-10 sm:p-14 max-w-md w-full text-center`}>
        <Shield
          className="w-12 h-12 mx-auto mb-6"
          style={{ color: GOLD }}
        />
        <h1
          className="text-xl sm:text-2xl tracking-[0.15em] uppercase mb-3"
          style={{
            color: GOLD,
            textShadow: "0 0 20px rgba(201,168,76,0.4)",
          }}
        >
          NON AUTORISÉ
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "#A3A3A3" }}
        >
          Vous n&apos;avez pas les permissions nécessaires pour accéder au
          panneau CMS.
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="w-64 bg-black/40 border-r border-white/10 p-4 space-y-4 animate-pulse hidden lg:block">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded-lg" />
        ))}
      </div>
      <div className="flex-1 p-8 space-y-6 animate-pulse">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

/* ============================================================
   Color Picker Component
   ============================================================ */

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <Label
        className="text-sm shrink-0 min-w-[180px]"
        style={{ color: "#E5E5E5" }}
      >
        {label}
      </Label>
      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="relative">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/20 bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
          />
        </div>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 h-9 bg-white/5 border-white/20 text-xs"
          style={{ color: "#E5E5E5" }}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

/* ============================================================
   Main Component
   ============================================================ */

export default function CMSPage() {
  const { data: session, status } = useSession();

  // UI state
  const [activeSection, setActiveSection] = useState<SectionId>("visual");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Data state
  const [config, setConfig] = useState<ConfigEntry[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [images, setImages] = useState<IllustrationImage[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Edit states
  const [editedVisual, setEditedVisual] = useState<Record<string, string>>({});
  const [editedRanks, setEditedRanks] = useState<Record<string, { color: string; label: string }>>({});
  const [editedRarities, setEditedRarities] = useState<Record<string, { color: string; emoji: string; name: string }>>({});
  const [editedElements, setEditedElements] = useState<Record<string, { color: string; emoji: string; name: string }>>({});
  const [editedBadges, setEditedBadges] = useState<Record<string, { color: string; label: string; emoji: string }>>({});
  const [editedAI, setEditedAI] = useState<Record<string, string>>({});
  const [editedNotifications, setEditedNotifications] = useState<Record<string, string>>({});
  const [editedRoles, setEditedRoles] = useState<Record<string, { label: string; color: string }>>({});
  const [editedEmbeds, setEditedEmbeds] = useState<Record<string, string>>({});

  // Prompt/Keyword form states
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [promptForm, setPromptForm] = useState<Omit<Prompt, "id">>({
    name: "", label: "", description: "", category: "character",
    template: "", variables: "{}", active: true,
  });

  const [showKeywordForm, setShowKeywordForm] = useState(false);
  const [keywordForm, setKeywordForm] = useState<Omit<Keyword, "id">>({
    keyword: "", category: "fantasy", weight: 1, active: true,
  });

  // Illustration form
  const [showIllustForm, setShowIllustForm] = useState(false);
  const [illustForm, setIllustForm] = useState({
    name: "", element: "", rank: "", style: "", customPrompt: "", size: "1024x1024",
  });
  const [generatingIllust, setGeneratingIllust] = useState(false);
  const [expandedImage, setExpandedImage] = useState<IllustrationImage | null>(null);

  // Page Builder state
  const [builderPageId, setBuilderPageId] = useState("home");
  const [pageBlocks, setPageBlocks] = useState<{
    id: string; blockType: string; sortOrder: number; content: string; config: string; active: boolean;
  }[]>([]);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState<{ content: string; config: string }>({ content: "{}", config: "{}" });

  // Menu state
  const [menuItems, setMenuItems] = useState<typeof DEFAULT_MENU_ITEMS>(DEFAULT_MENU_ITEMS);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  /* ----------------------------------------------------------
     Helpers (must be before any early return to satisfy rules-of-hooks)
     ---------------------------------------------------------- */

  const discordId =
    (session?.user as Record<string, unknown>)?.discordId ??
    (session?.user as Record<string, unknown>)?.id ??
    "";

  const getConfigValue = useCallback(
    (key: string, defaultValue = ""): string => {
      const entry = config.find((c) => c.key === key);
      return entry?.value ?? defaultValue;
    },
    [config]
  );

  const getConfigByGroup = useCallback(
    (group: string): ConfigEntry[] => {
      return config.filter((c) => c.group === group);
    },
    [config]
  );

  /* ----------------------------------------------------------
     Data Loading
     ---------------------------------------------------------- */

  const loadAllData = useCallback(async () => {
    try {
      const [configRes, promptsRes, keywordsRes, imagesRes, menusRes] = await Promise.allSettled([
        fetch("/api/admin/cms/config"),
        fetch("/api/admin/cms/prompts"),
        fetch("/api/admin/cms/keywords"),
        fetch("/api/illustrate/gallery"),
        fetch("/api/admin/cms/menus"),
      ]);

      if (configRes.status === "fulfilled" && configRes.value.ok) {
        const data = await configRes.value.json();
        const cfg: ConfigEntry[] = Array.isArray(data) ? data : data.config ?? data.entries ?? Object.values(data).flat() ?? [];
        setConfig(cfg);

        // Populate edit states from config
        const vis: Record<string, string> = {};
        const ranks: Record<string, { color: string; label: string }> = {};
        const rars: Record<string, { color: string; emoji: string; name: string }> = {};
        const elems: Record<string, { color: string; emoji: string; name: string }> = {};
        const badges: Record<string, { color: string; label: string; emoji: string }> = {};
        const ai: Record<string, string> = {};
        const notifs: Record<string, string> = {};
        const roles: Record<string, { label: string; color: string }> = {};
        const embeds: Record<string, string> = {};

        cfg.forEach((entry: ConfigEntry) => {
          const k = entry.key;
          const v = entry.value;
          if (k.startsWith("color_") || k.startsWith("visual_")) vis[k] = v;
          if (k.startsWith("rank_")) {
            if (k.endsWith("_color")) {
              const rk = k.replace("_color", "");
              if (!ranks[rk]) ranks[rk] = { color: v, label: "" };
              else ranks[rk].color = v;
            }
            if (k.endsWith("_label")) {
              const rk = k.replace("_label", "");
              if (!ranks[rk]) ranks[rk] = { color: "#ffffff", label: v };
              else ranks[rk].label = v;
            }
          }
          if (k.startsWith("rarity_")) {
            const parts = k.split("_");
            if (parts.length >= 3) {
              const rname = parts.slice(1, -1).join("_");
              const prop = parts[parts.length - 1];
              if (prop === "color" || prop === "emoji" || prop === "name") {
                if (!rars[rname]) rars[rname] = { color: "#ffffff", emoji: "", name: rname };
                (rars[rname] as Record<string, string>)[prop] = v;
              }
            }
          }
          if (k.startsWith("element_")) {
            const parts = k.split("_");
            if (parts.length >= 3) {
              const ename = parts.slice(1, -1).join("_");
              const prop = parts[parts.length - 1];
              if (prop === "color" || prop === "emoji" || prop === "name") {
                if (!elems[ename]) elems[ename] = { color: "#ffffff", emoji: "", name: ename };
                (elems[ename] as Record<string, string>)[prop] = v;
              }
            }
          }
          if (k.startsWith("badge_")) {
            const parts = k.split("_");
            if (parts.length >= 3) {
              const bname = parts.slice(1, -1).join("_");
              const prop = parts[parts.length - 1];
              if (prop === "color" || prop === "label" || prop === "emoji") {
                if (!badges[bname]) badges[bname] = { color: "#ffffff", label: "", emoji: "" };
                (badges[bname] as Record<string, string>)[prop] = v;
              }
            }
          }
          if (k.startsWith("ai_")) ai[k] = v;
          if (k.startsWith("notif_") || k.startsWith("notification_") || k.startsWith("sha_")) notifs[k] = v;
          if (k.startsWith("role_")) {
            if (k.endsWith("_color")) {
              const rk = k.replace("_color", "");
              if (!roles[rk]) roles[rk] = { color: v, label: "" };
              else roles[rk].color = v;
            }
            if (k.endsWith("_label")) {
              const rk = k.replace("_label", "");
              if (!roles[rk]) roles[rk] = { color: "#ffffff", label: v };
              else roles[rk].label = v;
            }
          }
          if (k.startsWith("embed_")) embeds[k] = v;
        });

        setEditedVisual(vis);
        setEditedRanks(ranks);
        setEditedRarities(rars);
        setEditedElements(elems);
        setEditedBadges(badges);
        setEditedAI(ai);
        setEditedNotifications(notifs);
        setEditedRoles(roles);
        setEditedEmbeds(embeds);
      }

      if (promptsRes.status === "fulfilled" && promptsRes.value.ok) {
        const data = await promptsRes.value.json();
        setPrompts(Array.isArray(data) ? data : data.prompts ?? []);
      }

      if (keywordsRes.status === "fulfilled" && keywordsRes.value.ok) {
        const data = await keywordsRes.value.json();
        setKeywords(Array.isArray(data) ? data : data.keywords ?? []);
      }

      if (imagesRes.status === "fulfilled" && imagesRes.value.ok) {
        const data = await imagesRes.value.json();
        setImages(Array.isArray(data) ? data : data.images ?? data.gallery ?? []);
      }

      if (menusRes.status === "fulfilled" && menusRes.value.ok) {
        const data = await menusRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
        }
      }
    } catch (err) {
      console.error("Failed to load CMS data:", err);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  /* ----------------------------------------------------------
     Save Config
     ---------------------------------------------------------- */

  const saveConfigGroup = useCallback(
    async (group: string, entries: { key: string; value: string }[]) => {
      setSavingSection(group);
      try {
        const res = await fetch("/api/admin/cms/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group, entries }),
        });
        if (!res.ok) throw new Error("Save failed");
        toast.success(`Configuration "${group}" sauvegardée`);
        await loadAllData();
      } catch {
        toast.error(`Erreur lors de la sauvegarde de "${group}"`);
      } finally {
        setSavingSection(null);
      }
    },
    [loadAllData]
  );

  /* ----------------------------------------------------------
     Seed
     ---------------------------------------------------------- */

  const handleSeedConfig = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/cms/seed", { method: "POST" });
      if (!res.ok) throw new Error("Seed failed");
      toast.success("Configurations par défaut injectées");
      await loadAllData();
    } catch {
      toast.error("Erreur lors du seeding");
    } finally {
      setSeeding(false);
    }
  };

  const handleSeedKeywords = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/cms/keywords/seed", { method: "POST" });
      if (!res.ok) throw new Error("Seed failed");
      toast.success("Mots-clés par défaut injectés");
      await loadAllData();
    } catch {
      toast.error("Erreur lors du seeding des mots-clés");
    } finally {
      setSeeding(false);
    }
  };

  /* ----------------------------------------------------------
     Prompt CRUD
     ---------------------------------------------------------- */

  const savePrompt = async () => {
    try {
      const isEdit = !!editingPrompt?.id;
      const res = await fetch("/api/admin/cms/prompts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editingPrompt.id, ...promptForm } : promptForm),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(isEdit ? "Prompt mis à jour" : "Prompt créé");
      setShowPromptForm(false);
      setEditingPrompt(null);
      setPromptForm({ name: "", label: "", description: "", category: "character", template: "", variables: "{}", active: true });
      await loadAllData();
    } catch {
      toast.error("Erreur lors de la sauvegarde du prompt");
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const res = await fetch("/api/admin/cms/prompts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Prompt supprimé");
      await loadAllData();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const startEditPrompt = (p: Prompt) => {
    setEditingPrompt(p);
    setPromptForm({
      name: p.name, label: p.label, description: p.description,
      category: p.category, template: p.template, variables: p.variables, active: p.active,
    });
    setShowPromptForm(true);
  };

  /* ----------------------------------------------------------
     Keyword CRUD
     ---------------------------------------------------------- */

  const saveKeyword = async () => {
    try {
      const res = await fetch("/api/admin/cms/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keywordForm),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Mot-clé ajouté");
      setShowKeywordForm(false);
      setKeywordForm({ keyword: "", category: "fantasy", weight: 1, active: true });
      await loadAllData();
    } catch {
      toast.error("Erreur lors de l'ajout du mot-clé");
    }
  };

  const deleteKeyword = async (id: string) => {
    try {
      const res = await fetch("/api/admin/cms/keywords", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Mot-clé supprimé");
      await loadAllData();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  /* ----------------------------------------------------------
     Illustration Generation
     ---------------------------------------------------------- */

  const deleteImage = async (id: string) => {
    try {
      const res = await fetch("/api/illustrate/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Image supprimée");
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (expandedImage?.id === id) setExpandedImage(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const generateIllustration = async () => {
    setGeneratingIllust(true);
    try {
      const res = await fetch("/api/illustrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(illustForm),
      });
      if (!res.ok) throw new Error("Generation failed");
      toast.success("Illustration générée");
      setShowIllustForm(false);
      setIllustForm({ name: "", element: "", rank: "", style: "", customPrompt: "", size: "1024x1024" });
      await loadAllData();
    } catch {
      toast.error("Erreur lors de la génération");
    } finally {
      setGeneratingIllust(false);
    }
  };

  /* ----------------------------------------------------------
     Section Renderers
     ---------------------------------------------------------- */

  const groupedKeywords = useMemo(() => {
    const groups: Record<string, Keyword[]> = {};
    keywords.forEach((kw) => {
      const cat = kw.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(kw);
    });
    return groups;
  }, [keywords]);

  const groupedPrompts = useMemo(() => {
    const groups: Record<string, Prompt[]> = {};
    prompts.forEach((p) => {
      const cat = p.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [prompts]);

  /* ----------------------------------------------------------
     Page Builder Hooks (must be before any early return)
     ---------------------------------------------------------- */

  const loadPageBlocks = useCallback(async (pageId: string) => {
    try {
      const res = await fetch(`/api/admin/cms/pages?pageId=${pageId}`);
      if (res.ok) {
        const data = await res.json();
        setPageBlocks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load page blocks:", err);
    }
  }, []);

  useEffect(() => {
    if (dataLoaded && activeSection === "builder") {
      loadPageBlocks(builderPageId);
    }
  }, [dataLoaded, activeSection, builderPageId, loadPageBlocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* ----------------------------------------------------------
     Auth Guard
     ---------------------------------------------------------- */

  if (status === "loading") {
    return <LoadingSkeleton />;
  }

  if (discordId !== ADMIN_DISCORD_ID) {
    return <AccessDenied />;
  }

  /* ----------------------------------------------------------
     Section Renderers
     ---------------------------------------------------------- */

  const renderVisualSection = () => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-4" style={{ color: "#E5E5E5" }}>
        Couleurs & Esthétique
      </h3>
      {VISUAL_FIELDS.map((field) => (
        <ColorPicker
          key={field.key}
          label={field.label}
          value={editedVisual[field.key] ?? getConfigValue(field.key)}
          onChange={(val) => setEditedVisual((prev) => ({ ...prev, [field.key]: val }))}
        />
      ))}
      <div className="pt-4">
        <Button
          className={goldButton}
          onClick={() => {
            const entries = VISUAL_FIELDS.map((f) => ({
              key: f.key,
              value: editedVisual[f.key] ?? getConfigValue(f.key),
            }));
            saveConfigGroup("visual", entries);
          }}
          disabled={savingSection === "visual"}
        >
          {savingSection === "visual" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Sauvegarder
        </Button>
      </div>
    </div>
  );

  const renderRanksSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
        Rangs & Niveaux
      </h3>
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "#A3A3A3" }}>Rang</th>
              <th className="text-left p-3 font-medium" style={{ color: "#A3A3A3" }}>Couleur</th>
              <th className="text-left p-3 font-medium" style={{ color: "#A3A3A3" }}>Label</th>
            </tr>
          </thead>
          <tbody>
            {RANK_ROWS.map(({ rank }) => {
              const current = editedRanks[rank] ?? {
                color: getConfigValue(`rank_${rank}_color`, "#ffffff"),
                label: getConfigValue(`rank_${rank}_label`, ""),
              };
              return (
                <tr key={rank} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    <Badge variant="outline" className="border-white/20 font-mono text-base px-3 py-1" style={{ color: current.color, borderColor: current.color }}>
                      {rank}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={current.color}
                        onChange={(e) =>
                          setEditedRanks((prev) => ({
                            ...prev,
                            [rank]: { ...current, color: e.target.value },
                          }))
                        }
                        className="w-8 h-8 rounded cursor-pointer border border-white/20 bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0"
                      />
                      <Input
                        value={current.color}
                        onChange={(e) =>
                          setEditedRanks((prev) => ({
                            ...prev,
                            [rank]: { ...current, color: e.target.value },
                          }))
                        }
                        className="w-28 h-8 bg-white/5 border-white/20 text-xs"
                        style={{ color: "#E5E5E5" }}
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <Input
                      value={current.label}
                      onChange={(e) =>
                        setEditedRanks((prev) => ({
                          ...prev,
                          [rank]: { ...current, label: e.target.value },
                        }))
                      }
                      className="h-8 bg-white/5 border-white/20 text-xs"
                      style={{ color: "#E5E5E5" }}
                      placeholder="Label du rang..."
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button
        className={goldButton}
        onClick={() => {
          const entries = RANK_ROWS.flatMap(({ rank }) => {
            const r = editedRanks[rank];
            if (!r) return [];
            return [
              { key: `rank_${rank}_color`, value: r.color },
              { key: `rank_${rank}_label`, value: r.label },
            ];
          });
          saveConfigGroup("ranks", entries);
        }}
        disabled={savingSection === "ranks"}
      >
        {savingSection === "ranks" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Sauvegarder tous les rangs
      </Button>
    </div>
  );

  const renderTableSection = (
    title: string,
    group: string,
    data: Record<string, Record<string, string>>,
    setData: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>,
    columns: { key: string; label: string; type: "color" | "text" }[]
  ) => {
    const entries = Object.entries(data);
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>{title}</h3>
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                {columns.map((col) => (
                  <th key={col.key} className="text-left p-3 font-medium" style={{ color: "#A3A3A3" }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(([id, row]) => (
                <tr key={id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="p-3">
                      {col.type === "color" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={row[col.key] || "#ffffff"}
                            onChange={(e) =>
                              setData((prev) => ({
                                ...prev,
                                [id]: { ...prev[id], [col.key]: e.target.value },
                              }))
                            }
                            className="w-8 h-8 rounded cursor-pointer border border-white/20 bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0"
                          />
                          <Input
                            value={row[col.key] || ""}
                            onChange={(e) =>
                              setData((prev) => ({
                                ...prev,
                                [id]: { ...prev[id], [col.key]: e.target.value },
                              }))
                            }
                            className="w-28 h-8 bg-white/5 border-white/20 text-xs"
                            style={{ color: "#E5E5E5" }}
                          />
                        </div>
                      ) : (
                        <Input
                          value={row[col.key] || ""}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              [id]: { ...prev[id], [col.key]: e.target.value },
                            }))
                          }
                          className="h-8 bg-white/5 border-white/20 text-xs"
                          style={{ color: "#E5E5E5" }}
                          placeholder="..."
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="p-6 text-center" style={{ color: "#A3A3A3" }}>
                    Aucune donnée. Utilisez le bouton Seeder pour charger les valeurs par défaut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Button
          className={goldButton}
          onClick={() => {
            const flat = Object.entries(data).flatMap(([id, row]) =>
              columns.map((col) => ({ key: `${group}_${id}_${col.key}`, value: row[col.key] || "" }))
            );
            saveConfigGroup(group, flat);
          }}
          disabled={savingSection === group}
        >
          {savingSection === group ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Sauvegarder
        </Button>
      </div>
    );
  };

  const renderRaritiesSection = () =>
    renderTableSection(
      "Raretés",
      "rarity",
      editedRarities,
      setEditedRarities,
      [
        { key: "name", label: "Rareté", type: "text" },
        { key: "color", label: "Couleur", type: "color" },
        { key: "emoji", label: "Emoji", type: "text" },
      ]
    );

  const renderElementsSection = () =>
    renderTableSection(
      "Éléments",
      "element",
      editedElements,
      setEditedElements,
      [
        { key: "name", label: "Élément", type: "text" },
        { key: "color", label: "Couleur", type: "color" },
        { key: "emoji", label: "Emoji", type: "text" },
      ]
    );

  const renderBadgesSection = () =>
    renderTableSection(
      "Badges de Statut",
      "badge",
      editedBadges,
      setEditedBadges,
      [
        { key: "label", label: "Statut", type: "text" },
        { key: "color", label: "Couleur", type: "color" },
        { key: "emoji", label: "Emoji", type: "text" },
      ]
    );

  const renderAISection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
        Configuration IA
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>Modèle de texte</Label>
          <Input
            value={editedAI["ai_model"] ?? getConfigValue("ai_model", "")}
            onChange={(e) => setEditedAI((p) => ({ ...p, ai_model: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="gpt-4, claude-3, etc."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>Modèle d&apos;illustration</Label>
          <Input
            value={editedAI["ai_image_model"] ?? getConfigValue("ai_image_model", "")}
            onChange={(e) => setEditedAI((p) => ({ ...p, ai_image_model: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="dall-e-3, stable-diffusion, etc."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm" style={{ color: "#E5E5E5" }}>Température</Label>
            <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>
              {editedAI["ai_temperature"] ?? getConfigValue("ai_temperature", "0.7")}
            </span>
          </div>
          <Slider
            value={[parseFloat(editedAI["ai_temperature"] ?? getConfigValue("ai_temperature", "0.7"))]}
            onValueChange={([val]) => setEditedAI((p) => ({ ...p, ai_temperature: String(val) }))}
            min={0}
            max={2}
            step={0.1}
            className="py-2"
          />
          <div className="flex justify-between text-xs" style={{ color: "#A3A3A3" }}>
            <span>0 (Déterministe)</span>
            <span>2 (Créatif)</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <Label className="text-sm" style={{ color: "#E5E5E5" }}>Illustration automatique</Label>
            <p className="text-xs mt-0.5" style={{ color: "#A3A3A3" }}>Générer automatiquement des illustrations avec le contenu</p>
          </div>
          <Switch
            checked={(editedAI["ai_auto_illustrate"] ?? getConfigValue("ai_auto_illustrate", "false")) === "true"}
            onCheckedChange={(checked) => setEditedAI((p) => ({ ...p, ai_auto_illustrate: String(checked) }))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>Taille d&apos;illustration par défaut</Label>
          <Select
            value={editedAI["ai_illustration_size"] ?? getConfigValue("ai_illustration_size", "1024x1024")}
            onValueChange={(val) => setEditedAI((p) => ({ ...p, ai_illustration_size: val }))}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-sm h-10" style={{ color: "#E5E5E5" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ILLUSTRATION_SIZES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>Max tokens de réponse</Label>
          <Input
            value={editedAI["ai_max_tokens"] ?? getConfigValue("ai_max_tokens", "2048")}
            onChange={(e) => setEditedAI((p) => ({ ...p, ai_max_tokens: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            type="number"
          />
        </div>
      </div>

      <Button
        className={goldButton}
        onClick={() => saveConfigGroup("ai", Object.entries(editedAI).map(([key, value]) => ({ key, value })))}
        disabled={savingSection === "ai"}
      >
        {savingSection === "ai" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Sauvegarder
      </Button>
    </div>
  );

  const renderPromptsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
          Templates de Prompts
        </h3>
        <Button className={goldButton} onClick={() => { setEditingPrompt(null); setPromptForm({ name: "", label: "", description: "", category: "character", template: "", variables: "{}", active: true }); setShowPromptForm(!showPromptForm); }}>
          <Plus className="w-4 h-4 mr-2" />
          Créer un prompt
        </Button>
      </div>

      {/* Inline Form */}
      {showPromptForm && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm" style={{ color: "#C9A84C" }}>
              {editingPrompt ? "Modifier le prompt" : "Nouveau prompt"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Nom (identifiant)</Label>
                <Input value={promptForm.name} onChange={(e) => setPromptForm((p) => ({ ...p, name: e.target.value }))} className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }} placeholder="nom_du_prompt" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Label affiché</Label>
                <Input value={promptForm.label} onChange={(e) => setPromptForm((p) => ({ ...p, label: e.target.value }))} className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }} placeholder="Nom lisible" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Catégorie</Label>
                <Select value={promptForm.category} onValueChange={(val) => setPromptForm((p) => ({ ...p, category: val }))}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMPT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Description</Label>
                <Input value={promptForm.description} onChange={(e) => setPromptForm((p) => ({ ...p, description: e.target.value }))} className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }} placeholder="Description courte" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Template</Label>
                <span className="text-xs italic" style={{ color: "#C9A84C" }}>Utilisez {`{{variable}}`} pour les variables dynamiques</span>
              </div>
              <Textarea
                value={promptForm.template}
                onChange={(e) => setPromptForm((p) => ({ ...p, template: e.target.value }))}
                className="bg-white/5 border-white/20 text-sm min-h-[120px] font-mono"
                style={{ color: "#E5E5E5" }}
                placeholder="Écrivez un personnage nommé {{name}} de rang {{rank}}..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "#A3A3A3" }}>Variables (JSON)</Label>
              <Textarea
                value={promptForm.variables}
                onChange={(e) => setPromptForm((p) => ({ ...p, variables: e.target.value }))}
                className="bg-white/5 border-white/20 text-sm min-h-[80px] font-mono"
                style={{ color: "#E5E5E5" }}
                placeholder='{"name": "string", "rank": "string"}'
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={promptForm.active} onCheckedChange={(checked) => setPromptForm((p) => ({ ...p, active: checked }))} />
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Actif</Label>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button variant="ghost" className="text-xs" style={{ color: "#A3A3A3" }} onClick={() => setShowPromptForm(false)}>
                  Annuler
                </Button>
                <Button className={goldButton} onClick={savePrompt} disabled={!promptForm.name || !promptForm.template}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {editingPrompt ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt Cards Grouped by Category */}
      {Object.entries(groupedPrompts).map(([category, cats]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium uppercase tracking-wider" style={{ color: "#C9A84C" }}>
            {category}
          </h4>
          <div className="space-y-2">
            {cats.map((p) => (
              <Card key={p.id ?? p.name} className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium" style={{ color: "#E5E5E5" }}>{p.label || p.name}</span>
                        <Badge variant="outline" className="text-xs border-white/20" style={{ color: "#A3A3A3" }}>{p.category}</Badge>
                        <Switch checked={p.active} className="scale-75" onCheckedChange={async (checked) => {
                          try {
                            await fetch("/api/admin/cms/prompts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, ...p, active: checked }) });
                            toast.success(p.active ? "Prompt désactivé" : "Prompt activé");
                            await loadAllData();
                          } catch { toast.error("Erreur"); }
                        }} />
                      </div>
                      {p.description && <p className="text-xs mb-1" style={{ color: "#A3A3A3" }}>{p.description}</p>}
                      <p className="text-xs font-mono truncate" style={{ color: "#666" }}>{p.template}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10" onClick={() => startEditPrompt(p)}>
                        <Pencil className="w-3.5 h-3.5" style={{ color: "#A3A3A3" }} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/20" onClick={() => deletePrompt(p.id!)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {prompts.length === 0 && !showPromptForm && (
        <div className="text-center py-12" style={{ color: "#A3A3A3" }}>
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun prompt. Créez-en un pour commencer.</p>
        </div>
      )}
    </div>
  );

  const renderKeywordsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
          Bibliothèque de Mots-clés Pinterest
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 text-xs" style={{ color: "#A3A3A3" }} onClick={handleSeedKeywords} disabled={seeding}>
            {seeding ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1.5" />}
            Seeder les mots-clés par défaut
          </Button>
          <Button className={goldButton} onClick={() => { setKeywordForm({ keyword: "", category: "fantasy", weight: 1, active: true }); setShowKeywordForm(!showKeywordForm); }}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Inline Form */}
      {showKeywordForm && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Mot-clé</Label>
                <Input value={keywordForm.keyword} onChange={(e) => setKeywordForm((p) => ({ ...p, keyword: e.target.value }))} className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }} placeholder="mot-clé..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Catégorie</Label>
                <Select value={keywordForm.category} onValueChange={(val) => setKeywordForm((p) => ({ ...p, category: val }))}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KEYWORD_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Poids</Label>
                <Input value={String(keywordForm.weight)} onChange={(e) => setKeywordForm((p) => ({ ...p, weight: Number(e.target.value) || 0 }))} className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }} type="number" min={0} />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="text-xs" style={{ color: "#A3A3A3" }} onClick={() => setShowKeywordForm(false)}>Annuler</Button>
                <Button className={goldButton} onClick={saveKeyword} disabled={!keywordForm.keyword}>Ajouter</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyword Grid Grouped */}
      {Object.entries(groupedKeywords).map(([category, cats]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium uppercase tracking-wider" style={{ color: "#C9A84C" }}>
            {category} <span className="font-normal" style={{ color: "#666" }}>({cats.length})</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {cats.map((kw) => (
              <Card key={kw.id ?? kw.keyword} className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Key className="w-3.5 h-3.5 shrink-0" style={{ color: "#C9A84C" }} />
                      <span className="text-sm truncate" style={{ color: "#E5E5E5" }}>{kw.keyword}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-xs border-white/10 px-1.5 py-0" style={{ color: "#A3A3A3" }}>{kw.weight}</Badge>
                      <Switch checked={kw.active} className="scale-[0.6]" onCheckedChange={async (checked) => {
                        try {
                          await fetch("/api/admin/cms/keywords", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: kw.id, ...kw, active: checked }) });
                          await loadAllData();
                        } catch { toast.error("Erreur"); }
                      }} />
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-500/20" onClick={() => deleteKeyword(kw.id!)}>
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {keywords.length === 0 && !showKeywordForm && (
        <div className="text-center py-12" style={{ color: "#A3A3A3" }}>
          <Key className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun mot-clé. Ajoutez-en ou utilisez le seeder.</p>
        </div>
      )}
    </div>
  );

  const renderIllustrationsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
          Galerie d&apos;Illustrations
        </h3>
        <Button className={goldButton} onClick={() => { setIllustForm({ name: "", element: "", rank: "", style: "", customPrompt: "", size: "1024x1024" }); setShowIllustForm(!showIllustForm); }}>
          <Sparkles className="w-4 h-4 mr-2" />
          Générer une illustration
        </Button>
      </div>

      {/* Generation Form */}
      {showIllustForm && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm" style={{ color: "#C9A84C" }}>Générer une illustration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Nom</Label>
                <Input value={illustForm.name} onChange={(e) => setIllustForm((p) => ({ ...p, name: e.target.value }))} className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }} placeholder="Nom de l'illustration" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Élément</Label>
                <Input value={illustForm.element} onChange={(e) => setIllustForm((p) => ({ ...p, element: e.target.value }))} className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }} placeholder="feu, eau, etc." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Rang</Label>
                <Select value={illustForm.rank} onValueChange={(val) => setIllustForm((p) => ({ ...p, rank: val }))}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {RANK_ROWS.map((r) => (
                      <SelectItem key={r.rank} value={r.rank}>{r.rank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: "#A3A3A3" }}>Style</Label>
                <Input value={illustForm.style} onChange={(e) => setIllustForm((p) => ({ ...p, style: e.target.value }))} className="bg-white/5 border-white/20 text-sm h-9" style={{ color: "#E5E5E5" }} placeholder="fantasy, anime, realistic..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "#A3A3A3" }}>Prompt personnalisé</Label>
              <Textarea value={illustForm.customPrompt} onChange={(e) => setIllustForm((p) => ({ ...p, customPrompt: e.target.value }))} className="bg-white/5 border-white/20 text-sm min-h-[80px]" style={{ color: "#E5E5E5" }} placeholder="Description détaillée de l'image souhaitée..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "#A3A3A3" }}>Taille</Label>
              <Select value={illustForm.size} onValueChange={(val) => setIllustForm((p) => ({ ...p, size: val }))}>
                <SelectTrigger className="bg-white/5 border-white/20 text-sm h-9 w-48" style={{ color: "#E5E5E5" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ILLUSTRATION_SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-xs" style={{ color: "#A3A3A3" }} onClick={() => setShowIllustForm(false)}>Annuler</Button>
              <Button className={goldButton} onClick={generateIllustration} disabled={generatingIllust || !illustForm.name}>
                {generatingIllust ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Générer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img) => (
          <Card key={img.id} className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] transition-all cursor-pointer group overflow-hidden" onClick={() => setExpandedImage(img)}>
            <div className="aspect-square bg-black/40 relative overflow-hidden">
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <Eye className="w-4 h-4 text-white/70" />
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium truncate mb-1" style={{ color: "#E5E5E5" }}>{img.name}</p>
              <p className="text-xs font-mono truncate mb-1.5" style={{ color: "#666" }}>{img.prompt}</p>
              <div className="flex items-center justify-between">
                {img.category && (
                  <Badge variant="outline" className="text-xs border-white/10 px-1.5 py-0" style={{ color: "#A3A3A3" }}>{img.category}</Badge>
                )}
                {img.createdAt && (
                  <span className="text-xs" style={{ color: "#666" }}>{new Date(img.createdAt).toLocaleDateString("fr-FR")}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && !showIllustForm && (
        <div className="text-center py-12" style={{ color: "#A3A3A3" }}>
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucune illustration. Générez-en une pour commencer.</p>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2 gap-2">
              <Button variant="ghost" className="h-8 px-3 text-xs hover:bg-red-500/20 text-red-400" onClick={() => { if (expandedImage) { deleteImage(expandedImage.id); setExpandedImage(null); } }}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Supprimer
              </Button>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10" onClick={() => setExpandedImage(null)}>
                <X className="w-5 h-5" style={{ color: "#A3A3A3" }} />
              </Button>
            </div>
            {expandedImage.url && (
              <img src={expandedImage.url} alt={expandedImage.name} className="w-full rounded-lg" />
            )}
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>{expandedImage.name}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#A3A3A3" }}>{expandedImage.prompt}</p>
              {expandedImage.category && (
                <Badge variant="outline" className="border-white/20" style={{ color: "#C9A84C" }}>{expandedImage.category}</Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
        Notifications — Sha Pipolino
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>Avatar URL</Label>
          <Input
            value={editedNotifications["sha_avatar_url"] ?? getConfigValue("sha_avatar_url", "")}
            onChange={(e) => setEditedNotifications((p) => ({ ...p, sha_avatar_url: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>Nom du bot</Label>
          <Input
            value={editedNotifications["sha_name"] ?? getConfigValue("sha_name", "Sha Pipolino")}
            onChange={(e) => setEditedNotifications((p) => ({ ...p, sha_name: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="Sha Pipolino"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>Banner URL</Label>
          <Input
            value={editedNotifications["sha_banner_url"] ?? getConfigValue("sha_banner_url", "")}
            onChange={(e) => setEditedNotifications((p) => ({ ...p, sha_banner_url: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>ID du canal de logs</Label>
          <Input
            value={editedNotifications["sha_log_channel_id"] ?? getConfigValue("sha_log_channel_id", "")}
            onChange={(e) => setEditedNotifications((p) => ({ ...p, sha_log_channel_id: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="1234567890..."
          />
        </div>
      </div>

      <Button
        className={goldButton}
        onClick={() => saveConfigGroup("notifications", Object.entries(editedNotifications).map(([key, value]) => ({ key, value })))}
        disabled={savingSection === "notifications"}
      >
        {savingSection === "notifications" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Sauvegarder
      </Button>
    </div>
  );

  const renderRolesSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
        Rôles & Permissions
      </h3>
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "#A3A3A3" }}>Rôle</th>
              <th className="text-left p-3 font-medium" style={{ color: "#A3A3A3" }}>Label</th>
              <th className="text-left p-3 font-medium" style={{ color: "#A3A3A3" }}>Couleur</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(editedRoles).map(([role, data]) => (
              <tr key={role} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-3">
                  <Badge variant="outline" className="border-white/20 px-2 py-0.5 font-mono" style={{ color: data.color, borderColor: data.color }}>
                    {role}
                  </Badge>
                </td>
                <td className="p-3">
                  <Input
                    value={data.label}
                    onChange={(e) => setEditedRoles((prev) => ({ ...prev, [role]: { ...data, label: e.target.value } }))}
                    className="h-8 bg-white/5 border-white/20 text-xs"
                    style={{ color: "#E5E5E5" }}
                    placeholder="Label du rôle..."
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={data.color}
                      onChange={(e) => setEditedRoles((prev) => ({ ...prev, [role]: { ...data, color: e.target.value } }))}
                      className="w-8 h-8 rounded cursor-pointer border border-white/20 bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0"
                    />
                    <Input
                      value={data.color}
                      onChange={(e) => setEditedRoles((prev) => ({ ...prev, [role]: { ...data, color: e.target.value } }))}
                      className="w-28 h-8 bg-white/5 border-white/20 text-xs"
                      style={{ color: "#E5E5E5" }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {Object.keys(editedRoles).length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center" style={{ color: "#A3A3A3" }}>
                  Aucun rôle configuré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Button
        className={goldButton}
        onClick={() => {
          const entries = Object.entries(editedRoles).flatMap(([role, data]) => [
            { key: `role_${role}_label`, value: data.label },
            { key: `role_${role}_color`, value: data.color },
          ]);
          saveConfigGroup("roles", entries);
        }}
        disabled={savingSection === "roles"}
      >
        {savingSection === "roles" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Sauvegarder
      </Button>
    </div>
  );

  const renderEmbedsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
        Embeds Discord par Défaut
      </h3>

      <div className="space-y-4">
        <ColorPicker
          label="Couleur de l'embed"
          value={editedEmbeds["embed_color"] ?? getConfigValue("embed_color", "#C9A84C")}
          onChange={(val) => setEditedEmbeds((p) => ({ ...p, embed_color: val }))}
        />
        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>Texte du footer</Label>
          <Input
            value={editedEmbeds["embed_footer_text"] ?? getConfigValue("embed_footer_text", "")}
            onChange={(e) => setEditedEmbeds((p) => ({ ...p, embed_footer_text: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="Texte affiché en bas des embeds..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>URL de la vignette</Label>
          <Input
            value={editedEmbeds["embed_thumbnail_url"] ?? getConfigValue("embed_thumbnail_url", "")}
            onChange={(e) => setEditedEmbeds((p) => ({ ...p, embed_thumbnail_url: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>URL de l&apos;image</Label>
          <Input
            value={editedEmbeds["embed_image_url"] ?? getConfigValue("embed_image_url", "")}
            onChange={(e) => setEditedEmbeds((p) => ({ ...p, embed_image_url: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm" style={{ color: "#E5E5E5" }}>Nom de l&apos;auteur</Label>
          <Input
            value={editedEmbeds["embed_author_name"] ?? getConfigValue("embed_author_name", "")}
            onChange={(e) => setEditedEmbeds((p) => ({ ...p, embed_author_name: e.target.value }))}
            className="bg-white/5 border-white/20 text-sm h-10"
            style={{ color: "#E5E5E5" }}
            placeholder="Nom de l'auteur..."
          />
        </div>
      </div>

      <Button
        className={goldButton}
        onClick={() => saveConfigGroup("embeds", Object.entries(editedEmbeds).map(([key, value]) => ({ key, value })))}
        disabled={savingSection === "embeds"}
      >
        {savingSection === "embeds" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Sauvegarder
      </Button>
    </div>
  );

  /* ----------------------------------------------------------
     Page Builder Section
     ---------------------------------------------------------- */

  const addBlock = async (blockType: string) => {
    try {
      const defaultContent: Record<string, unknown> = {};
      if (blockType === "hero") { defaultContent.title = "Titre"; defaultContent.subtitle = "Sous-titre"; defaultContent.ctaText = "Bouton"; defaultContent.ctaLink = "#"; }
      if (blockType === "text") { defaultContent.text = "Votre texte ici..."; defaultContent.align = "left"; }
      if (blockType === "image") { defaultContent.url = ""; defaultContent.alt = ""; defaultContent.caption = ""; }
      if (blockType === "separator") { defaultContent.style = "line"; defaultContent.color = "#C9A84C"; }
      if (blockType === "cards") { defaultContent.columns = 3; defaultContent.items = []; }
      if (blockType === "embed") { defaultContent.url = ""; defaultContent.aspectRatio = "16/9"; }
      if (blockType === "spacer") { defaultContent.height = 64; }
      if (blockType === "html") { defaultContent.code = "<div>Contenu HTML</div>"; }

      const res = await fetch("/api/admin/cms/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: builderPageId, blockType, content: JSON.stringify(defaultContent) }),
      });
      if (!res.ok) throw new Error("Create failed");
      toast.success("Bloc ajouté");
      await loadPageBlocks(builderPageId);
    } catch {
      toast.error("Erreur lors de l'ajout du bloc");
    }
  };

  const updateBlock = async (id: string, data: { content?: string; config?: string; active?: boolean }) => {
    try {
      const res = await fetch("/api/admin/cms/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Bloc mis à jour");
      setEditingBlockId(null);
      await loadPageBlocks(builderPageId);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteBlock = async (id: string) => {
    try {
      const res = await fetch("/api/admin/cms/pages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Bloc supprimé");
      await loadPageBlocks(builderPageId);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleBlockDragEnd = async (event: DragEndEvent) => {
    const { active: activeItem, over } = event;
    if (!over || activeItem.id === over.id) return;

    const oldIndex = pageBlocks.findIndex((b) => b.id === activeItem.id);
    const newIndex = pageBlocks.findIndex((b) => b.id === over.id);
    const reordered = [...pageBlocks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    const order = reordered.map((b, i) => ({ id: b.id, sortOrder: i }));
    setPageBlocks(reordered);

    try {
      await fetch("/api/admin/cms/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: builderPageId, order }),
      });
    } catch {
      toast.error("Erreur lors du réordonnancement");
      await loadPageBlocks(builderPageId);
    }
  };

  const SortableBlock = ({ block }: { block: typeof pageBlocks[0] }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined, opacity: isDragging ? 0.8 : 1 };
    const bt = BLOCK_TYPES.find((t) => t.value === block.blockType);
    const content = JSON.parse(block.content || "{}");
    const isEditing = editingBlockId === block.id;

    return (
      <div ref={setNodeRef} style={style} className={`${glassCard} p-4 mb-3 ${isDragging ? "shadow-lg shadow-[#C9A84C]/20" : ""}`}>
        <div className="flex items-start gap-3">
          <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 transition-colors" aria-label="Glisser pour réordonner">
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{bt?.icon}</span>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "#C9A84C" }}>{bt?.label || block.blockType}</span>
              <Badge variant="outline" className="text-[10px] border-white/10 ml-auto" style={{ color: "#666" }}>#{block.sortOrder}</Badge>
              <Switch checked={block.active} className="scale-75" onCheckedChange={async (checked) => { await updateBlock(block.id, { active: checked }); }} />
            </div>

            {/* Preview of content */}
            {!isEditing && (
              <div className="text-xs space-y-1" style={{ color: "#A3A3A3" }}>
                {block.blockType === "hero" && (
                  <p><span style={{ color: "#E5E5E5" }}>{content.title}</span>{content.subtitle ? ` — ${content.subtitle}` : ""}</p>
                )}
                {block.blockType === "text" && <p className="line-clamp-2">{content.text}</p>}
                {block.blockType === "image" && <p>{content.url || "Pas d'image"}</p>}
                {block.blockType === "separator" && <p style={{ color: content.color }}>━ Séparateur ━</p>}
                {block.blockType === "cards" && <p>{content.columns || 3} colonnes</p>}
                {block.blockType === "embed" && <p className="truncate">{content.url || "Pas d'URL"}</p>}
                {block.blockType === "spacer" && <p>{content.height || 64}px de hauteur</p>}
                {block.blockType === "html" && <p className="font-mono truncate">{content.code?.slice(0, 80)}...</p>}
              </div>
            )}

            {/* Edit form */}
            {isEditing && (
              <div className="space-y-3 mt-2">
                <Textarea
                  value={blockForm.content}
                  onChange={(e) => setBlockForm((f) => ({ ...f, content: e.target.value }))}
                  className="bg-white/5 border-white/20 text-xs font-mono min-h-[100px]"
                  style={{ color: "#E5E5E5" }}
                  placeholder="JSON du contenu..."
                />
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-xs h-7" style={{ color: "#A3A3A3" }} onClick={() => setEditingBlockId(null)}>Annuler</Button>
                  <Button className={`${goldButton} h-7 text-[10px]`} onClick={() => updateBlock(block.id, { content: blockForm.content })}>
                    <Save className="w-3 h-3 mr-1" /> Sauvegarder
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {!isEditing && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/10" onClick={() => { setEditingBlockId(block.id); setBlockForm({ content: block.content, config: block.config }); }}>
                <Pencil className="w-3 h-3" style={{ color: "#A3A3A3" }} />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-500/20" onClick={() => deleteBlock(block.id)}>
              <Trash2 className="w-3 h-3 text-red-400" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderBuilderSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
          Constructeur de Pages
        </h3>
        <Select value={builderPageId} onValueChange={(val) => { setBuilderPageId(val); setEditingBlockId(null); }}>
          <SelectTrigger className="bg-white/5 border-white/20 text-sm h-9 w-48" style={{ color: "#E5E5E5" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUILDER_PAGES.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs" style={{ color: "#A3A3A3" }}>
        Ajoutez des blocs et glissez-les pour réordonner. Les blocs désactivés ne sont pas affichés.
      </p>

      {/* Add block buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {BLOCK_TYPES.map((bt) => (
          <Button
            key={bt.value}
            variant="outline"
            className="h-auto py-3 px-2 border-white/10 hover:bg-white/5 hover:border-[#C9A84C]/30 transition-all text-left"
            onClick={() => addBlock(bt.value)}
          >
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="text-lg">{bt.icon}</span>
              <span className="text-[10px] font-medium" style={{ color: "#E5E5E5" }}>{bt.label}</span>
            </div>
          </Button>
        ))}
      </div>

      <Separator className="bg-white/10" />

      {/* Block list with drag-and-drop */}
      {pageBlocks.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
          <SortableContext items={pageBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {pageBlocks.map((block) => (
              <SortableBlock key={block.id} block={block} />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-12" style={{ color: "#A3A3A3" }}>
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun bloc. Cliquez sur un type de bloc ci-dessus pour commencer.</p>
        </div>
      )}
    </div>
  );

  /* ----------------------------------------------------------
     Menus Section
     ---------------------------------------------------------- */

  const saveMenus = async () => {
    setSavingSection("menus");
    try {
      const res = await fetch("/api/admin/cms/menus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: menuItems }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Menus sauvegardés");
    } catch {
      toast.error("Erreur lors de la sauvegarde des menus");
    } finally {
      setSavingSection(null);
    }
  };

  const addMenuItem = () => {
    const newItem = {
      id: `nav-custom-${Date.now()}`,
      label: "Nouveau",
      icon: "Link",
      pageId: "",
      url: "",
      sortOrder: menuItems.length,
      active: true,
    };
    setMenuItems((prev) => [...prev, newItem]);
    setEditingMenuId(newItem.id);
  };

  const removeMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    if (editingMenuId === id) setEditingMenuId(null);
  };

  const moveMenuItem = (index: number, direction: "up" | "down") => {
    const newItems = [...menuItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setMenuItems(newItems.map((item, i) => ({ ...item, sortOrder: i })));
  };

  const renderMenusSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: "#E5E5E5" }}>
          Navigation & Menus
        </h3>
        <div className="flex gap-2">
          <Button className={goldButton} onClick={addMenuItem}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un élément
          </Button>
        </div>
      </div>

      <p className="text-xs" style={{ color: "#A3A3A3" }}>
        Configurez l&apos;ordre et les labels des éléments de navigation. Utilisez les flèches pour réordonner.
      </p>

      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <Card key={item.id} className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    className="p-0.5 hover:bg-white/10 rounded transition-colors disabled:opacity-20"
                    onClick={() => moveMenuItem(index, "up")}
                    disabled={index === 0}
                    aria-label="Monter"
                  >
                    <ArrowUp className="w-3 h-3" style={{ color: "#A3A3A3" }} />
                  </button>
                  <button
                    className="p-0.5 hover:bg-white/10 rounded transition-colors disabled:opacity-20"
                    onClick={() => moveMenuItem(index, "down")}
                    disabled={index === menuItems.length - 1}
                    aria-label="Descendre"
                  >
                    <ArrowDown className="w-3 h-3" style={{ color: "#A3A3A3" }} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  {editingMenuId === item.id ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        value={item.label}
                        onChange={(e) => setMenuItems((prev) => prev.map((m) => m.id === item.id ? { ...m, label: e.target.value } : m))}
                        className="bg-white/5 border-white/20 text-xs h-8"
                        style={{ color: "#E5E5E5" }}
                        placeholder="Label..."
                      />
                      <Input
                        value={item.icon}
                        onChange={(e) => setMenuItems((prev) => prev.map((m) => m.id === item.id ? { ...m, icon: e.target.value } : m))}
                        className="bg-white/5 border-white/20 text-xs h-8"
                        style={{ color: "#E5E5E5" }}
                        placeholder="Icône (lucide name)..."
                      />
                      <Input
                        value={item.pageId || item.url || ""}
                        onChange={(e) => setMenuItems((prev) => prev.map((m) => m.id === item.id ? { ...m, pageId: e.target.value, url: e.target.value } : m))}
                        className="bg-white/5 border-white/20 text-xs h-8"
                        style={{ color: "#E5E5E5" }}
                        placeholder="pageId ou URL..."
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: "#E5E5E5" }}>{item.label}</span>
                      <Badge variant="outline" className="text-[10px] border-white/10" style={{ color: "#666" }}>
                        {item.pageId || item.url || "—"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-white/10" style={{ color: "#C9A84C" }}>
                        {item.icon}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={item.active}
                    className="scale-75"
                    onCheckedChange={(checked) => setMenuItems((prev) => prev.map((m) => m.id === item.id ? { ...m, active: checked } : m))}
                  />
                  {editingMenuId === item.id ? (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/10" onClick={() => setEditingMenuId(null)}>
                      <Save className="w-3 h-3" style={{ color: "#22C55E" }} />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/10" onClick={() => setEditingMenuId(item.id)}>
                      <Pencil className="w-3 h-3" style={{ color: "#A3A3A3" }} />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-500/20" onClick={() => removeMenuItem(item.id)}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        className={goldButton}
        onClick={saveMenus}
        disabled={savingSection === "menus"}
      >
        {savingSection === "menus" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Sauvegarder les menus
      </Button>
    </div>
  );

  /* ----------------------------------------------------------
     Section Router
     ---------------------------------------------------------- */

  const renderContent = () => {
    switch (activeSection) {
      case "visual": return renderVisualSection();
      case "ranks": return renderRanksSection();
      case "rarities": return renderRaritiesSection();
      case "elements": return renderElementsSection();
      case "badges": return renderBadgesSection();
      case "ai": return renderAISection();
      case "prompts": return renderPromptsSection();
      case "keywords": return renderKeywordsSection();
      case "illustrations": return renderIllustrationsSection();
      case "notifications": return renderNotificationsSection();
      case "roles": return renderRolesSection();
      case "embeds": return renderEmbedsSection();
      case "builder": return renderBuilderSection();
      case "menus": return renderMenusSection();
      default: return null;
    }
  };

  const activeSectionData = SIDEBAR_SECTIONS.find((s) => s.id === activeSection);

  /* ----------------------------------------------------------
     Render
     ---------------------------------------------------------- */

  if (!dataLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Mobile Hamburger */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-black/60 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {sidebarOpen ? <X className="w-5 h-5" style={{ color: "#E5E5E5" }} /> : <Menu className="w-5 h-5" style={{ color: "#E5E5E5" }} />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.4)", borderRight: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="p-4 pb-2">
          <h2
            className="text-sm font-bold uppercase tracking-[0.15em]"
            style={{
              color: GOLD,
              textShadow: "0 0 20px rgba(201,168,76,0.3)",
            }}
          >
            CMS Builder
          </h2>
          <p className="text-xs mt-1" style={{ color: "#A3A3A3" }}>
            Content Management System
          </p>
        </div>

        <Separator className="bg-white/10" />

        <nav className="flex-1 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,168,76,0.3) transparent" }}>
          <ul className="space-y-1">
            {SIDEBAR_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                      isActive
                        ? "bg-[#C9A84C]/10 text-[#C9A84C]"
                        : "text-[#A3A3A3] hover:text-[#E5E5E5] hover:bg-white/5"
                    }`}
                    style={isActive ? { boxShadow: "inset 3px 0 0 #C9A84C" } : {}}
                  >
                    <span className="text-base shrink-0">{section.emoji}</span>
                    <Icon className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="truncate">{section.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-white/10">
          <Button
            variant="outline"
            className="w-full border-white/20 text-xs hover:bg-white/5 h-9"
            style={{ color: "#A3A3A3" }}
            onClick={handleSeedConfig}
            disabled={seeding}
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1.5" />}
            Seeder les configs par défaut
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="sticky top-0 z-20 px-6 py-4 border-b border-white/10"
          style={{
            backgroundColor: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-3 pl-12 lg:pl-0">
            <span className="text-xl">{activeSectionData?.emoji}</span>
            <div>
              <h1
                className="text-lg font-bold tracking-wider uppercase"
                style={{
                  color: "#E5E5E5",
                  textShadow: "0 0 10px rgba(229,229,229,0.1)",
                }}
              >
                {activeSectionData?.label ?? "CMS"}
              </h1>
              <p className="text-xs" style={{ color: "#A3A3A3" }}>
                Gestion de la configuration du contenu
              </p>
            </div>
          </div>
        </header>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ maxHeight: "calc(100vh - 73px)", scrollbarWidth: "thin", scrollbarColor: "rgba(201,168,76,0.3) transparent" }}>
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}