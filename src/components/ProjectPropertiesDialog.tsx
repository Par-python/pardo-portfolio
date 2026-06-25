"use client";

import { useEffect, useRef, useState } from "react";
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

type Props = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectPropertiesDialog({ project, onClose }: Props) {
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

  const rows: { label: string; value: string }[] = [
    { label: "Title", value: project.title },
  ];
  if (project.createdAt) rows.push({ label: "Created", value: project.createdAt });
  if (project.team && project.team.length > 0)
    rows.push({ label: "Team", value: project.team.join(", ") });
  if (project.tech && project.tech.length > 0)
    rows.push({ label: "Tech stack", value: project.tech.join(", ") });
  if (project.link) rows.push({ label: "Link", value: project.link });

  return (
    <div
      ref={windowRef}
      className="fixed w-[min(440px,92vw)] z-[150]"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div onMouseDown={onTitleMouseDown} className="cursor-move">
        <WindowFrame
          title={`${project.title} — Properties`}
          statusText="1 object(s)"
          onClose={onClose}
        >
          <div
            className="cursor-default"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col gap-2">
              {rows.map((row) => (
                <li
                  key={row.label}
                  className="flex flex-col sm:flex-row sm:gap-3"
                >
                  <span className="shrink-0 w-[96px] font-[family-name:var(--font-body)] font-bold text-[16px] sm:text-[18px] tracking-[0.32px] leading-[20px]">
                    {row.label}:
                  </span>
                  <span className="flex-1 font-[family-name:var(--font-body)] text-[16px] sm:text-[18px] tracking-[0.32px] leading-[20px] break-words">
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1 bg-[var(--surface)] win-frame-outside text-[14px] tracking-[0.28px] cursor-pointer"
              >
                ok
              </button>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}
