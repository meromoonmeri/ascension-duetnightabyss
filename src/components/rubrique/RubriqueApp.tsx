"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords, Shield, Skull, Globe, Sparkles,
  BookOpen, Pencil, Save, X, Loader2, Image as ImageIcon,
  Film, Menu, ChevronRight
} from "lucide-react";
import PortalTransition from "./PortalTransition";
import PortalButton from "./PortalButton";
import CompetencesSection from "./sections/CompetencesSection";
import ArtefactsSection from "./sections/ArtefactsSection";
import CreaturesSection from "./sections/CreaturesSection";
import MondeSection from "./sections/MondeSection";
import TechnomagieSection from "./sections/TechnomagieSection";
import RubriqueFiche, { type FicheItem } from "./RubriqueFiche";
import RubriqueEditModal from "./RubriqueEditModal";
import type { ItemCardData } from "./shared/ItemCard";

const ADMIN_DISCORD_ID = "722146261381415043";

/* ─── DNA Design Tokens (exact from computed styles) ─── */
const GOLD = "#E0DABB";
const GOLD_LIGHT = "#E0DABB";
const GOLD_DARK = "#BAAE93";
const GOLD_BORDER = "rgba(224, 218, 187, 0.15)";
const GOLD_BORDER_HOVER = "rgba(224, 218, 187, 0.35)";
const GOLD_GLOW = "rgba(224, 218, 187, 0.1)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_ACTIVE = "rgba(255,255,255,0.9)";
const TEXT_SECONDARY = "#C1B8A2";
const TEXT_BODY = "#C1B8A2";
const TEXT_TERTIARY = "#A4A4A4";
const TEXT_LINK = "#CAB99B";
const TEXT_MUTED = "#A7A7A7";
const SIDEBAR_WIDTH = 240;
const SIDEBAR_BORDER = "rgba(224, 218, 187, 0.1)";

/* ─── Types ─── */
interface RubriqueSection {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  backgroundImage: string | null;
  gifUrl: string | null;
  order: number;
}

/* ─── Constants ─── */
const SECTION_ICONS: Record<string, React.ReactNode> = {
  competences: <Swords size={28} />,
  artefacts: <Shield size={28} />,
  creatures: <Skull size={28} />,
  monde: <Globe size={28} />,
  index: <BookOpen size={28} />,
};

/* ─── Nav item base styles ─── */
const navItemBase: React.CSSProperties = {
  fontFamily: "'WorldText', serif",
  fontSize: "12px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "12px 0",
  width: "100%",
  textAlign: "left",
  transition: "color 0.2s ease",
  position: "relative",
};

/* ─── View state ─── */
type View = { mode: "index" } | { mode: "section"; slug: string } | { mode: "fiche"; item: FicheItem };

/* ─── Component ─── */
interface RubriqueAppProps {
  isActive: boolean;
  onEnter: () => void;
  onExit: () => void;
}

export { PortalButton };

export default function RubriqueApp({ isActive, onEnter, onExit }: RubriqueAppProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.id === ADMIN_DISCORD_ID;

  const [sections, setSections] = useState<RubriqueSection[]>([]);
  const [view, setView] = useState<View>({ mode: "index" });
  const [transitioning, setTransitioning] = useState<"entering" | "exiting" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Section edit modal state
  const [editingSection, setEditingSection] = useState<RubriqueSection | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fiche edit modal state
  const [editingItem, setEditingItem] = useState<FicheItem | null>(null);

  // ─── Responsive sidebar detection ───
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-open sidebar on desktop, close on mobile
  useEffect(() => {
    if (isActive) {
      setSidebarOpen(isDesktop);
    }
  }, [isActive, isDesktop]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [view, isDesktop]);

  // ─── Fetch sections ───
  useEffect(() => {
    if (!isActive) return;
    setLoading(true);
    fetch("/api/rubrique/sections")
      .then((r) => r.json())
      .then((d) => {
        if (d.sections) setSections(d.sections);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isActive]);

  // ─── Transitions ───
  const handleEnter = useCallback(() => {
    setTransitioning("entering");
  }, []);

  const handleExit = useCallback(() => {
    if (view.mode === "fiche") {
      const sectionMap: Record<string, string> = {
        "technique-art": "competences",
        "technique-racial": "competences",
        artefact: "artefacts",
        creature: "creatures",
        dimension: "monde",
      };
      const sectionSlug = sectionMap[view.item.category] || "competences";
      setView({ mode: "section", slug: sectionSlug });
      return;
    }
    if (view.mode === "section") {
      setView({ mode: "index" });
      return;
    }
    setTransitioning("exiting");
  }, [view]);

  const handleTransitionComplete = useCallback(() => {
    if (transitioning === "entering") {
      setTransitioning(null);
      onEnter();
    } else if (transitioning === "exiting") {
      setTransitioning(null);
      setView({ mode: "index" });
      onExit();
    }
  }, [transitioning, onEnter, onExit]);

  // ─── Section edit ───
  const startEditSection = (section: RubriqueSection) => {
    setEditForm({
      title: section.title,
      subtitle: section.subtitle || "",
      description: section.description || "",
      imageUrl: section.imageUrl || "",
      backgroundImage: section.backgroundImage || "",
      gifUrl: section.gifUrl || "",
    });
    setEditingSection(section);
  };

  const saveEditSection = async () => {
    if (!editingSection) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/rubrique/sections/${editingSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.section) {
        setSections((prev) => prev.map((s) => (s.id === data.section.id ? data.section : s)));
        setEditingSection(null);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  // ─── Item edit ───
  const handleSaveItem = async (id: string, data: Record<string, string>) => {
    const res = await fetch(`/api/rubrique/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  };

  // ─── Item click handler ───
  const handleItemClick = (item: ItemCardData) => {
    setView({ mode: "fiche", item: item as unknown as FicheItem });
  };

  // ─── Derived state (before early return for hooks consistency) ───
  const currentSection =
    view.mode === "section"
      ? sections.find((s) => s.slug === view.slug)
      : null;
  const ficheSectionSlug =
    view.mode === "fiche"
      ? (() => {
          const map: Record<string, string> = {
            "technique-art": "competences",
            "technique-racial": "competences",
            artefact: "artefacts",
            creature: "creatures",
            dimension: "monde",
          };
          return map[view.item.category] || "competences";
        })()
      : null;

  // ─── Navigation items for sidebar ───
  const navSections = sections.filter((s) => s.slug !== "index");

  // ─── Determine active nav key (before early return) ───
  const activeNavKey = useMemo(() => {
    if (view.mode === "index") return "accueil";
    if (view.mode === "section") return view.slug;
    if (view.mode === "fiche") {
      const map: Record<string, string> = {
        "technique-art": "competences",
        "technique-racial": "competences",
        artefact: "artefacts",
        creature: "creatures",
        dimension: "monde",
      };
      return map[view.item.category] || "competences";
    }
    return "accueil";
  }, [view]);

  // ─── Portal button (when rubrique is NOT active) ───
  if (!isActive && !transitioning) {
    return <PortalButton onClick={handleEnter} />;
  }

  // ─── Section content renderer ───
  const renderSectionContent = () => {
    if (!currentSection) return null;
    switch (currentSection.slug) {
      case "competences":
        return <CompetencesSection onItemClick={handleItemClick} />;
      case "artefacts":
        return <ArtefactsSection onItemClick={handleItemClick} />;
      case "creatures":
        return <CreaturesSection onItemClick={handleItemClick} />;
      case "monde":
        return <MondeSection onItemClick={handleItemClick} />;
      case "technomagie":
        return <TechnomagieSection />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center py-24">
            <div className="text-center">
              <Sparkles size={32} style={{ color: `${GOLD}44` }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}>
                Section non implémentée
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <PortalTransition
        isActive={transitioning !== null}
        onComplete={handleTransitionComplete}
        direction={transitioning === "entering" ? "enter" : "exit"}
      />

      <AnimatePresence>
        {isActive && !transitioning && (
          <motion.div
            className="fixed inset-0 z-[100] overflow-hidden"
            style={{ background: "#000000" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ═══════════════════════════════════════════════
                LEFT SIDEBAR NAVIGATION
            ═══════════════════════════════════════════════ */}
            <motion.aside
              className="fixed top-0 left-0 h-full z-[115] flex flex-col"
              style={{
                width: SIDEBAR_WIDTH,
                background: "#000000",
                borderRight: `1px solid ${SIDEBAR_BORDER}`,
                paddingLeft: "28px",
                paddingRight: "28px",
                paddingTop: "40px",
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.3s ease",
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Logo area */}
              <div className="flex items-center gap-3 mb-10">
                <motion.div
                  style={{ color: GOLD }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  <BookOpen size={18} />
                </motion.div>
                <span
                  style={{
                    fontFamily: "'WorldText', serif",
                    color: GOLD,
                    fontSize: "13px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Rubrique
                </span>
              </div>

              {/* Navigation items */}
              <nav className="flex flex-col flex-1" role="navigation" aria-label="Rubrique navigation">
                {/* Accueil */}
                <button
                  onClick={() => setView({ mode: "index" })}
                  style={{
                    ...navItemBase,
                    color: activeNavKey === "accueil" ? TEXT_ACTIVE : TEXT_TERTIARY,
                    borderBottom: activeNavKey === "accueil" ? `1px solid ${GOLD}` : "1px solid transparent",
                    paddingBottom: activeNavKey === "accueil" ? "11px" : "12px",
                  }}
                  onMouseEnter={(e) => {
                    if (activeNavKey !== "accueil") e.currentTarget.style.color = TEXT_PRIMARY;
                  }}
                  onMouseLeave={(e) => {
                    if (activeNavKey !== "accueil") e.currentTarget.style.color = TEXT_TERTIARY;
                  }}
                >
                  Accueil
                </button>

                {/* Divider */}
                <div style={{ height: "16px" }} />

                {/* Section nav items */}
                {navSections.map((section) => {
                  const isActive = activeNavKey === section.slug;
                  return (
                    <button
                      key={section.slug}
                      onClick={() => setView({ mode: "section", slug: section.slug })}
                      style={{
                        ...navItemBase,
                        color: isActive ? TEXT_ACTIVE : TEXT_TERTIARY,
                        borderBottom: isActive ? `1px solid ${GOLD}` : "1px solid transparent",
                        paddingBottom: isActive ? "11px" : "12px",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.color = TEXT_PRIMARY;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.color = TEXT_TERTIARY;
                      }}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </nav>

              {/* Bottom footer links */}
              <div
                className="flex flex-col gap-2 pb-8"
                style={{
                  borderTop: `1px solid ${SIDEBAR_BORDER}`,
                  paddingTop: "20px",
                  marginTop: "auto",
                }}
              >
                {["Conditions", "Confidentialité", "Contact"].map((link) => (
                  <button
                    key={link}
                    style={{
                      fontFamily: "'WorldText', serif",
                      fontSize: "9px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: TEXT_TERTIARY,
                      padding: "4px 0",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = TEXT_SECONDARY; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_TERTIARY; }}
                  >
                    {link}
                  </button>
                ))}
              </div>
            </motion.aside>

            {/* Mobile sidebar backdrop */}
            {!isDesktop && sidebarOpen && (
              <div
                className="fixed inset-0 z-[114]"
                style={{ background: "rgba(0,0,0,0.7)" }}
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Mobile sidebar toggle */}
            {!isDesktop && (
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="fixed top-4 left-4 z-[120] p-2 cursor-pointer"
                style={{ background: "transparent", border: "none", color: GOLD }}
                aria-label="Toggle navigation"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}

            {/* ═══════════════════════════════════════════════
                MAIN CONTENT AREA (right of sidebar)
            ═══════════════════════════════════════════════ */}
            <div
              className="h-full overflow-y-auto"
              style={{
                marginLeft: isDesktop ? SIDEBAR_WIDTH : 0,
                transition: "margin-left 0.3s ease",
              }}
            >
              <div
                style={{
                  paddingTop: "40px",
                  paddingLeft: isDesktop ? "40px" : "20px",
                  paddingRight: "20px",
                  paddingBottom: "40px",
                  paddingLeft: isDesktop ? "40px" : "56px", /* Extra left padding on mobile for toggle button */
                }}
              >
                {/* Close button row */}
                <div className="flex items-center justify-end mb-8">
                  <button
                    onClick={handleExit}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer transition-all"
                    style={{
                      background: "transparent",
                      border: `1px solid ${GOLD_BORDER}`,
                      color: GOLD,
                      fontFamily: "'WorldText', serif",
                      fontSize: "11px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = GOLD;
                      e.currentTarget.style.color = "#000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = GOLD;
                    }}
                  >
                    Fermer
                  </button>
                </div>

                {/* ═══════════════════════════════════════════════
                    FICHE DETAIL VIEW
                ═══════════════════════════════════════════════ */}
                <AnimatePresence>
                  {view.mode === "fiche" && (
                    <RubriqueFiche
                      key={view.item.id}
                      item={view.item}
                      accentColor={GOLD}
                      sectionSlug={ficheSectionSlug || ""}
                      onBack={() => {
                        const sectionMap: Record<string, string> = {
                          "technique-art": "competences",
                          "technique-racial": "competences",
                          artefact: "artefacts",
                          creature: "creatures",
                          dimension: "monde",
                        };
                        const slug = sectionMap[view.item.category] || "competences";
                        setView({ mode: "section", slug });
                      }}
                      onEdit={(item) => setEditingItem(item)}
                    />
                  )}
                </AnimatePresence>

                {/* ═══════════════════════════════════════════════
                    SECTION DETAIL VIEW
                ═══════════════════════════════════════════════ */}
                {view.mode === "section" && currentSection && (
                  <motion.div
                    key={`section-${currentSection.slug}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Section header — top-left aligned, DNA style */}
                    <div className="mb-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2
                            style={{
                              fontFamily: "'Gloock', serif",
                              color: GOLD,
                              fontSize: "1.8rem",
                              fontWeight: 400,
                              lineHeight: 1.2,
                              marginBottom: "8px",
                            }}
                          >
                            {currentSection.title}
                          </h2>
                          {currentSection.subtitle && (
                            <p
                              style={{
                                fontFamily: "'Gloock', serif",
                                color: TEXT_BODY,
                                fontSize: "14px",
                                lineHeight: 1.6,
                                marginBottom: "4px",
                              }}
                            >
                              {currentSection.subtitle}
                            </p>
                          )}
                          {currentSection.description && (
                            <p
                              style={{
                                fontFamily: "'Gloock', serif",
                                color: TEXT_TERTIARY,
                                fontSize: "13px",
                                lineHeight: 1.6,
                                maxWidth: "600px",
                              }}
                            >
                              {currentSection.description}
                            </p>
                          )}
                        </div>

                        {/* Admin edit button */}
                        {isAdmin && (
                          <button
                            onClick={() => startEditSection(currentSection)}
                            className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all shrink-0 ml-4"
                            style={{
                              background: "transparent",
                              border: `1px solid ${GOLD_BORDER}`,
                              color: GOLD,
                              fontFamily: "'WorldText', serif",
                              fontSize: "10px",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = GOLD;
                              e.currentTarget.style.color = "#000";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = GOLD;
                            }}
                          >
                            <Pencil size={11} />
                            <span className="hidden sm:inline">Éditer</span>
                          </button>
                        )}
                      </div>

                      {/* Subtle gold separator */}
                      <div
                        className="mt-6"
                        style={{
                          height: "1px",
                          background: `linear-gradient(90deg, ${GOLD_BORDER}, transparent 80%)`,
                        }}
                      />
                    </div>

                    {/* Section content */}
                    {renderSectionContent()}
                  </motion.div>
                )}

                {/* ═══════════════════════════════════════════════
                    INDEX VIEW — Full-width horizontal section rows
                ═══════════════════════════════════════════════ */}
                {view.mode === "index" && (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Header — left aligned, minimal DNA style */}
                    <div className="mb-10">
                      <h1
                        style={{
                          fontFamily: "'Gloock', serif",
                          color: GOLD,
                          fontSize: "2rem",
                          fontWeight: 400,
                          lineHeight: 1.2,
                          marginBottom: "8px",
                        }}
                      >
                        La Rubrique
                      </h1>
                      <p
                        style={{
                          fontFamily: "'Gloock', serif",
                          color: TEXT_TERTIARY,
                          fontSize: "14px",
                          lineHeight: 1.6,
                          marginBottom: "16px",
                        }}
                      >
                        Archives interdimensionnelles — sélectionnez une section
                      </p>
                      <div
                        style={{
                          height: "1px",
                          width: "120px",
                          background: GOLD_BORDER,
                        }}
                      />
                    </div>

                    {/* Section rows — full-width horizontal items, no borders, no backgrounds */}
                    {loading ? (
                      <div className="flex items-center justify-center py-24">
                        <Loader2 size={32} className="animate-spin" style={{ color: GOLD }} />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {sections
                          .filter((s) => s.slug !== "index")
                          .map((section, i) => (
                            <motion.button
                              key={section.id}
                              onClick={() => setView({ mode: "section", slug: section.slug })}
                              className="group text-left cursor-pointer w-full"
                              style={{
                                background: "transparent",
                                border: "none",
                                borderTop: `1px solid ${GOLD_BORDER}`,
                                padding: "28px 0",
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                                position: "relative",
                                transition: "all 0.3s ease",
                              }}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + i * 0.08 }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = GOLD_GLOW;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              {/* Section icon */}
                              <div
                                className="shrink-0 relative z-10"
                                style={{ color: GOLD, opacity: 0.7 }}
                              >
                                {SECTION_ICONS[section.slug] || <BookOpen size={28} />}
                              </div>

                              {/* Title + description */}
                              <div className="flex-1 min-w-0 relative z-10">
                                <h3
                                  style={{
                                    fontFamily: "'Gloock', serif",
                                    color: GOLD,
                                    fontSize: "1.3rem",
                                    fontWeight: 400,
                                    lineHeight: 1.3,
                                    marginBottom: "4px",
                                  }}
                                >
                                  {section.title}
                                </h3>
                                {section.subtitle && (
                                  <p
                                    style={{
                                      fontFamily: "'Gloock', serif",
                                      color: TEXT_BODY,
                                      fontSize: "14px",
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {section.subtitle}
                                  </p>
                                )}
                                {section.description && !section.subtitle && (
                                  <p
                                    className="line-clamp-1"
                                    style={{
                                      fontFamily: "'Gloock', serif",
                                      color: TEXT_TERTIARY,
                                      fontSize: "13px",
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {section.description}
                                  </p>
                                )}
                              </div>

                              {/* "More Details" text — DNA style */}
                              <div
                                className="shrink-0 relative z-10 flex items-center gap-2"
                                style={{
                                  fontFamily: "'Gloock', serif",
                                  color: TEXT_MUTED,
                                  fontSize: "12px",
                                  letterSpacing: "1px",
                                  transition: "color 0.2s ease",
                                }}
                              >
                                <span className="hidden sm:inline">More Details</span>
                                <ChevronRight
                                  size={16}
                                  style={{
                                    transition: "transform 0.2s ease",
                                    color: TEXT_MUTED,
                                  }}
                                  className="group-hover:translate-x-1"
                                />
                              </div>
                            </motion.button>
                          ))}

                        {/* Bottom border for last item */}
                        <div style={{ height: "1px", background: GOLD_BORDER }} />
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════
                SECTION EDIT MODAL
            ═══════════════════════════════════════════════ */}
            <AnimatePresence>
              {editingSection && (
                <motion.div
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                  style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingSection(null)}
                >
                  <motion.div
                    className="w-full max-w-lg rounded p-6 max-h-[80vh] overflow-y-auto"
                    style={{ background: "#0a0a0a", border: `1px solid ${GOLD_BORDER}` }}
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3
                        style={{
                          fontFamily: "'WorldText', serif",
                          color: GOLD,
                          fontSize: "14px",
                          fontWeight: 600,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                        }}
                      >
                        Éditer la section
                      </h3>
                      <button
                        onClick={() => setEditingSection(null)}
                        style={{ color: TEXT_TERTIARY, background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(
                        [
                          { key: "title", label: "Titre" },
                          { key: "subtitle", label: "Sous-titre" },
                          { key: "description", label: "Description", textarea: true },
                          { key: "imageUrl", label: "Image URL", icon: <ImageIcon size={14} /> },
                          { key: "backgroundImage", label: "Image de fond", icon: <ImageIcon size={14} /> },
                          { key: "gifUrl", label: "GIF URL", icon: <Film size={14} /> },
                        ] as const
                      ).map((field) => (
                        <div key={field.key}>
                          <label
                            style={{
                              display: "block",
                              fontFamily: "'WorldText', serif",
                              fontSize: "10px",
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              color: TEXT_TERTIARY,
                              marginBottom: "6px",
                              fontWeight: 500,
                            }}
                          >
                            {"icon" in field && field.icon && (
                              <span className="inline mr-1.5">{field.icon}</span>
                            )}
                            {field.label}
                          </label>
                          {"textarea" in field && field.textarea ? (
                            <textarea
                              value={editForm[field.key] || ""}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                              }
                              rows={4}
                              className="w-full px-3 py-2.5 rounded text-sm outline-none resize-y"
                              style={{
                                background: "rgba(0,0,0,0.5)",
                                border: `1px solid ${GOLD_BORDER}`,
                                color: TEXT_PRIMARY,
                                fontFamily: "'Gloock', serif",
                              }}
                            />
                          ) : (
                            <input
                              type="text"
                              value={editForm[field.key] || ""}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                              }
                              className="w-full px-3 py-2.5 rounded text-sm outline-none"
                              style={{
                                background: "rgba(0,0,0,0.5)",
                                border: `1px solid ${GOLD_BORDER}`,
                                color: TEXT_PRIMARY,
                                fontFamily: "'Gloock', serif",
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = GOLD_BORDER_HOVER;
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = GOLD_BORDER;
                              }}
                            />
                          )}
                          {(field.key === "imageUrl" ||
                            field.key === "backgroundImage" ||
                            field.key === "gifUrl") &&
                            editForm[field.key] && (
                              <div
                                className="mt-2 rounded overflow-hidden h-20"
                                style={{ border: `1px solid ${GOLD_BORDER}` }}
                              >
                                <img
                                  src={editForm[field.key]}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>

                    <div
                      className="flex justify-end gap-3 mt-6 pt-4"
                      style={{ borderTop: `1px solid ${GOLD_BORDER}` }}
                    >
                      <button
                        onClick={() => setEditingSection(null)}
                        className="px-5 py-2.5 rounded text-sm cursor-pointer transition-all"
                        style={{
                          color: TEXT_TERTIARY,
                          background: "transparent",
                          border: "none",
                          fontFamily: "'Gloock', serif",
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={saveEditSection}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold cursor-pointer transition-all"
                        style={{
                          background: "transparent",
                          border: `1px solid ${GOLD}`,
                          color: GOLD,
                          fontFamily: "'WorldText', serif",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = GOLD;
                          e.currentTarget.style.color = "#000";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = GOLD;
                        }}
                      >
                        {saving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        {saving ? "Sauvegarde..." : "Sauvegarder"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════
                ITEM EDIT MODAL
            ═══════════════════════════════════════════════ */}
            <AnimatePresence>
              {editingItem && (
                <RubriqueEditModal
                  item={editingItem}
                  accentColor={GOLD}
                  onClose={() => setEditingItem(null)}
                  onSave={handleSaveItem}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}