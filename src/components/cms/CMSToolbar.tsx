"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useCms,
  type CmsStyleOverride,
  type SelectedElement,
  AVAILABLE_FONTS,
} from "@/store/cmsStore";
import {
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Strikethrough,
  Save,
  X,
  ChevronDown,
  Undo2,
  Palette,
  Baseline,
  Trash2,
  Check,
  Loader2,
  Eye,
  EyeOff,
  RotateCcw,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Film,
  Upload,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Font size options                                                  */
/* ------------------------------------------------------------------ */

const FONT_SIZES = ["0.6rem", "0.65rem", "0.7rem", "0.75rem", "0.8rem", "0.85rem", "0.9rem", "1rem", "1.1rem", "1.2rem", "1.25rem", "1.5rem", "1.75rem", "2rem", "2.5rem", "3rem", "4rem"];

const FONT_WEIGHTS = [
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semi Bold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Extra Bold", value: "800" },
  { label: "Black", value: "900" },
];

const TEXT_COLORS = [
  "#FFFFFF", "#E8E6E3", "#C9A84C", "#4ECDC4", "#7B2FBE",
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6",
  "#8B5CF6", "#EC4899", "#F43F5E", "#06B6D4", "#94A3B8",
  "#D4AF37", "#FF6B35", "#1DB954", "#E5E5E5", "#171717",
];

/* ------------------------------------------------------------------ */
/*  Main Toolbar Component                                              */
/* ------------------------------------------------------------------ */

export default function CMSToolbar() {
  const {
    isEditMode,
    setEditMode,
    selectedElement,
    selectElement,
    contentMap,
    updateLocalContent,
    flushSave,
    isDirty,
    loadFont,
    saveQueue,
  } = useCms();

  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close pickers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowFontPicker(false);
        setShowSizePicker(false);
        setShowWeightPicker(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isEditMode) return null;

  const sel = selectedElement;
  const contentKey = sel ? `${sel.page}:${sel.elementKey}` : null;
  const savedEntry = contentKey ? contentMap[contentKey] : null;
  const currentStyle: CmsStyleOverride = savedEntry?.metadata
    ? JSON.parse(savedEntry.metadata)
    : {};

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await flushSave();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStyleChange = (partial: Partial<CmsStyleOverride>) => {
    if (!sel || sel.type !== "text") return;
    const newStyle = { ...currentStyle, ...partial };
    const metadata = JSON.stringify(newStyle);
    // Save style as metadata on the text entry
    const existingText = savedEntry?.type === "text" ? savedEntry.value : "";
    updateLocalContent(sel.page, sel.elementKey, existingText, "text");

    // We need to also update the metadata — do a direct API call
    fetch("/api/cms/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entries: [{
          page: sel.page,
          elementKey: sel.elementKey,
          type: "text",
          value: savedEntry?.value || "",
          metadata,
        }],
      }),
    }).then(async (res) => {
      if (res.ok) {
        // Update local store
        const map = { ...useCms.getState().contentMap };
        const key = `${sel.page}:${sel.elementKey}`;
        if (map[key]) {
          map[key] = { ...map[key], metadata };
        } else {
          map[key] = { page: sel.page, elementKey: sel.elementKey, type: "text", value: "", metadata };
        }
        useCms.setState({ contentMap: map });
      }
    });

    // Load font if changed
    if (partial.fontFamily) loadFont(partial.fontFamily);
  };

  const handleResetStyle = () => {
    if (!sel) return;
    fetch("/api/cms/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entries: [{
          page: sel.page,
          elementKey: sel.elementKey,
          type: "text",
          value: savedEntry?.value || "",
          metadata: null,
        }],
      }),
    }).then((res) => {
      if (res.ok) {
        const map = { ...useCms.getState().contentMap };
        const key = `${sel.page}:${sel.elementKey}`;
        if (map[key]) {
          map[key] = { ...map[key], metadata: null };
        }
        useCms.setState({ contentMap: map });
      }
    });
  };

  const handleResetContent = () => {
    if (!sel) return;
    fetch("/api/cms/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: sel.page, elementKey: sel.elementKey }),
    }).then((res) => {
      if (res.ok) {
        const map = { ...useCms.getState().contentMap };
        delete map[`${sel.page}:${sel.elementKey}`];
        useCms.setState({ contentMap: map, selectedElement: null });
      }
    });
  };

  const isTextSelected = sel?.type === "text";
  const isImageSelected = sel?.type === "image";
  const isBackgroundSelected = sel?.type === "background";
  const queueCount = Object.keys(saveQueue).length;

  return (
    <>
      {/* Top banner — Edit mode indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-[9000] flex items-center justify-between px-4 h-10"
        style={{
          background: "linear-gradient(90deg, rgba(37,99,235,0.95), rgba(59,130,246,0.95))",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 16px rgba(37,99,235,0.3)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white">
            <Type size={14} />
            <span className="font-display text-[11px] tracking-[0.15em] uppercase">Mode Édition CMS</span>
          </div>
          {sel && (
            <div className="flex items-center gap-2">
              <span className="text-blue-200 text-[11px]">Édition:</span>
              <span className="text-white text-[11px] bg-white/15 px-2 py-0.5 rounded font-mono">
                {sel.elementKey}
              </span>
            </div>
          )}
          {queueCount > 0 && (
            <span className="text-blue-200 text-[10px] animate-pulse">
              {queueCount} modification{queueCount > 1 ? "s" : ""} en attente...
            </span>
          )}
          {showSaved && (
            <span className="text-green-300 text-[10px] flex items-center gap-1">
              <Check size={10} /> Sauvegardé !
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-white bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          )}
          <button
            onClick={() => setEditMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <EyeOff size={12} />
            Quitter
          </button>
        </div>
      </div>

      {/* Floating property toolbar — shows when an element is selected */}
      {sel && (
        <div
          ref={toolbarRef}
          className="fixed z-[9001] left-1/2 -translate-x-1/2"
          style={{
            top: "52px",
            background: "rgba(10,10,18,0.97)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "10px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.08)",
            backdropFilter: "blur(24px)",
            padding: "6px 8px",
          }}
        >
          <div className="flex items-center gap-1">
            {/* ── TEXT TOOLS ── */}
            {isTextSelected && (
              <>
                {/* Font family picker */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowFontPicker(!showFontPicker);
                      setShowSizePicker(false);
                      setShowWeightPicker(false);
                      setShowColorPicker(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] text-gray-300 hover:text-white hover:bg-white/5 transition-colors max-w-[140px]"
                  >
                    <Baseline size={12} />
                    <span className="truncate">{currentStyle.fontFamily || "Police..."}</span>
                    <ChevronDown size={10} className="opacity-50 shrink-0" />
                  </button>
                  {showFontPicker && (
                    <div
                      className="absolute top-full left-0 mt-1 w-56 max-h-64 overflow-y-auto rounded-lg py-1"
                      style={{
                        background: "rgba(10,10,18,0.98)",
                        border: "1px solid rgba(59,130,246,0.2)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                      }}
                    >
                      {AVAILABLE_FONTS.map((f) => (
                        <button
                          key={f.family}
                          onClick={() => {
                            handleStyleChange({ fontFamily: f.family });
                            setShowFontPicker(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[12px] hover:bg-white/5 transition-colors ${
                            currentStyle.fontFamily === f.family ? "text-blue-400 bg-blue-500/10" : "text-gray-300"
                          }`}
                          style={{ fontFamily: f.family }}
                        >
                          {f.family}
                          <span className="text-[9px] text-gray-500 ml-2">{f.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Font size picker */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSizePicker(!showSizePicker);
                      setShowFontPicker(false);
                      setShowWeightPicker(false);
                      setShowColorPicker(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Type size={12} />
                    <span className="w-10 text-center">{currentStyle.fontSize || "Taille"}</span>
                    <ChevronDown size={10} className="opacity-50" />
                  </button>
                  {showSizePicker && (
                    <div
                      className="absolute top-full left-0 mt-1 w-20 max-h-56 overflow-y-auto rounded-lg py-1"
                      style={{
                        background: "rgba(10,10,18,0.98)",
                        border: "1px solid rgba(59,130,246,0.2)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                      }}
                    >
                      {FONT_SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleStyleChange({ fontSize: s });
                            setShowSizePicker(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5 transition-colors ${
                            currentStyle.fontSize === s ? "text-blue-400 bg-blue-500/10" : "text-gray-300"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Weight picker */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowWeightPicker(!showWeightPicker);
                      setShowFontPicker(false);
                      setShowSizePicker(false);
                      setShowColorPicker(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Bold size={12} />
                    <span className="w-12 text-center">{currentStyle.fontWeight || "Poids"}</span>
                    <ChevronDown size={10} className="opacity-50" />
                  </button>
                  {showWeightPicker && (
                    <div
                      className="absolute top-full left-0 mt-1 w-28 rounded-lg py-1"
                      style={{
                        background: "rgba(10,10,18,0.98)",
                        border: "1px solid rgba(59,130,246,0.2)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                      }}
                    >
                      {FONT_WEIGHTS.map((w) => (
                        <button
                          key={w.value}
                          onClick={() => {
                            handleStyleChange({ fontWeight: w.value });
                            setShowWeightPicker(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5 transition-colors ${
                            currentStyle.fontWeight === w.value ? "text-blue-400 bg-blue-500/10" : "text-gray-300"
                          }`}
                          style={{ fontWeight: w.value as unknown as number }}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Color picker */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowColorPicker(!showColorPicker);
                      setShowFontPicker(false);
                      setShowSizePicker(false);
                      setShowWeightPicker(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-sm border border-white/20"
                      style={{ background: currentStyle.color || "#E8E6E3" }}
                    />
                    <ChevronDown size={10} className="opacity-50" />
                  </button>
                  {showColorPicker && (
                    <div
                      className="absolute top-full left-0 mt-1 p-3 rounded-lg"
                      style={{
                        background: "rgba(10,10,18,0.98)",
                        border: "1px solid rgba(59,130,246,0.2)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                        width: "200px",
                      }}
                    >
                      <p className="text-[9px] text-gray-500 mb-2 uppercase tracking-wider">Couleur du texte</p>
                      <div className="grid grid-cols-5 gap-1.5 mb-2">
                        {TEXT_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              handleStyleChange({ color: c });
                              setShowColorPicker(false);
                            }}
                            className="w-7 h-7 rounded-md border transition-transform hover:scale-110"
                            style={{
                              background: c,
                              borderColor: currentStyle.color === c ? "#3B82F6" : "rgba(255,255,255,0.1)",
                              boxShadow: currentStyle.color === c ? "0 0 8px rgba(59,130,246,0.4)" : "none",
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentStyle.color || "#E8E6E3"}
                          onChange={(e) => handleStyleChange({ color: e.target.value })}
                          className="w-7 h-7 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={currentStyle.color || ""}
                          onChange={(e) => handleStyleChange({ color: e.target.value })}
                          placeholder="#HEX"
                          className="flex-1 bg-white/5 text-[11px] text-white px-2 py-1 rounded outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Text formatting buttons */}
                <button
                  onClick={() => handleStyleChange({ fontStyle: currentStyle.fontStyle === "italic" ? undefined : "italic" })}
                  className={`p-1.5 rounded-md transition-colors ${currentStyle.fontStyle === "italic" ? "text-blue-400 bg-blue-500/15" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  title="Italique"
                >
                  <Italic size={13} />
                </button>
                <button
                  onClick={() => handleStyleChange({ textDecoration: currentStyle.textDecoration === "underline" ? undefined : "underline" })}
                  className={`p-1.5 rounded-md transition-colors ${currentStyle.textDecoration === "underline" ? "text-blue-400 bg-blue-500/15" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  title="Souligné"
                >
                  <Underline size={13} />
                </button>
                <button
                  onClick={() => handleStyleChange({ textDecoration: currentStyle.textDecoration === "line-through" ? undefined : "line-through" })}
                  className={`p-1.5 rounded-md transition-colors ${currentStyle.textDecoration === "line-through" ? "text-blue-400 bg-blue-500/15" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  title="Barré"
                >
                  <Strikethrough size={13} />
                </button>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Alignment */}
                <button
                  onClick={() => handleStyleChange({ textAlign: "left" })}
                  className={`p-1.5 rounded-md transition-colors ${currentStyle.textAlign === "left" ? "text-blue-400 bg-blue-500/15" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  title="Aligner à gauche"
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  onClick={() => handleStyleChange({ textAlign: "center" })}
                  className={`p-1.5 rounded-md transition-colors ${currentStyle.textAlign === "center" ? "text-blue-400 bg-blue-500/15" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  title="Centrer"
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  onClick={() => handleStyleChange({ textAlign: "right" })}
                  className={`p-1.5 rounded-md transition-colors ${currentStyle.textAlign === "right" ? "text-blue-400 bg-blue-500/15" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  title="Aligner à droite"
                >
                  <AlignRight size={13} />
                </button>
                <button
                  onClick={() => handleStyleChange({ textAlign: "justify" })}
                  className={`p-1.5 rounded-md transition-colors ${currentStyle.textAlign === "justify" ? "text-blue-400 bg-blue-500/15" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  title="Justifier"
                >
                  <AlignJustify size={13} />
                </button>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Letter spacing */}
                <div className="flex items-center gap-1 px-1">
                  <span className="text-[9px] text-gray-500">Espacement</span>
                  <input
                    type="text"
                    value={currentStyle.letterSpacing || ""}
                    onChange={(e) => handleStyleChange({ letterSpacing: e.target.value })}
                    placeholder="0.12em"
                    className="w-14 bg-white/5 text-[10px] text-white px-1.5 py-1 rounded outline-none text-center"
                  />
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Text transform */}
                <div className="relative">
                  <button
                    onClick={() => {
                      const current = currentStyle.textTransform;
                      const next = current === "uppercase" ? "lowercase" : current === "lowercase" ? "capitalize" : "uppercase";
                      handleStyleChange({ textTransform: current === next ? undefined : next });
                    }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-[10px] font-display"
                    title="Transform (Majuscules / minuscules / Première lettre)"
                  >
                    Aa
                  </button>
                </div>
              </>
            )}

            {/* ── IMAGE TOOLS ── */}
            {isImageSelected && (
              <>
                <span className="text-gray-400 text-[11px] px-2 flex items-center gap-1.5">
                  <ImageIcon size={12} />
                  Image sélectionnée
                </span>
                <span className="text-gray-500 text-[10px] font-mono px-2">{sel.elementKey}</span>
              </>
            )}

            {/* ── BACKGROUND TOOLS ── */}
            {isBackgroundSelected && (
              <>
                <span className="text-gray-400 text-[11px] px-2 flex items-center gap-1.5">
                  <Palette size={12} />
                  Fond de section
                </span>
                <span className="text-gray-500 text-[10px] font-mono px-2">{sel.elementKey}</span>
              </>
            )}

            {/* ── COMMON: Deselect / Reset ── */}
            <div className="w-px h-5 bg-white/10 mx-0.5" />
            <button
              onClick={handleResetStyle}
              className="p-1.5 rounded-md text-gray-400 hover:text-amber-400 hover:bg-amber-400/5 transition-colors"
              title="Réinitialiser le style"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={handleResetContent}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-colors"
              title="Supprimer la modification"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={() => selectElement(null)}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Désélectionner"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Edit mode padding offset (for the top banner) */}
      <div className="h-10" />
    </>
  );
}