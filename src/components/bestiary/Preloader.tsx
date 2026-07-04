"use client";

import { useState, useEffect, useCallback } from "react";

interface PreloaderProps {
  onReady: () => void;
}

export default function Preloader({ onReady }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [fading, setFading] = useState(false);

  // Animate progress bar from 0 to 100%
  useEffect(() => {
    const duration = 1800; // ms total
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - pct / 100, 3);
      setProgress(Math.round(eased * 100));
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setLoaded(true);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  // Auto-dismiss 800ms after progress completes
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      setFading(true);
      setTimeout(() => onReady(), 500);
    }, 800);
    return () => clearTimeout(t);
  }, [loaded, onReady]);

  const handleClick = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      onReady();
    }, 500);
  }, [onReady]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        background: "radial-gradient(ellipse at center, #0a0e1a 0%, #050508 70%)",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Subtle animated particles / ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(78,205,196,0.06) 0%, transparent 50%), radial-gradient(circle at 30% 60%, rgba(201,168,76,0.04) 0%, transparent 40%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md px-6">
        {/* ASCENSION title */}
        <h1
          className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-[0.3em] select-none"
          style={{
            color: "#e9e4d6",
            textShadow:
              "0 0 30px rgba(201,168,76,0.25), 0 0 60px rgba(78,205,196,0.1)",
            animation: "preloader-pulse 3s ease-in-out infinite",
          }}
        >
          ASCENSION
        </h1>

        {/* RPG Health-bar style progress */}
        <div className="w-full">
          {/* Bar container */}
          <div
            className="relative w-full h-3 rounded-sm overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
            }}
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-100"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, #3B82F6 0%, #4ECDC4 40%, #C9A84C 100%)",
                boxShadow:
                  "0 0 10px rgba(78,205,196,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              {/* Shimmer effect */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          {/* Progress percentage */}
          <div className="flex justify-between mt-2">
            <span
              className="font-mono-custom text-[0.6rem] tracking-[0.15em] uppercase"
              style={{ color: "var(--text-tertiary)" }}
            >
              Chargement du Bestiaire
            </span>
            <span
              className="font-mono-custom text-[0.6rem]"
              style={{ color: "var(--text-tertiary)" }}
            >
              {progress}%
            </span>
          </div>
        </div>

        {/* Continue button — appears after loaded, also clickable for early dismiss */}
        <button
          onClick={handleClick}
          className="font-display text-xs sm:text-sm tracking-[0.25em] uppercase px-8 py-3 rounded transition-all duration-300 cursor-pointer"
          style={{
            color: loaded ? "#c9a25a" : "transparent",
            border: `1px solid ${loaded ? "rgba(201,162,90,0.4)" : "transparent"}`,
            background: loaded ? "rgba(201,162,90,0.06)" : "transparent",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.5s ease",
            animation: loaded ? "preloader-btn-pulse 2.5s ease-in-out infinite" : "none",
            textShadow: loaded ? "0 0 12px rgba(201,162,90,0.3)" : "none",
          }}
        >
          APPUYEZ POUR CONTINUER
        </button>
      </div>

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes preloader-pulse {
          0%,
          100% {
            opacity: 0.85;
            text-shadow: 0 0 30px rgba(201,168,76,0.25),
              0 0 60px rgba(78,205,196,0.1);
          }
          50% {
            opacity: 1;
            text-shadow: 0 0 40px rgba(201,168,76,0.4),
              0 0 80px rgba(78,205,196,0.2);
          }
        }
        @keyframes preloader-btn-pulse {
          0%,
          100% {
            box-shadow: 0 0 8px rgba(201,162,90,0.1);
          }
          50% {
            box-shadow: 0 0 20px rgba(201,162,90,0.25);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}