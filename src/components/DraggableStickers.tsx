"use client";

import { useEffect, useRef, useState } from "react";

type StickerDef = {
  id: string;
  label: string;
  // anchor defaults to "left" (x measured from left edge of container).
  // When "right", x is measured as distance from the right edge.
  initial: { x: number; y: number; rotate: number; anchor?: "left" | "right" };
  svg: React.ReactNode;
};

const STORAGE_KEY = "jjpardo-stickers-v4";

const coffeeSvg = (
  <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
    <rect x="2" y="4" width="10" height="9" fill="#8b5a2b" />
    <rect x="2" y="4" width="10" height="2" fill="#6b3410" />
    <rect x="3" y="6" width="8" height="6" fill="#c9a27a" />
    <rect x="12" y="6" width="2" height="4" fill="#8b5a2b" />
    <rect x="13" y="7" width="1" height="2" fill="#c9a27a" />
    <rect x="4" y="1" width="1" height="3" fill="#ffffff" opacity="0.8" />
    <rect x="6" y="0" width="1" height="4" fill="#ffffff" opacity="0.8" />
    <rect x="8" y="1" width="1" height="3" fill="#ffffff" opacity="0.8" />
  </svg>
);

const headphonesSvg = (
  <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
    <rect x="3" y="3" width="10" height="2" fill="#222" />
    <rect x="2" y="5" width="1" height="6" fill="#222" />
    <rect x="13" y="5" width="1" height="6" fill="#222" />
    <rect x="1" y="8" width="3" height="5" fill="#ff3a3a" />
    <rect x="12" y="8" width="3" height="5" fill="#ff3a3a" />
    <rect x="2" y="9" width="1" height="3" fill="#ffffff" opacity="0.6" />
    <rect x="13" y="9" width="1" height="3" fill="#ffffff" opacity="0.6" />
  </svg>
);

const starSvg = (
  <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
    <rect x="7" y="2" width="2" height="2" fill="#ffd33a" />
    <rect x="6" y="4" width="4" height="2" fill="#ffd33a" />
    <rect x="2" y="6" width="12" height="2" fill="#ffd33a" />
    <rect x="4" y="8" width="8" height="2" fill="#ffd33a" />
    <rect x="5" y="10" width="2" height="2" fill="#ffd33a" />
    <rect x="9" y="10" width="2" height="2" fill="#ffd33a" />
    <rect x="3" y="12" width="2" height="2" fill="#ffd33a" />
    <rect x="11" y="12" width="2" height="2" fill="#ffd33a" />
  </svg>
);

const heartSvg = (
  <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
    <rect x="2" y="3" width="4" height="2" fill="#ff3a6a" />
    <rect x="10" y="3" width="4" height="2" fill="#ff3a6a" />
    <rect x="1" y="5" width="6" height="3" fill="#ff3a6a" />
    <rect x="9" y="5" width="6" height="3" fill="#ff3a6a" />
    <rect x="2" y="8" width="12" height="2" fill="#ff3a6a" />
    <rect x="3" y="10" width="10" height="2" fill="#ff3a6a" />
    <rect x="5" y="12" width="6" height="1" fill="#ff3a6a" />
    <rect x="6" y="13" width="4" height="1" fill="#ff3a6a" />
    <rect x="7" y="14" width="2" height="1" fill="#ff3a6a" />
    <rect x="3" y="5" width="1" height="1" fill="#ffffff" opacity="0.7" />
    <rect x="11" y="5" width="1" height="1" fill="#ffffff" opacity="0.7" />
  </svg>
);

const floppySvg = (
  <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
    <rect x="1" y="1" width="14" height="14" fill="#3168ff" />
    <rect x="2" y="2" width="12" height="1" fill="#1842b3" />
    <rect x="4" y="3" width="8" height="5" fill="#0a2775" />
    <rect x="10" y="4" width="1" height="3" fill="#ffffff" />
    <rect x="3" y="9" width="10" height="6" fill="#d9d9d9" />
    <rect x="5" y="10" width="6" height="1" fill="#000000" />
    <rect x="5" y="12" width="6" height="1" fill="#000000" />
    <rect x="5" y="13" width="4" height="1" fill="#000000" />
  </svg>
);

// Positions spread across the about page. Left-anchored stickers use positive x
// measured from the container's left; right-anchored ones use x as distance
// from the right edge — resolved against window.innerWidth on mount.
const STICKERS: StickerDef[] = [
  {
    id: "coffee",
    label: "Coffee",
    initial: { x: 40, y: 280, rotate: -8, anchor: "left" },
    svg: coffeeSvg,
  },
  {
    id: "headphones",
    label: "Headphones",
    initial: { x: 40, y: 460, rotate: 12, anchor: "right" },
    svg: headphonesSvg,
  },
  {
    id: "star",
    label: "Star",
    initial: { x: 40, y: 980, rotate: -4, anchor: "left" },
    svg: starSvg,
  },
  {
    id: "heart",
    label: "Heart",
    initial: { x: 60, y: 1320, rotate: 8, anchor: "right" },
    svg: heartSvg,
  },
  {
    id: "floppy",
    label: "Floppy disk",
    initial: { x: 40, y: 1700, rotate: -12, anchor: "left" },
    svg: floppySvg,
  },
];

type Pos = { x: number; y: number };

// Approx sticker width (must match the rendered size cap below).
const STICKER_PX = 72;

// SSR-safe seed: use raw initial.x for everyone so server and client first
// render match. Right-anchored stickers get resolved against the viewport in
// a post-mount effect below, which updates their x to `vw - STICKER_PX - x`.
function seedPositions(): Record<string, Pos> {
  const initial: Record<string, Pos> = {};
  STICKERS.forEach((s) => {
    initial[s.id] = { x: s.initial.x, y: s.initial.y };
  });
  return initial;
}

export function DraggableStickers() {
  const [positions, setPositions] = useState<Record<string, Pos>>(seedPositions);
  const anchoredRef = useRef(false);

  useEffect(() => {
    if (anchoredRef.current) return;
    anchoredRef.current = true;
    const vw = window.innerWidth;
    setPositions((prev) => {
      const next = { ...prev };
      STICKERS.forEach((s) => {
        if (s.initial.anchor === "right") {
          next[s.id] = {
            x: Math.max(0, vw - STICKER_PX - s.initial.x),
            y: s.initial.y,
          };
        }
      });
      return next;
    });
  }, []);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, Pos>;
      setPositions((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch {
      // ignore
    }
  }, [positions]);

  const onStart = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    const point =
      "touches" in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };
    const pos = positions[id];
    dragRef.current = {
      id,
      startX: point.x,
      startY: point.y,
      origX: pos.x,
      origY: pos.y,
    };
    setDragging(id);

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const p =
        "touches" in ev
          ? { x: ev.touches[0].clientX, y: ev.touches[0].clientY }
          : { x: ev.clientX, y: ev.clientY };
      const nextX = drag.origX + (p.x - drag.startX);
      const nextY = drag.origY + (p.y - drag.startY);
      setPositions((prev) => ({
        ...prev,
        [drag.id]: { x: nextX, y: nextY },
      }));
    };
    const onUp = () => {
      dragRef.current = null;
      setDragging(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-visible">
      {STICKERS.map((s) => {
        const p = positions[s.id];
        const isDragging = dragging === s.id;
        return (
          <div
            key={s.id}
            role="button"
            aria-label={`Drag ${s.label} sticker`}
            onMouseDown={(e) => onStart(s.id, e)}
            onTouchStart={(e) => onStart(s.id, e)}
            className="pointer-events-auto absolute size-[56px] sm:size-[72px] cursor-grab select-none"
            style={{
              left: p.x,
              top: p.y,
              transform: `rotate(${s.initial.rotate}deg) scale(${
                isDragging ? 1.08 : 1
              })`,
              transition: isDragging
                ? "none"
                : "transform 0.15s steps(4, end)",
              filter: isDragging
                ? "drop-shadow(2px 2px 0 rgba(0,0,0,0.35))"
                : "drop-shadow(1px 1px 0 rgba(0,0,0,0.25))",
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
          >
            {s.svg}
          </div>
        );
      })}
    </div>
  );
}
