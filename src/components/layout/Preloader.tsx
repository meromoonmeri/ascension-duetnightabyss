'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigation } from '@/store/navigationStore';

interface PreloaderProps {
  onComplete?: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   DNA PRELOADER — Sprite Animation
   Full-screen black background with centered sprite animation
   using bg-loading.webp (184x183px, 29 frames, steps(29))
   ═══════════════════════════════════════════════════════════════ */

export default function Preloader({ onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const setPreloaderComplete = useNavigation((s) => s.setPreloaderComplete);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const dismiss = useCallback(() => {
    if (!visible || fading) return;
    setFading(true);
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.transition = 'opacity 0.5s ease';
      overlay.style.opacity = '0';
    }
    setTimeout(() => {
      setPreloaderComplete(true);
      onComplete?.();
      setVisible(false);
    }, 500);
  }, [visible, fading, onComplete, setPreloaderComplete]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = prefersReduced ? 800 : 2000;
    const timer = setTimeout(() => {
      dismiss();
    }, delay);
    return () => clearTimeout(timer);
  }, [dismiss]);

  // Safety timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (visible) {
        setPreloaderComplete(true);
        onComplete?.();
        setVisible(false);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [visible, onComplete, setPreloaderComplete]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* DNA Sprite Animation */}
      <div className="dna-preloader-sprite" />
    </div>
  );
}