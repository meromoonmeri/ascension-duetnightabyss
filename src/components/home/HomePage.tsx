"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigation, type PageType } from "@/store/navigationStore";
import { useSession, signIn } from "next-auth/react";
import {
  ChevronRight, ChevronDown,
} from "lucide-react";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════════
   DNA-STYLE HOMEPAGE — Duet Night Abyss Visual Design
   ═══════════════════════════════════════════════════════════════ */

/* ─── Design Tokens ──────────────────────────────────────────── */
const T = {
  white: "#FFFFFF",
  white60: "#B8A898",
  white50: "rgba(255,255,255,0.5)",
  white35: "#8B8070",
  white15: "rgba(255,255,255,0.15)",
  white08: "rgba(255,255,255,0.08)",
  white04: "rgba(255,255,255,0.04)",
  black80: "rgba(10,8,14,0.8)",
  black90: "rgba(10,8,14,0.9)",
  gold: "#C8A45C",
  goldLight: "#E8D5A0",
  goldBright: "#F5E6B8",
  goldDeep: "#8B6914",
  goldDark: "#6B4F10",
  cream: "#F0E8D8",
  abyss: "#0A080E",
  navH: 60,
};

/* ─── Section Colors (ALL GOLD — DNA design) ────────────────── */
const SECTION_COLORS: Record<string, string> = {
  HOME: "#C8A45C",
  "LE MONDE": "#C8A45C",
  EXPLORER: "#C8A45C",
  COMMUNAUTÉ: "#C8A45C",
  "LOG IN": "#C8A45C",
};

/* ─── Navigation Items ──────────────────────────────────────── */
interface NavDef {
  label: string;
  page?: PageType;
  children?: { label: string; page: PageType; image?: string }[];
  isLogin?: boolean;
}

const NAV: NavDef[] = [
  { label: "HOME", page: "home" },
  {
    label: "LE MONDE",
    children: [
      { label: "Cosmologie", page: "cosmology" },
      { label: "Géographie", page: "geography" },
      { label: "Royaumes", page: "royaumes" },
      { label: "Système d'Énergie", page: "grimoire" },
    ],
  },
  {
    label: "EXPLORER",
    children: [
      { label: "Races", page: "races" },
      { label: "Arts", page: "arts" },
      { label: "Bestiaire", page: "bestiary" },
      { label: "Artefacts", page: "artefacts" },
      { label: "Factions", page: "factions" },
      { label: "Arbres de Compétences", page: "skilltree" },
    ],
  },
  {
    label: "COMMUNAUTÉ",
    children: [
      { label: "News", page: "news" },
      { label: "Événements", page: "events" },
      { label: "Banque", page: "bank" },
      { label: "Boutique", page: "shop" },
    ],
  },
  { label: "LOG IN", isLogin: true },
];

/* ─── Particle System ───────────────────────────────────────── */
const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  size: (i % 3) * 0.8 + 0.6,
  duration: 8 + (i % 7) * 2,
  delay: (i * 1.7) % 12,
  opacity: 0.08 + (i % 4) * 0.04,
  drift: ((i % 3) - 1) * 20,
}));

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ─── Music Bars Animation Component ─── */
function MusicBars() {
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <button
        onClick={() => setPlaying(!playing)}
        className="flex items-end gap-[2px] shrink-0 cursor-pointer"
        style={{ height: 16, padding: "0 4px" }}
        aria-label={playing ? "Pause musique" : "Lire musique"}
      >
        <style>{`
          @keyframes musicBar1 { 0%,100% { height: 4px; } 50% { height: 14px; } }
          @keyframes musicBar2 { 0%,100% { height: 10px; } 50% { height: 4px; } }
          @keyframes musicBar3 { 0%,100% { height: 6px; } 50% { height: 12px; } }
        `}</style>
        <div
          className="rounded-full"
          style={{
            width: 2,
            height: 4,
            background: playing ? "rgba(200,164,92,0.5)" : "rgba(200,164,92,0.3)",
            animation: playing ? "musicBar1 0.8s ease-in-out infinite" : "none",
            transition: "background 0.2s ease",
          }}
        />
        <div
          className="rounded-full"
          style={{
            width: 2,
            height: 10,
            background: playing ? "rgba(200,164,92,0.5)" : "rgba(200,164,92,0.3)",
            animation: playing ? "musicBar2 0.8s ease-in-out infinite" : "none",
            animationDelay: "0.15s",
            transition: "background 0.2s ease",
          }}
        />
        <div
          className="rounded-full"
          style={{
            width: 2,
            height: 6,
            background: playing ? "rgba(200,164,92,0.5)" : "rgba(200,164,92,0.3)",
            animation: playing ? "musicBar3 0.8s ease-in-out infinite" : "none",
            animationDelay: "0.3s",
            transition: "background 0.2s ease",
          }}
        />
      </button>
      {playing && (
        <iframe
          src="https://www.youtube.com/embed/Y2B6dARUEqo?autoplay=1&loop=1&playlist=RDY2B6dARUEqo&controls=0&showinfo=0&rel=0&enablejsapi=1"
          allow="autoplay; encrypted-media"
          style={{
            position: 'fixed',
            bottom: -100,
            right: -100,
            width: 1,
            height: 1,
            pointerEvents: 'none',
            opacity: 0,
          }}
          title="Background Music"
        />
      )}
    </>
  );
}

/* ─── Banner image per nav group ─── */
const DROPDOWN_BANNERS: Record<string, string> = {
  "LE MONDE": "/dropdown-monde.jpg",
  EXPLORER: "/dropdown-explorer.jpg",
  COMMUNAUTÉ: "/dropdown-communaute.jpg",
};

/* ─── Top Navigation Bar ─── */
function TopNav() {
  const { currentPage, navigate } = useNavigation();
  const { data: session } = useSession();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleNav = useCallback((page: PageType) => {
    navigate(page);
    setOpenMenu(null);
    setMobileOpen(false);
  }, [navigate]);

  const getNavColor = (label: string, isActive: boolean, isOpen: boolean) => {
    if (isActive || isOpen) return T.goldLight;
    if (hoveredItem === label) return T.goldLight;
    return "#B8A898";
  };

  return (
    <>
      {/* Desktop Nav */}
      <nav
        className="hoyo-nav fixed top-0 left-0 right-0 z-50 hidden lg:flex items-center justify-between px-8 xl:px-12"
        style={{
          height: T.navH,
          background: "rgba(10,8,14,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(200,164,92,0.12)",
        }}
      >
        {/* Logo + Music Bars */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNav("home")}
            className="shrink-0 group"
            aria-label="Accueil"
          >
            <Image
              src="/logo.png"
              alt="ASCENSION"
              width={120}
              height={32}
              className="h-7 w-auto object-contain select-none transition-all duration-300 group-hover:brightness-110"
              priority
            />
          </button>
          <MusicBars />
        </div>

        {/* Center Nav Items */}
        <div className="flex items-center gap-0.5">
          {NAV.map((item) => {
            if (item.isLogin) {
              /* ─── LOG IN / AVATAR BUTTON ─── */
              if (session) {
                return (
                  <button
                    key="logged-in-avatar"
                    onClick={() => handleNav("profile")}
                    className="flex items-center gap-2 px-3 py-1.5 transition-all duration-200"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      color: "#B8A898",
                      letterSpacing: "0.03em",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#E8D5A0";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#B8A898";
                    }}
                  >
                    <Image
                      src={session.user?.image || "/logo.png"}
                      alt={session.user?.name || "Avatar"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                      style={{ border: "1px solid rgba(200,164,92,0.15)" }}
                      onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
                    />
                    <span className="max-w-[100px] truncate">{session.user?.name}</span>
                  </button>
                );
              }

              return (
                <button
                  key="login-btn"
                  onClick={() => signIn("discord")}
                  className="flex items-center gap-2 transition-all duration-200 cursor-pointer"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "#C8A45C",
                    background: "transparent",
                    border: "1px solid rgba(200,164,92,0.3)",
                    borderRadius: 6,
                    padding: "8px 18px",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(200,164,92,0.08)";
                    el.style.borderColor = "rgba(200,164,92,0.5)";
                    el.style.color = "#E8D5A0";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.borderColor = "rgba(200,164,92,0.3)";
                    el.style.color = "#C8A45C";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                  </svg>
                  SE CONNECTER
                </button>
              );
            }

            const hasChildren = !!item.children;
            const isActive = item.page === currentPage;
            const isOpen = openMenu === item.label;
            const textColor = getNavColor(item.label, isActive, isOpen);

            if (!hasChildren) {
              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.page!)}
                  className="relative px-4 py-2 transition-all duration-200"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: isActive || hoveredItem === item.label ? 600 : 400,
                    letterSpacing: "0.08em",
                    color: textColor,
                  }}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {item.label}
                  {(isActive || hoveredItem === item.label) && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                      style={{
                        width: "60%",
                        background: "linear-gradient(90deg, transparent, rgba(200,164,92,0.8), transparent)",
                        transition: "background 0.2s ease",
                      }}
                    />
                  )}
                </button>
              );
            }

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => {
                  clearTimeout(closeTimeout.current);
                  setOpenMenu(item.label);
                  setHoveredItem(item.label);
                }}
                onMouseLeave={() => {
                  closeTimeout.current = setTimeout(() => {
                    setOpenMenu(null);
                    setHoveredItem(null);
                  }, 250);
                }}
              >
                <button
                  className="flex items-center gap-1.5 px-4 py-2 relative transition-all duration-200"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: isOpen || hoveredItem === item.label ? 600 : 400,
                    letterSpacing: "0.08em",
                    color: textColor,
                  }}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => {
                    if (openMenu !== item.label) setHoveredItem(null);
                  }}
                >
                  {item.label}
                  <ChevronDown
                    size={11}
                    className="transition-transform duration-200"
                    style={{
                      opacity: 0.5,
                      transform: isOpen ? "rotate(180deg)" : "none",
                      color: textColor,
                    }}
                  />
                  {(hoveredItem === item.label || isOpen) && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                      style={{
                        width: "60%",
                        background: "linear-gradient(90deg, transparent, rgba(200,164,92,0.8), transparent)",
                        transition: "background 0.2s ease",
                      }}
                    />
                  )}
                </button>

                {/* Dropdown */}
                {isOpen && item.children && (() => {
                  const bannerImg = DROPDOWN_BANNERS[item.label];
                  const hasBanner = !!bannerImg;
                  const cols = item.children.length <= 4 ? item.children.length : 5;
                  const totalWidth = hasBanner ? Math.max(cols * 130, 380) : 220;
                  return (
                    <div
                      className="hoyo-dropdown absolute top-full left-0 pt-2 z-50"
                      style={{ minWidth: totalWidth }}
                    >
                      <div
                        style={{
                          background: "rgba(10,8,14,0.95)",
                          backdropFilter: "blur(24px)",
                          border: "1px solid rgba(200,164,92,0.15)",
                          borderRadius: 8,
                          overflow: "hidden",
                          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                        }}
                      >
                        {/* Banner — desktop only */}
                        {hasBanner && (
                          <div className="relative hidden lg:block" style={{ height: 130, width: '100%' }}>
                            <Image
                              src={bannerImg}
                              alt=""
                              fill
                              className="object-cover"
                              sizes={`${totalWidth}px`}
                              priority={false}
                            />
                            <div
                              className="absolute inset-0"
                              style={{
                                background: "linear-gradient(to top, rgba(10,8,14,0.98) 0%, rgba(10,8,14,0.4) 50%, transparent 100%)",
                              }}
                            />
                          </div>
                        )}

                        {/* Grid of mini cards — desktop */}
                        {hasBanner ? (
                          <div
                            className="hidden lg:grid gap-1.5 p-3"
                            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                          >
                            {item.children.map((child) => (
                              <button
                                key={child.page}
                                onClick={() => handleNav(child.page)}
                                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-md transition-all duration-200"
                                style={{
                                  background: "rgba(200,164,92,0.04)",
                                  border: "1px solid rgba(200,164,92,0.1)",
                                }}
                                onMouseEnter={(e) => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background = "rgba(200,164,92,0.08)";
                                  el.style.borderColor = "rgba(200,164,92,0.3)";
                                  el.style.boxShadow = "0 0 12px rgba(200,164,92,0.13)";
                                  const label = el.querySelector("span");
                                  if (label) (label as HTMLElement).style.color = "#E8D5A0";
                                }}
                                onMouseLeave={(e) => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background = "rgba(200,164,92,0.04)";
                                  el.style.borderColor = "rgba(200,164,92,0.1)";
                                  el.style.boxShadow = "none";
                                  const label = el.querySelector("span");
                                  if (label) (label as HTMLElement).style.color = "#B8A898";
                                }}
                              >
                                <ChevronRight
                                  size={12}
                                  style={{ color: "rgba(200,164,92,0.3)", transition: "color 0.2s" }}
                                />
                                <span
                                  style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "0.65rem",
                                    fontWeight: 400,
                                    color: "#B8A898",
                                    letterSpacing: "0.04em",
                                    textAlign: "center",
                                    lineHeight: 1.3,
                                    transition: "color 0.2s",
                                  }}
                                >
                                  {child.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          /* Fallback: simple list (no banner) */
                          <div style={{ padding: "6px 0" }}>
                            {item.children.map((child) => (
                              <button
                                key={child.page}
                                onClick={() => handleNav(child.page)}
                                className="w-full flex items-center justify-between px-5 py-2.5 text-left transition-colors duration-150 group"
                                style={{
                                  fontFamily: "'Inter', sans-serif",
                                  fontSize: "0.72rem",
                                  fontWeight: 400,
                                  color: "#B8A898",
                                  letterSpacing: "0.03em",
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLElement).style.color = "#E8D5A0";
                                  (e.currentTarget as HTMLElement).style.background = "rgba(200,164,92,0.08)";
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.color = "#B8A898";
                                  (e.currentTarget as HTMLElement).style.background = "transparent";
                                }}
                              >
                                <span>{child.label}</span>
                                <ChevronRight
                                  size={10}
                                  className="opacity-0 group-hover:opacity-30 transition-opacity"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Right: spacer for balance */}
        <div className="w-[120px] shrink-0" />
      </nav>

      {/* Mobile Nav Overlay */}
      <div
        className={`fixed inset-0 z-[110] flex flex-col transition-all duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(10,8,14,0.97)" }}
      >
        <div className="flex items-center justify-between px-5" style={{ height: T.navH }}>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ASCENSION"
              width={90}
              height={26}
              className="h-6 w-auto object-contain select-none"
            />
            <MusicBars />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ color: "#B8A898" }}
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-8">
          {NAV.map((item) => {
            if (item.isLogin) {
              if (session) {
                return (
                  <div key="mobile-avatar" className="w-full max-w-xs text-center py-3">
                    <button
                      onClick={() => { handleNav("profile"); setMobileOpen(false); }}
                      className="flex items-center justify-center gap-2 w-full"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: 400,
                        letterSpacing: "0.05em",
                        color: "#B8A898",
                      }}
                    >
                      <Image
                        src={session.user?.image || "/logo.png"}
                        alt={session.user?.name || "Avatar"}
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                        style={{ border: "1px solid rgba(200,164,92,0.15)" }}
                        onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
                      />
                      <span className="truncate">{session.user?.name}</span>
                    </button>
                  </div>
                );
              }
              return (
                <div key="mobile-login" className="w-full max-w-xs text-center py-3">
                  <button
                    onClick={() => { signIn("discord"); setMobileOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full mx-auto"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "#C8A45C",
                      background: "transparent",
                      border: "1px solid rgba(200,164,92,0.3)",
                      borderRadius: 6,
                      padding: "10px 24px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                    </svg>
                    SE CONNECTER
                  </button>
                </div>
              );
            }

            const hasChildren = !!item.children;
            const isActive = item.page === currentPage;
            const isOpen = mobileDropdown === item.label;

            return (
              <div key={item.label} className="w-full max-w-xs text-center">
                <button
                  onClick={() => {
                    if (!hasChildren && item.page) handleNav(item.page);
                    else if (hasChildren) setMobileDropdown(isOpen ? null : item.label);
                  }}
                  className="w-full py-3 transition-all duration-200"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: "0.12em",
                    color: isActive ? "#E8D5A0" : "#B8A898",
                    borderBottom: isActive ? "1px solid rgba(200,164,92,0.6)" : "1px solid transparent",
                  }}
                >
                  {item.label}
                  {hasChildren && (
                    <ChevronDown
                      size={13}
                      className="opacity-40 ml-1 inline-block transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                    />
                  )}
                </button>
                {hasChildren && isOpen && (
                  <div className="py-1">
                    {item.children!.map((child) => (
                      <button
                        key={child.page}
                        onClick={() => handleNav(child.page)}
                        className="block w-full py-2 transition-colors duration-150"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.75rem",
                          fontWeight: 300,
                          color: "#8B8070",
                          letterSpacing: "0.05em",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#E8D5A0";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#8B8070";
                        }}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-0 right-0 z-[105] flex items-center justify-center"
        style={{
          width: T.navH,
          height: T.navH,
          color: "#B8A898",
        }}
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}

/* ─── Main Hero Section ─── */
function HeroSection() {
  const { navigate } = useNavigation();
  const containerRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Video loop
  useEffect(() => {
    const video = containerRef.current;
    if (!video) return;
    const onEnded = () => { video.currentTime = 0; video.play().catch(() => {}); };
    video.addEventListener("ended", onEnded);
    return () => video.removeEventListener("ended", onEnded);
  }, [videoReady]);

  // Entrance animation
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      tl.fromTo(".hoyo-nav", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.1);
      tl.fromTo(".hoyo-hero-content", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.3);
      tl.fromTo(".hoyo-hero-badge", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }, 0.6);
      tl.fromTo(".hoyo-hero-buttons", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.7);
      tl.fromTo(".hoyo-footer-bar", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.9);
    });

    return () => ctx.revert();
  }, []);

  const DISCORD_URL = "https://discord.gg/svAvDbBx36";

  return (
    <div ref={heroRef} className="relative w-full h-screen overflow-hidden select-none hoyo-selection">
      {/* ═══ FULL-BLEED VIDEO BACKGROUND ═══ */}
      <video
        ref={containerRef}
        autoPlay
        muted
        playsInline
        onCanPlay={() => setVideoReady(true)}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: "scale(1.05)",
          opacity: videoReady ? 1 : 0,
          transition: "opacity 1.5s ease",
          animation: "hoyoSlowZoom 40s ease-in-out infinite alternate",
        }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* ═══ GRADIENT OVERLAYS ═══ */}
      {/* Top dark fade (for nav readability) */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none z-[2]"
        style={{ height: 120, background: "linear-gradient(180deg, rgba(10,8,14,0.55) 0%, transparent 100%)" }}
      />
      {/* Bottom dark fade (for buttons/footer readability) */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-[2]"
        style={{ height: "45%", background: "linear-gradient(to top, rgba(10,8,14,0.75) 0%, rgba(10,8,14,0.2) 50%, transparent 100%)" }}
      />
      {/* Side vignettes */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,8,14,0.35) 100%)" }}
      />

      {/* ═══ PARTICLES ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: -10,
              background: p.id % 2 === 0 ? "rgba(200,164,92,0.5)" : "rgba(240,232,216,0.4)",
              opacity: p.opacity,
              animation: `hoyoDrift ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ═══ NAVIGATION ═══ */}
      <TopNav />

      {/* ═══ CENTER HERO CONTENT ═══ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="hoyo-hero-content flex flex-col items-center text-center px-4 opacity-0" style={{ marginTop: -20 }}>
          {/* Logo */}
          <div className="mb-3">
            <Image
              src="/logo.png"
              alt="ASCENSION"
              width={320}
              height={180}
              priority
              className="select-none max-w-[280px] sm:max-w-[320px] w-auto"
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 4px 30px rgba(10,8,14,0.5))",
              }}
            />
          </div>

          {/* Japanese subtitle */}
          <p
            className="mb-4"
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "clamp(0.7rem, 1.5vw, 1rem)",
              fontWeight: 300,
              color: "#B8A898",
              letterSpacing: "0.2em",
              textShadow: "0 0 20px rgba(200,164,92,0.4)",
            }}
          >
            ノミステリ RP
          </p>

          {/* NOW LIVE badge — gold accent */}
          <div
            className="hoyo-hero-badge inline-flex items-center gap-2 mb-8 opacity-0"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#C8A45C", boxShadow: "0 0 6px #C8A45C" }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.55rem",
                fontWeight: 400,
                color: "#B8A898",
                letterSpacing: "0.1em",
              }}
            >
              MAINTENANT EN LIGNE
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="hoyo-hero-buttons flex flex-col sm:flex-row items-center gap-3 opacity-0 pointer-events-auto">
            <button
              onClick={() => window.open(DISCORD_URL, "_blank", "noopener,noreferrer")}
              className="transition-all duration-300 cursor-pointer"
              style={{
                padding: "13px 40px",
                borderRadius: 6,
                border: "1px solid rgba(200,164,92,0.25)",
                background: "transparent",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(200,164,92,0.5)";
                el.style.background = "rgba(200,164,92,0.08)";
                el.style.color = "#F5E6B8";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(200,164,92,0.25)";
                el.style.background = "transparent";
                el.style.color = "#FFFFFF";
              }}
            >
              REJOINDRE LE SERVEUR
            </button>
            <button
              onClick={() => navigate("cosmology")}
              className="transition-all duration-300 cursor-pointer"
              style={{
                padding: "13px 32px",
                borderRadius: 6,
                border: "1px solid rgba(200,164,92,0.4)",
                background: "transparent",
                color: "#E8D5A0",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(200,164,92,0.6)";
                el.style.color = "#F5E6B8";
                el.style.background = "rgba(200,164,92,0.06)";
                el.style.boxShadow = "0 0 20px rgba(200,164,92,0.15)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(200,164,92,0.4)";
                el.style.color = "#E8D5A0";
                el.style.background = "transparent";
                el.style.boxShadow = "none";
              }}
            >
              DÉCOUVRIR L&apos;UNIVERS
            </button>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM FOOTER BAR ═══ */}
      <footer
        className="hoyo-footer-bar absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 lg:px-10 opacity-0"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          height: 44,
          background: "linear-gradient(to top, rgba(10,8,14,0.3) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.5rem",
              color: T.white15,
              letterSpacing: "0.1em",
            }}
          >
            © 2025 ASCENSION — KAKUSEI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.45rem",
              color: T.white08,
              letterSpacing: "0.05em",
            }}
          >
            Mentions légales
          </span>
          <div
            style={{
              padding: "1px 6px",
              borderRadius: 3,
              border: `1px solid ${T.white08}`,
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.4rem",
              fontWeight: 700,
              color: T.white15,
              letterSpacing: "0.05em",
            }}
          >
            PEGI 12
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <>
      <HeroSection />
    </>
  );
}