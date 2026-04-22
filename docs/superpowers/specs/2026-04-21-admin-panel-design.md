# Admin Panel Design

**Date:** 2026-04-21
**Status:** Approved

## Goal

Provide a local-only admin UI for drafting content changes to the portfolio (projects, popup, contacts modal, tech stack modal, about page) without committing the admin code or its draft data to the repo. Only the final TSX changes the user makes manually are committed.

## Key constraints

- **Admin code is never committed.** All admin-related files (pages, API routes, helpers, draft JSON) are gitignored.
- **Drafts are never committed.** JSON files the admin writes are gitignored.
- **Production site behavior is unchanged.** Site reads from hardcoded TSX. Admin is a drafting sandbox — the user copies finalized values from JSON into TSX by hand.
- **No backend, no auth, no database.** Local Next.js dev server + filesystem reads/writes via a dev-only API route.
- **On a fresh clone, admin does not exist.** The user must manually regenerate or copy admin files from a local backup to re-enable it.

## Scope

### Editable content

- **Projects page** (6 cards): `title`, `image` (path/URL string), `description`
- **Projects popup** (2 featured items): `title`, `image`, `description`
- **Contacts modal**: `email`, `phone`, `linkedin` URL, `github` URL
- **Tech stack modal**: list of tech/tool entries (structure determined by reading the existing `TechStackModal.tsx` during implementation)
- **About page**: 5 image paths (`cafe`, `group`, `trio`, `race`, `electronics`) + 2 description text blocks

### Explicitly out of scope

- Landing page hero text ("HI IM", "JJ PARDO!", subtitle) — stays hardcoded.
- Image uploads — admin accepts URL/path strings only. User drops files into `public/assets/` manually via the OS.
- Auth — not needed; admin code does not exist in deployed build.
- Multi-device sync — drafts are local-only.

## Architecture

### Mode

Mode A (drafting sandbox): admin writes JSON; TSX is the source of truth for the live site. JSON → TSX is a manual copy step performed by the user.

### File layout

```
.gitignore                      (updated to ignore admin paths)
data/                           (entire dir gitignored)
  projects.json
  popup.json
  contacts.json
  tech-stack.json
  about.json

src/
  app/
    admin/                      (entire dir gitignored)
      page.tsx                  (tabbed admin UI)
      _components/
        ProjectsTab.tsx
        PopupTab.tsx
        ContactsTab.tsx
        TechStackTab.tsx
        AboutTab.tsx
        TextField.tsx           (shared form input)
        TextArea.tsx            (shared form textarea)
        CopyTsxButton.tsx       (copies a formatted TSX snippet to clipboard)
    api/
      admin/                    (entire dir gitignored)
        content/
          [kind]/
            route.ts            (GET/PUT handlers)
  lib/
    admin-content.ts            (gitignored; read/write helpers + types)
```

### Data flow

1. User runs `npm run dev` locally.
2. User opens `/admin` in browser.
3. Admin page loads each tab's data via `GET /api/admin/content/<kind>`.
4. API handler reads `data/<kind>.json` from disk. If the file does not exist, it returns a default object seeded from the current TSX values (seeded inline in `admin-content.ts`).
5. User edits a form, clicks **Save** → admin sends `PUT /api/admin/content/<kind>` with the new JSON body.
6. API handler writes `data/<kind>.json` to disk.
7. User clicks **Copy as TSX** next to a field or group → clipboard receives a formatted TSX snippet the user pastes into the live component file (e.g. `src/app/projects/page.tsx`).
8. User manually commits TSX changes. Admin JSON is never committed.

### Production behavior

The admin page and its API route do not exist in production builds, because their files are gitignored and absent from the deployed working tree. No additional runtime guards are required. (If the user ever accidentally includes admin files in a deploy, the API route additionally refuses to respond when `process.env.NODE_ENV === "production"` as a defense-in-depth check.)

### Types

`src/lib/admin-content.ts` defines one type per content kind, matching the shape used by the live TSX components. Example:

```ts
export type Project = { title: string; image: string; description: string };
export type ProjectsContent = { projects: Project[] };
export type ContactsContent = { email: string; phone: string; linkedin: string; github: string };
// …
export type ContentKind = "projects" | "popup" | "contacts" | "tech-stack" | "about";
```

`admin-content.ts` also exports a `DEFAULTS: Record<ContentKind, ContentFor<Kind>>` map holding the current TSX values, so a fresh `data/` directory still produces sensible forms.

### API route

Dynamic route `src/app/api/admin/content/[kind]/route.ts`:

- `GET`: validates `kind` against the `ContentKind` union, returns `data/<kind>.json` contents. If the file is missing, returns `DEFAULTS[kind]`. If the file exists but is malformed, returns HTTP 500 with the parse error.
- `PUT`: validates `kind`, validates the request body shape (minimal runtime check — required fields present, correct types), writes `data/<kind>.json`. Creates `data/` directory if missing.
- Both handlers immediately return 404 if `process.env.NODE_ENV === "production"`.

### Admin UI

Single `/admin` route. Horizontal tab bar at the top: `Projects · Popup · Contacts · Tech Stack · About`. Selected tab renders the matching form component.

Form behavior (shared across tabs):

- Loads data on mount via `GET`.
- Edits live in local React state.
- **Save** button posts the current state via `PUT`. Shows a success/error toast.
- **Reset to defaults** button discards the draft and repopulates the form from `DEFAULTS[kind]`. This does **not** delete `data/<kind>.json` — the user still needs to click Save to persist the reset.
- **Copy as TSX** button per field group: writes a formatted TSX literal (e.g. the full `projects` array) to the clipboard so the user can paste into the live component file.

No TedXAteneo pixel theming on the admin UI — plain utilitarian form controls (standard Tailwind inputs/buttons). The admin is a tool, not part of the portfolio.

### Projects tab specifics

- Renders the 6 project cards as a vertical list of editors.
- Each card has inputs for `title`, `image`, `description` and a **Delete** button.
- An **Add project** button at the bottom appends a blank row.
- Card order = array order; a simple up/down arrow per card lets the user reorder.

### Popup tab specifics

Same shape as Projects tab but locked to 2 rows (no add/delete). Reordering still available.

### Contacts / About / Tech Stack tabs

Flat forms — each field is one input (or textarea for the longer about descriptions). Tech Stack rendered as a list editor similar to Projects.

## Error handling

- **Malformed JSON on read**: admin shows a banner with the parse error and a "Load defaults" button. Does not overwrite the file until the user saves.
- **Disk write failure** (permissions, full disk): the API returns 500 with the error message; the admin shows an error toast and preserves form state so the user doesn't lose edits.
- **Invalid `kind` parameter**: 400 from the API.
- **Production environment**: 404 from both the page and the API (defense-in-depth; primary protection is gitignore).
- **Missing `data/` directory**: API auto-creates on first write.

## Testing

Manual verification checklist:

1. `git status` after scaffolding shows no admin files (they are gitignored).
2. Visiting `/admin` in dev loads all 5 tabs with current TSX values as defaults.
3. Editing and saving a tab creates `data/<kind>.json` with the new values.
4. Reloading the admin page re-loads the saved draft.
5. **Copy as TSX** produces a snippet that, pasted into the live component, renders correctly.
6. `rm -rf data/` and reloading shows the defaults again.
7. Running `npm run build && npm start` returns 404 for `/admin` and `/api/admin/...` (or the routes don't exist at all if admin files were absent during build).
8. Live site routes (`/`, `/about`, `/projects`) are unchanged by admin activity.

## Gitignore additions

Append to `.gitignore`:

```
# Admin panel — never committed
/data/
/src/app/admin/
/src/app/api/admin/
/src/lib/admin-content.ts
```

## Non-goals

- Publishing from admin directly to the live site.
- Real-time preview of the live site inside the admin.
- Versioning or undo history for drafts.
- Validation of image paths (admin accepts any string; broken paths surface in the live component, not admin).
- Styling consistency between admin and portfolio.
