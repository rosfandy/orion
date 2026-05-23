# Feature: User Profile — Navbar Dropdown + Profile Page

## Overview

This feature replaces the plain email text in the dashboard navbar with an avatar icon that opens a dropdown menu (Profile + Sign out). It also introduces a `/dashboard/profile` page where authenticated users can view and edit their profile (`full_name`, `avatar_url`, `bio`). Profile data is persisted in a new `profiles` table in Supabase, protected by RLS so each user can only access their own row. The form uses sonner toasts for feedback. This feature touches the navigation module, introduces a new `features/profile` module, and requires a Supabase schema change before any code ships.

---

## User Stories

- As an **authenticated user**, I want to see an avatar icon in the navbar instead of raw email text, so that the interface feels polished and the header is less cluttered.
- As an **authenticated user**, I want to click the avatar icon and see a dropdown with my display name (or email), a "Profile" link, and a "Sign out" option, so that I can quickly navigate or log out without hunting for separate controls.
- As an **authenticated user**, I want to navigate to `/dashboard/profile` from the dropdown, so that I can access my profile page in one click.
- As an **authenticated user**, I want to view my current `full_name`, `avatar_url`, and `bio` pre-filled in the profile form, so that I can see what is already saved before making changes.
- As an **authenticated user**, I want to edit my `full_name`, `avatar_url`, and `bio` and save the changes, so that my profile reflects accurate, up-to-date information.
- As an **authenticated user**, I want to see a success toast after saving my profile, so that I have immediate confirmation the update worked.
- As an **authenticated user**, I want to see a specific error toast if the save fails, so that I understand what went wrong and can take action.
- As an **unauthenticated user** who tries to access `/dashboard/profile` directly, I want to be redirected to `/auth/login`, so that private profile data is never exposed.

---

## Acceptance Criteria

### Sub-feature: Navbar Dropdown

- [ ] The plain email text and standalone `LogOut` icon button are removed from the navbar.
- [ ] An avatar icon button (`UserCircle` from lucide-react) appears in the top-right area of the navbar, to the right of `ThemeToggle`.
- [ ] Clicking the avatar button opens a `DropdownMenu` (shadcn).
- [ ] The first item in the dropdown is a non-clickable header showing `full_name` if set, otherwise the user's email.
- [ ] A "Profile" `DropdownMenuItem` navigates to `/dashboard/profile` on click.
- [ ] A "Sign out" `DropdownMenuItem` calls `signOutAction()` on click, redirecting to `/auth/login`.
- [ ] The dropdown closes after any item is selected or when the user clicks outside it.
- [ ] The avatar button has `aria-label="User menu"`.
- [ ] `NavbarProps` updated: `email: string` replaced with `displayName: string`.

### Sub-feature: Profile Page (`/dashboard/profile`)

- [ ] The page is accessible at `/dashboard/profile` within the dashboard layout.
- [ ] Unauthenticated visit redirects to `/auth/login` (via `app/dashboard/layout.tsx` guard).
- [ ] The page fetches the user's profile from `profiles` table via `getProfile(userId)`.
- [ ] If no profile row exists (new user), the form renders with all fields empty — no error thrown.
- [ ] The form contains three labeled fields: **Full Name** (`full_name`), **Avatar URL** (`avatar_url`), **Bio** (`bio`).
- [ ] All fields are pre-filled with current saved values (empty strings if null).
- [ ] Submitting calls `updateProfile(userId, data)` which performs an upsert.
- [ ] On successful upsert: `toast.success("Profile updated!")`.
- [ ] On failure: `toast.error(<specific message from catalogue>)`.
- [ ] Submit button disabled while in-flight; re-enabled after completion.
- [ ] Submit button label: `"Save changes"` at idle, `"Saving…"` while in-flight.
- [ ] Profile page is an async RSC that passes data as props to `ProfileForm` (`'use client'`).

### Sub-feature: Supabase `profiles` Table & RLS

- [ ] `profiles` table exists with columns: `id` (uuid PK, FK → `auth.users(id)` ON DELETE CASCADE), `full_name` (text, nullable), `avatar_url` (text, nullable), `bio` (text, nullable), `updated_at` (timestamptz, default `now()`).
- [ ] RLS is enabled on `profiles`.
- [ ] SELECT policy `profiles_select_own`: `auth.uid() = id`.
- [ ] INSERT policy `profiles_insert_own`: `auth.uid() = id`.
- [ ] UPDATE policy `profiles_update_own`: `auth.uid() = id`.
- [ ] No DELETE policy (cascade from `auth.users`).
- [ ] Reading another user's row returns 0 rows (not an error).

---

## Test Scenarios

| #  | Given | When | Then | Type |
|----|-------|------|------|------|
| **NAVBAR DROPDOWN** |||||
| N1 | Authenticated user is on any dashboard page | Views the navbar | Avatar icon button is visible; no plain email text or standalone LogOut button | Happy path |
| N2 | Authenticated user with `full_name = "Alice"` | Clicks the avatar icon | Dropdown shows "Alice" as non-clickable header, "Profile" item, "Sign out" item | Happy path |
| N3 | Authenticated user with no `full_name` set | Clicks the avatar icon | Dropdown header shows the user's email address | Edge case |
| N4 | Authenticated user views the dropdown | Clicks "Profile" | Navigates to `/dashboard/profile`; dropdown closes | Happy path |
| N5 | Authenticated user views the dropdown | Clicks "Sign out" | `signOutAction()` called; redirected to `/auth/login` | Happy path |
| N6 | Authenticated user views the dropdown | Clicks outside | Dropdown closes; no navigation | Edge case |
| N7 | Screen reader user focuses the avatar button | Reads the button | `aria-label="User menu"` is announced | Edge case |
| **PROFILE PAGE** |||||
| P1 | User with existing profile row | Navigates to `/dashboard/profile` | Form pre-filled with saved `full_name`, `avatar_url`, `bio` | Happy path |
| P2 | User with no profile row | Navigates to `/dashboard/profile` | Form renders with all fields empty; no error shown | Edge case |
| P3 | User on profile page | Edits `full_name` to "Bob" and clicks "Save changes" | `updateProfile` called; `toast.success("Profile updated!")` shown | Happy path |
| P4 | User on profile page | Clears all fields and clicks "Save changes" | Upsert saves null values; success toast shown | Edge case |
| P5 | User on profile page | Clicks "Save changes" while request is in-flight | Button disabled + shows "Saving…"; no duplicate request | Edge case |
| P6 | User on profile page | `updateProfile` returns a Supabase error | `toast.error(<specific catalogue message>)` shown; form not reset | Negative |
| P7 | User on profile page | Network unreachable on submit | `toast.error("Something went wrong. Please try again later.")` shown | Negative |
| P8 | Unauthenticated user | Navigates to `/dashboard/profile` directly | Redirected to `/auth/login` before page renders | Negative |
| **RLS** |||||
| R1 | User A is authenticated | Calls `getProfile` with User B's `userId` | Returns `null`; no data leakage | Negative |
| R2 | User A is authenticated | Calls `updateProfile` with User B's `userId` | Upsert affects 0 rows | Negative |

---

## Error Message Catalogue

| Condition | Toast message |
|---|---|
| `error.code === '23503'` (FK violation) | `"Profile could not be saved: user account not found."` |
| `error.code === '23514'` (check constraint) | `"One or more field values are invalid. Please review your input."` |
| `error.code === 'PGRST301'` (RLS / JWT expired) | `"Your session has expired. Please sign in again."` |
| Any other `error.message` | `"Failed to update profile: <error.message>"` |
| Network / fetch failure | `"Something went wrong. Please try again later."` |
| Success | `"Profile updated!"` (via `toast.success`) |

---

## Out of Scope

- Avatar image file upload — `avatar_url` is plain text URL only.
- Changing email or password from the profile page.
- Public-facing profile pages.
- Account deletion from the UI.
- Real-time profile sync across tabs.
- Username / handle field.
- Auto-creating `profiles` row on `auth.users` creation (row created lazily via upsert).

---

## Open Questions

1. **`displayName` source in navbar** — Should the layout also call `getProfile()` to retrieve `full_name` for the dropdown, or is email always acceptable as fallback without an extra DB call per page load?
2. **Avatar image rendering** — Should the avatar button eventually render the user's `avatar_url` image if set?
3. **`updated_at` strategy** — Client-side in the upsert payload, or managed by a DB trigger?
4. **Profile page title** — Should `/dashboard/profile` render with "Profile" in the navbar title?
5. **Field length constraints** — Max character limits for `full_name` or `bio`?

---

## Feature Module Mapping

```
features/navigation/components/navbar.tsx         — UPDATE  (replace email+LogOut with avatar DropdownMenu)
features/profile/components/profile-form.tsx      — NEW     ('use client')
features/profile/services/profile-service.ts      — NEW     ('use server'; getProfile, updateProfile)
features/profile/types/index.ts                   — NEW     (Profile, ProfileUpdate types)
app/dashboard/profile/page.tsx                    — NEW     (async RSC)
Supabase: profiles table + RLS policies           — NEW     (administrator task)
```
