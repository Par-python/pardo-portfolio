"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type Position = { x: number; y: number };

type DragState = {
  startX: number;
  startY: number;
  origX: number;
  origY: number;
};

type UseDraggableWindowOptions = {
  open: boolean;
  minTop?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function useDraggableWindow({
  open,
  minTop = 0,
}: UseDraggableWindowOptions) {
  const [pos, setPos] = useState<Position | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    if (open && pos === null && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setPos({
        x: window.innerWidth / 2 - rect.width / 2,
        y: Math.max(minTop, window.innerHeight / 2 - rect.height / 2),
      });
    }
  }, [minTop, open, pos]);

  const onTitlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pos) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current || !windowRef.current) return;
      const rect = windowRef.current.getBoundingClientRect();
      const nextX = dragRef.current.origX + (ev.clientX - dragRef.current.startX);
      const nextY = dragRef.current.origY + (ev.clientY - dragRef.current.startY);
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      setPos({
        x: clamp(nextX, -halfW, window.innerWidth - halfW),
        y: clamp(nextY, -halfH, window.innerHeight - halfH),
      });
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return {
    pos,
    windowRef,
    onTitlePointerDown,
  };
}
