# Desktop Right-Click Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Windows-style desktop context menu (Refresh + Properties) on right-click of empty space on the `/projects` page, with a fake "System Properties" parody dialog and a loading-flash + re-animate Refresh.

**Architecture:** Reuse the existing `ProjectContextMenu` (already viewport-clamped, Escape/outside-close) as a second instance with desktop items. Add a new `SystemPropertiesDialog` draggable window built with the same `useDraggableWindow` + `WindowFrame` pattern as `ProjectDetailModal`. Wire a page-level `onContextMenu` on `<main>` that ignores events originating inside a project card (tagged with `data-project-card`) so the per-card menu is untouched.

**Tech Stack:** Next.js (App Router, React Compiler), React, Tailwind v4, TypeScript. **No unit-test runner in this repo** — verification is `npx tsc --noEmit`, `npx eslint`, and `npm run build`.

## Global Constraints

- **No new Next.js API.** Per `AGENTS.md`, read `node_modules/next/dist/docs/` before any Next.js API not already used in `src/app/projects/page.tsx`. This plan uses none (only React state, browser events, `setTimeout`, a draggable hook already in the repo).
- **Verification gates per task (no test framework):** `npx tsc --noEmit` (exit 0) and `npx eslint <touched files>` (no errors). The final task also runs `npm run build` (must succeed). Visual checks are done against `npm run dev` → http://localhost:3000/projects and described per task.
- **Aesthetic vocabulary (no new color language):** bevels via `.win-frame-outside` / `.win-frame-inside`; navy `#000080`; fonts `font-pixelify` (titles) / `font-vt323` (body); dotted divider exactly `repeating-linear-gradient(to right, #000080 0 8px, transparent 8px 14px)`.
- **Reuse, do not duplicate:** `ProjectContextMenu`, `WindowFrame`, `useDraggableWindow`. Do NOT modify `ProjectContextMenu` or the existing per-card menu behavior.
- **Desktop-only:** the desktop menu triggers on `onContextMenu` (right-click) only. No mobile long-press for it.
- **Joke spec sheet lines (verbatim):** `Processor: caffeine (overclocked)`, `Memory (RAM): 8 ideas`, `Display: 90's mode`, `Registered to: you`, `Status: shipping 🚀`. OS name: `JJ Pardo OS v2026`.
- **Refresh flash duration:** ~600ms (`600`).
- **Z-index:** desktop menu reuses `ProjectContextMenu` (`z-[200]`); `SystemPropertiesDialog` base `zIndex` 40 (like `ProjectDetailModal`); refresh loading overlay `z-[150]`.

---

### Task 1: `SystemPropertiesDialog` component

A draggable "System Properties" parody window, mirroring `ProjectDetailModal`'s draggable pattern.

**Files:**
- Create: `src/components/SystemPropertiesDialog.tsx`

**Interfaces:**
- Consumes: `useDraggableWindow` from `@/lib/useDraggableWindow` (signature, from `ProjectDetailModal.tsx`: `useDraggableWindow({ open: boolean; minTop?: number }) => { pos: {x:number;y:number} | null; windowRef: React.RefObject<HTMLDivElement>; onTitlePointerDown: (e: React.PointerEvent) => void }`); `WindowFrame` from `@/components/WindowFrame` (props include `title`, `statusText`, `onClose`, `className`, children).
- Produces:
  ```ts
  type SystemPropertiesDialogProps = {
    open: boolean;
    onClose: () => void;
    zIndex?: number;       // default 40
    onFocus?: () => void;
  };
  export function SystemPropertiesDialog(props: SystemPropertiesDialogProps): JSX.Element | null
  ```

- [ ] **Step 1: Create the component.**

Create `src/components/SystemPropertiesDialog.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useDraggableWindow } from "@/lib/useDraggableWindow";
import { WindowFrame } from "./WindowFrame";

type SystemPropertiesDialogProps = {
  open: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
};

const SPECS: { label: string; value: string }[] = [
  { label: "Processor", value: "caffeine (overclocked)" },
  { label: "Memory (RAM)", value: "8 ideas" },
  { label: "Display", value: "90's mode" },
  { label: "Registered to", value: "you" },
  { label: "Status", value: "shipping 🚀" },
];

export function SystemPropertiesDialog({
  open,
  onClose,
  zIndex = 40,
  onFocus,
}: SystemPropertiesDialogProps) {
  const { pos, windowRef, onTitlePointerDown } = useDraggableWindow({
    open,
    minTop: 24,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={windowRef}
      onPointerDownCapture={onFocus}
      className="fixed w-[min(420px,92vw)]"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        zIndex,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div
        onPointerDown={onTitlePointerDown}
        className="cursor-move touch-none"
        style={{ touchAction: "none" }}
      >
        <WindowFrame title="System Properties" statusText="OK" onClose={onClose}>
          <div
            className="cursor-default"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <img src="/assets/folder.png" alt="" className="size-[32px]" />
              <p className="text-[#000080] text-[24px] sm:text-[28px] tracking-[0.6px] leading-none">
                JJ Pardo OS v2026
              </p>
            </div>

            <div
              className="mt-3 h-[2px] w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, #000080 0 8px, transparent 8px 14px)",
              }}
            />

            <ul className="mt-4 flex flex-col gap-2">
              {SPECS.map((spec) => (
                <li
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 font-vt323 text-[16px] sm:text-[18px] tracking-[0.3px] leading-none"
                >
                  <span className="text-black/60">{spec.label}:</span>
                  <span className="text-black text-right">{spec.value}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-[#c0c0c0] win-frame-outside px-6 py-1 font-vt323 text-[16px] tracking-[0.3px] leading-none cursor-pointer active:translate-y-[1px]"
              >
                OK
              </button>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck.**

Run: `npx tsc --noEmit`
Expected: exit 0. (The `useDraggableWindow` signature is confirmed: `useDraggableWindow({ open: boolean; minTop?: number }) => { pos: {x:number;y:number} | null; windowRef: React.RefObject<HTMLDivElement>; onTitlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void }` — the code above matches it exactly. Do not modify the hook.)

- [ ] **Step 3: Lint.**

Run: `npx eslint src/components/SystemPropertiesDialog.tsx`
Expected: no errors.

- [ ] **Step 4: Commit.**

```bash
git add src/components/SystemPropertiesDialog.tsx
git commit -m "feat: add System Properties parody dialog"
```

---

### Task 2: Tag project cards + wire the desktop menu, dialog, and refresh into the page

Add `data-project-card` to the card root, then wire the page-level context menu, the `SystemPropertiesDialog`, and the Refresh loading-flash + re-animate.

**Files:**
- Modify: `src/components/ProjectCard.tsx` (add `data-project-card` to the outer `<button>` at line ~73)
- Modify: `src/app/projects/page.tsx` (imports, state, handlers, `<main>` `onContextMenu`, grid `key`, and new render nodes before `</main>`)

**Interfaces:**
- Consumes: `SystemPropertiesDialog` from Task 1; existing `ProjectContextMenu` (`{ x, y, items: {label,onClick,disabled?}[], onClose }`).
- Produces: nothing for later tasks (final task).

- [ ] **Step 1: Tag the card root.**

In `src/components/ProjectCard.tsx`, add `data-project-card` to the outer `<button>` (currently starts at line ~73 with `type="button"`):

```tsx
    <button
      type="button"
      data-project-card
      onClick={() => onOpen(idx)}
```

- [ ] **Step 2: Import `SystemPropertiesDialog` in the page.**

In `src/app/projects/page.tsx`, add after the `ProjectDetailModal` import:
```tsx
import { SystemPropertiesDialog } from "@/components/SystemPropertiesDialog";
```

- [ ] **Step 3: Add desktop-menu / dialog / refresh state and handlers.**

In `ProjectsPage`, after the existing `const [toast, setToast] = useState<string | null>(null);` line, add:
```tsx
const [desktopMenu, setDesktopMenu] = useState<{ x: number; y: number } | null>(
  null
);
const [sysPropsOpen, setSysPropsOpen] = useState(false);
const [refreshing, setRefreshing] = useState(false);
const [replayKey, setReplayKey] = useState(0);
const refreshTimer = useRef<number | null>(null);
```

After the existing `flashToast` function, add the desktop-menu and refresh handlers:
```tsx
const handleDesktopContextMenu = (e: React.MouseEvent) => {
  // Cards handle their own right-click menu; only empty space opens this one.
  if ((e.target as HTMLElement).closest("[data-project-card]")) return;
  e.preventDefault();
  setDesktopMenu({ x: e.clientX, y: e.clientY });
};

const doRefresh = () => {
  setDesktopMenu(null);
  if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
  setRefreshing(true);
  refreshTimer.current = window.setTimeout(() => {
    setRefreshing(false);
    setReplayKey((k) => k + 1);
    refreshTimer.current = null;
  }, 600);
};
```

Add a cleanup effect (needs `useEffect` — add it to the existing `react` import: `import { useEffect, useRef, useState } from "react";`). Place the effect right after the handlers:
```tsx
useEffect(() => {
  return () => {
    if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
  };
}, []);
```

- [ ] **Step 4: Attach the page-level context menu and the replay key.**

Change the `<main>` opening tag (line ~144) from:
```tsx
    <main className="min-h-screen w-full bg-white flex flex-col">
```
to:
```tsx
    <main
      className="min-h-screen w-full bg-white flex flex-col"
      onContextMenu={handleDesktopContextMenu}
    >
```

Change the grid `<ul>` (line ~201) to include `replayKey` in its React `key` so a Refresh remounts it and re-runs the entrance animation. From:
```tsx
        <ul className="anim-proj-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```
to:
```tsx
        <ul
          key={replayKey}
          className="anim-proj-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
```

- [ ] **Step 5: Render the desktop menu, dialog, and refresh overlay.**

Immediately before the closing `</main>` (after the bottom-gradient `</section>` at line ~312), insert:
```tsx
      {desktopMenu ? (
        <ProjectContextMenu
          x={desktopMenu.x}
          y={desktopMenu.y}
          onClose={() => setDesktopMenu(null)}
          items={[
            { label: "Refresh", onClick: doRefresh },
            { label: "Properties", onClick: () => setSysPropsOpen(true) },
          ]}
        />
      ) : null}

      <SystemPropertiesDialog
        open={sysPropsOpen}
        onClose={() => setSysPropsOpen(false)}
      />

      {refreshing ? (
        <div
          aria-hidden
          className="fixed inset-0 z-[150] flex items-center justify-center bg-white/40"
        >
          <img src="/assets/loading.gif" alt="" className="size-[64px]" />
        </div>
      ) : null}
```

(Note: `ProjectContextMenu` is already imported in `page.tsx`. The desktop menu reuses it; no new import for the menu.)

- [ ] **Step 6: Typecheck.**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Lint.**

Run: `npx eslint src/app/projects/page.tsx src/components/ProjectCard.tsx`
Expected: no errors.

- [ ] **Step 8: Visual check.**

Run `npm run dev`, open http://localhost:3000/projects.
- Right-click empty space (heading area, gap between cards, footer) → a `Refresh / Properties` menu appears at the cursor, clamped to the viewport, closes on Escape or outside-click.
- Right-click a project card → the EXISTING per-card menu (Open in new window / Properties / Copy link) appears — NOT the desktop menu.
- Click **Refresh** → a centered loading.gif flashes for ~0.6s over a dim backdrop, then the cards pop back in staggered (entrance animation replays).
- Click **Properties** → a draggable "System Properties" window opens with "JJ Pardo OS v2026", the joke spec sheet, and an OK button. Dragging its title bar moves it. OK and Escape close it.

- [ ] **Step 9: Build.**

Run: `npm run build`
Expected: completes successfully, all routes generated including `/projects`.

- [ ] **Step 10: Commit.**

```bash
git add src/app/projects/page.tsx src/components/ProjectCard.tsx
git commit -m "feat: desktop right-click menu (Refresh + Properties) on projects page"
```

---

## Self-Review

**Spec coverage:**
- Desktop menu Refresh + Properties on empty-space right-click → Task 2 Steps 3-5 ✓
- Reuse `ProjectContextMenu` with new items → Task 2 Step 5 ✓
- Trigger separation via `data-project-card` + `closest()` bail → Task 2 Steps 1, 3 ✓
- Per-card menu unchanged → not modified; bail guard preserves it ✓
- `SystemPropertiesDialog` parody (icon, "JJ Pardo OS v2026", divider, exact spec lines, OK button), draggable via `useDraggableWindow` + `WindowFrame`, Escape close → Task 1 ✓
- Refresh: close menu → 600ms loading.gif flash → replay animations via `replayKey` in grid `key` → Task 2 Steps 3-5 ✓
- Rapid-refresh guard (clear prior timeout) + unmount cleanup → Task 2 Step 3 ✓
- Z-index: menu `z-[200]` (inherited), dialog 40, overlay `z-[150]` → Task 1 / Task 2 Step 5 ✓
- Desktop-only (onContextMenu only, no long-press) → Task 2 Step 4 ✓
- Aesthetic vocabulary (bevels, navy, fonts, exact divider) → Task 1 ✓
- Non-goals respected: no sort/view, no real reload, no persistence, no data change ✓

**Placeholder scan:** No TBD/TODO. Task 1 Step 2 notes a conditional adjustment to the `useDraggableWindow` destructure *only if* the real signature differs — it names the file to read and the exact alignment action, not a vague "handle it." Acceptable (it's a verify-and-align instruction with a concrete fallback, not a missing implementation).

**Type consistency:** `SystemPropertiesDialogProps` (Task 1) is used with `open`/`onClose` in Task 2 Step 5 — consistent. `desktopMenu: {x,y}|null`, `setSysPropsOpen`, `doRefresh`, `replayKey`, `refreshTimer` all consistent between definition (Step 3) and use (Steps 4-5). `ProjectContextMenu` item shape `{label,onClick}` matches its existing prop type. Grid `key={replayKey}` is a number — valid React key.

**Verification adaptation note:** This repo has no unit-test runner (confirmed across prior tasks). The skill's TDD steps are replaced with this repo's real gates — `tsc --noEmit`, `eslint`, `npm run build`, and explicit manual visual checks.
