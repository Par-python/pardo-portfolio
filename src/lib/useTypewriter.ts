"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  speedMs?: number;
  rootMargin?: string;
};

export function useTypewriter(text: string, { speedMs = 18, rootMargin = "0px 0px -10% 0px" }: Options = {}) {
  const elRef = useRef<HTMLElement | null>(null);
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    if (reducedRef.current) {
      setDisplay(text);
      setDone(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            io.disconnect();
            let i = 0;
            const tick = () => {
              i += 1;
              setDisplay(text.slice(0, i));
              if (i < text.length) {
                timer = window.setTimeout(tick, speedMs);
              } else {
                setDone(true);
              }
            };
            let timer = window.setTimeout(tick, speedMs);
          }
        }
      },
      { rootMargin, threshold: 0.1 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [text, speedMs, rootMargin]);

  return { ref: elRef, display, done };
}
