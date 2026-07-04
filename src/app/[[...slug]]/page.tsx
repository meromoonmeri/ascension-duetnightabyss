"use client";

import { Component, useState, useEffect, useRef, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useNavigation, initUrlSync } from "@/store/navigationStore";
import { useCms } from "@/store/cmsStore";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import RubriqueApp from "@/components/rubrique/RubriqueApp";

// Layout — always loaded (small, shared)
import Preloader from "@/components/layout/Preloader";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import CMSToolbar from "@/components/cms/CMSToolbar";
import GamePageShell from "@/components/layout/GamePageShell";

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
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      background: "#000",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "20px",
          height: "20px",
          border: "2px solid #baae93",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <span className="font-worldtext" style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15rem" }}>
          CHARGEMENT…
        </span>
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
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          padding: "24px",
          textAlign: "center",
          background: "#000",
        }}>
          <div style={{
            marginBottom: "24px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.4rem",
          }}>
            ⚠️
          </div>
          <h2 className="font-worldtext" style={{
            marginBottom: "8px",
            fontSize: "1.8rem",
            color: "#e0dabb",
            letterSpacing: "0.05rem",
          }}>
            Erreur de chargement
          </h2>
          <p style={{
            marginBottom: "16px",
            maxWidth: "400px",
            fontSize: "1.4rem",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.5)",
          }}>
            {this.props.pageName
              ? `La page "${this.props.pageName}" a rencontré une erreur.`
              : "Cette page a rencontré une erreur."}
          </p>
          {this.state.error && (
            <p style={{
              marginBottom: "24px",
              maxWidth: "500px",
              fontSize: "1.2rem",
              fontFamily: "monospace",
              color: "rgba(255,100,100,0.7)",
              background: "rgba(255,100,100,0.05)",
              borderRadius: "4px",
              padding: "8px 16px",
            }}>
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="font-worldtext"
            style={{
              border: "none",
              outline: "none",
              cursor: "pointer",
              fontSize: "1.3rem",
              color: "#000",
              background: "#baae93",
              padding: "12px 32px",
              borderRadius: "2px",
              letterSpacing: "0.1rem",
            }}
          >
            RÉESSAYER
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
  const { isEditMode, loadContent } = useCms();
  const { data: session } = useSession();
  const contentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [rubriqueActive, setRubriqueActive] = useState(false);

  // Skip preloader for non-root paths
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

  // CMS edit mode
  useEffect(() => {
    if (!isEditMode) return;
    loadContent(currentPage);
  }, [currentPage, isEditMode, loadContent]);

  // URL sync
  useEffect(() => {
    useNavigation.getState().hydrateFromUrl();
    return initUrlSync();
  }, []);

  // Safety timeout for preloader
  useEffect(() => {
    if (preloaderComplete) return;
    const t = setTimeout(() => setPreloaderComplete(true), 6000);
    return () => clearTimeout(t);
  }, [preloaderComplete, setPreloaderComplete]);

  // OAuth error handling
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

  // Scroll to top on page change
  useEffect(() => {
    if (preloaderComplete) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [currentPage, preloaderComplete]);

  const isGamePage = GAME_PAGE_IDS.includes(currentPage);
  const isHomePage = currentPage === "home";

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
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      {!preloaderComplete && <Preloader onComplete={() => setPreloaderComplete(true)} />}

      {/* DNA Header: always visible on all pages */}
      {preloaderComplete && !isGamePage && <Header />}

      <div
        style={{
          display: rubriqueActive ? "none" : "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "#000",
        }}
      >
        <main
          ref={contentRef}
          style={{
            flex: 1,
            background: "#000",
          }}
          key={currentPage}
        >
          {renderPage()}
        </main>

        {/* Footer: show on all non-home, non-game pages */}
        {preloaderComplete && !isHomePage && !isGamePage && <Footer />}
      </div>

      <SearchOverlay />
      <CMSToolbar />

      {/* Session logout button on home */}
      {currentPage === "home" && session?.user && preloaderComplete && (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            fontSize: "1.2rem",
            transition: "all 0.2s ease",
          }}
          title="Se déconnecter"
          aria-label="Se déconnecter"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
          }}
        >
          {session.user.image && (
            <img
              src={session.user.image}
              alt=""
              style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          )}
          <span style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session.user.name}
          </span>
          <LogOut size={13} style={{ opacity: 0.6 }} />
        </button>
      )}

      {/* Rubrique portal */}
      {currentPage === "home" && preloaderComplete && (
        <RubriqueApp isActive={rubriqueActive} onEnter={() => setRubriqueActive(true)} onExit={() => setRubriqueActive(false)} />
      )}
    </>
  );
}