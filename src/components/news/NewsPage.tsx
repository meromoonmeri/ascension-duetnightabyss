"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import SignInDialog from "@/components/auth/SignInDialog";
import { Mail, Lock, Newspaper, Bell, Gift, Users, RefreshCw, Sparkles, ArrowRight, Gem } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin();
}

// ─── Design Tokens ───
const BG = "#0A0A0F";
const CARD_BG = "rgba(15,15,22,0.8)";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT_P = "rgba(255,255,255,0.9)";
const TEXT_S = "rgba(255,255,255,0.5)";
const TEXT_T = "rgba(255,255,255,0.3)";
const GOLD = "#D4AF37";

// ─── Types ───
interface NewsLetter {
  id: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

type FilterTab = "tous" | "mise-a-jour" | "evenement" | "communaute";

const FILTER_TABS: { key: FilterTab; label: string; types: string[] }[] = [
  { key: "tous", label: "TOUT", types: ["system", "welcome", "event", "update", "admin"] },
  { key: "mise-a-jour", label: "MISE À JOUR", types: ["update", "system"] },
  { key: "evenement", label: "ÉVÉNEMENT", types: ["event", "welcome"] },
  { key: "communaute", label: "COMMUNAUTÉ", types: ["admin"] },
];

const TYPE_CFG: Record<string, { label: string; color: string; gradient: string; icon: React.ReactNode }> = {
  system: { label: "SYSTÈME", color: "#8B95A5", gradient: "linear-gradient(135deg, #1a1e2e 0%, #0d1017 100%)", icon: <Bell size={14} /> },
  welcome: { label: "BIENVENUE", color: "#D4AF37", gradient: "linear-gradient(135deg, #2a2010 0%, #151008 100%)", icon: <Gift size={14} /> },
  event: { label: "ÉVÉNEMENT", color: "#FF6B6B", gradient: "linear-gradient(135deg, #2a1520 0%, #150a10 100%)", icon: <Sparkles size={14} /> },
  update: { label: "MISE À JOUR", color: "#2DD4BF", gradient: "linear-gradient(135deg, #0f2a24 0%, #081815 100%)", icon: <RefreshCw size={14} /> },
  admin: { label: "COMMUNAUTÉ", color: "#F59E0B", gradient: "linear-gradient(135deg, #2a2010 0%, #181208 100%)", icon: <Users size={14} /> },
};

function getTypeCfg(type: string) { return TYPE_CFG[type] || TYPE_CFG.system; }

// ─── CSS Keyframes ───
const NEWS_CSS = `
@keyframes news-star-drift {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  15% { opacity: var(--so, 0.3); }
  85% { opacity: var(--so, 0.3); }
  100% { transform: translateY(-100px) translateX(12px); opacity: 0; }
}
@keyframes news-glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}
@keyframes news-unread-pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(255,107,107,0.5); }
  50% { box-shadow: 0 0 14px rgba(255,107,107,0.9); }
}
@keyframes newsExpand {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 600px; }
}
@keyframes news-shimmer-sweep {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(150%); }
}
@keyframes news-icon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.news-star {
  position: absolute;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.4);
  animation: news-star-drift linear infinite;
  pointer-events: none;
}
.news-scroll::-webkit-scrollbar { width: 4px; }
.news-scroll::-webkit-scrollbar-track { background: transparent; }
.news-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
.news-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
`;

// ─── Star Particles ───
function generateStars(count: number) {
  const stars: { left: string; top: string; size: number; delay: string; duration: string; opacity: number }[] = [];
  for (let i = 0; i < count; i++) {
    const seed = (i * 2654435761) >>> 0;
    stars.push({ left: `${(seed * 7) % 100}%`, top: `${(seed * 13) % 100}%`, size: (seed % 3) + 1, delay: `${(seed % 50) * 0.1}s`, duration: `${6 + (seed % 8)}s`, opacity: 0.08 + (seed % 4) * 0.05 });
  }
  return stars;
}
const STARS = generateStars(20);

export default function NewsPage() {
  const { data: session, status } = useSession();
  const [letters, setLetters] = useState<NewsLetter[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("tous");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchLetters = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setLetters(data.letters || []);
      }
    } catch (e) {
      console.error("Failed to fetch letters:", e);
    }
  }, [session?.user?.id]);

  const claimWelcome = useCallback(async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/news/welcome", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchLetters();
        }
      }
    } catch (e) {
      console.error("Failed to claim welcome:", e);
    } finally {
      setClaiming(false);
    }
  }, [claiming, fetchLetters]);

  const markRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/news/${id}/read`, { method: "PUT" });
      setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, read: true } : l)));
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchLetters().then(() => claimWelcome()).catch(() => {});
    }
  }, [status, session?.user?.id, fetchLetters, claimWelcome]);

  // GSAP entrance animation
  useEffect(() => {
    if (!containerRef.current || letters.length === 0) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".news-banner-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(".news-filter-bar", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "power2.out" });
      gsap.fromTo(".news-card-item", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.3, ease: "power2.out" });
    }, containerRef);

    return () => ctx.revert();
  }, [letters]);

  const filteredLetters = letters.filter((l) => {
    const tab = FILTER_TABS.find((t) => t.key === activeFilter);
    return tab ? tab.types.includes(l.type) : true;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const truncate = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd() + "…";
  };

  // ─── Loading ───
  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, position: "relative", overflow: "hidden" }}>
        {STARS.slice(0, 10).map((s, i) => (
          <div key={i} className="news-star" style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.duration, ["--so" as string]: s.opacity }} />
        ))}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", position: "relative", zIndex: 10 }}>
          <div style={{ width: "20px", height: "20px", border: "2px solid transparent", borderTopColor: GOLD, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT_T }}>Chargement…</span>
        </div>
        <style>{NEWS_CSS + `@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Not authenticated — Lock screen ───
  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, padding: "24px", position: "relative", overflow: "hidden" }}>
        {STARS.slice(0, 15).map((s, i) => (
          <div key={i} className="news-star" style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.duration, ["--so" as string]: s.opacity }} />
        ))}
        {/* Radial glow */}
        <div style={{ position: "absolute", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)", filter: "blur(40px)", animation: "news-glow-pulse 4s ease-in-out infinite" }} />
        <div style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
          {/* Floating icon with pulse glow */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(10,10,15,0.8) 70%)",
            border: "1.5px solid rgba(212,175,55,0.3)",
            boxShadow: "0 0 40px rgba(212,175,55,0.15), 0 0 80px rgba(212,175,55,0.05)",
            animation: "news-glow-pulse 3s ease-in-out infinite",
          }}>
            <Mail size={32} style={{ color: GOLD }} />
          </div>
          <h2 style={{
            fontFamily: "'Cinzel', serif", fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT_P, marginBottom: "12px",
            textShadow: "0 0 20px rgba(212,175,55,0.1)",
          }}>
            BOÎTE AUX LETTRES
          </h2>
          <div style={{ width: "100px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: TEXT_T, lineHeight: "1.6", marginBottom: "28px", maxWidth: "300px", margin: "0 auto 28px" }}>
            Connecte-toi pour accéder à tes actualités et recevoir tes récompenses.
          </p>
          <SignInDialog />
        </div>
        <style>{NEWS_CSS}</style>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ minHeight: "100vh", background: BG, paddingBottom: "80px", position: "relative", overflow: "hidden" }}>
      {/* Star particles */}
      {STARS.map((s, i) => (
        <div key={i} className="news-star" style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.duration, ["--so" as string]: s.opacity }} />
      ))}

      <div style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>

        {/* ═══════ CINEMATIC HEADER BANNER ═══════ */}
        <div style={{
          position: "relative", width: "100%", height: "200px", overflow: "hidden",
          background: "linear-gradient(180deg, rgba(212,175,55,0.06) 0%, transparent 60%)",
          paddingTop: "60px",
        }}>
          {/* Vignette */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgba(10,10,15,0.8) 0%, transparent 15%, transparent 85%, rgba(10,10,15,0.8) 100%)" }} />
          {/* Radial glow */}
          <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)", filter: "blur(30px)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

          {/* Title */}
          <div className="news-banner-title" style={{ textAlign: "center", paddingTop: "24px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: "24px", height: "1px", background: GOLD }} />
              <Newspaper size={16} style={{ color: GOLD }} />
              <div style={{ width: "24px", height: "1px", background: GOLD }} />
            </div>
            <h1 style={{
              fontFamily: "'Cinzel', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase", color: TEXT_P, margin: 0,
              textShadow: "0 0 30px rgba(212,175,55,0.1)",
            }}>
              ACTUALITÉS
            </h1>
            <div style={{ marginTop: "10px", width: "180px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), rgba(212,175,55,0.6), rgba(212,175,55,0.4), transparent)", marginLeft: "auto", marginRight: "auto" }} />
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "0.12em",
              textTransform: "uppercase", color: TEXT_T, marginTop: "8px",
            }}>
              {letters.length} publication{letters.length > 1 ? "s" : ""}
            </p>
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60px", background: `linear-gradient(to top, ${BG}, transparent)` }} />
        </div>

        {/* ═══════ FILTER TABS (Pill-style with scroll) ═══════ */}
        <div className="news-filter-bar" style={{
          maxWidth: "1200px", margin: "0 auto", marginBottom: "32px",
          display: "flex", gap: "6px", overflowX: "auto", WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none", msOverflowStyle: "none", paddingTop: "8px",
        }}>
          <style>{`.news-filter-bar::-webkit-scrollbar { display: none; }`}</style>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count = letters.filter((l) => tab.types.includes(l.type)).length;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveFilter(tab.key); setExpanded(null); }}
                style={{
                  fontFamily: "'Cinzel', serif", fontSize: "11px", fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "9px 22px", borderRadius: "100px", border: "none", cursor: "pointer",
                  whiteSpace: "nowrap", transition: "all 0.3s ease",
                  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  color: isActive ? TEXT_P : TEXT_T,
                  boxShadow: isActive ? "0 0 20px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
                  border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                }}
              >
                {tab.label}
                <span style={{ marginLeft: "6px", fontSize: "10px", fontWeight: 400, color: isActive ? TEXT_S : TEXT_T }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ═══════ NEWS CARD GRID ═══════ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
          gap: "16px",
        }}>
          {filteredLetters.length === 0 && !claiming ? (
            /* ─── Empty State ─── */
            <div style={{
              gridColumn: "1 / -1", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "80px 24px",
            }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", marginBottom: "20px",
                background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
              }}>
                <Mail size={24} style={{ color: TEXT_T }} />
              </div>
              <p style={{
                fontFamily: "'Cinzel', serif", fontSize: "13px", fontWeight: 600,
                letterSpacing: "0.12em", textTransform: "uppercase", color: TEXT_T, marginBottom: "8px",
              }}>
                AUCUNE ACTUALITÉ
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: TEXT_T, textAlign: "center" }}>
                Reviens plus tard pour découvrir les dernières nouvelles.
              </p>
            </div>
          ) : (
            filteredLetters.map((letter) => {
              const cfg = getTypeCfg(letter.type);
              const isHov = hoveredCard === letter.id;
              const isExp = expanded === letter.id;

              return (
                <div
                  key={letter.id}
                  className="news-card-item"
                  onMouseEnter={() => setHoveredCard(letter.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => {
                    if (!letter.read) markRead(letter.id);
                    setExpanded(isExp ? null : letter.id);
                  }}
                  style={{
                    position: "relative", borderRadius: "14px", overflow: "hidden",
                    cursor: "pointer", transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                    transform: isHov ? "translateY(-4px)" : "translateY(0)",
                    border: isHov ? `1px solid ${cfg.color}25` : `1px solid ${BORDER}`,
                    background: CARD_BG,
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                    boxShadow: isHov
                      ? `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${cfg.color}08`
                      : "0 4px 16px rgba(0,0,0,0.2)",
                  }}
                >
                  {/* ─── Colored gradient strip (top, type-based) ─── */}
                  <div style={{
                    position: "relative", height: "clamp(100px, 15vw, 140px)", overflow: "hidden",
                    background: cfg.gradient,
                  }}>
                    {/* Subtle radial highlights */}
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: `radial-gradient(circle at 20% 80%, ${cfg.color}06 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${cfg.color}04 0%, transparent 50%)`,
                    }} />

                    {/* Large decorative type letter */}
                    <div style={{
                      position: "absolute", right: "-6px", bottom: "-10px",
                      fontSize: "clamp(80px, 14vw, 120px)", fontWeight: 800, fontFamily: "'Cinzel', serif",
                      color: cfg.color, opacity: 0.04, lineHeight: 1, userSelect: "none", pointerEvents: "none",
                    }}>
                      {cfg.label.charAt(0)}
                    </div>

                    {/* Category badge with icon */}
                    <div style={{
                      position: "absolute", top: "12px", left: "12px",
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "5px 12px", borderRadius: "6px",
                      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
                      border: `1px solid ${cfg.color}25`,
                    }}>
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      <span style={{
                        fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase", color: cfg.color,
                      }}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Unread indicator — glowing dot */}
                    {!letter.read && (
                      <div style={{
                        position: "absolute", top: "16px", right: "16px",
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: "#FF6B6B",
                        animation: "news-unread-pulse 2s ease-in-out infinite",
                      }} />
                    )}

                    {/* Bottom fade */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: "40px",
                      background: "linear-gradient(to top, rgba(15,15,22,0.95), transparent)",
                    }} />
                  </div>

                  {/* ─── Card Content ─── */}
                  <div style={{ padding: "16px 18px 18px" }}>
                    <h3 style={{
                      fontFamily: "'Cinzel', serif", fontSize: "15px", fontWeight: 600,
                      color: TEXT_P, margin: "0 0 6px", lineHeight: "1.35",
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {letter.title}
                    </h3>

                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "11px", color: TEXT_T,
                      display: "block", marginBottom: "10px", letterSpacing: "0.05em",
                    }}>
                      {formatDate(letter.createdAt)}
                    </span>

                    <p style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "13px", color: TEXT_S,
                      lineHeight: "1.6", margin: 0,
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {truncate(letter.content, 120)}
                    </p>

                    {/* Read more / close indicator */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      marginTop: "14px", color: TEXT_T,
                      transition: "color 0.2s",
                      ...(isHov ? { color: cfg.color } : {}),
                    }}>
                      <span style={{
                        fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                      }}>
                        {isExp ? "FERMER" : "LIRE LA SUITE"}
                      </span>
                      <ArrowRight size={12} style={{
                        transform: isExp ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                      }} />
                    </div>
                  </div>

                  {/* ─── Expanded Content (slide-down) ─── */}
                  {isExp && (
                    <div style={{
                      padding: "0 18px 18px", borderTop: `1px solid ${BORDER}`,
                      marginTop: "2px",
                      animation: "newsExpand 0.3s ease",
                    }}>
                      <div style={{
                        fontFamily: "'Inter', sans-serif", fontSize: "13px", color: TEXT_S,
                        lineHeight: "1.75", whiteSpace: "pre-line", paddingTop: "14px",
                      }}>
                        {letter.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{NEWS_CSS}</style>
    </div>
  );
}