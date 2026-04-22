"use client";

import { useEffect, useRef, useState } from "react";
import { useLiveContent } from "@/lib/useLiveContent";
import { WindowFrame } from "./WindowFrame";

type TechStackModalProps = {
  open: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
};

type TechItem = { label: string; src: string };
type TechStackContent = { items: TechItem[] };

const FALLBACK: TechStackContent = { items: [
  { label: "react", src: "/assets/tech/react.svg" },
  { label: "tailwind", src: "/assets/tech/tailwind.svg" },
  { label: "typescript", src: "/assets/tech/typescript.svg" },
  { label: "postgresql", src: "/assets/tech/postgresql.svg" },
  { label: "python", src: "/assets/tech/python.svg" },
  { label: "firebase", src: "/assets/tech/firebase.svg" },
  { label: "git", src: "/assets/tech/git.svg" },
  { label: "gcloud", src: "/assets/tech/gcloud.svg" },
  { label: "nodejs", src: "/assets/tech/nodejs.svg" },
  { label: "java", src: "/assets/tech/java.svg" },
  { label: "django", src: "/assets/tech/django.svg" },
] };

export function TechStackModal({
  open,
  onClose,
  zIndex = 40,
  onFocus,
}: TechStackModalProps) {
  const { items: techItems } = useLiveContent<TechStackContent>(
    "tech-stack",
    FALLBACK
  );
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && pos === null && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setPos({
        x: window.innerWidth / 2 - rect.width / 2,
        y: window.innerHeight / 2 - rect.height / 2,
      });
    }
  }, [open, pos]);

  useEffect(() => {
    if (!open) setPos(null);
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

  return (
    <div
      ref={windowRef}
      onMouseDownCapture={onFocus}
      className="fixed w-[min(675px,92vw)] max-h-[85vh]"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        zIndex,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div onMouseDown={onTitleMouseDown} className="cursor-move h-full">
        <WindowFrame
          title="TECH STACK"
          titleBarColor="#622690"
          bodyColor="#e2eee2"
          statusText={`${techItems.length} object(s)`}
          onClose={onClose}
          className="max-h-[85vh]"
        >
          <div
            className="cursor-default h-full overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className="text-[#622690] text-[24px] sm:text-[40px] tracking-[0.8px] leading-none">
              TECH STACK
            </p>

            <div
              className="mt-2 sm:mt-3 h-[2px] sm:h-[3px] w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, #622690 0 12px, transparent 12px 20px)",
              }}
            />

            <ul className="mt-4 sm:mt-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-5">
              {techItems.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-col items-center gap-1 sm:gap-2"
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    className="size-[28px] sm:size-[44px] object-contain"
                  />
                  <span className="font-vt323 text-[14px] sm:text-[20px] tracking-[0.32px] text-black leading-[16px] sm:leading-[20px] truncate max-w-full">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}
