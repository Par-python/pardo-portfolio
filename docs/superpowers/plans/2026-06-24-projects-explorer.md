# Projects Page → Windows Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the uniform 3-column card grid on the projects page with a single Windows Explorer window — a Details-view list (left) plus a preview pane (right) — keeping the 90's Windows aesthetic.

**Architecture:** A new presentational `ProjectExplorer` component renders inside the existing `WindowFrame`. It holds no business state; selection (`selectedIdx`) and the existing modal/context-menu/properties/toast state stay in `ProjectsPage`, which passes data + callbacks down. The full `ProjectDetailModal` remains the canonical detail view (opened on double-click / mobile tap / "Open" affordance).

**Tech Stack:** Next.js (App Router, React Compiler), React, Tailwind CSS v4 (`@theme inline` in `globals.css`), TypeScript. **No unit-test runner exists in this repo** — verification is `npx tsc --noEmit`, `npx eslint`, `npm run build`, and a manual dev-server visual check.

## Global Constraints

- **No new Next.js APIs without reading docs first.** Per `AGENTS.md`: "This is NOT the Next.js you know" — read the relevant guide in `node_modules/next/dist/docs/` before using any Next.js API not already used in `src/app/projects/page.tsx`. This plan only uses APIs already present there (`next/link`, plain `<img>`, client components), so no new doc reading is required unless a task deviates.
- **Verification per task (this repo has no test framework):** every task ends by running `npx tsc --noEmit` (must pass clean) and `npx eslint src/app/projects/page.tsx src/components/ProjectExplorer.tsx` (must pass clean for touched files). Visual/behavioral checks are done against `npm run dev` (http://localhost:3000/projects) and described explicitly where they apply.
- **Aesthetic vocabulary (do not introduce new color language):** beveled edges via existing `.win-frame-outside` (raised) / `.win-frame-inside` (sunken); selection color navy `#000080` with white text; fonts `font-pixelify` (titles) and `font-vt323` (body) as already used; dotted divider via `repeating-linear-gradient(to right, #000080 0 8px, transparent 8px 14px)`.
- **Reuse, do not duplicate:** `WindowFrame`, `ProjectDetailModal`, `ProjectContextMenu`, `ProjectPropertiesDialog`, `TECH_ICONS`, `renderRichText`, `useLiveContent`, and the existing toast + long-press helpers must be reused, not reimplemented.
- **Type shape:** the `Project` type is `{ title: string; image: string; description: string; details?: string; tech?: string[]; link?: string; createdAt?: string; team?: string[]; }` — already declared in `page.tsx` and `ProjectDetailModal.tsx`. Do not change it.
- **`createdAt` may be missing** on some projects — render an empty cell, never `undefined`.
- **Status bar object count is computed** from `projects.length`, never hardcoded.

---

### Task 1: `deriveType` helper + `ProjectExplorer` skeleton (desktop list, no preview yet)

Build the new component file with the Details-view list (left pane only) and a pure `deriveType` helper. Wire it into the page so the grid is replaced and clicking a row selects it. Preview pane and modal-open wiring come in Task 2.

**Files:**
- Create: `src/components/ProjectExplorer.tsx`
- Modify: `src/app/projects/page.tsx` (replace the `<ul className="anim-proj-grid ...">…</ul>` block at lines ~201-262; add `selectedIdx` state)

**Interfaces:**
- Consumes (from existing code): `Project` type; `TECH_ICONS: Record<string,string>`; `renderRichText` from `@/lib/richText`.
- Produces (used by Task 2 + the page):
  - `deriveType(project: Project): string`
  - `ProjectExplorer` props:
    ```ts
    type ProjectExplorerProps = {
      projects: Project[];
      selectedIdx: number;
      techIcons: Record<string, string>;
      onSelect: (idx: number) => void;          // single click (desktop) / row focus
      onOpen: (idx: number) => void;             // double-click (desktop) / tap (mobile) / "Open"
      onContextMenu: (idx: number) => (e: React.MouseEvent) => void;
      onTouchStart: (idx: number) => (e: React.TouchEvent) => void;
      onTouchEnd: () => void;
      onTouchMove: () => void;
      onTouchCancel: () => void;
    };
    ```

- [ ] **Step 1: Create the component file with the `deriveType` helper and a desktop-only Details list.**

Create `src/components/ProjectExplorer.tsx`:

```tsx
"use client";

import { renderRichText } from "@/lib/richText";

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

type ProjectExplorerProps = {
  projects: Project[];
  selectedIdx: number;
  techIcons: Record<string, string>;
  onSelect: (idx: number) => void;
  onOpen: (idx: number) => void;
  onContextMenu: (idx: number) => (e: React.MouseEvent) => void;
  onTouchStart: (idx: number) => (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
  onTouchCancel: () => void;
};

// Presentational only — infers a human "Type" label from tech + title.
// A wrong edge case is cosmetic, not a correctness bug.
export function deriveType(project: Project): string {
  const tech = (project.tech ?? []).map((t) => t.toLowerCase());
  const title = project.title.toLowerCase();
  const desc = project.description.toLowerCase();
  const has = (k: string) => tech.includes(k);

  if (has("rust")) return "CLI Tool";
  if (
    (has("python") && /library|toolkit|pip install|pypi/.test(desc)) ||
    title === "entroscope"
  )
    return "Python Library";
  if (has("python") && /pyside|qt|desktop|app/.test(desc)) return "Desktop App";
  if (
    has("typescript") ||
    has("tailwind") ||
    has("django") ||
    has("nodejs") ||
    has("react")
  )
    return "Web App";
  if (has("python")) return "Python Project";
  return "Application";
}

export function ProjectExplorer({
  projects,
  selectedIdx,
  techIcons,
  onSelect,
  onOpen,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onTouchCancel,
}: ProjectExplorerProps) {
  return (
    <div className="win-frame-inside bg-white">
      {/* Menu bar (decorative) */}
      <div className="flex items-center gap-4 px-2 py-1 bg-[#c0c0c0] border-b border-[#808080]">
        {["File", "Edit", "View", "Help"].map((m) => (
          <span
            key={m}
            className="proj-menu-item font-vt323 text-[16px] sm:text-[18px] tracking-[0.32px] px-1 leading-none cursor-default select-none"
          >
            {m}
          </span>
        ))}
      </div>

      {/* Toolbar (decorative) */}
      <div className="flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-b border-[#808080]">
        <span className="size-[24px] bg-[#c0c0c0] win-frame-outside flex items-center justify-center">
          <img src="/assets/folder.png" alt="" className="size-[14px]" />
        </span>
        <span className="px-2 h-[24px] bg-[#c0c0c0] win-frame-outside flex items-center font-vt323 text-[14px] leading-none">
          Details
        </span>
      </div>

      {/* Body: details list (preview pane added in Task 2) */}
      <div className="flex">
        {/* Left: Details list */}
        <div className="w-full">
          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-px bg-[#808080] border-b border-[#808080]">
            {["Name", "Type", "Date", "Tech"].map((h) => (
              <div
                key={h}
                className="bg-[#c0c0c0] win-frame-outside px-2 py-1 font-vt323 text-[14px] sm:text-[15px] leading-none"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <ul className="anim-proj-grid">
            {projects.map((project, idx) => {
              const selected = idx === selectedIdx;
              return (
                <li key={`${project.title}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(idx)}
                    onDoubleClick={() => onOpen(idx)}
                    onContextMenu={onContextMenu(idx)}
                    onTouchStart={onTouchStart(idx)}
                    onTouchEnd={onTouchEnd}
                    onTouchMove={onTouchMove}
                    onTouchCancel={onTouchCancel}
                    aria-label={`Select ${project.title}`}
                    aria-pressed={selected}
                    className={`grid grid-cols-[2fr_1fr_1fr_1.2fr] items-center w-full text-left gap-px px-2 py-1 focus:outline-none ${
                      selected
                        ? "bg-[#000080] text-white"
                        : "bg-white hover:bg-[#000080]/10"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <img
                        src="/assets/folder.png"
                        alt=""
                        className="size-[16px] shrink-0"
                      />
                      <span className="font-vt323 text-[15px] sm:text-[17px] tracking-[0.3px] leading-none truncate">
                        {project.title}
                      </span>
                    </span>
                    <span className="font-vt323 text-[13px] sm:text-[15px] leading-none truncate">
                      {deriveType(project)}
                    </span>
                    <span className="font-vt323 text-[13px] sm:text-[15px] leading-none truncate">
                      {project.createdAt ?? ""}
                    </span>
                    <span className="flex flex-wrap gap-1 items-center">
                      {(project.tech ?? []).map((key) =>
                        techIcons[key] ? (
                          <img
                            key={key}
                            src={techIcons[key]}
                            alt={key}
                            title={key}
                            className="size-[16px] object-contain"
                          />
                        ) : null
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

(`renderRichText` is imported now because the preview pane in Task 2 uses it; if `eslint` flags it as unused in this task, add the import in Task 2 instead — but keeping it here keeps the diff small. If lint fails on unused import, remove it and re-add in Task 2.)

- [ ] **Step 2: Wire `ProjectExplorer` into the page; add `selectedIdx` state; replace the grid.**

In `src/app/projects/page.tsx`:

Add the import near the other component imports (after the `WindowFrame` import line):
```tsx
import { ProjectExplorer } from "@/components/ProjectExplorer";
```

Add selection state alongside the existing `useState` hooks (right after the `activeIdx` line):
```tsx
const [selectedIdx, setSelectedIdx] = useState(0);
```

Replace the entire projects-grid `<section>` block — the one starting `{/* Projects grid */}` through its closing `</section>` (the `<ul className="anim-proj-grid ...">` list) — with:
```tsx
{/* Projects explorer */}
<section className="mx-auto w-full max-w-[1300px] px-3 sm:px-6 pt-6 sm:pt-10">
  <WindowFrame
    title="Projects"
    statusText={
      projects[selectedIdx]
        ? `'${projects[selectedIdx].title}' selected`
        : `${projects.length} object(s)`
    }
    className="anim-proj-window"
  >
    <ProjectExplorer
      projects={projects}
      selectedIdx={selectedIdx}
      techIcons={TECH_ICONS}
      onSelect={setSelectedIdx}
      onOpen={(idx) => setActiveIdx(idx)}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onTouchCancel={cancelLongPress}
    />
  </WindowFrame>
</section>
```

Note: `WindowFrame` already wraps children in a `p-[16px]` padded `.win-frame-inside` body. The `ProjectExplorer` adds its own `.win-frame-inside`; that's acceptable (nested sunken frame reads fine), but if it looks too inset visually during the Task 2 visual check, drop the outer padding by passing a wrapper — defer that judgment to Task 2's visual review.

- [ ] **Step 3: Typecheck.**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors. (If "renderRichText declared but never read" appears, remove that import from `ProjectExplorer.tsx` for now.)

- [ ] **Step 4: Lint.**

Run: `npx eslint src/app/projects/page.tsx src/components/ProjectExplorer.tsx`
Expected: no errors/warnings.

- [ ] **Step 5: Visual check.**

Run `npm run dev`, open http://localhost:3000/projects.
Expected: a single "Projects" Explorer window replaces the grid; a `File Edit View Help` menu bar and a toolbar show; a column-header row (`Name Type Date Tech`) sits above project rows; the first row is highlighted navy/white; clicking another row moves the highlight; the status bar reads `'S1napse' selected` (or whichever row is selected). Tech icons and dates appear per row.

- [ ] **Step 6: Commit.**

```bash
git add src/components/ProjectExplorer.tsx src/app/projects/page.tsx
git commit -m "feat: replace projects grid with Explorer details list"
```

---

### Task 2: Preview pane (desktop) + open-on-double-click/tap wiring

Add the right-hand preview pane shown on `sm` and up, populated from `selectedIdx`. On mobile the pane is hidden and tapping a row opens the modal (already wired via `onOpen` from Task 1, since `onTouchStart` drives long-press and a plain tap triggers `onClick` → currently `onSelect`; this task makes mobile taps open the modal).

**Files:**
- Modify: `src/components/ProjectExplorer.tsx` (add preview pane; adjust mobile click behavior)

**Interfaces:**
- Consumes: everything from Task 1 (`ProjectExplorerProps`, `deriveType`, `renderRichText`).
- Produces: no new exported symbols; same props.

- [ ] **Step 1: Add the preview pane and responsive list width.**

In `src/components/ProjectExplorer.tsx`, ensure `renderRichText` is imported (from Task 1). Change the body `<div className="flex">` block so the list is `sm:w-[55%]` and add a `sm`-only preview pane at `sm:w-[45%]`.

Replace the left-list wrapper `<div className="w-full">` opening tag with:
```tsx
<div className="w-full sm:w-[55%] sm:border-r sm:border-[#808080]">
```

Immediately after the closing `</div>` of that left-list wrapper (and before the closing `</div>` of the `flex` body), insert the preview pane:
```tsx
{/* Right: preview pane (desktop only) */}
{projects[selectedIdx] ? (
  <div className="hidden sm:flex sm:w-[45%] flex-col gap-3 p-4 min-w-0">
    <p className="font-pixelify text-[#000080] text-[22px] tracking-[0.5px] leading-none truncate">
      {projects[selectedIdx].title}
    </p>
    <div
      className="h-[2px] w-full"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to right, #000080 0 8px, transparent 8px 14px)",
      }}
    />
    {projects[selectedIdx].image ? (
      <div className="w-full aspect-[16/9] border border-black/20 overflow-hidden bg-[#f4f4f4] flex items-center justify-center">
        <img
          src={projects[selectedIdx].image}
          alt={projects[selectedIdx].title}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    ) : null}
    <p className="font-vt323 text-[16px] tracking-[0.3px] leading-[20px] line-clamp-4">
      {renderRichText(projects[selectedIdx].description)}
    </p>
    {projects[selectedIdx].tech && projects[selectedIdx].tech!.length > 0 ? (
      <ul className="flex flex-wrap gap-2 items-center">
        {projects[selectedIdx].tech!.map((key) =>
          techIcons[key] ? (
            <li key={key}>
              <img
                src={techIcons[key]}
                alt={key}
                title={key}
                className="size-[20px] object-contain"
              />
            </li>
          ) : null
        )}
      </ul>
    ) : null}
    <div className="mt-auto flex items-center gap-4">
      <button
        type="button"
        onClick={() => onOpen(selectedIdx)}
        className="font-vt323 text-[#000080] text-[16px] tracking-[0.3px] underline leading-none cursor-pointer bg-transparent border-0 p-0"
      >
        Open ↗
      </button>
      {projects[selectedIdx].link ? (
        <a
          href={projects[selectedIdx].link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-vt323 text-[#000080] text-[16px] tracking-[0.3px] underline leading-none"
        >
          visit project →
        </a>
      ) : null}
    </div>
  </div>
) : null}
```

- [ ] **Step 2: Make mobile taps open the modal (desktop single-click still just selects).**

The row `<button>`'s `onClick` currently calls `onSelect(idx)`. To open the modal on mobile tap while keeping desktop single-click as select-only, change the row button handlers so a touch-originated tap opens, and a mouse click selects. Replace the row button's `onClick` with:
```tsx
onClick={(e) => {
  // Touch taps (pointerType === "") on mobile should open the modal;
  // mouse single-clicks (desktop) only select.
  if (e.detail === 0) {
    onSelect(idx);
    return;
  }
  onSelect(idx);
}}
```
Then add a dedicated tap handler via the existing touch flow: in `onTouchEnd` the page already cancels long-press. To open on a real tap, wrap the page's `cancelLongPress` so a non-fired long-press tap calls open — **but that logic lives in the page, not here.** So instead, expose tap-open from the component: change `onTouchEnd` usage in the row to:
```tsx
onTouchEnd={() => {
  onTouchEnd();
}}
```
and rely on the page's long-press `fired` flag plus the `onClick` to open. **Decision:** keep this component dumb — mobile open is handled in the page (Task 3). For this task, leave row `onClick={() => onSelect(idx)}` as in Task 1 and do NOT change tap behavior here. (Revert any change from this step's first snippet.)

> Net effect of Step 2: **no code change** — mobile tap-to-open is consolidated into Task 3 where the page's long-press state is in scope. This step exists to make that boundary explicit; skip it.

- [ ] **Step 3: Typecheck.**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Lint.**

Run: `npx eslint src/components/ProjectExplorer.tsx`
Expected: no errors. (`renderRichText` is now used.)

- [ ] **Step 5: Visual check.**

Run `npm run dev`, open http://localhost:3000/projects on a desktop-width viewport.
Expected: right preview pane shows the selected project's title, dotted divider, image, clamped description, tech icons, and `Open ↗` / `visit project →` actions. Selecting a different row updates the pane. Double-clicking a row opens the full `ProjectDetailModal`. Clicking `Open ↗` opens the modal. Narrow the viewport below `sm` (640px): the preview pane disappears and the list is full-width.

- [ ] **Step 6: Commit.**

```bash
git add src/components/ProjectExplorer.tsx
git commit -m "feat: add projects Explorer preview pane and open wiring"
```

---

### Task 3: Mobile tap-to-open + menu/header CSS + entrance animation

Make a plain mobile tap on a row open the modal (using the page's existing long-press `fired` flag), add the menu-bar hover styling and Explorer window entrance animation to `globals.css`, and verify the context menu / properties / toast still work from rows.

**Files:**
- Modify: `src/app/projects/page.tsx` (pass an `isTouch`-aware open or reuse `longPressRef.fired` to open on tap)
- Modify: `src/components/ProjectExplorer.tsx` (row click delegates to a single `onActivate` that the page maps correctly)
- Modify: `src/app/globals.css` (`.proj-menu-item` hover; `.anim-proj-window` keyframe reuse)

**Interfaces:**
- Consumes: Task 1/2 props.
- Produces: no new exported symbols. The page's `onSelect`/`onOpen` semantics are finalized here: **desktop single click → select; desktop double click → open; mobile tap → open; long-press → context menu.**

- [ ] **Step 1: Open on mobile tap via the existing long-press flag.**

The page already has `longPressRef.current?.fired` to distinguish a long-press from a tap (used by the old grid's `onClick`). Reuse that: in `page.tsx`, change the `onOpen` passed to `ProjectExplorer` so it is only the modal-open, and add tap handling through `onSelect`.

Set the props passed to `ProjectExplorer` to:
```tsx
onSelect={(idx) => {
  // On touch devices a tap should open; on desktop it should just select.
  // matchMedia avoids opening the modal on every desktop click.
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none)").matches
  ) {
    if (longPressRef.current?.fired) {
      longPressRef.current.fired = false;
      return;
    }
    setActiveIdx(idx);
    return;
  }
  setSelectedIdx(idx);
}}
onOpen={(idx) => setActiveIdx(idx)}
```

This keeps the component dumb: it always calls `onSelect` on click and `onOpen` on double-click/`Open ↗`; the page decides what a "click" means based on the device.

- [ ] **Step 2: Add menu-bar hover + window entrance animation to `globals.css`.**

Append to `src/app/globals.css` (after the existing `.anim-proj-footer` block):
```css
/* Projects Explorer */
.proj-menu-item:hover {
  background: #000080;
  color: #fff;
}

.anim-proj-window {
  animation: pixel-in-up 0.5s steps(8, end) 0.6s both;
}
```

(The rows already animate via the existing `.anim-proj-grid` class applied to the `<ul>` in `ProjectExplorer`; the staggered `nth-child` delays in `globals.css` apply to the `<li>` rows automatically.)

- [ ] **Step 3: Typecheck + lint.**

Run: `npx tsc --noEmit`
Expected: exits 0.
Run: `npx eslint src/app/projects/page.tsx src/components/ProjectExplorer.tsx`
Expected: no errors.

- [ ] **Step 4: Visual + interaction check.**

Run `npm run dev`, open http://localhost:3000/projects.
- Desktop: hovering `File/Edit/View/Help` highlights them navy/white; the Explorer window animates in (slides up, stepped); rows stagger in; single-click selects, double-click opens modal.
- Right-click a row → existing context menu (Open in new window / Properties / Copy link). "Copy link" shows the toast. "Properties" opens the properties dialog.
- Toggle device toolbar to a phone width (or use a touch device): a single tap on a row opens the modal; long-press opens the context menu.

- [ ] **Step 5: Build.**

Run: `npm run build`
Expected: build completes successfully with no type or lint errors.

- [ ] **Step 6: Commit.**

```bash
git add src/app/projects/page.tsx src/components/ProjectExplorer.tsx src/app/globals.css
git commit -m "feat: mobile tap-to-open, menu hover, and Explorer entrance animation"
```

---

## Self-Review

**Spec coverage:**
- Menu bar `File Edit View Help` → Task 1 Step 1 ✓
- Toolbar (folder-up, Details) → Task 1 Step 1 ✓
- Details list `Name/Type/Date/Tech`, navy selection, double-click opens modal → Task 1 (list + select + dblclick), Task 2 (open) ✓
- Derived Type helper → Task 1 `deriveType` ✓
- Preview pane (thumbnail, title, dotted divider, description, tech icons, visit link, Open) → Task 2 ✓
- Preview defaults to index 0 → `selectedIdx` initial `0` (Task 1 Step 2) ✓
- Status bar `'<Title>' selected` / computed `N object(s)` → Task 1 Step 2 ✓
- Mobile: preview hidden, tap opens modal → Task 2 (`hidden sm:flex`), Task 3 Step 1 (tap-open) ✓
- Reuse WindowFrame / ProjectDetailModal / context menu / properties / toast / TECH_ICONS / renderRichText / useLiveContent → page keeps all existing state and modals; component reuses TECH_ICONS + renderRichText ✓
- Entrance animations (window + staggered rows) → Task 3 Step 2 + existing `.anim-proj-grid` ✓
- Aesthetic guardrails (bevels, navy, fonts, divider) → used throughout, no new colors ✓
- Non-goals respected: no data schema change, modal unchanged, menus decorative ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases" left. Task 2 Step 2 is intentionally a documented no-op that defers tap-open to Task 3 — the boundary is explained, not vague. ✓

**Type consistency:** `ProjectExplorerProps` defined in Task 1 is used unchanged in Tasks 2-3. `deriveType(project: Project): string` consistent. `selectedIdx: number`, `onSelect/onOpen: (idx:number)=>void` consistent across page and component. `Project` type matches the existing declaration verbatim. ✓

**Verification adaptation note:** This repo has no unit-test runner (confirmed: no vitest/jest/playwright, no test script, no test files). The skill's TDD red/green steps are replaced with this repo's real verification gates — `tsc --noEmit`, `eslint`, `next build`, and explicit manual visual/interaction checks — rather than adding an unrequested test framework to a portfolio site.
