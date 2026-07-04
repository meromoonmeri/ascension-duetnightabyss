"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { Clock, ChevronDown, ChevronUp, Flame, Trophy } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin();
}

// ─── Design Tokens ───
const CARD_BG = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT_P = "#E5E7EB";
const TEXT_S = "#9CA3AF";
const TEXT_T = "#6B7280";
const ACCENT = "#00D4FF";
const GREEN = "#34D399";
const AMBER = "#F59E0B";

// ─── Event Data ───
interface GameEvent {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
  endDate: string;
  startDate?: string;
  status: "active" | "past";
  reward: { ether: number; label?: string };
}

const MOCK_ACTIVE_EVENTS: GameEvent[] = [
  {
    id: "evt-1",
    name: "La Nuit des Ombres",
    description: "Les barrières entre les mondes s'amincissent. Les créatures de l'ombre errent librement. Les aventuriers les plus courageux sont appelés pour défendre les royaumes menacés. Participez pour gagner des récompenses exclusives.",
    image: "/events-bg.mp4",
    color: "#FF6B6B",
    startDate: "2025-01-20T20:00:00",
    endDate: "2025-02-15T20:00:00",
    status: "active",
    reward: { ether: 5000, label: "Titre exclusif + Arme légendaire" },
  },
  {
    id: "evt-2",
    name: "Fête des Lanternes Célestes",
    description: "Des lanternes mystiques illuminent le ciel nocturne. Libérez les esprits prisonniers des lanternes éteintes pour recevoir des bénédictions divines.",
    image: "",
    color: "#00D4FF",
    startDate: "2025-01-25T18:00:00",
    endDate: "2025-02-05T23:59:00",
    status: "active",
    reward: { ether: 3000, label: "Lanterne éternelle" },
  },
];

const MOCK_PAST_EVENTS: GameEvent[] = [
  { id: "pe-1", name: "Le Tournoi des Arts", description: "Les plus grands maîtres des Huit Arts se sont affrontés dans une arène dimensionnelle.", image: "", color: "#C9A84C", startDate: "2025-01-01T12:00:00", endDate: "2025-01-22T21:00:00", status: "past", reward: { ether: 10000 } },
  { id: "pe-2", name: "Expédition : Ruines Oubliées", description: "Un groupe d'explorateurs a découvert les mystères des Ruines Oubliées d'Aethermore.", image: "", color: "#4FC3F7", startDate: "2024-12-28T10:00:00", endDate: "2025-01-10T19:00:00", status: "past", reward: { ether: 7500 } },
  { id: "pe-3", name: "Le Bal de la Cour", description: "Les nobles de tous les royaumes se sont rassemblés pour un bal somptueux.", image: "", color: "#AB47BC", startDate: "2024-12-10T20:00:00", endDate: "2024-12-20T20:30:00", status: "past", reward: { ether: 5000 } },
];

function calcTimeLeft(endDate: string) {
  const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calc = () => setTimeLeft(calcTimeLeft(endDate));
    calc();
    const iv = setInterval(calc, 60000);
    return () => clearInterval(iv);
  }, [endDate]);

  const parts = [
    timeLeft.days > 0 && `${timeLeft.days}j`,
    `${timeLeft.hours}h`,
    `${timeLeft.minutes}m`,
  ].filter(Boolean);

  return (
    <span className="font-body text-xs tracking-wider" style={{ color: AMBER }}>
      {parts.join(" ")}
    </span>
  );
}

function formatDateRange(start?: string, end?: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const s = start ? new Date(start).toLocaleDateString("fr-FR", opts) : "";
  const e = end ? new Date(end).toLocaleDateString("fr-FR", opts) : "";
  if (s && e) return `${s} — ${e}`;
  return s || e;
}

export default function EventsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pastExpanded, setPastExpanded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const activeCount = MOCK_ACTIVE_EVENTS.length;

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".evt-title",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(
        ".evt-card",
        { y: 24, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          delay: 0.15,
          stagger: 0.08,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen pb-12">
      {/* Header */}
      <div className="evt-title flex items-center gap-3 mb-8 pt-4">
        <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
        <h1
          className="text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase"
          style={{ color: TEXT_P }}
        >
          Événements
        </h1>
        <span
          className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase"
          style={{
            background: "rgba(0,212,255,0.12)",
            color: ACCENT,
            border: "1px solid rgba(0,212,255,0.2)",
          }}
        >
          {activeCount}
        </span>
        <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(270deg, ${ACCENT}, transparent)` }} />
      </div>

      {/* Active Events */}
      <div className="flex flex-col gap-4">
        {MOCK_ACTIVE_EVENTS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
              }}
            >
              <Flame size={22} style={{ color: TEXT_T }} />
            </div>
            <p
              className="text-sm font-semibold tracking-widest uppercase mb-1"
              style={{ color: TEXT_T }}
            >
              Aucun événement en cours
            </p>
            <p className="text-xs" style={{ color: TEXT_T }}>
              Reviens bientôt pour de nouvelles aventures.
            </p>
          </div>
        ) : (
          MOCK_ACTIVE_EVENTS.map((event) => {
            const isHov = hoveredCard === event.id;
            return (
              <div
                key={event.id}
                className="evt-card rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
                style={{
                  background: CARD_BG,
                  border: isHov
                    ? `1px solid rgba(0,212,255,0.25)`
                    : `1px solid ${BORDER}`,
                  boxShadow: isHov
                    ? "0 0 30px rgba(0,212,255,0.08), 0 8px 32px rgba(0,0,0,0.3)"
                    : "0 4px 16px rgba(0,0,0,0.2)",
                  transform: isHov ? "translateY(-2px)" : "translateY(0)",
                }}
                onMouseEnter={() => setHoveredCard(event.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Banner image area */}
                {event.image ? (
                  <div className="relative h-40 overflow-hidden">
                    <video
                      src={event.image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(255,255,255,0.04) 0%, transparent 60%)",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="relative h-28 overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${event.color}12 0%, ${event.color}06 40%, transparent 70%)`,
                    }}
                  >
                    {/* Decorative glow */}
                    <div
                      className="absolute w-40 h-40 rounded-full blur-3xl"
                      style={{
                        background: `${event.color}10`,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.01) 20px, rgba(255,255,255,0.01) 21px)",
                      }}
                    />
                  </div>
                )}

                {/* Card content */}
                <div className="p-5">
                  {/* Top row: status + date */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-md flex items-center gap-1.5"
                      style={{
                        background: "rgba(0,212,255,0.08)",
                        color: ACCENT,
                        border: "1px solid rgba(0,212,255,0.15)",
                      }}
                    >
                      <Flame size={9} />
                      En cours
                    </span>
                    <div className="flex items-center gap-1.5" style={{ color: TEXT_T }}>
                      <Clock size={11} />
                      <CountdownTimer endDate={event.endDate} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-base md:text-lg font-bold mb-2 leading-snug"
                    style={{ color: TEXT_P }}
                  >
                    {event.name}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-xs leading-relaxed mb-4"
                    style={{
                      color: TEXT_S,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {event.description}
                  </p>

                  {/* Footer: date range + reward */}
                  <div
                    className="flex items-center justify-between gap-3 pt-3"
                    style={{ borderTop: `1px solid ${BORDER}` }}
                  >
                    <span className="text-[11px]" style={{ color: TEXT_T }}>
                      {formatDateRange(event.startDate, event.endDate)}
                    </span>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{
                        background: "rgba(139,92,246,0.08)",
                        color: "#A78BFA",
                        border: "1px solid rgba(139,92,246,0.15)",
                      }}
                    >
                      <Trophy size={12} />
                      <span style={{ color: "#A78BFA" }}>
                        ◆ {event.reward.ether.toLocaleString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Past Events */}
      {MOCK_PAST_EVENTS.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setPastExpanded(!pastExpanded)}
            className="flex items-center gap-2 mb-4 group"
          >
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
            <h2
              className="text-xs font-bold tracking-[0.15em] uppercase"
              style={{ color: TEXT_T }}
            >
              Événements terminés
            </h2>
            <span className="text-[11px]" style={{ color: TEXT_T }}>
              ({MOCK_PAST_EVENTS.length})
            </span>
            {pastExpanded ? (
              <ChevronUp size={14} style={{ color: TEXT_T }} />
            ) : (
              <ChevronDown size={14} style={{ color: TEXT_T }} />
            )}
          </button>

          {pastExpanded && (
            <div className="flex flex-col gap-3">
              {MOCK_PAST_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl p-4 transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid rgba(255,255,255,0.05)`,
                    opacity: 0.55,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3
                          className="text-sm font-semibold"
                          style={{ color: TEXT_S }}
                        >
                          {event.name}
                        </h3>
                        <span
                          className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            color: TEXT_T,
                          }}
                        >
                          Terminé
                        </span>
                      </div>
                      <p
                        className="text-xs leading-relaxed mb-2"
                        style={{
                          color: TEXT_T,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {event.description}
                      </p>
                      <div
                        className="flex items-center gap-1.5 text-[11px]"
                        style={{ color: TEXT_T }}
                      >
                        <Clock size={10} />
                        <span>
                          {formatDateRange(event.startDate, event.endDate)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1 text-xs font-semibold shrink-0 px-2.5 py-1 rounded-lg"
                      style={{
                        background: "rgba(139,92,246,0.06)",
                        color: TEXT_T,
                      }}
                    >
                      <span>◆ {event.reward.ether.toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}