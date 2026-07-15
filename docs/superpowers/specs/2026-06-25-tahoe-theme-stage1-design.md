# Tahoe Dark Theme — Stage 1: Foundation + Toggle + Projects Page

**Date:** 2026-06-25
**Status:** Approved (design), pending spec review
**Area:** `src/app/layout.tsx`, `src/app/globals.css`, new theming components, and the projects-page component tree

## Context & the bigger picture

The site is a 90's-Windows-themed portfolio. The user wants a toggle that flips
the **entire site** between the signature 90's look and a sleek **macOS "Tahoe"
dark** look (glassy/translucent surfaces, rounded corners, SF system font, soft
shadows) — same layout and content, different skin.

This is a large effort: 90's styling (hardcoded `#000080` / `#c0c0c0`, the
`win-frame-*` bevel classes, `font-pixelify` / `font-vt323`) is spread across
17 files. It is therefore **decomposed into stages**, each independently
shippable:

- **Stage 1 (THIS spec):** theming foundation (CSS-variable token system for
  both themes), `ThemeProvider` + `useTheme` + no-flash script + `ThemeToggle`,
  and full tokenization of the **projects page** and its component tree.
- **Stage 2 (later):** tokenize Home + About pages.
- **Stage 3 (later):** tokenize the remaining modals/windows (Contacts, Tips,
  Terminal, TechStack, ProjectsPopup).
- **Stage 4 (later):** Tahoe visual polish (advanced glass/blur/motion).

Each later stage gets its own spec → plan → implementation cycle.

## Decisions (locked during brainstorming)

- **Engine:** CSS-variable semantic tokens, themed by a `data-theme` attribute
  on `<html>` (`"win95"` | `"tahoe"`).
- **Default:** `"win95"` (the signature look) on first visit; choice persisted.
- **Persistence:** `localStorage["theme"]`.
- **Toggle location (Stage 1):** the **projects page navbar only**. A shared
  navbar extraction is part of later stages.
- **Transitional look:** the shared `.win-frame-*` classes route through tokens,
  so flipping to Tahoe restyles frames site-wide, but not-yet-tokenized pages
  keep their hardcoded 90's colors and will look half-converted in Tahoe until
  their stage lands. **Accepted** (option a) — the staged rollout closes the gap.

## Architecture — token system

Extend the existing `:root` + `@theme inline` block in `globals.css` into two
complete token sets:

```css
:root,
[data-theme="win95"] {
  /* existing 90's values, kept */
  --surface: #c0c0c0;
  --surface-raised: #dfdfdf;
  --text: #000000;
  --text-muted: #3f3f3f;
  --accent: #000080;
  --accent-text: #ffffff;
  --link: #3168ff;
  --border: #808080;
  --radius: 0px;
  --font-ui: var(--font-pixelify), "Pixelify Sans", monospace;
  --font-body: var(--font-vt323), monospace;
  --backdrop: none;
  --page-bg: #ffffff;
  /* bevel shadows as today */
  --frame-shadow-outside:
    inset -1px -1px 0 0 #000, inset 1px 1px 0 0 #fff,
    inset -2px -2px 0 0 #7f7f7f, inset 2px 2px 0 0 #dfdfdf;
  --frame-shadow-inside:
    inset -1px -1px 0 0 #fff, inset 1px 1px 0 0 #808080,
    inset -2px -2px 0 0 #c1c1c1, inset 2px 2px 0 0 #000;
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
  --font-ui: -apple-system, "SF Pro Text", system-ui, sans-serif;
  --font-body: -apple-system, "SF Pro Text", system-ui, sans-serif;
  --backdrop: blur(20px) saturate(180%);
  --page-bg: #1c1c1e;
  --frame-shadow-outside:
    0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 0.5px rgba(255, 255, 255, 0.1);
  --frame-shadow-inside: inset 0 0 0 0.5px rgba(255, 255, 255, 0.06);
}
```

`.win-frame-outside` / `.win-frame-inside` are rewritten to consume the tokens:

```css
.win-frame-outside {
  box-shadow: var(--frame-shadow-outside);
  border-radius: var(--radius);
  backdrop-filter: var(--backdrop);
}
.win-frame-inside {
  box-shadow: var(--frame-shadow-inside);
  border-radius: var(--radius);
}
```

This restyles every window/card frame on theme flip without editing the 17
component files for the frame itself.

`body` background uses `var(--page-bg)`; in Tahoe a dark base so glass panels
have something to blur over.

## Architecture — provider, hook, no-flash, toggle

- **`ThemeProvider`** (`src/components/theme/ThemeProvider.tsx`, client): React
  context holding `theme` and `setTheme`/`toggle`. On mount reads
  `localStorage["theme"]` (default `"win95"`); on change writes `localStorage`
  and sets `document.documentElement.dataset.theme`. Guards all `window` access
  behind a mounted check.
- **`useTheme()`** hook exported from the same module:
  `() => { theme: "win95" | "tahoe"; setTheme: (t) => void; toggle: () => void }`.
- **No-flash script:** a blocking inline `<script>` in `<head>` (via
  `layout.tsx` `dangerouslySetInnerHTML`) that runs before paint, reads
  `localStorage["theme"]` (fallback `"win95"`), and sets
  `document.documentElement.dataset.theme`. The `<html>` element also carries a
  default `data-theme="win95"` so SSR markup is deterministic and matches the
  fallback.
- **`ThemeToggle`** (`src/components/theme/ThemeToggle.tsx`, client): calls
  `useTheme().toggle`. Theme-aware visual — a chunky beveled button in 90's, a
  sleek pill/segment in Tahoe (both use tokens, so a single markup styles both).
  Shows the target/state with a sun/moon icon + short label. Added to the
  **projects page** navbar (`src/app/projects/page.tsx`).
- **Transition:** `body` gets `transition: background-color 200ms, color 200ms`
  so the flip cross-fades rather than snapping.

`ThemeProvider` wraps `{children}` in `layout.tsx`.

## Projects-page tokenization (Stage 1 conversion set)

Convert hardcoded 90's values to tokens in these files only:

- `src/app/projects/page.tsx`
- `src/components/ProjectCard.tsx`
- `src/components/WindowFrame.tsx`
- `src/components/ProjectDetailModal.tsx`
- `src/components/ProjectContextMenu.tsx`
- `src/components/ProjectPropertiesDialog.tsx`
- `src/components/SystemPropertiesDialog.tsx`

Mapping (apply consistently):

- `#000080` (navy) → `var(--accent)`
- title-bar text / `#ffffff` on navy → `var(--accent-text)`
- `#c0c0c0` → `var(--surface)`; `#dfdfdf` → `var(--surface-raised)`
- `#808080` borders → `var(--border)`
- body text default → `var(--text)`; muted greys → `var(--text-muted)`
- `font-pixelify` usages → `font-[family-name:var(--font-ui)]`
- `font-vt323` usages → `font-[family-name:var(--font-body)]`
- the dotted divider `#000080` → `var(--accent)`
- `ProjectCard` per-project accent: the deterministic hashed palette is a 90's
  flourish. Mechanism (decided): `accentForProject` still returns its hashed
  color and is still applied as the `titleBarColor` inline style. To make Tahoe
  override it uniformly without per-card JS, add a CSS rule
  `[data-theme="tahoe"] .win-titlebar { background: var(--accent) !important; }`
  — i.e. give the title-bar element in `WindowFrame` a stable `win-titlebar`
  class, and let the Tahoe theme override the inline background. In win95 the
  inline hashed color shows; in Tahoe the system blue wins. No component branch
  on `data-theme` needed.

Animations: add a `[data-theme="tahoe"]` variant of the entrance animations that
swaps `steps(...)` for smooth `ease-out` so motion suits the aesthetic.

## Out of scope (Stage 1)

- Home, About, and non-projects modals (Contacts, Tips, Terminal, TechStack,
  ProjectsPopup) — later stages. They keep working in 90's.
- Shared `Navbar` extraction — later stage.
- System dark-mode auto-detection — default is always `win95` per decision.
- A third theme — the token system makes it trivial later, but YAGNI now.

## Success criteria

- A toggle in the projects-page navbar flips the site between `win95` and
  `tahoe`; the projects page fully restyles (glass panels, rounded, SF font,
  dark, blue accent) with a smooth cross-fade.
- Choice persists across reloads via `localStorage`; first visit defaults to
  `win95`.
- No flash of the wrong theme on reload for a returning Tahoe user (inline
  script verified).
- `npx tsc --noEmit`, `npx eslint`, and `npm run build` all pass.
- Non-converted pages keep working (transitional look in Tahoe accepted).
