"use client";

import { useEffect, useRef, useState } from "react";
import { renderRichText } from "@/lib/richText";
import { WindowFrame } from "./WindowFrame";

type Project = {
  title: string;
  image: string;
  description: string;
  details?: string;
  tech?: string[];
  link?: string;
  createdAt?: string;
  team?: string[];
};

type ProjectDetailModalProps = {
  project: Project | null;
  onClose: () => void;
  techIcons: Record<string, string>;
  zIndex?: number;
  onFocus?: () => void;
};

export function ProjectDetailModal({
  project,
  onClose,
  techIcons,
  zIndex = 40,
  onFocus,
}: ProjectDetailModalProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const open = project !== null;

  useEffect(() => {
    if (open && pos === null && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setPos({
        x: window.innerWidth / 2 - rect.width / 2,
        y: Math.max(24, window.innerHeight / 2 - rect.height / 2),
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

  if (!open || !project) return null;

  return (
    <div
      ref={windowRef}
      onMouseDownCapture={onFocus}
      className="fixed w-[min(720px,92vw)]"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        zIndex,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div onMouseDown={onTitleMouseDown} className="cursor-move">
        <WindowFrame
          title={project.title}
          statusText="1 object(s)"
          onClose={onClose}
          className="max-h-[85vh] h-[640px] sm:h-[680px]"
        >
          <div
            className="cursor-default h-full overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className="text-[#000080] text-[28px] sm:text-[40px] tracking-[0.8px] leading-none">
              {project.title}
            </p>

            <div
              className="mt-2 sm:mt-3 h-[2px] w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, #000080 0 8px, transparent 8px 14px)",
              }}
            />

            {project.image ? (
              <div className="mt-4 w-full aspect-[16/9] border border-black/20 overflow-hidden bg-[#f4f4f4] flex items-center justify-center">
                <img
                  src={project.image}
                  alt={project.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : null}

            <p className="mt-4 font-vt323 text-[18px] sm:text-[22px] tracking-[0.4px] leading-[22px] sm:leading-[26px]">
              {renderRichText(project.description)}
            </p>

            {project.details ? (
              <p className="mt-3 font-vt323 text-[16px] sm:text-[20px] tracking-[0.4px] leading-[20px] sm:leading-[24px] whitespace-pre-line">
                {renderRichText(project.details)}
              </p>
            ) : null}

            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-vt323 text-[#000080] text-[16px] sm:text-[20px] tracking-[0.32px] underline leading-none"
              >
                visit project →
              </a>
            ) : null}

            {project.tech && project.tech.length > 0 ? (
              <div className="mt-5">
                <p className="font-vt323 font-bold text-[16px] sm:text-[20px] tracking-[0.4px]">
                  tech stack:
                </p>
                <ul className="mt-2 flex flex-wrap gap-3 items-center">
                  {project.tech.map((key) =>
                    techIcons[key] ? (
                      <li
                        key={key}
                        className="flex flex-col items-center gap-1"
                      >
                        <img
                          src={techIcons[key]}
                          alt={key}
                          className="size-[28px] sm:size-[36px] object-contain"
                        />
                        <span className="font-vt323 text-[12px] sm:text-[14px] tracking-[0.28px] leading-none">
                          {key}
                        </span>
                      </li>
                    ) : null
                  )}
                </ul>
              </div>
            ) : null}
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}
