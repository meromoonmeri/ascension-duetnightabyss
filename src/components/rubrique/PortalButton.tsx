"use client";
import { useState } from "react";
import { motion } from "framer-motion";

/* ─── DNA Design Tokens ─── */
const GOLD = "#c9b89a";
const GOLD_BORDER = "rgba(201, 184, 154, 0.2)";
const GOLD_BORDER_HOVER = "rgba(201, 184, 154, 0.5)";
const GOLD_GLOW = "rgba(201, 184, 154, 0.15)";

interface PortalButtonProps {
  onClick: () => void;
}

export default function PortalButton({ onClick }: PortalButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-[80] flex flex-col items-center gap-3 cursor-pointer group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
      aria-label="Ouvrir la Rubrique"
    >
      {/* Vertical line — gold */}
      <motion.div
        className="w-px h-16 origin-top"
        style={{ background: `linear-gradient(to bottom, transparent, ${GOLD}80, transparent)` }}
        animate={{ scaleY: hovered ? 1.5 : 1, opacity: hovered ? 1 : 0.5 }}
      />

      {/* Portal orb — gold theme */}
      <motion.div
        className="relative w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: `${GOLD}10`,
          border: `1px solid ${GOLD_BORDER}`,
          backdropFilter: "blur(8px)",
        }}
        animate={{
          boxShadow: hovered
            ? `0 0 20px ${GOLD_GLOW}, 0 0 40px ${GOLD_GLOW}, inset 0 0 15px ${GOLD_GLOW}`
            : `0 0 10px ${GOLD_GLOW}`,
          scale: hovered ? 1.1 : 1,
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${GOLD_BORDER_HOVER}` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner dot */}
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: GOLD }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Label — gold text */}
      <motion.span
        className="text-[10px] font-medium tracking-[0.3em] uppercase"
        style={{
          color: hovered ? GOLD : `${GOLD}80`,
          writingMode: "vertical-rl",
          fontFamily: "'WorldText', serif",
        }}
        animate={{ opacity: hovered ? 1 : 0.4, x: hovered ? 2 : 0 }}
      >
        Rubrique
      </motion.span>

      {/* Bottom line — gold */}
      <motion.div
        className="w-px h-16 origin-bottom"
        style={{ background: `linear-gradient(to bottom, transparent, ${GOLD}80, transparent)` }}
        animate={{ scaleY: hovered ? 1.5 : 1, opacity: hovered ? 1 : 0.5 }}
      />
    </motion.button>
  );
}