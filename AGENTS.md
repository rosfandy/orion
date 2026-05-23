<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16 + React 19 + TypeScript (strict)
- Tailwind CSS v4 — no `tailwind.config.js`; all config is in `app/globals.css` via `@theme inline`
- shadcn with **`radix-luma` style** (not `default` or `new-york`) — uses unified `radix-ui` package, not individual `@radix-ui/*` packages
- Supabase (`@supabase/ssr`) for auth/db — client helpers in `lib/supabase/`

## Path alias

`@/*` maps to repo root (`./*`). So `@/components/ui/button` → `components/ui/button.tsx`.

## Key directories

- `app/` — Next.js App Router pages and layouts
- `components/ui/` — shadcn-generated UI primitives (45 components, do not edit manually)
- `lib/supabase/` — `client.ts`, `server.ts`, `middleware.ts` for Supabase SSR
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

## Adding shadcn components

Always lowercase:
```bash
npx shadcn@latest add <component>   # e.g. button, dialog, form
```
`toast` is deprecated — use `sonner` instead.

## TooltipProvider required

`tooltip` component requires `<TooltipProvider>` wrapping the app in `app/layout.tsx`. Not yet added — add it if using tooltips.

## Dev commands

```bash
npm run dev    # start dev server
npm run build  # production build
npm run lint   # eslint
```
No test runner configured.
