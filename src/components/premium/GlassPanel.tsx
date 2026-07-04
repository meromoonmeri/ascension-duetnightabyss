"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export default function GlassPanel({ children, className = "", glowColor }: GlassPanelProps) {
  const glow = glowColor || "rgba(201,168,76,0.1)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.06),
          inset 0 -1px 0 rgba(0,0,0,0.2),
          0 8px 32px rgba(0,0,0,0.3),
          0 0 40px ${glow}
        `,
      }}
    >
      {/* Corner ornaments */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--ancient-gold)]/20 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[var(--ancient-gold)]/20 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[var(--ancient-gold)]/20 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--ancient-gold)]/20 rounded-br-xl pointer-events-none" />

      <div className="relative z-10 p-6">{children}</div>
    </motion.div>
  );
}
