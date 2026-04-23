"use client";

import { useEffect, useRef, useState } from "react";
import { WindowFrame } from "./WindowFrame";

type Tip = {
  title: string;
  body: string;
  icon: "mouse" | "cat" | "terminal" | "sticker" | "home" | "window";
  desktopOnly?: boolean;
};

const TIPS: Tip[] = [
  {
    title: "right-click a project card",
    body: "on desktop, right-click a project card for options. on mobile, press and hold. opens a little menu with open, copy link, and properties.",
    icon: "mouse",
  },
  {
    title: "poke the nyan cat",
    body: "click nyan in the corner of the landing page to watch her traverse the whole page and come back home.",
    icon: "cat",
    desktopOnly: true,
  },
  {
    title: "summon the terminal",
    body: "press Ctrl+K (or Cmd+K on mac) anywhere, or click TERMINAL in the nav, to open a searchable DOS-style prompt. try 'help' or 'find react'.",
    icon: "terminal",
  },
  {
    title: "drag the stickers",
    body: "on the about page, pick up the pixel stickers scattered around and drag them anywhere. they remember where you put them.",
    icon: "sticker",
  },
  {
    title: "click JJ to go home",
    body: "the JJ logo in the navbar is a home link on every page. use it instead of the browser back button for vibes.",
    icon: "home",
  },
  {
    title: "drag any window",
    body: "every modal window (contacts, tech stack, project details, this one) can be dragged by its title bar. stack them however you like.",
    icon: "window",
  },
];

const STORAGE_KEY = "jjpardo-tips-shown-v1";

type TipsModalProps = {
  open: boolean;
  onClose: () => void;
};

function TipIcon({ kind }: { kind: Tip["icon"] }) {
  const shared = "w-full h-full";
  if (kind === "mouse") {
    return (
      <svg viewBox="0 0 16 16" className={shared} shapeRendering="crispEdges">
        <rect x="5" y="2" width="6" height="11" fill="#c0c0c0" />
        <rect x="5" y="2" width="6" height="1" fill="#000" />
        <rect x="5" y="12" width="6" height="1" fill="#000" />
        <rect x="5" y="2" width="1" height="11" fill="#000" />
        <rect x="10" y="2" width="1" height="11" fill="#000" />
        <rect x="7" y="4" width="2" height="3" fill="#ff3a3a" />
        <rect x="7" y="7" width="2" height="1" fill="#000" />
      </svg>
    );
  }
  if (kind === "cat") {
    return (
      <svg viewBox="0 0 16 16" className={shared} shapeRendering="crispEdges">
        <rect x="3" y="5" width="10" height="5" fill="#ff9ed1" />
        <rect x="2" y="6" width="1" height="3" fill="#ff9ed1" />
        <rect x="13" y="6" width="1" height="3" fill="#ff9ed1" />
        <rect x="5" y="7" width="1" height="1" fill="#000" />
        <rect x="10" y="7" width="1" height="1" fill="#000" />
        <rect x="0" y="6" width="2" height="1" fill="#ff3a3a" />
        <rect x="0" y="7" width="2" height="1" fill="#ffd33a" />
        <rect x="0" y="8" width="2" height="1" fill="#39ff14" />
        <rect x="0" y="9" width="2" height="1" fill="#3168ff" />
      </svg>
    );
  }
  if (kind === "terminal") {
    return (
      <svg viewBox="0 0 16 16" className={shared} shapeRendering="crispEdges">
        <rect x="1" y="1" width="14" height="13" fill="#000" />
        <rect x="1" y="1" width="14" height="2" fill="#c0c0c0" />
        <rect x="3" y="6" width="2" height="1" fill="#39ff14" />
        <rect x="5" y="6" width="1" height="1" fill="#39ff14" />
        <rect x="3" y="9" width="3" height="1" fill="#39ff14" />
        <rect x="6" y="9" width="4" height="1" fill="#39ff14" opacity="0.8" />
      </svg>
    );
  }
  if (kind === "sticker") {
    return (
      <svg viewBox="0 0 16 16" className={shared} shapeRendering="crispEdges">
        <rect x="7" y="2" width="2" height="2" fill="#ffd33a" />
        <rect x="6" y="4" width="4" height="2" fill="#ffd33a" />
        <rect x="2" y="6" width="12" height="2" fill="#ffd33a" />
        <rect x="4" y="8" width="8" height="2" fill="#ffd33a" />
        <rect x="5" y="10" width="2" height="2" fill="#ffd33a" />
        <rect x="9" y="10" width="2" height="2" fill="#ffd33a" />
      </svg>
    );
  }
  if (kind === "home") {
    return (
      <svg viewBox="0 0 16 16" className={shared} shapeRendering="crispEdges">
        <rect x="7" y="2" width="2" height="1" fill="#000080" />
        <rect x="6" y="3" width="4" height="1" fill="#000080" />
        <rect x="5" y="4" width="6" height="1" fill="#000080" />
        <rect x="4" y="5" width="8" height="1" fill="#000080" />
        <rect x="3" y="6" width="10" height="1" fill="#000080" />
        <rect x="4" y="7" width="8" height="6" fill="#c0c0c0" />
        <rect x="7" y="9" width="2" height="4" fill="#6b3410" />
      </svg>
    );
  }
  // window
  return (
    <svg viewBox="0 0 16 16" className={shared} shapeRendering="crispEdges">
      <rect x="1" y="2" width="14" height="12" fill="#c0c0c0" />
      <rect x="1" y="2" width="14" height="3" fill="#000080" />
      <rect x="12" y="3" width="1" height="1" fill="#fff" />
      <rect x="2" y="6" width="12" height="7" fill="#fff" />
      <rect x="3" y="8" width="8" height="1" fill="#c0c0c0" />
      <rect x="3" y="10" width="6" height="1" fill="#c0c0c0" />
    </svg>
  );
}

export function TipsModal({ open, onClose }: TipsModalProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const tips = isMobile ? TIPS.filter((t) => !t.desktopOnly) : TIPS;
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && pos === null && windowRef.current) {
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        const rect = windowRef.current.getBoundingClientRect();
        setPos({
          x: Math.max(12, window.innerWidth / 2 - rect.width / 2),
          y: Math.max(12, window.innerHeight - rect.height - 16),
        });
      } else {
        setPos({ x: 56, y: 56 });
      }
    }
  }, [open, pos]);

  useEffect(() => {
    if (!open) {
      setPos(null);
      setStep(0);
    }
  }, [open]);

  const onTitleMouseDown = (e: React.MouseEvent) => {
    if (!pos) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current || !windowRef.current) return;
      const rect = windowRef.current.getBoundingClientRect();
      const nextX =
        dragRef.current.origX + (ev.clientX - dragRef.current.startX);
      const nextY =
        dragRef.current.origY + (ev.clientY - dragRef.current.startY);
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      setPos({
        x: Math.min(Math.max(nextX, -halfW), window.innerWidth - halfW),
        y: Math.min(Math.max(nextY, -halfH), window.innerHeight - halfH),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!open) return null;

  const safeStep = Math.min(step, tips.length - 1);
  const isLast = safeStep === tips.length - 1;
  const tip = tips[safeStep];

  return (
    <div
      ref={windowRef}
      className="fixed w-[min(460px,92vw)] z-[100]"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div onMouseDown={onTitleMouseDown} className="cursor-move">
        <WindowFrame
          title="TIPS.EXE"
          titleBarColor="#c08a1b"
          bodyColor="#fffcd8"
          statusText={`tip ${safeStep + 1} of ${tips.length}`}
          onClose={onClose}
        >
          <div
            className="cursor-default"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="size-[48px] sm:size-[64px] shrink-0 bg-white border border-black/20 p-1">
                <TipIcon kind={tip.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#000080] text-[20px] sm:text-[24px] tracking-[0.4px] leading-none">
                  {tip.title}
                </p>
                <p className="mt-2 font-vt323 text-[16px] sm:text-[20px] tracking-[0.32px] leading-[18px] sm:leading-[22px]">
                  {tip.body}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {tips.map((_, i) => (
                  <span
                    key={i}
                    className={`size-[8px] ${
                      i === safeStep ? "bg-[#000080]" : "bg-[#c0c0c0]"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="px-4 py-2 bg-[#c0c0c0] win-frame-outside text-[14px] tracking-[0.28px] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  ← prev
                </button>
                {isLast ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-[#c0c0c0] win-frame-outside text-[14px] tracking-[0.28px] cursor-pointer"
                  >
                    got it!
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(tips.length - 1, s + 1))}
                    className="px-4 py-2 bg-[#c0c0c0] win-frame-outside text-[14px] tracking-[0.28px] cursor-pointer"
                  >
                    next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}

export function useTipsFirstVisit(delayMs = 4000) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const shown = localStorage.getItem(STORAGE_KEY);
      if (shown) return;
    } catch {
      return;
    }
    const t = window.setTimeout(() => setOpen(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const openManually = () => setOpen(true);

  return { open, close, openManually };
}
