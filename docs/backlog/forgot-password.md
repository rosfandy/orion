# Feature: Forgot Password

## Overview

The Forgot Password feature allows users who cannot remember their password to request a password reset email. The flow uses Supabase's `resetPasswordForEmail` method, which sends an email containing a time-limited reset link. The link points to `/auth/callback?code=xxx&next=/auth/reset-password`, which exchanges the code for a session and redirects the user to the reset password form (see `docs/backlog/reset-password.md`). Users who already have an active session are redirected away from the forgot password page. A "Forgot your password?" link is provided on the login form for easy navigation.

---

## User Stories

- As an **unauthenticated user** who has forgotten my password, I want to request a password reset email by entering my registered email address, so that I can regain access to my account.
- As an **unauthenticated user**, I want to see a confirmation that a reset email was sent after submitting the form, so that I know the request was received.
- As an **unauthenticated user**, I want to see a clear error if something goes wrong, so that I know to try again.
- As an **unauthenticated user**, I want the submit button to be disabled while the request is processing, so that I cannot accidentally submit twice.
- As an **authenticated user** who navigates to `/auth/forgot-password`, I want to be redirected away, so that I cannot request a reset for my own session.
- As an **unauthenticated user** who enters an empty email, I want to see an inline validation error before any request is sent.
- As a **user on the login page**, I want a "Forgot your password?" link, so that I can navigate to the forgot password page without typing the URL.

---

## Acceptance Criteria

### Sub-feature: Forgot Password Page

- [ ] The forgot password page is accessible at `/auth/forgot-password`.
- [ ] The page renders a card containing: a **Heading** ("Reset your password"), a **Description** explaining that an email will be sent with a reset link, an **Email** text input, and a **Send reset email** submit button.
- [ ] The form uses `noValidate` — browser-native validation is suppressed; all validation is handled client-side.
- [ ] Submitting the form with a **valid, registered email** displays a success message ("Check your email — we've sent a password reset link to {email}") and the form is replaced by a confirmation card.
- [ ] Submitting the form with an **empty email** displays "Please enter your email address." in the alert paragraph; no Supabase request is fired.
- [ ] Submitting with an **invalid email format** displays "Please enter a valid email address."; no Supabase request is fired.
- [ ] If Supabase returns an error, a generic "Something went wrong. Please try again later." message is displayed. (Note: Supabase does not expose a distinct error code for unregistered emails to prevent enumeration.)
- [ ] While the request is in-flight (`isPending`), the submit button displays "Sending…" and is `disabled`; the email input is also `disabled`.
- [ ] An **already-authenticated** user who navigates to `/auth/forgot-password` is redirected to `/dashboard` before the form renders (RSC-level guard using `getSession()`).
- [ ] Error state is cleared (`setError(null)`) on each new submission attempt.
- [ ] After a successful submission, a **"Back to sign in"** button is shown that navigates to `/auth/login`.
- [ ] The email input has `aria-describedby="email-error"` linking it to the error paragraph with `id="email-error"`.

### Sub-feature: Forgot Password Link on Login

- [ ] The login form (`LoginForm`) displays a "Forgot your password?" link below the submit button, aligned right.
- [ ] The link uses `next/link` for client-side navigation to `/auth/forgot-password`.

### Sub-feature: Email Redirect Configuration

- [ ] `forgotPasswordUser()` calls `supabase.auth.resetPasswordForEmail()` with `redirectTo` set to `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/reset-password`.
- [ ] The callback route at `/auth/callback` exchanges the code for a session and redirects to the `next` path (see `docs/backlog/reset-password.md` for full callback route spec).

---

## Test Scenarios

| # | Given | When | Then | Type |
|---|-------|------|------|------|
| F1 | User is unauthenticated and on `/auth/forgot-password` | Submits a **registered email** | Success message "Check your email — we've sent a password reset link to {email}" is shown; form is replaced by confirmation | Happy path |
| F2 | User is unauthenticated and on `/auth/forgot-password` | Submits with **empty email field** | Error "Please enter your email address." appears in alert; no Supabase request fired | Edge case |
| F3 | User is unauthenticated and on `/auth/forgot-password` | Submits with a **malformed email** (e.g. `notanemail`) | Error "Please enter a valid email address." appears in alert; no Supabase request fired | Edge case |
| F4 | User is unauthenticated and on `/auth/forgot-password` | Clicks **Send reset email** twice in rapid succession | Only one `resetPasswordForEmail` call is dispatched; button is `disabled` after first click | Edge case |
| F5 | User is unauthenticated and on `/auth/forgot-password` | Supabase returns a **network error** | Error "Something went wrong. Please try again later." is displayed; form is not permanently disabled | Negative |
| F6 | User sees an error, then corrects input and resubmits successfully | Submits again with a valid registered email | Previous error is cleared; success message is shown | Edge case |
| F7 | User is unauthenticated and on `/auth/forgot-password` after successful submission | Clicks **"Back to sign in"** button | Navigated to `/auth/login` | Happy path |
| F8 | User **is already authenticated** | Navigates to `/auth/forgot-password` | Redirected to `/dashboard` immediately; form is never rendered | Edge case |
| F9 | User is on `/auth/login` | Clicks **"Forgot your password?"** link | Navigated to `/auth/forgot-password` | Happy path |
| F10 | User is unauthenticated and on `/auth/forgot-password` | Submits a **registered email**, then checks email | Email link points to `/auth/callback?code=xxx&next=/auth/reset-password` | Happy path |

---

## Out of Scope

- **Password reset UI** — Handled by the Reset Password feature (see `docs/backlog/reset-password.md`).
- **Resend timer** — No cooldown timer is shown after a successful submission.
- **OAuth users** — Users who signed up via OAuth may not have a password set. Supabase error is surfaced as-is.
- **Email template customization** — The content of the reset email is controlled in the Supabase dashboard, not in code.
- **Rate limiting** — Throttling of reset requests is an infrastructure concern handled by Supabase.
- **Account lockout** — No lockout after multiple failed reset attempts.

---

## Open Questions

1. **`NEXT_PUBLIC_SITE_URL` environment variable** — Must be set correctly in production for the reset email link to point to the right domain. Currently defaults to `http://localhost:3000`.
2. **OAuth users without passwords** — Should the UI detect and surface a special message for users who signed up via OAuth and attempt a password reset?
3. **Success message vs. email delivery** — The success message is shown immediately after `resetPasswordForEmail` returns, but there is no guarantee the email is delivered. Should the UI note "If you don't see the email, check your spam folder"?
4. **Error handling for invalid/expired links** — When redirected to `/auth/forgot-password?error=invalid_reset_link`, should a toast message appear explaining why?

---

## Feature Module Mapping

```
Implements in: features/auth/

  components/
    — ForgotPasswordForm    (forgot-password-form.tsx)    NEW
    — LoginForm             (login-form.tsx)              MODIFIED — added "Forgot your password?" link

  services/
    — forgotPasswordUser()  (auth-service.ts)            NEW — redirectTo: /auth/callback?next=/auth/reset-password

  types/
    — ForgotPasswordFormData (types/index.ts)             NEW  { email: string }
    — AuthResult already covers { success?, error? }     EXISTING

app/(auth)/
    — auth/forgot-password/page.tsx                      NEW  (RSC auth guard via getSession() + renders ForgotPasswordForm)
```