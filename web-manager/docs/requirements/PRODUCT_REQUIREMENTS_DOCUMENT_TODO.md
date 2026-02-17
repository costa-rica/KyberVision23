# Product Requirements Document — TODO Checklist

Tasks derived from `PRODUCT_REQUIREMENTS_DOCUMENT.md`. Organized into commit groups.

---

## Commit 1: Fix src/ migration — paths, config, and cleanup

The codebase was moved into `src/` but the tooling config still points to the old structure. All `@/components/...` imports are silently broken (masked by `ignoreBuildErrors: true`).

- [x] Update `tsconfig.json` paths: change `"@/*": ["./*"]` to `"@/*": ["./src/*"]`
- [x] Global find-and-replace all imports from `@/src/...` to `@/...` across all source files
- [x] Verify all `@/components/...` and `@/lib/...` imports resolve correctly
- [x] Update `components.json` (shadcn config): fix `css` path to `src/app/globals.css` and fix alias paths to include `src/` prefix
- [x] Delete orphaned `src/styles/globals.css` (unused duplicate of `src/app/globals.css`)
- [x] Remove `typescript: { ignoreBuildErrors: true }` from `next.config.mjs`
- [x] Run `npm run build` and confirm zero TypeScript errors

---

## Commit 2: Install packages and create Axios API client

Set up the HTTP client infrastructure that all API calls will depend on.

- [x] Install `axios`
- [x] Create `src/lib/api/client.ts` — Axios instance configured with:
  - [x] Base URL from `NEXT_PUBLIC_API_BASE_URL` environment variable
  - [x] Request interceptor that injects JWT token from auth state (localStorage or Redux store)
  - [x] Response interceptor that handles 401 by clearing auth state
- [x] Verify `.env` has correct `NEXT_PUBLIC_API_BASE_URL` value

---

## Commit 3: Set up Redux store with auth slice

- [x] Install `@reduxjs/toolkit`, `react-redux`, `redux-persist`
- [x] Create `src/store/store.ts` — Redux store with persist config (only auth slice persisted to localStorage)
- [x] Create `src/store/slices/authSlice.ts` — state: user credentials, JWT tokens, admin status; reducers: setCredentials, logout, etc.
- [x] Create `src/store/provider.tsx` — Redux Provider + PersistGate wrapper component
- [x] Wrap root layout (`src/app/layout.tsx`) with the Redux Provider
- [x] Update Axios client request interceptor to read JWT from Redux-persisted auth state
- [x] Update Axios client response interceptor to dispatch logout on 401

---

## Commit 4: Landing page — login, register, forgot password

Wire up the landing page authentication modals to real API endpoints.

### Login modal (`src/components/modals/login-modal.tsx`)
- [x] Replace simulated `setTimeout` login with real `POST /users/login` API call
- [x] On success, dispatch Redux `setCredentials` with user data + JWT token
- [x] On failure, display error message from API response
- [x] Redirect to `/dashboard` on successful login

### Register modal (new: `src/components/modals/register-modal.tsx`)
- [x] Create register modal component with form fields (based on API requirements)
- [x] Wire to `POST /users/register` endpoint
- [x] Handle success/error states
- [x] Integrate into landing page — "Create Account" link in login modal opens register modal

### Forgot password modal (new: `src/components/modals/forgot-password-modal.tsx`)
- [x] Create forgot password modal component with email input
- [x] Wire to `POST /users/request-reset-password-email` endpoint
- [x] Display success confirmation message
- [x] Integrate into landing page — "Forgot Password" link in login modal opens forgot password modal

### Landing page updates (`src/app/(public)/page.tsx`)
- [x] Replace hardcoded `handleLogin` with Redux-aware login flow
- [x] Add state management for switching between login/register/forgot-password modals

---

## Commit 5: Auth guard and logout

Protect dashboard routes and implement real logout.

- [x] Add auth guard to dashboard layout (`src/app/(dashboard)/layout.tsx`) — redirect to `/` if no valid auth state in Redux
- [x] Update DashboardHeader sign-out button (`src/components/dashboard/dashboard-header.tsx`) to dispatch Redux `logout` action and clear persisted state before redirecting to `/`

---

## Commit 6: Dashboard page — table data from API

Replace all placeholder data with real API calls on the dashboard.

### Table selector
- [x] Create API call to `GET /admin-db/db-row-counts-by-table`
- [x] Populate table dropdown dynamically from API response `tableName` values (replace hardcoded `placeholder-data.ts` table list)
- [x] Store table names for reuse across components

### Table display
- [x] Create API call to `GET /admin-db/table/:tableName`
- [x] Render table columns dynamically based on API response shape (replace hardcoded column configs)
- [x] Set sensible default column visibility (some columns hidden by default)
- [x] Show LoadingOverlay while table data is loading
- [x] Handle API errors gracefully

### Record form (add/update)
- [x] Wire Add/Update form submission to `PUT /admin-db/table-row/:tableName/:rowId`
- [x] Dynamically render form fields based on columns returned by the API
- [x] Refresh table data after successful add/update
- [x] Show LoadingOverlay during submission

### Row deletion
- [x] Add delete button/action to each row in the data table
- [x] Add confirmation dialog before deleting
- [x] Wire to `DELETE /admin-db/table-row/:tableName/:rowId`
- [x] Refresh table data after successful deletion
- [x] Show LoadingOverlay during deletion

### Cleanup
- [x] Remove `src/lib/placeholder-data.ts` once all hardcoded data is replaced

---

## Commit 7: Db Backups page — real API integration

Replace all simulated operations on the db-backups page with real API calls.

### Backup and Restore section
- [x] Wire "Create Backup" button to `GET /admin-db/create-database-backup`
- [x] Show LoadingOverlay with progress during backup creation
- [x] Wire backup list to `GET /admin-db/backup-database-list` — fetch on page load
- [x] Wire each backup filename link to download via `GET /admin-db/send-db-backup/:filename` (replace `alert()` stub)
- [x] Wire file upload input to `POST /admin-db/import-db-backup` — send `.zip` file
- [x] Show LoadingOverlay with progress during upload/restore
- [x] Refresh backup list after create or import operations

### Tables section
- [x] Wire table/row-count list to `GET /admin-db/db-row-counts-by-table` (replace hardcoded `PLACEHOLDER_TABLES`)
- [x] Fetch on page load, show LoadingOverlay while loading

---

## Commit 8: Final polish and verification

- [x] Run full `npm run build` — confirm zero errors
- [ ] Manually test all pages end-to-end against the running API
- [ ] Verify auth flow: login → dashboard access → logout → redirect
- [ ] Verify dashboard: table switching, add row, update row, delete row
- [ ] Verify db-backups: create backup, list backups, download, upload, table counts
- [x] Review for any remaining hardcoded/placeholder data
- [x] Review for any `console.log` statements that should be removed
