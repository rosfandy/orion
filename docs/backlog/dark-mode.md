# Feature: Dark Mode

## Overview

Dark mode allows users to switch the application's color scheme between **light**, **dark**, and **system** (follows the OS `prefers-color-scheme` media query). The project already defines a `.dark` CSS class with full variable overrides in `app/globals.css` and uses `@custom-variant dark (&:is(.dark *))` — so the CSS layer is complete. What is missing is: (1) a runtime mechanism to apply/remove the `dark` class on `<html>` without hydration mismatches in Next.js 16 App Router SSR, (2) a `ThemeToggle` UI component, and (3) persistence of the user's explicit choice across sessions via `localStorage`, with graceful fallback to the OS preference when no explicit choice exists.

---

## User Stories

- **US-1** — As a **first-time visitor**, I want the app to automatically match my OS color-scheme preference, so that I don't have to manually configure anything on first load.
- **US-2** — As a **returning user**, I want my explicitly chosen theme (light / dark / system) to persist across page reloads and browser sessions, so that I never have to reconfigure my preference.
- **US-3** — As any **authenticated or unauthenticated user**, I want a clearly visible toggle in the app header/layout, so that I can switch themes at any time with one interaction.
- **US-4** — As a **keyboard-only user**, I want to operate the theme toggle using only the keyboard (Tab + Enter/Space), so that the feature is accessible to me.
- **US-5** — As a **screen-reader user**, I want the toggle to announce the current mode and the action it will perform, so that I understand the UI state without sight.
- **US-6** — As a **developer**, I want zero flash-of-unstyled-content (FOUC) on page load regardless of the stored preference, so that the app never visibly flickers between light and dark.

---

## Acceptance Criteria

### Theme Detection & Defaults
- [ ] **AC-1** On first visit (no stored preference), the app applies `dark` class if `prefers-color-scheme: dark`, otherwise light, with no visible flash.
- [ ] **AC-2** When system preference is `dark` and the user's stored preference is `system`, the `dark` class is present on `<html>` at paint time.
- [ ] **AC-3** When system preference is `light` and the user's stored preference is `system`, the `dark` class is absent on `<html>` at paint time.

### Toggle Behavior
- [ ] **AC-4** The `ThemeToggle` component renders a visible button/icon in the app layout (header or top navigation).
- [ ] **AC-5** Clicking the toggle cycles through or directly selects: `light → dark → system`.
- [ ] **AC-6** The active theme is immediately reflected in the UI without a page reload.
- [ ] **AC-7** The toggle visually indicates the currently active mode (distinct icon per mode).

### Persistence
- [ ] **AC-8** The chosen theme is written to `localStorage` under the key `theme` with values `"light"`, `"dark"`, or `"system"`.
- [ ] **AC-9** On subsequent page loads, the stored preference is read and applied before first paint.
- [ ] **AC-10** Clearing `localStorage` and reloading falls back to system preference detection (AC-1).

### Hydration & FOUC
- [ ] **AC-11** There are no React hydration mismatch warnings in the browser console related to the theme class on `<html>`.
- [ ] **AC-12** There is no visible color flash (FOUC) when loading any page with a stored `dark` preference.
- [ ] **AC-13** The solution works for both static and dynamically-rendered App Router pages.

### Accessibility
- [ ] **AC-14** The toggle button has a descriptive `aria-label` that reflects the current mode.
- [ ] **AC-15** The toggle is reachable via Tab and activatable via Enter and Space.
- [ ] **AC-16** Focus ring is visible on the toggle in both light and dark modes.

### CSS / Build
- [ ] **AC-17** All dark-mode color overrides live in `.dark {}` in `app/globals.css` — no inline styles or JS-injected CSS.
- [ ] **AC-18** Tailwind `dark:` utilities work on all components when `.dark` is on `<html>`.
- [ ] **AC-19** `npm run build` produces zero errors and zero new TypeScript errors.
- [ ] **AC-20** `npm run lint` produces zero new ESLint errors.

---

## Test Scenarios

| # | Given | When | Then | Type |
|---|-------|------|------|------|
| 1 | No stored preference; OS is dark | User opens the app for the first time | `<html>` has `.dark` at paint; no flash | Happy path |
| 2 | No stored preference; OS is light | User opens the app for the first time | `<html>` has no `.dark`; background is light | Happy path |
| 3 | Stored preference is `"dark"` | User reloads any page | Dark mode applied before first paint; no FOUC | Happy path |
| 4 | Stored preference is `"light"`; OS is dark | User reloads the page | Light mode used despite OS preference | Happy path |
| 5 | Stored preference is `"system"`; OS changes to dark at runtime | User is on the page without reloading | UI switches to dark in real-time via `matchMedia` listener | Happy path |
| 6 | App is in light mode | User clicks toggle to `dark` | `.dark` added to `<html>`; `localStorage["theme"]` = `"dark"` | Happy path |
| 7 | App is in dark mode | User clicks toggle to `light` | `.dark` removed from `<html>`; `localStorage["theme"]` = `"light"` | Happy path |
| 8 | App is in dark mode | User clicks toggle to `system` | App defers to OS; `localStorage["theme"]` = `"system"` | Happy path |
| 9 | Stored preference is `"dark"` | User opens app in a new tab | New tab opens in dark mode immediately | Happy path |
| 10 | App is in dark mode | User inspects browser console | Zero React hydration mismatch warnings | Happy path |
| 11 | `localStorage` is unavailable (private browsing restriction) | User loads the page | App falls back to OS preference silently; no JS error | Edge case |
| 12 | Stored value in `localStorage` is corrupted (e.g. `"banana"`) | User loads the page | App falls back to system preference; no crash | Edge / Negative |
| 13 | User rapidly clicks the toggle 5 times in < 1 second | Rapid clicks | UI settles on last selected state; no broken class list | Edge case |
| 14 | OS switches dark → light while `"system"` is stored | OS preference changes while tab is open | App updates in real-time to light mode | Edge case |
| 15 | Keyboard-only user | Presses Tab to focus toggle, then Enter | Theme switches; `aria-label` updates | Accessibility |
| 16 | Screen reader is active | Toggle is focused | SR announces current theme and action | Accessibility |
| 17 | Dark mode is active | Any page is loaded | All shadcn components render with correct dark palette | Happy path |
| 18 | JavaScript is disabled | User loads the page | Page renders in light mode (CSS default); no broken layout | Negative |

---

## Out of Scope

- Per-user server-side theme storage (no Supabase schema changes).
- High-contrast or custom color themes beyond light/dark/system.
- Theme-specific image or asset swapping.
- Admin-enforced or org-level theme override.
- Animated CSS transitions between modes.
- Cookie-based SSR theme pre-rendering (deferred to future iteration).

---

## Open Questions

1. **Toggle placement**: Should `ThemeToggle` live in a top navigation bar, sidebar footer, or settings dropdown? No shared header component exists yet — where should it be injected?
2. **Interaction model**: Linear cycle (`light → dark → system`) or a 3-option dropdown/popover?
3. **`next-themes` vs custom**: `next-themes` handles FOUC and hydration automatically. Is a third-party dependency acceptable, or must this be a custom implementation?
4. **SSR cookie approach**: If cookie-based SSR pre-rendering becomes needed later, it would require middleware changes. Should that be designed for now to avoid a refactor?
5. **Icon library**: Is Lucide (already in shadcn) the approved icon set for `Sun` / `Moon` / `Monitor` icons?

---

## Feature Module Mapping

```
Implements in: features/theme/
  components/
    - ThemeToggle       — button/dropdown to select light/dark/system
    - ThemeProvider     — wraps app with theme management context (wraps next-themes or custom)
  services/
    - getStoredTheme()  — reads and validates localStorage["theme"]; returns "light"|"dark"|"system"|null
    - setStoredTheme()  — writes validated theme value to localStorage
  hooks/
    - useTheme()        — returns { theme, setTheme, resolvedTheme }
  types/
    - Theme             — "light" | "dark" | "system"
    - ResolvedTheme     — "light" | "dark"

Integration points:
  - app/layout.tsx      — wraps children with ThemeProvider; adds blocking inline script for FOUC prevention
  - app/globals.css     — .dark {} block already defined; @custom-variant dark already set; NO CSS changes needed
  - App header / nav    — mount <ThemeToggle /> (location TBD per Open Question #1)
```
