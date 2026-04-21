"use client";

import Link from "next/link";
import { WindowFrame } from "@/components/WindowFrame";

type Project = {
  title: string;
  image: string;
  description: string;
};

const projects: Project[] = [
  {
    title: "TedX",
    image: "/assets/projects/tedx.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu. Mauris eleifend risus sit amet orci mollis, at iaculis nulla fringilla.",
  },
  {
    title: "S1napse",
    image: "/assets/projects/s1napse.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu. Mauris eleifend risus sit amet orci mollis, at iaculis nulla fringilla.",
  },
  {
    title: "S1napse",
    image: "/assets/projects/s1napse-alt.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu. Mauris eleifend risus sit amet orci mollis, at iaculis nulla fringilla.",
  },
  {
    title: "Sigla",
    image: "/assets/projects/sigla.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu.",
  },
  {
    title: "Sigla",
    image: "",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu.",
  },
  {
    title: "Sigla",
    image: "",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus mi, mattis quis rutrum eget, mattis mattis arcu.",
  },
];

const navLinks: { label: string; href: string }[] = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/#about" },
  { label: "PROJECTS", href: "/projects" },
  { label: "CONTACTS", href: "/?modal=contacts" },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col">
      {/* Navbar */}
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

      {/* Heading + intro */}
      <section className="mx-auto w-full max-w-[1300px] px-3 sm:px-6 pt-6 sm:pt-10">
        <h1 className="anim-proj-heading text-[#000080] text-[clamp(56px,13vw,128px)] tracking-[2.56px] leading-[0.9] whitespace-nowrap">
          Projects
        </h1>
        <p className="anim-proj-intro mt-4 sm:mt-6 text-[14px] sm:text-[20px] tracking-[0.4px] leading-[20px] sm:leading-[28px] max-w-[720px]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla risus
          mi, mattis quis rutrum eget, mattis mattis arcu. Mauris eleifend risus
          sit amet orci mollis, at iaculis nulla fringilla.
        </p>
      </section>

      {/* Projects grid */}
      <section className="mx-auto w-full max-w-[1300px] px-3 sm:px-6 pt-6 sm:pt-10">
        <ul className="anim-proj-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project, idx) => (
            <li key={`${project.title}-${idx}`}>
              <WindowFrame
                title={project.title}
                statusText="8 object(s)"
                className="h-[340px] sm:h-[400px] lg:h-[460px]"
              >
                <div className="flex flex-col gap-4 h-full">
                  <div className="w-full aspect-[380/241] border border-black/20 overflow-hidden bg-[#f4f4f4]">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="text-[14px] sm:text-[16px] tracking-[0.32px] leading-[18px] sm:leading-[20px]">
                    {project.description}
                  </p>
                </div>
              </WindowFrame>
            </li>
          ))}
        </ul>
      </section>

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
        <p className="anim-proj-footer absolute left-1/2 -translate-x-1/2 bottom-8 sm:bottom-14 text-white text-[16px] sm:text-[24px] tracking-[0.48px] whitespace-nowrap">
          more projects to come!
        </p>
      </section>
    </main>
  );
}
