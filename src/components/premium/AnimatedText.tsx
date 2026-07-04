"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedTextProps {
  text: string;
  speed?: number;
  delay?: number;
  glow?: boolean;
  className?: string;
}

export default function AnimatedText({
  text,
  speed = 30,
  delay = 0,
  glow = false,
  className = "",
}: AnimatedTextProps) {
  const [state, setState] = useState<{ displayed: string; started: boolean }>({ displayed: "", started: false });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const indexRef = useRef(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    indexRef.current = 0;

    const startDelay = setTimeout(() => {
      if (prefersReduced) {
        setState({ displayed: text, started: false });
        return;
      }
      setState(prev => ({ ...prev, started: true }));
      const advance = () => {
        if (indexRef.current < text.length) {
          indexRef.current++;
          setState({ displayed: text.slice(0, indexRef.current), started: true });
          timeoutRef.current = setTimeout(advance, speed);
        }
      };
      advance();
    }, delay);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeoutRef.current);
    };
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {state.displayed}
      {state.started && state.displayed.length < text.length && (
        <span
          className="inline-block w-0.5 h-[1em] align-middle ml-0.5 animate-pulse"
          style={{
            background: glow ? "var(--ancient-gold)" : "var(--text-primary)",
            boxShadow: glow ? "0 0 6px var(--ancient-gold)" : "none",
          }}
        />
      )}
    </span>
  );
}
