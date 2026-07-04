"use client";

import { useEffect, useRef } from "react";

interface ParticleCanvasProps {
  className?: string;
  colors?: string[];
  density?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  phase: number;
  speed: number;
}

export default function ParticleCanvas({
  className = "",
  colors,
  density = 60,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const defaultColors = colors || [
    "rgba(201,168,76,0.6)",
    "rgba(78,205,196,0.5)",
    "rgba(123,47,190,0.4)",
    "rgba(192,192,192,0.3)",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    const rect = canvas.getBoundingClientRect();
    particlesRef.current = Array.from({ length: density }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.3 + 0.1),
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.5,
    }));

    let time = 0;
    const animate = () => {
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      for (const p of particlesRef.current) {
        p.x += p.vx + Math.sin(time * p.speed + p.phase) * 0.15;
        p.y += p.vy;

        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const flickerOpacity = p.opacity * (0.7 + 0.3 * Math.sin(time * 2 + p.phase));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${flickerOpacity})`);
        ctx.fill();

        // Glow
        if (p.size > 1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const glowColor = p.color.replace(/([\d.]+)\)$/, `${flickerOpacity * 0.15})`);
          ctx.fillStyle = glowColor;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [density, defaultColors]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  );
}
