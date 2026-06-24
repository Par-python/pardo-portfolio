# Desktop Right-Click Menu (Projects page) — Design

**Date:** 2026-06-24
**Status:** Approved (design), pending spec review
**Area:** `src/app/projects/page.tsx` + new `SystemPropertiesDialog` component

## Problem / Goal

The projects page has the 90's-Windows look but the "desktop" itself is inert —
right-clicking empty space does nothing. Add a Windows-style desktop context
menu (like right-clicking the Win95 desktop) for fun and theme cohesion, with
two items: **Refresh** and **Properties**. This is a playful, non-essential
enhancement; it must not interfere with the existing per-card right-click menu.

## Decision

Right-clicking **empty page space** opens a context menu with **Refresh** and
**Properties**. Right-clicking a **project card** still opens the existing
per-card menu (Open / Properties / Copy link) — the two never overlap.
Desktop-only (no mobile long-press for this menu).

## Components

- **Reuse `ProjectContextMenu`** (`src/components/ProjectContextMenu.tsx`)
  unchanged. It already accepts `{ x, y, items, onClose }`, clamps to the
  viewport, and closes on outside-click / Escape. The desktop menu is a second
  instance of it with a different `items` array.
- **New `SystemPropertiesDialog`** (`src/components/SystemPropertiesDialog.tsx`)
  — a draggable window built with the SAME pattern as `ProjectDetailModal`:
  `useDraggableWindow({ open, minTop })` + `WindowFrame`. Styled as a "System
  Properties" parody. Props: `{ open: boolean; onClose: () => void; zIndex?:
  number; onFocus?: () => void }`. Content is a small static array in the
  component (no data file):
  - Title bar: `System Properties`
  - Body: an icon (`/assets/folder.png`), heading **"JJ Pardo OS v2026"**, a
    dotted divider (reuse the `repeating-linear-gradient(#000080…)` style used
    in `ProjectDetailModal`), and a joke spec sheet rendered as label/value
    rows:
    - `Processor: caffeine (overclocked)`
    - `Memory (RAM): 8 ideas`
    - `Display: 90's mode`
    - `Registered to: you`
    - `Status: shipping 🚀`
  - An **OK** button (beveled, `win-frame-outside`) that calls `onClose`.
- **`page.tsx` wiring** — see below. New state:
  - `desktopMenu: { x: number; y: number } | null`
  - `sysPropsOpen: boolean`
  - `refreshing: boolean`
  - `replayKey: number` (starts at 0)

## Trigger separation (empty space only)

- Each project card's root gets a `data-project-card` attribute (added in
  `ProjectCard.tsx`'s outer `<button>`).
- The page's outer `<main>` gets an `onContextMenu` handler:
  ```ts
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-project-card]")) return; // card handles its own
    e.preventDefault();
    setDesktopMenu({ x: e.clientX, y: e.clientY });
  };
  ```
- Because the card's own `onContextMenu` already calls `e.preventDefault()` and
  opens the card menu, and the page handler bails when the target is inside a
  card, the two menus are mutually exclusive. Right-clicking a card → card menu;
  right-clicking heading / gaps / footer → desktop menu.

## Menu items

```ts
items = [
  { label: "Refresh", onClick: doRefresh },
  { label: "Properties", onClick: () => setSysPropsOpen(true) },
]
```

## Refresh behavior ("full reload feel")

`doRefresh`:
1. `setDesktopMenu(null)` (close menu).
2. `setRefreshing(true)` — renders a centered fixed overlay showing the existing
   `/assets/loading.gif` (asset already in repo) over a semi-dim backdrop.
3. After ~600ms (`setTimeout`): `setRefreshing(false)` and
   `setReplayKey((k) => k + 1)`.
4. The grid `<ul>` (and optionally the heading) include `replayKey` in their
   React `key`, so bumping it remounts those nodes; the existing
   `anim-proj-grid` / `anim-proj-heading` CSS animations re-run from the start.

Net effect: brief loading flash → cards pop back in staggered, like first load.
No data refetch. Reuses existing animation classes; no new keyframes.

Guard: the timeout id is stored so a rapid second Refresh clears the prior one
(`window.clearTimeout`) before starting a new flash — no overlapping flashes.
Clear it on unmount.

## Accessibility / safety

- Menu + dialog inherit Escape / outside-click close from `ProjectContextMenu`
  and the draggable-window pattern.
- `SystemPropertiesDialog` OK button is keyboard-focusable; Escape closes it
  (add an Escape `keydown` listener while open, mirroring `ProjectContextMenu`).
- The loading overlay is `aria-hidden` decorative; `refreshing` is purely
  visual.

## Z-index ordering

Match existing layering: per-card context menu and toast already use `z-[200]`/
`z-[210]`. The desktop menu reuses `ProjectContextMenu` (`z-[200]`). The
`SystemPropertiesDialog` window uses a base `zIndex` like `ProjectDetailModal`
(40) — it is a normal draggable window, below the transient menu. The refresh
loading overlay sits above content but below menus: `z-[150]`.

## Non-goals (YAGNI)

- No Arrange / Sort by, no View toggle.
- No real page reload, no data refetch, no persistence.
- No mobile long-press for the desktop menu (desktop-only).
- No change to the existing per-card menu, the data, or the modal.

## Success criteria

- Right-click empty space on `/projects` → menu with Refresh + Properties at the
  cursor, clamped to viewport, closes on outside-click/Escape.
- Right-click a card → still the existing per-card menu (unchanged).
- Refresh → ~600ms loading flash, then cards re-animate in.
- Properties → draggable "System Properties" parody window with the joke spec
  sheet and an OK button; closes on OK / Escape / outside interaction.
- `tsc --noEmit`, `eslint`, and `next build` all pass.
