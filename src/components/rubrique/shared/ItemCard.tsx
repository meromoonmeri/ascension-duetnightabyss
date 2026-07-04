"use client";

import { motion } from "framer-motion";
import RankBadge from "./RankBadge";

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

export interface ItemCardData {
  id: string;
  name: string;
  nameJp?: string | null;
  subtitle?: string | null;
  rank?: string | null;
  imageUrl?: string | null;
  classification?: string | null;
  danger?: number | null;
  category: string;
  parentSlug?: string | null;
  description?: string | null;
  [key: string]: unknown;
}

interface ItemCardProps {
  item: ItemCardData;
  accentColor: string;
  onClick: (item: ItemCardData) => void;
  variant?: "default" | "compact" | "wide";
}

export default function ItemCard({ item, accentColor, onClick, variant = "default" }: ItemCardProps) {
  const gold = accentColor || GOLD;

  if (variant === "compact") {
    return (
      <motion.button
        onClick={() => onClick(item)}
        className="relative flex items-center gap-3 w-full text-left py-2 px-1 cursor-pointer transition-all"
        style={{
          background: "transparent",
          border: "none",
        }}
        whileHover={{
          x: 4,
        }}
        transition={{ duration: 0.2 }}
      >
        <RankBadge rank={item.rank} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="text-sm truncate"
              style={{ color: TEXT_ACTIVE, fontFamily: "'Gloock', serif" }}
            >
              {item.name}
            </span>
            {item.nameJp && (
              <span className="text-[11px] shrink-0" style={{ color: TEXT_TERTIARY, fontFamily: "'Gloock', serif" }}>
                {item.nameJp}
              </span>
            )}
          </div>
          {item.subtitle && (
            <p className="text-[11px] truncate mt-0.5" style={{ color: TEXT_TERTIARY, fontFamily: "'Gloock', serif" }}>
              {item.subtitle}
            </p>
          )}
        </div>
        <span
          className="text-[10px] shrink-0"
          style={{
            color: TEXT_MUTED,
            fontFamily: "'Gloock', serif",
          }}
        >
          {item.classification || ""}
        </span>
      </motion.button>
    );
  }

  if (variant === "wide") {
    return (
      <motion.button
        onClick={() => onClick(item)}
        className="relative w-full text-left overflow-hidden cursor-pointer group transition-all"
        style={{
          background: "transparent",
          border: "none",
        }}
        whileHover={{
          opacity: 0.85,
        }}
        transition={{ duration: 0.25 }}
      >
        {item.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)`,
              }}
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold" style={{ color: TEXT_PRIMARY, fontFamily: "'Gloock', serif" }}>
              {item.name}
            </h3>
            {item.nameJp && (
              <span className="text-sm" style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}>
                {item.nameJp}
              </span>
            )}
            {item.rank && <RankBadge rank={item.rank} />}
          </div>
          {item.subtitle && (
            <p className="text-xs mb-2" style={{ color: TEXT_SECONDARY, fontFamily: "'Gloock', serif" }}>
              {item.subtitle}
            </p>
          )}
          {item.description && (
            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: TEXT_BODY, fontFamily: "'Gloock', serif" }}>
              {item.description}
            </p>
          )}
        </div>
        {/* Bottom gold glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }}
        />
      </motion.button>
    );
  }

  // Default card — DNA minimal: no border, no background, just image + name overlay
  return (
    <motion.button
      onClick={() => onClick(item)}
      className="relative w-full text-left overflow-hidden cursor-pointer group transition-all"
      style={{
        background: "transparent",
        border: "none",
      }}
      whileHover={{
        opacity: 0.85,
      }}
      transition={{ duration: 0.25 }}
    >
      {/* Image */}
      {item.imageUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)`,
            }}
          />
          {/* Rank badge overlay */}
          <div className="absolute top-3 right-3">
            <RankBadge rank={item.rank} />
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="text-sm leading-tight"
            style={{ color: TEXT_ACTIVE, fontFamily: "'Gloock', serif" }}
          >
            {item.name}
          </h3>
          {!item.imageUrl && item.rank && <RankBadge rank={item.rank} size="sm" />}
        </div>

        {item.nameJp && (
          <p className="text-[11px] mb-1" style={{ color: TEXT_MUTED, fontFamily: "'Gloock', serif" }}>
            {item.nameJp}
          </p>
        )}

        {item.subtitle && (
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: TEXT_TERTIARY, fontFamily: "'Gloock', serif" }}>
            {item.subtitle}
          </p>
        )}

        {/* Danger indicator for creatures */}
        {item.danger != null && (
          <div className="flex items-center gap-2 mt-2.5">
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: TEXT_TERTIARY, fontFamily: "'WorldText', serif" }}
            >
              Danger
            </span>
            <div className="flex-1 h-px overflow-hidden" style={{ background: GOLD_BORDER }}>
              <motion.div
                className="h-full"
                style={{
                  width: `${Math.min(item.danger, 100)}%`,
                  background:
                    item.danger >= 80
                      ? "#ef4444"
                      : item.danger >= 50
                        ? GOLD
                        : item.danger >= 30
                          ? GOLD_LIGHT
                          : GOLD_DARK,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(item.danger, 100)}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </div>
          </div>
        )}

        {/* Classification text — no badge */}
        {item.classification && (
          <div className="mt-2">
            <span
              className="text-[10px]"
              style={{
                color: TEXT_MUTED,
                fontFamily: "'Gloock', serif",
              }}
            >
              {item.classification}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}