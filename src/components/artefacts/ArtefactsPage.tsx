"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   COLOR PALETTE
   ═══════════════════════════════════════════════════════ */
const C = {
  bgDeep: "#060B18",
  bgSection: "#0A0F1E",
  accent: "#00D4FF",
  accentDark: "#0088CC",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0C4DE",
  textTertiary: "#5A6B82",
  warning: "#FF4466",
  lineGlow: "rgba(0, 212, 255, 0.15)",
  lineDot: "rgba(0, 212, 255, 0.8)",
} as const;

/* ═══════════════════════════════════════════════════════
   TYPOGRAPHY HELPERS
   ═══════════════════════════════════════════════════════ */
const FONT_DISPLAY = "'Cinzel', 'Georgia', 'Times New Roman', serif";
const FONT_BODY = "'Poppins', sans-serif";

/* ═══════════════════════════════════════════════════════
   LIGHTNING BOLT TYPES
   ═══════════════════════════════════════════════════════ */
type Bolt = {
  points: Array<{ x: number; y: number }>;
  branches: Array<Array<{ x: number; y: number }>>;
  alpha: number; life: number; maxLife: number;
};

type Particle = {
  x: number; y: number; vx: number; vy: number;
  size: number; alpha: number; life: number; maxLife: number;
};

/* ═══════════════════════════════════════════════════════
   LIGHTNING CANVAS COMPONENT
   ═══════════════════════════════════════════════════════ */
function LightningCanvas({ canvasRef, opacityRef }: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  opacityRef: React.RefObject<number>;
}) {
  const boltsRef = useRef<Bolt[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: 25 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      life: 0,
      maxLife: Math.random() * 400 + 200,
    }));
  }, []);

  const spawnBolt = useCallback((w: number, h: number) => {
    const edge = Math.floor(Math.random() * 4);
    let x1 = 0, y1 = 0;
    if (edge === 0) { x1 = Math.random() * w; y1 = 0; }
    else if (edge === 1) { x1 = w; y1 = Math.random() * h; }
    else if (edge === 2) { x1 = Math.random() * w; y1 = h; }
    else { x1 = 0; y1 = Math.random() * h; }

    const cx = w * 0.5 + (Math.random() - 0.5) * w * 0.3;
    const cy = h * 0.5 + (Math.random() - 0.5) * h * 0.3;

    const segments = 8 + Math.floor(Math.random() * 6);
    const points: Array<{ x: number; y: number }> = [{ x: x1, y: y1 }];
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const bx = x1 + (cx - x1) * t + (Math.random() - 0.5) * 80;
      const by = y1 + (cy - y1) * t + (Math.random() - 0.5) * 80;
      points.push({ x: bx, y: by });
    }

    const branches: Array<Array<{ x: number; y: number }>> = [];
    for (let i = 2; i < points.length - 1; i++) {
      if (Math.random() < 0.5) {
        const p = points[i];
        const angle = Math.atan2(cy - y1, cx - x1) + (Math.random() - 0.5) * 1.5;
        const len = 30 + Math.random() * 60;
        const bSegs = 3 + Math.floor(Math.random() * 3);
        const brPts: Array<{ x: number; y: number }> = [{ x: p.x, y: p.y }];
        for (let j = 1; j <= bSegs; j++) {
          const bt = j / bSegs;
          brPts.push({
            x: p.x + Math.cos(angle) * len * bt + (Math.random() - 0.5) * 20,
            y: p.y + Math.sin(angle) * len * bt + (Math.random() - 0.5) * 20,
          });
        }
        branches.push(brPts);
      }
    }

    boltsRef.current.push({
      points,
      branches,
      alpha: 1,
      life: 0,
      maxLife: 8 + Math.random() * 12,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(canvas.offsetWidth, canvas.offsetHeight);
    };
    resize();
    window.addEventListener("resize", resize);

    let lastBolt = 0;
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const drawPath = (pts: Array<{ x: number; y: number }>) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    };

    const draw = (timestamp: number) => {
      frameRef.current = requestAnimationFrame(draw);
      if (!isVisible) return;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const canvasOpacity = opacityRef.current ?? 1;
      ctx.globalAlpha = canvasOpacity;

      // Spawn bolts
      if (timestamp - lastBolt > 800 + Math.random() * 1800) {
        spawnBolt(w, h);
        if (Math.random() < 0.3) spawnBolt(w, h); // occasional double
        lastBolt = timestamp;
      }

      // Draw bolts
      for (let i = boltsRef.current.length - 1; i >= 0; i--) {
        const bolt = boltsRef.current[i];
        bolt.life++;
        bolt.alpha = Math.max(0, 1 - bolt.life / bolt.maxLife);
        if (bolt.alpha <= 0) { boltsRef.current.splice(i, 1); continue; }

        // Main bolt glow
        ctx.strokeStyle = `rgba(0, 212, 255, ${bolt.alpha * 0.3})`;
        ctx.lineWidth = 4;
        drawPath(bolt.points);

        // Main bolt core
        ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha * 0.8})`;
        ctx.lineWidth = 1.2;
        drawPath(bolt.points);

        // Branches
        ctx.strokeStyle = `rgba(0, 212, 255, ${bolt.alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        for (const br of bolt.branches) {
          drawPath(br);
        }
      }

      // Draw particles
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.life = 0;
        }
        const fade = p.life < 60 ? p.life / 60 : p.life > p.maxLife - 60 ? (p.maxLife - p.life) / 60 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha * fade * 0.6})`;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, [canvasRef, opacityRef, initParticles, spawnBolt]);

  return null;
}

/* ═══════════════════════════════════════════════════════
   GIANT TEXT TRANSITION
   ═══════════════════════════════════════════════════════ */
function GiantText({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, {
        opacity: 0,
        scale: 0.95,
        y: 30,
      }, {
        opacity: 0.85,
        scale: 1.05,
        y: -10,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "bottom 30%",
          scrub: 1,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        height: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        background: C.bgDeep,
      }}
    >
      <span
        style={{
          fontSize: "clamp(6rem, 18vw, 14rem)",
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          lineHeight: 1,
          textAlign: "center",
          whiteSpace: "nowrap",
          background: "linear-gradient(135deg, #0088CC, #00D4FF, #FFFFFF, #00D4FF, #0088CC)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          willChange: "transform, opacity",
          userSelect: "none",
          letterSpacing: "0.05em",
        }}
      >
        {text}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CONTENT SECTION WRAPPER
   ═══════════════════════════════════════════════════════ */
function ContentSection({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const paragraphs = el.querySelectorAll(".anim-p");
      if (paragraphs.length > 0) {
        gsap.fromTo(paragraphs, {
          opacity: 0,
          y: 40,
        }, {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            end: "top 20%",
            toggleActions: "play none none reverse",
          },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        background: C.bgSection,
        padding: "100px 60px 100px 100px",
        minHeight: "60vh",
        overflow: "hidden",
      }}
    >
      {/* Background number */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "20px",
          fontSize: "clamp(8rem, 15vw, 18rem)",
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          color: "rgba(0, 212, 255, 0.03)",
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {number}
      </div>

      {/* Animated left border */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "2px",
          background: C.accent,
          boxShadow: `0 0 8px ${C.accent}, 0 0 16px rgba(0, 212, 255, 0.3)`,
          animation: "artPulse 3s ease-in-out infinite",
        }}
      />

      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes artPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TYPE CARD
   ═══════════════════════════════════════════════════════ */
function TypeCard({ name, description }: { name: string; description: string }) {
  return (
    <div
      className="anim-p"
      style={{
        background: "rgba(0, 212, 255, 0.03)",
        borderLeft: `3px solid ${C.accent}`,
        padding: "24px 28px",
        marginBottom: "16px",
        borderRadius: "0 8px 8px 0",
      }}
    >
      <h4
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "1.15rem",
          color: C.accent,
          marginBottom: "10px",
          fontWeight: 600,
          letterSpacing: "0.04em",
        }}
      >
        {name}
      </h4>
      <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.75, margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RANK ITEM
   ═══════════════════════════════════════════════════════ */
const RANK_COLORS: Record<string, string> = {
  E: "#9CA3AF",
  D: "#3B82F6",
  C: "#22C55E",
  B: "#A855F7",
  A: "#F97316",
  S: "#EF4444",
};

function RankItem({ letter, description }: { letter: string; description: string }) {
  return (
    <div
      className="anim-p"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "20px",
        marginBottom: "20px",
        padding: "16px 20px",
        background: "rgba(255,255,255,0.02)",
        borderRadius: "6px",
        borderLeft: `3px solid ${RANK_COLORS[letter] || C.textTertiary}`,
      }}
    >
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "1.6rem",
          fontWeight: 700,
          color: RANK_COLORS[letter] || C.textPrimary,
          minWidth: "40px",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {letter}
      </span>
      <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.75, margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WARNING BLOCK
   ═══════════════════════════════════════════════════════ */
function WarningBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="anim-p"
      style={{
        background: "rgba(255, 68, 102, 0.08)",
        borderLeft: `3px solid ${C.warning}`,
        padding: "20px 24px",
        borderRadius: "0 8px 8px 0",
        marginTop: "24px",
      }}
    >
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: "0.9rem",
          color: C.textSecondary,
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RULE BLOCK
   ═══════════════════════════════════════════════════════ */
function RuleBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="anim-p"
      style={{
        background: "rgba(0, 212, 255, 0.06)",
        border: `1px solid rgba(0, 212, 255, 0.2)`,
        padding: "20px 24px",
        borderRadius: "8px",
        marginTop: "28px",
      }}
    >
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: "0.9rem",
          color: C.textSecondary,
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION TITLE
   ═══════════════════════════════════════════════════════ */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="anim-p"
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
        color: C.accent,
        marginBottom: "32px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textAlign: "center",
      }}
    >
      {children}
    </h2>
  );
}

/* ═══════════════════════════════════════════════════════
   BODY TEXT
   ═══════════════════════════════════════════════════════ */
function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="anim-p"
      style={{
        fontFamily: FONT_BODY,
        fontSize: "0.92rem",
        color: C.textSecondary,
        lineHeight: 1.85,
        marginBottom: "18px",
      }}
    >
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════
   EXAMPLE ARTEFACT CARD
   ═══════════════════════════════════════════════════════ */
function ArtefactCard({
  name,
  rank,
  type,
  effect,
  materials,
  counterpart,
}: {
  name: string;
  rank: string;
  type: string;
  effect: string;
  materials: string;
  counterpart: string;
}) {
  const rankColor = RANK_COLORS[rank] || C.textPrimary;
  return (
    <div
      className="anim-p"
      style={{
        background: "rgba(0, 212, 255, 0.03)",
        border: `1px solid rgba(0, 212, 255, 0.12)`,
        borderRadius: "10px",
        padding: "28px 28px 24px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "1.15rem",
            color: C.textPrimary,
            fontWeight: 600,
            margin: 0,
            letterSpacing: "0.03em",
          }}
        >
          {name}
        </h3>
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: "0.75rem",
            color: rankColor,
            border: `1px solid ${rankColor}`,
            padding: "2px 10px",
            borderRadius: "4px",
            fontWeight: 600,
          }}
        >
          {rank}
        </span>
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: "0.75rem",
            color: C.accent,
            border: `1px solid rgba(0, 212, 255, 0.3)`,
            padding: "2px 10px",
            borderRadius: "4px",
          }}
        >
          {type}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <p style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: C.textSecondary, lineHeight: 1.75, margin: 0 }}>
          <span style={{ color: C.accent, fontWeight: 600 }}>Effet : </span>{effect}
        </p>
        <p style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: C.textSecondary, lineHeight: 1.75, margin: 0 }}>
          <span style={{ color: C.accent, fontWeight: 600 }}>Matériaux : </span>{materials}
        </p>
        <p style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: C.textSecondary, lineHeight: 1.75, margin: 0 }}>
          <span style={{ color: C.warning, fontWeight: 600 }}>Contrepartie : </span>{counterpart}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN ARTEFACTS PAGE COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function ArtefactsPage() {
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const connectingLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasOpacityRef = useRef(1);

  useEffect(() => {
    // Hero scroll-driven darkening
    const ctx = gsap.context(() => {
      // Hero overlay darkening + blur
      if (heroOverlayRef.current && heroImageRef.current) {
        gsap.to(heroOverlayRef.current, {
          opacity: 0.95,
          ease: "none",
          scrollTrigger: {
            trigger: heroImageRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to(heroImageRef.current, {
          filter: "blur(8px)",
          ease: "none",
          scrollTrigger: {
            trigger: heroImageRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Canvas opacity reduction
      ScrollTrigger.create({
        trigger: heroImageRef.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          canvasOpacityRef.current = 1 - self.progress;
        },
      });

      // Scroll indicator fade
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: heroImageRef.current,
            start: "top top",
            end: "20% top",
            scrub: true,
          },
        });
      }

      // Connecting line draw
      if (connectingLineRef.current) {
        gsap.fromTo(
          connectingLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 50%",
              end: "bottom 50%",
              scrub: 0.5,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{ background: C.bgDeep, position: "relative" }}>
      {/* Connecting Line */}
      <div
        ref={connectingLineRef}
        style={{
          position: "absolute",
          left: "60px",
          top: 0,
          width: "1px",
          height: "100%",
          background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.15), rgba(0,212,255,0.25), rgba(0,212,255,0.15), transparent)",
          transformOrigin: "top center",
          willChange: "transform",
          zIndex: 100,
          pointerEvents: "none",
        }}
      />

      <div
        ref={heroImageRef}
        style={{
          position: "relative",
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/races/dragon.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            willChange: "filter",
          }}
        />

        {/* Black Overlay */}
        <div
          ref={heroOverlayRef}
          style={{
            position: "absolute",
            inset: 0,
            background: C.bgDeep,
            opacity: 0,
            willChange: "opacity",
          }}
        />

        {/* Lightning Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <LightningCanvas canvasRef={canvasRef} opacityRef={canvasOpacityRef} />

        {/* Hero Content */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            padding: "60px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            maxWidth: "900px",
          }}
        >
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(3rem, 8vw, 6rem)",
              color: C.textPrimary,
              fontWeight: 700,
              letterSpacing: "0.12em",
              lineHeight: 1,
              marginBottom: "16px",
              textShadow: `0 0 40px rgba(0, 212, 255, 0.3)`,
            }}
          >
            ARTEFACTS
          </h1>
          <p
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(0.8rem, 1.5vw, 1.1rem)",
              color: C.accent,
              letterSpacing: "0.2em",
              marginBottom: "8px",
              opacity: 0.8,
            }}
          >
            ASCENSION ✦ GRIMOIRE
          </p>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.85rem",
              color: C.textTertiary,
              letterSpacing: "0.15em",
            }}
          >
            2025
          </p>
        </div>

        {/* Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            willChange: "opacity",
          }}
        >
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.7rem",
              color: C.textTertiary,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: "1px",
              height: "30px",
              background: `linear-gradient(to bottom, ${C.accent}, transparent)`,
              animation: "scrollPulse 2s ease-in-out infinite",
            }}
          />
          <style>{`
            @keyframes scrollPulse {
              0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
              50% { opacity: 1; transform: scaleY(1.2); }
            }
          `}</style>
        </div>
      </div>

      {/* Giant Text: SOMMAIRE */}
      <GiantText text="SOMMAIRE" />

      {/* Sommaire Content */}
      <ContentSection number="✦">
        <SectionTitle>✦ SOMMAIRE ✦</SectionTitle>
        <div
          className="anim-p"
          style={{
            fontFamily: FONT_BODY,
            fontSize: "0.95rem",
            color: C.textSecondary,
            lineHeight: 2.2,
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>I. Introduction à la création d'artefacts · · · · · · · · · · · · 3</p>
          <p style={{ margin: "0 0 8px 0" }}>II. Les différents types d'artefacts · · · · · · · · · · · · 4</p>
          <p style={{ margin: "0 0 8px 0" }}>III. Les matériaux et loots nécessaires · · · · · · · · · · · · 5</p>
          <p style={{ margin: "0 0 8px 0" }}>IV. Processus de création encadré par un MJ · · · · · · · · · · · · 6</p>
          <p style={{ margin: "0 0 8px 0" }}>V. Rangs et puissance des artefacts · · · · · · · · · · · · 7</p>
          <p style={{ margin: "0 0 8px 0" }}>VI. Manipulation et maîtrise des artefacts · · · · · · · · · · · · 8</p>
          <p style={{ margin: "0 0 8px 0" }}>VII. Les artefacts absolus et leurs contreparties · · · · · · · · · · · · 9</p>
          <p style={{ margin: 0 }}>VIII. Exemples d'artefacts · · · · · · · · · · · · 10</p>
        </div>
      </ContentSection>

      {/* Giant Text: TYPES */}
      <GiantText text="TYPES" />

      {/* Section I — Introduction */}
      <ContentSection number="I">
        <SectionTitle>✦ I — INTRODUCTION À LA CRÉATION D'ARTEFACTS ✦</SectionTitle>

        <Body>
          La création d'artefacts n'est pas un simple système d'objets à récupérer et à équiper : c'est une discipline à part entière, aussi exigeante intellectuellement que dangereuse physiquement. Fabriquer un artefact, c'est chercher à figer une part de puissance brute dans une forme stable — un exploit que la nature elle-même réalise rarement sans contrepartie.
        </Body>

        <Body>
          Cette discipline puise ses racines dans des traditions multiples et souvent contradictoires. Certains peuples y voient un artisanat sacré, transmis de génération en génération ; d'autres la considèrent comme une transgression, un vol de pouvoir qui ne devrait appartenir qu'aux forces qui l'ont engendré. Cette tension fait partie intégrante de l'identité des artefacts : chacun porte, quelque part, la trace de ce qu'il a fallu braver pour le créer.
        </Body>

        <Body>
          Certains personnages possèdent un accès facilité à cette pratique — les nains, par exemple, disposent d'une compétence raciale qui les prédispose naturellement à la forge d'artefacts, fruit de siècles de savoir-faire ancestral. Pour tous les autres, la voie est plus longue : elle suppose de l'expérience, des rencontres, des échecs, et bien souvent la survie à des événements qui laissent des traces.
        </Body>

        <Body>
          Un artefact réussi peut redéfinir la trajectoire d'un personnage. Il peut trancher un combat qui semblait perdu, débloquer une intrigue bloquée depuis des sessions, ou au contraire devenir un fardeau que le personnage devra apprendre à porter. C'est précisément cette ambivalence — puissance et danger indissociables — qui fait des artefacts l'un des systèmes les plus riches narrativement de ce monde.
        </Body>

        <WarningBlock>
          ⚠ Tout artefact créé sans supervision d'un MJ sera considéré comme invalide. La validation est obligatoire, sans exception, y compris pour les artefacts de rang mineur. Ce garde-fou existe pour préserver l'équilibre collectif de l'univers : un artefact qui échappe à ce cadre n'est pas seulement une irrégularité administrative, c'est une faille potentielle dans la cohérence de toutes les histoires en cours.
        </WarningBlock>
      </ContentSection>

      {/* Giant Text: TYPES */}
      <GiantText text="TYPES" />

      {/* Section II — Types d'Artefacts */}
      <ContentSection number="II">
        <SectionTitle>✦ II — LES DIFFÉRENTS TYPES D'ARTEFACTS ✦</SectionTitle>

        <Body>
          Classer un artefact par type ne relève pas que de la forme : cela détermine sa logique interne, ses limites naturelles, et souvent les rituels ou méthodes nécessaires à sa création. Un artefact runique et un artefact organique ne se façonnent jamais de la même manière, même s'ils visent un effet similaire.
        </Body>

        <TypeCard
          name="RELIQUE"
          description="Objets anciens imprégnés d'une puissance légendaire, façonnés ou consacrés par des événements, des figures ou des époques qui ont marqué l'histoire du monde. Une relique n'est jamais un objet créé ex nihilo : elle hérite toujours d'un passé, et ce passé conditionne directement ses effets. Manipuler une relique, c'est aussi manipuler un fragment de mémoire qui ne demande qu'à s'exprimer. Leur récit d'origine doit systématiquement être défini avec le MJ, car il fait partie intégrante de leurs propriétés."
        />
        <TypeCard
          name="ORGANIQUE"
          description="Créés à partir de matériaux vivants ou d'entités biologiques, ces artefacts conservent une forme de vitalité résiduelle. Certains semblent respirer, d'autres réagissent aux émotions de leur porteur, d'autres encore continuent de croître ou de se régénérer avec le temps. Cette proximité avec le vivant les rend souvent plus intuitifs à utiliser, mais aussi plus imprévisibles : un artefact organique peut développer des réactions que même son créateur n'avait pas anticipées."
        />
        <TypeCard
          name="SPIRITUEL"
          description="Liés aux âmes, aux esprits ou à des concepts immatériels, ces artefacts défient la frontière entre la vie et la mort. Ils peuvent héberger une conscience, canaliser une émotion figée dans le temps, ou servir de pont entre le monde tangible et des plans plus abstraits. Leur usage implique presque toujours une forme de dialogue, voire de négociation, avec ce qu'ils contiennent."
        />
        <TypeCard
          name="RUNIQUE"
          description="Fondés sur des sceaux, symboles et inscriptions mystiques, ces artefacts tirent leur puissance non de la matière qui les compose, mais du savoir qui les a gravés. Leur création exige une maîtrise théorique poussée : une inscription mal maîtrisée peut rendre l'artefact instable, voire inerte. À l'inverse, un runique parfaitement conçu peut atteindre une précision d'effet inégalée par les autres types."
        />
        <TypeCard
          name="ANORMAL"
          description="Objets défiant ouvertement les lois naturelles ou magiques connues. Aucune règle établie ne s'applique entièrement à eux, ce qui en fait à la fois les artefacts les plus fascinants et les plus difficiles à équilibrer. Leur création est rarement volontaire au sens strict : elle résulte souvent d'un accident, d'une anomalie ou d'un concept qui a trouvé une forme physique presque malgré lui."
        />
      </ContentSection>

      {/* Giant Text: MATÉRIAUX */}
      <GiantText text="MATÉRIAUX" />

      {/* Section III — Matériaux et Loots */}
      <ContentSection number="III">
        <SectionTitle>✦ III — LES MATÉRIAUX ET LOOTS NÉCESSAIRES ✦</SectionTitle>

        <Body>
          Aucun artefact ne naît du néant. Sa fabrication nécessite la récupération de composants spéciaux provenant du bestiaire, et la puissance finale de l'objet dépend directement de la qualité de ce qui a été rassemblé pour le créer. Ce lien entre le combat, l'exploration et la création est volontaire : il ancre chaque artefact dans le vécu réel du personnage qui l'a forgé.
        </Body>

        <div
          className="anim-p"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <p className="anim-p" style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
            ◈ Plus les créatures vaincues sont puissantes, plus les matériaux obtenus sont rares et porteurs d'un potentiel élevé.
          </p>
          <p className="anim-p" style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
            ◈ Les artefacts de rang supérieur exigent des loots provenant de plusieurs créatures de haut rang — un unique composant rare ne suffit jamais à lui seul.
          </p>
          <p className="anim-p" style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
            ◈ Certains composants ne s'obtiennent que lors d'événements spéciaux, de rencontres exceptionnelles ou d'arcs narratifs précis, et ne sont donc jamais disponibles en accès libre.
          </p>
          <p className="anim-p" style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
            ◈ La qualité des matériaux influence directement la qualité finale de l'artefact : un assemblage bâclé, même avec de bons composants, produira un résultat instable.
          </p>
          <p className="anim-p" style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
            ◈ Certains matériaux sont incompatibles entre eux et peuvent, s'ils sont combinés sans précaution, corrompre l'ensemble du processus de création.
          </p>
        </div>

        <RuleBlock>
          <span style={{ color: C.accent, fontWeight: 600 }}>RÈGLE FONDAMENTALE — </span>
          Plus les loots proviennent d'un bestiaire de haut rang, plus l'artefact pourra atteindre un niveau de puissance élevé. Il n'existe aucun raccourci : la puissance d'un artefact est le miroir direct de ce qu'il a fallu affronter pour le créer.
        </RuleBlock>
      </ContentSection>

      {/* Giant Text: CRÉATION */}
      <GiantText text="CRÉATION" />

      {/* Section IV — Processus de Création */}
      <ContentSection number="IV">
        <SectionTitle>✦ IV — PROCESSUS DE CRÉATION ✦</SectionTitle>

        <Body>
          La création d'un artefact ne s'effectue jamais instantanément, et ce délai est volontaire : il garantit que chaque artefact soit pensé, justifié et intégré avec soin dans l'histoire du personnage. Chaque projet est suivi et validé par un MJ directement dans le ticket du joueur, du premier concept jusqu'à l'intégration finale.
        </Body>

        <div className="anim-p" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "8px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.3rem", color: C.accent, fontWeight: 700, minWidth: "36px", textAlign: "center" }}>1</span>
            <div>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textPrimary, fontWeight: 600, marginBottom: "4px", lineHeight: 1.6 }}>
                <strong>Présentation du concept</strong>
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0 }}>
                Le joueur décrit l'artefact envisagé : son apparence, son type, ses effets pressentis et l'idée narrative qui le sous-tend. Plus le concept est clair, plus la suite du processus sera fluide.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.3rem", color: C.accent, fontWeight: 700, minWidth: "36px", textAlign: "center" }}>2</span>
            <div>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textPrimary, fontWeight: 600, marginBottom: "4px", lineHeight: 1.6 }}>
                <strong>Vérification des matériaux</strong>
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0 }}>
                Le MJ contrôle que les composants annoncés ont bien été obtenus légitimement, et que leur rang correspond à l'ambition de l'artefact visé.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.3rem", color: C.accent, fontWeight: 700, minWidth: "36px", textAlign: "center" }}>3</span>
            <div>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textPrimary, fontWeight: 600, marginBottom: "4px", lineHeight: 1.6 }}>
                <strong>Évaluation de la cohérence narrative et de l'équilibrage</strong>
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0 }}>
                L'artefact est confronté à l'univers existant : ne doit pas rendre obsolète d'autres mécaniques, ne doit pas briser la cohérence du monde, et doit s'inscrire logiquement dans le parcours du personnage.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.3rem", color: C.accent, fontWeight: 700, minWidth: "36px", textAlign: "center" }}>4</span>
            <div>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textPrimary, fontWeight: 600, marginBottom: "4px", lineHeight: 1.6 }}>
                <strong>Validation progressive par le MJ</strong>
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0 }}>
                Le processus avance étape par étape plutôt qu'en un seul bloc, ce qui permet des ajustements avant que l'artefact ne soit figé.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1.3rem", color: C.accent, fontWeight: 700, minWidth: "36px", textAlign: "center" }}>5</span>
            <div>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textPrimary, fontWeight: 600, marginBottom: "4px", lineHeight: 1.6 }}>
                <strong>Finalisation et intégration officielle</strong>
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0 }}>
                Une fois validé, l'artefact rejoint officiellement l'inventaire du personnage et peut être utilisé en jeu.
              </p>
            </div>
          </div>
        </div>

        <WarningBlock>
          ⚠ Un artefact proposé sans concept clair ou sans matériaux appropriés sera rejeté ou renvoyé en révision. Un MJ peut également demander des ajustements narratifs (origine, contrepartie, conditions d'usage) avant validation finale — ces retours font partie intégrante du processus et ne doivent pas être perçus comme un refus, mais comme une étape de co-construction.
        </WarningBlock>
      </ContentSection>

      {/* Giant Text: RANGS */}
      <GiantText text="RANGS" />

      {/* Section V — Rangs et Puissance */}
      <ContentSection number="V">
        <SectionTitle>✦ V — RANGS ET PUISSANCE DES ARTEFACTS ✦</SectionTitle>

        <Body>
          Les artefacts sont classés selon plusieurs rangs de rareté et de puissance. Plus un artefact possède un rang élevé, plus il transcende les limites du monde ordinaire — et plus les attentes et les risques qui l'accompagnent sont importants.
        </Body>

        <RankItem
          letter="E"
          description="Objet commun légèrement amélioré. Effets simples et prévisibles, sans réelle incidence sur l'équilibre d'un affrontement. Accessible sans grande difficulté, idéal pour un premier artefact."
        />
        <RankItem
          letter="D"
          description="Objet notable. Effets ciblés, à l'usage limité mais fiable. Commence à demander une réflexion sur les matériaux utilisés et sur la cohérence du concept."
        />
        <RankItem
          letter="C"
          description="Artefact reconnu. Ses effets sont marquants, en combat comme hors combat, et il commence à influencer la réputation du personnage qui le porte."
        />
        <RankItem
          letter="B"
          description="Artefact puissant. Ses capacités peuvent changer le déroulement d'un arc narratif entier. Sa création exige des matériaux exigeants et un concept solidement pensé."
        />
        <RankItem
          letter="A"
          description="Artefact rare. Ses effets s'approchent d'un véritable hax, capable de contourner des règles habituellement immuables. Les conditions d'usage deviennent exigeantes, et la contrepartie associée est presque toujours significative."
        />
        <RankItem
          letter="S"
          description="Artefact légendaire. Son impact est majeur sur le monde lui-même, et non plus seulement sur le personnage qui le porte. Chaque artefact de rang S est unique et impossible à dupliquer — deux artefacts identiques de ce rang ne peuvent coexister."
        />

        <Body>
          Les artefacts les plus prestigieux sont souvent uniques et impossibles à reproduire à l'identique : leur rareté n'est pas qu'une question de statistiques, elle fait partie de leur identité narrative.
        </Body>
      </ContentSection>

      {/* Giant Text: MAÎTRISE */}
      <GiantText text="MAÎTRISE" />

      {/* Section VI — Manipulation et Maîtrise */}
      <ContentSection number="VI">
        <SectionTitle>✦ VI — MANIPULATION ET MAÎTRISE DES ARTEFACTS ✦</SectionTitle>

        <Body>
          Posséder un artefact ne signifie pas automatiquement être capable de l'utiliser correctement. La puissance contenue dans ces objets ne se laisse pas canaliser sans discipline, et beaucoup de récits douloureux commencent par un utilisateur trop confiant.
        </Body>

        {/* Subsection: Compétence requise */}
        <div className="anim-p" style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.05rem",
              color: C.accent,
              marginBottom: "10px",
              fontWeight: 600,
            }}
          >
            ▸ Compétence requise
          </h3>
          <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0 }}>
            Le personnage doit posséder une compétence unique spécialisée dans la manipulation et le contrôle des artefacts. Cette compétence représente les connaissances, l'expérience et la résistance nécessaires pour canaliser les énergies anormales contenues dans ces objets. Elle ne s'acquiert pas par hasard : elle se construit, s'entraîne, et se perfectionne au fil des expériences du personnage. Un personnage ne possédant pas cette compétence s'expose à des risques majeurs dès la première activation, quelle que soit la puissance réelle de l'artefact concerné.
          </p>
        </div>

        {/* Subsection: Condition de rang */}
        <div className="anim-p" style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.05rem",
              color: C.accent,
              marginBottom: "10px",
              fontWeight: 600,
            }}
          >
            ▸ Condition de rang
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
              ◈ Un personnage de rang B peut manipuler sans risque un artefact de rang B ou inférieur.
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
              ◈ Un personnage de rang A peut manipuler sans risque un artefact de rang A ou inférieur.
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
              ◈ Un personnage de rang inférieur à l'artefact qu'il tente d'utiliser s'expose à des effets secondaires importants, proportionnels à l'écart de rang.
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
              ◈ Plus cet écart est grand, plus les conséquences décrites ci-dessous risquent de se cumuler.
            </p>
          </div>
        </div>

        {/* Subsection: Contrecoups possibles */}
        <div className="anim-p" style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.05rem",
              color: C.accent,
              marginBottom: "10px",
              fontWeight: 600,
            }}
          >
            ▸ Contrecoups possibles
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              "✦ Épuisement physique ou mental extrême.",
              "✦ Blessures internes ou externes.",
              "✦ Perte temporaire ou permanente de capacités.",
              "✦ Corruption du corps ou de l'âme.",
              "✦ Folie, mutations ou instabilité psychique.",
              "✦ Destruction partielle ou totale de l'artefact.",
              "✦ Mort de l'utilisateur dans les cas les plus extrêmes.",
            ].map((item, i) => (
              <p key={i} style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0 }}>
                {item}
              </p>
            ))}
          </div>
        </div>

        {/* Subsection: Cas des artefacts supérieurs */}
        <div className="anim-p" style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.05rem",
              color: C.accent,
              marginBottom: "10px",
              fontWeight: 600,
            }}
          >
            ▸ Cas des artefacts supérieurs
          </h3>
          <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0 }}>
            Les artefacts de très haut rang peuvent imposer des conditions supplémentaires même à un utilisateur qualifié — rituel préparatoire, état émotionnel précis, moment ou lieu particulier. Le MJ conserve le droit d'ajouter des restrictions ou conséquences particulières propres à chaque artefact, en cohérence avec son concept et son histoire.
          </p>
        </div>

        {/* Quote block */}
        <div
          className="anim-p"
          style={{
            borderLeft: `2px solid rgba(0, 212, 255, 0.3)`,
            borderRight: `2px solid rgba(0, 212, 255, 0.3)`,
            padding: "24px 28px",
            textAlign: "center",
            marginTop: "16px",
          }}
        >
          <p
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1rem",
              color: C.textSecondary,
              lineHeight: 1.8,
              fontStyle: "italic",
              margin: 0,
            }}
          >
            ✦ « Un artefact est un pouvoir emprisonné dans un objet. Plus ce pouvoir est grand, plus l'utilisateur doit être capable d'en supporter le poids. » ✦
          </p>
        </div>
      </ContentSection>

      {/* Giant Text: ABSOLUS */}
      <GiantText text="ABSOLUS" />

      {/* Section VII — Artefacts Absolus */}
      <ContentSection number="VII">
        <SectionTitle>✦ VII — LES ARTEFACTS ABSOLUS ET LEURS CONTREPARTIES ✦</SectionTitle>

        <Body>
          Les artefacts proposant des effets dits absolus sont considérés comme les plus dangereux et les plus instables de tout le système. Ils transcendent la logique ordinaire du combat et de la magie, et à ce titre, ils ne peuvent exister sans un prix à leur mesure.
        </Body>

        <Body>
          Un effet absolu n'est jamais anodin : il ne se contourne pas, ne se négocie pas, et ne connaît généralement pas d'exception dans les conditions où il s'applique. C'est précisément cette absence d'échappatoire qui justifie l'ampleur de sa contrepartie.
        </Body>

        <div className="anim-p" style={{ marginBottom: "8px" }}>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.05rem",
              color: C.textPrimary,
              marginBottom: "12px",
              fontWeight: 600,
            }}
          >
            Exemples d'effets absolus :
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
              ◈ Annulation absolue d'une capacité, sans possibilité de résistance.
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
              ◈ Contrôle total d'un concept précis (le silence, la gravité, l'oubli...).
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0, paddingLeft: "16px", borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
              ◈ Effets impossibles à contourner dans les conditions définies par l'artefact.
            </p>
          </div>
        </div>

        <div className="anim-p" style={{ marginBottom: "8px" }}>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.05rem",
              color: C.textPrimary,
              marginBottom: "12px",
              fontWeight: 600,
            }}
          >
            Contreparties possibles :
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              "✦ La mort définitive de l'utilisateur.",
              "✦ La perte totale de ses souvenirs.",
              "✦ La destruction de son âme.",
              "✦ La disparition d'une partie de son existence — passée, présente ou future.",
              "✦ Des conséquences irréversibles, impossibles à annuler par quelque moyen que ce soit.",
            ].map((item, i) => (
              <p key={i} style={{ fontFamily: FONT_BODY, fontSize: "0.92rem", color: C.textSecondary, lineHeight: 1.85, margin: 0 }}>
                {item}
              </p>
            ))}
          </div>
        </div>

        <RuleBlock>
          <span style={{ color: C.accent, fontWeight: 600 }}>PRINCIPE FONDAMENTAL — </span>
          Plus un pouvoir est absolu, plus sa contrepartie devra être cruelle et significative. Un artefact absolu sans contrepartie à sa hauteur ne sera jamais validé, quelle que soit la qualité du concept qui l'entoure : l'équilibre du monde en dépend.
        </RuleBlock>
      </ContentSection>

      {/* Giant Text: EXEMPLES */}
      <GiantText text="EXEMPLES" />

      {/* Section VIII — Exemples d'Artefacts */}
      <ContentSection number="VIII">
        <SectionTitle>✦ VIII — EXEMPLES D'ARTEFACTS ✦</SectionTitle>

        <Body>
          Les exemples suivants illustrent la diversité des artefacts pouvant être créés. Ils servent de référence pour comprendre l'équilibre attendu entre effet, matériaux et contrepartie — non de modèles à copier tels quels.
        </Body>

        <ArtefactCard
          name="Miroir de l'Écho Perdu"
          rank="B"
          type="Spirituel"
          effect="Permet à l'utilisateur de reproduire une fois la dernière capacité adverse utilisée contre lui. Usage unique par combat."
          materials="Fragments d'âme d'un spectre de rang B, cristal d'écho, essence de mémoire."
          counterpart="L'utilisateur perd temporairement le souvenir de la capacité qu'il a copiée."
        />

        <ArtefactCard
          name="Lame du Serment Rompu"
          rank="A"
          type="Relique"
          effect="Ignore toute forme de défense passive lors d'une frappe si l'utilisateur a préalablement prononcé un serment contre sa cible."
          materials="Âme d'un parjure de rang A, acier des Profondeurs, larme de pacte."
          counterpart="Chaque usage prolonge d'un rang la durée de récupération du porteur."
        />

        <ArtefactCard
          name="Sceau de l'Inexistant"
          rank="S"
          type="Anormal"
          effect="Efface temporairement l'existence d'une cible de toutes les perceptions pendant 10 secondes. Absolu dans les conditions définies."
          materials="Core d'un être de rang S, concept de néant, fragment de réalité altérée."
          counterpart="L'utilisateur cesse d'exister lui-même pendant 10 secondes après usage. Mort définitive si aucun ancrage n'est préparé."
        />
      </ContentSection>

      {/* Footer Space */}
      <div
        style={{
          height: "20vh",
          background: C.bgDeep,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "0.8rem",
            color: C.textTertiary,
            letterSpacing: "0.2em",
          }}
        >
          ✦ ASCENSION — GRIMOIRE ✦
        </p>
      </div>
    </div>
  );
}