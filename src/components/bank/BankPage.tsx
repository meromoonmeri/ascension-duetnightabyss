"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import SignInDialog from "@/components/auth/SignInDialog";
import { toast } from "sonner";
import gsap from "gsap";
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Loader2,
  Send,
  TrendingUp,
  UserPlus,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────
interface BankData {
  balance: number;
  wallet: number;
  totalDeposited: number;
  totalWithdrawn: number;
  interestRate: number;
  dailyInterest: number;
  interestEarned: number;
  lastInterestAt: string;
  transactions: TransactionRecord[];
}

interface TransactionRecord {
  id: string;
  type: string;
  amount: number;
  reason?: string | null;
  createdAt: string;
}

type TabType = "deposit" | "withdraw" | "send" | "history";

// ─── Helpers ───────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString("fr-FR");
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function txLabel(type: string, reason?: string | null): string {
  if (reason) return reason;
  switch (type) {
    case "bank_deposit":
      return "Dépôt en banque";
    case "bank_withdraw":
      return "Retrait de la banque";
    case "bank_interest":
      return "Intérêts quotidiens";
    default:
      return type;
  }
}

function getTxStyle(type: string): {
  color: string;
  bgColor: string;
  borderColor: string;
  isPositive: boolean;
} {
  switch (type) {
    case "bank_deposit":
    case "bank_interest":
    case "bank_transfer_in":
      return {
        color: "#34D399",
        bgColor: "rgba(52,211,153,0.08)",
        borderColor: "rgba(52,211,153,0.12)",
        isPositive: true,
      };
    case "bank_withdraw":
      return {
        color: "#F59E0B",
        bgColor: "rgba(245,158,11,0.08)",
        borderColor: "rgba(245,158,11,0.12)",
        isPositive: false,
      };
    case "bank_transfer_out":
      return {
        color: "#F472B6",
        bgColor: "rgba(244,114,182,0.08)",
        borderColor: "rgba(244,114,182,0.12)",
        isPositive: false,
      };
    default:
      return {
        color: "#9CA3AF",
        bgColor: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
        isPositive: false,
      };
  }
}

// ─── Tab config ────────────────────────────────────────────────
const TABS: { key: TabType; label: string; shortLabel: string }[] = [
  { key: "deposit", label: "Déposer", shortLabel: "Dép." },
  { key: "withdraw", label: "Retirer", shortLabel: "Rét." },
  { key: "send", label: "Envoyer", shortLabel: "Env." },
  { key: "history", label: "Historique", shortLabel: "Hist." },
];

// ─── Quick-amount presets ──────────────────────────────────────
const AMOUNT_PRESETS = [100, 500, 1000] as const;

// ─── Rich toast helper ─────────────────────────────────────────
function showTransactionToast(
  icon: React.ReactNode,
  title: string,
  description: string,
  accentColor: string
) {
  toast.custom(
    (t) => (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "rgba(10,10,18,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-xs text-gray-400">{description}</div>
        </div>
      </div>
    ),
    { duration: 4000 }
  );
}

// ─── Component ─────────────────────────────────────────────────
export default function BankPage() {
  const { data: session, status } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>("deposit");
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [bankData, setBankData] = useState<BankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  // ─── Fetch bank data ───────────────────────────────────────
  const fetchBankData = useCallback(async () => {
    try {
      const res = await fetch("/api/bank");
      if (res.status === 401) {
        setShowSignIn(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBankData(data);
    } catch {
      toast.error("Impossible de charger les données bancaires");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBankData();
    } else if (status === "unauthenticated") {
      setShowSignIn(true);
      setLoading(false);
    }
  }, [status, fetchBankData]);

  // ─── GSAP Entrance ─────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || showSignIn || loading) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".bank-balance-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(
        ".bank-wallet-card",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          delay: 0.1,
        }
      );
      gsap.fromTo(
        ".bank-tabs",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          delay: 0.18,
        }
      );
      gsap.fromTo(
        ".bank-tab-content",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          delay: 0.26,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, showSignIn]);

  // ─── Deposit / Withdraw ───────────────────────────────────
  const handleAction = async () => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      toast.error("Entre un montant valide");
      return;
    }

    setActionLoading(true);

    try {
      const endpoint =
        activeTab === "deposit" ? "/api/bank/deposit" : "/api/bank/withdraw";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur");
        setActionLoading(false);
        return;
      }

      // Rich toast notification
      if (activeTab === "deposit") {
        showTransactionToast(
          <ArrowDownLeft size={18} style={{ color: "#34D399" }} />,
          `+${fmt(numAmount)} ether déposé`,
          "L'ether a été transféré dans ton coffre-fort.",
          "#34D399"
        );
        if (data.interestEarned > 0) {
          setTimeout(() => {
            showTransactionToast(
              <TrendingUp size={18} style={{ color: "#A78BFA" }} />,
              `+${fmt(data.interestEarned)} intérêts`,
              "Intérêts quotidiens crédités sur ton solde.",
              "#A78BFA"
            );
          }, 500);
        }
      } else {
        showTransactionToast(
          <ArrowUpRight size={18} style={{ color: "#F59E0B" }} />,
          `-${fmt(numAmount)} ether retiré`,
          "L'ether a été crédité sur ton portefeuille.",
          "#F59E0B"
        );
      }

      setAmount("");
      fetchBankData();
    } catch {
      toast.error("Erreur lors de la transaction");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Send to friend ───────────────────────────────────────
  const handleTransfer = async () => {
    const numAmount = parseInt(amount, 10);
    const name = recipientName.trim();

    if (!name) {
      toast.error("Entre le nom du destinataire");
      return;
    }
    if (!numAmount || numAmount <= 0) {
      toast.error("Entre un montant valide");
      return;
    }

    setActionLoading(true);

    try {
      const res = await fetch("/api/bank/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName: name, amount: numAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur");
        setActionLoading(false);
        return;
      }

      // Rich toast notification
      showTransactionToast(
        <Send size={18} style={{ color: "#F472B6" }} />,
        `-${fmt(numAmount)} ether envoyé`,
        `Transfert à ${data.recipientName} effectué avec succès.`,
        "#F472B6"
      );

      setAmount("");
      setRecipientName("");
      fetchBankData();
    } catch {
      toast.error("Erreur lors du transfert");
    } finally {
      setActionLoading(false);
    }
  };

  const addAmount = (val: number) => {
    const current = parseInt(amount, 10) || 0;
    setAmount(String(current + val));
  };

  const setMaxAmount = () => {
    if (!bankData) return;
    if (activeTab === "deposit") {
      setAmount(String(bankData.wallet));
    } else if (activeTab === "send") {
      setAmount(String(bankData.balance));
    } else {
      setAmount(String(bankData.balance));
    }
  };

  // ─── Not authenticated ─────────────────────────────────────
  if (showSignIn || status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/[0.04] border border-white/[0.08]"
        >
          <History size={28} className="text-[#6B7280]" />
        </div>
        <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">
          Connexion requise
        </h2>
        <p className="text-sm text-[#9CA3AF] mb-8 text-center max-w-xs leading-relaxed">
          Connecte-toi pour accéder à ton coffre-fort et gérer ton ether.
        </p>
        <SignInDialog />
      </div>
    );
  }

  // ─── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2
          size={28}
          className="text-[#00D4FF] animate-spin mb-4"
        />
        <span className="text-xs tracking-[0.15em] uppercase text-[#6B7280]">
          Chargement…
        </span>
      </div>
    );
  }

  if (!bankData) return null;

  const isDeposit = activeTab === "deposit";
  const isSend = activeTab === "send";
  const isWithdraw = activeTab === "withdraw";

  // Determine accent color based on active tab
  let accentColor = "#34D399";
  if (isWithdraw) accentColor = "#F59E0B";
  else if (isSend) accentColor = "#F472B6";

  return (
    <div ref={containerRef} className="max-w-lg mx-auto space-y-4">
      {/* ═══════ BALANCE CARD ═══════ */}
      <div
        className="bank-balance-card rounded-xl p-5"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Label */}
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#6B7280] block mb-1">
          Solde bancaire
        </span>

        {/* Balance amount */}
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="text-3xl font-bold text-white tabular-nums tracking-tight"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {fmt(bankData.balance)}
          </span>
          <span className="text-xs text-[#6B7280]">ether</span>
        </div>

        {/* Interest rate */}
        <div className="flex items-center gap-1 mb-4">
          <span className="text-[#A78BFA] text-xs">◆</span>
          <span className="text-[10px] text-[#A78BFA]">
            Taux : {bankData.interestRate}% / jour
          </span>
        </div>

        {/* Sub-stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Daily interest */}
          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(167,139,250,0.06)",
              border: "1px solid rgba(167,139,250,0.12)",
            }}
          >
            <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#6B7280] block mb-1">
              Intérêt quotidien
            </span>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={13} className="text-[#A78BFA]" />
              <span className="text-sm font-semibold text-[#A78BFA] tabular-nums">
                +{fmt(bankData.dailyInterest)}
              </span>
            </div>
          </div>

          {/* Total deposited */}
          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(52,211,153,0.06)",
              border: "1px solid rgba(52,211,153,0.12)",
            }}
          >
            <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#6B7280] block mb-1">
              Total déposé
            </span>
            <div className="flex items-center gap-1.5">
              <ArrowDownLeft size={13} className="text-[#34D399]" />
              <span className="text-sm font-semibold text-[#34D399] tabular-nums">
                {fmt(bankData.totalDeposited)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ WALLET CARD ═══════ */}
      <div
        className="bank-wallet-card rounded-xl px-5 py-3.5 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[#A78BFA] text-sm">◆</span>
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#6B7280]">
            Portefeuille
          </span>
        </div>
        <span
          className="text-base font-semibold text-[#E5E7EB] tabular-nums"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {fmt(bankData.wallet)}{" "}
          <span className="text-[#6B7280] text-xs font-normal">ether</span>
        </span>
      </div>

      {/* ═══════ ACTION TABS ═══════ */}
      <div className="bank-tabs">
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-[0.06em] uppercase
                  transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "text-white"
                      : "text-[#6B7280] hover:text-[#9CA3AF]"
                  }
                `}
                style={{
                  background: isActive
                    ? "rgba(0,212,255,0.12)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(0,212,255,0.25)"
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 0 16px rgba(0,212,255,0.08)"
                    : "none",
                }}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ TAB CONTENT ═══════ */}
      <div className="bank-tab-content">
        {activeTab === "history" ? (
          /* ─── History List ─────────────────────────────────── */
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">
                Transactions
              </span>
              <History size={13} className="text-[#6B7280]" />
            </div>

            {/* Transaction list */}
            <div className="max-h-96 overflow-y-auto bank-scroll">
              {bankData.transactions.length === 0 ? (
                <div className="py-16 text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <History size={20} className="text-[#6B7280]" />
                  </div>
                  <p className="text-sm text-[#6B7280]">
                    Aucune transaction
                  </p>
                </div>
              ) : (
                <div>
                  {bankData.transactions.map((tx, i) => {
                    const style = getTxStyle(tx.type);

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between px-5 py-3 transition-colors duration-150"
                        style={{
                          borderBottom:
                            i < bankData.transactions.length - 1
                              ? "1px solid rgba(255,255,255,0.04)"
                              : "none",
                        }}
                      >
                        {/* Left: icon + label */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: style.bgColor,
                              border: `1px solid ${style.borderColor}`,
                              color: style.color,
                            }}
                          >
                            {tx.type === "bank_deposit" ? (
                              <ArrowDownLeft size={14} />
                            ) : tx.type === "bank_withdraw" ? (
                              <ArrowUpRight size={14} />
                            ) : tx.type === "bank_transfer_out" ? (
                              <Send size={14} />
                            ) : tx.type === "bank_transfer_in" ? (
                              <UserPlus size={14} />
                            ) : (
                              <TrendingUp size={14} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-[#E5E7EB] truncate">
                              {txLabel(tx.type, tx.reason)}
                            </div>
                            <div className="text-[11px] text-[#6B7280]">
                              {fmtDate(tx.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Right: amount */}
                        <span
                          className="text-sm font-semibold tabular-nums flex-shrink-0 ml-3"
                          style={{
                            color: style.color,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {style.isPositive ? "+" : "-"}
                          {fmt(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : isSend ? (
          /* ─── Send to Friend ──────────────────────────────── */
          <div
            className="rounded-xl p-5 space-y-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Section label */}
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-0.5 h-3.5 rounded-full"
                style={{ background: accentColor }}
              />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#9CA3AF]">
                Envoyer à un ami
              </span>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed ml-2 -mt-1">
              Transfère de l'ether de ta banque vers le compte d'un autre joueur.
            </p>

            {/* Recipient name input */}
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${accentColor}30`,
                boxShadow: `0 0 16px ${accentColor}06`,
              }}
            >
              <UserPlus size={16} className="text-[#6B7280] flex-shrink-0" />
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nom du personnage"
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#E5E7EB] placeholder-[#6B7280] w-full min-w-0"
                style={{ caretColor: accentColor }}
              />
            </div>

            {/* Amount input */}
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${accentColor}30`,
                boxShadow: `0 0 16px ${accentColor}06`,
              }}
            >
              <span className="text-[#A78BFA] text-sm">◆</span>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-[#E5E7EB] tabular-nums placeholder-[#6B7280] w-full min-w-0"
                style={{
                  fontVariantNumeric: "tabular-nums",
                  caretColor: accentColor,
                }}
              />
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B7280] flex-shrink-0">
                ether
              </span>
            </div>

            {/* Quick-amount buttons */}
            <div className="flex gap-2">
              {AMOUNT_PRESETS.map((val) => (
                <button
                  key={val}
                  onClick={() => addAmount(val)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] transition-all duration-200 cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#E5E7EB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "#9CA3AF";
                  }}
                >
                  {val}
                </button>
              ))}
              <button
                onClick={setMaxAmount}
                className="flex-1 py-2 rounded-lg text-xs font-bold tracking-[0.06em] uppercase transition-all duration-200 cursor-pointer"
                style={{
                  background: `${accentColor}10`,
                  border: `1px solid ${accentColor}25`,
                  color: accentColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${accentColor}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${accentColor}10`;
                }}
              >
                Tout
              </button>
            </div>

            {/* Info line */}
            <div className="text-center">
              <span className="text-xs text-[#6B7280]">
                En banque : {fmt(bankData.balance)} ether
              </span>
            </div>

            {/* Send button */}
            <button
              onClick={handleTransfer}
              disabled={
                actionLoading ||
                !amount ||
                parseInt(amount, 10) <= 0 ||
                !recipientName.trim()
              }
              className="w-full py-3.5 rounded-lg text-sm font-bold tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              style={{
                background:
                  actionLoading ||
                  !amount ||
                  parseInt(amount, 10) <= 0 ||
                  !recipientName.trim()
                    ? `${accentColor}08`
                    : `${accentColor}18`,
                border:
                  actionLoading ||
                  !amount ||
                  parseInt(amount, 10) <= 0 ||
                  !recipientName.trim()
                    ? `1px solid ${accentColor}20`
                    : `1px solid ${accentColor}40`,
                color: accentColor,
                boxShadow:
                  actionLoading ||
                  !amount ||
                  parseInt(amount, 10) <= 0 ||
                  !recipientName.trim()
                    ? "none"
                    : `0 4px 20px ${accentColor}12`,
                opacity:
                  actionLoading ||
                  !amount ||
                  parseInt(amount, 10) <= 0 ||
                  !recipientName.trim()
                    ? 0.4
                    : 1,
              }}
            >
              {actionLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Envoyer
            </button>
          </div>
        ) : (
          /* ─── Deposit / Withdraw ───────────────────────────── */
          <div
            className="rounded-xl p-5 space-y-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Section label */}
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-0.5 h-3.5 rounded-full"
                style={{ background: accentColor }}
              />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#9CA3AF]">
                {isDeposit ? "Dépôt d'ether" : "Retrait d'ether"}
              </span>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed ml-2 -mt-1">
              {isDeposit
                ? "Transfère de l'ether de ton portefeuille vers la banque."
                : "Récupère l'ether stocké dans ta banque."}
            </p>

            {/* Input field */}
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${accentColor}30`,
                boxShadow: `0 0 16px ${accentColor}06`,
              }}
            >
              <span className="text-[#A78BFA] text-sm">◆</span>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-[#E5E7EB] tabular-nums placeholder-[#6B7280] w-full min-w-0"
                style={{
                  fontVariantNumeric: "tabular-nums",
                  caretColor: accentColor,
                }}
              />
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B7280] flex-shrink-0">
                ether
              </span>
            </div>

            {/* Quick-amount buttons */}
            <div className="flex gap-2">
              {AMOUNT_PRESETS.map((val) => (
                <button
                  key={val}
                  onClick={() => addAmount(val)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] transition-all duration-200 cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#E5E7EB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "#9CA3AF";
                  }}
                >
                  {val}
                </button>
              ))}
              <button
                onClick={setMaxAmount}
                className="flex-1 py-2 rounded-lg text-xs font-bold tracking-[0.06em] uppercase transition-all duration-200 cursor-pointer"
                style={{
                  background: `${accentColor}10`,
                  border: `1px solid ${accentColor}25`,
                  color: accentColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${accentColor}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${accentColor}10`;
                }}
              >
                Tout
              </button>
            </div>

            {/* Info line */}
            <div className="text-center">
              <span className="text-xs text-[#6B7280]">
                {isDeposit
                  ? `Disponible : ${fmt(bankData.wallet)} ether`
                  : `En banque : ${fmt(bankData.balance)} ether`}
              </span>
            </div>

            {/* Action button */}
            <button
              onClick={handleAction}
              disabled={
                actionLoading || !amount || parseInt(amount, 10) <= 0
              }
              className="w-full py-3.5 rounded-lg text-sm font-bold tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              style={{
                background:
                  actionLoading || !amount || parseInt(amount, 10) <= 0
                    ? `${accentColor}08`
                    : `${accentColor}18`,
                border:
                  actionLoading || !amount || parseInt(amount, 10) <= 0
                    ? `1px solid ${accentColor}20`
                    : `1px solid ${accentColor}40`,
                color: accentColor,
                boxShadow:
                  actionLoading || !amount || parseInt(amount, 10) <= 0
                    ? "none"
                    : `0 4px 20px ${accentColor}12`,
                opacity:
                  actionLoading || !amount || parseInt(amount, 10) <= 0
                    ? 0.4
                    : 1,
              }}
            >
              {actionLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : isDeposit ? (
                <ArrowDownLeft size={15} />
              ) : (
                <ArrowUpRight size={15} />
              )}
              {isDeposit ? "Déposer" : "Retirer"}
            </button>
          </div>
        )}
      </div>

      {/* ─── Scrollbar styles ─── */}
      <style>{`
        .bank-scroll::-webkit-scrollbar { width: 4px; }
        .bank-scroll::-webkit-scrollbar-track { background: transparent; }
        .bank-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .bank-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
}