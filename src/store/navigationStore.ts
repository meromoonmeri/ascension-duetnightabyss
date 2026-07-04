import { create } from "zustand";

// Navigation types for the SPA router
export type PageType =
  | "home"
  | "cosmology"
  | "cosmology-detail"
  | "geography"
  | "geography-detail"
  | "royaumes"
  | "arts"
  | "art-detail"
  | "technique"
  | "races"
  | "race-detail"
  | "race-technique"
  | "admin"
  | "cms"
  | "bestiary"
  | "bestiary-detail"
  | "skilltree"
  | "factions"
  | "faction-detail"
  | "grimoire"
  | "artefacts"
  | "technomagie"
  | "scaling"
  | "search"
  | "profile"
  | "shop"
  | "bot"
  | "news"
  | "community"
  | "events"
  | "quests"
  | "bank";

/* ------------------------------------------------------------------ */
/*  URL ↔ Page mapping                                                 */
/* ------------------------------------------------------------------ */

function pageToUrl(page: PageType, params: Record<string, string> = {}): string {
  switch (page) {
    case "home":        return "/";
    case "profile":     return "/profile";
    case "races":       return "/races";
    case "race-detail": return `/races/${encodeURIComponent(params.name || "")}`;
    case "race-technique": return `/races/${encodeURIComponent(params.name || "")}/technique`;
    case "cosmology":       return "/cosmologie";
    case "cosmology-detail": return `/cosmologie/${encodeURIComponent(params.title || "")}`;
    case "geography":       return "/geographie";
    case "royaumes":        return "/royaumes";
    case "arts":            return "/arts";
    case "art-detail":      return `/arts/${encodeURIComponent(params.name || "")}`;
    case "bestiary":        return "/bestiaire";
    case "bestiary-detail": return `/bestiaire/${encodeURIComponent(params.name || "")}`;
    case "factions":        return "/factions";
    case "faction-detail":  return `/factions/${encodeURIComponent(params.name || "")}`;
    case "grimoire":        return "/grimoire";
    case "artefacts":       return "/artefacts";
    case "technomagie":     return "/technomagie";
    case "skilltree":       return "/skilltree";
    case "scaling":         return "/scaling";
    case "shop":            return "/boutique";
    case "bot":             return "/bot";
    case "news":            return "/news";
    case "community":        return "/communaute";
    case "events":           return "/communaute/events";
    case "quests":           return "/communaute/quetes";
    case "bank":             return "/banque";
    case "admin":           return "/admin";
    case "cms":             return "/cms";
    case "technique":       return `/technique/${encodeURIComponent(params.name || "")}`;
    case "geography-detail": return `/geographie/${encodeURIComponent(params.title || "")}`;
    case "search":          return "/";
    default:                return "/";
  }
}

/**
 * Parse a pathname back into { page, params }.
 * Order matters — more specific (longer) patterns must come first.
 */
function urlToPage(pathname: string): { page: PageType; params: Record<string, string> } {
  // Trim trailing slash (but keep root as "/")
  const path = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  const segments = path.split("/").filter(Boolean);

  // ─── /races/{name}/technique ───
  if (segments[0] === "races" && segments.length === 3 && segments[2] === "technique") {
    return { page: "race-technique", params: { name: decodeURIComponent(segments[1]) } };
  }
  // ─── /races/{name} ───
  if (segments[0] === "races" && segments.length === 2) {
    return { page: "race-detail", params: { name: decodeURIComponent(segments[1]) } };
  }
  // ─── /cosmologie/{title} ───
  if (segments[0] === "cosmologie" && segments.length === 2) {
    return { page: "cosmology-detail", params: { title: decodeURIComponent(segments[1]) } };
  }
  // ─── /arts/{name} ───
  if (segments[0] === "arts" && segments.length === 2) {
    return { page: "art-detail", params: { name: decodeURIComponent(segments[1]) } };
  }
  // ─── /bestiaire/{name} ───
  if (segments[0] === "bestiaire" && segments.length === 2) {
    return { page: "bestiary-detail", params: { name: decodeURIComponent(segments[1]) } };
  }
  // ─── /factions/{name} ───
  if (segments[0] === "factions" && segments.length === 2) {
    return { page: "faction-detail", params: { name: decodeURIComponent(segments[1]) } };
  }
  // ─── /geographie/{title} ───
  if (segments[0] === "geographie" && segments.length === 2) {
    return { page: "geography-detail", params: { title: decodeURIComponent(segments[1]) } };
  }
  // ─── /communaute/events ───
  if (segments[0] === "communaute" && segments.length === 2 && segments[1] === "events") {
    return { page: "events", params: {} };
  }
  // ─── /communaute/quetes ───
  if (segments[0] === "communaute" && segments.length === 2 && segments[1] === "quetes") {
    return { page: "quests", params: {} };
  }
  // ─── /banque ───
  if (segments[0] === "banque") {
    return { page: "bank", params: {} };
  }
  // ─── /technique/{name} ───
  if (segments[0] === "technique" && segments.length === 2) {
    return { page: "technique", params: { name: decodeURIComponent(segments[1]) } };
  }

  // ─── Exact slugs ───
  const slugMap: Record<string, PageType> = {
    "profile": "profile",
    "races": "races",
    "cosmologie": "cosmology",
    "geographie": "geography",
    "royaumes": "royaumes",
    "arts": "arts",
    "bestiaire": "bestiary",
    "factions": "factions",
    "grimoire": "grimoire",
    "artefacts": "artefacts",
    "technomagie": "technomagie",
    "skilltree": "skilltree",
    "scaling": "scaling",
    "boutique": "shop",
    "bot": "bot",
    "news": "news",
    "communaute": "community",
    "community": "community",
    "events": "events",
    "quests": "quests",
    "banque": "bank",
    "admin": "admin",
    "cms": "cms",
  };

  if (segments.length === 1 && slugMap[segments[0]]) {
    return { page: slugMap[segments[0]], params: {} };
  }

  // ─── Fallback: home ───
  return { page: "home", params: {} };
}

// Flag to prevent popstate from double-firing after goBack()
let _skipPopstate = false;

export type TransitionPhase = "idle" | "entering" | "leaving";

interface NavigationState {
  currentPage: PageType;
  pageParams: Record<string, string>;
  previousPage: PageType | null;
  isTransitioning: boolean;
  transitionPhase: TransitionPhase;
  // Pending navigation (committed at transition midpoint)
  pendingPage: PageType | null;
  pendingParams: Record<string, string>;
  // History for back navigation
  history: { page: PageType; params: Record<string, string> }[];
  navigate: (page: PageType, params?: Record<string, string>) => void;
  goBack: () => void;
  commitNavigation: () => void;
  setTransitioning: (val: boolean) => void;
  setTransitionPhase: (phase: TransitionPhase) => void;
  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  // Preloader
  preloaderComplete: boolean;
  setPreloaderComplete: (complete: boolean) => void;
  // URL sync
  hydrateFromUrl: () => void;
}

export const useNavigation = create<NavigationState>((set, get) => ({
  currentPage: "home",
  pageParams: {},
  previousPage: null,
  isTransitioning: false,
  transitionPhase: "idle" as TransitionPhase,
  pendingPage: null,
  pendingParams: {},
  history: [],
  searchOpen: false,
  mobileMenuOpen: false,
  preloaderComplete: false,

  navigate: (page, params = {}) => {
    const state = get();
    // Don't navigate if already on the same page with same params
    if (state.currentPage === page && JSON.stringify(state.pageParams) === JSON.stringify(params)) return;

    // Sync browser URL immediately (without reload)
    const url = pageToUrl(page, params);
    window.history.pushState({}, "", url);

    // Instant navigation — no transition
    set({
      previousPage: state.currentPage,
      currentPage: page,
      pageParams: params,
      history: [...state.history, { page: state.currentPage, params: state.pageParams }],
      mobileMenuOpen: false,
      searchOpen: false,
    });
  },

  goBack: () => {
    const state = get();
    if (state.history.length === 0) return;
    const prev = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);

    // Instant navigation — no transition
    set({
      previousPage: state.currentPage,
      currentPage: prev.page,
      pageParams: prev.params,
      history: newHistory,
      mobileMenuOpen: false,
    });

    // Sync browser URL via history.back() — popstate will fire but we skip it
    _skipPopstate = true;
    window.history.back();
  },

  /** No-op: kept for API compatibility, navigation is now instant */
  commitNavigation: () => {
    // Navigation is now instant — this is a no-op for backwards compatibility
  },

  setTransitioning: (val) => set({ isTransitioning: val }),
  setTransitionPhase: (phase) => set({ transitionPhase: phase }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setPreloaderComplete: (complete) => set({ preloaderComplete: complete }),

  hydrateFromUrl: () => {
    const { page, params } = urlToPage(window.location.pathname);
    const state = get();

    // Only update if different from current state
    if (state.currentPage === page && JSON.stringify(state.pageParams) === JSON.stringify(params)) return;

    // Instant navigation — set page immediately from URL
    set({
      previousPage: state.currentPage,
      currentPage: page,
      pageParams: params,
      history: [...state.history, { page: state.currentPage, params: state.pageParams }],
      mobileMenuOpen: false,
      searchOpen: false,
    });
  },
}));

/* ------------------------------------------------------------------ */
/*  popstate handler — call from page.tsx via initUrlSync()           */
/* ------------------------------------------------------------------ */

/**
 * Initialise browser URL ↔ store sync.
 * Call once in a top-level useEffect. Returns a cleanup function.
 */
export function initUrlSync(): () => void {
  const handlePopState = () => {
    if (_skipPopstate) {
      _skipPopstate = false;
      return;
    }
    useNavigation.getState().hydrateFromUrl();
  };

  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}

// Breadcrumb helper
export function getBreadcrumbs(state: NavigationState): { label: string; page: PageType; params?: Record<string, string> }[] {
  const crumbs: { label: string; page: PageType; params?: Record<string, string> }[] = [
    { label: "Accueil", page: "home" },
  ];

  const { currentPage, pageParams } = state;

  switch (currentPage) {
    case "cosmology":
      crumbs.push({ label: "Cosmologie", page: "cosmology" });
      break;
    case "cosmology-detail":
      crumbs.push({ label: "Cosmologie", page: "cosmology" });
      crumbs.push({ label: pageParams.title || "Détail", page: currentPage, params: pageParams });
      break;
    case "geography":
      crumbs.push({ label: "Géographie & Factions", page: "geography" });
      break;
    case "geography-detail":
      crumbs.push({ label: "Géographie & Factions", page: "geography" });
      crumbs.push({ label: pageParams.title || "Détail", page: currentPage, params: pageParams });
      break;
    case "royaumes":
      crumbs.push({ label: "Les Nations de l'Ouest", page: "royaumes" });
      break;
    case "arts":
      crumbs.push({ label: "Arts", page: "arts" });
      break;
    case "art-detail":
      crumbs.push({ label: "Arts", page: "arts" });
      crumbs.push({ label: pageParams.name || "Art", page: currentPage, params: pageParams });
      break;
    case "races":
      crumbs.push({ label: "Races", page: "races" });
      break;
    case "race-detail":
      crumbs.push({ label: "Races", page: "races" });
      crumbs.push({ label: pageParams.name || "Race", page: currentPage, params: pageParams });
      break;
    case "race-technique":
    case "technique":
      crumbs.push({ label: "Technique", page: currentPage, params: pageParams });
      break;
    case "bestiary":
      crumbs.push({ label: "Bestiaire", page: "bestiary" });
      break;
    case "bestiary-detail":
      crumbs.push({ label: "Bestiaire", page: "bestiary" });
      crumbs.push({ label: pageParams.name || "Créature", page: currentPage, params: pageParams });
      break;
    case "skilltree":
      crumbs.push({ label: "Arbres de Compétences", page: "skilltree" });
      break;
    case "factions":
      crumbs.push({ label: "Factions", page: "factions" });
      break;
    case "faction-detail":
      crumbs.push({ label: "Factions", page: "factions" });
      crumbs.push({ label: pageParams.name || "Faction", page: currentPage, params: pageParams });
      break;
    case "grimoire":
      crumbs.push({ label: "Système d'Énergie", page: "grimoire" });
      break;
    case "artefacts":
      crumbs.push({ label: "Donjons & Artefacts", page: "artefacts" });
      break;
    case "technomagie":
      crumbs.push({ label: "Technomagie", page: "technomagie" });
      break;
    case "scaling":
      crumbs.push({ label: "Calculateur de Scaling", page: "scaling" });
      break;
    case "profile":
      crumbs.push({ label: "Mon Profil", page: "profile" });
      break;
    case "shop":
      crumbs.push({ label: "Boutique", page: "shop" });
      break;
    case "bot":
      crumbs.push({ label: "Bot Dashboard", page: "bot" });
      break;
    case "news":
      crumbs.push({ label: "Boîte aux Lettres", page: "news" });
      break;
    case "community":
      crumbs.push({ label: "Communauté", page: "community" });
      break;
    case "events":
      crumbs.push({ label: "Communauté", page: "community" });
      crumbs.push({ label: "Événements", page: "events" });
      break;
    case "quests":
      crumbs.push({ label: "Communauté", page: "community" });
      crumbs.push({ label: "Quêtes", page: "quests" });
      break;
    case "bank":
      crumbs.push({ label: "Banque", page: "bank" });
      break;
    case "admin":
      crumbs.push({ label: "Administration", page: "admin" });
      break;
  }

  return crumbs;
}