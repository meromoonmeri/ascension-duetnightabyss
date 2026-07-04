"use client";

import { motion } from "framer-motion";

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  className?: string;
}

export default function StatBar({ label, value, max, color = "var(--ancient-gold)", className = "" }: StatBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-body text-xs text-[var(--text-secondary)]">{label}</span>
        <span className="font-mono-custom text-xs text-[var(--text-tertiary)]">{value}/{max}</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
