"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { X, Thermometer, Users } from "lucide-react";
import type { RegionData } from "@/data/regions";

interface RegionInfoPanelProps {
  region: RegionData;
  onClose: () => void;
}

export default function RegionInfoPanel({ region, onClose }: RegionInfoPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Animate in
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: prefersReduced ? 0.1 : 0.45, ease: "power3.out" }
      );
    }
    if (backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: prefersReduced ? 0.1 : 0.3 }
      );
    }

    // Lock body scroll
    document.body.style.overflow = "hidden";

    // ESC to close
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handleClose = () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        x: 60,
        opacity: 0,
        duration: prefersReduced ? 0.1 : 0.3,
        ease: "power2.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
        style={{ opacity: 0 }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 z-40 h-full w-full sm:w-[440px] overflow-y-auto"
        style={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Fiche lore : ${region.name}`}
      >
        <div
          className="h-full border-l flex flex-col"
          style={{
            borderColor: `${region.color}30`,
            background: "var(--bg-primary)",
          }}
        >
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-bdr-secondary">
            {/* Accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(90deg, ${region.color}80, ${region.color}20, transparent)`,
              }}
            />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-sm text-txt-tertiary hover:text-silver hover:bg-surface-secondary transition-colors duration-200"
              aria-label="Fermer"
            >
              <X size={16} strokeWidth={1.5} />
            </button>

            {/* Color accent bar */}
            <div
              className="w-8 h-1 rounded-full mb-4"
              style={{ backgroundColor: region.color }}
            />

            {/* Title */}
            <h2
              className="font-display text-xl sm:text-2xl tracking-[0.1em] text-engraved mb-1"
              style={{ color: region.color }}
            >
              {region.name}
            </h2>
            <p className="font-body text-xs tracking-[0.08em] text-txt-tertiary mb-1">
              {region.subtitle}
            </p>
            <p className="font-body text-[0.7rem] text-txt-tertiary opacity-60">
              {region.nameJp}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <div>
              <p className="font-body text-sm text-txt-secondary leading-relaxed">
                {region.description}
              </p>
            </div>

            {/* Divider */}
            <div
              className="h-px"
              style={{
                background: `linear-gradient(90deg, ${region.color}30, transparent)`,
              }}
            />

            {/* Climat */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer
                  size={14}
                  strokeWidth={1.5}
                  style={{ color: region.color, opacity: 0.7 }}
                />
                <h3 className="font-display text-xs tracking-[0.15em] uppercase text-txt-accent">
                  Climat
                </h3>
              </div>
              <p className="font-body text-sm text-txt-secondary leading-relaxed">
                {region.climat}
              </p>
            </div>

            {/* Divider */}
            <div
              className="h-px"
              style={{
                background: `linear-gradient(90deg, ${region.color}30, transparent)`,
              }}
            />

            {/* Peuple dominant */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users
                  size={14}
                  strokeWidth={1.5}
                  style={{ color: region.color, opacity: 0.7 }}
                />
                <h3 className="font-display text-xs tracking-[0.15em] uppercase text-txt-accent">
                  Peuple dominant
                </h3>
              </div>
              <p
                className="font-display text-sm tracking-[0.05em] mb-2"
                style={{ color: region.color }}
              >
                {region.peupleDominant}
              </p>
              <p className="font-body text-sm text-txt-secondary leading-relaxed">
                {region.descriptionPeuple}
              </p>
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-6 py-4 border-t border-bdr-secondary">
            <p className="font-body text-[0.65rem] text-txt-tertiary opacity-50 text-center tracking-wider">
              Cliquez en dehors ou appuyez sur Échap pour fermer
            </p>
          </div>
        </div>
      </div>
    </>
  );
}