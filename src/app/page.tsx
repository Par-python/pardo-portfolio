"use client";

import { useEffect, useState } from "react";
import { BootLoader } from "@/components/BootLoader";
import { ContactsModal } from "@/components/ContactsModal";
import { ProjectsPopup } from "@/components/ProjectsPopup";
import { TechStackModal } from "@/components/TechStackModal";
import { WindowFrame } from "@/components/WindowFrame";

type ModalKind = "contacts" | "tech" | "projectsPopup";
const BASE_Z = 40;
const BOOT_KEY = "jjpardo-boot-shown";
const POPUP_SHOWN_KEY = "jjpardo-popup-shown";
const BOOT_HIDE_MS = 2800;
const POPUP_DELAY_MS = 6500;

export default function Home() {
  const [openModals, setOpenModals] = useState<Set<ModalKind>>(new Set());
  const [newsUnlocked, setNewsUnlocked] = useState(false);
  const [zOrder, setZOrder] = useState<Record<ModalKind, number>>({
    contacts: BASE_Z,
    tech: BASE_Z,
    projectsPopup: BASE_Z,
  });

  useEffect(() => {
    if (sessionStorage.getItem(POPUP_SHOWN_KEY)) {
      setNewsUnlocked(true);
      return;
    }
    const bootAlreadyShown = sessionStorage.getItem(BOOT_KEY);
    const delay = bootAlreadyShown
      ? POPUP_DELAY_MS
      : BOOT_HIDE_MS + POPUP_DELAY_MS;
    const t = setTimeout(() => {
      setOpenModals((prev) => new Set(prev).add("projectsPopup"));
      setZOrder((prev) => {
        const others = (Object.keys(prev) as ModalKind[])
          .filter((k) => k !== "projectsPopup")
          .map((k) => prev[k]);
        const maxOther = others.length ? Math.max(...others) : BASE_Z - 1;
        return { ...prev, projectsPopup: maxOther + 1 };
      });
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const bringToFront = (kind: ModalKind) =>
    setZOrder((prev) => {
      const others = (Object.keys(prev) as ModalKind[])
        .filter((k) => k !== kind)
        .map((k) => prev[k]);
      const maxOther = others.length ? Math.max(...others) : BASE_Z - 1;
      if (prev[kind] > maxOther) return prev;
      return { ...prev, [kind]: maxOther + 1 };
    });

  const openModal = (kind: ModalKind) => {
    setOpenModals((prev) => new Set(prev).add(kind));
    bringToFront(kind);
  };
  const closeModal = (kind: ModalKind) =>
    setOpenModals((prev) => {
      const next = new Set(prev);
      next.delete(kind);
      return next;
    });

  const navItems: {
    label: string;
    onClick?: () => void;
    href?: string;
    color?: string;
  }[] = [
    { label: "ABOUT", href: "/about" },
    { label: "PROJECTS", href: "/projects" },
    { label: "CONTACTS", onClick: () => openModal("contacts") },
    { label: "TECH STACK", onClick: () => openModal("tech") },
    ...(newsUnlocked
      ? [
          {
            label: "NEWS",
            onClick: () => openModal("projectsPopup"),
            color: "#ff3a3a",
          },
        ]
      : []),
  ];

  return (
    <>
      <BootLoader />
      <ContactsModal
        open={openModals.has("contacts")}
        onClose={() => closeModal("contacts")}
        zIndex={zOrder.contacts}
        onFocus={() => bringToFront("contacts")}
      />
      <TechStackModal
        open={openModals.has("tech")}
        onClose={() => closeModal("tech")}
        zIndex={zOrder.tech}
        onFocus={() => bringToFront("tech")}
      />
      <ProjectsPopup
        open={openModals.has("projectsPopup")}
        onClose={() => {
          closeModal("projectsPopup");
          setNewsUnlocked(true);
          sessionStorage.setItem(POPUP_SHOWN_KEY, "1");
        }}
        zIndex={zOrder.projectsPopup}
        onFocus={() => bringToFront("projectsPopup")}
      />
      <main className="md:h-screen w-full bg-white md:overflow-hidden flex flex-col">
        {/* Navbar */}
        <div className="anim-navbar relative mx-auto w-full max-w-[1300px] px-3 sm:px-6 pt-3 sm:pt-4 shrink-0">
          <div className="relative h-[40px] sm:h-[56px] w-full bg-[#c0c0c0] win-frame-outside">
            <div className="absolute inset-[6px] bg-[#000080] flex items-center px-2">
              <p className="absolute left-1/2 -translate-x-1/2 text-[#e6e6e6] text-[20px] sm:text-[28px] tracking-[0.72px]">
                JJ
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="md:flex-1 md:min-h-0 mx-auto w-full max-w-[1300px] px-3 sm:px-6 pt-4 sm:pt-6 pb-3 flex flex-col">
          {/* Top row: stacks on mobile, side-by-side on md+ */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 md:flex-1 md:min-h-0">
            {/* Left column: links on top, HI IM below */}
            <div className="w-full md:w-[400px] md:shrink-0 flex flex-col">
              <div className="anim-links md:flex-1 md:min-h-0 h-[240px] md:h-auto">
                <WindowFrame
                  title="jj"
                  className="w-full h-full"
                  statusText="4 object(s)"
                >
                  <nav className="flex flex-col gap-2 sm:gap-4 h-full justify-center items-start">
                    {navItems.map((item) =>
                      item.onClick ? (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.onClick}
                          className="flex items-center gap-3 hover:opacity-70 cursor-pointer text-left"
                        >
                          <img
                            src="/assets/folder.png"
                            alt=""
                            className="size-[24px] sm:size-[28px]"
                          />
                          <span
                            className="text-[18px] sm:text-[20px] tracking-[0.48px] underline leading-none"
                            style={item.color ? { color: item.color } : undefined}
                          >
                            {item.label}
                          </span>
                        </button>
                      ) : (
                        <a
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 hover:opacity-70"
                        >
                          <img
                            src="/assets/folder.png"
                            alt=""
                            className="size-[24px] sm:size-[28px]"
                          />
                          <span
                            className="text-[18px] sm:text-[20px] tracking-[0.48px] underline leading-none"
                            style={item.color ? { color: item.color } : undefined}
                          >
                            {item.label}
                          </span>
                        </a>
                      )
                    )}
                  </nav>
                </WindowFrame>
              </div>
              <p className="anim-hi-im text-[clamp(24px,7vw,52px)] tracking-[2px] leading-none mt-2 sm:mt-3 shrink-0">
                HI IM
              </p>
            </div>

            {/* Right column: picture */}
            <div className="anim-picture md:flex-1 md:min-w-0 border-2 border-black overflow-hidden h-[220px] sm:h-[280px] md:h-auto">
              <img
                src="/assets/hero.png"
                alt="JJ at a cafe"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* JJ PARDO */}
          <p className="anim-jj-pardo text-[clamp(40px,13vw,150px)] text-[#000080] tracking-[2px] leading-none mt-2 whitespace-nowrap shrink-0">
            JJ PARDO!
          </p>

          {/* Description + socials */}
          <div className="mt-3 shrink-0">
            <p className="anim-description text-[14px] sm:text-[18px] tracking-[0.48px]">
              a computer science student at{" "}
              <span className="text-[#3168ff]">
                Ateneo De Manila University
              </span>
            </p>
            <div className="anim-socials mt-2 flex gap-3 sm:gap-4 items-center">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block size-[28px] sm:size-[32px] hover:opacity-80"
              >
                <img
                  src="/assets/linkedin-pixel.svg"
                  alt="LinkedIn"
                  className="!w-full !h-full object-contain [image-rendering:pixelated]"
                  width={32}
                  height={32}
                />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block size-[28px] sm:size-[32px] hover:opacity-80"
              >
                <img
                  src="/assets/github-pixel.svg"
                  alt="GitHub"
                  className="!w-full !h-full object-contain [image-rendering:pixelated]"
                  width={32}
                  height={32}
                />
              </a>
              <a
                href="mailto:pardojeromeimportant@gmail.com"
                className="block size-[28px] sm:size-[32px] hover:opacity-80"
              >
                <img
                  src="/assets/email-pixel.svg"
                  alt="Email"
                  className="!w-full !h-full object-contain [image-rendering:pixelated]"
                  width={32}
                  height={32}
                />
              </a>
            </div>
          </div>
        </div>

        {/* Nyan cat — fixed on desktop, inline at content-end on mobile */}
        <div className="anim-nyan hidden md:block fixed right-0 bottom-0 w-[clamp(120px,18vw,240px)] aspect-square pointer-events-none z-20">
          <img
            src="/assets/nyancat.png"
            alt=""
            className="w-full h-full object-contain -scale-x-100 [image-rendering:pixelated]"
          />
        </div>
        <div className="anim-nyan md:hidden self-end w-[72px] aspect-square pointer-events-none -mt-1 mr-1">
          <img
            src="/assets/nyancat.png"
            alt=""
            className="w-full h-full object-contain -scale-x-100 [image-rendering:pixelated]"
          />
        </div>
      </main>
    </>
  );
}
