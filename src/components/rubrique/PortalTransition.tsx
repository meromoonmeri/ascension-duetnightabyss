"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOLD = "#c9b89a";
const GOLD_GLOW = "rgba(201, 184, 154, 0.3)";

interface PortalTransitionProps {
  isActive: boolean;
  onComplete: () => void;
  direction: "enter" | "exit";
}

export default function PortalTransition({ isActive, onComplete, direction }: PortalTransitionProps) {
  const [phase, setPhase] = useState<"idle" | "gathering" | "flash" | "expand" | "settle">("idle");

  useEffect(() => {
    if (!isActive) { setPhase("idle"); return; }

    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setPhase("gathering"), 100));
    timers.push(setTimeout(() => setPhase("flash"), 800));
    timers.push(setTimeout(() => setPhase("expand"), 1200));
    timers.push(setTimeout(() => setPhase("settle"), 1800));
    timers.push(setTimeout(() => onComplete(), 2400));

    return () => timers.forEach(clearTimeout);
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Gathering energy - gold particles converge to center */}
          {phase === "gathering" && (
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i / 20) * Math.PI * 2;
                const startX = 50 + Math.cos(angle) * 45;
                const startY = 50 + Math.sin(angle) * 45;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      left: `${startX}%`,
                      top: `${startY}%`,
                      background: GOLD,
                      boxShadow: `0 0 6px ${GOLD}`,
                    }}
                    animate={{
                      left: "50%",
                      top: "50%",
                      scale: [1, 2, 0],
                      opacity: [0.8, 1, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.02,
                      ease: "easeIn",
                    }}
                  />
                );
              })}
              {/* Central glow builds up */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 4, height: 4,
                  background: `radial-gradient(circle, ${GOLD}, ${GOLD_GLOW}, transparent)`,
                }}
                animate={{
                  width: [4, 120, 300],
                  height: [4, 120, 300],
                  opacity: [0, 0.6, 0],
                }}
                transition={{ duration: 0.9, ease: "easeIn" }}
              />
            </div>
          )}

          {/* Flash - gold/white burst */}
          {phase === "flash" && (
            <motion.div
              className="absolute inset-0"
              style={{ background: `radial-gradient(circle at center, rgba(255,255,255,0.9), ${GOLD_GLOW}, rgba(0,0,0,0.95))` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.3] }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Expand - dimensional rift opens */}
          {phase === "expand" && (
            <motion.div
              className="absolute inset-0"
              style={{ background: "#000000" }}
              initial={{ clipPath: "circle(0% at 50% 50%)" }}
              animate={{ clipPath: "circle(150% at 50% 50%)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Dimensional lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: "50%", top: "50%",
                    width: 1, height: "200vh",
                    background: `linear-gradient(to bottom, transparent, ${GOLD_GLOW}, transparent)`,
                    transformOrigin: "top center",
                  }}
                  initial={{ rotate: (i / 8) * 360, scaleY: 0, opacity: 0 }}
                  animate={{ rotate: (i / 8) * 360, scaleY: 1, opacity: [0, 0.6, 0] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}