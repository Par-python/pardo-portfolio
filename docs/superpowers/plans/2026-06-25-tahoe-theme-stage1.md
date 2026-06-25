# Tahoe Dark Theme — Stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a theme toggle that flips the site between the signature 90's-Windows look and a macOS "Tahoe" dark look, with the foundation (CSS-variable token system, provider, no-flash script, toggle) and the projects page fully converted.

**Architecture:** Two complete CSS-variable token sets in `globals.css` selected by `data-theme` on `<html>`. A client `ThemeProvider` + `useTheme` hook manage/persist the choice; a blocking inline script prevents flash-of-wrong-theme. The shared `.win-frame-*` classes route through tokens (restyling all frames on flip); the projects-page components have their hardcoded `#000080`/`#c0c0c0`/font classes converted to `var(--token)`.

**Tech Stack:** Next.js (App Router, React Compiler), React (context/hooks), Tailwind v4 (`@theme inline` in `globals.css`), TypeScript. **No unit-test runner** — verification is `npx tsc --noEmit`, `npx eslint`, `npm run build`, and manual visual checks.

## Global Constraints

- **No new Next.js API.** Per `AGENTS.md`, read `node_modules/next/dist/docs/` before any Next.js API not already used. This plan uses only React context/hooks, `localStorage`, `dangerouslySetInnerHTML` for an inline script (a standard React feature, not a Next API), and existing patterns. No new Next API.
- **Verification gates per task (no test framework):** `npx tsc --noEmit` (exit 0) and `npx eslint <touched files>` (no errors). The final task runs `npm run build` (must succeed). Visual checks against `npm run dev` → http://localhost:3000/projects, described per task.
- **Theme values (verbatim — win95):** `--surface:#c0c0c0`, `--surface-raised:#dfdfdf`, `--text:#000000`, `--text-muted:#3f3f3f`, `--accent:#000080`, `--accent-text:#ffffff`, `--link:#3168ff`, `--border:#808080`, `--radius:0px`, `--page-bg:#ffffff`, `--backdrop:none`, `--font-ui:var(--font-pixelify), "Pixelify Sans", monospace`, `--font-body:var(--font-vt323), monospace`.
- **Theme values (verbatim — tahoe):** `--surface:rgba(28,28,30,0.72)`, `--surface-raised:rgba(44,44,46,0.72)`, `--text:#f5f5f7`, `--text-muted:rgba(235,235,245,0.6)`, `--accent:#0a84ff`, `--accent-text:#ffffff`, `--link:#0a84ff`, `--border:rgba(255,255,255,0.12)`, `--radius:14px`, `--page-bg:#1c1c1e`, `--backdrop:blur(20px) saturate(180%)`, `--font-ui:-apple-system, "SF Pro Text", system-ui, sans-serif`, `--font-body` same as `--font-ui`.
- **Default theme:** `"win95"`. Persist in `localStorage["theme"]`. `<html>` carries default `data-theme="win95"`.
- **Theme type (verbatim):** `type Theme = "win95" | "tahoe";`
- **Tahoe accent override:** the per-project hashed title-bar color stays inline; Tahoe overrides via `[data-theme="tahoe"] .win-titlebar { background: var(--accent) !important; }`. The `WindowFrame` title bar gets a stable `win-titlebar` class.
- **Aesthetic guardrails:** no new color literals introduced in components — components reference tokens. The token values themselves are the only place colors live.

---

### Task 1: Token system + frame classes in `globals.css`

Define both theme token sets and route `body` + `.win-frame-*` through them. After this task the page still looks identical in win95 (default), but the plumbing exists.

**Files:**
- Modify: `src/app/globals.css` (the `:root` / `@theme inline` / `body` / `.win-frame-*` blocks at the top, lines 1-46)

**Interfaces:**
- Produces: CSS custom properties listed in Global Constraints, available under `:root,[data-theme="win95"]` and `[data-theme="tahoe"]`; reworked `.win-frame-outside` / `.win-frame-inside`; a smooth-motion override hook for Tahoe.

- [ ] **Step 1: Replace the top token + frame blocks.**

In `src/app/globals.css`, replace the block from `:root {` (line 3) through the end of the `.win-frame-inside { ... }` rule (line 46) with:

```css
:root,
[data-theme="win95"] {
  --background: #ffffff;
  --foreground: #000000;
  --navy: #000080;
  --win-grey: #c0c0c0;
  --win-grey-dark: #808080;
  --win-grey-light: #dfdfdf;
  --win-shadow: #7f7f7f;
  --win-link: #3168ff;

  /* semantic theme tokens */
  --surface: #c0c0c0;
  --surface-raised: #dfdfdf;
  --text: #000000;
  --text-muted: #3f3f3f;
  --accent: #000080;
  --accent-text: #ffffff;
  --link: #3168ff;
  --border: #808080;
  --radius: 0px;
  --page-bg: #ffffff;
  --backdrop: none;
  --font-ui: var(--font-pixelify), "Pixelify Sans", monospace;
  --font-body: var(--font-vt323), monospace;
  --frame-shadow-outside:
    inset -1px -1px 0 0 #000,
    inset 1px 1px 0 0 #fff,
    inset -2px -2px 0 0 #7f7f7f,
    inset 2px 2px 0 0 #dfdfdf;
  --frame-shadow-inside:
    inset -1px -1px 0 0 #fff,
    inset 1px 1px 0 0 #808080,
    inset -2px -2px 0 0 #c1c1c1,
    inset 2px 2px 0 0 #000;
}

[data-theme="tahoe"] {
  --surface: rgba(28, 28, 30, 0.72);
  --surface-raised: rgba(44, 44, 46, 0.72);
  --text: #f5f5f7;
  --text-muted: rgba(235, 235, 245, 0.6);
  --accent: #0a84ff;
  --accent-text: #ffffff;
  --link: #0a84ff;
  --border: rgba(255, 255, 255, 0.12);
  --radius: 14px;
  --page-bg: #1c1c1e;
  --backdrop: blur(20px) saturate(180%);
  --font-ui: -apple-system, "SF Pro Text", system-ui, sans-serif;
  --font-body: -apple-system, "SF Pro Text", system-ui, sans-serif;
  --frame-shadow-outside:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.1);
  --frame-shadow-inside: inset 0 0 0 0.5px rgba(255, 255, 255, 0.06);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-navy: var(--navy);
  --color-win-grey: var(--win-grey);
  --color-win-grey-dark: var(--win-grey-dark);
  --color-win-grey-light: var(--win-grey-light);
  --color-win-link: var(--win-link);
  --font-pixelify: var(--font-pixelify);
  --font-vt323: var(--font-vt323);
}

body {
  background: var(--page-bg);
  color: var(--text);
  font-family: var(--font-ui);
  transition: background-color 200ms ease, color 200ms ease;
}

.win-frame-outside {
  box-shadow: var(--frame-shadow-outside);
  border-radius: var(--radius);
  backdrop-filter: var(--backdrop);
}

.win-frame-inside {
  box-shadow: var(--frame-shadow-inside);
  border-radius: var(--radius);
}

[data-theme="tahoe"] .win-titlebar {
  background: var(--accent) !important;
}
```

- [ ] **Step 2: Add a Tahoe smooth-motion override** (after the existing `.anim-proj-grid` rules, anywhere later in the file):

```css
/* Tahoe swaps the chunky stepped entrance for smooth easing */
[data-theme="tahoe"] .anim-proj-heading,
[data-theme="tahoe"] .anim-proj-intro,
[data-theme="tahoe"] .anim-proj-grid > *,
[data-theme="tahoe"] .anim-proj-footer,
[data-theme="tahoe"] .anim-navbar {
  animation-timing-function: ease-out !important;
}
```

- [ ] **Step 3: Build to confirm CSS is valid.**

Run: `npm run build`
Expected: completes successfully. (No visual change yet — default is win95 and the token values equal the old hardcoded ones.)

- [ ] **Step 4: Commit.**

```bash
git add src/app/globals.css
git commit -m "feat: CSS-variable token system for win95 + tahoe themes"
```

---

### Task 2: `ThemeProvider`, `useTheme`, and no-flash script in layout

Add the React context provider + hook, wrap the app, and inject the blocking inline script + default `data-theme`.

**Files:**
- Create: `src/components/theme/ThemeProvider.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces:
  ```ts
  type Theme = "win95" | "tahoe";
  // from "@/components/theme/ThemeProvider"
  export function ThemeProvider(props: { children: React.ReactNode }): JSX.Element;
  export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };
  ```

- [ ] **Step 1: Create the provider + hook.**

Create `src/components/theme/ThemeProvider.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "win95" | "tahoe";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "win95";
  const stored = window.localStorage.getItem("theme");
  return stored === "tahoe" ? "tahoe" : "win95";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("win95");

  // Sync from storage on mount (the inline script already set the attribute
  // pre-paint; this aligns React state with it).
  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", t);
      document.documentElement.dataset.theme = t;
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "win95" ? "tahoe" : "win95");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

- [ ] **Step 2: Wire layout — default attribute, inline script, provider wrap.**

In `src/app/layout.tsx`:

Add the import near the top (after the `TipsShell` import):
```tsx
import { ThemeProvider } from "@/components/theme/ThemeProvider";
```

Change the `<html>` tag to carry the default theme attribute:
```tsx
    <html
      lang="en"
      data-theme="win95"
      className={`${pixelifySans.variable} ${vt323.variable} h-full antialiased`}
    >
```

Add the blocking no-flash script as the first child of `<html>`, before `<body>`:
```tsx
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='tahoe'?'tahoe':'win95';}catch(e){}})();",
          }}
        />
      </head>
```

Wrap the body children with the provider:
```tsx
      <body className="min-h-full font-pixelify bg-white text-black">
        <ThemeProvider>
          {children}
          <TipsShell />
        </ThemeProvider>
      </body>
```

(Note: the `bg-white text-black` on `<body>` is now overridden by `globals.css`'s `body { background: var(--page-bg); color: var(--text); }` — leaving the classes is harmless but redundant; remove them to avoid confusion: change to `className="min-h-full"`.)

Apply that cleanup:
```tsx
      <body className="min-h-full">
```

- [ ] **Step 3: Typecheck + lint.**

Run: `npx tsc --noEmit`
Expected: exit 0.
Run: `npx eslint src/components/theme/ThemeProvider.tsx src/app/layout.tsx`
Expected: no errors.

- [ ] **Step 4: Commit.**

```bash
git add src/components/theme/ThemeProvider.tsx src/app/layout.tsx
git commit -m "feat: ThemeProvider, useTheme, and no-flash theme script"
```

---

### Task 3: `ThemeToggle` component + place it in the projects navbar

A theme-aware toggle button that calls `useTheme().toggle`, added to the projects-page navbar.

**Files:**
- Create: `src/components/theme/ThemeToggle.tsx`
- Modify: `src/app/projects/page.tsx` (import + render in the `<nav>` block)

**Interfaces:**
- Consumes: `useTheme` from `@/components/theme/ThemeProvider` (Task 2).
- Produces: `export function ThemeToggle(): JSX.Element;`

- [ ] **Step 1: Create the toggle.**

Create `src/components/theme/ThemeToggle.tsx`:

```tsx
"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isTahoe = theme === "tahoe";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isTahoe ? "Windows 95" : "Tahoe"} theme`}
      title={`Switch to ${isTahoe ? "Windows 95" : "Tahoe"} theme`}
      className="flex items-center gap-2 px-2 sm:px-3 py-1 leading-none cursor-pointer bg-[var(--surface)] win-frame-outside text-[var(--text)] font-[family-name:var(--font-body)] text-[14px] sm:text-[16px] tracking-[0.3px]"
    >
      <span aria-hidden>{isTahoe ? "☾" : "☀"}</span>
      <span className="hidden sm:inline whitespace-nowrap">
        {isTahoe ? "Tahoe" : "Win95"}
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Add it to the projects navbar.**

In `src/app/projects/page.tsx`, add the import after the other component imports:
```tsx
import { ThemeToggle } from "@/components/theme/ThemeToggle";
```

In the navbar `<nav className="ml-auto flex gap-3 sm:gap-6 items-center">` block, add the toggle as the LAST child, after the `navLinks.map(...)` expression closes (right before `</nav>`):
```tsx
              <ThemeToggle />
```

- [ ] **Step 3: Typecheck + lint.**

Run: `npx tsc --noEmit`
Expected: exit 0.
Run: `npx eslint src/components/theme/ThemeToggle.tsx src/app/projects/page.tsx`
Expected: no errors.

- [ ] **Step 4: Visual check (toggle works, FOUC handled).**

Run `npm run dev`, open http://localhost:3000/projects.
- A toggle (`☀ Win95`) appears at the right end of the navbar.
- Click it → label flips to `☾ Tahoe`; the page frames pick up the Tahoe shadow/radius/backdrop (rounded, soft shadow), body background goes dark. (Inline colors not yet converted — that's Tasks 4-5; some text/areas will still be navy/grey. That's expected mid-stage.)
- Reload → stays on the last chosen theme, with no flash of the other theme first.

- [ ] **Step 5: Commit.**

```bash
git add src/components/theme/ThemeToggle.tsx src/app/projects/page.tsx
git commit -m "feat: theme toggle in projects navbar"
```

---

### Task 4: Tokenize `WindowFrame` (+ `win-titlebar` class)

Convert the shared window frame's hardcoded colors/fonts to tokens and add the `win-titlebar` class the Tahoe accent override targets. This restyles every window/card title bar.

**Files:**
- Modify: `src/components/WindowFrame.tsx`

**Interfaces:**
- Consumes: tokens from Task 1; `win-titlebar` override from Task 1.
- Produces: a `win-titlebar` class on the title-bar div; tokenized frame.

- [ ] **Step 1: Tokenize the frame body + statusbar.**

In `src/components/WindowFrame.tsx`, the outer wrapper currently uses `bg-[#c0c0c0]`. Change every `bg-[#c0c0c0]` in this file to `bg-[var(--surface)]`, and the default `bodyColor`/`titleBarColor` handling stays (those are inline styles passed by callers). Specifically:
- Outer container `className`: `bg-[#c0c0c0]` → `bg-[var(--surface)]`.
- `Statusbar` container `bg-[#c0c0c0]` → `bg-[var(--surface)]`; its text `text-black` → `text-[var(--text)]`.
- `WindowButton` `bg-[#c0c0c0]` → `bg-[var(--surface)]`; its glyphs `bg-black` / `text-black` / `border-black` → `bg-[var(--text)]` / `text-[var(--text)]` / `border-[var(--text)]`.

- [ ] **Step 2: Add `win-titlebar` class + tokenize titlebar text.**

In the `Titlebar` function, add the `win-titlebar` class to the title-bar div and tokenize its text color:
```tsx
    <div
      className="win-titlebar flex items-center justify-between pl-[4px] pr-[2px] py-[2px] w-full"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center gap-[4px] h-[16px]">
        <img src="/assets/folder.png" alt="" className="size-[16px]" />
        <span className="text-[var(--accent-text)] text-[20px] leading-[13px] tracking-[0.4px] whitespace-nowrap">
          {title}
        </span>
      </div>
```

(The inline `backgroundColor: color` stays — win95 uses the per-call color; the `[data-theme="tahoe"] .win-titlebar` rule from Task 1 overrides it to `var(--accent)` in Tahoe.)

- [ ] **Step 3: Typecheck + lint.**

Run: `npx tsc --noEmit`
Expected: exit 0.
Run: `npx eslint src/components/WindowFrame.tsx`
Expected: no errors.

- [ ] **Step 4: Visual check.**

Run `npm run dev`, http://localhost:3000/projects, toggle to Tahoe.
- All window/card title bars now show the system-blue accent (uniform, not the hashed palette) with light text; the frame body is dark glass; buttons/status bar adopt token colors.
- Toggle back to Win95 → title bars show their per-project hashed colors again, classic bevels return.

- [ ] **Step 5: Commit.**

```bash
git add src/components/WindowFrame.tsx
git commit -m "feat: tokenize WindowFrame, add win-titlebar for Tahoe accent"
```

---

### Task 5: Tokenize projects-page components

Convert remaining hardcoded `#000080` / `#c0c0c0` / `#808080` / font classes to tokens across the projects-page tree.

**Files:**
- Modify: `src/app/projects/page.tsx`
- Modify: `src/components/ProjectCard.tsx`
- Modify: `src/components/ProjectDetailModal.tsx`
- Modify: `src/components/ProjectContextMenu.tsx`
- Modify: `src/components/ProjectPropertiesDialog.tsx`
- Modify: `src/components/SystemPropertiesDialog.tsx`

**Interfaces:**
- Consumes: tokens from Task 1. No new exports.

Apply this mapping everywhere it appears in the six files (use find-in-file per file; replace within `className` strings and inline `style` values):

| From | To |
|------|----|
| `#000080` (incl. in `bg-[#000080]`, `text-[#000080]`, `ring-[#000080]`, divider gradient, inline styles) | `var(--accent)` (for text/bg/ring use `text-[var(--accent)]` etc.; in raw gradient strings use `var(--accent)`) |
| `bg-[#c0c0c0]` | `bg-[var(--surface)]` |
| `#dfdfdf` / `#dferer` raised greys | `var(--surface-raised)` |
| `#808080` borders (`border-[#808080]`, `bg-[#808080]`) | `var(--border)` |
| `text-white` on accent surfaces (titlebars, navy buttons) | `text-[var(--accent-text)]` |
| `text-black` body text | `text-[var(--text)]` |
| muted greys `text-[#7f7f7f]`, `text-black/55`, `text-black/60`, `text-black/80` | `text-[var(--text-muted)]` |
| `bg-[#f4f4f4]` (thumbnail/placeholder inner surface) | `bg-[var(--surface-raised)]` |
| `font-pixelify` | `font-[family-name:var(--font-ui)]` |
| `font-vt323` | `font-[family-name:var(--font-body)]` |

Do NOT change: layout/spacing classes; `accentForProject` logic; **the `ACCENTS` color array in `ProjectCard.tsx`** (`#000080`, `#1f6f6f`, `#7a1f3d`, `#5a5a18`, `#4b2e6b`, `#3a4a63` — these are the win95 hashed palette, kept as-is; Tahoe overrides them via the `[data-theme="tahoe"] .win-titlebar` CSS rule, NOT by editing this array); the dotted-divider gradient STRUCTURE (only swap its `#000080` for `var(--accent)`); the bottom LinkedIn brand gradient (`#0a66c2` and the gradient SVG — out of theme scope); image/asset references. **Important:** the `#000080` in the `ACCENTS` array is the ONLY `#000080` that must NOT be converted — every other `#000080` (navbar, heading, dividers, links) does convert.

- [ ] **Step 1: Tokenize `src/components/ProjectContextMenu.tsx`.**

Apply the mapping. Notably: `bg-[#c0c0c0]` → `bg-[var(--surface)]`; the item hover `hover:bg-[#000080] hover:text-white` → `hover:bg-[var(--accent)] hover:text-[var(--accent-text)]`; disabled `text-[#7f7f7f]` → `text-[var(--text-muted)]`; enabled `text-black` → `text-[var(--text)]`.

- [ ] **Step 2: Tokenize `src/components/SystemPropertiesDialog.tsx`.**

Apply the mapping: OS-name `text-[#000080]` → `text-[var(--accent)]`; divider gradient `#000080` → `var(--accent)`; spec label `text-black/60` → `text-[var(--text-muted)]`, value `text-black` → `text-[var(--text)]`; OK button `bg-[#c0c0c0]` → `bg-[var(--surface)]`; `font-vt323` → `font-[family-name:var(--font-body)]`.

- [ ] **Step 3: Tokenize `src/components/ProjectPropertiesDialog.tsx`.**

Apply the mapping across all `#000080` / `#c0c0c0` / `#808080` / `text-black` / `text-white` / `font-vt323` / `font-pixelify` occurrences per the table.

- [ ] **Step 4: Tokenize `src/components/ProjectDetailModal.tsx`.**

Apply the mapping: title `text-[#000080]` → `text-[var(--accent)]`; divider `#000080` → `var(--accent)`; `visit project` link `text-[#000080]` → `text-[var(--link)]`; `font-vt323` → `font-[family-name:var(--font-body)]`; `text-black`/border greys per table.

- [ ] **Step 5: Tokenize `src/components/ProjectCard.tsx`.**

Apply the mapping: `font-vt323` → `font-[family-name:var(--font-body)]`; `built with` label `text-black/55` → `text-[var(--text-muted)]`; the `built with` separator `bg-black/15` → `bg-[var(--border)]`; the thumbnail border `border-black/20` → `border-[var(--border)]`; the `open →` cue color (currently `style={{ color: accent }}`) — KEEP as-is (it intentionally matches the per-project accent in win95; in Tahoe it will read the hashed color which is acceptable, OR set it to `var(--accent)`; choose `var(--accent)` for consistency: change the `open →` span to `className="… text-[var(--accent)]"` and remove the inline `style={{ color: accent }}`). The `accentForProject`/`titleBarColor` on the card's `WindowFrame` stays.

- [ ] **Step 6: Tokenize `src/app/projects/page.tsx`.**

Apply the mapping to the navbar (`bg-[#000080]` → `bg-[var(--accent)]`, nav link `text-white` → `text-[var(--accent-text)]`, `text-[#e6e6e6]` → `text-[var(--accent-text)]`), the heading `text-[#000080]` → `text-[var(--accent)]`, the intro/footer `font-vt323` → `font-[family-name:var(--font-body)]`, and the toast `bg-[#c0c0c0]` → `bg-[var(--surface)]`. Leave the bottom LinkedIn gradient as-is (it's a deliberate brand gradient, out of theme scope).

- [ ] **Step 7: Typecheck + lint all six files.**

Run: `npx tsc --noEmit`
Expected: exit 0.
Run: `npx eslint src/app/projects/page.tsx src/components/ProjectCard.tsx src/components/ProjectDetailModal.tsx src/components/ProjectContextMenu.tsx src/components/ProjectPropertiesDialog.tsx src/components/SystemPropertiesDialog.tsx`
Expected: no errors.

- [ ] **Step 8: Build.**

Run: `npm run build`
Expected: completes, all routes generated.

- [ ] **Step 9: Visual check (full Tahoe projects page).**

Run `npm run dev`, http://localhost:3000/projects, toggle to Tahoe.
- The ENTIRE projects page reads as dark Tahoe: dark glass cards/modals with rounded corners and soft shadows, SF system font, system-blue accent, light text, no chunky bevels or navy/grey leftovers on this page.
- Open a project (modal), right-click empty space (desktop menu + System Properties dialog) — all render in Tahoe.
- Toggle back to Win95 → pixel-perfect original look returns (hashed title-bar accents, bevels, pixel fonts).

- [ ] **Step 10: Commit.**

```bash
git add src/app/projects/page.tsx src/components/ProjectCard.tsx src/components/ProjectDetailModal.tsx src/components/ProjectContextMenu.tsx src/components/ProjectPropertiesDialog.tsx src/components/SystemPropertiesDialog.tsx
git commit -m "feat: tokenize projects page components for theming"
```

---

## Self-Review

**Spec coverage:**
- Two token sets selected by `data-theme`, win95 default → Task 1 ✓
- `.win-frame-*` routed through tokens → Task 1 ✓
- Tahoe smooth-motion override → Task 1 Step 2 ✓
- `ThemeProvider` + `useTheme` (default win95, localStorage, sets dataset) → Task 2 ✓
- No-flash inline script + default `data-theme` on `<html>` → Task 2 Step 2 ✓
- `ThemeToggle` in projects navbar → Task 3 ✓
- Tahoe accent override via `win-titlebar` class → Task 1 (rule) + Task 4 (class) ✓
- Projects page + 7 components tokenized → Tasks 4-5 (WindowFrame + 6 files) ✓
- Body transition cross-fade → Task 1 (`body { transition }`) ✓
- All token values verbatim → Task 1 / Global Constraints ✓
- Out-of-scope (home/about/other modals, shared navbar, auto dark, 3rd theme) → not touched ✓

**Placeholder scan:** No TBD/TODO. Task 5's mapping table + per-file Steps give concrete from→to for each file; the one judgment call (`open →` cue color) is resolved explicitly to `var(--accent)`. The `ProjectPropertiesDialog` step (5.3) says "apply the mapping per the table" without inline code because the file wasn't read into the plan — acceptable since the mapping table is exhaustive and the implementer reads the file; but to be safe the implementer must apply ONLY the table mappings, changing nothing structural.

**Type consistency:** `Theme = "win95" | "tahoe"` consistent across Task 2 provider, hook, and the script's `'tahoe'`/`'win95'` literals. `useTheme()` return shape used by `ThemeToggle` (Task 3) matches its Task 2 definition (`theme`, `toggle`). `win-titlebar` class name consistent between Task 1 (CSS rule) and Task 4 (markup). Token names consistent between Task 1 definitions and Tasks 4-5 usages.

**Verification adaptation note:** No unit-test runner in this repo (confirmed across prior work). TDD red/green steps are replaced with `tsc --noEmit`, `eslint`, `npm run build`, and explicit manual visual checks per task. Theme behavior (toggle, persistence, FOUC, both looks) is inherently visual and verified by the described manual checks.
