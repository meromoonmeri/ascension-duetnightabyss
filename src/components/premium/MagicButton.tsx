"use client";

import { type ReactNode } from "react";

interface MagicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  glowColor?: string;
  className?: string;
  type?: "button" | "submit";
}

export default function MagicButton({
  children,
  onClick,
  variant = "primary",
  glowColor = "var(--ancient-gold, #C9A84C)",
  className = "",
  type = "button",
}: MagicButtonProps) {
  const base = "font-display text-xs tracking-[0.15em] uppercase relative overflow-hidden rounded-md transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]";

  const variants = {
    primary: `px-6 py-3 border text-[var(--text-primary)] hover:scale-[1.02] active:scale-[0.98]`,
    secondary: `px-5 py-2.5 border text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-[1.01] active:scale-[0.99]`,
    ghost: `px-4 py-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]`,
  };

  const borders = {
    primary: `border-[${glowColor}]/40 hover:border-[${glowColor}]`,
    secondary: "border-[var(--border-accent)] hover:border-[var(--silver-dark)]",
    ghost: "border-transparent",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${borders[variant]} ${className}`}
      style={{
        boxShadow: variant !== "ghost" ? `0 0 0px ${glowColor}` : "none",
        ["--glow" as string]: glowColor,
      }}
      onMouseEnter={(e) => {
        if (variant !== "ghost") {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${glowColor}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (variant !== "ghost") {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0px ${glowColor}`;
        }
      }}
    >
      {/* Runic underline on hover */}
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 group-hover:w-full transition-all duration-500"
        style={{ background: glowColor }}
      />
      {children}
    </button>
  );
}
