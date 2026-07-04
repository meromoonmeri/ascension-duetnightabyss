"use client";

import React from "react";
import {
  ShoppingBag,
  Landmark,
  Calendar,
  Scroll,
  User,
  ArrowLeft,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useNavigation, type PageType } from "@/store/navigationStore";
import { useSession, signIn, signOut } from "next-auth/react";

/* ------------------------------------------------------------------ */
/*  Game page navigation config                                        */
/* ------------------------------------------------------------------ */

interface GameNavItem {
  id: PageType;
  label: string;
  Icon: LucideIcon;
}

const GAME_PAGES: GameNavItem[] = [
  { id: "shop", label: "Boutique", Icon: ShoppingBag },
  { id: "bank", label: "Banque", Icon: Landmark },
  { id: "events", label: "Événements", Icon: Calendar },
  { id: "quests", label: "Quêtes", Icon: Scroll },
  { id: "profile", label: "Profil", Icon: User },
];

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface GamePageShellProps {
  children: React.ReactNode;
  activeTab?: string;
}

/* ------------------------------------------------------------------ */
/*  Subtle noise texture overlay (inline SVG data URI)                 */
/* ------------------------------------------------------------------ */

const NOISE_OVERLAY = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function GamePageShell({ children, activeTab }: GamePageShellProps) {
  const { navigate } = useNavigation();
  const { data: session } = useSession();

  const activeId = activeTab as PageType | undefined;

  /* ── Sidebar item (desktop) ── */
  const SidebarItem = ({ item }: { item: GameNavItem }) => {
    const isActive = item.id === activeId;
    return (
      <button
        onClick={() => navigate(item.id)}
        title={item.label}
        aria-label={item.label}
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-lg
          transition-all duration-150 cursor-pointer
          ${isActive
            ? "text-[#00D4FF] bg-white/10"
            : "text-[#6B7280] hover:text-[#E5E7EB] hover:bg-white/5"
          }
        `}
      >
        {/* Active left indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-[#00D4FF]" />
        )}
        <item.Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
      </button>
    );
  };

  /* ── Mobile bottom bar item ── */
  const MobileBarItem = ({ item }: { item: GameNavItem }) => {
    const isActive = item.id === activeId;
    return (
      <button
        onClick={() => navigate(item.id)}
        aria-label={item.label}
        className={`
          flex flex-col items-center gap-1 py-2 px-3 rounded-lg
          transition-all duration-150 cursor-pointer min-w-0 flex-1
          ${isActive
            ? "text-[#00D4FF]"
            : "text-[#6B7280] active:text-[#E5E7EB]"
          }
        `}
      >
        <item.Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
        <span className="text-[10px] font-medium truncate max-w-[56px]">{item.label}</span>
      </button>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: "#0A0A12" }}
    >
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: NOISE_OVERLAY }}
        aria-hidden="true"
      />

      {/* ── Top bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-6 h-14"
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Left: Back to site */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#E5E7EB] transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-medium tracking-[0.08em] uppercase hidden sm:inline">
            Retour vers le site
          </span>
        </button>

        {/* Center: Page title */}
        <h1 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#E5E7EB] absolute left-1/2 -translate-x-1/2">
          {GAME_PAGES.find((p) => p.id === activeId)?.label ?? "Ascension"}
        </h1>

        {/* Right: User info or login */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 rounded-md text-[#6B7280] hover:text-rose-400 hover:bg-white/5 transition-all duration-150 cursor-pointer"
                title="Se déconnecter"
                aria-label="Se déconnecter"
              >
                <LogOut size={15} strokeWidth={1.8} />
              </button>
              <button
                onClick={() => navigate("profile")}
                className="flex items-center gap-2 cursor-pointer group"
              >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  className="w-7 h-7 rounded-full ring-1 ring-white/10 group-hover:ring-[#00D4FF]/40 transition-all duration-150"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={14} className="text-[#6B7280]" />
                </div>
              )}
              <span className="text-xs text-[#E5E7EB] hidden md:inline font-medium">
                {session.user.name || "Joueur"}
              </span>
            </button>
            </>
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium tracking-wide uppercase text-[#6B7280] hover:text-[#E5E7EB] hover:bg-white/5 transition-all duration-150 cursor-pointer"
            >
              Se connecter
            </button>
          )}
        </div>
      </header>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1 pt-14 md:pb-0 pb-20 relative z-10">
        {/* Desktop right sidebar */}
        <aside
          className="hidden md:flex flex-col items-center py-4 gap-1.5 fixed right-0 top-14 bottom-0 w-[72px] z-30"
          style={{
            backgroundColor: "rgba(10, 10, 18, 0.95)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {GAME_PAGES.map((item) => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </aside>

        {/* Content area */}
        <main className="flex-1 md:mr-[72px] overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 h-16"
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {GAME_PAGES.map((item) => (
          <MobileBarItem key={item.id} item={item} />
        ))}
      </nav>
    </div>
  );
}