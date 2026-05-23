# Feature: Reset Password (Set New Password)

## Overview

The Reset Password feature completes the password reset flow that begins when a user clicks the link in the reset password email sent by Supabase. The email link points to `/auth/callback?code=xxx&next=/auth/reset-password`. The callback route handler exchanges the code for a session (setting cookies on the redirect response) and redirects the user to `/auth/reset-password`. The reset-password page verifies the session via `getUser()` and renders the password update form. The user submits a new password via `supabase.auth.updateUser()`.

**Critical implementation detail:** The code exchange MUST happen in a Route Handler (`app/auth/callback/route.ts`), NOT in a Server Component. Server Components cannot reliably set cookies — `cookies().set()` is silently caught and discarded in RSC context, causing the session to be lost on subsequent server action calls. The callback route handler creates the `NextResponse.redirect()` first, then uses `createServerClient` with a custom `setAll` that writes cookies to both the request and the redirect response, ensuring the browser receives the session cookies.

---

## User Stories

- As a **user who clicked the reset password email link**, I want to set a new password, so that I can regain access to my account.
- As a **user setting a new password**, I want to confirm my new password, so that typos do not lock me out.
- As a **user**, I want to see clear error messages if my passwords do not match or are too weak, so that I can correct them.
- As a **user** with a valid session from the email link, I want to see the reset password form automatically, so that I don't see a blank page or an error.
- As a **user** with an expired or invalid link, I want to be redirected to `/auth/forgot-password`, so that I can request a new link.

---

## Acceptance Criteria

### Sub-feature: Callback Route (Code Exchange)

- [ ] The callback route at `/auth/callback` reads `code` and `next` query parameters from the URL.
- [ ] If no `code` is present, the user is redirected to `/auth/login?error=auth_callback_error`.
- [ ] The route creates a `NextResponse.redirect()` first, then creates a Supabase `createServerClient` with a custom `setAll` that writes cookies to both the `request` and the redirect `response`.
- [ ] `exchangeCodeForSession(code)` is called in the callback route — this is the ONLY place the code is exchanged (codes are single-use).
- [ ] On successful exchange, the user is redirected to the `next` path (defaults to `/dashboard`, but for password reset it is `/auth/reset-password`).
- [ ] On failed exchange, the user is redirected to `/auth/login?error=auth_callback_error`.
- [ ] Session cookies are set on the redirect response so the browser receives them.

### Sub-feature: Reset Password Page

- [ ] The reset password page is accessible at `/auth/reset-password`.
- [ ] The page does NOT read the `code` query parameter or call `exchangeCodeForSession` — the callback route already handled the exchange.
- [ ] The page verifies the user has a valid session via `supabase.auth.getUser()`.
- [ ] If session verification fails (no valid session), the user is redirected to `/auth/forgot-password?error=invalid_reset_link`.
- [ ] After successful session verification, the page renders a card containing: a **Heading** ("Set new password"), a **Description**, a **New Password** input with show/hide toggle, a **Confirm Password** input with show/hide toggle, and an **Update password** submit button.
- [ ] Both password fields operate independently for visibility toggle.
- [ ] Submitting with **passwords matching and meeting Supabase minimum** (6 chars) calls `supabase.auth.updateUser({ password })`; on success redirects to `/dashboard` with a success toast.
- [ ] Submitting with **password ≠ confirmPassword** shows error "Passwords do not match." in `role="alert"`; no update call is made.
- [ ] Submitting with **password too short** (< 6 chars) shows error "Password must be at least 6 characters."
- [ ] While the update request is in-flight (`isPending`), the submit button displays "Updating…" and is `disabled`; all inputs are also `disabled`.
- [ ] The show/hide toggles for **Password** and **Confirm Password** operate independently; each has an accessible `aria-label`.
- [ ] Error state is cleared on each new submission attempt.

### Sub-feature: Forgot Password Link on Login

- [ ] The login form (`LoginForm`) displays a "Forgot your password?" link below the submit button, aligned right.
- [ ] The link navigates to `/auth/forgot-password`.
- [ ] The link uses `next/link` for client-side navigation.

---

## Test Scenarios

| # | Given | When | Then | Type |
|---|-------|------|------|------|
| RP1 | User clicked valid reset email link | Arrives at `/auth/callback?code=xxx&next=/auth/reset-password` | Code is exchanged, session cookies are set on redirect response, user is redirected to `/auth/reset-password` | Happy path |
| RP2 | User arrives at `/auth/callback` with no `code` | Page loads | User is redirected to `/auth/login?error=auth_callback_error` | Negative |
| RP3 | User arrives at `/auth/callback?code=invalid_code` | Code exchange fails | User is redirected to `/auth/login?error=auth_callback_error` | Negative |
| RP4 | User arrives at `/auth/reset-password` with valid session (after callback redirect) | Page loads | Reset password form is displayed | Happy path |
| RP5 | User arrives at `/auth/reset-password` with no valid session | `getUser()` fails or returns null | User is redirected to `/auth/forgot-password?error=invalid_reset_link` | Negative |
| RP6 | User is on `/auth/reset-password` with valid session | Submits with **matching passwords** (≥6 chars) | Password is updated; redirected to `/dashboard` with toast success | Happy path |
| RP7 | User is on `/auth/reset-password` with valid session | Submits with **password ≠ confirmPassword** | Error "Passwords do not match." appears in alert; no API call made | Negative |
| RP8 | User is on `/auth/reset-password` with valid session | Submits with **password < 6 chars** | Error "Password must be at least 6 characters." appears in alert | Negative |
| RP9 | User is on `/auth/reset-password` with valid session | Clicks **Update password** twice rapidly | Only one `updateUser` call dispatched; button is `disabled` during request | Edge case |
| RP10 | User is on `/auth/reset-password` with valid session | Toggles **show password** on Password field | Only Password field reveals value; Confirm Password remains masked | Edge case |
| RP11 | User is on `/auth/reset-password` with valid session | Toggles **show password** on Confirm Password field | Only Confirm Password field reveals value; Password remains masked | Edge case |
| RP12 | User sees a "Passwords do not match" error, fixes mismatch, and resubmits | Submits with matching passwords | Error is cleared; on success redirected to `/dashboard` | Edge case |
| RP13 | User is on `/auth/login` | Clicks "Forgot your password?" link | Navigates to `/auth/forgot-password` | Happy path |

---

## Architecture Decision: Why Code Exchange Happens in Route Handler, Not RSC

**Problem:** Calling `exchangeCodeForSession()` in a Server Component (RSC) page does not reliably set session cookies. The `cookies().set()` call in `lib/supabase/server.ts` is wrapped in a `try/catch` that silently catches errors when called from an RSC context. This means the session is never persisted to the browser, and subsequent server action calls (e.g., `updateUser()`) fail with `AuthSessionMissingError`.

**Solution:** The code exchange must happen in a Route Handler (`app/auth/callback/route.ts`) which constructs a `NextResponse.redirect()` and explicitly sets Supabase session cookies on that response object. The `createServerClient` is instantiated with a custom `setAll` that writes cookies to both the incoming request and the outgoing redirect response, ensuring the browser receives and stores the session cookies.

**Flow:**
```
Email link → /auth/callback?code=xxx&next=/auth/reset-password
  → Route Handler: exchangeCodeForSession(code) + set cookies on redirect response
  → 302 redirect to /auth/reset-password (with session cookies in browser)
  → RSC page: getUser() → session valid → render ResetPasswordForm
  → User submits → server action: updateUser({ password }) → session cookies present → SUCCESS
```

---

## Out of Scope

- **Password strength meter UI** — validation is delegated to Supabase's minimum requirement (6 chars).
- **Session management after update** — Supabase handles session refresh on `updateUser`.
- **Email re-verification after password change** — not required.
- **OAuth users resetting password** — these users may not have a password set; Supabase error is surfaced as-is.

---

## Open Questions

1. **Error handling UX on forgot-password page** — When the code is invalid/expired, we redirect to `/auth/forgot-password?error=invalid_reset_link`. A toast could be shown on the forgot-password page to explain the error, but this is low priority.
2. **`NEXT_PUBLIC_SITE_URL` environment variable** — The `redirectTo` in `forgotPasswordUser` uses `NEXT_PUBLIC_SITE_URL` with fallback `http://localhost:3000`. This must be set correctly in production for the reset password email link to point to the correct domain.

---

## Feature Module Mapping

```
Implements in: features/auth/

  components/
    — ResetPasswordForm        (reset-password-form.tsx)   NEW
    — LoginForm                (login-form.tsx)            MODIFIED — added "Forgot your password?" link

  services/
    — forgotPasswordUser()     (auth-service.ts)           MODIFIED — redirectTo changed to /auth/callback?next=/auth/reset-password
    — resetPasswordUser()      (auth-service.ts)           NEW  — calls supabase.auth.updateUser()

  types/
    — ResetPasswordFormData    (types/index.ts)             NEW  { password: string; confirmPassword: string }

app/(auth)/
    — auth/reset-password/page.tsx                         NEW  — verifies session via getUser(), renders ResetPasswordForm

app/auth/
    — auth/callback/route.ts                               MODIFIED — rewritten to set cookies on redirect response
```