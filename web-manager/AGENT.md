# web-manager — AGENT.md

Admin dashboard for KyberVision23. Next.js 16 App Router frontend — no API routes, all data comes from the `api/` service via REST.

## Commands

```bash
npm run dev          # Dev server on http://localhost:3001
npm run build        # Production build
npm start            # Production server on :3001
npm run lint         # ESLint
```

Port is controlled by `PORT` env var (defaults to 3001).

## Stack

- **Next.js 16** (App Router, all pages are `'use client'`)
- **React 19**, **TypeScript 5.7**
- **Tailwind CSS 4** with OKLch color tokens (custom `--kyber-*` vars in `globals.css`)
- **shadcn/ui** (New York style, 50+ components in `src/components/ui/`)
- **Redux Toolkit** + **redux-persist** (auth state persisted to localStorage)
- **Axios** for API calls (`src/lib/api/client.ts`)
- **Lucide React** icons

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout — wraps StoreProvider
│   ├── globals.css                # Tailwind config + Kyber theme tokens
│   ├── (public)/                  # Unauthenticated routes
│   │   └── page.tsx               # Landing page with login/register/forgot modals
│   └── (dashboard)/               # AuthGuard-protected routes
│       ├── layout.tsx             # Wraps children in AuthGuard + DashboardHeader
│       ├── dashboard/page.tsx     # DB table viewer with CRUD
│       └── db-backups/page.tsx    # Backup create/download/restore
├── components/
│   ├── dashboard/
│   │   ├── auth-guard.tsx         # Redirects to / if no token in Redux
│   │   └── dashboard-header.tsx   # Top nav + mobile hamburger menu
│   ├── data-table/
│   │   ├── data-table.tsx         # Sortable table with column visibility toggle
│   │   └── record-form.tsx        # Dynamic Add/Update form from ColumnConfig[]
│   ├── modals/                    # Login, Register, ForgotPassword modals
│   ├── loading-overlay.tsx        # Full-screen spinner with optional progress bar
│   └── theme-provider.tsx         # next-themes wrapper
├── lib/
│   ├── api/client.ts              # Axios instance — injects Bearer token, handles 401
│   ├── types.ts                   # ColumnConfig interface
│   └── utils.ts                   # cn() — clsx + tailwind-merge
├── hooks/                         # use-mobile, use-toast
└── store/
    ├── store.ts                   # configureStore with persist
    ├── provider.tsx               # Redux Provider + PersistGate
    └── slices/authSlice.ts        # user, token, isAdmin — setCredentials / logout
```

## Environment Variables

All are `NEXT_PUBLIC_*` (exposed to browser):

| Variable                       | Purpose                                         | Default                 |
| ------------------------------ | ----------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_BASE_URL`     | API base URL                                    | `http://localhost:3000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth (placeholder, not yet implemented) | —                       |
| `NEXT_PUBLIC_MODE`             | App mode flag                                   | `development`           |

## API Endpoints Used

The frontend calls these endpoints on the `api/` service:

**Auth (public):**

- `POST /users/login` — returns `{ user, token }`
- `POST /users/register` — returns `{ user, token }`
- `POST /users/request-reset-password-email` — sends reset email

**Dashboard (protected):**

- `GET /admin-db/db-row-counts-by-table` — table names + row counts
- `GET /admin-db/table/:tableName` — all rows + column config
- `POST /admin-db/table-row/:tableName` — create row
- `PUT /admin-db/table-row/:tableName/:rowId` — update row
- `DELETE /admin-db/table-row/:tableName/:rowId` — delete row

**Backups (protected):**

- `GET /admin-db/create-database-backup` — trigger backup
- `GET /admin-db/backup-database-list` — list backup files
- `GET /admin-db/send-db-backup/:filename` — download backup file
- `POST /admin-db/import-db-backup` — upload + restore backup (multipart)

## Auth Flow

1. Login/register → API returns `{ user, token }` → stored in Redux (`authSlice`)
2. Redux-persist saves auth state to localStorage (survives refresh)
3. `AuthGuard` component on `(dashboard)` layout redirects to `/` if no token
4. Axios request interceptor injects `Authorization: Bearer <token>` on every request
5. Axios response interceptor catches 401 → dispatches `logout()` → redirects to `/`

## Key Patterns

- **No SSR data fetching** — every page is `'use client'`, all API calls happen in `useEffect` or event handlers.
- **Dynamic table rendering** — the dashboard page fetches column metadata (`ColumnConfig[]`) from the API and renders columns/forms dynamically. Hidden by default: `createdAt`, `updatedAt`, `deletedAt`, `password`.
- **shadcn/ui components** live in `src/components/ui/`. Add new ones with `npx shadcn@latest add <component>`.
- **Path alias**: `@/*` maps to `src/*` (configured in `tsconfig.json`).
- **Theme**: Dark-first design using custom Kyber purple/charcoal tokens defined in `globals.css`.

## Status

This is a work-in-progress replacement for `web-manager-reference/`. Currently implemented:

- Landing page with auth modals (login, register, forgot password)
- Protected dashboard with dynamic DB table viewer (full CRUD)
- DB backup management (create, list, download, restore)

Not yet implemented:

- Google OAuth integration
- Any additional admin pages beyond database management
