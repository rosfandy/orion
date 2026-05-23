# Orion

A modern collaborative workspace application built with Next.js 16, React 19, and Supabase. Orion provides real-time document editing, workspace management, and a complete authentication system.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **UI:** [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) (radix-luma)
- **Auth & Database:** [Supabase](https://supabase.com) (Auth + PostgreSQL)
- **Real-time Collaboration:** [Hocuspocus](https://hocuspocus.dev) + [Yjs](https://yjs.dev) + [Tiptap](https://tiptap.dev)
- **State Management:** [TanStack Query](https://tanstack.com/query)
- **Deployment:** [Vercel](https://vercel.com) (via GitHub Actions CI/CD)

## Features

### Authentication
- Email & password login/register
- Forgot password with email reset link
- Reset password via secure token exchange
- Session management with SSR cookies
- Protected routes with middleware guards

### Workspaces
- Create and manage multiple workspaces
- Workspace settings and member management
- Sidebar navigation with collapsible groups

### Documents
- Real-time collaborative text editor
- Slash commands for quick formatting
- Cursor presence and user awareness
- Yjs-powered conflict-free collaboration

### User Profile
- Avatar upload and display
- Full name and bio editing
- Social links
- Settings preferences (appearance, font size)

### Theme
- Light / dark mode toggle
- System preference detection
- Persistent theme selection

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase project

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Optional: Hocuspocus collaboration server
NEXT_PUBLIC_HOCUSPOCUS_URL=ws://localhost:1234
```

### Installation

```bash
# Clone the repository
git clone https://github.com/rosfandy/orion.git
cd orion

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Collaboration Server (Optional)

For real-time document editing, start the Hocuspocus server:

```bash
npm run collab
```

## Project Structure

```
orion/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group (login, register, forgot/reset password)
│   ├── auth/callback/     # Supabase OAuth/password reset callback
│   ├── dashboard/         # Protected dashboard routes
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── fragments/         # Shared layout components (navbar, sidebar)
│   └── ui/                # shadcn/ui primitives
├── features/              # Feature-based modules
│   ├── auth/              # Authentication forms & services
│   ├── documents/         # Collaborative editor
│   ├── profile/           # User profile management
│   ├── settings/          # App settings
│   ├── theme/             # Dark/light mode
│   └── workspaces/        # Workspace CRUD
├── lib/
│   └── supabase/          # Supabase SSR clients (server, client, middleware)
├── docs/backlog/          # Feature specifications
└── supabase/migrations/   # Database migrations
```

## Authentication Flow

### Password Reset

1. User clicks "Forgot your password?" on login page
2. Email sent with reset link: `/auth/callback?code=xxx&next=/auth/reset-password`
3. Callback route exchanges code for session (sets cookies on redirect response)
4. User redirected to `/auth/reset-password`
5. User enters new password → `updateUser()` → redirected to dashboard

> **Note:** Code exchange happens in a Route Handler, not a Server Component, because RSC cannot reliably set cookies required for subsequent server actions.

## CI/CD

GitHub Actions workflows:

- **CI** (`.github/workflows/ci.yml`): Runs linter and build on every PR and push to `main`
- **Deploy** (`.github/workflows/deploy.yml`): Deploys preview on PRs, production on `main` push

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |

### Pre-push Hook

A Git hook runs `npm run lint` before every push to prevent linter errors from reaching the remote.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run start` | Start production server |
| `npm run collab` | Start Hocuspocus collaboration server |

## License

MIT
