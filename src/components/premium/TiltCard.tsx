"use client";

import { useRef, useState, useCallback, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  glowColor?: string;
  rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
  className?: string;
  onClick?: () => void;
  hoverScale?: number;
}

const RARITY_GLOW: Record<string, string> = {
  common: "rgba(128,128,136,0.15)",
  rare: "rgba(74,144,217,0.25)",
  epic: "rgba(155,89,182,0.3)",
  legendary: "rgba(212,175,55,0.4)",
  mythic: "rgba(78,205,196,0.45)",
};

export default function TiltCard({
  children,
  glowColor,
  rarity,
  className = "",
  onClick,
  hoverScale = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);

  const glow = glowColor || (rarity ? RARITY_GLOW[rarity] : "rgba(201,168,76,0.15)");

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setTilt({
        x: (y - 0.5) * -12,
        y: (x - 0.5) * 12,
      });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative group cursor-pointer ${className}`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="relative w-full h-full rounded-lg overflow-hidden transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? hoverScale : 1})`,
          transformStyle: "preserve-3d",
          boxShadow: isHovered
            ? `${tilt.y * 2}px ${-tilt.x * 2}px 30px ${glow}, 0 0 60px ${glow}`
            : `0 4px 20px rgba(0,0,0,0.4), 0 0 20px ${glow}`,
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Glassmorphic background */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: isHovered
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${isHovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
            transition: "all 0.3s ease",
          }}
        />

        {/* Dynamic light reflection */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${(tilt.y / 12 + 0.5) * 100}% ${(tilt.x / -12 + 0.5) * 100}%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
          {children}
        </div>

        {/* Levitation animation */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          @keyframes breathe {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @media (prefers-reduced-motion: no-preference) {
            div > div:first-of-type {
              animation: float 5s ease-in-out infinite, breathe 3s ease-in-out infinite;
            }
          }
        `}</style>
      </div>
    </motion.div>
  );
}
