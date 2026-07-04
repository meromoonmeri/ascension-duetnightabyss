'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useNavigation } from '@/store/navigationStore';

interface PreloaderProps {
  onComplete?: () => void;
}

const TIPS = [
  'Chaque race possède des techniques uniques qui définissent son style de combat.',
  "L'ether est la monnaie principale d'Ascension — gagne-la en complétant des quêtes.",
  'Rejoins un royaume pour accéder à des avantages exclusifs et des guerres de territoire.',
  'Les cosmétiques de profil se débloquent dans la boutique ou via des événements spéciaux.',
];

/* ═══════════════════════════════════════════════════════════════
   GENSHIN IMPACT STYLE — AAA Cinematic Loading Screen
   Dark background → floating particles → golden logo pulse →
   rotating tips → sleek gold progress bar → cinematic fade out
   ═══════════════════════════════════════════════════════════════ */

export default function Preloader({ onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoGlowRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLParagraphElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const versionRef = useRef<HTMLSpanElement>(null);
  const setPreloaderComplete = useNavigation((s) => s.setPreloaderComplete);
  const [visible, setVisible] = useState(true);

  /* ── Generate stable random particles (memoized so they don't shift on re-render) ── */
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      // Simple seeded-ish pseudo-random based on index
      const seed = (i * 137.508) % 100;
      const left = seed; // 0-100%
      const size = 1 + (seed * 0.02) % 2; // 1-3px
      const duration = 4 + (seed * 0.04) % 4; // 4-8s
      const delay = (seed * 0.05) % 5; // 0-5s
      const isGold = i % 3 !== 0;
      return { left, size, duration, delay, isGold, key: i };
    });
  }, []);

  /* ── Dismiss: cinematic fade out ── */
  const dismiss = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay || !visible) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setPreloaderComplete(true);
      onComplete?.();
      setVisible(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setPreloaderComplete(true);
        onComplete?.();
        setTimeout(() => setVisible(false), 50);
      },
    });

    // Progress bar and version fade out
    if (progressFillRef.current) {
      tl.to(progressFillRef.current, { opacity: 0, duration: 0.2 }, 0);
    }
    if (progressTrackRef.current) {
      tl.to(progressTrackRef.current, { opacity: 0, duration: 0.2 }, 0);
    }
    if (versionRef.current) {
      tl.to(versionRef.current, { opacity: 0, duration: 0.2 }, 0);
    }

    // Tip fades out
    if (tipRef.current) {
      tl.to(tipRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0.05);
    }

    // Logo and glow fade out together
    if (logoGlowRef.current) {
      tl.to(logoGlowRef.current, { opacity: 0, scale: 1.1, duration: 0.5, ease: 'power2.in' }, 0.1);
    }
    if (logoRef.current) {
      tl.to(logoRef.current, { opacity: 0, scale: 1.04, duration: 0.5, ease: 'power2.in' }, 0.1);
    }

    // Background fades out
    tl.to(overlay, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0.3);
  }, [visible, onComplete, setPreloaderComplete]);

  /* ── Entrance animation ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const safetyTimeout = setTimeout(() => {
      dismiss();
    }, prefersReduced ? 1500 : 5000);

    if (prefersReduced) return () => clearTimeout(safetyTimeout);

    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const logoGlow = logoGlowRef.current;
    const tip = tipRef.current;
    const progressFill = progressFillRef.current;
    const progressTrack = progressTrackRef.current;
    const version = versionRef.current;

    if (!overlay) {
      return () => clearTimeout(safetyTimeout);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.05 });

      // ── Phase 1: Background fades in ──
      tl.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power1.out' },
        0,
      );

      // ── Phase 2: Logo fades in with subtle scale-up ──
      if (logo) {
        tl.fromTo(
          logo,
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' },
          0.6,
        );
      }

      // ── Phase 3: Golden glow pulse on logo ──
      if (logoGlow) {
        tl.fromTo(
          logoGlow,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' },
          0.6,
        );
        // Continuous gentle pulse
        tl.to(
          logoGlow,
          {
            opacity: 0.4,
            scale: 1.05,
            duration: 1.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          },
          1.6,
        );
      }

      // ── Phase 4: First tip fades in ──
      if (tip) {
        tl.fromTo(
          tip,
          { opacity: 0, y: 4 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          1.0,
        );
      }

      // ── Phase 5: Progress track appears ──
      if (progressTrack) {
        tl.fromTo(
          progressTrack,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 },
          0.9,
        );
      }

      // ── Phase 6: Progress bar fills (~2s) ──
      if (progressFill) {
        tl.fromTo(
          progressFill,
          { width: '0%' },
          { width: '100%', duration: 2.0, ease: 'power1.inOut' },
          1.0,
        );
      }

      // ── Phase 7: Version text ──
      if (version) {
        tl.fromTo(
          version,
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          1.2,
        );
      }

      // ── Phase 8: Auto-dismiss after loading completes (~3.5s from start) ──
      tl.call(() => {
        dismiss();
      }, null, 3.5);
    });

    return () => {
      clearTimeout(safetyTimeout);
      ctx.revert();
    };
  }, [dismiss]);

  /* ── Rotating tips (every 2.5s) ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      const tipEl = tipRef.current;
      if (!tipEl) return;

      gsap.to(tipEl, {
        opacity: 0,
        y: -4,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          currentIndex = (currentIndex + 1) % TIPS.length;
          tipEl.textContent = TIPS[currentIndex];
          gsap.fromTo(
            tipEl,
            { opacity: 0, y: 4 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
          );
        },
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* ── CSS-only particle animation keyframes ── */}
      <style jsx global>{`
        @keyframes preloader-float-up {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-10vh) scale(1);
            opacity: 0;
          }
        }

        .preloader-particle {
          position: absolute;
          bottom: 0;
          border-radius: 50%;
          pointer-events: none;
          animation: preloader-float-up var(--dur) var(--delay) infinite ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .preloader-particle {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>

      {/* ── Subtle noise texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[201]"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      <div
        ref={overlayRef}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{
          opacity: 0,
          background: '#0A080E',
        }}
      >
        {/* ── Background particles (CSS-only) ── */}
        {particles.map((p) => (
          <div
            key={p.key}
            className="preloader-particle"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: p.isGold
                ? 'rgba(200,164,92,0.3)'
                : 'rgba(200,164,92,0.12)',
              ['--dur' as string]: `${p.duration}s`,
              ['--delay' as string]: `${p.delay}s`,
            }}
          />
        ))}

        {/* ── Subtle radial vignette overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, rgba(10,8,14,0.4) 60%, rgba(10,8,14,0.85) 100%)',
          }}
        />

        {/* ── Golden glow behind logo ── */}
        <div
          ref={logoGlowRef}
          className="absolute opacity-0 pointer-events-none"
          style={{
            width: 320,
            height: 200,
            marginTop: -40,
            background:
              'radial-gradient(ellipse at center, rgba(200,164,92,0.12) 0%, rgba(200,164,92,0.04) 40%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        {/* ── Logo: ASCENSION, centered, 200x120px with golden glow ── */}
        <div
          ref={logoRef}
          className="relative z-10 opacity-0"
          style={{ width: 200, height: 120 }}
        >
          <Image
            src="/logo.png"
            alt="ASCENSION"
            width={200}
            height={120}
            priority
            className="select-none"
            style={{
              objectFit: 'contain',
              filter:
                'drop-shadow(0 0 24px rgba(200,164,92,0.25)) drop-shadow(0 0 60px rgba(200,164,92,0.1))',
            }}
          />
        </div>

        {/* ── Rotating tip text ── */}
        <p
          ref={tipRef}
          className="mt-5 opacity-0 select-none text-center z-10 max-w-[380px] px-6"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 400,
            lineHeight: 1.6,
            letterSpacing: '0.01em',
            color: 'rgba(255,255,255,0.28)',
          }}
        >
          {TIPS[0]}
        </p>

        {/* ── Progress bar: bottom center, 300px wide, gold fill ── */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8 z-10 gap-2">
          <div
            ref={progressTrackRef}
            className="opacity-0"
            style={{
              width: 300,
              height: 2,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <div
              ref={progressFillRef}
              className="h-full opacity-0"
              style={{
                width: '0%',
                background: 'linear-gradient(90deg, #8B6914, #C8A45C, #F5E6B8)',
                borderRadius: 1,
                boxShadow: '0 0 8px rgba(200,164,92,0.4), 0 0 20px rgba(200,164,92,0.15)',
              }}
            />
          </div>

          {/* ── Version text: bottom right ── */}
          <span
            ref={versionRef}
            className="opacity-0 absolute bottom-1 right-4 select-none"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.55rem',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.12)',
            }}
          >
            v1.0 — KAKUSEI
          </span>
        </div>
      </div>
    </>
  );
}