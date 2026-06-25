"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isTahoe = theme === "tahoe";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isTahoe ? "Windows 95" : "Tahoe"} theme`}
      title={`Switch to ${isTahoe ? "Windows 95" : "Tahoe"} theme`}
      className="flex items-center gap-2 px-2 sm:px-3 py-1 leading-none cursor-pointer bg-[var(--surface)] win-frame-outside text-[var(--text)] font-[family-name:var(--font-body)] text-[14px] sm:text-[16px] tracking-[0.3px]"
    >
      <span aria-hidden>{isTahoe ? "☾" : "☀"}</span>
      <span className="hidden sm:inline whitespace-nowrap">
        {isTahoe ? "Tahoe" : "Win95"}
      </span>
    </button>
  );
}
