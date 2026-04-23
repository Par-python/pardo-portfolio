"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { ContactsModal } from "@/components/ContactsModal";
import { DraggableStickers } from "@/components/DraggableStickers";
import { WindowFrame } from "@/components/WindowFrame";
import { useParallax } from "@/lib/useParallax";
import { renderRichText, stripRichText } from "@/lib/richText";
import { useTypewriter } from "@/lib/useTypewriter";
import { useLiveContent } from "@/lib/useLiveContent";

type AboutContent = {
  images: {
    cafe: string;
    group: string;
    trio: string;
    race: string;
    electronics: string;
  };
  descriptions: {
    block1: string;
    block2: string;
  };
};

const FALLBACK_BLOCK_1 =
  "At my core, I just love creating things, especially when it involves diving into data and interpreting it to uncover meaningful insights. As a software developer and Computer Science student at Ateneo de Manila University, my work is driven by a desire to build practical solutions for the everyday problems I see around me or experience myself. Whether I am engineering an AI-powered urban policy simulator or building a tool to seamlessly organize class schedules, I thrive on turning complex information into intuitive, user-centric experiences. Ultimately, I want to keep bridging the gap between rigorous engineering and thoughtful design to build software that actually makes life a little easier.";

const FALLBACK_BLOCK_2 =
  "My journey into tech started in an unexpected place: Minecraft. I spent hours wiring redstone to build automated sorting systems, functioning vending machines, and virtual banks. That early fascination with logic and automation naturally spilled over into the physical world when I picked up an Arduino kit to build simple hardware circuits. Before long, I was translating that same problem-solving mindset into code. What started as building websites for peer businesses and creating small software tools to fix everyday inconveniences quickly escalated. Today, I am architecting complex, data-driven platforms and AI-integrated applications that tackle high-stakes challenges.";

const ABOUT_FALLBACK: AboutContent = {
  images: {
    cafe: "/assets/about/cafe.png",
    group: "/assets/about/group.png",
    trio: "/assets/about/trio.png",
    race: "/assets/about/race.png",
    electronics: "/assets/about/electronics.png",
  },
  descriptions: { block1: FALLBACK_BLOCK_1, block2: FALLBACK_BLOCK_2 },
};

const AboutContentCtx = createContext<AboutContent>(ABOUT_FALLBACK);

export default function AboutPage() {
  const [contactsOpen, setContactsOpen] = useState(false);
  const aboutContent = useLiveContent<AboutContent>("about", ABOUT_FALLBACK);

  const navLinks: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[] = [
    { label: "ABOUT", href: "/about" },
    { label: "PROJECTS", href: "/projects" },
    { label: "CONTACTS", onClick: () => setContactsOpen(true) },
  ];

  return (
    <AboutContentCtx.Provider value={aboutContent}>
    <main className="relative w-full bg-white overflow-x-hidden isolate">
      <DraggableStickers />
      {/* Navbar (shared pattern with projects page) */}
      <div className="anim-navbar mx-auto w-full max-w-[1300px] px-3 sm:px-6 pt-3 sm:pt-4 shrink-0">
        <div className="relative h-[48px] sm:h-[64px] w-full bg-[#c0c0c0] win-frame-outside">
          <div className="absolute inset-[6px] bg-[#000080] flex items-center px-3 sm:px-4 gap-3">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 leading-none"
              aria-label="Home"
            >
              <img
                src="/assets/folder.png"
                alt=""
                className="size-[20px] sm:size-[28px] shrink-0"
              />
              <span className="text-[#e6e6e6] text-[20px] sm:text-[28px] tracking-[0.72px] leading-none">
                JJ
              </span>
            </Link>
            <nav className="ml-auto flex gap-3 sm:gap-6 items-center">
              {navLinks.map((link) =>
                link.href ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="font-vt323 text-white text-[14px] sm:text-[20px] tracking-[0.48px] underline hover:opacity-80 leading-none whitespace-nowrap py-2"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    type="button"
                    onClick={link.onClick}
                    className="font-vt323 text-white text-[14px] sm:text-[20px] tracking-[0.48px] underline hover:opacity-80 leading-none whitespace-nowrap cursor-pointer bg-transparent border-0 py-2"
                  >
                    {link.label}
                  </button>
                )
              )}
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

      <ContactsModal
        open={contactsOpen}
        onClose={() => setContactsOpen(false)}
      />
    </main>
    </AboutContentCtx.Provider>
  );
}

function TypewriterText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  // Typewriter types the stripped (plain) text; once done, swap to rich JSX.
  const plain = stripRichText(text);
  const { ref, display, done } = useTypewriter(plain, { speedMs: 6 });
  return (
    <p
      ref={ref as React.RefObject<HTMLParagraphElement>}
      className={`whitespace-pre-line ${className}`}
    >
      {done ? renderRichText(text) : display}
      {!done && <span className="anim-cursor-blink">_</span>}
    </p>
  );
}

function ParallaxBlock({
  speed,
  children,
  className,
  style,
}: {
  speed: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, offset } = useParallax(speed);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: `translateY(${offset}px)`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================================
 * Desktop: pixel-perfect match to Figma (1440 × 2564 canvas)
 * Uses absolute positioning relative to a navbar-offset origin.
 * Figma offsets reference top=303 (heading), navbar ends ~200. We subtract
 * our own navbar height (~80) to re-anchor. Only visible on md+.
 * ========================================================================= */
function DesktopLayout() {
  const about = useContext(AboutContentCtx);
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
            <div className="h-full">
              <TypewriterText
                text={about.descriptions.block1}
                className="font-vt323 text-[22px] tracking-[0.4px] leading-[24px]"
              />
            </div>
          </WindowFrame>
        </div>

        {/* Right cafe photo frame */}
        <ParallaxBlock
          speed={0.03}
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
                src={about.images.cafe}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </ParallaxBlock>

        {/* Row 2: wide group photo frame */}
        <ParallaxBlock
          speed={-0.06}
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
                src={about.images.group}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </ParallaxBlock>

        {/* Row 2 right: trio photo frame */}
        <ParallaxBlock
          speed={0.04}
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
                src={about.images.trio}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </ParallaxBlock>

        {/* Row 3: race photo left */}
        <ParallaxBlock
          speed={-0.08}
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
                src={about.images.race}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </ParallaxBlock>

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
              <TypewriterText
                text={about.descriptions.block2}
                className="font-vt323 text-[22px] tracking-[0.4px] leading-[24px]"
              />
            </div>
          </WindowFrame>
        </div>

        {/* Row 3 right bottom: electronics photo */}
        <ParallaxBlock
          speed={0.07}
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
                src={about.images.electronics}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </WindowFrame>
        </ParallaxBlock>
      </div>
    </div>
  );
}

/* =========================================================================
 * Responsive fallback: stacked grid for mobile/tablet (<md)
 * ========================================================================= */
function ResponsiveLayout() {
  const about = useContext(AboutContentCtx);
  const blocks: { type: "text" | "image"; src?: string }[] = [
    { type: "text" },
    { type: "image", src: about.images.cafe },
    { type: "image", src: about.images.group },
    { type: "image", src: about.images.trio },
    { type: "image", src: about.images.race },
    { type: "text" },
    { type: "image", src: about.images.electronics },
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
              className={
                block.type === "image" ? "h-[280px] sm:h-[340px]" : "min-h-[180px]"
              }
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
                <div className="flex flex-col gap-4">
                  <TypewriterText
                    text={
                      idx === 0
                        ? about.descriptions.block1
                        : about.descriptions.block2
                    }
                    className="font-vt323 text-[16px] sm:text-[20px] tracking-[0.32px] leading-[18px] sm:leading-[22px]"
                  />
                </div>
              )}
            </WindowFrame>
          </li>
        ))}
      </ul>
    </div>
  );
}
