"use client";

import { Component, useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useNavigation, initUrlSync } from "@/store/navigationStore";
import { useCms } from "@/store/cmsStore";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useAudioNavigation } from "@/hooks/useAudioNavigation";
import { playThemeToggle } from "@/lib/audioEngine";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import RubriqueApp from "@/components/rubrique/RubriqueApp";

// Layout — always loaded (small, shared)
import Preloader from "@/components/layout/Preloader";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import AudioControls from "@/components/layout/AudioControls";
import GamePageShell from "@/components/layout/GamePageShell";
import CMSToolbar from "@/components/cms/CMSToolbar";

// Core pages — loaded immediately (small, first-paint critical)
import HomePage from "@/components/home/HomePage";

// ─── Lazy-loaded pages (loaded on demand) ───────────────────
const RaceGridPage = lazy(() => import("@/components/races/RaceGridPage"));
const RaceDetailPage = lazy(() => import("@/components/races/RaceDetailPage"));
const ArtGridPage = lazy(() => import("@/components/arts/ArtPages").then(m => ({ default: m.ArtGridPage })));
const ArtDetailPage = lazy(() => import("@/components/arts/ArtPages").then(m => ({ default: m.ArtDetailPage })));
const CosmologyPage = lazy(() => import("@/components/cosmology/CosmologyPage"));
const CosmologyDetailPage = lazy(() => import("@/components/cosmology/DetailPage"));
const TechniqueDisplayPage = lazy(() => import("@/components/technique/TechniqueDisplayPage"));
const SkillTreePage = lazy(() => import("@/components/skilltree/SkillTreePage"));
const AdminPage = lazy(() => import("@/components/admin/AdminPage"));
const CMSPage = lazy(() => import("@/components/admin/CMSPage"));
const WorldMapPage = lazy(() => import("@/components/geography/WorldMapPage"));
const FactionsPage = lazy(() => import("@/components/factions/FactionsPage"));
const FactionDetailPage = lazy(() => import("@/components/factions/FactionDetailPage"));
const GrimoirePage = lazy(() => import("@/components/grimoire/GrimoirePage"));
const ArtefactsPage = lazy(() => import("@/components/artefacts/ArtefactsPage"));
const TechnologiePage = lazy(() => import("@/components/technologie/TechnologiePage"));
const ScalingPage = lazy(() => import("@/components/scaling/ScalingPage"));
const KingdomsPage = lazy(() => import("@/components/geography/KingdomsPage"));
const ProfilePage = lazy(() => import("@/components/profile/ProfilePage"));
const ShopPage = lazy(() => import("@/components/shop/ShopPage"));
const BotDashboard = lazy(() => import("@/components/bot/BotDashboard"));
const NewsPage = lazy(() => import("@/components/news/NewsPage"));
const CommunityPage = lazy(() => import("@/components/community/CommunityPage"));
const EventsPage = lazy(() => import("@/components/community/EventsPage"));
const QuestsPage = lazy(() => import("@/components/community/QuestsPage"));
const BankPage = lazy(() => import("@/components/bank/BankPage"));

// ─── Game pages config ──────────────────────────────────────
const GAME_PAGE_IDS = ["shop", "bank", "events", "quests", "profile"];

// ─── Minimal page loader ────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
        />
        <span className="font-display text-xs tracking-[0.2em] text-txt-tertiary uppercase">Chargement…</span>
      </div>
    </div>
  );
}

// ─── Error boundary for lazy-loaded pages ─────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PageErrorBoundary extends Component<
  { children: React.ReactNode; pageName?: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; pageName?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[PageError] ${this.props.pageName || "Unknown"} page crashed:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08]">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-[#E5E7EB]">
            Erreur de chargement
          </h2>
          <p className="mb-2 max-w-md text-sm leading-relaxed text-[#9CA3AF]">
            {this.props.pageName
              ? `La page "${this.props.pageName}" a rencontré une erreur.`
              : "Cette page a rencontré une erreur."
            }
          </p>
          {this.state.error && (
            <p className="mb-6 max-w-lg text-xs font-mono text-rose-400/70 bg-rose-400/5 rounded-lg px-4 py-2">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="rounded-xl bg-[#00D4FF] px-8 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PageWrapper() {
  return (
    <Suspense fallback={null}>
      <AscensionWiki />
    </Suspense>
  );
}

function AscensionWiki() {
  const {
    currentPage,
    preloaderComplete,
    setPreloaderComplete,
  } = useNavigation();
  const { isDark, toggleTheme } = useTheme();
  const { isEditMode, loadContent } = useCms();
  const { data: session } = useSession();
  const contentRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [rubriqueActive, setRubriqueActive] = useState(false);

  useEffect(() => {
    if (searchParams.get('bot') === 'true') {
      setPreloaderComplete(true);
    }
  }, [searchParams, setPreloaderComplete]);

  useEffect(() => {
    if (preloaderComplete) return;
    const path = window.location.pathname;
    if (path !== "/" && path !== "") {
      const timer = setTimeout(() => setPreloaderComplete(true), 300);
      return () => clearTimeout(timer);
    }
  }, [preloaderComplete, setPreloaderComplete]);

  useAudioNavigation();

  useEffect(() => {
    if (!isEditMode) return;
    loadContent(currentPage);
  }, [currentPage, isEditMode, loadContent]);

  useEffect(() => {
    useNavigation.getState().hydrateFromUrl();
    return initUrlSync();
  }, []);

  useEffect(() => {
    if (preloaderComplete) return;
    const t = setTimeout(() => setPreloaderComplete(true), 6000);
    return () => clearTimeout(t);
  }, [preloaderComplete, setPreloaderComplete]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const messages: Record<string, string> = {
        OAuthCallback: "La connexion Discord a échoué.",
        OAuthAccountNotLinked: "Ce compte Discord est déjà lié à un autre utilisateur.",
        Configuration: "Erreur de configuration OAuth.",
        AccessDenied: "Autorisation refusée par Discord.",
        Callback: "Erreur lors du retour de Discord.",
      };
      toast.error(messages[error] || `Erreur d'authentification: ${error}`, { duration: 8000 });
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const themeTransition = useCallback(
    (e: React.MouseEvent) => {
      playThemeToggle();
      const x = e.clientX;
      const y = e.clientY;
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9500; pointer-events: none;
        border-radius: 50%; transform: scale(0);
        transform-origin: ${x}px ${y}px;
      `;
      overlay.style.background = isDark
        ? "radial-gradient(circle, rgba(245,240,232,1) 0%, rgba(245,240,232,0.95) 50%, rgba(245,240,232,0.8) 100%)"
        : "radial-gradient(circle, rgba(10,10,15,1) 0%, rgba(10,10,15,0.95) 50%, rgba(10,10,15,0.8) 100%)";
      document.body.appendChild(overlay);
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        gsap.to(overlay, {
          opacity: 0.7, duration: 0.3,
          onComplete: () => {
            toggleTheme(e);
            gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => overlay.remove() });
          },
        });
      } else {
        const tl = gsap.timeline();
        tl.to(overlay, {
          scale: 5, duration: 0.5, ease: "power2.in",
          onComplete: () => toggleTheme(e),
        }).to(overlay, {
          scale: 8, opacity: 0, duration: 0.4, ease: "power2.out",
          onComplete: () => overlay.remove(),
        }, "+=0.05");
      }
    },
    [isDark, toggleTheme]
  );

  useEffect(() => {
    if (!preloaderComplete) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    const elements = document.querySelectorAll(".gacha-reveal");
    elements.forEach((el) => observer.observe(el));
    const mutationObs = new MutationObserver(() => {
      const newElements = document.querySelectorAll(".gacha-reveal:not(.revealed)");
      newElements.forEach((el) => observer.observe(el));
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutationObs.disconnect();
    };
  }, [currentPage, preloaderComplete]);

  useEffect(() => {
    if (preloaderComplete) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [currentPage, preloaderComplete]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__ascensionThemeTransition = themeTransition;
    return () => {
      delete (window as unknown as Record<string, unknown>).__ascensionThemeTransition;
    };
  }, [themeTransition]);

  const isGamePage = GAME_PAGE_IDS.includes(currentPage);

  const SafePage = ({ children, name }: { children: React.ReactNode; name: string }) => (
    <PageErrorBoundary pageName={name}>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </PageErrorBoundary>
  );

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "cosmology":
        return <SafePage name="Cosmologie"><CosmologyPage /></SafePage>;
      case "cosmology-detail":
        return <SafePage name="Cosmologie"><CosmologyDetailPage /></SafePage>;
      case "geography":
        return <SafePage name="Géographie"><WorldMapPage /></SafePage>;
      case "geography-detail":
        return <SafePage name="Géographie"><CosmologyDetailPage /></SafePage>;
      case "royaumes":
        return <SafePage name="Royaumes"><KingdomsPage /></SafePage>;
      case "arts":
        return <SafePage name="Arts"><ArtGridPage /></SafePage>;
      case "art-detail":
        return <SafePage name="Art"><ArtDetailPage /></SafePage>;
      case "races":
        return <SafePage name="Races"><RaceGridPage /></SafePage>;
      case "race-detail":
        return <SafePage name="Race"><RaceDetailPage /></SafePage>;
      case "race-technique":
        return <SafePage name="Technique"><TechniqueDisplayPage /></SafePage>;
      case "skilltree":
        return <SafePage name="Arbre de compétences"><SkillTreePage /></SafePage>;
      case "factions":
        return <SafePage name="Factions"><FactionsPage /></SafePage>;
      case "faction-detail":
        return <SafePage name="Faction"><FactionDetailPage /></SafePage>;
      case "grimoire":
        return <SafePage name="Grimoire"><GrimoirePage /></SafePage>;
      case "admin":
        return <SafePage name="Admin"><AdminPage /></SafePage>;
      case "cms":
        return <SafePage name="CMS"><CMSPage /></SafePage>;
      case "artefacts":
        return <SafePage name="Artefacts"><ArtefactsPage /></SafePage>;
      case "technomagie":
        return <SafePage name="Technomagie"><TechnologiePage /></SafePage>;
      case "scaling":
        return <SafePage name="Scaling"><ScalingPage /></SafePage>;
      case "profile":
        return (
          <SafePage name="Profil">
            <GamePageShell activeTab="profile">
              <ProfilePage />
            </GamePageShell>
          </SafePage>
        );
      case "shop":
        return (
          <SafePage name="Boutique">
            <GamePageShell activeTab="shop">
              <ShopPage />
            </GamePageShell>
          </SafePage>
        );
      case "bot":
        return <SafePage name="Bot Dashboard"><BotDashboard /></SafePage>;
      case "news":
        return <SafePage name="Boîte aux Lettres"><NewsPage /></SafePage>;
      case "community":
        return <SafePage name="Communauté"><CommunityPage /></SafePage>;
      case "events":
        return (
          <SafePage name="Événements">
            <GamePageShell activeTab="events">
              <EventsPage />
            </GamePageShell>
          </SafePage>
        );
      case "quests":
        return (
          <SafePage name="Quêtes">
            <GamePageShell activeTab="quests">
              <QuestsPage />
            </GamePageShell>
          </SafePage>
        );
      case "bank":
        return (
          <SafePage name="Banque">
            <GamePageShell activeTab="bank">
              <BankPage />
            </GamePageShell>
          </SafePage>
        );
      // rubrique is handled as overlay, not as a page route
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      {!preloaderComplete && <Preloader onComplete={() => setPreloaderComplete(true)} />}
      <div ref={transitionRef} />
      <div className="min-h-screen flex flex-col" style={{ display: rubriqueActive ? "none" : "flex" }}>
        {!isGamePage && currentPage !== "home" && (
          <Header mode="compact" onThemeToggle={themeTransition} />
        )}
        <main ref={contentRef} className="flex-1" key={currentPage}>
          {renderPage()}
        </main>
        {!isGamePage && currentPage !== "home" && <Footer />}
      </div>
      <SearchOverlay />
      {currentPage === "home" && session?.user && preloaderComplete && (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="fixed top-5 right-5 z-[90] flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          title="Se déconnecter"
          aria-label="Se déconnecter"
        >
          {session.user.image && (
            <img
              src={session.user.image}
              alt=""
              className="w-6 h-6 rounded-full ring-1 ring-white/10"
            />
          )}
          <span className="text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors hidden sm:inline max-w-[80px] truncate">
            {session.user.name}
          </span>
          <LogOut size={13} className="text-white/40 group-hover:text-rose-400 transition-colors" />
        </button>
      )}
      {currentPage !== "home" && !isGamePage && <AudioControls />}
      <CMSToolbar />

      {/* Rubrique portal — handles PortalButton when inactive, overlay when active */}
      {currentPage === "home" && preloaderComplete && (
        <RubriqueApp isActive={rubriqueActive} onEnter={() => setRubriqueActive(true)} onExit={() => setRubriqueActive(false)} />
      )}
    </>
  );
}