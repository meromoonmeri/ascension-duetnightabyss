"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import gsap from "gsap";
import { REGIONS, FOG_ZONES, AURELON_KINGDOMS, type RegionData, type KingdomData } from "@/data/regions";
import RegionInfoPanel from "./RegionInfoPanel";

/* ─── Constants ─── */
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_SPEED = 0.15;
const PAN_FRICTION = 0.92;
const TILT_MAX = 4; // degrees
const PARALLAX_DEPTH = 12; // px offset for depth layers
const KINGDOM_ZOOM_THRESHOLD = 1.8; // zoom level to show kingdoms

// Aurelon's center and bounding area (for detecting zoom-into-Aurelon)
const AURELON_CX = 20;
const AURELON_CY = 28;

/* ─── Types ─── */
interface PanVelocity {
  x: number;
  y: number;
}

type LayerMode = "regions" | "kingdoms";

/* ─── Component ─── */
export default function InteractiveMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const kingdomsContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredKingdom, setHoveredKingdom] = useState<string | null>(null);
  const [selectedKingdom, setSelectedKingdom] = useState<KingdomData | null>(null);
  const [layerMode, setLayerMode] = useState<LayerMode>("regions");
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [showKingdoms, setShowKingdoms] = useState(false);
  const panVelRef = useRef<PanVelocity>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const pinchDistRef = useRef<number>(0);
  const prevShowKingdomsRef = useRef(false);

  // Tooltip state
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Content dimensions for minimap calculation
  const [contentDims, setContentDims] = useState({ w: 0, h: 0 });

  // Listen for prefers-reduced-motion changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Track mouse position for tooltip
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  // Track container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track content dimensions for minimap
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContentDims({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Determine if zoomed into Aurelon area
  const isZoomedIntoAurelon = useMemo(() => {
    if (zoom < KINGDOM_ZOOM_THRESHOLD) return false;
    // Calculate the center of the viewport in map percentage coordinates
    const cw = dimensions.w || 800;
    const ch = dimensions.h || 600;
    const mapW = cw; // contentRef is 100vw max 1600px
    const mapH = mapW * 0.6667;
    // Center of viewport in map space
    const viewCenterMapX = 50 - (pan.x / (mapW * zoom)) * 100;
    const viewCenterMapY = 50 - (pan.y / (mapH * zoom)) * 100;
    // Check if Aurelon center is within the visible area (with generous margin)
    const visibleRadiusX = (50 / zoom) * 1.2;
    const visibleRadiusY = (50 / zoom) * 1.2;
    const dx = viewCenterMapX - AURELON_CX;
    const dy = viewCenterMapY - AURELON_CY;
    return Math.abs(dx) < visibleRadiusX && Math.abs(dy) < visibleRadiusY;
  }, [zoom, pan, dimensions.w, dimensions.h]);

  // Should kingdoms be visible?
  const shouldShowKingdoms = layerMode === "kingdoms" && isZoomedIntoAurelon;

  // GSAP animate kingdom hotspots in/out
  useEffect(() => {
    const container = kingdomsContainerRef.current;
    if (!container) return;

    const wasShowing = prevShowKingdomsRef.current;
    prevShowKingdomsRef.current = shouldShowKingdoms;

    if (isReducedMotion) {
      // No animation, just show/hide
      container.style.opacity = shouldShowKingdoms ? "1" : "0";
      container.style.pointerEvents = shouldShowKingdoms ? "auto" : "none";
      return;
    }

    if (shouldShowKingdoms && !wasShowing) {
      // Animate in
      gsap.killTweensOf(container);
      gsap.fromTo(
        container,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
      container.style.pointerEvents = "auto";

      // Stagger individual kingdom hotspots
      const items = container.querySelectorAll("[data-kingdom]");
      gsap.fromTo(
        items,
        { opacity: 0, scale: 0.3 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: "back.out(1.7)",
        }
      );
    } else if (!shouldShowKingdoms && wasShowing) {
      // Animate out
      gsap.killTweensOf(container);
      gsap.to(container, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          container.style.pointerEvents = "none";
          setSelectedKingdom(null);
        },
      });
    }
  }, [shouldShowKingdoms, isReducedMotion]);

  // Clamp pan to bounds
  const clampPan = useCallback(
    (px: number, py: number, z: number) => {
      if (!containerRef.current || !contentRef.current) return { x: px, y: py };
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const iw = contentRef.current.offsetWidth * z;
      const ih = contentRef.current.offsetHeight * z;

      // If image fits, center it
      if (iw <= cw) px = 0;
      else px = Math.min(cw * 0.3, Math.max(-(iw - cw * 0.7), px));

      if (ih <= ch) py = 0;
      else py = Math.min(ch * 0.3, Math.max(-(ih - ch * 0.7), py));

      return { x: px, y: py };
    },
    []
  );

  // Wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001 * ZOOM_SPEED;
      setZoom((prev) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta * prev));
        return next;
      });
    },
    []
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Mouse parallax tilt (3D effect)
  useEffect(() => {
    if (isReducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({ x: -my * TILT_MAX, y: mx * TILT_MAX });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isReducedMotion]);

  // Pan momentum animation frame
  useEffect(() => {
    if (isReducedMotion) return;
    let running = false;
    const step = () => {
      const v = panVelRef.current;
      if (Math.abs(v.x) < 0.1 && Math.abs(v.y) < 0.1) {
        running = false;
        return;
      }
      running = true;
      v.x *= PAN_FRICTION;
      v.y *= PAN_FRICTION;
      setPan((prev) => {
        const next = clampPan(prev.x + v.x, prev.y + v.y, zoom);
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };

    const onDragEnd = () => {
      if (!running) {
        running = true;
        rafRef.current = requestAnimationFrame(step);
      }
    };

    // Listen for global mouseup to start momentum
    window.addEventListener("mouseup", onDragEnd);
    return () => {
      window.removeEventListener("mouseup", onDragEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, [zoom, clampPan, isReducedMotion]);

  // Mouse drag handlers
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't drag if clicking a region or kingdom
      if (
        (e.target as HTMLElement).closest("[data-region]") ||
        (e.target as HTMLElement).closest("[data-kingdom]") ||
        (e.target as HTMLElement).closest("[data-kingdom-card]")
      )
        return;
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart({ x: pan.x, y: pan.y });
      panVelRef.current = { x: 0, y: 0 };
    },
    [pan]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan((prev) => {
        panVelRef.current = { x: dx - (prev.x - panStart.x), y: dy - (prev.y - panStart.y) };
        return clampPan(panStart.x + dx, panStart.y + dy, zoom);
      });
    },
    [isDragging, dragStart, panStart, zoom, clampPan]
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
        return;
      }
      if (e.touches.length === 1) {
        const t = e.touches[0];
        if (
          (e.target as HTMLElement).closest("[data-region]") ||
          (e.target as HTMLElement).closest("[data-kingdom]") ||
          (e.target as HTMLElement).closest("[data-kingdom-card]")
        )
          return;
        setIsDragging(true);
        setDragStart({ x: t.clientX, y: t.clientY });
        setPanStart({ x: pan.x, y: pan.y });
      }
    },
    [pan]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = (dist - pinchDistRef.current) * 0.005;
        pinchDistRef.current = dist;
        setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)));
        return;
      }
      if (e.touches.length === 1 && isDragging) {
        const t = e.touches[0];
        const dx = t.clientX - dragStart.x;
        const dy = t.clientY - dragStart.y;
        const next = clampPan(panStart.x + dx, panStart.y + dy, zoom);
        setPan(next);
      }
    },
    [isDragging, dragStart, panStart, zoom, clampPan]
  );

  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setTilt({ x: 0, y: 0 });
    setSelectedRegion(null);
    setSelectedKingdom(null);
  }, []);

  // Toggle layer mode
  const toggleLayer = useCallback(() => {
    setLayerMode((prev) => (prev === "regions" ? "kingdoms" : "regions"));
    setSelectedKingdom(null);
  }, []);

  // Map transform
  const mapTransform = useMemo(() => {
    if (isReducedMotion) {
      return `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
    }
    return `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
  }, [pan, zoom, tilt, isReducedMotion]);

  // Parallax offsets for depth layers
  const parallaxA = isReducedMotion
    ? { x: 0, y: 0 }
    : { x: tilt.y * PARALLAX_DEPTH * 0.3, y: tilt.x * PARALLAX_DEPTH * 0.3 };
  const parallaxB = isReducedMotion
    ? { x: 0, y: 0 }
    : { x: tilt.y * PARALLAX_DEPTH * 0.6, y: tilt.x * PARALLAX_DEPTH * 0.6 };

  const selectedData = REGIONS.find((r) => r.id === selectedRegion);

  // Star field box-shadows (deterministic pseudo-random spread)
  const starShadows = useMemo(() => {
    if (isReducedMotion) return "";
    const shadows: string[] = [];
    for (let i = 0; i < 140; i++) {
      const x = ((i * 7919 + 13) % 2000) / 20; // 0-100%
      const y = ((i * 6271 + 37) % 2000) / 20; // 0-100%
      const size = i % 5 === 0 ? 1.5 : 0.5 + (i % 3) * 0.3;
      const baseOpacity = 0.15 + ((i * 3571) % 6) * 0.08;
      shadows.push(`${x}% ${y}% 0 ${size}px rgba(255,255,255,${baseOpacity})`);
    }
    return shadows.join(", ");
  }, [isReducedMotion]);

  // Star field twinkle layer (second set, smaller, offset)
  const starShadowsTwinkle = useMemo(() => {
    if (isReducedMotion) return "";
    const shadows: string[] = [];
    for (let i = 0; i < 50; i++) {
      const x = ((i * 4231 + 71) % 2000) / 20;
      const y = ((i * 8117 + 43) % 2000) / 20;
      shadows.push(`${x}% ${y}% 0 1px rgba(255,255,255,0.3)`);
    }
    return shadows.join(", ");
  }, [isReducedMotion]);

  // Floating particle configs
  const particles = useMemo(() => {
    if (isReducedMotion) return [];
    const anims = ["mapParticleFloat", "mapParticleFloatAlt", "mapParticleFloatSlow"];
    const result = [];
    for (let i = 0; i < 14; i++) {
      result.push({
        left: ((i * 773 + 29) % 100),
        top: 40 + ((i * 541 + 13) % 55), // lower half of container
        size: 2 + (i % 3),
        duration: 7 + (i % 5) * 1.5,
        delay: (i * 2.1) % 8,
        animation: anims[i % 3],
        color: i % 3 === 0
          ? "rgba(212,175,55,0.35)"
          : i % 3 === 1
          ? "rgba(192,192,192,0.25)"
          : "rgba(160,180,200,0.2)",
      });
    }
    return result;
  }, [isReducedMotion]);

  // Minimap viewport calculation
  const minimapViewport = useMemo(() => {
    const cw = dimensions.w || 800;
    const ch = dimensions.h || 600;
    const mw = contentDims.w || cw;
    const mh = contentDims.h || cw * 0.6667;
    // Visible area in map coordinates
    const visW = cw / zoom;
    const visH = ch / zoom;
    const left = mw / 2 - (cw / 2 + pan.x) / zoom;
    const top = mh / 2 - (ch / 2 + pan.y) / zoom;
    return {
      left: (left / mw) * 100,
      top: (top / mh) * 100,
      width: (visW / mw) * 100,
      height: (visH / mh) * 100,
    };
  }, [zoom, pan, dimensions, contentDims]);

  // Hovered region data for tooltip
  const hoveredRegionData = REGIONS.find((r) => r.id === hoveredRegion);

  return (
    <div className="relative w-full h-full" style={{ minHeight: "70vh" }}>
      {/* ─── 3D Perspective Container ─── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        style={{
          height: "calc(100vh - 56px)",
          perspective: isReducedMotion ? "none" : "1200px",
          cursor: isDragging ? "grabbing" : "grab",
          backgroundColor: "var(--bg-primary)",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* ─── Star Field Background ─── */}
        {!isReducedMotion && starShadows && (
          <>
            <div
              className="map-star-field absolute inset-0 pointer-events-none"
              style={{
                width: "1px",
                height: "1px",
                boxShadow: starShadows,
              }}
            />
            <div
              className="map-star-field absolute inset-0 pointer-events-none"
              style={{
                width: "1px",
                height: "1px",
                boxShadow: starShadowsTwinkle,
                animation: "mapStarTwinkle 4s ease-in-out infinite",
              }}
            />
          </>
        )}

        {/* ─── Ambient Floating Particles ─── */}
        {particles.map((p, i) => (
          <div
            key={`particle-${i}`}
            className="map-particle absolute rounded-full pointer-events-none"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animation: `${p.animation} ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* Ambient glow behind the map */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.03) 0%, transparent 70%)",
          }}
        />

        {/* ─── Map Container ─── */}
        <div
          ref={mapRef}
          className="absolute origin-center will-change-transform"
          style={{
            left: "50%",
            top: "50%",
            width: "auto",
            height: "auto",
            maxWidth: "none",
            transform: `${mapTransform} translate(-50%, -50%)`,
            transformStyle: "preserve-3d",
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
          <div ref={contentRef} className="relative" style={{ width: "100vw", maxWidth: "1600px" }}>
            {/* Aspect ratio wrapper (3:2) */}
            <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>

              {/* ─── Layer 0: Deep shadow / depth base ─── */}
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  transform: isReducedMotion ? "none" : `translate3d(${parallaxB.x}px, ${parallaxB.y}px, -20px)`,
                  boxShadow: "0 25px 80px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.3)",
                  borderRadius: "4px",
                }}
              />

              {/* ─── Layer 1: Main map image ─── */}
              <img
                src="/monde-connu.webp"
                alt="Le Monde Connu — Carte du monde d'Ascension"
                className="absolute inset-0 w-full h-full object-contain rounded-lg"
                style={{
                  transform: isReducedMotion ? "none" : `translate3d(0, 0, 0)`,
                  filter: "saturate(0.85) contrast(1.05)",
                  opacity: mapLoaded ? 1 : 0,
                  transition: "opacity 0.6s ease",
                }}
                onLoad={() => setMapLoaded(true)}
                draggable={false}
              />

              {/* ─── Layer 2: Relief overlay (subtle emboss) ─── */}
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  transform: isReducedMotion ? "none" : `translate3d(${parallaxA.x * 0.5}px, ${parallaxA.y * 0.5}px, 4px)`,
                  mixBlendMode: "overlay",
                  opacity: 0.15,
                  backgroundImage:
                    "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)",
                  borderRadius: "4px",
                }}
              />

              {/* ─── Layer 3: Paper texture grain ─── */}
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  transform: isReducedMotion ? "none" : `translate3d(0, 0, 6px)`,
                  mixBlendMode: "multiply",
                  opacity: 0.06,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: "256px 256px",
                  borderRadius: "4px",
                }}
              />

              {/* ─── Layer 4: Vignette ─── */}
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  transform: isReducedMotion ? "none" : `translate3d(0, 0, 8px)`,
                  background:
                    "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.25) 100%)",
                  borderRadius: "4px",
                }}
              />

              {/* ─── Layer 5: Fog of War — animated mist on unknown territories ─── */}
              {!isReducedMotion && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                  {FOG_ZONES.map((zone, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        width: `${zone.w}%`,
                        height: `${zone.h}%`,
                        background:
                          "linear-gradient(180deg, rgba(6,6,10,0.85) 0%, rgba(20,20,30,0.6) 50%, rgba(6,6,10,0.8) 100%)",
                        animation: `fogDrift${i % 3} ${8 + (i % 4) * 2}s ease-in-out infinite alternate`,
                        filter: "blur(8px)",
                        mixBlendMode: "normal",
                      }}
                    />
                  ))}
                  {/* Fog particles layer */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 15% 80%, rgba(100,100,120,0.12) 0%, transparent 50%),
                        radial-gradient(circle at 85% 80%, rgba(80,80,100,0.1) 0%, transparent 45%),
                        radial-gradient(circle at 50% 90%, rgba(90,90,110,0.14) 0%, transparent 55%)
                      `,
                      animation: "fogPulse 12s ease-in-out infinite alternate",
                    }}
                  />
                  {/* Organic secondary fog layer — slow drift */}
                  <div
                    className="map-fog-organic absolute inset-0"
                    style={{
                      backgroundImage: `
                        radial-gradient(ellipse at 10% 85%, rgba(30,30,50,0.2) 0%, transparent 60%),
                        radial-gradient(ellipse at 90% 75%, rgba(25,25,45,0.18) 0%, transparent 55%),
                        radial-gradient(ellipse at 40% 95%, rgba(35,35,55,0.22) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 88%, rgba(20,20,40,0.15) 0%, transparent 45%)
                      `,
                      animation: "fogOrganicDrift 20s ease-in-out infinite",
                      filter: "blur(12px)",
                    }}
                  />
                </div>
              )}

              {/* Reduced motion: static fog */}
              {isReducedMotion && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                  {FOG_ZONES.map((zone, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        width: `${zone.w}%`,
                        height: `${zone.h}%`,
                        backgroundColor: "rgba(6,6,10,0.75)",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* ─── Layer 6: Region hotspots ─── */}
              <div
                className="absolute inset-0"
                style={{
                  transform: isReducedMotion ? "none" : `translate3d(0, 0, 10px)`,
                }}
              >
                {REGIONS.map((region) => (
                  <RegionHotspot
                    key={region.id}
                    region={region}
                    isHovered={hoveredRegion === region.id}
                    onHover={setHoveredRegion}
                    onSelect={setSelectedRegion}
                    isReducedMotion={isReducedMotion}
                  />
                ))}
              </div>

              {/* ─── Layer 7: Kingdom hotspots (Level 2 zoom, Aurelon only) ─── */}
              <div
                ref={kingdomsContainerRef}
                className="absolute inset-0"
                style={{
                  transform: isReducedMotion ? "none" : `translate3d(0, 0, 14px)`,
                  opacity: 0,
                  pointerEvents: "none",
                }}
              >
                {AURELON_KINGDOMS.map((kingdom) => (
                  <KingdomHotspot
                    key={kingdom.id}
                    kingdom={kingdom}
                    isHovered={hoveredKingdom === kingdom.id}
                    isSelected={selectedKingdom?.id === kingdom.id}
                    onHover={setHoveredKingdom}
                    onSelect={setSelectedKingdom}
                    isReducedMotion={isReducedMotion}
                  />
                ))}
              </div>

              {/* ─── Region name labels ─── */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  transform: isReducedMotion ? "none" : `translate3d(0, 0, 12px)`,
                }}
              >
                {REGIONS.map((region) => (
                  <div
                    key={`label-${region.id}`}
                    className="absolute font-display text-center"
                    style={{
                      left: `${region.cx}%`,
                      top: `${region.cy + 6}%`,
                      transform: "translate(-50%, 0)",
                      fontSize: `${Math.max(10, 12 / zoom)}px`,
                      letterSpacing: "0.12em",
                      color: region.color,
                      textShadow: `0 0 8px ${region.color}40, 0 1px 3px rgba(0,0,0,0.8)`,
                      opacity: hoveredRegion === region.id ? 1 : 0.7,
                      transition: "opacity 0.3s ease",
                      textTransform: "uppercase" as const,
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {region.name}
                  </div>
                ))}
              </div>

              {/* ─── Kingdom name labels (visible at Level 2) ─── */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  transform: isReducedMotion ? "none" : `translate3d(0, 0, 16px)`,
                  opacity: shouldShowKingdoms ? 1 : 0,
                  transition: "opacity 0.4s ease 0.3s",
                }}
              >
                {AURELON_KINGDOMS.map((kingdom) => {
                  const shortName = kingdom.name.replace("Royaume de ", "");
                  return (
                    <div
                      key={`klabel-${kingdom.id}`}
                      className="absolute font-display text-center"
                      style={{
                        left: `${kingdom.cx}%`,
                        top: `${kingdom.cy + 3}%`,
                        transform: "translate(-50%, 0)",
                        fontSize: `${Math.max(8, 9 / zoom)}px`,
                        letterSpacing: "0.1em",
                        color: kingdom.color,
                        textShadow: `0 0 6px ${kingdom.color}40, 0 1px 2px rgba(0,0,0,0.9)`,
                        opacity: hoveredKingdom === kingdom.id || selectedKingdom?.id === kingdom.id ? 1 : 0.75,
                        transition: "opacity 0.3s ease",
                        textTransform: "uppercase" as const,
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {shortName}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Loading state ─── */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-display text-sm tracking-[0.2em] text-txt-tertiary animate-pulse">
              Chargement de la carte…
            </div>
          </div>
        )}

        {/* ─── Unknown territory label ─── */}
        {mapLoaded && (
          <div
            className="absolute pointer-events-none font-display text-center"
            style={{
              bottom: "12%",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "rgba(192,192,192,0.25)",
              textTransform: "uppercase" as const,
              whiteSpace: "nowrap" as const,
            }}
          >
            TERRITOIRES INEXPLORÉS
            <br />
            <span style={{ fontSize: "0.55rem", opacity: 0.6 }}>
              De nombreuses terres, mers et mystères restent encore à explorer…
            </span>
          </div>
        )}

        {/* ─── Kingdom Overlay Card ─── */}
        {selectedKingdom && (
          <KingdomOverlayCard
            kingdom={selectedKingdom}
            onClose={() => setSelectedKingdom(null)}
            isReducedMotion={isReducedMotion}
          />
        )}

        {/* ─── Hover Tooltip ─── */}
        {(hoveredRegionData || (hoveredKingdom ? AURELON_KINGDOMS.find(k => k.id === hoveredKingdom) : null)) && (
          <div
            className="fixed z-50 pointer-events-none font-display"
            style={{
              left: tooltipPos.x + 16,
              top: tooltipPos.y - 10,
              opacity: 0.95,
            }}
          >
            <div
              className="px-3 py-2 rounded-sm"
              style={{
                backgroundColor: "rgba(6, 6, 10, 0.92)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              {hoveredRegionData ? (
                <>
                  <div
                    className="text-[0.7rem] tracking-[0.1em]"
                    style={{ color: hoveredRegionData.color }}
                  >
                    {hoveredRegionData.name}
                  </div>
                  <div className="text-[0.55rem] text-txt-tertiary tracking-wider mt-0.5">
                    {hoveredRegionData.subtitle} — {hoveredRegionData.peupleDominant}
                  </div>
                </>
              ) : (
                (() => {
                  const kData = AURELON_KINGDOMS.find(k => k.id === hoveredKingdom);
                  if (!kData) return null;
                  return (
                    <>
                      <div
                        className="text-[0.7rem] tracking-[0.1em]"
                        style={{ color: kData.color }}
                      >
                        {kData.name}
                      </div>
                      <div className="text-[0.55rem] text-txt-tertiary tracking-wider mt-0.5">
                        Capitale : {kData.capital}
                      </div>
                    </>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {/* ─── Zoom Level Indicator ─── */}
        {zoom >= KINGDOM_ZOOM_THRESHOLD && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div
              className="font-display text-[0.6rem] tracking-[0.15em] px-3 py-1 rounded-sm"
              style={{
                color: "var(--ornament-color)",
                backgroundColor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(212,175,55,0.15)",
              }}
            >
              {layerMode === "kingdoms" && isZoomedIntoAurelon
                ? "NIVEAU 2 — ROYAUMES D'AURELON"
                : "ZOOM PROFOND — Zoomez sur Aurelon pour les royaumes"}
            </div>
          </div>
        )}
      </div>

      {/* ─── Zoom Controls ─── */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.3))}
          className="w-10 h-10 rounded-sm border border-bdr-secondary bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-txt-secondary hover:text-silver hover:border-silver/30 transition-all duration-200"
          aria-label="Zoom avant"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="8" y1="4" x2="8" y2="12" />
            <line x1="4" y1="8" x2="12" y2="8" />
          </svg>
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.3))}
          className="w-10 h-10 rounded-sm border border-bdr-secondary bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-txt-secondary hover:text-silver hover:border-silver/30 transition-all duration-200"
          aria-label="Zoom arrière"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="4" y1="8" x2="12" y2="8" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 rounded-sm border border-bdr-secondary bg-surface-secondary/80 backdrop-blur-sm flex items-center justify-center text-txt-secondary hover:text-silver hover:border-silver/30 transition-all duration-200"
          aria-label="Réinitialiser la vue"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="10" height="10" rx="1" />
          </svg>
        </button>
      </div>

      {/* ─── Bottom-left: Zoom % + Layer Toggle ─── */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-20">
        <div className="font-mono text-[0.65rem] text-txt-tertiary opacity-40">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={toggleLayer}
          className="flex items-center gap-2 px-3 py-2 rounded-sm border text-[0.65rem] font-display tracking-[0.1em] transition-all duration-200"
          style={{
            borderColor: layerMode === "kingdoms" ? "rgba(212,175,55,0.4)" : "var(--bdr-secondary)",
            backgroundColor: layerMode === "kingdoms" ? "rgba(212,175,55,0.08)" : "var(--surface-secondary)",
            color: layerMode === "kingdoms" ? "var(--ornament-color)" : "var(--txt-secondary)",
            backdropFilter: "blur(4px)",
          }}
          aria-label={`Mode d'affichage : ${layerMode === "kingdoms" ? "Royaumes" : "Régions"}`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ flexShrink: 0 }}
          >
            {layerMode === "kingdoms" ? (
              /* Diamond icon for kingdoms */
              <>
                <rect x="4" y="4" width="8" height="8" rx="1" transform="rotate(45 8 8)" />
              </>
            ) : (
              /* Circle icon for regions */
              <circle cx="8" cy="8" r="5" />
            )}
          </svg>
          {layerMode === "kingdoms" ? "Royaumes d'Aurelon" : "Régions"}
        </button>
      </div>

      {/* ─── Minimap ─── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-sm overflow-hidden pointer-events-none"
        style={{
          width: 140,
          height: 94,
          border: "1px solid rgba(212,175,55,0.2)",
          backgroundColor: "rgba(10,10,15,0.8)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Mini region dots */}
        {REGIONS.map((r) => (
          <div
            key={`mini-${r.id}`}
            className="absolute rounded-full"
            style={{
              left: `${r.cx}%`,
              top: `${r.cy}%`,
              width: 4,
              height: 4,
              backgroundColor: r.color,
              opacity: 0.6,
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 4px ${r.color}`,
            }}
          />
        ))}
        {/* Viewport rectangle */}
        <div
          className="absolute border border-[var(--gold)]"
          style={{
            left: `${Math.max(0, Math.min(100, minimapViewport.left))}%`,
            top: `${Math.max(0, Math.min(100, minimapViewport.top))}%`,
            width: `${Math.min(100, minimapViewport.width)}%`,
            height: `${Math.min(100, minimapViewport.height)}%`,
            backgroundColor: "rgba(212,175,55,0.05)",
          }}
        />
      </div>

      {/* ─── Region Info Panel ─── */}
      {selectedData && (
        <RegionInfoPanel
          region={selectedData}
          onClose={() => setSelectedRegion(null)}
        />
      )}

      {/* ─── CSS Animations ─── */}
      <style jsx global>{`
        @keyframes fogDrift0 {
          0% { opacity: 0.7; transform: translateX(-2%) translateY(1%); }
          100% { opacity: 0.85; transform: translateX(2%) translateY(-1%); }
        }
        @keyframes fogDrift1 {
          0% { opacity: 0.75; transform: translateX(1.5%) translateY(-0.5%); }
          100% { opacity: 0.65; transform: translateX(-1.5%) translateY(0.5%); }
        }
        @keyframes fogDrift2 {
          0% { opacity: 0.8; transform: translateX(-1%) translateY(1.5%); }
          100% { opacity: 0.7; transform: translateX(1%) translateY(-1.5%); }
        }
        @keyframes fogPulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.9; }
          100% { opacity: 0.7; }
        }
        @keyframes mapRegionIdlePulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

/* ─── Region Hotspot Sub-component ─── */
function RegionHotspot({
  region,
  isHovered,
  onHover,
  onSelect,
  isReducedMotion,
}: {
  region: RegionData;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  isReducedMotion: boolean;
}) {
  const hoverScale = isReducedMotion ? 1 : 1.04;

  return (
    <div
      data-region={region.id}
      className="absolute cursor-pointer group"
      style={{
        left: `${region.cx}%`,
        top: `${region.cy}%`,
        width: `${region.radius * 2}%`,
        height: `${region.radius * 2}%`,
        transform: `translate(-50%, -50%) scale(${isHovered ? hoverScale : 1})`,
        transition: isReducedMotion ? "none" : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        borderRadius: "50%",
      }}
      onMouseEnter={() => onHover(region.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(region.id);
      }}
      role="button"
      tabIndex={0}
      aria-label={`Région ${region.name} — ${region.subtitle}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(region.id);
        }
      }}
    >
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1.5px solid rgba(${region.colorRgb}, ${isHovered ? 0.6 : 0.2})`,
          boxShadow: isHovered
            ? `0 0 20px rgba(${region.colorRgb}, 0.3), 0 0 40px rgba(${region.colorRgb}, 0.15), inset 0 0 15px rgba(${region.colorRgb}, 0.1)`
            : `0 0 10px rgba(${region.colorRgb}, 0.1)`,
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          backgroundColor: isHovered
            ? `rgba(${region.colorRgb}, 0.08)`
            : "transparent",
        }}
      />
      {/* Pulse on hover */}
      {isHovered && !isReducedMotion && (
        <div
          className="absolute inset-[-8px] rounded-full animate-ping"
          style={{
            border: `1px solid rgba(${region.colorRgb}, 0.3)`,
            animationDuration: "1.5s",
          }}
        />
      )}
      {/* Idle pulse ring */}
      {!isHovered && !isReducedMotion && (
        <div
          className="absolute inset-[-4px] rounded-full"
          style={{
            border: `1px solid rgba(${region.colorRgb}, 0.15)`,
            animation: `mapRegionIdlePulse ${3 + (parseInt(region.color.slice(1, 3), 16) % 3)}s ease-in-out infinite`,
          }}
        />
      )}
      {/* Center dot */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 6,
          height: 6,
          backgroundColor: region.color,
          boxShadow: isHovered
            ? `0 0 12px ${region.color}, 0 0 24px ${region.color}60`
            : `0 0 8px ${region.color}80`,
          opacity: isHovered ? 1 : 0.5,
          transition: "opacity 0.3s ease, box-shadow 0.3s ease",
        }}
      />
    </div>
  );
}

/* ─── Kingdom Hotspot Sub-component (Diamond shape) ─── */
function KingdomHotspot({
  kingdom,
  isHovered,
  isSelected,
  onHover,
  onSelect,
  isReducedMotion,
}: {
  kingdom: KingdomData;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (k: KingdomData) => void;
  isReducedMotion: boolean;
}) {
  const hoverScale = isReducedMotion ? 1 : 1.15;
  const size = 4.5; // diameter in % of map (smaller than regions)

  return (
    <div
      data-kingdom={kingdom.id}
      className="absolute cursor-pointer"
      style={{
        left: `${kingdom.cx}%`,
        top: `${kingdom.cy}%`,
        width: `${size}%`,
        height: `${size}%`,
        transform: `translate(-50%, -50%) rotate(45deg) scale(${isHovered || isSelected ? hoverScale : 1})`,
        transition: isReducedMotion ? "none" : "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onMouseEnter={() => onHover(kingdom.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(kingdom);
      }}
      role="button"
      tabIndex={0}
      aria-label={`${kingdom.name} — Capitale : ${kingdom.capital}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(kingdom);
        }
      }}
    >
      {/* Diamond border */}
      <div
        className="absolute inset-0"
        style={{
          border: `1.5px solid rgba(${kingdom.colorRgb}, ${isHovered || isSelected ? 0.7 : 0.3})`,
          boxShadow: isHovered || isSelected
            ? `0 0 14px rgba(${kingdom.colorRgb}, 0.35), 0 0 28px rgba(${kingdom.colorRgb}, 0.15), inset 0 0 10px rgba(${kingdom.colorRgb}, 0.1)`
            : `0 0 6px rgba(${kingdom.colorRgb}, 0.1)`,
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          backgroundColor: isHovered || isSelected
            ? `rgba(${kingdom.colorRgb}, 0.12)`
            : `rgba(${kingdom.colorRgb}, 0.04)`,
        }}
      />
      {/* Center dot (rotated back to appear as circle) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 5,
          height: 5,
          backgroundColor: kingdom.color,
          boxShadow: `0 0 8px ${kingdom.color}80`,
          opacity: isHovered || isSelected ? 1 : 0.6,
          transition: "opacity 0.3s ease",
          transform: "translate(-50%, -50%) rotate(-45deg)",
        }}
      />
    </div>
  );
}

/* ─── Kingdom Overlay Card ─── */
function KingdomOverlayCard({
  kingdom,
  onClose,
  isReducedMotion,
}: {
  kingdom: KingdomData;
  onClose: () => void;
  isReducedMotion: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (isReducedMotion) {
      el.style.opacity = "1";
      el.style.transform = "translate(-50%, 0)";
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 12, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.5)" }
    );

    return () => {
      gsap.killTweensOf(el);
    };
  }, [kingdom.id, isReducedMotion]);

  const handleClose = useCallback(() => {
    const el = cardRef.current;
    if (!el) {
      onClose();
      return;
    }

    if (isReducedMotion) {
      onClose();
      return;
    }

    gsap.to(el, {
      opacity: 0,
      y: 8,
      scale: 0.95,
      duration: 0.2,
      ease: "power2.in",
      onComplete: onClose,
    });
  }, [onClose, isReducedMotion]);

  // Position the card relative to the kingdom's position on screen
  // We place it inside the container but position it absolutely using the kingdom's map coordinates
  return (
    <div
      data-kingdom-card
      className="absolute z-30"
      style={{
        left: `${kingdom.cx}%`,
        top: `${kingdom.cy}%`,
        transform: "translate(-50%, 0)",
        marginTop: "2.5%",
        pointerEvents: "auto",
      }}
    >
      <div
        ref={cardRef}
        className="relative w-56 sm:w-64 rounded-sm border p-4 shadow-2xl"
        style={{
          borderColor: `${kingdom.color}30`,
          backgroundColor: "rgba(6, 6, 10, 0.92)",
          backdropFilter: "blur(12px)",
          opacity: 0,
        }}
      >
        {/* Accent line top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${kingdom.color}60, transparent)`,
          }}
        />

        {/* Kingdom name */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3
              className="font-display text-sm tracking-[0.08em] leading-tight"
              style={{ color: kingdom.color }}
            >
              {kingdom.name}
            </h3>
            <p className="font-body text-[0.65rem] text-txt-tertiary mt-0.5 tracking-wider">
              Capitale : <span className="text-txt-secondary">{kingdom.capital}</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px my-2.5"
          style={{
            background: `linear-gradient(90deg, ${kingdom.color}25, transparent)`,
          }}
        />

        {/* Description */}
        <p className="font-body text-xs text-txt-secondary leading-relaxed mb-3">
          {kingdom.description}
        </p>

        {/* Retour button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="flex items-center gap-1.5 text-[0.65rem] font-display tracking-[0.08em] text-txt-tertiary hover:text-txt-secondary transition-colors duration-200"
          aria-label="Retour"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="8" x2="4" y2="8" />
            <polyline points="7,5 4,8 7,11" />
          </svg>
          RETOUR
        </button>
      </div>
    </div>
  );
}