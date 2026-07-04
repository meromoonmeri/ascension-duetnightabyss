"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface RarityFrameProps {
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  children: ReactNode;
  className?: string;
}

const RARITY_CONFIG = {
  common: {
    gradient: "linear-gradient(135deg, #606068, #808088, #606068)",
    glow: "rgba(128,128,136,0.2)",
    label: "COMMUN",
    animDuration: "0s",
  },
  rare: {
    gradient: "linear-gradient(135deg, #2A5F9E, #4A90D9, #2A5F9E)",
    glow: "rgba(74,144,217,0.3)",
    label: "RARE",
    animDuration: "4s",
  },
  epic: {
    gradient: "linear-gradient(135deg, #6B2FA0, #9B59B6, #6B2FA0)",
    glow: "rgba(155,89,182,0.35)",
    label: "ÉPIQUE",
    animDuration: "3.5s",
  },
  legendary: {
    gradient: "conic-gradient(from 0deg, #C9A84C, #F5D76E, #C9A84C, #A8892B, #C9A84C)",
    glow: "rgba(212,175,55,0.4)",
    label: "LÉGENDAIRE",
    animDuration: "3s",
  },
  mythic: {
    gradient: "conic-gradient(from 0deg, #4ECDC4, #A8E6CF, #7B2FBE, #4ECDC4)",
    glow: "rgba(78,205,196,0.5)",
    label: "MYTHIQUE",
    animDuration: "2.5s",
  },
};

export default function RarityFrame({ rarity, children, className = "" }: RarityFrameProps) {
  const config = RARITY_CONFIG[rarity];
  const isAnimated = rarity === "legendary" || rarity === "mythic";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative p-[2px] rounded-xl ${className}`}
      style={{
        background: config.gradient,
        animation: isAnimated ? `rotateBorder ${config.animDuration} linear infinite` : "none",
      }}
    >
      {/* Inner content */}
      <div
        className="relative rounded-[10px] overflow-hidden"
        style={{
          background: "var(--bg-card, #14141E)",
          boxShadow: `0 0 30px ${config.glow}, inset 0 0 30px ${config.glow.replace(/([\d.]+)\)$/, "0.05)")}`,
        }}
      >
        {/* Rarity label */}
        <div className="absolute top-3 right-3 z-20">
          <span
            className="font-display text-[0.6rem] tracking-[0.2em] uppercase px-2 py-0.5 rounded-sm"
            style={{
              color: config.glow.replace(/,[\d.]+\)/, ",1)"),
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${config.glow}`,
              textShadow: `0 0 8px ${config.glow}`,
            }}
          >
            {config.label}
          </span>
        </div>

        {children}
      </div>

      <style jsx>{`
        @keyframes rotateBorder {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes mythicPulse {
          0%, 100% { box-shadow: 0 0 30px var(--mythic-glow); }
          50% { box-shadow: 0 0 50px var(--mythic-glow), 0 0 80px rgba(78,205,196,0.15); }
        }
        @media (prefers-reduced-motion: no-preference) {
          ${rarity === "mythic" ? `div > div { animation: mythicPulse 3s ease-in-out infinite; }` : ""}
        }
      `}</style>
    </motion.div>
  );
}
