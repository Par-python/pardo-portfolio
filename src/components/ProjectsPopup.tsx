"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLiveContent } from "@/lib/useLiveContent";
import { WindowFrame } from "./WindowFrame";

type FeaturedProject = {
  kind: "project";
  title: string;
  image: string;
  description: string;
};

type FeaturedNews = {
  kind: "news";
  title: string;
  image: string;
  description: string;
  date: string;
  link: string;
};

type FeaturedItem = FeaturedProject | FeaturedNews;
type PopupContent = { featured: FeaturedItem[] };

const FALLBACK: PopupContent = { featured: [
  {
    kind: "project",
    title: "S1NAPSE",
    image: "/assets/projects/s1napse-popup.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget,",
  },
  {
    kind: "project",
    title: "ONE BIG MATCH",
    image: "/assets/projects/one-big-match.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget,",
  },
] };

type ProjectsPopupProps = {
  open: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
};

export function ProjectsPopup({
  open,
  onClose,
  zIndex = 40,
  onFocus,
}: ProjectsPopupProps) {
  const { featured } = useLiveContent<PopupContent>("popup", FALLBACK);
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
      className="fixed w-[min(540px,92vw)]"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        zIndex,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div onMouseDown={onTitleMouseDown} className="cursor-move">
        <WindowFrame
          title="PROJECTS (POP UP)"
          titleBarColor="#ff3a3a"
          bodyColor="#fffcd8"
          statusText={`${featured.length} object(s)`}
          onClose={onClose}
          className="max-h-[85vh] h-[640px] sm:h-[720px]"
        >
          <div
            className="cursor-default h-full overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header: FEATURED PROJECTS! + see all projects */}
            <div className="flex items-end justify-between flex-wrap gap-2">
              <p className="text-[#ff3a3a] text-[32px] sm:text-[40px] tracking-[0.8px] leading-none">
                FEATURED PROJECTS!
              </p>
              <Link
                href="/projects"
                className="font-vt323 text-[#ff3a3a] text-[16px] sm:text-[20px] tracking-[0.32px] underline leading-[18px] sm:leading-[20px]"
              >
                see all projects
              </Link>
            </div>

            {/* Dashed red divider */}
            <div
              className="mt-3 h-[4px] w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, #ff3a3a 0 14px, transparent 14px 24px)",
              }}
            />

            {/* Featured rows */}
            <ul className="mt-5 flex flex-col gap-5">
              {featured.map((item, idx) => (
                <li
                  key={`${item.kind}-${idx}-${item.title}`}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start"
                >
                  <div className="w-full sm:w-[56%] aspect-[393/219] overflow-hidden bg-black shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.kind === "news" && (
                      <p className="font-vt323 text-[#ff3a3a] text-[12px] sm:text-[14px] tracking-[0.3px] uppercase leading-none">
                        News · {item.date}
                      </p>
                    )}
                    <p className="mt-1 text-black text-[20px] sm:text-[24px] tracking-[0.48px] leading-[1] break-words">
                      {item.title}
                    </p>
                    <p className="mt-2 text-black font-vt323 text-[14px] sm:text-[16px] tracking-[0.28px] leading-[16px]">
                      {" "}
                      {item.description}
                    </p>
                    {item.kind === "news" && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block font-vt323 text-[#ff3a3a] text-[14px] sm:text-[18px] tracking-[0.28px] underline leading-[16px]"
                      >
                        learn more →
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}
