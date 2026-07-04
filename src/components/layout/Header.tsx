"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  ChevronRight, ChevronDown,
  Pencil, Settings, LogOut,
} from "lucide-react";
import { useNavigation, type PageType } from "@/store/navigationStore";
import { useCms } from "@/store/cmsStore";
import { useSession, signIn, signOut } from "next-auth/react";

/* ═══════════════════════════════════════════════════════════════
   DNA-STYLE HEADER — Duet Night Abyss Visual Design
   ═══════════════════════════════════════════════════════════════ */

const WHITE = "#FFFFFF";
const WHITE60 = "#B8A898";
const WHITE08 = "rgba(255,255,255,0.08)";
const WHITE04 = "rgba(255,255,255,0.04)";

const SECTION_COLORS: Record<string, string> = {
  HOME: "#C8A45C",
  "LE MONDE": "#C8A45C",
  EXPLORER: "#C8A45C",
  COMMUNAUTÉ: "#C8A45C",
  "LOG IN": "#C8A45C",
};

interface SubItem {
  label: string;
  page: PageType;
  image?: string;
}

interface NavGroup {
  label: string;
  page?: PageType;
  children?: SubItem[];
  isLogin?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
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

const ADMIN_DISCORD_ID = "722146261381415043";

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

/* ─── Dropdown Component ─── */
function NavDropdown({
  group,
  isOpen,
  onNavigate,
  onClose,
  accentColor,
  bannerImage,
}: {
  group: NavGroup;
  isOpen: boolean;
  onNavigate: (page: PageType) => void;
  onClose: () => void;
  accentColor: string;
  bannerImage?: string;
}) {
  if (!isOpen || !group.children) return null;
  const hasBanner = !!bannerImage;

  const cols = group.children.length <= 4 ? group.children.length : 5;
  const totalWidth = hasBanner ? Math.max(cols * 130, 380) : 220;

  return (
    <div
      className="hoyo-dropdown absolute top-full left-0 z-50 pt-2"
      style={{
        minWidth: totalWidth,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 0.15s ease",
      }}
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
              src={bannerImage}
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
            {group.children.map((child) => (
              <button
                key={child.page}
                onClick={() => { onNavigate(child.page); onClose(); }}
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-md transition-all duration-200 group"
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
            {group.children.map((child) => (
              <button
                key={child.page}
                onClick={() => { onNavigate(child.page); onClose(); }}
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
                <ChevronRight size={10} className="opacity-0 group-hover:opacity-30 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Header Component ─── */
interface HeaderProps {
  mode: "full" | "compact";
  onThemeToggle?: (e: React.MouseEvent) => void;
}

export default function Header({ mode }: HeaderProps) {
  const { currentPage, navigate, mobileMenuOpen, setMobileMenuOpen } =
    useNavigation();
  const { isEditMode, toggleEditMode } = useCms();
  const { data: session } = useSession();
  const isAdmin = session?.user?.discordId === ADMIN_DISCORD_ID;
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleNav = useCallback(
    (page: PageType) => {
      navigate(page);
      setOpenMenu(null);
    },
    [navigate],
  );

  const handleMouseEnter = useCallback((label: string) => {
    clearTimeout(closeTimeoutRef.current);
    setOpenMenu(label);
    setHoveredItem(label);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
      setHoveredItem(null);
    }, 250);
  }, []);

  const isGroupActive = (group: NavGroup): boolean => {
    if (group.page && group.page === currentPage) return true;
    if (group.children) return group.children.some((c) => c.page === currentPage);
    return false;
  };

  const getSectionColor = (label: string) => SECTION_COLORS[label] || "#C8A45C";

  const getNavColor = (label: string, isActive: boolean, isOpen: boolean) => {
    if (isActive || isOpen) return "#E8D5A0";
    if (hoveredItem === label) return "#E8D5A0";
    return "#B8A898";
  };

  return (
    <>
      {/* ─── NAVBAR ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-[100] w-full"
        style={{
          height: 60,
          background: "rgba(10,8,14,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(200,164,92,0.12)",
        }}
      >
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 lg:px-10">
          {/* Logo + Music Bars */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNav("home")}
              className="flex items-center shrink-0 group"
              aria-label="Accueil"
            >
              <Image
                src="/logo.png"
                alt="Ascension"
                width={110}
                height={30}
                className="h-7 w-auto object-contain select-none transition-all duration-300 group-hover:brightness-110"
                priority
              />
            </button>
            <MusicBars />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_GROUPS.map((group) => {
              if (group.isLogin) {
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
                    className="flex items-center gap-2 px-4 py-2 transition-all duration-200 cursor-pointer"
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

              const hasChildren = group.children && group.children.length > 0;
              const isActive = group.page === currentPage;
              const active = isGroupActive(group);
              const isOpen = openMenu === group.label;
              const sectionColor = getSectionColor(group.label);
              const textColor = getNavColor(group.label, active, isOpen);

              if (!hasChildren) {
                return (
                  <button
                    key={group.label}
                    onClick={() => handleNav(group.page!)}
                    className="relative px-4 py-2 transition-all duration-200"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: isActive || hoveredItem === group.label ? 600 : 400,
                      letterSpacing: "0.08em",
                      color: textColor,
                    }}
                    onMouseEnter={() => setHoveredItem(group.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {group.label}
                    {(isActive || hoveredItem === group.label) && (
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
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(group.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 relative transition-all duration-200"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: active || isOpen || hoveredItem === group.label ? 600 : 400,
                      letterSpacing: "0.08em",
                      color: textColor,
                    }}
                    onMouseEnter={() => setHoveredItem(group.label)}
                    onMouseLeave={() => {
                      if (openMenu !== group.label) setHoveredItem(null);
                    }}
                  >
                    {group.label}
                    <ChevronDown
                      size={11}
                      className="transition-transform duration-200"
                      style={{
                        opacity: 0.5,
                        transform: isOpen ? "rotate(180deg)" : "none",
                        color: textColor,
                      }}
                    />
                    {(active || hoveredItem === group.label) && (
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
                  <NavDropdown
                    group={group}
                    isOpen={isOpen}
                    onNavigate={handleNav}
                    onClose={() => setOpenMenu(null)}
                    accentColor={sectionColor}
                    bannerImage={DROPDOWN_BANNERS[group.label]}
                  />
                </div>
              );
            })}
          </nav>

          {/* Right Actions: Admin buttons only */}
          <div className="flex items-center gap-1">
            {isAdmin && (
              <>
                <button
                  onClick={toggleEditMode}
                  className={`p-2 rounded transition-all duration-200 ${
                    isEditMode ? "" : ""
                  }`}
                  style={isEditMode
                    ? { color: "#C8A45C", background: "rgba(200,164,92,0.1)" }
                    : { color: "#B8A898" }
                  }
                  onMouseEnter={(e) => { if (!isEditMode) { (e.currentTarget as HTMLElement).style.color = "#E8D5A0"; (e.currentTarget as HTMLElement).style.background = "rgba(200,164,92,0.06)"; }}}
                  onMouseLeave={(e) => { if (!isEditMode) { (e.currentTarget as HTMLElement).style.color = "#B8A898"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}}
                  aria-label="Mode Édition CMS"
                  title={isEditMode ? "Quitter le mode édition" : "Mode édition (CMS)"}
                >
                  <Pencil size={15} strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => handleNav("admin")}
                  className="p-2 rounded transition-colors duration-200"
                  style={{ color: currentPage === "admin" ? "#C8A45C" : "#B8A898" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#E8D5A0"; (e.currentTarget as HTMLElement).style.background = "rgba(200,164,92,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = currentPage === "admin" ? "#C8A45C" : "#B8A898"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  aria-label="Administration"
                >
                  <Settings size={15} strokeWidth={1.8} />
                </button>
              </>
            )}

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded transition-colors duration-200"
                style={{ color: "#B8A898" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F43F5E"; (e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#B8A898"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut size={15} strokeWidth={1.8} />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded transition-colors duration-200"
              style={{ color: "#B8A898" }}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE OVERLAY ─── */}
      <div
        className={`fixed inset-0 z-[110] flex flex-col transition-all duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(10,8,14,0.97)" }}
      >
        <div className="flex items-center justify-between px-5" style={{ height: 60 }}>
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ascension" width={90} height={26} className="h-6 w-auto object-contain select-none" />
            <MusicBars />
          </div>
          <button onClick={() => setMobileMenuOpen(false)} style={{ color: "#B8A898" }} aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-6">
          {NAV_GROUPS.map((group) => {
            if (group.isLogin) {
              if (session) {
                return (
                  <div key="mobile-avatar" className="w-full max-w-xs text-center py-3">
                    <button
                      onClick={() => { handleNav("profile"); setMobileMenuOpen(false); }}
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
                    onClick={() => { signIn("discord"); setMobileMenuOpen(false); }}
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

            const hasChildren = group.children && group.children.length > 0;
            const isActive = group.page === currentPage;
            const active = isGroupActive(group);
            const isOpen = mobileDropdown === group.label;
            const sectionColor = getSectionColor(group.label);

            return (
              <div key={group.label} className="w-full max-w-xs text-center">
                <button
                  onClick={() => {
                    if (!hasChildren) { handleNav(group.page!); }
                    else { setMobileDropdown(isOpen ? null : group.label); }
                  }}
                  className="w-full py-3 transition-all duration-200"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: (isActive || active) ? 600 : 400,
                    letterSpacing: "0.12em",
                    color: (isActive || active) ? "#E8D5A0" : "#B8A898",
                    borderBottom: (isActive || active) ? "1px solid rgba(200,164,92,0.6)" : "1px solid transparent",
                  }}
                >
                  {group.label}
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
                    {group.children!.map((child) => (
                      <button
                        key={child.page}
                        onClick={() => handleNav(child.page)}
                        className="block w-full py-2.5 transition-colors duration-150"
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
        <div className="flex items-center justify-center gap-4 pb-10">
          {session && (
            <button
              onClick={() => { signOut({ callbackUrl: "/" }); setMobileMenuOpen(false); }}
              className="p-2.5 transition-colors duration-200"
              style={{ color: "#B8A898" }}
              aria-label="Se déconnecter"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}