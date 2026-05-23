# Feature: Sidebar Toggle / Collapse (Desktop)

## Overview

Dashboard users currently see a fixed-width sidebar (`w-60`) on desktop that cannot be minimized. This feature adds a **collapse/expand toggle** so users can reclaim horizontal space when they don't need the sidebar labels — switching to an icon-only narrow rail (`w-16`). The collapsed state persists in `localStorage` so it survives page navigations and refreshes. Smooth CSS transitions provide a polished feel. When collapsed, hovering a nav icon shows a `Tooltip` with the item label. Mobile behavior (overlay/sheet via hamburger) remains completely unchanged. Because the layout uses flexbox and the sidebar is a sibling of the main content, the content area automatically reflows as the sidebar width changes — no layout restructuring is required.

---

## User Stories

- As a **dashboard user on desktop**, I want to collapse the sidebar to an icon-only rail, so that I have more horizontal space for main content.
- As a **dashboard user on desktop**, I want to expand the sidebar back to its full width with labels, so that I can navigate easily without memorizing icons.
- As a **dashboard user**, I want my sidebar preference (collapsed or expanded) to be remembered across page navigations and browser refreshes, so that I don't have to re-toggle every time I visit the dashboard.
- As a **dashboard user in collapsed state**, I want to see a tooltip label when I hover a nav icon, so that I know where each icon leads without expanding the sidebar.
- As a **mobile user**, I want the existing hamburger-based overlay sidebar to remain unchanged, so that my mobile experience is not disrupted by the desktop toggle feature.
- As a **keyboard/screen-reader user**, I want the toggle button to have a descriptive `aria-label` that reflects the current state, so that I can operate and understand the sidebar without visual cues.

---

## Acceptance Criteria

### AC-1 — Desktop Collapse Toggle Button
- [ ] A toggle button is visible inside the sidebar on `md` and larger screens (hidden on mobile).
- [ ] The button is positioned at the **bottom** of the sidebar, above the footer area, or in the sidebar header — consistent with the existing `border-b` header layout.
- [ ] The button shows a `PanelLeftClose` icon when expanded and `PanelLeftOpen` icon when collapsed (lucide-react icons).
- [ ] The button has `aria-label="Collapse sidebar"` when expanded and `aria-label="Expand sidebar"` when collapsed.

### AC-2 — Expanded State (default)
- [ ] Sidebar width is `w-60` (240 px) on desktop — matching the current implementation.
- [ ] All nav items display both icon and text label side-by-side.
- [ ] The logo text "Orion" is visible in the header.

### AC-3 — Collapsed State (icon-only rail)
- [ ] Sidebar width is `w-16` (64 px) on desktop.
- [ ] Nav item text labels are hidden (not merely invisible — must not occupy space).
- [ ] The logo text "Orion" is hidden; only the logo area container remains to preserve header height alignment.
- [ ] Nav item links remain fully clickable and navigable.
- [ ] Nav items are horizontally centered within the `w-16` rail.

### AC-4 — Smooth Transition
- [ ] Width change animates with a CSS `transition` of at least `200ms` ease.
- [ ] Icon and label visibility changes do not cause layout jank (use `overflow-hidden` on the sidebar during transition).
- [ ] The main content area reflows smoothly as the sidebar width changes (automatic via flexbox).

### AC-5 — Tooltip on Hover (collapsed state only)
- [ ] When sidebar is collapsed, hovering any nav icon shows a shadcn `Tooltip` with the item's label text.
- [ ] Tooltip appears on the **right side** (`side="right"`) of the icon.
- [ ] Tooltips are **not shown** when the sidebar is expanded (to avoid double-label redundancy).
- [ ] `TooltipProvider` is added to `app/layout.tsx` (root layout) as required by `AGENTS.md`.

### AC-6 — localStorage Persistence
- [ ] On first visit (no stored value), sidebar defaults to **expanded**.
- [ ] After toggling, the preference is written to `localStorage` under the key `sidebar-collapsed`.
- [ ] On page reload or navigation, the sidebar initializes to the stored value without a visible flash/layout shift (SSR-safe: use `useEffect` to read `localStorage` client-side, initialise state to `false` server-side).
- [ ] Clearing `localStorage` resets to expanded on next load.

### AC-7 — Mobile Behavior Unchanged
- [ ] On screens narrower than `md` (< 768 px), the toggle button inside the sidebar is hidden (`md:hidden` equivalent inverse).
- [ ] The hamburger button (`fixed top-3 left-3 z-50 md:hidden`) continues to work as before.
- [ ] The backdrop overlay on mobile is unaffected.
- [ ] `localStorage` key `sidebar-collapsed` is **not read or applied** on mobile (collapsed state is desktop-only).

### AC-8 — State Management via Custom Hook
- [ ] Collapse state and toggle logic are extracted into a custom hook `useSidebarCollapse` (in `features/navigation/hooks/use-sidebar-collapse.ts` or `components/fragments/use-sidebar-collapse.ts`).
- [ ] Hook returns `{ isCollapsed: boolean, toggle: () => void }`.
- [ ] Hook handles SSR-safety (no `localStorage` access during server render).

---

## Test Scenarios

| # | Given | When | Then | Type |
|---|-------|------|------|------|
| 1 | User is on desktop (`≥ md`), sidebar is expanded (default) | User clicks the collapse toggle button | Sidebar animates to `w-16`, labels disappear, icons remain centered | Happy path |
| 2 | User is on desktop, sidebar is collapsed | User clicks the expand toggle button | Sidebar animates to `w-60`, labels reappear next to icons | Happy path |
| 3 | User collapses the sidebar, then navigates to `/dashboard/settings` | Page loads | Sidebar is still collapsed (persisted via `localStorage`) | Happy path |
| 4 | User collapses sidebar, closes tab, reopens dashboard | Page loads fresh | Sidebar initializes collapsed (reads from `localStorage`) | Happy path |
| 5 | User is on desktop, sidebar is collapsed | User hovers the `LayoutDashboard` icon | Tooltip with label "Dashboard" appears to the right of the icon | Happy path |
| 6 | User is on desktop, sidebar is expanded | User hovers any nav icon | No tooltip is shown (label is already visible) | Edge case |
| 7 | User has never visited the dashboard (no `localStorage` key) | Page loads | Sidebar is expanded by default | Edge case |
| 8 | `localStorage` is unavailable (e.g. private mode in some browsers) | Page loads and user toggles | Sidebar still functions (toggle works in-memory), no JS error thrown | Edge case |
| 9 | User clears `localStorage` manually, then reloads | Page loads | Sidebar defaults to expanded | Edge case |
| 10 | User is on mobile (`< md`) | User taps hamburger button | Existing overlay sidebar opens as before; desktop collapse state is irrelevant | Edge case |
| 11 | User is on desktop, sidebar is collapsed | User clicks a nav item link | Navigation occurs normally; sidebar stays collapsed after route change | Happy path |
| 12 | User is on mobile, sidebar overlay is open | User resizes browser to desktop width | Sidebar shows in expanded or persisted collapsed state; mobile overlay is hidden | Edge case |
| 13 | Screen reader user focuses the toggle button when sidebar is expanded | Screen reader reads button | Announces "Collapse sidebar" | Happy path |
| 14 | Screen reader user focuses the toggle button when sidebar is collapsed | Screen reader reads button | Announces "Expand sidebar" | Happy path |
| 15 | User rapidly clicks the toggle button multiple times | Multiple fast clicks | Sidebar toggles correctly each time; no animation glitch or state desync | Edge case |
| 16 | `TooltipProvider` is missing from root layout | Page loads with tooltips rendered | No React context error; `TooltipProvider` must be present in `app/layout.tsx` | Negative |

---

## Out of Scope

- **Resizable sidebar** — drag-to-resize is not part of this iteration; only two discrete states (expanded / collapsed).
- **Server-side cookie persistence** — `localStorage` is sufficient; no need for cookie-based SSR persistence in this iteration.
- **Syncing collapsed state across browser tabs** — out of scope; each tab manages its own state.
- **Navbar changes** — the navbar does not need to adapt to sidebar state; it already spans `flex-1`.
- **Sub-navigation / nested nav items** — sidebar currently has flat nav; collapsing nested menus is out of scope.
- **Animation of logo** — fading or morphing the logo to an icon is out of scope; simple hide/show is sufficient.
- **Mobile collapse behavior** — mobile uses overlay pattern, not a rail; desktop collapse logic must not affect mobile.
- **Persisting sidebar state to Supabase / user profile** — localStorage only, no backend changes needed.

---

## Open Questions

1. **Toggle button placement** — Should the toggle button be in the sidebar **header** (next to logo) or **footer** (bottom of nav)? Footer placement is less disruptive to the header alignment. Needs design confirmation.
2. **Logo in collapsed state** — Should the logo area show a compact icon/logo mark (e.g., first letter "O" or a brand icon) instead of being fully empty? An icon mark may improve visual identity but requires an asset.
3. **`TooltipProvider` scope** — `AGENTS.md` notes it's not yet in `app/layout.tsx`. Adding it to root layout is safe, but confirm no existing component will have tooltip behavior side effects.
4. **Transition behavior on first load** — To avoid a flash of the wrong width, the sidebar should render at the correct width immediately. Using a CSS class applied synchronously before paint (via `useLayoutEffect` or an inline script) may be needed. Confirm acceptable approach with engineer.
5. **Minimum screen width for rail** — Is `w-16` (64 px) sufficient to comfortably display icons, or should it be `w-[72px]`? Confirm with designer.

---

## Feature Module Mapping

```
Primary file:
  components/fragments/sidebar.tsx       — refactor to accept / consume collapse state;
                                           add toggle button, tooltip wrappers, conditional label rendering

New hook:
  components/fragments/use-sidebar-collapse.ts
    — useSidebarCollapse(): { isCollapsed: boolean, toggle: () => void }
    — handles localStorage read/write + SSR safety

Root layout change:
  app/layout.tsx
    — add <TooltipProvider> wrapper (required for shadcn Tooltip)

Dashboard layout:
  app/dashboard/layout.tsx
    — no changes required (flexbox auto-reflows)

Types (inline in hook file, no separate types file needed):
  SidebarCollapseState: { isCollapsed: boolean, toggle: () => void }

shadcn components to add (if not already present):
  npx shadcn@latest add tooltip
```

### No backend changes required
This feature is entirely client-side. No Supabase schema changes, RLS policies, auth configuration, storage buckets, or edge functions are needed. Administrator delegation is **skipped**.
