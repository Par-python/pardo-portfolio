"use client";

import { useEffect, useState } from "react";

const BOOT_KEY = "jjpardo-boot-shown";

export function BootLoader() {
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(BOOT_KEY)) {
      setGone(true);
      return;
    }
    sessionStorage.setItem(BOOT_KEY, "1");
    setShouldShow(true);
    const t1 = setTimeout(() => setHidden(true), 2200);
    const t2 = setTimeout(() => setGone(true), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
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
