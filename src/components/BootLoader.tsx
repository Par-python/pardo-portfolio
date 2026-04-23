"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_KEY = "jjpardo-boot-shown";
// Partial play of /assets/loading.gif — full loop is ~4600ms, tuned shorter so
// the boot doesn't drag on.
const GIF_LOOP_MS = 2500;
const FADE_MS = 500;

export function BootLoader() {
  // Default to visible so the first paint covers the page — flipped off after
  // mount if this session has already shown the loader.
  const [shouldShow, setShouldShow] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);
  const timersRef = useRef<number[]>([]);
  const startedRef = useRef(false);

  const startTimers = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const hideAt = window.setTimeout(() => setHidden(true), GIF_LOOP_MS);
    const goneAt = window.setTimeout(
      () => setGone(true),
      GIF_LOOP_MS + FADE_MS
    );
    timersRef.current.push(hideAt, goneAt);
  };

  useEffect(() => {
    if (sessionStorage.getItem(BOOT_KEY)) {
      setShouldShow(false);
      setGone(true);
      return;
    }
    sessionStorage.setItem(BOOT_KEY, "1");

    // Safety net: even if <img> onLoad never fires (cached image, decode skip),
    // the loader must still unmount. Start timers right after mount so the
    // worst case is the same as if the image loaded instantly.
    startTimers();

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  if (gone || !shouldShow) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <img
        src="/assets/loading.gif"
        alt="Loading"
        className="w-[clamp(200px,30vw,400px)] h-auto [image-rendering:pixelated]"
      />
    </div>
  );
}
