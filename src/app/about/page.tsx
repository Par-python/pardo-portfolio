"use client";

import Link from "next/link";
import { WindowFrame } from "@/components/WindowFrame";

const navLinks: { label: string; href: string }[] = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "PROJECTS", href: "/projects" },
  { label: "CONTACTS", href: "/?modal=contacts" },
];

export default function AboutPage() {
  return (
    <main className="relative w-full bg-white overflow-x-hidden isolate">
      {/* Navbar (shared pattern with projects page) */}
      <div className="anim-navbar mx-auto w-full max-w-[1300px] px-3 sm:px-6 pt-3 sm:pt-4 shrink-0">
        <div className="relative h-[48px] sm:h-[64px] w-full bg-[#c0c0c0] win-frame-outside">
          <div className="absolute inset-[6px] bg-[#000080] flex items-center px-3 sm:px-4 gap-3">
            <img
              src="/assets/folder.png"
              alt=""
              className="size-[20px] sm:size-[28px] shrink-0"
            />
            <p className="text-[#e6e6e6] text-[20px] sm:text-[28px] tracking-[0.72px] leading-none">
              JJ
            </p>
            <nav className="ml-auto flex gap-3 sm:gap-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white text-[12px] sm:text-[18px] tracking-[0.48px] underline hover:opacity-80 leading-none whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* DESKTOP: pixel-perfect 1440×2564 absolute canvas */}
      <DesktopLayout />

      {/* MOBILE/TABLET: responsive stacked fallback */}
      <ResponsiveLayout />

      {/* Bottom gradient to LinkedIn blue — normal flow, after content */}
      <section className="relative w-full pointer-events-none z-0">
        <div
          className="w-full h-[320px] sm:h-[480px] lg:h-[640px]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(217,217,217,0) 0%, #0a66c2 69%)",
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "url(/assets/projects/linear-gradient.svg)",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "top",
              backgroundSize: "auto 100%",
            }}
          />
        </div>
      </section>
    </main>
  );
}

/* =========================================================================
 * Desktop: pixel-perfect match to Figma (1440 × 2564 canvas)
 * Uses absolute positioning relative to a navbar-offset origin.
 * Figma offsets reference top=303 (heading), navbar ends ~200. We subtract
 * our own navbar height (~80) to re-anchor. Only visible on md+.
 * ========================================================================= */
function DesktopLayout() {
  return (
    <div className="hidden md:block relative z-10">
      <div
        className="relative mx-auto"
        style={{ width: 1440, height: 1860 }}
      >
        {/* Who is JJ? heading — Figma left:141, top:303 (shifted for new navbar) */}
        <p
          className="anim-proj-heading absolute text-[#000080]"
          style={{
            left: 141,
            top: 160,
            fontSize: 128,
            lineHeight: 1,
            letterSpacing: "2.56px",
          }}
        >
          Who is JJ?
        </p>

        {/* Row 1: left text window + right cafe photo */}
        <div
          className="anim-proj-grid absolute"
          style={{ left: 141, top: 295, width: 615, height: 380 }}
        >
          <WindowFrame
            title="S1napse"
            statusText="8 object(s)"
            className="h-full w-full"
          >
            <div className="flex flex-col gap-6 h-full">
              <p className="text-[20px] tracking-[0.4px] leading-[20px]">
                <span className="font-bold">
                  {" "}
                  Lorem ipsum dolor sit amet,
                </span>
                <span>
                  {" "}
                  consectetur adipiscing elit. Nulla risus mi, mattis quis
                  rutrum eget, mattis mattis arcu. Mauris eleifend risus sit
                  amet orci mollis, at iaculis nulla fringilla.{" "}
                </span>
              </p>
              <p className="text-[20px] tracking-[0.4px] leading-[20px]">
                <span>
                  {" "}
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                  risus mi, mattis quis rutrum eget, mattis mattis arcu.{" "}
                </span>
                <span className="font-bold">Mauris eleifend risus </span>
                <span>sit amet orci mollis, at iaculis nulla fringilla. </span>
              </p>
            </div>
          </WindowFrame>
        </div>

        {/* Right cafe photo frame */}
        <div
          className="anim-proj-grid absolute"
          style={{ left: 775, top: 295, width: 536, height: 500 }}
        >
          <WindowFrame
            title="S1napse"
            statusText="8 object(s)"
            className="h-full w-full"
          >
            <div className="w-full h-full overflow-hidden">
              <img
                src="/assets/about/cafe.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </div>

        {/* Row 2: wide group photo frame */}
        <div
          className="anim-proj-grid absolute"
          style={{ left: 145, top: 700, width: 606, height: 400 }}
        >
          <WindowFrame
            title="S1napse"
            statusText="8 object(s)"
            className="h-full w-full"
          >
            <div className="w-full h-full overflow-hidden">
              <img
                src="/assets/about/group.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </div>

        {/* Row 2 right: trio photo frame */}
        <div
          className="anim-proj-grid absolute"
          style={{ left: 783, top: 820, width: 528, height: 280 }}
        >
          <WindowFrame
            title="S1napse"
            statusText="8 object(s)"
            className="h-full w-full"
          >
            <div className="w-full h-full overflow-hidden">
              <img
                src="/assets/about/trio.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </div>

        {/* Row 3: race photo left */}
        <div
          className="anim-proj-grid absolute"
          style={{ left: 145, top: 1130, width: 421, height: 706 }}
        >
          <WindowFrame
            title="S1napse"
            statusText="8 object(s)"
            className="h-full w-full"
          >
            <div className="w-full h-full overflow-hidden">
              <img
                src="/assets/about/race.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </div>

        {/* Row 3 right top: text window */}
        <div
          className="anim-proj-grid absolute"
          style={{ left: 587, top: 1130, width: 720, height: 300 }}
        >
          <WindowFrame
            title="S1napse"
            statusText="8 object(s)"
            className="h-full w-full"
          >
            <div className="flex flex-col h-full justify-center">
              <p className="text-[20px] tracking-[0.4px] leading-[20px]">
                <span className="font-bold">
                  {" "}
                  Lorem ipsum dolor sit amet,
                </span>
                <span>
                  {" "}
                  consectetur adipiscing elit. Nulla risus mi, mattis quis
                  rutrum eget, mattis mattis arcu. Mauris eleifend risus sit
                  amet orci mollis, at iaculis nulla fringilla.{" "}
                </span>
              </p>
              <p className="mt-6 text-[20px] tracking-[0.4px] leading-[20px]">
                <span>
                  {" "}
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                  risus mi, mattis quis rutrum eget, mattis mattis arcu.{" "}
                </span>
                <span className="font-bold">Mauris eleifend risus </span>
                <span>sit amet orci mollis, at iaculis nulla fringilla. </span>
              </p>
            </div>
          </WindowFrame>
        </div>

        {/* Row 3 right bottom: electronics photo */}
        <div
          className="anim-proj-grid absolute"
          style={{ left: 587, top: 1460, width: 720, height: 375 }}
        >
          <WindowFrame
            title="S1napse"
            statusText="8 object(s)"
            className="h-full w-full"
          >
            <div className="w-full h-full overflow-hidden">
              <img
                src="/assets/about/electronics.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * Responsive fallback: stacked grid for mobile/tablet (<md)
 * ========================================================================= */
function ResponsiveLayout() {
  const blocks: { type: "text" | "image"; src?: string }[] = [
    { type: "text" },
    { type: "image", src: "/assets/about/cafe.png" },
    { type: "image", src: "/assets/about/group.png" },
    { type: "image", src: "/assets/about/trio.png" },
    { type: "image", src: "/assets/about/race.png" },
    { type: "text" },
    { type: "image", src: "/assets/about/electronics.png" },
  ];

  return (
    <div className="md:hidden mx-auto w-full max-w-[720px] px-3 pt-6">
      <h1 className="anim-proj-heading text-[#000080] text-[clamp(56px,13vw,128px)] tracking-[2.56px] leading-[0.9]">
        Who is JJ?
      </h1>
      <ul className="anim-proj-grid mt-6 grid grid-cols-1 gap-4">
        {blocks.map((block, idx) => (
          <li key={idx}>
            <WindowFrame
              title="S1napse"
              statusText="8 object(s)"
              className="h-[280px] sm:h-[340px]"
            >
              {block.type === "image" ? (
                <div className="w-full h-full overflow-hidden">
                  <img
                    src={block.src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4 h-full">
                  <p className="text-[14px] sm:text-[16px] tracking-[0.32px] leading-[18px] sm:leading-[20px]">
                    <span className="font-bold">
                      {" "}
                      Lorem ipsum dolor sit amet,
                    </span>
                    <span>
                      {" "}
                      consectetur adipiscing elit. Nulla risus mi, mattis quis
                      rutrum eget, mattis mattis arcu. Mauris eleifend risus
                      sit amet orci mollis, at iaculis nulla fringilla.
                    </span>
                  </p>
                </div>
              )}
            </WindowFrame>
          </li>
        ))}
      </ul>
    </div>
  );
}
