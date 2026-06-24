"use client";

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

// Curated muted 90's-system palette. Kept small and on-theme so the grid reads
// as varied window chrome, never a rainbow. Navy stays the default elsewhere.
const ACCENTS = [
  "#000080", // navy
  "#1f6f6f", // teal
  "#7a1f3d", // maroon
  "#5a5a18", // olive
  "#4b2e6b", // purple
  "#3a4a63", // slate
] as const;

// Deterministic accent from the title — same project always gets the same
// color, no clashing, no per-render flicker.
export function accentForProject(project: Project): string {
  let hash = 0;
  for (let i = 0; i < project.title.length; i++) {
    hash = (hash * 31 + project.title.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}

type ProjectCardProps = {
  project: Project;
  idx: number;
  techIcons: Record<string, string>;
  featured?: boolean;
  onOpen: (idx: number) => void;
  onContextMenu: (idx: number) => (e: React.MouseEvent) => void;
  onTouchStart: (idx: number) => (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
  onTouchCancel: () => void;
};

export function ProjectCard({
  project,
  idx,
  techIcons,
  featured = false,
  onOpen,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onTouchCancel,
}: ProjectCardProps) {
  const accent = accentForProject(project);
  const tech = (project.tech ?? []).filter((key) => techIcons[key]);

  return (
    <button
      type="button"
      onClick={() => onOpen(idx)}
      onContextMenu={onContextMenu(idx)}
      onTouchStart={onTouchStart(idx)}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchCancel={onTouchCancel}
      aria-label={`Open ${project.title} details`}
      className="group block w-full h-full text-left cursor-pointer transition-transform duration-100 hover:-translate-y-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#000080]"
    >
      <WindowFrame
        title={project.title}
        titleBarColor={accent}
        statusText={project.createdAt ?? "double-click to open"}
        className={
          featured
            ? "h-full min-h-[300px]"
            : "h-full min-h-[300px] sm:h-[320px] lg:h-[360px]"
        }
      >
        <div
          className={
            featured
              ? "flex flex-col md:flex-row gap-3 md:gap-5 h-full min-h-0"
              : "flex flex-col gap-3 sm:gap-4 h-full min-h-0"
          }
        >
          {/* Thumbnail */}
          <div
            className={
              featured
                ? "w-full md:w-[52%] h-[160px] md:h-auto border border-black/20 overflow-hidden bg-[#f4f4f4] shrink-0"
                : "w-full h-[110px] sm:h-[130px] lg:h-[150px] border border-black/20 overflow-hidden bg-[#f4f4f4] shrink-0"
            }
          >
            {project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              />
            ) : null}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-3 min-h-0 flex-1">
            <p
              className={
                featured
                  ? "font-vt323 text-[17px] sm:text-[19px] tracking-[0.32px] leading-[21px] sm:leading-[24px] line-clamp-5 md:line-clamp-none md:flex-1 md:min-h-0 md:overflow-y-auto"
                  : "font-vt323 text-[16px] sm:text-[18px] tracking-[0.32px] leading-[18px] sm:leading-[20px] line-clamp-3 sm:line-clamp-none sm:flex-1 sm:min-h-0 sm:overflow-y-auto"
              }
            >
              {renderRichText(project.description)}
            </p>

            {/* Tech stack row */}
            {tech.length > 0 ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-vt323 text-[12px] sm:text-[13px] tracking-[0.26px] text-black/55 leading-none shrink-0">
                  built with
                </span>
                <span className="h-px flex-1 bg-black/15" />
                <ul className="flex flex-wrap gap-2 sm:gap-2.5 items-center justify-end">
                  {tech.map((key) => (
                    <li key={key}>
                      <img
                        src={techIcons[key]}
                        alt={key}
                        title={key}
                        className="size-[20px] sm:size-[22px] object-contain"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Open cue */}
            <span
              className="font-vt323 text-[14px] sm:text-[16px] tracking-[0.3px] underline leading-none shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
              style={{ color: accent }}
            >
              open →
            </span>
          </div>
        </div>
      </WindowFrame>
    </button>
  );
}
