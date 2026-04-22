"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WindowFrame } from "./WindowFrame";

type Project = {
  title: string;
  image: string;
  description: string;
  details?: string;
  tech?: string[];
};

type ContactsContent = {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
};

type TechItem = { label: string; src: string };

type TerminalModalProps = {
  open: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
  projects: Project[];
  contacts: ContactsContent;
  techItems: TechItem[];
  onOpenProject: (idx: number) => void;
  onOpenContacts: () => void;
  onOpenTechStack: () => void;
};

type Line = { kind: "in" | "out" | "err"; text: string };

type SearchHit =
  | { type: "project"; idx: number; title: string; snippet: string }
  | { type: "tech"; label: string }
  | { type: "contact"; label: string; value: string }
  | { type: "nav"; label: string; target: string };

const HELP_TEXT = [
  "available commands:",
  "  help             show this help",
  "  projects         list all projects",
  "  tech             list tech stack",
  "  contacts         show contact info",
  "  about            go to the about page",
  "  find <query>     search anything",
  "  open <n|name>    open a project by number or name",
  "  clear            clear the terminal",
  "  exit             close terminal",
  "",
  "tip: type anything to search — no command needed.",
];

export function TerminalModal({
  open,
  onClose,
  zIndex = 40,
  onFocus,
  projects,
  contacts,
  techItems,
  onOpenProject,
  onOpenContacts,
  onOpenTechStack,
}: TerminalModalProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "JJ-DOS [Version 1.0.0]" },
    { kind: "out", text: "(c) pardo-portfolio. type 'help' for commands." },
    { kind: "out", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [lastHits, setLastHits] = useState<SearchHit[]>([]);

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

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

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

  const index = useMemo(() => {
    const items: SearchHit[] = [];
    projects.forEach((p, idx) => {
      const snippet = (p.description || "").slice(0, 80);
      items.push({ type: "project", idx, title: p.title, snippet });
    });
    techItems.forEach((t) => items.push({ type: "tech", label: t.label }));
    items.push({ type: "contact", label: "email", value: contacts.email });
    items.push({ type: "contact", label: "phone", value: contacts.phone });
    items.push({ type: "contact", label: "linkedin", value: contacts.linkedin });
    items.push({ type: "contact", label: "github", value: contacts.github });
    items.push({ type: "nav", label: "about", target: "/about" });
    items.push({ type: "nav", label: "projects", target: "/projects" });
    return items;
  }, [projects, techItems, contacts]);

  const write = (out: Line | Line[]) =>
    setLines((prev) => prev.concat(Array.isArray(out) ? out : [out]));

  const searchableText = (hit: SearchHit) => {
    if (hit.type === "project") {
      const p = projects[hit.idx];
      return [
        p.title,
        p.description,
        p.details ?? "",
        (p.tech ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
    }
    if (hit.type === "tech") return hit.label.toLowerCase();
    if (hit.type === "contact")
      return `${hit.label} ${hit.value}`.toLowerCase();
    return `${hit.label} ${hit.target}`.toLowerCase();
  };

  const runSearch = (query: string): SearchHit[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter((hit) => searchableText(hit).includes(q));
  };

  const formatHit = (hit: SearchHit, n: number): string => {
    const prefix = `[${n}]`.padEnd(4, " ");
    if (hit.type === "project")
      return `${prefix} project  ${hit.title}${
        hit.snippet ? `  — ${hit.snippet}…` : ""
      }`;
    if (hit.type === "tech") return `${prefix} tech     ${hit.label}`;
    if (hit.type === "contact")
      return `${prefix} contact  ${hit.label}: ${hit.value}`;
    return `${prefix} nav      ${hit.label}  → ${hit.target}`;
  };

  const openHit = (hit: SearchHit) => {
    if (hit.type === "project") {
      onOpenProject(hit.idx);
      write({ kind: "out", text: `opening project: ${hit.title}…` });
    } else if (hit.type === "tech") {
      onOpenTechStack();
      write({ kind: "out", text: "opening tech stack…" });
    } else if (hit.type === "contact") {
      onOpenContacts();
      write({ kind: "out", text: "opening contacts…" });
    } else if (hit.type === "nav") {
      write({ kind: "out", text: `navigating to ${hit.target}…` });
      window.location.href = hit.target;
    }
  };

  const handleCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    write({ kind: "in", text: `C:\\> ${cmd}` });
    setHistory((h) => [...h, cmd]);
    setHistoryIdx(-1);

    const lower = cmd.toLowerCase();
    const [head, ...rest] = lower.split(/\s+/);
    const arg = rest.join(" ");

    if (head === "help") return write(HELP_TEXT.map((t) => ({ kind: "out", text: t })));
    if (head === "clear") return setLines([]);
    if (head === "exit") return onClose();

    if (head === "projects") {
      if (!projects.length)
        return write({ kind: "out", text: "no projects found." });
      const hits: SearchHit[] = projects.map((p, idx) => ({
        type: "project",
        idx,
        title: p.title,
        snippet: (p.description || "").slice(0, 80),
      }));
      setLastHits(hits);
      return write(
        hits.map((h, i) => ({ kind: "out", text: formatHit(h, i + 1) }))
      );
    }

    if (head === "tech") {
      const hits: SearchHit[] = techItems.map((t) => ({
        type: "tech",
        label: t.label,
      }));
      setLastHits(hits);
      return write(
        hits.map((h, i) => ({ kind: "out", text: formatHit(h, i + 1) }))
      );
    }

    if (head === "contacts") {
      const hits: SearchHit[] = [
        { type: "contact", label: "email", value: contacts.email },
        { type: "contact", label: "phone", value: contacts.phone },
        { type: "contact", label: "linkedin", value: contacts.linkedin },
        { type: "contact", label: "github", value: contacts.github },
      ];
      setLastHits(hits);
      return write(
        hits.map((h, i) => ({ kind: "out", text: formatHit(h, i + 1) }))
      );
    }

    if (head === "about") {
      write({ kind: "out", text: "navigating to /about…" });
      window.location.href = "/about";
      return;
    }

    if (head === "find") {
      if (!arg)
        return write({ kind: "err", text: "usage: find <query>" });
      const hits = runSearch(arg);
      setLastHits(hits);
      if (!hits.length)
        return write({ kind: "out", text: `no matches for "${arg}"` });
      write(
        hits
          .slice(0, 12)
          .map((h, i) => ({ kind: "out", text: formatHit(h, i + 1) }))
      );
      if (hits.length > 12)
        write({ kind: "out", text: `… ${hits.length - 12} more` });
      write({ kind: "out", text: "tip: type 'open <n>' to jump to a result." });
      return;
    }

    if (head === "open") {
      if (!arg)
        return write({ kind: "err", text: "usage: open <n|name>" });
      const asNum = Number.parseInt(arg, 10);
      if (!Number.isNaN(asNum) && lastHits[asNum - 1]) {
        return openHit(lastHits[asNum - 1]);
      }
      const match = projects.findIndex(
        (p) => p.title.toLowerCase() === arg || p.title.toLowerCase().includes(arg)
      );
      if (match !== -1) return openHit({ type: "project", idx: match, title: projects[match].title, snippet: "" });
      return write({ kind: "err", text: `not found: ${arg}` });
    }

    // Fallback: treat as free-text search
    const hits = runSearch(cmd);
    setLastHits(hits);
    if (!hits.length)
      return write({
        kind: "err",
        text: `'${cmd}' is not a command and matched nothing. try 'help'.`,
      });
    write(
      hits
        .slice(0, 12)
        .map((h, i) => ({ kind: "out", text: formatHit(h, i + 1) }))
    );
    if (hits.length > 12)
      write({ kind: "out", text: `… ${hits.length - 12} more` });
    write({ kind: "out", text: "tip: type 'open <n>' to jump to a result." });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const nextIdx =
        historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx] ?? "");
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

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
          title="TERMINAL"
          titleBarColor="#000000"
          bodyColor="#000000"
          statusText="ready"
          onClose={onClose}
          className="h-[440px] sm:h-[520px]"
        >
          <div
            className="cursor-text h-full flex flex-col"
            onMouseDown={(e) => {
              e.stopPropagation();
              inputRef.current?.focus();
            }}
          >
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto font-vt323 text-[#39ff14] text-[16px] sm:text-[18px] leading-[18px] sm:leading-[20px] tracking-[0.2px] whitespace-pre-wrap"
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.kind === "err"
                      ? "text-[#ff3a3a]"
                      : line.kind === "in"
                      ? "text-white"
                      : ""
                  }
                >
                  {line.text || " "}
                </div>
              ))}
            </div>
            <div className="mt-1 flex items-center font-vt323 text-[#39ff14] text-[16px] sm:text-[18px] leading-[18px] sm:leading-[20px]">
              <span className="shrink-0">C:\&gt;&nbsp;</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                className="flex-1 bg-transparent outline-none border-0 font-vt323 text-[#39ff14] caret-[#39ff14]"
              />
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}
