/**
 * useAudioNavigation — hooks audio sound effects into the SPA navigation
 *
 * Plays appropriate sounds for:
 *   - Page navigation (forward / back)
 *   - Search overlay open / close
 *   - Mobile menu open / close
 *   - Scroll ticks (throttled)
 */

import { useEffect, useRef } from "react";
import { useNavigation } from "@/store/navigationStore";
import { useAudioStore } from "@/store/audioStore";
import {
  playNavigateForward,
  playNavigateBack,
  playOpen,
  playClose,
  playScrollTick,
  playClick,
  initAudio,
} from "@/lib/audioEngine";

export function useAudioNavigation() {
  const { currentPage, previousPage, searchOpen, mobileMenuOpen } =
    useNavigation();
  const { sfxEnabled } = useAudioStore();

  const prevPageRef = useRef(currentPage);
  const prevSearchRef = useRef(searchOpen);
  const prevMenuRef = useRef(mobileMenuOpen);
  const scrollThrottle = useRef(0);

  /* ── Init audio on first interaction ── */
  useEffect(() => {
    const handler = () => {
      initAudio();
    };
    const events = ["click", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, handler, { once: true }));
    return () => events.forEach((e) => window.removeEventListener(e, handler));
  }, []);

  /* ── Page navigation sounds ── */
  useEffect(() => {
    if (!sfxEnabled) return;

    // Detect page change (instant navigation)
    if (currentPage !== prevPageRef.current) {
      if (prevPageRef.current === "home") {
        playNavigateForward();
      } else if (currentPage === "home") {
        playNavigateBack();
      } else {
        playNavigateForward();
      }
    }

    prevPageRef.current = currentPage;
  }, [currentPage, sfxEnabled]);

  /* ── Search overlay sounds ── */
  useEffect(() => {
    if (!sfxEnabled) return;
    if (searchOpen && !prevSearchRef.current) {
      playOpen();
    } else if (!searchOpen && prevSearchRef.current) {
      playClose();
    }
    prevSearchRef.current = searchOpen;
  }, [searchOpen, sfxEnabled]);

  /* ── Mobile menu sounds ── */
  useEffect(() => {
    if (!sfxEnabled) return;
    if (mobileMenuOpen && !prevMenuRef.current) {
      playOpen();
    } else if (!mobileMenuOpen && prevMenuRef.current) {
      playClose();
    }
    prevMenuRef.current = mobileMenuOpen;
  }, [mobileMenuOpen, sfxEnabled]);

  /* ── Scroll sound (throttled) ── */
  useEffect(() => {
    if (!sfxEnabled) return;

    const onScroll = () => {
      const now = Date.now();
      if (now - scrollThrottle.current > 120) {
        scrollThrottle.current = now;
        playScrollTick();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sfxEnabled]);
}

/* ── Click sound hook (attach to specific elements) ── */
export function useClickSound() {
  const { sfxEnabled } = useAudioStore();

  const handleClick = () => {
    if (sfxEnabled) playClick();
  };

  return handleClick;
}
