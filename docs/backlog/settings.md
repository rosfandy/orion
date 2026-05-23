# Feature: Settings

## Overview

Halaman Settings adalah pusat konfigurasi akun dan workspace yang terinspirasi dari desain Notion. Pengguna dapat mengelola profil pribadi, preferensi tampilan, keamanan akun, dan pengaturan workspace dari satu tempat. Halaman ini dapat diakses melalui sidebar atau navbar, menggunakan layout dua-kolom: navigasi seksi di kiri, konten di kanan. Settings dibagi menjadi dua grup besar — **Account** (per-user) dan **Workspace** (per-workspace).

---

## User Stories

### Account Settings
- As an authenticated user, I want to update my display name and avatar, so that my profile looks accurate across the app.
- As an authenticated user, I want to change my email address, so that I can keep my login credentials current.
- As an authenticated user, I want to change my password, so that I can maintain account security.
- As an authenticated user, I want to add/edit my bio, so that others can learn about me.
- As an authenticated user, I want to set my preferred theme (light/dark/system), so that the app matches my visual preference.
- As an authenticated user, I want to set my preferred font size, so that I can optimize readability.
- As an authenticated user, I want to set my language and timezone preferences, so that dates and times display correctly for my location.
- As an authenticated user, I want to view and revoke active sessions, so that I can protect my account from unauthorized access.

### Workspace Settings
- As a workspace owner, I want to update the workspace name, icon, and description, so that I can keep workspace information accurate.
- As a workspace owner, I want to delete a workspace, so that I can remove workspaces I no longer need.

---

## Acceptance Criteria

### AC-1: Settings Layout & Navigation
- [ ] Route `/dashboard/settings` exists and is accessible to authenticated users only.
- [ ] Settings page uses a two-column layout: left nav (sections list) + right content panel.
- [ ] On mobile (< 768px), left nav collapses into a top tab bar or a dropdown selector.
- [ ] Active section is highlighted in the left nav.
- [ ] URL updates to reflect the active section (e.g., `/dashboard/settings?section=account`).
- [ ] Navigating directly to a section URL loads the correct section.
- [ ] Unauthenticated users visiting `/dashboard/settings` are redirected to `/auth/login`.

### AC-2: My Account — Display Name & Avatar
- [ ] "My Account" section displays current `full_name` and `avatar_url` from the `profiles` table.
- [ ] User can upload a new avatar image (JPEG/PNG/WebP, max 2MB) via file picker.
- [ ] Avatar preview is shown immediately after file selection (before save).
- [ ] User can remove the current avatar (resets to a generated initials fallback).
- [ ] User can update display name (required, max 100 chars).
- [ ] Saving shows a success toast via `sonner`.
- [ ] Validation errors are shown inline (empty name, file too large, unsupported format).
- [ ] Save button is disabled while request is in-flight.

### AC-3: My Account — Email Change
- [ ] Current email is displayed (read-only, sourced from Supabase Auth).
- [ ] User can enter a new email address and click "Update Email".
- [ ] Supabase sends a confirmation email to the new address before the change takes effect.
- [ ] A toast informs the user to check their new email to confirm.
- [ ] Invalid email format shows inline validation error.

### AC-4: My Account — Password Change
- [ ] Password change form has: Current Password, New Password, Confirm New Password fields.
- [ ] All fields are required.
- [ ] New password must be at least 8 characters.
- [ ] New password and confirm must match; if not, inline error is shown.
- [ ] On success, a success toast is shown and fields are cleared.
- [ ] On failure (wrong current password), error message is shown inline.

### AC-5: My Profile — Bio
- [ ] "My Profile" section shows a textarea for `bio` (max 300 chars).
- [ ] Character count is displayed below the textarea.
- [ ] Saving bio updates the `profiles` table via `updateProfile()`.
- [ ] Success and error states are shown via toast.

### AC-6: My Profile — Social Links
- [ ] User can add/edit/remove social links (Twitter/X, GitHub, LinkedIn, Website).
- [ ] Each link is validated as a valid URL before saving.
- [ ] Social links are stored in a new `social_links` JSONB column on the `profiles` table.
- [ ] Up to 4 social links can be saved.

### AC-7: Appearance
- [ ] "Appearance" section shows theme options: Light, Dark, System.
- [ ] Selecting a theme updates immediately (no save button needed) using the existing theme feature.
- [ ] Font size can be set to: Small, Default, Large.
- [ ] Font size preference is stored in a new `user_preferences` table (keyed by `user_id`).
- [ ] Font size setting applies globally to the app immediately after selection.

### AC-8: Language & Region
- [ ] User can select a language from a dropdown (initial scope: English only, but structure is extensible).
- [ ] User can select a timezone from a searchable dropdown (IANA timezone list).
- [ ] User can select a date format (e.g., MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD).
- [ ] Preferences are saved to the `user_preferences` table.
- [ ] Save button shows success/error toast.

### AC-9: Security — Active Sessions
- [ ] "Security" section displays a list of active Supabase Auth sessions (device, last active, IP if available).
- [ ] User can click "Sign out all other sessions" to revoke all sessions except the current one.
- [ ] A confirmation dialog is shown before revoking sessions.
- [ ] After revoking, the session list refreshes.

### AC-10: Workspace Settings
- [ ] "Workspace Settings" section is only visible when a workspace context is active (workspace selected in sidebar).
- [ ] The section is only editable by the workspace `owner_id`.
- [ ] Owner can update workspace `name` (required, max 80 chars), `icon` (emoji picker or URL), `description` (optional, max 200 chars).
- [ ] Owner can delete the workspace after typing the workspace name in a confirmation input.
- [ ] On delete, user is redirected to `/dashboard` and a toast confirms deletion.
- [ ] Non-owners viewing workspace settings see fields as read-only with an "Only the owner can edit" note.

---

## Test Scenarios

| # | Given | When | Then | Type |
|---|-------|------|------|------|
| 1 | User is authenticated | Navigates to `/dashboard/settings` | Settings page loads with "My Account" section active | Happy path |
| 2 | User is unauthenticated | Navigates to `/dashboard/settings` | Redirected to `/auth/login` | Negative |
| 3 | User is on My Account section | Uploads a valid PNG avatar < 2MB and saves | Avatar updates in UI and profile is persisted | Happy path |
| 4 | User is on My Account section | Uploads a file > 2MB | Inline error "File must be under 2MB", no upload occurs | Edge case |
| 5 | User is on My Account section | Uploads a `.pdf` file | Inline error "Only JPEG, PNG, or WebP images are allowed" | Negative |
| 6 | User is on My Account section | Clears display name and saves | Inline validation error "Display name is required" | Negative |
| 7 | User is on My Account section | Enters display name of 101 characters | Inline error "Max 100 characters" | Edge case |
| 8 | User is on My Account section | Enters a new valid email and submits | Toast: "Check your new email to confirm the change" | Happy path |
| 9 | User is on My Account section | Enters invalid email format | Inline validation error shown | Negative |
| 10 | User is on My Account section | Submits password change with mismatched confirm | Inline error "Passwords do not match" | Negative |
| 11 | User is on My Account section | Submits password change with new password < 8 chars | Inline error "Min 8 characters" | Edge case |
| 12 | User is on My Account section | Submits correct password change | Success toast, fields cleared | Happy path |
| 13 | User is on My Profile section | Saves bio of exactly 300 chars | Bio saved successfully | Edge case |
| 14 | User is on My Profile section | Types 301st character in bio | Character counter turns red, save button disabled | Edge case |
| 15 | User is on My Profile section | Enters invalid URL in social link | Inline error "Please enter a valid URL" | Negative |
| 16 | User is on Appearance section | Clicks "Dark" theme | Theme switches to dark immediately, no save needed | Happy path |
| 17 | User is on Appearance section | Selects "Large" font size | Font size increases immediately and persists on reload | Happy path |
| 18 | User is on Language & Region | Selects timezone "Asia/Jakarta" and saves | Preference saved, success toast shown | Happy path |
| 19 | User is on Security section | Clicks "Sign out all other sessions" and confirms | All other sessions revoked, list refreshes | Happy path |
| 20 | User is on Security section | Clicks "Sign out all other sessions" then cancels confirmation | No sessions are revoked | Edge case |
| 21 | Workspace owner is on Workspace Settings | Updates workspace name to empty string and saves | Inline error "Workspace name is required" | Negative |
| 22 | Workspace owner is on Workspace Settings | Types workspace name in delete confirmation and confirms | Workspace deleted, redirected to `/dashboard` | Happy path |
| 23 | Workspace owner is on Workspace Settings | Types wrong name in delete confirmation | Delete button remains disabled | Edge case |
| 24 | Non-owner views Workspace Settings | Loads workspace settings section | Fields are read-only, "Only the owner can edit" note shown | Negative |
| 25 | User is on any section | Network request fails on save | Error toast "Something went wrong. Please try again." | Negative |
| 26 | User is on Settings on mobile viewport | Loads settings page | Left nav collapses, top tab/dropdown shows sections | Edge case |

---

## Out of Scope

- **My Notifications**: notification preferences (email/mobile/desktop) — deferred; requires notification infrastructure.
- **My Connections**: third-party integrations/OAuth app connections — deferred; no integrations built yet.
- **Plans & Billing**: subscription plans and payment methods — deferred; no billing system configured.
- **Workspace Members**: invite members, manage roles (owner/member/guest) — deferred; workspace is currently single-owner.
- **Two-Factor Authentication (2FA)**: deferred; Supabase 2FA setup requires additional configuration.
- **Audit Log**: security audit log — deferred; requires dedicated logging infrastructure.
- **Account deletion**: permanently deleting the user account.
- **Custom domain for workspace**: workspace domain feature.

---

## Open Questions

1. **Avatar storage**: Should avatars be stored in Supabase Storage (a new `avatars` bucket) or remain as a URL string in `profiles.avatar_url`? Using Supabase Storage is recommended for upload support — needs admin to create the bucket with public access.
2. **Font size implementation**: Should font size be stored in DB (`user_preferences`) and hydrated server-side, or stored in `localStorage` only and applied client-side? DB approach avoids flash-of-wrong-size but adds a server round-trip.
3. **Language scope**: Is English-only sufficient for the initial release, or should additional locales (e.g., Bahasa Indonesia) be ready at launch?
4. **Active sessions API**: Supabase does not natively expose a list of all active sessions per user via the client SDK. Listing sessions may require a custom Edge Function or the Supabase Admin API — needs admin to verify feasibility.
5. **Workspace context in Settings**: How is the "current workspace" determined — from URL param, from last-visited, or from sidebar selection? This affects how Workspace Settings is scoped.
6. **Social links schema**: Confirm `social_links` as JSONB on `profiles` vs. a separate `profile_social_links` table. JSONB is simpler for ≤4 fixed platforms.

---

## Feature Module Mapping

```
Implements in: features/settings/
  components/
    - SettingsLayout         — two-column layout shell with section nav
    - SettingsNav            — left navigation list with active state
    - AccountSection         — My Account: avatar, name, email, password
    - ProfileSection         — My Profile: bio, social links
    - AppearanceSection      — theme picker + font size selector
    - LanguageRegionSection  — language + timezone + date format
    - SecuritySection        — active sessions list + revoke button
    - WorkspaceSettingsSection — workspace name/icon/description + delete
    - AvatarUploader         — file input with preview and validation
    - DeleteWorkspaceDialog  — confirmation dialog with name-match input
  services/
    - updateAccountSettings()     — update full_name via profiles upsert
    - updateEmail()               — Supabase auth.updateUser({ email })
    - updatePassword()            — Supabase auth.updateUser({ password })
    - uploadAvatar()              — Supabase Storage upload to avatars bucket
    - updateProfileSection()      — update bio + social_links on profiles
    - getUserPreferences()        — fetch from user_preferences table
    - upsertUserPreferences()     — upsert language/timezone/dateFormat/fontSize
    - getActiveSessions()         — via Supabase Admin API or Edge Function
    - revokeOtherSessions()       — Supabase auth.signOut({ scope: 'others' })
    - updateWorkspaceSettings()   — wraps existing updateWorkspaceAction()
    - deleteWorkspaceSettings()   — wraps existing deleteWorkspaceAction()
  types/
    - SettingsSection            — union type for nav sections
    - UserPreferences            — language, timezone, dateFormat, fontSize
    - SocialLinks                — { twitter, github, linkedin, website }
    - AccountFormData            — display name update
    - PasswordFormData           — current/new/confirm password
    - AppearanceFormData         — theme, fontSize

Route:
  app/dashboard/settings/
    page.tsx                     — RSC: loads profile + preferences server-side
    layout.tsx (optional)        — if settings needs its own sub-layout

Database changes required:
  1. profiles table   — ADD COLUMN social_links JSONB DEFAULT '{}'
  2. user_preferences — NEW TABLE (id, user_id FK, language, timezone, date_format, font_size, updated_at)
  3. Supabase Storage — NEW BUCKET avatars (public read, authenticated write)
  4. RLS policies     — user_preferences: SELECT/INSERT/UPDATE for auth.uid() = user_id

Existing services reused:
  - features/profile/services/profile-service.ts  → updateProfile()
  - features/workspaces/services/workspace-service.ts → updateWorkspaceAction(), deleteWorkspaceAction()
  - features/theme/  → existing theme toggle logic
```
