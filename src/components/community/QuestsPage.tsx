"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import SignInDialog from "@/components/auth/SignInDialog";
import gsap from "gsap";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
const PURPLE = "#A78BFA";

// ─── Types ───
interface QuestData {
  id: string;
  title: string;
  description: string;
  type: string;
  emoji: string;
  etherReward: number;
  active: boolean;
  sortOrder: number;
  cooldownHours: number;
}

interface CompletionData {
  taskId: string;
  completedAt: string;
}

function isOnCooldown(completedAt: string, cooldownHours: number): boolean {
  const now = new Date();
  const completed = new Date(completedAt);
  const cooldownMs = cooldownHours * 60 * 60 * 1000;
  return now.getTime() < completed.getTime() + cooldownMs;
}

// ─── Cooldown Timer Hook ───
function useCooldownTimer(
  completedAt: string | undefined,
  cooldownHours: number
) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!completedAt) return;

    const calc = () => {
      const now = new Date();
      const completed = new Date(completedAt);
      const cooldownMs = cooldownHours * 60 * 60 * 1000;
      const diff = completed.getTime() + cooldownMs - now.getTime();
      if (diff <= 0) {
        setRemaining("");
        return false;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setRemaining(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
      return true;
    };

    calc();
    const iv = setInterval(() => {
      const active = calc();
      if (!active) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [completedAt, cooldownHours]);

  return remaining;
}

// ─── Quest Card Component ───
function QuestCard({
  quest,
  completion,
  isClaiming,
  onClaim,
  onHoverStart,
  onHoverEnd,
}: {
  quest: QuestData;
  completion: CompletionData | undefined;
  isClaiming: boolean;
  onClaim: (id: string) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
}) {
  const onCooldown =
    completion && isOnCooldown(completion.completedAt, quest.cooldownHours);
  const cooldownText = useCooldownTimer(
    completion?.completedAt,
    quest.cooldownHours
  );

  const questStatus: "available" | "done" | "cooldown" = onCooldown
    ? "cooldown"
    : completion
    ? "done"
    : "available";

  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="quest-card rounded-xl p-4 transition-all duration-300"
      style={{
        background: CARD_BG,
        border: hovered && !onCooldown
          ? `1px solid rgba(0,212,255,0.2)`
          : `1px solid ${BORDER}`,
        boxShadow: hovered && !onCooldown
          ? "0 0 24px rgba(0,212,255,0.06), 0 4px 20px rgba(0,0,0,0.25)"
          : "0 2px 10px rgba(0,0,0,0.15)",
        opacity: onCooldown ? 0.6 : 1,
        transform: hovered && !onCooldown ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={() => {
        setHovered(true);
        onHoverStart(quest.id);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHoverEnd();
      }}
    >
      <div className="flex items-center gap-4">
        {/* Emoji icon */}
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${BORDER}`,
          }}
        >
          {quest.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              className="text-sm font-bold tracking-wide"
              style={{ color: TEXT_P }}
            >
              {quest.title}
            </h3>
            {questStatus === "available" && (
              <span
                className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded"
                style={{
                  background: "rgba(52,211,153,0.1)",
                  color: GREEN,
                }}
              >
                Disponible
              </span>
            )}
            {questStatus === "cooldown" && (
              <span
                className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded flex items-center gap-1"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  color: AMBER,
                }}
              >
                <Clock size={8} />
                En recharge
              </span>
            )}
            {questStatus === "done" && (
              <span
                className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: TEXT_T,
                }}
              >
                Terminé
              </span>
            )}
          </div>

          <p
            className="text-xs leading-relaxed mb-2"
            style={{
              color: TEXT_S,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {quest.description}
          </p>

          {/* Footer: reward + action */}
          <div className="flex items-center justify-between gap-3">
            {/* Ether reward with purple diamond */}
            <div
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: PURPLE }}
            >
              <span>◆</span>
              <span>{quest.etherReward.toLocaleString("fr-FR")}</span>
              <span style={{ color: TEXT_T, fontWeight: 400 }}>Éther</span>
            </div>

            {/* Action */}
            {(questStatus === "available" || questStatus === "done") && (
              <button
                onClick={() => onClaim(quest.id)}
                disabled={isClaiming}
                className="text-[10px] font-bold tracking-[0.12em] uppercase px-5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer"
                style={{
                  background: isClaiming
                    ? "rgba(0,212,255,0.08)"
                    : "rgba(0,212,255,0.12)",
                  color: ACCENT,
                  border: `1px solid ${
                    isClaiming
                      ? "rgba(0,212,255,0.12)"
                      : "rgba(0,212,255,0.25)"
                  }`,
                  cursor: isClaiming ? "wait" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isClaiming)
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(0,212,255,0.22)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(0,212,255,0.12)";
                }}
              >
                {isClaiming ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={10} className="animate-spin" />
                    Validation…
                  </span>
                ) : questStatus === "done" ? (
                  "Recompléter"
                ) : (
                  "RÉCLAMER"
                )}
              </button>
            )}

            {questStatus === "cooldown" && cooldownText && (
              <span
                className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                style={{
                  color: AMBER,
                  background: "rgba(245,158,11,0.06)",
                  border: "1px solid rgba(245,158,11,0.1)",
                }}
              >
                <Clock size={10} />
                {cooldownText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Quests Page ───
export default function QuestsPage() {
  const { data: session, status } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [completions, setCompletions] = useState<CompletionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const fetchQuests = useCallback(async () => {
    try {
      const res = await fetch("/api/quests");
      const data = await res.json();
      if (data.quests) setQuests(data.quests);
      if (data.completions) setCompletions(data.completions);
    } catch {
      console.error("Failed to fetch quests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  useEffect(() => {
    if (!containerRef.current || loading) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".quest-title",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(
        ".quest-card",
        { y: 24, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          delay: 0.15,
          stagger: 0.07,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  const handleClaim = async (questId: string) => {
    if (!session || claiming) return;
    setClaiming(questId);

    try {
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message, {
          description: `Récompense: ${data.etherReward} Éther`,
        });
        await fetchQuests();
      } else {
        toast.error(data.error || "Erreur lors de la complétion");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setClaiming(null);
    }
  };

  // Not logged in
  if (status !== "loading" && !session) {
    return (
      <div
        ref={containerRef}
        className="min-h-screen flex flex-col items-center justify-center pb-12"
      >
        <div className="quest-title flex flex-col items-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-2xl"
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
            }}
          >
            📜
          </div>
          <h1
            className="text-xl md:text-2xl font-bold tracking-[0.15em] uppercase mb-2"
            style={{ color: TEXT_P }}
          >
            Quêtes Journalières
          </h1>
          <p className="text-xs mb-6 text-center max-w-xs" style={{ color: TEXT_S }}>
            Connecte-toi pour accéder à tes quêtes quotidiennes et réclamer tes
            récompenses.
          </p>
          <button
            onClick={() => setShowDialog(true)}
            className="text-xs font-bold tracking-[0.15em] uppercase px-6 py-2.5 rounded-xl transition-all duration-300 cursor-pointer"
            style={{
              background: "rgba(0,212,255,0.1)",
              color: ACCENT,
              border: "1px solid rgba(0,212,255,0.2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(0,212,255,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(0,212,255,0.1)";
            }}
          >
            Se connecter
          </button>
        </div>
        <SignInDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen pb-12">
      {/* Header */}
      <div className="quest-title flex items-center gap-3 mb-8 pt-4">
        <div
          className="h-px flex-1 max-w-[60px]"
          style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }}
        />
        <h1
          className="text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase"
          style={{ color: TEXT_P }}
        >
          Quêtes Journalières
        </h1>
        <div
          className="h-px flex-1 max-w-[60px]"
          style={{
            background: `linear-gradient(270deg, ${ACCENT}, transparent)`,
          }}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: ACCENT }}
            />
            <span
              className="text-[10px] tracking-[0.15em] uppercase"
              style={{ color: TEXT_T }}
            >
              Chargement…
            </span>
          </div>
        </div>
      ) : quests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
            }}
          >
            <span className="text-xl">📜</span>
          </div>
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-1"
            style={{ color: TEXT_T }}
          >
            Aucune quête disponible
          </p>
          <p className="text-xs" style={{ color: TEXT_T }}>
            De nouvelles quêtes apparaîtront bientôt.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              completion={completions.find((c) => c.taskId === quest.id)}
              isClaiming={claiming === quest.id}
              onClaim={handleClaim}
              onHoverStart={() => {}}
              onHoverEnd={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}