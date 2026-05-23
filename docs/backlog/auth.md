# Feature: Auth Module — Login & Register

## Overview

The Auth module provides the entry points for identity in the application. It exposes two flows: **Login** (email + password sign-in via Supabase `signInWithPassword`) and **Register** (new account creation via Supabase `signUp` with a client-enforced password-confirmation check). Both flows are housed under the `app/(auth)/` route group, rendered centred on a full-screen layout. On success both flows redirect the user to `/dashboard`; already-authenticated visitors are redirected away from the auth pages before the form is ever rendered — this guard is enforced at the RSC (page) layer using `supabase.auth.getClaims()`.

---

## User Stories

### Login

- As an **unauthenticated user**, I want to sign in with my email and password, so that I can access my personal dashboard.
- As an **unauthenticated user**, I want to see a clear error message when my credentials are wrong, so that I know to try again without being confused about what failed.
- As an **unauthenticated user**, I want the submit button to be disabled while my request is processing, so that I cannot accidentally submit the form twice.
- As an **unauthenticated user**, I want to toggle password visibility, so that I can verify what I have typed before submitting.
- As an **authenticated user** who visits `/auth/login`, I want to be automatically redirected to `/dashboard`, so that I am never shown a redundant sign-in screen.

### Register

- As an **unauthenticated user**, I want to create a new account using my email address and a chosen password, so that I can start using the application.
- As an **unauthenticated user**, I want to confirm my password during registration, so that typos do not lock me out of my new account.
- As an **unauthenticated user**, I want to see a clear error if my passwords do not match, so that I can correct the mismatch before submitting to the server.
- As an **unauthenticated user**, I want to see a clear error if my email is already registered, so that I know to sign in instead of creating a duplicate account.
- As an **unauthenticated user**, I want the submit button to be disabled while my request is processing, so that I cannot trigger duplicate account creation.
- As an **unauthenticated user**, I want to toggle visibility on both password fields independently, so that I can verify each value before submitting.
- As an **authenticated user** who visits the register page, I want to be automatically redirected to `/dashboard`, so that I cannot accidentally create a second account while signed in.

---

## Acceptance Criteria

### Sub-feature: Login

- [ ] The login page is accessible at `/auth/login`.
- [ ] The page renders a card containing: an **Email** text input, a **Password** input with a show/hide toggle button, and a **Sign in** submit button.
- [ ] Both inputs use `noValidate` on the form — browser-native validation is suppressed; all validation is handled by the service layer.
- [ ] Submitting the form with a **valid email and correct password** redirects the user to `/dashboard`.
- [ ] Submitting the form with **wrong credentials** displays the message _"Invalid email or password. Please try again."_ inside a `role="alert"` paragraph below the inputs; the user stays on the login page.
- [ ] Submitting the form with an **empty email or empty password** results in an error being surfaced (either the server returns an error or the browser `required` attribute prevents submission — behavior must be consistent and visible to the user).
- [ ] While the sign-in request is in-flight (`isPending`), the submit button displays _"Signing in…"_ and is `disabled`; both inputs are also `disabled`.
- [ ] The show/hide password toggle button switches the password `input` type between `password` and `text`; its `aria-label` updates accordingly (_"Show password"_ / _"Hide password"_).
- [ ] An **already-authenticated** user who navigates to `/auth/login` is redirected to `/dashboard` **before the form renders** (guard is at the RSC page level).
- [ ] Error state is cleared (`setError(null)`) on each new submission attempt.

### Sub-feature: Register

- [ ] The register page is accessible at `/auth/register` (page must be created — currently absent from the file system).
- [ ] The page renders a card containing: an **Email** input, a **Password** input with a show/hide toggle, a **Confirm Password** input with an independent show/hide toggle, and a **Create account** submit button.
- [ ] Submitting the form with a **valid email and matching passwords** (meeting Supabase minimum requirements) redirects the user to `/dashboard`.
- [ ] Submitting the form when **password ≠ confirmPassword** displays _"Passwords do not match."_ in a `role="alert"` paragraph; no request is sent to Supabase.
- [ ] Submitting the form with an **already-registered email** surfaces the error message returned by Supabase (e.g. _"User already registered"_) in the same alert paragraph.
- [ ] Submitting the form with an **empty field** results in a visible error (consistent with login behavior).
- [ ] While the registration request is in-flight (`isPending`), the submit button displays _"Creating account…"_ and is `disabled`; all inputs are also `disabled`.
- [ ] The show/hide toggles for **Password** and **Confirm Password** operate independently; each has an accessible `aria-label`.
- [ ] An **already-authenticated** user who navigates to `/auth/register` is redirected to `/dashboard` before the form renders (RSC-level guard required — must be added to the register page).
- [ ] Error state is cleared on each new submission attempt.

---

## Test Scenarios

| #   | Given | When | Then | Type |
|-----|-------|------|------|------|
| **LOGIN** |||||
| L1  | User is unauthenticated and on `/auth/login` | Submits a valid email and correct password | User is redirected to `/dashboard`; session cookie is set | Happy path |
| L2  | User is unauthenticated and on `/auth/login` | Submits a valid email and **wrong** password | Error message _"Invalid email or password. Please try again."_ appears in `role="alert"`; user remains on `/auth/login` | Negative |
| L3  | User is unauthenticated and on `/auth/login` | Submits the form with **both fields empty** | A visible error is shown; no Supabase request is fired | Edge case |
| L4  | User is unauthenticated and on `/auth/login` | Submits the form with **email only** (password empty) | A visible error is shown; no Supabase request is fired | Edge case |
| L5  | User is unauthenticated and on `/auth/login` | Clicks **Sign in** twice in rapid succession | Only one request is dispatched; button is `disabled` after first click until response returns | Edge case |
| L6  | User is unauthenticated and on `/auth/login` | Clicks the **show password** toggle | Password field type changes to `text`; toggle icon changes to EyeOff; `aria-label` reads "Hide password" | Edge case |
| L7  | User is unauthenticated and on `/auth/login` | Clicks **show password** then **hide password** | Password field type returns to `password`; icon reverts to Eye; `aria-label` reads "Show password" | Edge case |
| L8  | User **is already authenticated** | Navigates to `/auth/login` | Redirected to `/dashboard` immediately; `LoginForm` is never rendered | Edge case |
| L9  | User sees a wrong-credentials error, then fixes credentials and resubmits | Submits again with correct credentials | Previous error is cleared before the second request fires; on success redirected to `/dashboard` | Edge case |
| L10 | User is unauthenticated | Supabase is unreachable / returns a network error | A meaningful error message is displayed; the form is not left in a permanently disabled state | Negative |
| **REGISTER** |||||
| R1  | User is unauthenticated and on `/auth/register` | Submits a new email with matching passwords that meet Supabase requirements | User is redirected to `/dashboard`; new Supabase auth user is created | Happy path |
| R2  | User is unauthenticated and on `/auth/register` | Submits with **password ≠ confirmPassword** | Error _"Passwords do not match."_ appears in `role="alert"`; no Supabase `signUp` call is made | Negative |
| R3  | User is unauthenticated and on `/auth/register` | Submits with an **already-registered email** | Supabase error (e.g. _"User already registered"_) is surfaced in the alert; user remains on register page | Negative |
| R4  | User is unauthenticated and on `/auth/register` | Submits the form with **all fields empty** | A visible error is shown; no Supabase request is fired | Edge case |
| R5  | User is unauthenticated and on `/auth/register` | Submits with a **password that is too short** (below Supabase minimum) | Supabase returns an error; it is displayed in the alert paragraph | Negative |
| R6  | User is unauthenticated and on `/auth/register` | Submits with a **malformed email** (e.g. `notanemail`) | An error is surfaced; no account is created | Negative |
| R7  | User is unauthenticated and on `/auth/register` | Clicks **Create account** twice in rapid succession | Only one `signUp` call is dispatched; button is `disabled` after first click | Edge case |
| R8  | User is unauthenticated and on `/auth/register` | Toggles **show password** on the Password field | Only the Password field reveals its value; Confirm Password field remains masked | Edge case |
| R9  | User is unauthenticated and on `/auth/register` | Toggles **show confirm password** on the Confirm Password field | Only the Confirm Password field reveals its value; Password field remains masked | Edge case |
| R10 | User **is already authenticated** | Navigates to `/auth/register` | Redirected to `/dashboard` immediately; `RegisterForm` is never rendered | Edge case |
| R11 | User sees a "Passwords do not match" error, fixes the mismatch, and resubmits | Submits again with matching passwords and a valid new email | Previous error is cleared; on success redirected to `/dashboard` | Edge case |

---

## Error Message Catalogue

| Supabase error code / condition | UI message displayed |
|---|---|
| `invalid_credentials` (wrong password or email not found) | `"Invalid email or password. Please try again."` |
| `user_already_exists` | `"An account with this email already exists. Try signing in instead."` |
| `weak_password` | `"Password must be at least 6 characters."` |
| Client-side: empty email | `"Please enter your email address."` |
| Client-side: invalid email format | `"Please enter a valid email address."` |
| Client-side: empty password (login) | `"Please enter your password."` |
| Client-side: empty password (register) | `"Please enter a password."` |
| Client-side: empty confirm password | `"Please confirm your password."` |
| Client-side: password too short | `"Password must be at least 6 characters."` |
| Client-side: passwords do not match | `"Passwords do not match."` |
| Any other Supabase error | `"Something went wrong. Please try again later."` |

---

## Out of Scope

- **OAuth / social login** (Google, GitHub, etc.) — not in this iteration.
- **Forgot password / password reset** flow — separate feature.
- **Email verification** — Supabase may send a confirmation email depending on project settings, but the UI does not currently handle a "check your email" confirmation state; this is not in scope.
- **"Remember me" checkbox** or persistent session configuration — session lifetime is controlled by Supabase defaults.
- **Username or display-name field** during registration — only email + password.
- **Rate limiting / CAPTCHA** on the form — infrastructure-level concern, not handled in the UI.
- **Admin-facing user management** (invite users, disable accounts, etc.).
- **Account deletion or profile editing**.
- **Multi-factor authentication (MFA)**.
- **Password strength meter UI** — validation is delegated to Supabase's server-side rules.

---

## Open Questions

1. **Email confirmation flow** — Does the Supabase project have email confirmation enabled? If so, `registerUser` redirects to `/dashboard` immediately after `signUp`, but the user may not yet have a confirmed session. Should the register flow redirect to a `/auth/confirm-email` holding page instead?
2. **Register page route** — The register page (`app/(auth)/auth/register/page.tsx`) does not yet exist. Should the route follow the same pattern as login (`/auth/register`) or be placed at `/register`? Is there a navigation link from the login card to the register page (and vice versa) that needs to be added?
3. **Password minimum length** — Supabase defaults to 6 characters. Should the UI enforce this client-side before the server action is called, and if so what is the agreed minimum?
4. **Error message ownership for duplicate email** — `registerUser` currently surfaces the raw `error.message` from Supabase. Should this be mapped to a friendlier, product-defined string for consistency with the login error style?
5. **Empty-field behavior** — Both forms use `noValidate` but inputs carry the `required` attribute. Should the service layer add explicit empty-string guards to return a consistent _"Email and password are required."_ message before calling Supabase?
6. **Post-login redirect target** — Is `/dashboard` the permanent success destination, or should the app support a `?redirectTo=` query parameter (e.g. for deep-linking after session expiry)?
7. **Supabase RLS** — Are Row Level Security policies already in place for user-owned data, or does that need to be set up as part of (or before) shipping these auth flows?

---

## Feature Module Mapping

```
Implements in: features/auth/

  components/
    — LoginForm        (login-form.tsx)       ✅ exists
    — RegisterForm     (register-form.tsx)    ✅ exists

  services/
    — loginUser()      (auth-service.ts)      ✅ exists
    — registerUser()   (auth-service.ts)      ✅ exists

  types/
    — LoginFormData    (types/index.ts)       ✅ exists  { email: string; password: string }
    — RegisterFormData (types/index.ts)       ✅ exists  { email: string; password: string; confirmPassword: string }
    — AuthResult       (types/index.ts)       ✅ exists  { error?: string }

app/(auth)/
    — auth/login/page.tsx                     ✅ exists  (RSC auth guard + renders LoginForm)
    — auth/register/page.tsx                  ✅ exists  (RSC auth guard + renders RegisterForm)
```
