"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Globe, ChevronLeft, ChevronRight, AlertTriangle, MapPin, Users, Gem } from "lucide-react";
import type { ItemCardData } from "../shared/ItemCard";

/* ─── DNA Design Tokens ─── */
const GOLD = "#E0DABB";
const GOLD_LIGHT = "#E0DABB";
const GOLD_DARK = "#BAAE93";
const GOLD_BORDER = "rgba(224, 218, 187, 0.15)";
const GOLD_BORDER_HOVER = "rgba(224, 218, 187, 0.35)";
const GOLD_GLOW = "rgba(224, 218, 187, 0.1)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_ACTIVE = "rgba(255, 255, 255, 0.9)";
const TEXT_SECONDARY = "#C1B8A2";
const TEXT_BODY = "#C1B8A2";
const TEXT_TERTIARY = "#A4A4A4";
const TEXT_MUTED = "#A7A7A7";
const TEXT_LINK = "#CAB99B";

function parseMeta(meta: string | null | undefined) {
  try { return meta ? JSON.parse(meta) : {}; } catch { return {}; }
}

interface MondeSectionProps {
  onItemClick: (item: ItemCardData) => void;
}

export default function MondeSection({ onItemClick }: MondeSectionProps) {
  const [items, setItems] = useState<ItemCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchDimensions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ section: "monde", category: "dimension", limit: "10" });
      const res = await fetch(`/api/rubrique/items?${params}`);
      const data = await res.json();
      const mapped: ItemCardData[] = (data.items || []).map((it: Record<string, unknown>) => ({
        ...it, category: "dimension",
      }));
      setItems(mapped);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDimensions(); }, [fetchDimensions]);

  const scroll = (dir: "left" | "right") => {
    const next = dir === "left" ? active - 1 : active + 1;
    if (next < 0 || next >= items.length) return;
    setActive(next);
    scrollRef.current?.scrollTo({ left: next * (scrollRef.current.offsetWidth * 0.85), behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80" style={{ background: "rgba(224,218,187,0.03)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <Globe size={36} style={{ color: `${GOLD}33` }} className="mx-auto mb-4" />
        <p className="text-sm" style={{ color: TEXT_TERTIARY, fontFamily: "'Gloock', serif" }}>Aucune dimension enregistrée</p>
      </div>
    );
  }

  const current = items[active];
  const meta = parseMeta(current?.metadata);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Carousel */}
      <div className="relative">
        {/* Nav arrows — minimal, semi-transparent */}
        <button
          onClick={() => scroll("left")}
          disabled={active === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center -translate-x-2 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-default"
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          disabled={active === items.length - 1}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center translate-x-2 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-default"
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <ChevronRight size={18} />
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, i) => {
            const m = parseMeta(item.metadata);
            const isActive = i === active;
            const dangerLevel = m.danger as number || 0;

            return (
              <motion.div
                key={item.id}
                className="flex-shrink-0 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[33%] snap-center overflow-hidden cursor-pointer transition-all duration-300"
                style={{
                  border: "none",
                  background: "transparent",
                  transform: isActive ? "scale(1)" : "scale(0.95)",
                  opacity: isActive ? 1 : 0.6,
                }}
                onClick={() => { setActive(i); onItemClick(item); }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.opacity = "0.6";
                    e.currentTarget.style.transform = "scale(0.95)";
                  }
                }}
                whileHover={{ }}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: isActive ? 1 : 0.6, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                {/* Card visual */}
                <div className="relative h-52 sm:h-64 flex flex-col justify-end p-5" style={{
                  background: "linear-gradient(135deg, rgba(20,20,25,0.9), rgba(0,0,0,0.95))",
                }}>
                  {/* Decorative gold glow */}
                  <div
                    className="absolute top-4 right-4 w-20 h-20"
                    style={{ background: `radial-gradient(circle, ${GOLD_GLOW}, transparent)`, filter: "blur(20px)" }}
                  />

                  {/* Type label — text only, no badge border */}
                  <div
                    className="absolute top-4 left-4 text-[10px] uppercase tracking-wider"
                    style={{
                      color: TEXT_MUTED,
                      fontFamily: "'WorldText', serif",
                    }}
                  >
                    {m.type as string || "Transition"}
                  </div>

                  {/* Danger indicator */}
                  <div className="absolute top-4 right-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, d) => (
                      <div key={d} className="w-1.5 h-3" style={{
                        background: d < dangerLevel
                          ? (dangerLevel >= 4 ? "#ef4444" : dangerLevel >= 3 ? GOLD : GOLD_DARK)
                          : "rgba(224,218,187,0.08)",
                      }} />
                    ))}
                  </div>

                  {/* Name */}
                  <div className="relative z-10">
                    <h3
                      className="text-xl sm:text-2xl tracking-tight"
                      style={{ color: TEXT_PRIMARY, fontFamily: "'Gloock', serif" }}
                    >
                      {item.name}
                    </h3>
                    {item.nameJp && (
                      <p className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}>{item.nameJp}</p>
                    )}
                  </div>
                </div>

                {/* Card content */}
                <div className="p-5">
                  {item.subtitle && (
                    <p className="text-xs font-medium mb-2" style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}>{item.subtitle}</p>
                  )}
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: TEXT_BODY, fontFamily: "'Gloock', serif" }}>
                    {item.description}
                  </p>

                  {/* Meta info — text only, no chips/borders */}
                  <div className="flex flex-wrap gap-4 mt-3">
                    {m.acces && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px]"
                        style={{
                          color: TEXT_MUTED,
                          fontFamily: "'Gloock', serif",
                        }}
                      >
                        <MapPin size={9} /> {m.acces}
                      </span>
                    )}
                    {m.entites && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px]"
                        style={{
                          color: TEXT_MUTED,
                          fontFamily: "'Gloock', serif",
                        }}
                      >
                        <Users size={9} /> {String(m.entites).split(",")[0]}
                      </span>
                    )}
                    {m.ressources && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px]"
                        style={{
                          color: TEXT_MUTED,
                          fontFamily: "'Gloock', serif",
                        }}
                      >
                        <Gem size={9} /> {String(m.ressources).split(",")[0]}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActive(i);
                scrollRef.current?.scrollTo({ left: i * (scrollRef.current!.offsetWidth * 0.85), behavior: "smooth" });
              }}
              className="rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: i === active ? 24 : 8,
                height: 2,
                background: i === active ? GOLD : TEXT_TERTIARY,
                border: "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Gradient separator */}
      <div className="mt-6 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(224,218,187,0.15), transparent)" }} />

      {/* Expanded detail for active dimension — no border, subtle bg */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-6 p-6"
          style={{ background: "rgba(224,218,187,0.03)" }}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0 mt-1">
              🌀
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3
                  className="text-lg"
                  style={{ color: TEXT_PRIMARY, fontFamily: "'Gloock', serif" }}
                >
                  {current.name}
                </h3>
                {current.nameJp && <span className="text-xs" style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}>{current.nameJp}</span>}
                {meta.danger && (
                  <span
                    className="flex items-center gap-1 text-[10px]"
                    style={{
                      color: (meta.danger as number) >= 4 ? "#f87171" : (meta.danger as number) >= 3 ? GOLD : TEXT_MUTED,
                      fontFamily: "'WorldText', serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <AlertTriangle size={10} /> Danger {(meta.danger as number)}/5
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: TEXT_BODY, fontFamily: "'Gloock', serif" }}>
                {current.description}
              </p>

              {/* Info grid — no borders, minimal text style */}
              {meta.acces && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                  {meta.acces && (
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider mb-1"
                        style={{ color: TEXT_MUTED, fontFamily: "'WorldText', serif" }}
                      >
                        Accès
                      </p>
                      <p className="text-xs" style={{ color: TEXT_BODY, fontFamily: "'Gloock', serif" }}>{meta.acces}</p>
                    </div>
                  )}
                  {meta.entites && (
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider mb-1"
                        style={{ color: TEXT_MUTED, fontFamily: "'WorldText', serif" }}
                      >
                        Entités
                      </p>
                      <p className="text-xs" style={{ color: TEXT_BODY, fontFamily: "'Gloock', serif" }}>{String(meta.entites).substring(0, 60)}</p>
                    </div>
                  )}
                  {meta.ressources && (
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider mb-1"
                        style={{ color: TEXT_MUTED, fontFamily: "'WorldText', serif" }}
                      >
                        Ressources
                      </p>
                      <p className="text-xs" style={{ color: TEXT_BODY, fontFamily: "'Gloock', serif" }}>{String(meta.ressources).substring(0, 60)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}