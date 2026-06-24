# Projects Page → Windows Explorer — Design

**Date:** 2026-06-24
**Status:** Approved (design), pending spec review
**Area:** `src/app/projects/page.tsx` and supporting components

## Problem

The projects page renders six identical fixed-height window cards in a uniform
3-column grid. Every card has the same size and the same internal layout
(thumbnail → description → tech icons), so nothing draws the eye and the page
reads like a spreadsheet. The 90's-Windows shell vocabulary (title bars,
beveled frames, status bars) is present but applied flatly.

Goal: keep the 90's Windows aesthetic but make the layout less bland by leaning
harder into the OS metaphor.

## Decision

Replace the card grid with a single **Windows Explorer window** that lists the
projects in a **Details view** (table with columns) on the left and shows a
**preview pane** for the selected project on the right.

Page structure is otherwise unchanged:

```
Navbar
"Projects" hero heading + intro paragraph
→ Explorer window   (replaces the grid)
Bottom gradient + "more projects to come!"
```

## The Explorer window

A new `ProjectExplorer` component, rendered inside the existing `WindowFrame`
(which provides the outer beveled chrome + status bar). It contains:

1. **Menu bar** — `File  Edit  View  Help`. Decorative chrome, beveled,
   navy-on-hover. Non-functional (no menus open).
2. **Toolbar** — a small strip of beveled buttons (a folder-up icon and a
   "Details" label) for visual texture. Decorative.
3. **Split body:**
   - **Desktop (`sm` and up):** two panes side by side.
     - **Left pane (~55% width): Details list.** A table with column headers
       `Name | Type | Date | Tech` (raised-bevel header cells). Each project is
       a row:
       - file icon + project title
       - **Type** — derived per project (see "Derived type" below)
       - `createdAt` value (may be missing on some projects → render blank)
       - tech icons (small, from `TECH_ICONS`)

       Clicking a row selects it: navy `#000080` row background, white text
       (classic Explorer selection). **Double-clicking a row opens the full
       `ProjectDetailModal`.**
     - **Right pane (~45% width): Preview.** Shows the selected project's:
       thumbnail, title, dotted divider (reuse the modal's
       `repeating-linear-gradient` divider style), short `description`, a tech
       icons row, a "visit project →" link (when `link` present), and an
       "Open ↗" affordance that opens the full `ProjectDetailModal`.

       The preview defaults to the first project (index 0) so it is never empty.
   - **Mobile (`< sm`):** the preview pane is hidden. The details list goes
     full-width and **tapping a row opens the `ProjectDetailModal` directly**
     (no in-pane preview on small screens).
4. **Status bar** (provided by `WindowFrame`): shows `7 object(s)` by default
   and changes to `'<Title>' selected` when a row is selected. (Count = number
   of projects, computed, not hardcoded.)

### Derived type

Each row shows a human "Type" string inferred from the project, since the data
has no explicit type field. Inference is a small pure helper, e.g.:

- has `rust` tech or title/desc implies a terminal tool → `"CLI Tool"`
- Python library projects (e.g. entroscope) → `"Python Library"`
- has web stack (`typescript`/`tailwind`/`django`/`nodejs`) → `"Web App"`
- desktop app (PySide/Qt, e.g. S1napse) → `"Desktop App"`
- fallback → `"Application"`

This is presentational only; getting an edge case "wrong" is cosmetic. Keep the
helper simple and data-driven from the existing `tech` array + title keywords.

## State & wiring

- Lift `selectedIdx` into `ProjectsPage`, default `0`.
- Keep existing `activeIdx` (full modal), `menu` (context menu), `propsIdx`
  (properties dialog), and `toast` state exactly as they are.
- Row interactions:
  - single click (desktop) → set `selectedIdx`
  - double click (desktop) → set `activeIdx` (open modal)
  - tap (mobile) → set `activeIdx` (open modal)
  - right-click / long-press → existing context menu (Open in new window /
    Properties / Copy link), unchanged
- Preview pane "Open ↗" and "visit project →" map to `setActiveIdx` and the
  external link respectively.

## Components

- **Reuse (no change):** `WindowFrame`, `ProjectDetailModal`,
  `ProjectContextMenu`, `ProjectPropertiesDialog`, `TECH_ICONS`,
  `renderRichText`, `useLiveContent`, the toast + long-press helpers.
- **New:** `src/components/ProjectExplorer.tsx` — menu bar, toolbar, split
  pane, details table, preview pane. Receives `projects`, `selectedIdx`,
  `techIcons`, and callbacks (`onSelect`, `onOpen`, `onContextMenu`,
  `onTouchStart`, etc.) as props. Holds no business state itself — selection
  lives in the page.
- **`page.tsx`:** swaps the `<ul>` grid for `<ProjectExplorer .../>`, adds
  `selectedIdx`, passes callbacks, updates the status text.

## Styling / authenticity guardrails

- Beveled edges via existing `.win-frame-outside` (raised) and
  `.win-frame-inside` (sunken). Column headers use the raised bevel.
- Selection color: navy `#000080`, white text.
- Fonts: existing Pixelify (titles) / VT323 (body), as already used.
- File/row icon: reuse `/assets/folder.png` (or a file-style icon if one
  exists under `/assets`); fall back to the project thumbnail where it reads
  well. No new color language is introduced.
- Any styling not expressible in Tailwind (menu-bar hover, header bevel detail)
  goes into `globals.css` alongside the existing `.win-frame-*` rules.

## Animations

Preserve the entrance feel:

- The Explorer window animates in (`pixel-pop` / `pixel-in-up`, stepped easing
  to match the existing 8-bit feel).
- Detail rows stagger in, reusing the `anim-proj-grid` stepped-delay pattern
  already defined in `globals.css`.

## Non-goals

- No change to the project data schema (`data/projects.json`).
- No change to the full `ProjectDetailModal` content/behavior — it remains the
  canonical place the rich `details` text is read.
- Menu bar / toolbar are decorative; no real menus, sorting, or view switching
  in this iteration.
- No unrelated refactoring of other pages.

## Success criteria

- The projects page shows one Explorer window instead of six uniform cards.
- Desktop: list + preview, click to select, double-click to open modal,
  status bar reflects selection.
- Mobile: full-width list, tap opens modal.
- Right-click/long-press context menu, properties dialog, copy-link toast, and
  live-content updates all still work.
- 90's Windows aesthetic preserved (bevels, navy selection, pixel fonts,
  stepped animations) with a visibly richer, less "grid of identical cards"
  layout.
