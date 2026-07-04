import { create } from "zustand";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CmsContentEntry {
  page: string;
  elementKey: string;
  type: "text" | "image" | "background" | "style";
  value: string;
  metadata?: string | null;
}

export interface CmsStyleOverride {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
}

export interface CmsBackgroundConfig {
  type: "video" | "gif" | "image" | "gradient" | "none";
  url?: string;
  opacity?: number;
  blur?: number;
  gradient?: string;
  cover?: boolean;
}

export interface SelectedElement {
  page: string;
  elementKey: string;
  type: "text" | "image" | "background" | "style";
  rect?: DOMRect;
}

/* ------------------------------------------------------------------ */
/*  Available Google Fonts                                             */
/* ------------------------------------------------------------------ */

export const AVAILABLE_FONTS = [
  { family: "Cinzel", category: "serif" },
  { family: "Cinzel Decorative", category: "serif" },
  { family: "Uncial Antiqua", category: "serif" },
  { family: "MedievalSharp", category: "serif" },
  { family: "Philosopher", category: "sans-serif" },
  { family: "Cormorant Garamond", category: "serif" },
  { family: "Playfair Display", category: "serif" },
  { family: "Raleway", category: "sans-serif" },
  { family: "Montserrat", category: "sans-serif" },
  { family: "Lato", category: "sans-serif" },
  { family: "Roboto", category: "sans-serif" },
  { family: "Inter", category: "sans-serif" },
  { family: "Poppins", category: "sans-serif" },
  { family: "Oswald", category: "sans-serif" },
  { family: "Bebas Neue", category: "sans-serif" },
  { family: "Orbitron", category: "sans-serif" },
  { family: "Press Start 2P", category: "monospace" },
  { family: "Fira Code", category: "monospace" },
  { family: "Dancing Script", category: "handwriting" },
  { family: "Great Vibes", category: "handwriting" },
  { family: "Pacifico", category: "handwriting" },
  { family: "Lobster", category: "handwriting" },
  { family: "Abril Fatface", category: "serif" },
  { family: "Spectral", category: "serif" },
] as const;

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

interface CmsState {
  /* Edit mode */
  isEditMode: boolean;
  setEditMode: (val: boolean) => void;
  toggleEditMode: () => void;

  /* Content loaded from DB */
  contentMap: Record<string, CmsContentEntry>; // "page:elementKey" -> entry
  loadContent: (page: string) => Promise<void>;
  updateLocalContent: (page: string, elementKey: string, value: string, type?: string) => void;

  /* Selected element */
  selectedElement: SelectedElement | null;
  selectElement: (el: SelectedElement | null) => void;

  /* Save queue — debounced save */
  saveQueue: Record<string, { page: string; elementKey: string; type: string; value: string; metadata?: string }>;
  flushSave: () => Promise<void>;

  /* Dirty state */
  isDirty: boolean;
  markClean: () => void;

  /* Font loading */
  loadedFonts: Set<string>;
  loadFont: (family: string) => void;
}

export const useCms = create<CmsState>((set, get) => ({
  isEditMode: false,
  setEditMode: (val) => set({ isEditMode: val, selectedElement: null }),
  toggleEditMode: () => set((s) => ({ isEditMode: !s.isEditMode, selectedElement: null })),

  contentMap: {},
  loadContent: async (page) => {
    try {
      const res = await fetch(`/api/cms/content?page=${encodeURIComponent(page)}`);
      if (!res.ok) return;
      const data = await res.json();
      const entries: CmsContentEntry[] = data.entries || [];
      const map: Record<string, CmsContentEntry> = {};
      for (const e of entries) {
        map[`${e.page}:${e.elementKey}`] = e;
      }
      set({ contentMap: { ...get().contentMap, ...map } });
    } catch (err) {
      console.error("[CMS] Failed to load content:", err);
    }
  },

  updateLocalContent: (page, elementKey, value, type) => {
    const key = `${page}:${elementKey}`;
    const existing = get().contentMap[key];
    const entry: CmsContentEntry = {
      page,
      elementKey,
      type: (type || existing?.type || "text") as CmsContentEntry["type"],
      value,
      metadata: existing?.metadata,
    };
    set((s) => ({
      contentMap: { ...s.contentMap, [key]: entry },
      isDirty: true,
      saveQueue: {
        ...s.saveQueue,
        [key]: { page, elementKey, type: entry.type, value },
      },
    }));
    // Auto-debounce save is handled by the subscription below
  },

  flushSave: async () => {
    const queue = { ...get().saveQueue };
    if (Object.keys(queue).length === 0) return;

    set({ saveQueue: {} });

    try {
      const res = await fetch("/api/cms/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: Object.values(queue) }),
      });
      if (!res.ok) {
        // Re-add to queue on failure
        set((s) => ({ saveQueue: { ...s.saveQueue, ...queue } }));
      }
    } catch (err) {
      console.error("[CMS] Save failed:", err);
      set((s) => ({ saveQueue: { ...s.saveQueue, ...queue } }));
    }
  },

  saveQueue: {},

  selectedElement: null,
  selectElement: (el) => set({ selectedElement: el }),

  isDirty: false,
  markClean: () => set({ isDirty: false }),

  loadedFonts: new Set<string>(),
  loadFont: (family) => {
    if (get().loadedFonts.has(family)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
    set((s) => ({ loadedFonts: new Set([...s.loadedFonts, family]) }));
  },
}));

/* ------------------------------------------------------------------ */
/*  Debounced flush — 1.5s after last change                          */
/* ------------------------------------------------------------------ */

let _flushTimer: ReturnType<typeof setTimeout> | null = null;

useCms.subscribe((state) => {
  if (Object.keys(state.saveQueue).length > 0) {
    if (_flushTimer) clearTimeout(_flushTimer);
    _flushTimer = setTimeout(() => {
      useCms.getState().flushSave();
      _flushTimer = null;
    }, 1500);
  }
});