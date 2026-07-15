"use client";

import { useEffect, useRef } from "react";

type MenuItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type ProjectContextMenuProps = {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
};

export function ProjectContextMenu({
  x,
  y,
  items,
  onClose,
}: ProjectContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Clamp within viewport
  const width = 220;
  const height = items.length * 28 + 8;
  const safeX = Math.min(x, window.innerWidth - width - 8);
  const safeY = Math.min(y, window.innerHeight - height - 8);

  return (
    <div
      ref={ref}
      className="fixed z-[200] bg-[var(--surface)] win-frame-outside py-1"
      style={{ left: safeX, top: safeY, width }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                item.onClick();
                onClose();
              }}
              className={`w-full text-left px-3 py-1 text-[14px] tracking-[0.28px] leading-none ${
                item.disabled
                  ? "text-[var(--text-muted)] cursor-not-allowed"
                  : "text-[var(--text)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] cursor-pointer"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
