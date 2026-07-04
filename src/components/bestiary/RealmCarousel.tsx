"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Skull, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface RealmData {
  id: string;
  name: string;
  slug: string;
  type: "connu" | "cache";
  imageUrl: string;
  dangerMoy: number; // 1-5 average danger
  _count: { creatures: number };
}

interface RealmCarouselProps {
  realms: RealmData[];
  onExplore?: (realm: RealmData) => void;
}

const TOTAL_VISIBLE = 5;

function getTransform(index: number, active: number, total: number) {
  const diff = index - active;
  let d = diff;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;

  const absD = Math.abs(d);
  if (absD > 2)
    return {
      transform: "translateX(0) scale(0.6)",
      opacity: 0,
      zIndex: 0,
      blur: 4,
    };

  const tx = d * 28;
  const scale = d === 0 ? 1 : 0.78;
  const rotate = d * 6;
  const zIndex = 10 - absD;
  const opacity = d === 0 ? 1 : absD === 1 ? 0.65 : 0.35;
  const translateZ = d === 0 ? 0 : -180;
  const blur = d === 0 ? 0 : absD === 1 ? 1 : 2;

  return {
    transform: `translateX(${tx}%) translateZ(${translateZ}px) rotateY(${rotate}deg) scale(${scale})`,
    opacity,
    zIndex,
    blur,
    transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };
}

function DangerStars({ level, size = 12 }: { level: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: size,
            color: i < Math.round(level) ? "#c9a25a" : "rgba(255,255,255,0.12)",
            textShadow:
              i < Math.round(level) ? "0 0 6px rgba(201,162,90,0.5)" : "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function RealmCarousel({ realms, onExplore }: RealmCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = realms.length;
  const go = useCallback(
    (dir: number) => {
      setActiveIndex((prev) => (prev + dir + total) % total);
    },
    [total]
  );

  // Auto-rotate every 5s
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => go(1), 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, go]);

  const activeRealm = realms[activeIndex];

  if (!realms.length) return null;

  return (
    <section
      className="relative w-full overflow-hidden py-8"
      style={{ backgroundColor: "transparent" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel container */}
      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: 960, height: 380, perspective: 1200 }}
      >
        {/* Left arrow */}
        <button
          onClick={() => go(-1)}
          className="absolute left-0 top-1/2 z-30 -translate-y-1/2 hidden sm:flex items-center justify-center cursor-pointer"
          style={{
            width: 40,
            height: 40,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(5,5,8,0.8)",
            color: "#e9e4d6",
            clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(5,5,8,0.8)";
          }}
          aria-label="Royaume précédent"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => go(1)}
          className="absolute right-0 top-1/2 z-30 -translate-y-1/2 hidden sm:flex items-center justify-center cursor-pointer"
          style={{
            width: 40,
            height: 40,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(5,5,8,0.8)",
            color: "#e9e4d6",
            clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(5,5,8,0.8)";
          }}
          aria-label="Royaume suivant"
        >
          <ChevronRight size={16} />
        </button>

        {/* Slides */}
        <div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {realms.map((realm, idx) => {
            const style = getTransform(idx, activeIndex, total);
            const isActive = idx === activeIndex;

            return (
              <div
                key={realm.id}
                className="absolute inset-0 flex items-end justify-center"
                style={{
                  ...style,
                  filter:
                    style.blur > 0
                      ? `blur(${style.blur}px) brightness(0.7)`
                      : isActive
                        ? "brightness(1)"
                        : "brightness(0.7)",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <div
                  className="relative w-64 sm:w-72 h-96 rounded-lg overflow-hidden"
                  style={{
                    border: isActive
                      ? "1px solid rgba(201,162,90,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isActive
                      ? "0 0 30px rgba(201,162,90,0.15), 0 20px 60px rgba(0,0,0,0.6)"
                      : "0 10px 40px rgba(0,0,0,0.5)",
                    transition: "border-color 0.6s, box-shadow 0.6s",
                  }}
                >
                  {/* Background image */}
                  {realm.imageUrl ? (
                    <Image
                      src={realm.imageUrl}
                      alt={realm.name}
                      fill
                      className="object-cover"
                      style={{
                        filter: isActive
                          ? "saturate(1.1) contrast(1.05)"
                          : "saturate(0.5) brightness(0.6)",
                        transition: "filter 0.6s ease",
                      }}
                      unoptimized
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #0a0e1a 0%, #14141e 50%, #1a0a2e 100%)",
                      }}
                    />
                  )}

                  {/* Dark gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.5) 40%, rgba(5,5,8,0.2) 100%)",
                    }}
                  />

                  {/* Content at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Type badge */}
                    <div className="mb-2">
                      <Badge
                        className="font-mono-custom text-[0.55rem] tracking-[0.12em] uppercase"
                        style={
                          realm.type === "connu"
                            ? {
                                color: "#22C55E",
                                borderColor: "rgba(34,197,94,0.4)",
                                background: "rgba(34,197,94,0.08)",
                              }
                            : {
                                color: "#A855F7",
                                borderColor: "rgba(168,85,247,0.4)",
                                background: "rgba(168,85,247,0.08)",
                              }
                        }
                        variant="outline"
                      >
                        {realm.type === "connu" ? "✦ Connu" : "✦ Caché"}
                      </Badge>
                    </div>

                    {/* Realm name */}
                    <h3
                      className="font-display text-base sm:text-lg tracking-[0.08em] mb-1"
                      style={{ color: "#e9e4d6" }}
                    >
                      {realm.name}
                    </h3>

                    {/* Danger + creature count */}
                    <div className="flex items-center justify-between mb-3">
                      <DangerStars level={realm.dangerMoy} size={11} />
                      <span
                        className="font-mono-custom text-[0.6rem]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <Skull size={10} className="inline mr-1" />
                        {realm._count.creatures} créatures
                      </span>
                    </div>

                    {/* Explore button */}
                    {isActive && onExplore && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExplore(realm)}
                        className="w-full font-display text-[0.6rem] tracking-[0.18em] uppercase gap-2 cursor-pointer"
                        style={{
                          borderColor: "rgba(201,162,90,0.3)",
                          color: "#c9a25a",
                          background: "rgba(201,162,90,0.06)",
                        }}
                      >
                        <MapPin size={12} />
                        Explorer
                        <ArrowRight size={12} className="ml-auto" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(5,5,8,0.5) 100%)",
          }}
        />
      </div>

      {/* Pagination dots */}
      <div className="relative z-10 flex items-center justify-center gap-2 mt-6">
        {realms.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className="transition-all duration-300 cursor-pointer"
            style={{
              width: idx === activeIndex ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background:
                idx === activeIndex ? "#c9a25a" : "rgba(255,255,255,0.15)",
              border: "none",
              padding: 0,
            }}
            aria-label={`Royaume ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}