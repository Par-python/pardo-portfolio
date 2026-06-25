"use client";

import { useEffect } from "react";
import { useDraggableWindow } from "@/lib/useDraggableWindow";
import { WindowFrame } from "./WindowFrame";

type SystemPropertiesDialogProps = {
  open: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
};

const SPECS: { label: string; value: string }[] = [
  { label: "Processor", value: "caffeine (overclocked)" },
  { label: "Memory (RAM)", value: "8 ideas" },
  { label: "Display", value: "90's mode" },
  { label: "Registered to", value: "you" },
  { label: "Status", value: "shipping 🚀" },
];

export function SystemPropertiesDialog({
  open,
  onClose,
  zIndex = 40,
  onFocus,
}: SystemPropertiesDialogProps) {
  const { pos, windowRef, onTitlePointerDown } = useDraggableWindow({
    open,
    minTop: 24,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={windowRef}
      onPointerDownCapture={onFocus}
      className="fixed w-[min(420px,92vw)]"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        zIndex,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div
        onPointerDown={onTitlePointerDown}
        className="cursor-move touch-none"
        style={{ touchAction: "none" }}
      >
        <WindowFrame title="System Properties" statusText="OK" onClose={onClose}>
          <div
            className="cursor-default"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <img src="/assets/folder.png" alt="" className="size-[32px]" />
              <p className="text-[var(--accent)] text-[24px] sm:text-[28px] tracking-[0.6px] leading-none">
                JJ Pardo OS v2026
              </p>
            </div>

            <div
              className="mt-3 h-[2px] w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, var(--accent) 0 8px, transparent 8px 14px)",
              }}
            />

            <ul className="mt-4 flex flex-col gap-2">
              {SPECS.map((spec) => (
                <li
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 font-[family-name:var(--font-body)] text-[16px] sm:text-[18px] tracking-[0.3px] leading-none"
                >
                  <span className="text-[var(--text-muted)]">{spec.label}:</span>
                  <span className="text-[var(--text)] text-right">{spec.value}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-[var(--surface)] win-frame-outside px-6 py-1 font-[family-name:var(--font-body)] text-[16px] tracking-[0.3px] leading-none cursor-pointer active:translate-y-[1px]"
              >
                OK
              </button>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}
