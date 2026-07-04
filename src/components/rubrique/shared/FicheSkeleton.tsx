"use client";

import { motion } from "framer-motion";

/* ─── DNA Design Tokens ─── */
const GOLD = "#c9b89a";
const GOLD_BORDER = "rgba(201, 184, 154, 0.2)";

interface FicheSkeletonProps {
  accentColor?: string;
}

export default function FicheSkeleton({ accentColor = GOLD }: FicheSkeletonProps) {
  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto" style={{ background: "#000000" }}>
      <motion.div
        className="min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header skeleton */}
        <div className="p-6 flex items-center gap-4">
          <div className="w-9 h-9 rounded" style={{ background: "rgba(201,184,154,0.08)", border: `1px solid ${GOLD_BORDER}` }} />
          <div className="flex-1">
            <div className="h-6 w-48 rounded mb-2" style={{ background: "rgba(201,184,154,0.08)" }} />
            <div className="h-4 w-24 rounded" style={{ background: "rgba(201,184,154,0.12)" }} />
          </div>
        </div>

        {/* Hero image skeleton */}
        <div className="mx-6 h-64 rounded" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${GOLD_BORDER}` }} />

        {/* Content sections */}
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-5 w-36 rounded mb-3" style={{ background: "rgba(201,184,154,0.1)" }} />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-4 rounded"
                    style={{
                      background: "rgba(201,184,154,0.05)",
                      width: `${j === 2 ? "60%" : "100%"}`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}