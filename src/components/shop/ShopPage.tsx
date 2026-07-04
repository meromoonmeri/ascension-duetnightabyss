"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useSession } from "next-auth/react";
import SignInDialog from "@/components/auth/SignInDialog";
import {
  Gem,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Package,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────
interface ShopItem {
  id: string;
  name: string;
  nameJp?: string | null;
  description: string;
  price: number;
  type: string;
  rarity: string;
  imageUrl?: string | null;
  config?: string | null;
  active: boolean;
  maxStock?: number | null;
  totalSold: number;
}

interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  equipped: boolean;
  slot?: string | null;
  shopItem: ShopItem;
}

// ─── Constants ─────────────────────────────────────────────────
const RARITY_COLORS: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  common: {
    text: "#9CA3AF",
    bg: "rgba(156,163,175,0.08)",
    border: "rgba(156,163,175,0.25)",
    glow: "rgba(156,163,175,0.15)",
  },
  rare: {
    text: "#60A5FA",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.3)",
    glow: "rgba(96,165,250,0.2)",
  },
  epic: {
    text: "#C084FC",
    bg: "rgba(192,132,252,0.08)",
    border: "rgba(192,132,252,0.3)",
    glow: "rgba(192,132,252,0.2)",
  },
  legendary: {
    text: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.35)",
    glow: "rgba(245,158,11,0.25)",
  },
  mythic: {
    text: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.35)",
    glow: "rgba(239,68,68,0.25)",
  },
};

const RARITY_LABELS: Record<string, string> = {
  common: "COMMUN",
  rare: "RARE",
  epic: "ÉPIQUE",
  legendary: "LÉGENDAIRE",
  mythic: "MYTHIQUE",
};

const CATEGORY_TABS = [
  { key: "all", label: "Tout" },
  { key: "title_style", label: "Titres" },
  { key: "banner", label: "Bannières" },
  { key: "frame", label: "Cadres" },
  { key: "badge", label: "Badges" },
  { key: "background", label: "Fonds" },
  { key: "effect", label: "Effets" },
] as const;

const RARITY_FILTERS = [
  { key: "all", label: "Tout" },
  { key: "common", label: "Commun" },
  { key: "rare", label: "Rare" },
  { key: "epic", label: "Épique" },
  { key: "legendary", label: "Légendaire" },
  { key: "mythic", label: "Mythique" },
] as const;

const TYPE_LABELS: Record<string, string> = {
  banner: "Bannière",
  frame: "Cadre",
  badge: "Badge",
  background: "Fond de profil",
  effect: "Effet",
  title_style: "Titre",
};

// ─── Toast ─────────────────────────────────────────────────────
interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastIdCounter = 0;

// ─── Helpers ───────────────────────────────────────────────────
function parseConfig(config: string | null | undefined): Record<string, unknown> | null {
  if (!config) return null;
  try {
    return JSON.parse(config);
  } catch {
    return null;
  }
}

function isSoldOut(item: ShopItem): boolean {
  return item.maxStock != null && item.totalSold >= item.maxStock;
}

// ─── Ether Diamond Icon ────────────────────────────────────────
function EtherDiamond({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 20"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 0L16 8L8 20L0 8L8 0Z"
        fill="#A78BFA"
      />
      <path
        d="M8 0L16 8L8 20L0 8L8 0Z"
        fill="url(#ether-grad)"
      />
      <path
        d="M8 2L14 8L8 17L2 8L8 2Z"
        fill="rgba(255,255,255,0.15)"
      />
      <defs>
        <linearGradient id="ether-grad" x1="0" y1="0" x2="16" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4B5FD" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Detail Modal (slide-up panel) ─────────────────────────────
function DetailModal({
  item,
  owned,
  equipped,
  canAfford,
  buyLoading,
  equipLoading,
  inventoryItem,
  onClose,
  onBuyClick,
  onBuyConfirm,
  onBuyCancel,
  onEquip,
  onUnequip,
}: {
  item: ShopItem;
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  buyLoading: boolean;
  equipLoading: boolean;
  inventoryItem?: InventoryItem;
  onClose: () => void;
  onBuyClick: () => void;
  onBuyConfirm: () => void;
  onBuyCancel: () => void;
  onEquip: () => void;
  onUnequip: () => void;
}) {
  const rarityColor = RARITY_COLORS[item.rarity] ?? RARITY_COLORS.common;
  const config = parseConfig(item.config);
  const soldOut = isSoldOut(item);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const ctx = gsap.fromTo(
      panel,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }
    );
    return () => ctx.revert();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-lg sm:rounded-xl rounded-t-2xl overflow-hidden"
        style={{
          background: "rgba(18,18,24,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: `2px solid ${rarityColor.text}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-200 cursor-pointer"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        {/* Preview area */}
        <div className="w-full aspect-video sm:aspect-[16/9] overflow-hidden relative">
          <ItemThumbnail item={item} className="w-full h-full" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(18,18,24,0.95) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="px-5 pb-5 -mt-6 relative z-10">
          {/* Rarity badge + Type */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[0.6rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full font-medium"
              style={{
                color: rarityColor.text,
                background: rarityColor.bg,
                border: `1px solid ${rarityColor.border}`,
              }}
            >
              {RARITY_LABELS[item.rarity]}
            </span>
            <span className="text-[0.65rem] text-gray-500">
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
          </div>

          <h2 className="text-lg tracking-wide mb-1 text-gray-200 font-medium">
            {item.name}
          </h2>
          {item.nameJp && (
            <p className="text-xs mb-3 text-gray-600">{item.nameJp}</p>
          )}

          <p className="text-sm leading-relaxed mb-4 text-gray-400">
            {item.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-5 text-xs text-gray-500">
            <span>{item.totalSold} vendu{item.totalSold > 1 ? "s" : ""}</span>
            {item.maxStock != null && (
              <>
                <span className="text-gray-700">·</span>
                <span>
                  {item.maxStock - item.totalSold} restant
                  {item.maxStock - item.totalSold > 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>

          {/* Price + Action */}
          <div className="flex items-center justify-between">
            <span
              className="text-lg tracking-wider font-semibold flex items-center gap-2"
              style={{
                color: !canAfford && !owned ? "#EF4444" : "#A78BFA",
              }}
            >
              <EtherDiamond className="w-4 h-5" />
              {item.price.toLocaleString("fr-FR")}
            </span>

            {owned ? (
              equipped ? (
                <button
                  onClick={onUnequip}
                  disabled={!!equipLoading}
                  className="text-xs tracking-[0.08em] uppercase px-5 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-gray-200"
                >
                  {equipLoading ? "…" : "Déséquiper"}
                </button>
              ) : (
                <button
                  onClick={onEquip}
                  disabled={!!equipLoading}
                  className="text-xs tracking-[0.08em] uppercase px-5 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer font-semibold"
                  style={{
                    background: "rgba(0,212,255,0.15)",
                    color: "#00D4FF",
                    border: "1px solid rgba(0,212,255,0.3)",
                  }}
                >
                  {equipLoading ? "…" : "Équiper"}
                </button>
              )
            ) : soldOut ? (
              <span className="text-xs tracking-[0.08em] uppercase px-5 py-2.5 rounded-lg text-gray-500 bg-white/5 border border-white/10">
                Épuisé
              </span>
            ) : buyLoading ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onBuyConfirm}
                  className="text-xs tracking-[0.08em] uppercase px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30"
                >
                  <Check size={14} className="inline -mt-0.5 mr-1" /> Confirmer
                </button>
                <button
                  onClick={onBuyCancel}
                  className="text-xs tracking-[0.08em] uppercase px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer text-red-400 bg-red-500/5 border border-red-500/20 hover:bg-red-500/10"
                >
                  <X size={14} className="inline -mt-0.5 mr-1" /> Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={onBuyClick}
                disabled={!canAfford}
                className="text-xs tracking-[0.08em] uppercase px-5 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold"
                style={{
                  background: canAfford
                    ? "rgba(0,212,255,0.15)"
                    : "rgba(239,68,68,0.08)",
                  color: canAfford ? "#00D4FF" : "#EF4444",
                  border: canAfford
                    ? "1px solid rgba(0,212,255,0.3)"
                    : "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {canAfford ? "Acheter" : "Solde insuffisant"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Item Thumbnail (used in cards and modal) ──────────────────
function ItemThumbnail({
  item,
  className = "",
}: {
  item: ShopItem;
  className?: string;
}) {
  const rarityColor = RARITY_COLORS[item.rarity] ?? RARITY_COLORS.common;
  const config = parseConfig(item.config);

  if (item.imageUrl) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0"
          style={{
            boxShadow: `inset 0 0 0 1px ${rarityColor.border}`,
            borderRadius: "inherit",
          }}
        />
      </div>
    );
  }

  if (item.type === "background" && config?.gradient) {
    return (
      <div
        className={className}
        style={{
          background: config.gradient as string,
          boxShadow: `inset 0 0 0 1px ${rarityColor.border}`,
          borderRadius: "inherit",
        }}
      />
    );
  }

  if (item.type === "frame") {
    const borderWidth = (config?.borderWidth as number) ?? 3;
    const borderColor = (config?.borderColor as string) ?? rarityColor.text;
    const borderRadius = (config?.borderRadius as string) ?? "12px";
    const shadow = (config?.boxShadow as string) ?? `0 0 12px ${rarityColor.glow}`;
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={{
          background: `linear-gradient(135deg, ${rarityColor.bg}, rgba(255,255,255,0.02))`,
          boxShadow: `inset 0 0 0 1px ${rarityColor.border}`,
          borderRadius: "inherit",
        }}
      >
        <div
          className="w-[60%] h-[60%]"
          style={{
            border: `${borderWidth}px solid ${borderColor}`,
            borderRadius,
            boxShadow: shadow,
          }}
        />
      </div>
    );
  }

  if (item.type === "effect") {
    return (
      <div
        className={`${className} relative overflow-hidden flex items-center justify-center`}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${rarityColor.bg}, rgba(255,255,255,0.02))`,
          boxShadow: `inset 0 0 0 1px ${rarityColor.border}`,
          borderRadius: "inherit",
        }}
      >
        <div className="particle-field">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="particle-dot"
              style={{
                left: `${15 + (i * 10) % 70}%`,
                top: `${15 + (i * 17) % 70}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${1.5 + (i % 3) * 0.5}s`,
                background: rarityColor.text,
                boxShadow: `0 0 6px ${rarityColor.glow}`,
              }}
            />
          ))}
        </div>
        <Sparkles
          size={28}
          style={{ color: rarityColor.text, opacity: 0.5 }}
          className="relative z-[1]"
        />
      </div>
    );
  }

  if (item.type === "title_style") {
    const fontFamily = (config?.fontFamily as string) ?? "inherit";
    const color = (config?.color as string) ?? rarityColor.text;
    const textShadow = (config?.textShadow as string) ?? `0 0 8px ${rarityColor.glow}`;
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={{
          background: `linear-gradient(135deg, ${rarityColor.bg}, rgba(255,255,255,0.02))`,
          boxShadow: `inset 0 0 0 1px ${rarityColor.border}`,
          borderRadius: "inherit",
        }}
      >
        <span
          style={{
            fontFamily,
            color,
            textShadow,
            fontSize: "clamp(1rem, 3vw, 1.5rem)",
            fontWeight: 700,
            letterSpacing: "0.15em",
          }}
        >
          ABC
        </span>
      </div>
    );
  }

  if (item.type === "badge" && config?.icon) {
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${rarityColor.bg}, rgba(255,255,255,0.02))`,
          boxShadow: `inset 0 0 0 1px ${rarityColor.border}`,
          borderRadius: "inherit",
        }}
      >
        <span className="text-4xl sm:text-5xl">{config.icon as string}</span>
      </div>
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center`}
      style={{
        background: `radial-gradient(circle at 50% 50%, ${rarityColor.bg}, rgba(255,255,255,0.02))`,
        boxShadow: `inset 0 0 0 1px ${rarityColor.border}`,
        borderRadius: "inherit",
      }}
    >
      <Gem size={28} style={{ color: rarityColor.text, opacity: 0.4 }} />
    </div>
  );
}

// ─── Shop Card ─────────────────────────────────────────────────
const ShopCard = React.forwardRef<
  HTMLDivElement,
  {
    item: ShopItem;
    owned: boolean;
    equipped: boolean;
    canAfford: boolean;
    onOpenDetail: () => void;
  }
>(function ShopCard({ item, owned, equipped, canAfford, onOpenDetail }, ref) {
  const rarityColor = RARITY_COLORS[item.rarity] ?? RARITY_COLORS.common;
  const soldOut = isSoldOut(item);

  return (
    <div
      ref={ref}
      className="shop-card group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.03]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: equipped
          ? `1px solid rgba(0,212,255,0.5)`
          : "1px solid rgba(255,255,255,0.08)",
        borderLeft: `3px solid ${rarityColor.text}`,
        boxShadow: equipped
          ? "0 0 16px rgba(0,212,255,0.1)"
          : "none",
      }}
      onClick={onOpenDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail();
        }
      }}
      aria-label={`${item.name} — ${item.price} éther${owned ? ", possédé" : ""}${equipped ? ", équipé" : ""}`}
    >
      {/* Square thumbnail */}
      <div className="aspect-square relative">
        <ItemThumbnail item={item} className="w-full h-full" />

        {/* Hover overlay with "Acheter" */}
        {!owned && !soldOut && canAfford && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-black/50 backdrop-blur-[1px]">
            <span
              className="text-[0.65rem] tracking-[0.1em] uppercase px-4 py-1.5 rounded-md font-semibold"
              style={{
                color: "#00D4FF",
                background: "rgba(0,212,255,0.15)",
                border: "1px solid rgba(0,212,255,0.3)",
              }}
            >
              Acheter
            </span>
          </div>
        )}

        {/* Sold out overlay */}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] z-10">
            <span className="text-[0.65rem] tracking-[0.1em] uppercase px-3 py-1.5 rounded-md text-gray-400 bg-black/50 border border-white/10 font-medium">
              Épuisé
            </span>
          </div>
        )}

        {/* Owned / Equipped badge */}
        {owned && (
          <div
            className="absolute top-1.5 left-1.5 z-20 text-[0.5rem] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-sm font-medium"
            style={{
              color: equipped ? "#00D4FF" : "#34D399",
              background: "rgba(0,0,0,0.7)",
              border: equipped
                ? "1px solid rgba(0,212,255,0.5)"
                : "1px solid rgba(52,211,153,0.3)",
            }}
          >
            {equipped ? "ÉQUIPPÉ" : "POSSESSÉ"}
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="p-2.5">
        <h3 className="text-[0.7rem] tracking-wide leading-tight truncate mb-1.5 text-gray-200 font-medium">
          {item.name}
        </h3>
        <span
          className="text-[0.7rem] tracking-wider flex items-center gap-1.5 font-semibold"
          style={{
            color: !canAfford && !owned ? "#EF4444" : "#A78BFA",
          }}
        >
          <EtherDiamond className="w-3 h-3.5" />
          {item.price.toLocaleString("fr-FR")}
        </span>
      </div>
    </div>
  );
});

// ─── Main Component ────────────────────────────────────────────
export default function ShopPage() {
  const { data: session, status } = useSession();

  // Data state
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [etherBalance, setEtherBalance] = useState<number>(0);
  const [displayedEther, setDisplayedEther] = useState<number>(0);

  // UI state
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeRarity, setActiveRarity] = useState<string>("all");
  const [confirmBuyId, setConfirmBuyId] = useState<string | null>(null);
  const [buyLoading, setBuyLoading] = useState<string | null>(null);
  const [equipLoading, setEquipLoading] = useState<string | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [detailItem, setDetailItem] = useState<ShopItem | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Detect reduced motion
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Toast helper
  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Transform API inventory response to our interface
  const transformInventory = useCallback(
    (data: unknown[]): InventoryItem[] => {
      if (!Array.isArray(data)) return [];
      return data.map((inv: Record<string, unknown>) => ({
        id: inv.id as string,
        userId: inv.userId as string,
        itemId: inv.itemId as string,
        equipped: inv.equipped as boolean,
        slot: inv.slot as string | null,
        shopItem: (inv.item as ShopItem) ?? (inv.shopItem as ShopItem),
      }));
    },
    []
  );

  // Fetch data on mount
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      fetch("/api/shop")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          setShopItems(Array.isArray(data) ? data : []);
          setDataLoaded(true);
        })
        .catch(() => {
          setShopItems([]);
          setDataLoaded(true);
        });
      return;
    }

    const fetchData = async () => {
      try {
        const [shopRes, invRes, etherRes] = await Promise.all([
          fetch("/api/shop"),
          fetch("/api/shop/inventory"),
          fetch("/api/ether"),
        ]);

        const shopData = shopRes.ok ? await shopRes.json() : [];
        const invData = invRes.ok ? await invRes.json() : [];
        const etherData = etherRes.ok ? await etherRes.json() : { balance: 0 };

        setShopItems(Array.isArray(shopData) ? shopData : []);
        setInventory(transformInventory(invData));
        setEtherBalance(etherData.balance ?? 0);
        setDisplayedEther(etherData.balance ?? 0);
      } catch {
        setShopItems([]);
        setInventory([]);
        setEtherBalance(0);
        setDisplayedEther(0);
      } finally {
        setDataLoaded(true);
      }
    };

    fetchData();
  }, [session, status, transformInventory]);

  // Animated ether counter
  useEffect(() => {
    if (etherBalance === displayedEther) return;
    if (prefersReduced) {
      setDisplayedEther(etherBalance);
      return;
    }
    const obj = { val: displayedEther };
    gsap.to(obj, {
      val: etherBalance,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => setDisplayedEther(Math.round(obj.val)),
    });
  }, [etherBalance, displayedEther, prefersReduced]);

  // GSAP entrance animation
  useEffect(() => {
    if (!dataLoaded || !containerRef.current || prefersReduced) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }

      const cards = cardsRef.current.filter(Boolean);
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.04,
            ease: "power2.out",
            delay: 0.15,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [dataLoaded, activeTab, activeRarity, prefersReduced]);

  // Scroll active tab into view
  useEffect(() => {
    const scrollContainer = tabsScrollRef.current;
    if (!scrollContainer) return;
    const activeBtn = scrollContainer.querySelector(
      '[data-tab-active="true"]'
    ) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTab]);

  // Filter items
  const filteredItems = shopItems.filter((item) => {
    if (activeTab !== "all" && item.type !== activeTab) return false;
    if (activeRarity !== "all" && item.rarity !== activeRarity) return false;
    return true;
  });

  // Helpers
  const isOwned = useCallback(
    (itemId: string) => inventory.some((inv) => inv.itemId === itemId),
    [inventory]
  );
  const isEquipped = useCallback(
    (itemId: string) =>
      inventory.some((inv) => inv.itemId === itemId && inv.equipped),
    [inventory]
  );
  const getInventoryItem = useCallback(
    (itemId: string) => inventory.find((inv) => inv.itemId === itemId),
    [inventory]
  );

  // Buy handler
  const handleBuy = async (itemId: string) => {
    if (!session || buyLoading) return;
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;
    if (etherBalance < item.price) return;

    setBuyLoading(itemId);
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (res.ok) {
        const data = await res.json();
        setEtherBalance((prev) => prev - item.price);
        const rawInv = data.inventoryItem ?? { id: `inv-${Date.now()}`, itemId, userId: session.user?.id ?? "", equipped: false };
        const newInvItem: InventoryItem = {
          id: rawInv.id ?? `inv-${Date.now()}`,
          userId: rawInv.userId ?? session.user?.id ?? "",
          itemId: rawInv.itemId ?? itemId,
          equipped: rawInv.equipped ?? false,
          slot: rawInv.slot ?? null,
          shopItem: item,
        };
        setInventory((prev) => [...prev, newInvItem]);
        setShopItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, totalSold: i.totalSold + 1 } : i
          )
        );
        setConfirmBuyId(null);
        setDetailItem(null);
        addToast(`« ${item.name} » ajouté à ton inventaire !`, "success");
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.error || "Erreur lors de l'achat.", "error");
      }
    } catch {
      addToast("Erreur réseau. Réessaie.", "error");
    } finally {
      setBuyLoading(null);
    }
  };

  // Equip/unequip handler
  const handleEquip = async (
    inventoryItemId: string,
    slot: string,
    unequip?: boolean
  ) => {
    if (!session || equipLoading) return;
    setEquipLoading(inventoryItemId);
    try {
      const res = await fetch("/api/shop/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryItemId, slot, unequip: !!unequip }),
      });

      if (res.ok) {
        if (unequip) {
          setInventory((prev) =>
            prev.map((inv) =>
              inv.id === inventoryItemId
                ? { ...inv, equipped: false, slot: null }
                : inv
            )
          );
          addToast("Article déséquipé.", "success");
        } else {
          const targetInv = inventory.find((i) => i.id === inventoryItemId);
          const targetSlot = targetInv?.shopItem?.type ?? slot;
          setInventory((prev) =>
            prev.map((inv) => ({
              ...inv,
              equipped:
                inv.id === inventoryItemId
                  ? true
                  : inv.equipped && inv.shopItem?.type === targetSlot
                    ? false
                    : inv.equipped,
              slot:
                inv.id === inventoryItemId
                  ? targetSlot
                  : inv.equipped && inv.shopItem?.type === targetSlot
                    ? null
                    : inv.slot,
            }))
          );
          const itemName = targetInv?.shopItem?.name ?? "Article";
          addToast(`« ${itemName} » équipé !`, "success");
        }
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.error || "Erreur.", "error");
      }
    } catch {
      addToast("Erreur réseau.", "error");
    } finally {
      setEquipLoading(null);
    }
  };

  // ─── Render: Not logged in ───────────────────────────────────
  if (status !== "loading" && !session) {
    return (
      <>
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
          <div
            className="text-center max-w-md"
            style={{
              opacity: dataLoaded ? 1 : 0,
              transform: dataLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease",
            }}
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
              <Gem size={32} className="text-purple-400" />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl tracking-[0.12em] mb-4 text-gray-200 font-medium">
              CONNECTE-TOI POUR ACCÉDER À LA BOUTIQUE
            </h1>

            <p className="text-base sm:text-lg mb-10 leading-relaxed text-gray-500">
              L&rsquo;Éther t&rsquo;attend, aventurier
            </p>

            <button
              onClick={() => setShowDialog(true)}
              className="inline-flex items-center gap-3 text-sm tracking-[0.1em] uppercase px-8 py-3.5 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer font-semibold"
              style={{
                background: "rgba(0,212,255,0.15)",
                color: "#00D4FF",
                border: "1px solid rgba(0,212,255,0.3)",
                boxShadow: "0 0 20px rgba(0,212,255,0.1)",
              }}
            >
              <Sparkles size={18} />
              Se connecter
            </button>
          </div>
        </section>
        <SignInDialog open={showDialog} onClose={() => setShowDialog(false)} />
      </>
    );
  }

  // ─── Render: Loading ─────────────────────────────────────────
  if (status === "loading" || !dataLoaded) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs tracking-[0.15em] uppercase text-gray-600">
            Chargement de la boutique…
          </span>
        </div>
      </section>
    );
  }

  // ─── Render: Full Shop ───────────────────────────────────────
  return (
    <section
      className="min-h-[70vh] px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 relative"
      ref={containerRef}
    >
      {/* ── Toast container ── */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto px-4 py-3 rounded-lg text-sm max-w-xs"
            style={{
              background:
                toast.type === "success"
                  ? "rgba(52,211,153,0.12)"
                  : "rgba(239,68,68,0.12)",
              border: `1px solid ${
                toast.type === "success"
                  ? "rgba(52,211,153,0.25)"
                  : "rgba(239,68,68,0.25)"
              }`,
              color: toast.type === "success" ? "#34D399" : "#EF4444",
              animation: "shop-toast-in 0.3s ease-out",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* ── Top bar: Title + Ether balance ── */}
      <header ref={headerRef} className="mb-5 sm:mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl tracking-[0.1em] uppercase text-gray-200 font-medium">
            Boutique
          </h1>

          {/* Ether balance */}
          <div
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg"
            style={{
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.2)",
            }}
          >
            <EtherDiamond className="w-4 h-5" />
            <span
              className="text-sm sm:text-base tracking-wider font-semibold"
              style={{ color: "#A78BFA" }}
            >
              {displayedEther.toLocaleString("fr-FR")}
            </span>
          </div>
        </div>
      </header>

      {/* ── Category tabs (pill-shaped, horizontal scroll) ── */}
      <nav
        ref={tabsScrollRef}
        className="mb-5 overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Catégories de la boutique"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-2 min-w-max">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                data-tab-active={isActive ? "true" : undefined}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className="text-[0.65rem] sm:text-xs tracking-[0.06em] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer font-medium"
                style={{
                  color: isActive ? "#00D4FF" : "#6B7280",
                  background: isActive
                    ? "rgba(0,212,255,0.12)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(0,212,255,0.3)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isActive
                    ? "0 0 12px rgba(0,212,255,0.08)"
                    : "none",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Rarity filters ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6 flex-wrap">
        {RARITY_FILTERS.map((rarity) => {
          const isActive = activeRarity === rarity.key;
          const color =
            rarity.key !== "all"
              ? RARITY_COLORS[rarity.key]
              : null;
          return (
            <button
              key={rarity.key}
              onClick={() => setActiveRarity(rarity.key)}
              className="text-[0.55rem] sm:text-[0.6rem] tracking-[0.06em] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-200 cursor-pointer font-medium"
              style={{
                border: `1px solid ${
                  isActive
                    ? color?.text ?? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.06)"
                }`,
                color: isActive
                  ? color?.text ?? "#E5E7EB"
                  : "#6B7280",
                background: isActive
                  ? color?.bg ?? "rgba(255,255,255,0.06)"
                  : "transparent",
                boxShadow: isActive
                  ? `0 0 8px ${color?.glow ?? "rgba(255,255,255,0.05)"}`
                  : "none",
              }}
            >
              {rarity.label}
            </button>
          );
        })}
      </div>

      {/* ── Item Grid ── */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-base text-gray-600">
            Aucun article ne correspond à tes filtres.
          </p>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-10"
        >
          {filteredItems.map((item, idx) => (
            <ShopCard
              key={item.id}
              item={item}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              owned={isOwned(item.id)}
              equipped={isEquipped(item.id)}
              canAfford={etherBalance >= item.price}
              onOpenDetail={() => {
                setConfirmBuyId(null);
                setDetailItem(item);
              }}
            />
          ))}
        </div>
      )}

      {/* ── Inventory Accordion ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <button
          onClick={() => setInventoryOpen(!inventoryOpen)}
          className="w-full flex items-center justify-between px-5 py-4 transition-colors duration-200 cursor-pointer"
          aria-expanded={inventoryOpen}
        >
          <div className="flex items-center gap-3">
            <Package size={16} className="text-purple-400" />
            <span className="text-xs sm:text-sm tracking-[0.08em] uppercase text-gray-300 font-medium">
              Mon inventaire
            </span>
            <span
              className="text-[0.65rem] px-2 py-0.5 rounded-full font-medium"
              style={{
                color: "#A78BFA",
                background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.2)",
              }}
            >
              {inventory.length}
            </span>
          </div>
          {inventoryOpen ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </button>

        {inventoryOpen && (
          <div className="px-5 pb-5">
            <div className="mb-4 h-px bg-white/5" />
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <Package
                  size={28}
                  className="mx-auto mb-3 text-gray-700"
                />
                <p className="text-sm text-gray-600">
                  Aucun article dans ton inventaire. Visite la boutique !
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {inventory.map((inv) => {
                  const item = inv.shopItem;
                  const rarityColor =
                    RARITY_COLORS[item.rarity] ?? RARITY_COLORS.common;
                  return (
                    <div
                      key={inv.id}
                      className="relative rounded-lg overflow-hidden transition-all duration-200 cursor-pointer"
                      style={{
                        border: inv.equipped
                          ? `1px solid rgba(0,212,255,0.5)`
                          : "1px solid rgba(255,255,255,0.08)",
                        borderLeft: `3px solid ${rarityColor.text}`,
                        background: "rgba(255,255,255,0.04)",
                        boxShadow: inv.equipped
                          ? "0 0 12px rgba(0,212,255,0.08)"
                          : "none",
                      }}
                      onClick={() => {
                        setConfirmBuyId(null);
                        setDetailItem(item);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setDetailItem(item);
                        }
                      }}
                    >
                      <div className="aspect-square relative">
                        <ItemThumbnail
                          item={item}
                          className="w-full h-full"
                        />
                        {inv.equipped && (
                          <div
                            className="absolute top-1.5 left-1.5 z-10 text-[0.45rem] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-sm font-medium"
                            style={{
                              color: "#00D4FF",
                              background: "rgba(0,0,0,0.75)",
                              border: "1px solid rgba(0,212,255,0.5)",
                            }}
                          >
                            ÉQUIPPÉ
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h4 className="text-[0.6rem] tracking-wide leading-tight truncate text-gray-200">
                          {item.name}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detailItem && (() => {
        const inv = getInventoryItem(detailItem.id);
        return (
          <DetailModal
            item={detailItem}
            owned={isOwned(detailItem.id)}
            equipped={isEquipped(detailItem.id)}
            canAfford={etherBalance >= detailItem.price}
            buyLoading={buyLoading === detailItem.id}
            equipLoading={equipLoading === inv?.id}
            inventoryItem={inv}
            onClose={() => {
              setDetailItem(null);
              setConfirmBuyId(null);
            }}
            onBuyClick={() => setConfirmBuyId(detailItem.id)}
            onBuyConfirm={() => handleBuy(detailItem.id)}
            onBuyCancel={() => setConfirmBuyId(null)}
            onEquip={() => {
              if (inv)
                handleEquip(
                  inv.id,
                  inv.shopItem?.type ?? detailItem.type
                );
            }}
            onUnequip={() => {
              if (inv)
                handleEquip(
                  inv.id,
                  inv.shopItem?.type ?? detailItem.type,
                  true
                );
            }}
          />
        );
      })()}

      {/* ── Inline styles ── */}
      <style>{`
        /* Toast animation */
        @keyframes shop-toast-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Hide scrollbar on category tabs */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Shop card hover */
        .shop-card:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.4);
          z-index: 5;
        }

        /* Particle animation for effects */
        .particle-field {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .particle-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: particle-float ease-in-out infinite alternate;
        }

        @keyframes particle-float {
          0% {
            opacity: 0.2;
            transform: translateY(0) scale(0.8);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-8px) scale(1.2);
          }
          100% {
            opacity: 0.3;
            transform: translateY(-16px) scale(0.6);
          }
        }

        /* Custom scrollbar for inventory */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .particle-dot {
            animation: none !important;
            opacity: 0.5;
          }
          .shop-card:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}