"use client";

import { useLiveContent } from "@/lib/useLiveContent";
import { useDraggableWindow } from "@/lib/useDraggableWindow";
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
  { label: "nextjs", src: "/assets/tech/nextjs.svg" },
  { label: "tailwind", src: "/assets/tech/tailwind.svg" },
  { label: "typescript", src: "/assets/tech/typescript.svg" },
  { label: "postgresql", src: "/assets/tech/postgresql.svg" },
  { label: "python", src: "/assets/tech/python.svg" },
  { label: "pandas", src: "/assets/tech/pandas.svg" },
  { label: "scikit-learn", src: "/assets/tech/scikitlearn.svg" },
  { label: "cloudflare", src: "/assets/tech/cloudflare.svg" },
  { label: "git", src: "/assets/tech/git.svg" },
  { label: "gcloud", src: "/assets/tech/gcloud.svg" },
  { label: "nodejs", src: "/assets/tech/nodejs.svg" },
  { label: "java", src: "/assets/tech/java.svg" },
  { label: "django", src: "/assets/tech/django.svg" },
  { label: "rust", src: "/assets/tech/rust.svg" },
  { label: "android", src: "/assets/tech/androidstudio-svgrepo-com.svg" },
  { label: "swift", src: "/assets/tech/swift-svgrepo-com.svg" },
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
  const { pos, windowRef, onTitlePointerDown } = useDraggableWindow({ open });

  if (!open) return null;

  return (
    <div
      ref={windowRef}
      onPointerDownCapture={onFocus}
      className="fixed w-[min(675px,92vw)] max-h-[85vh]"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        zIndex,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div
        onPointerDown={onTitlePointerDown}
        className="cursor-move touch-none h-full"
        style={{ touchAction: "none" }}
      >
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
