"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ParallaxLayer {
  content: ReactNode;
  speed: number;
}

interface ParallaxHeroProps {
  children?: ReactNode;
  layers?: ParallaxLayer[];
  height?: string;
  className?: string;
  overlayColor?: string;
}

export default function ParallaxHero({
  children,
  layers = [],
  height = "100vh",
  className = "",
  overlayColor = "var(--bg-primary)",
}: ParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;

        layerRefs.current.forEach((el, i) => {
          if (!el) return;
          const speed = layers[i]?.speed || 0;
          el.style.transform = `translate3d(${cx * speed * 20}px, ${cy * speed * 20}px, 0)`;
        });
      });
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        layerRefs.current.forEach((el, i) => {
          if (!el) return;
          const speed = layers[i]?.speed || 0;
          el.style.transform = `translate3d(0, ${scrollY * speed * 0.3}px, 0)`;
        });
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [layers]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Parallax layers */}
      {layers.map((layer, i) => (
        <div
          key={i}
          ref={(el) => { layerRefs.current[i] = el; }}
          className="absolute inset-0 will-change-transform"
          style={{ transition: "transform 0.15s ease-out" }}
        >
          {layer.content}
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 30%, ${overlayColor} 80%),
            linear-gradient(to bottom, transparent 50%, ${overlayColor} 100%)
          `,
        }}
      />

      {/* Bottom fog */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[6]"
        style={{
          background: `linear-gradient(to bottom, transparent, ${overlayColor})`,
        }}
      />
    </div>
  );
}
