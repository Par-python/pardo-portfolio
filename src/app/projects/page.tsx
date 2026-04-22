"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLiveContent } from "@/lib/useLiveContent";
import { renderRichText } from "@/lib/richText";
import { ContactsModal } from "@/components/ContactsModal";
import { ProjectContextMenu } from "@/components/ProjectContextMenu";
import { ProjectDetailModal } from "@/components/ProjectDetailModal";
import { ProjectPropertiesDialog } from "@/components/ProjectPropertiesDialog";
import { WindowFrame } from "@/components/WindowFrame";

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
type ProjectsContent = { projects: Project[] };

const TECH_ICONS: Record<string, string> = {
  react: "/assets/tech/react.svg",
  tailwind: "/assets/tech/tailwind.svg",
  typescript: "/assets/tech/typescript.svg",
  postgresql: "/assets/tech/postgresql.svg",
  python: "/assets/tech/python.svg",
  firebase: "/assets/tech/firebase.svg",
  git: "/assets/tech/git.svg",
  gcloud: "/assets/tech/gcloud.svg",
  nodejs: "/assets/tech/nodejs.svg",
  java: "/assets/tech/java.svg",
  django: "/assets/tech/django.svg",
};

const FALLBACK: ProjectsContent = { projects: [
  {
    title: "TedX",
    image: "/assets/projects/tedx.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu. Mauris eleifend risus sit amet orci mollis, at iaculis nulla fringilla.",
    tech: ["react", "tailwind", "typescript"],
  },
  {
    title: "S1napse",
    image: "/assets/projects/s1napse.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu. Mauris eleifend risus sit amet orci mollis, at iaculis nulla fringilla.",
    tech: ["react", "typescript", "firebase", "tailwind"],
  },
  {
    title: "S1napse",
    image: "/assets/projects/s1napse-alt.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu. Mauris eleifend risus sit amet orci mollis, at iaculis nulla fringilla.",
    tech: ["python", "django", "postgresql"],
  },
  {
    title: "Sigla",
    image: "/assets/projects/sigla.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu.",
    tech: ["nodejs", "typescript", "gcloud"],
  },
  {
    title: "Sigla",
    image: "",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu.",
    tech: ["java", "git"],
  },
  {
    title: "Sigla",
    image: "",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu.",
    tech: ["react", "tailwind"],
  },
] };

export default function ProjectsPage() {
  const { projects } = useLiveContent<ProjectsContent>("projects", FALLBACK);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; idx: number } | null>(
    null
  );
  const [propsIdx, setPropsIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const longPressRef = useRef<{ timer: number; fired: boolean } | null>(null);
  const activeProject = activeIdx !== null ? projects[activeIdx] ?? null : null;
  const propsProject = propsIdx !== null ? projects[propsIdx] ?? null : null;

  const openContextMenu = (x: number, y: number, idx: number) =>
    setMenu({ x, y, idx });

  const handleContextMenu = (idx: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, idx);
  };

  const handleTouchStart = (idx: number) => (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current.timer);
    }
    longPressRef.current = {
      fired: false,
      timer: window.setTimeout(() => {
        if (longPressRef.current) longPressRef.current.fired = true;
        openContextMenu(x, y, idx);
      }, 500),
    };
  };

  const cancelLongPress = () => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current.timer);
    }
  };

  const flashToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

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
    <main className="min-h-screen w-full bg-white flex flex-col">
      {/* Navbar */}
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
                    className="font-vt323 text-white text-[14px] sm:text-[20px] tracking-[0.48px] underline hover:opacity-80 leading-none whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    type="button"
                    onClick={link.onClick}
                    className="font-vt323 text-white text-[14px] sm:text-[20px] tracking-[0.48px] underline hover:opacity-80 leading-none whitespace-nowrap cursor-pointer bg-transparent border-0 p-0"
                  >
                    {link.label}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Heading + intro */}
      <section className="mx-auto w-full max-w-[1300px] px-3 sm:px-6 pt-6 sm:pt-10">
        <h1 className="anim-proj-heading text-[#000080] text-[clamp(56px,13vw,128px)] tracking-[2.56px] leading-[0.9] whitespace-nowrap">
          Projects
        </h1>
        <p className="anim-proj-intro mt-4 sm:mt-6 font-vt323 text-[16px] sm:text-[22px] tracking-[0.4px] leading-[20px] sm:leading-[28px] max-w-[720px]">
       From AI policy simulators to everyday utilities, these projects reflect my drive to solve real-world problems. Here is a look at how I turn complex data into scalable, user-centric software.
        </p>
      </section>

      {/* Projects grid */}
      <section className="mx-auto w-full max-w-[1300px] px-3 sm:px-6 pt-6 sm:pt-10">
        <ul className="anim-proj-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project, idx) => (
            <li key={`${project.title}-${idx}`}>
              <button
                type="button"
                onClick={() => {
                  if (longPressRef.current?.fired) {
                    longPressRef.current.fired = false;
                    return;
                  }
                  setActiveIdx(idx);
                }}
                onContextMenu={handleContextMenu(idx)}
                onTouchStart={handleTouchStart(idx)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onTouchCancel={cancelLongPress}
                className="block w-full text-left cursor-pointer hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000080]"
                aria-label={`Open ${project.title} details`}
              >
              <WindowFrame
                title={project.title}
                statusText="8 object(s)"
                className="h-[280px] sm:h-[320px] lg:h-[360px]"
              >
                <div className="flex flex-col gap-3 sm:gap-4 h-full min-h-0">
                  <div className="w-full h-[110px] sm:h-[130px] lg:h-[150px] border border-black/20 overflow-hidden bg-[#f4f4f4] shrink-0">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="font-vt323 text-[16px] sm:text-[18px] tracking-[0.32px] leading-[18px] sm:leading-[20px] flex-1 min-h-0 overflow-y-auto">
                    {renderRichText(project.description)}
                  </p>
                  {project.tech && project.tech.length > 0 ? (
                    <ul className="flex flex-wrap gap-2 sm:gap-3 items-center shrink-0">
                      {project.tech.map((key) =>
                        TECH_ICONS[key] ? (
                          <li key={key}>
                            <img
                              src={TECH_ICONS[key]}
                              alt={key}
                              title={key}
                              className="size-[20px] sm:size-[24px] object-contain"
                            />
                          </li>
                        ) : null
                      )}
                    </ul>
                  ) : null}
                </div>
              </WindowFrame>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <ProjectDetailModal
        project={activeProject}
        onClose={() => setActiveIdx(null)}
        techIcons={TECH_ICONS}
      />
      <ContactsModal
        open={contactsOpen}
        onClose={() => setContactsOpen(false)}
      />
      <ProjectPropertiesDialog
        project={propsProject}
        onClose={() => setPropsIdx(null)}
      />
      {menu ? (
        <ProjectContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            {
              label: "Open in new window",
              disabled: !projects[menu.idx]?.link,
              onClick: () => {
                const link = projects[menu.idx]?.link;
                if (link) window.open(link, "_blank", "noopener,noreferrer");
              },
            },
            {
              label: "Properties",
              onClick: () => setPropsIdx(menu.idx),
            },
            {
              label: "Copy link",
              disabled: !projects[menu.idx]?.link,
              onClick: async () => {
                const link = projects[menu.idx]?.link;
                if (!link) return;
                try {
                  await navigator.clipboard.writeText(link);
                  flashToast("Link copied!");
                } catch {
                  flashToast("Copy failed");
                }
              },
            },
          ]}
        />
      ) : null}
      {toast ? (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[210] bg-[#c0c0c0] win-frame-outside px-4 py-2 text-[14px] tracking-[0.28px]"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      {/* Bottom gradient to LinkedIn blue */}
      <section className="relative mt-8 sm:mt-12 w-full">
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
        <p className="anim-proj-footer absolute left-1/2 -translate-x-1/2 bottom-8 sm:bottom-14 font-vt323 text-white text-[18px] sm:text-[28px] tracking-[0.48px] whitespace-nowrap">
          more projects to come!
        </p>
      </section>
    </main>
  );
}
