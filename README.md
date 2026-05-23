# Orion

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui (radix-luma)
- **Backend:** Supabase (Auth + PostgreSQL)
- **Collaboration:** Hocuspocus + Yjs + Tiptap
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
NEXT_PUBLIC_HOCUSPOCUS_URL=ws://localhost:1234  # optional
```

## Project Structure

```
app/                 # Next.js App Router
├── (auth)/          # Login, register, forgot/reset password
├── auth/callback/   # Supabase callback handler
└── dashboard/       # Protected routes
components/          # UI primitives & layout fragments
features/            # Feature modules (auth, documents, profile, etc.)
lib/supabase/        # SSR clients (server, client, middleware)
docs/backlog/        # Feature specs
supabase/migrations/ # Database migrations
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run collab` | Hocuspocus server |

## CI/CD

GitHub Actions handles lint/build on PRs and deploys to Vercel on push to `main`.

Required secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## License

MIT
