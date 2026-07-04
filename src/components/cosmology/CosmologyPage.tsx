"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type RefObject,
} from "react";
import gsap from "gsap";
import { COSMOLOGY_DATA, type CosmologySection } from "@/data/cosmology";
import { useAudioStore } from "@/store/audioStore";
import { initAudio } from "@/lib/audioEngine";

/* ═══════════════════════════════════════════════════════════════════════
   1. TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

interface StarDef {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  freq: number;
}

interface BgStar {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: "far" | "mid" | "near";
  parallax: number;
  baseAlpha: number;
}

interface ShootingStarData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface NebulaDef {
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  phase: number;
}

const STAR_MAP: StarDef[] = [
  { id: "deux-origines", x: 50, y: 38, size: 1.4, color: "#FFFFFF", freq: 220 },
  { id: "dragons-primordiaux", x: 18, y: 25, size: 1.2, color: "#FF6B35", freq: 261.63 },
  { id: "primordiaux-sans-visage", x: 78, y: 18, size: 1.0, color: "#8844FF", freq: 329.63 },
  { id: "xarmekth", x: 22, y: 72, size: 0.9, color: "#8B8B8B", freq: 392 },
  { id: "divinites", x: 82, y: 58, size: 1.1, color: "#FFD700", freq: 440 },
  { id: "religions", x: 50, y: 82, size: 1.0, color: "#E8B830", freq: 493.88 },
];

const CONSTELLATIONS: [number, number][] = [
  [0, 1], // Deux Origines → Dragons
  [0, 2], // Deux Origines → Primordiaux
  [0, 3], // Deux Origines → Xarmekth
  [0, 4], // Deux Origines → Divinités
  [0, 5], // Deux Origines → Religions
  [1, 4], // Dragons → Divinités
  [2, 3], // Primordiaux → Xarmekth
];

const NEBULA_CONFIGS: Omit<NebulaDef, "phase">[] = [
  { baseX: 0.2, baseY: 0.3, radius: 0.35, color: "rgba(120, 60, 180, 0.03)" },
  { baseX: 0.75, baseY: 0.2, radius: 0.3, color: "rgba(40, 80, 180, 0.025)" },
  { baseX: 0.6, baseY: 0.7, radius: 0.28, color: "rgba(180, 140, 40, 0.02)" },
  { baseX: 0.15, baseY: 0.75, radius: 0.25, color: "rgba(40, 160, 140, 0.025)" },
  { baseX: 0.5, baseY: 0.5, radius: 0.4, color: "rgba(80, 40, 120, 0.015)" },
];

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function usePrefersReducedMotion(): boolean {
  const [reduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  return reduced;
}

/* ═══════════════════════════════════════════════════════════════════════
   2. CUSTOM HOOK: useStarField (Canvas Engine)
   ═══════════════════════════════════════════════════════════════════════ */

function useStarField(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  warpProxy: RefObject<{ value: number }>
): void {
  const starsRef = useRef<BgStar[]>([]);
  const nebulaeRef = useRef<NebulaDef[]>([]);
  const shootingStarsRef = useRef<ShootingStarData[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const sizeRef = useRef({ w: 0, h: 0 });
  const lastShootRef = useRef(0);
  const nextShootDelayRef = useRef(3000 + Math.random() * 5000);
  const reducedRef = useRef(false);

  // Initialize stars and nebulae once
  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const stars: BgStar[] = [];
    let seed = 42;
    const rng = () => {
      seed += 1;
      return seededRandom(seed);
    };

    for (let i = 0; i < 300; i++) {
      stars.push({
        x: rng(), y: rng(), size: 0.3 + rng() * 0.9,
        twinkleSpeed: 0.5 + rng() * 2, twinklePhase: rng() * Math.PI * 2,
        layer: "far", parallax: 0.01, baseAlpha: 0.3 + rng() * 0.4,
      });
    }
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: rng(), y: rng(), size: 0.8 + rng() * 1.2,
        twinkleSpeed: 0.8 + rng() * 2.5, twinklePhase: rng() * Math.PI * 2,
        layer: "mid", parallax: 0.025, baseAlpha: 0.4 + rng() * 0.4,
      });
    }
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: rng(), y: rng(), size: 1.5 + rng() * 1.5,
        twinkleSpeed: 1 + rng() * 2, twinklePhase: rng() * Math.PI * 2,
        layer: "near", parallax: 0.05, baseAlpha: 0.5 + rng() * 0.5,
      });
    }
    starsRef.current = stars;
    nebulaeRef.current = NEBULA_CONFIGS.map((n, i) => ({
      ...n, phase: i * 1.7 + 0.5,
    }));

    return () => {
      starsRef.current = [];
      nebulaeRef.current = [];
      shootingStarsRef.current = [];
    };
  }, []);

  // Canvas setup, resize, render loop, events
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX / window.innerWidth;
        mouseRef.current.y = e.touches[0].clientY / window.innerHeight;
      }
    };

    if (!reducedRef.current) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
    }

    const render = (time: number) => {
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      const warp = warpProxy.current.value;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isRed = reducedRef.current;

      // Nebulae
      for (const neb of nebulaeRef.current) {
        const nx = isRed
          ? neb.baseX * w
          : (neb.baseX + Math.sin(time * 0.00008 + neb.phase) * 0.02) * w;
        const ny = isRed
          ? neb.baseY * h
          : (neb.baseY + Math.cos(time * 0.0001 + neb.phase) * 0.015) * h;
        const nr = neb.radius * Math.max(w, h);

        const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        gradient.addColorStop(0, neb.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      // Stars
      for (const star of starsRef.current) {
        const px = isRed ? 0 : (mx - 0.5) * star.parallax * w;
        const py = isRed ? 0 : (my - 0.5) * star.parallax * h;
        const sx = star.x * w + px;
        const sy = star.y * h + py;

        const twinkle = isRed
          ? 0.8
          : 0.5 + 0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.baseAlpha * twinkle;

        if (warp > 0.01) {
          const cx = w / 2;
          const cy = h / 2;
          const dx = sx - cx;
          const dy = sy - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const shift = dist * warp * 0.3;
          const wsx = sx + Math.cos(angle) * shift;
          const wsy = sy + Math.sin(angle) * shift;
          const lineLen = Math.max(1, dist * warp * 1.5);

          ctx.beginPath();
          ctx.moveTo(wsx, wsy);
          ctx.lineTo(wsx + Math.cos(angle) * lineLen, wsy + Math.sin(angle) * lineLen);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
          ctx.lineWidth = Math.max(0.3, star.size * 0.4);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();

          if (star.layer === "near") {
            const glowR = star.size * 4;
            const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
            glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.25})`);
            glow.addColorStop(1, "transparent");
            ctx.fillStyle = glow;
            ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);
          }
        }
      }

      // Shooting stars
      if (!isRed) {
        if (time - lastShootRef.current > nextShootDelayRef.current) {
          lastShootRef.current = time;
          nextShootDelayRef.current = 3000 + Math.random() * 5000;
          const angle = Math.random() * 0.8 + 0.3;
          const speed = 6 + Math.random() * 6;
          shootingStarsRef.current.push({
            x: Math.random() * w * 0.7 + w * 0.1,
            y: Math.random() * h * 0.4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 30 + Math.floor(Math.random() * 60),
            size: 1 + Math.random() * 1.2,
          });
        }

        const alive: ShootingStarData[] = [];
        for (const ss of shootingStarsRef.current) {
          const progress = 1 - ss.life / ss.maxLife;
          const a = progress * 0.7;
          const spd = Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy);
          const tailLen = 60 * progress;
          const nx2 = ss.vx / spd;
          const ny2 = ss.vy / spd;

          const grad = ctx.createLinearGradient(
            ss.x, ss.y, ss.x - nx2 * tailLen, ss.y - ny2 * tailLen
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${a})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(ss.x - nx2 * tailLen, ss.y - ny2 * tailLen);
          ctx.strokeStyle = grad;
          ctx.lineWidth = ss.size;
          ctx.stroke();

          ss.x += ss.vx;
          ss.y += ss.vy;
          ss.life += 1;
          if (ss.life < ss.maxLife) alive.push(ss);
        }
        shootingStarsRef.current = alive;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [canvasRef, containerRef, warpProxy]);
}

/* ═══════════════════════════════════════════════════════════════════════
   3. CUSTOM HOOK: useCosmologyAudio (Web Audio API)
   ═══════════════════════════════════════════════════════════════════════ */

function useCosmologyAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const sfxEnabled = useAudioStore((s) => s.sfxEnabled);
  const sfxVolume = useAudioStore((s) => s.sfxVolume);

  const getACtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playStarHover = useCallback(
    (freq: number) => {
      if (!sfxEnabled) return;
      try {
        initAudio();
        const ac = getACtx();
        const t = ac.currentTime;
        const master = ac.createGain();
        master.gain.value = sfxVolume * 0.5;
        master.connect(ac.destination);

        const osc = ac.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;

        const g = ac.createGain();
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + 0.2);
      } catch {
        // audio not available
      }
    },
    [sfxEnabled, sfxVolume, getACtx]
  );

  const playStarSelect = useCallback(
    (freq: number) => {
      if (!sfxEnabled) return;
      try {
        initAudio();
        const ac = getACtx();
        const t = ac.currentTime;
        const master = ac.createGain();
        master.gain.value = sfxVolume * 0.6;
        master.connect(ac.destination);

        const osc1 = ac.createOscillator();
        osc1.type = "sine";
        osc1.frequency.value = freq;
        const g1 = ac.createGain();
        g1.gain.setValueAtTime(0.08, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc1.connect(g1).connect(master);
        osc1.start(t);
        osc1.stop(t + 0.35);

        const osc2 = ac.createOscillator();
        osc2.type = "sine";
        osc2.frequency.value = freq * 2;
        const g2 = ac.createGain();
        g2.gain.setValueAtTime(0.03, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc2.connect(g2).connect(master);
        osc2.start(t);
        osc2.stop(t + 0.3);
      } catch {
        // audio not available
      }
    },
    [sfxEnabled, sfxVolume, getACtx]
  );

  const playWarpSound = useCallback(() => {
    if (!sfxEnabled) return;
    try {
      initAudio();
      const ac = getACtx();
      const t = ac.currentTime;
      const master = ac.createGain();
      master.gain.value = sfxVolume * 0.4;
      master.connect(ac.destination);

      const osc = ac.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(2000, t + 1.2);
      osc.frequency.exponentialRampToValueAtTime(800, t + 1.5);

      const lpf = ac.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.setValueAtTime(400, t);
      lpf.frequency.exponentialRampToValueAtTime(4000, t + 1);
      lpf.Q.value = 2;

      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.2);
      g.gain.linearRampToValueAtTime(0.06, t + 1.2);
      g.gain.linearRampToValueAtTime(0, t + 1.5);

      osc.connect(lpf).connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 1.6);

      const bufSize = Math.max(1, Math.floor(ac.sampleRate * 0.8));
      const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ac.createBufferSource();
      noise.buffer = buf;

      const hpf = ac.createBiquadFilter();
      hpf.type = "highpass";
      hpf.frequency.value = 1000;

      const ng = ac.createGain();
      ng.gain.setValueAtTime(0, t);
      ng.gain.linearRampToValueAtTime(0.04, t + 0.1);
      ng.gain.linearRampToValueAtTime(0.02, t + 1.2);
      ng.gain.linearRampToValueAtTime(0, t + 1.5);

      noise.connect(hpf).connect(ng).connect(master);
      noise.start(t);
      noise.stop(t + 1.6);
    } catch {
      // audio not available
    }
  }, [sfxEnabled, sfxVolume, getACtx]);

  const playArrivalSound = useCallback(() => {
    if (!sfxEnabled) return;
    try {
      initAudio();
      const ac = getACtx();
      const t = ac.currentTime;
      const master = ac.createGain();
      master.gain.value = sfxVolume * 0.5;
      master.connect(ac.destination);

      const osc = ac.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 0.55);

      const osc2 = ac.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 1200;
      const g2 = ac.createGain();
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(0.04, t + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc2.connect(g2).connect(master);
      osc2.start(t);
      osc2.stop(t + 0.65);
    } catch {
      // audio not available
    }
  }, [sfxEnabled, sfxVolume, getACtx]);

  return { playStarHover, playStarSelect, playWarpSound, playArrivalSound };
}

/* ═══════════════════════════════════════════════════════════════════════
   4. SUB-COMPONENT: StarNode
   ═══════════════════════════════════════════════════════════════════════ */

function StarNode({
  star,
  index,
  onSelect,
  onHover,
  isAnimating,
  nodeRef,
}: {
  star: StarDef;
  index: number;
  onSelect: (id: string) => void;
  onHover: (freq: number) => void;
  isAnimating: boolean;
  nodeRef: (el: HTMLDivElement | null) => void;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const sectionData = COSMOLOGY_DATA.find((d) => d.id === star.id);

  // Particle emission helper (defined before use)
  const emitParticles = useCallback((color: string) => {
    const container = particlesRef.current;
    if (!container) return;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.style.cssText = `
        position:absolute;left:50%;top:50%;
        width:3px;height:3px;border-radius:50%;
        background:${color};pointer-events:none;
        margin-left:-1.5px;margin-top:-1.5px;
      `;
      container.appendChild(p);
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 25 + Math.random() * 35;
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
        duration: 0.5 + Math.random() * 0.3,
        ease: "power2.out",
        onComplete: () => p.remove(),
      });
    }
  }, []);

  // Entrance animation
  useEffect(() => {
    const el = innerRef.current;
    if (!el || reducedMotion) {
      if (el) el.style.opacity = "1";
      return;
    }
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.3 + index * 0.12,
        ease: "back.out(1.7)",
      }
    );
  }, [index, reducedMotion]);

  const handleMouseEnter = useCallback(() => {
    if (isAnimating) return;
    onHover(star.freq);
    if (reducedMotion) {
      if (labelRef.current) labelRef.current.style.opacity = "1";
      return;
    }
    const el = innerRef.current;
    if (!el) return;
    gsap.to(el, { scale: 1.3, duration: 0.3, ease: "power2.out" });
    if (labelRef.current) {
      gsap.to(labelRef.current, {
        opacity: 1, y: 0, duration: 0.25, ease: "power2.out",
      });
    }
    emitParticles(star.color);
  }, [star.freq, star.color, isAnimating, onHover, reducedMotion, emitParticles]);

  const handleMouseLeave = useCallback(() => {
    if (reducedMotion) {
      if (labelRef.current) labelRef.current.style.opacity = "0";
      return;
    }
    const el = innerRef.current;
    if (!el) return;
    gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
    if (labelRef.current) {
      gsap.to(labelRef.current, { opacity: 0, y: 4, duration: 0.2, ease: "power2.in" });
    }
  }, [reducedMotion]);

  const handleClick = useCallback(() => {
    if (isAnimating) return;
    onSelect(star.id);
  }, [star.id, isAnimating, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") handleClick();
    },
    [handleClick]
  );

  const baseSize = 6 + star.size * 6;

  return (
    <div
      ref={nodeRef}
      role="button"
      tabIndex={0}
      aria-label={sectionData?.title ?? star.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "absolute",
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: "translate(-50%, -50%)",
        width: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isAnimating ? "default" : "pointer",
        zIndex: 20,
      }}
    >
      <div
        ref={particlesRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "visible",
        }}
      />

      <div
        ref={innerRef}
        style={{
          width: baseSize,
          height: baseSize,
          borderRadius: "50%",
          background: star.color,
          boxShadow: `0 0 ${baseSize * 1.5}px ${star.color}, 0 0 ${baseSize * 3}px ${hexToRgba(star.color, 0.5)}, 0 0 ${baseSize * 6}px ${hexToRgba(star.color, 0.2)}`,
          transformOrigin: "center center",
          opacity: 0,
          willChange: "transform",
        }}
      />

      <div
        ref={labelRef}
        style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%) translateY(4px)",
          marginBottom: 8,
          opacity: 0,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          padding: "6px 14px",
          borderRadius: 4,
          background: "rgba(10, 10, 15, 0.75)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          border: `1px solid ${hexToRgba(star.color, 0.3)}`,
          textAlign: "center",
        }}
      >
        <div
          className="font-display"
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            color: star.color,
            textShadow: `0 0 8px ${hexToRgba(star.color, 0.5)}`,
          }}
        >
          {sectionData?.title ?? ""}
        </div>
        <div
          className="font-body"
          style={{
            fontSize: 10,
            color: "var(--text-tertiary)",
            marginTop: 2,
            fontStyle: "italic",
          }}
        >
          {sectionData?.subtitle ?? ""}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   5. SUB-COMPONENT: ConstellationLines (SVG)
   ═══════════════════════════════════════════════════════════════════════ */

function ConstellationLines({
  svgRef,
  visible,
}: {
  svgRef: RefObject<SVGSVGElement | null>;
  visible: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reducedMotion) return;

    const tween = gsap.to(svg, {
      opacity: 0.4,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    return () => {
      tween.kill();
    };
  }, [svgRef, reducedMotion]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        opacity: visible ? 0.7 : 0,
        transition: reducedMotion ? "none" : "opacity 0.6s ease",
        zIndex: 10,
      }}
      aria-hidden="true"
    >
      <defs>
        {CONSTELLATIONS.map(([a, b], i) => {
          const sa = STAR_MAP[a];
          const sb = STAR_MAP[b];
          return (
            <linearGradient
              key={`cg-${i}`}
              id={`cg-${a}-${b}`}
              x1={`${sa.x}%`}
              y1={`${sa.y}%`}
              x2={`${sb.x}%`}
              y2={`${sb.y}%`}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={sa.color} stopOpacity="0.45" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.06" />
              <stop offset="100%" stopColor={sb.color} stopOpacity="0.45" />
            </linearGradient>
          );
        })}
      </defs>
      {CONSTELLATIONS.map(([a, b], i) => (
        <line
          key={`cl-${i}`}
          x1={`${STAR_MAP[a].x}%`}
          y1={`${STAR_MAP[a].y}%`}
          x2={`${STAR_MAP[b].x}%`}
          y2={`${STAR_MAP[b].y}%`}
          stroke={`url(#cg-${a}-${b})`}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   6. SUB-COMPONENT: ContentReveal
   ═══════════════════════════════════════════════════════════════════════ */

function ContentReveal({
  section,
  starColor,
  onBack,
}: {
  section: CosmologySection;
  starColor: string;
  onBack: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedSub, setExpandedSub] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const ctxRef = useRef<gsap.Context | null>(null);

  // Entrance animation using DOM queries (no refs accessed during render)
  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      const charEls = container.querySelectorAll("[data-cosmo-char]");
      if (charEls.length > 0) {
        tl.fromTo(
          charEls,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.025,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      }

      const subtitleEl = container.querySelector("[data-cosmo-subtitle]");
      if (subtitleEl) {
        tl.fromTo(
          subtitleEl,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.1"
        );
      }

      const paraEls = container.querySelectorAll("[data-cosmo-para]");
      if (paraEls.length > 0) {
        tl.fromTo(
          paraEls,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2"
        );
      }

      const subEls = container.querySelectorAll("[data-cosmo-subsection]");
      if (subEls.length > 0) {
        tl.fromTo(
          subEls,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            stagger: 0.12,
            duration: 0.4,
            ease: "back.out(1.5)",
          },
          "-=0.2"
        );
      }
    }, container);

    ctxRef.current = ctx;
    return () => ctx.revert();
  }, [section.id, reducedMotion]);

  const toggleSub = useCallback((idx: number) => {
    setExpandedSub((prev) => (prev === idx ? null : idx));
  }, []);

  const handleBackKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") onBack();
    },
    [onBack]
  );

  const chars = section.title.split("");

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto"
      style={{
        zIndex: 50,
        padding: "80px 24px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        className="max-w-3xl w-full"
        style={{
          textShadow:
            "0 2px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          onKeyDown={handleBackKeyDown}
          className="font-display"
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "var(--silver)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 0",
            textShadow: `0 0 10px ${hexToRgba(starColor, 0.4)}`,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "color 0.2s",
          }}
          aria-label="Retour à la carte des étoiles"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = starColor;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--silver)";
          }}
        >
          <span style={{ fontSize: 16 }}>←</span>
          RETOUR
        </button>

        {/* Japanese title */}
        <p
          className="font-body"
          style={{
            fontSize: 14,
            fontStyle: "italic",
            color: "var(--text-tertiary)",
            marginTop: 16,
            opacity: 0.7,
          }}
        >
          {section.titleJp}
        </p>

        {/* Title with character stagger — uses data attribute, animated via DOM query */}
        <div
          className="font-display"
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            letterSpacing: "0.08em",
            color: starColor,
            marginTop: 8,
            lineHeight: 1.3,
            textShadow: `0 0 20px ${hexToRgba(starColor, 0.4)}, 0 0 60px ${hexToRgba(starColor, 0.15)}`,
          }}
        >
          {chars.map((char, i) => (
            <span
              key={i}
              data-cosmo-char=""
              style={{
                display: "inline-block",
                opacity: reducedMotion ? 1 : 0,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <p
          data-cosmo-subtitle=""
          className="font-body"
          style={{
            fontSize: 15,
            color: "var(--text-tertiary)",
            marginTop: 8,
            opacity: reducedMotion ? 1 : 0,
          }}
        >
          {section.subtitle}
        </p>

        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 1,
            background: `linear-gradient(to right, transparent, ${starColor}, transparent)`,
            margin: "24px 0",
            opacity: 0.5,
          }}
        />

        {/* Content paragraphs — animated via DOM query */}
        {section.content.map((para, i) => (
          <p
            key={`p-${i}`}
            data-cosmo-para=""
            className="font-body"
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "var(--text-secondary)",
              marginTop: i === 0 ? 0 : 16,
              opacity: reducedMotion ? 1 : 0,
            }}
          >
            {para}
          </p>
        ))}

        {/* Canon quote */}
        {section.quote && (
          <blockquote
            data-cosmo-para=""
            className="font-body"
            style={{
              marginTop: 28,
              marginBottom: 0,
              padding: "16px 24px",
              borderLeft: `2px solid ${starColor}`,
              background: `linear-gradient(to right, ${starColor}08, transparent)`,
              fontStyle: "italic",
              fontSize: 15,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              opacity: reducedMotion ? 1 : 0,
            }}
          >
            {section.quote}
          </blockquote>
        )}

        {/* Sub-sections as mini-stars */}
        {section.subSections && section.subSections.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div
              className="font-display"
              style={{
                fontSize: 11,
                letterSpacing: "0.15em",
                color: "var(--text-tertiary)",
                marginBottom: 16,
              }}
            >
              SOUS-SECTIONS
            </div>
            {section.subSections.map((sub, i) => (
              <div
                key={`sub-${i}`}
                data-cosmo-subsection=""
                style={{
                  opacity: reducedMotion ? 1 : 0,
                  marginBottom: 12,
                }}
              >
                <button
                  onClick={() => toggleSub(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "10px 0",
                    width: "100%",
                    textAlign: "left",
                  }}
                  aria-expanded={expandedSub === i}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: starColor,
                      boxShadow: `0 0 8px ${starColor}, 0 0 20px ${hexToRgba(starColor, 0.3)}`,
                      flexShrink: 0,
                      transition: "transform 0.3s",
                      transform: expandedSub === i ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                  <span
                    className="font-display"
                    style={{
                      fontSize: 13,
                      letterSpacing: "0.08em",
                      color:
                        expandedSub === i ? starColor : "var(--text-secondary)",
                      transition: "color 0.2s",
                    }}
                  >
                    {sub.title}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 10,
                      color: "var(--text-tertiary)",
                      transition: "transform 0.3s",
                      transform:
                        expandedSub === i
                          ? "rotate(180deg)"
                          : "rotate(0)",
                      display: "inline-block",
                    }}
                  >
                    ▾
                  </span>
                </button>
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: expandedSub === i ? 300 : 0,
                    opacity: expandedSub === i ? 1 : 0,
                    transition: reducedMotion
                      ? "none"
                      : "max-height 0.4s ease, opacity 0.3s ease",
                    paddingLeft: 24,
                  }}
                >
                  {sub.content.map((c, j) => (
                    <p
                      key={`sc-${j}`}
                      className="font-body"
                      style={{
                        fontSize: 15,
                        lineHeight: 1.75,
                        color: "var(--text-secondary)",
                        marginTop: j === 0 ? 0 : 12,
                      }}
                    >
                      {c}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   7. MAIN COMPONENT: CosmologyPage
   ═══════════════════════════════════════════════════════════════════════ */

export default function CosmologyPage() {
  const [selectedStarId, setSelectedStarId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const constellationSvgRef = useRef<SVGSVGElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const warpProxy = useRef({ value: 0 });
  const starNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const zoomTlRef = useRef<gsap.core.Timeline | null>(null);

  const { playStarHover, playStarSelect, playWarpSound, playArrivalSound } =
    useCosmologyAudio();

  const reducedMotion = usePrefersReducedMotion();

  // Star field canvas hook
  useStarField(canvasRef, containerRef, warpProxy);

  // Selected section data
  const selectedSection = selectedStarId
    ? COSMOLOGY_DATA.find((s) => s.id === selectedStarId) ?? null
    : null;
  const selectedStarDef = selectedStarId
    ? STAR_MAP.find((s) => s.id === selectedStarId) ?? null
    : null;

  // ─── Star select handler ─────────────────────────────
  const handleStarSelect = useCallback(
    (starId: string) => {
      if (isAnimating) return;
      setIsAnimating(true);

      const starDef = STAR_MAP.find((s) => s.id === starId);
      if (!starDef) {
        setIsAnimating(false);
        return;
      }

      playStarSelect(starDef.freq);

      const selectedNode = starNodeRefs.current[starId];
      const otherNodes = Object.entries(starNodeRefs.current)
        .filter(([id]) => id !== starId)
        .map(([, el]) => el)
        .filter(Boolean);

      if (reducedMotion) {
        setSelectedStarId(starId);
        setIsAnimating(false);
        return;
      }

      const tl = gsap.timeline();

      // Phase 1: Selection
      if (selectedNode) {
        tl.to(selectedNode, { scale: 1.5, duration: 0.3, ease: "power2.out" }, 0);
      }

      // Phase 2: Warp jump
      tl.to(warpProxy.current, { value: 1, duration: 1.5, ease: "power2.in" }, 0.3);

      if (otherNodes.length > 0) {
        tl.to(
          otherNodes,
          { opacity: 0, scale: 0.3, duration: 0.6, stagger: 0.05, ease: "power2.in" },
          0.3
        );
      }

      if (constellationSvgRef.current) {
        tl.to(constellationSvgRef.current, { opacity: 0, duration: 0.5 }, 0.3);
      }

      if (vignetteRef.current) {
        tl.to(vignetteRef.current, { opacity: 1, duration: 1.2 }, 0.3);
      }

      tl.call(playWarpSound, [], 0.3);

      // Phase 3: Arrival
      tl.to(warpProxy.current, { value: 0, duration: 0.5, ease: "power2.out" }, 1.8);

      if (flashRef.current) {
        tl.fromTo(
          flashRef.current,
          { opacity: 0 },
          { opacity: 0.6, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" },
          1.8
        );
      }

      if (containerRef.current) {
        tl.to(
          containerRef.current,
          { x: 3, y: -2, duration: 0.04, yoyo: true, repeat: 5, ease: "none" },
          1.85
        );
        tl.set(containerRef.current, { x: 0, y: 0 }, 2.1);
      }

      tl.call(playArrivalSound, [], 1.8);

      // Phase 4: Show content
      tl.call(
        () => {
          setSelectedStarId(starId);
          setIsAnimating(false);
        },
        [],
        2.3
      );

      zoomTlRef.current = tl;
    },
    [isAnimating, reducedMotion, playStarSelect, playWarpSound, playArrivalSound]
  );

  // ─── Back handler ────────────────────────────────────
  const handleBack = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const starId = selectedStarId;

    if (reducedMotion) {
      setSelectedStarId(null);
      setIsAnimating(false);
      return;
    }

    const selectedNode = starId ? starNodeRefs.current[starId] : null;
    const otherNodes = Object.entries(starNodeRefs.current)
      .filter(([id]) => id !== starId)
      .map(([, el]) => el)
      .filter(Boolean);

    const tl = gsap.timeline();

    const contentEl = containerRef.current?.querySelector(
      "[style*='z-index: 50']"
    );
    if (contentEl) {
      tl.to(contentEl, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
      });
    }

    if (flashRef.current) {
      tl.set(flashRef.current, { opacity: 0 }, 0.3);
    }

    tl.to(warpProxy.current, { value: 0.6, duration: 0.3, ease: "power2.in" }, 0.3);

    if (flashRef.current) {
      tl.fromTo(
        flashRef.current,
        { opacity: 0 },
        { opacity: 0.4, duration: 0.1, yoyo: true, repeat: 1 },
        0.5
      );
    }

    tl.to(warpProxy.current, { value: 0, duration: 0.6, ease: "power2.out" }, 0.5);

    if (vignetteRef.current) {
      tl.to(vignetteRef.current, { opacity: 0, duration: 0.8 }, 0.4);
    }

    if (otherNodes.length > 0) {
      tl.to(
        otherNodes,
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: "back.out(1.5)" },
        0.7
      );
    }

    if (constellationSvgRef.current) {
      tl.to(constellationSvgRef.current, { opacity: 0.7, duration: 0.5 }, 0.7);
    }

    if (selectedNode) {
      tl.to(selectedNode, { scale: 1, duration: 0.4, ease: "power2.out" }, 0.7);
    }

    tl.call(
      () => {
        setSelectedStarId(null);
        setIsAnimating(false);
      },
      [],
      1.4
    );

    zoomTlRef.current = tl;
  }, [isAnimating, selectedStarId, reducedMotion]);

  // ─── Hover handler ───────────────────────────────────
  const handleStarHover = useCallback(
    (freq: number) => {
      playStarHover(freq);
    },
    [playStarHover]
  );

  // ─── Cleanup ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      zoomTlRef.current?.kill();
    };
  }, []);

  // ─── Star node ref callback ──────────────────────────
  const starNodeRefCb = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      starNodeRefs.current[id] = el;
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        height: "calc(100dvh - 120px)",
        minHeight: 400,
        background: "var(--bg-primary)",
        willChange: "transform",
      }}
    >
      {/* Canvas star field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Constellation lines */}
      <ConstellationLines
        svgRef={constellationSvgRef}
        visible={!selectedStarId}
      />

      {/* HUD Title */}
      <div
        className="absolute top-4 left-1/2 font-display pointer-events-none"
        style={{
          transform: "translateX(-50%)",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "var(--text-tertiary)",
          opacity: selectedStarId ? 0 : 0.4,
          transition: "opacity 0.5s",
          zIndex: 40,
          textTransform: "uppercase" as const,
        }}
        aria-hidden="true"
      >
        Cosmologie
      </div>

      {/* Star nodes (only visible on star map) */}
      {!selectedStarId &&
        STAR_MAP.map((star, i) => (
          <StarNode
            key={star.id}
            star={star}
            index={i}
            onSelect={handleStarSelect}
            onHover={handleStarHover}
            isAnimating={isAnimating}
            nodeRef={starNodeRefCb(star.id)}
          />
        ))}

      {/* Vignette overlay for warp */}
      <div
        ref={vignetteRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(10,10,15,0.9) 100%)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 30,
        }}
      />

      {/* Flash overlay for arrival */}
      <div
        ref={flashRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "white",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 35,
        }}
      />

      {/* Content reveal */}
      {selectedStarId && selectedSection && selectedStarDef && (
        <ContentReveal
          section={selectedSection}
          starColor={selectedStarDef.color}
          onBack={handleBack}
        />
      )}
    </div>
  );
}