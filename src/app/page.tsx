import { WindowFrame } from "@/components/WindowFrame";

const navItems = [
  { label: "ABOUT", href: "#about" },
  { label: "PROJECTS", href: "#projects" },
  { label: "CONTACTS", href: "#contacts" },
  { label: "TECH STACK", href: "#tech" },
];

export default function Home() {
  return (
    <main className="h-screen w-full bg-white overflow-hidden flex flex-col">
      {/* Navbar */}
      <div className="relative mx-auto w-full max-w-[1300px] px-6 pt-4 shrink-0">
        <div className="relative h-[56px] w-full bg-[#c0c0c0] win-frame-outside">
          <div className="absolute inset-[6px] bg-[#000080] flex items-center px-2">
            <p className="absolute left-1/2 -translate-x-1/2 text-[#e6e6e6] text-[28px] tracking-[0.72px]">
              JJ
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1300px] px-6 pt-6 pb-3 flex flex-col">
        {/* Top row: [links + HI IM stacked] | [picture spans both] */}
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left column: links on top, HI IM below */}
          <div className="w-[280px] shrink-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <WindowFrame
                title="jj"
                className="w-full h-full"
                statusText="4 object(s)"
              >
                <nav className="flex flex-col gap-3 pt-2">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 hover:opacity-70"
                    >
                      <img
                        src="/assets/folder.png"
                        alt=""
                        className="size-[28px]"
                      />
                      <span className="text-[20px] tracking-[0.48px] underline leading-none">
                        {item.label}
                      </span>
                    </a>
                  ))}
                </nav>
              </WindowFrame>
            </div>
            <p className="text-[clamp(40px,5vw,72px)] tracking-[2px] leading-none mt-3 shrink-0">
              HI IM
            </p>
          </div>

          {/* Right column: picture fills entire left-column height */}
          <div className="flex-1 min-w-0 border-2 border-black overflow-hidden">
            <img
              src="/assets/hero.png"
              alt="JJ at a cafe"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* JJ PARDO spans full width */}
        <p className="text-[clamp(80px,13vw,200px)] text-[#000080] tracking-[2px] leading-none mt-2 whitespace-nowrap shrink-0">
          JJ PARDO!
        </p>

        {/* Description + socials */}
        <div className="mt-3 shrink-0">
          <p className="text-[18px] tracking-[0.48px]">
            a computer science student at{" "}
            <span className="text-[#3168ff]">Ateneo De Manila University</span>
          </p>
          <div className="mt-2 flex gap-4 items-center">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block size-[26px] hover:opacity-80"
            >
              <img
                src="/assets/linkedin.png"
                alt="LinkedIn"
                className="w-full h-full object-contain"
              />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block size-[26px] hover:opacity-80"
            >
              <img
                src="/assets/github.svg"
                alt="GitHub"
                className="w-full h-full object-contain"
              />
            </a>
            <a
              href="mailto:pardojeromeimportant@gmail.com"
              className="block size-[26px] hover:opacity-80"
            >
              <img
                src="/assets/envelope.svg"
                alt="Email"
                className="w-full h-full object-contain"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Nyan cat — bottom-right */}
      <div className="fixed right-0 bottom-0 w-[clamp(140px,18vw,240px)] aspect-square pointer-events-none z-20">
        <img
          src="/assets/nyancat.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    </main>
  );
}
