# API Test Implementation TODO

## Test Directory

All API tests live in:

```
api/tests/
```

Each route file gets a corresponding test file:

```
api/tests/
├── setup.ts                          # Shared test setup (app, db, auth helpers)
├── users.test.ts
├── teams.test.ts
├── sessions.test.ts
├── players.test.ts
├── leagues.test.ts
├── videos.test.ts
├── scripts.test.ts
├── adminDb.test.ts
├── contractTeamUsers.test.ts
├── contractPlayerUsers.test.ts
├── contractUserActions.test.ts
├── contractVideoActions.test.ts
└── index.test.ts
```

## Stack

- **Jest** — test runner
- **supertest** — HTTP assertions against the Express app
- **In-memory SQLite** — Sequelize configured with `storage: ":memory:"` so tests are fast and isolated
- **jest.mock()** — for external services (email, YouTube, worker-node HTTP calls)

## Setup Work

- [x] Install dev dependencies: `jest`, `ts-jest`, `supertest`, `@types/jest`, `@types/supertest`
- [x] Create `jest.config.ts` in `api/`
- [x] Add `"test"` script to `api/package.json`
- [x] Create `setup.ts` with shared helpers:
  - Initialize Sequelize with in-memory SQLite
  - Call `initModels()` and `sequelize.sync({ force: true })` before each suite
  - Helper to create a test user and return a valid JWT
  - Helper to seed common data (team, players, session, etc.)
- [x] Create global mocks for external services:
  - `modules/mailer.ts` (sendRegistrationEmail, sendResetPasswordEmail, etc.)
  - Axios calls to worker-node (YouTube upload, montage job queue)
  - File system paths (use temp directories)

---

## Test Checklist by Route File

### `users.test.ts` — prefix: `/users`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | POST | `/users/register` | No | Returns 201 with `{ message, user, token }` on valid input | [x] |
| 2 | POST | `/users/register` | No | Returns 400 when email already exists | [x] |
| 3 | POST | `/users/register` | No | Returns 400 when required fields missing | [x] |
| 4 | POST | `/users/login` | No | Returns 200 with `{ message, token, user }` on valid credentials | [x] |
| 5 | POST | `/users/login` | No | Returns 401 on wrong password | [x] |
| 6 | POST | `/users/login` | No | Returns 404 when user not found | [x] |
| 7 | POST | `/users/request-reset-password-email` | No | Returns 200 with `{ message }` for existing email | [x] |
| 8 | POST | `/users/request-reset-password-email` | No | Returns 404 for unknown email | [x] |
| 9 | POST | `/users/reset-password-with-new-password` | Yes | Returns 200 with `{ message }` on valid new password | [x] |
| 10 | POST | `/users/reset-password-with-new-password` | Yes | Returns 401 without auth token | [x] |
| 11 | DELETE | `/users/delete-account` | No | Returns 200 with `{ message }` on valid email/password | [x] |
| 12 | DELETE | `/users/delete-account` | No | Returns 401 on wrong password | [x] |
| 13 | POST | `/users/register-or-login-via-google` | No | Returns 200 with `{ message, token, user }` for new Google user | [x] |
| 14 | POST | `/users/register-or-login-via-google` | No | Returns 200 with `{ message, token, user }` for existing Google user | [x] |
| 15 | GET | `/users/user-growth-timeseries` | Yes | Returns 200 with `{ series, summary }` | [x] |
| 16 | GET | `/users/user-growth-timeseries` | Yes | Returns 401 without auth token | [x] |

### `teams.test.ts` — prefix: `/teams`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | GET | `/teams` | Yes | Returns 200 with `{ result: true, teams }` | [x] |
| 2 | GET | `/teams` | Yes | Returns 401 without auth token | [x] |
| 3 | POST | `/teams/create` | Yes | Returns 200 with `{ result: true, teamNew }` on valid input | [x] |
| 4 | POST | `/teams/create` | Yes | Creates team with players when `playersArray` provided | [x] |
| 5 | POST | `/teams/update-visibility` | Yes | Returns 200 with `{ result: true, team }` | [x] |
| 6 | POST | `/teams/update-visibility` | Yes | Returns 404 when team not found | [x] |
| 7 | POST | `/teams/add-player` | Yes | Returns 200 with `{ result: true, playerNew }` | [x] |
| 8 | DELETE | `/teams/player` | Yes | Returns 200 with `{ result: true }` | [x] |
| 9 | GET | `/teams/public` | Yes | Returns 200 with `{ result: true, publicTeamsArray }` | [x] |

### `sessions.test.ts` — prefix: `/sessions`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | GET | `/sessions/:teamId` | Yes | Returns 200 with `{ result: true, sessionsArray }` | [x] |
| 2 | GET | `/sessions/:teamId` | Yes | Returns 401 without auth token | [x] |
| 3 | POST | `/sessions/create` | Yes | Returns 200 with `{ result: true, sessionNew }` on valid input | [x] |
| 4 | POST | `/sessions/create` | Yes | Returns 404 when contractLeagueTeamId not found | [x] |
| 5 | POST | `/sessions/review-selection-screen/get-actions` | Yes | Returns 200 with `{ result: true, actionsArray, playerDbObjectsArray }` | [x] |
| 6 | GET | `/sessions/scripting-sync-video/:sessionId/actions` | Yes | Returns 200 with `{ result: true, actionsArray }` | [x] |
| 7 | GET | `/sessions/scripting-sync-video-screen/get-actions-for-syncing/:sessionId` | Yes | Returns 200 with `{ result: true, actionsArrayByScript }` | [x] |

### `players.test.ts` — prefix: `/players`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | GET | `/players/team/:teamId` | Yes | Returns 200 with `{ result: true, team, playersArray }` | [x] |
| 2 | GET | `/players/team/:teamId` | Yes | Returns 401 without auth token | [x] |
| 3 | GET | `/players/profile-picture/:filename` | Yes | Returns 404 when file not found | [x] |
| 4 | GET | `/players/profile-picture/:filename` | Yes | Requires authentication | [x] |

### `leagues.test.ts` — prefix: `/leagues`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | GET | `/leagues/team/:teamId` | Yes | Returns 200 with `{ leaguesArray }` | [ ] |
| 2 | GET | `/leagues/team/:teamId` | Yes | Returns 401 without auth token | [ ] |

### `videos.test.ts` — prefix: `/videos`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | GET | `/videos` | Yes | Returns 200 with `{ result: true, videosArray }` | [ ] |
| 2 | GET | `/videos` | Yes | Returns 401 without auth token | [ ] |
| 3 | GET | `/videos/team/:teamId` | Yes | Returns 200 with `{ result: true, videosArray }` | [ ] |
| 4 | GET | `/videos/user` | Yes | Returns 200 with `{ result: true, videosArray }` for current user | [ ] |
| 5 | POST | `/videos/upload-youtube` | Yes | Returns 200 with `{ result: true, message }` (mock external calls) | [ ] |
| 6 | POST | `/videos/upload-youtube` | Yes | Returns 400 when no file uploaded | [ ] |
| 7 | DELETE | `/videos/:videoId` | Yes | Returns 200 with `{ message }` (mock YouTube delete) | [ ] |
| 8 | DELETE | `/videos/:videoId` | Yes | Returns 404 when video not found | [ ] |
| 9 | POST | `/videos/montage-service/queue-a-job` | Yes | Returns 200 with `{ result: true, message, data }` (mock worker-node) | [ ] |
| 10 | POST | `/videos/montage-service/video-completed-notify-user` | Yes | Returns 200 with `{ result: true, message }` (mock email) | [ ] |
| 11 | GET | `/videos/montage-service/play-video/:token` | No | Returns video file for valid token | [ ] |
| 12 | GET | `/videos/montage-service/play-video/:token` | No | Returns 401 for invalid token | [ ] |
| 13 | GET | `/videos/montage-service/download-video/:token` | No | Returns video file for download with valid token | [ ] |

### `scripts.test.ts` — prefix: `/scripts`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | POST | `/scripts/scripting-live-screen/receive-actions-array` | Yes | Returns 200 with `{ result: true, message, scriptId, actionsCount }` | [ ] |
| 2 | POST | `/scripts/scripting-live-screen/receive-actions-array` | Yes | Returns 400 when actionsArray is empty | [ ] |
| 3 | POST | `/scripts/scripting-live-screen/receive-actions-array` | Yes | Returns 401 without auth token | [ ] |

### `contractTeamUsers.test.ts` — prefix: `/contract-team-users`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | GET | `/contract-team-users` | Yes | Returns 200 with `{ teamsArray, contractTeamUserArray }` | [ ] |
| 2 | GET | `/contract-team-users` | Yes | Returns 401 without auth token | [ ] |
| 3 | POST | `/contract-team-users/create/:teamId` | Yes | Returns 201 with `{ message, contractTeamUser }` on new record | [ ] |
| 4 | POST | `/contract-team-users/create/:teamId` | Yes | Returns 200 with `{ message, contractTeamUser }` on upsert | [ ] |
| 5 | GET | `/contract-team-users/:teamId` | Yes | Returns 200 with `{ squadArray }` | [ ] |
| 6 | POST | `/contract-team-users/add-squad-member` | Yes | Returns 201 when adding existing user to team (mock email) | [ ] |
| 7 | POST | `/contract-team-users/add-squad-member` | Yes | Returns 200 when inviting non-existent user (creates PendingInvitation) | [ ] |
| 8 | POST | `/contract-team-users/add-squad-member` | Yes | Returns 400 when user already on team | [ ] |
| 9 | GET | `/contract-team-users/join/:joinToken` | Yes | Returns 200 with `{ result: true, contractTeamUser }` for valid token | [ ] |
| 10 | GET | `/contract-team-users/join/:joinToken` | Yes | Returns 403 for invalid/expired token | [ ] |
| 11 | POST | `/contract-team-users/toggle-role` | Yes | Returns 200 with `{ result: true, contractTeamUser }` | [ ] |
| 12 | POST | `/contract-team-users/toggle-role` | Yes | Returns 404 when contract not found | [ ] |
| 13 | DELETE | `/contract-team-users` | Yes | Returns 200 with `{ result: true, contractTeamUser }` | [ ] |
| 14 | DELETE | `/contract-team-users` | Yes | Returns 404 when contract not found | [ ] |

### `contractPlayerUsers.test.ts` — prefix: `/contract-player-users`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | POST | `/contract-player-users/link-user-to-player` | Yes | Returns 200 with `{ result: true, contractPlayerUserObject }` | [ ] |
| 2 | POST | `/contract-player-users/link-user-to-player` | Yes | Returns 401 without auth token | [ ] |
| 3 | DELETE | `/contract-player-users/:playerId` | Yes | Returns 200 with `{ result: true }` | [ ] |

### `contractUserActions.test.ts` — prefix: `/contract-user-actions`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | POST | `/contract-user-actions/update-user-favorites` | Yes | Returns 200 with `{ result: true, message }` | [ ] |
| 2 | POST | `/contract-user-actions/update-user-favorites` | Yes | Returns 401 without auth token | [ ] |

### `contractVideoActions.test.ts` — prefix: `/contract-video-actions`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | POST | `/contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script` | Yes | Returns 200 with `{ result: true, message, scriptId, updatedCount }` | [ ] |
| 2 | POST | `/contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script` | Yes | Returns 404 when script not found | [ ] |
| 3 | POST | `/contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script` | Yes | Returns 401 without auth token | [ ] |

### `adminDb.test.ts` — prefix: `/admin-db`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | GET | `/admin-db/table/:tableName` | Yes | Returns 200 with `{ result: true, data, columnMeta }` | [ ] |
| 2 | GET | `/admin-db/table/:tableName` | Yes | Returns 400 for invalid table name | [ ] |
| 3 | GET | `/admin-db/table/:tableName` | Yes | Returns 401 without auth token | [ ] |
| 4 | GET | `/admin-db/create-database-backup` | Yes | Returns 200 with `{ result: true, message, backupFile }` (mock fs) | [ ] |
| 5 | GET | `/admin-db/backup-database-list` | Yes | Returns 200 with `{ result: true, backups }` (mock fs) | [ ] |
| 6 | GET | `/admin-db/send-db-backup/:filename` | Yes | Returns file download for valid filename (mock fs) | [ ] |
| 7 | GET | `/admin-db/send-db-backup/:filename` | Yes | Returns 404 for missing file | [ ] |
| 8 | GET | `/admin-db/db-row-counts-by-table` | Yes | Returns 200 with `{ result: true, arrayRowCountsByTable }` | [ ] |
| 9 | POST | `/admin-db/import-db-backup` | Yes | Returns 200 with `{ result: true, message }` (mock fs/unzip) | [ ] |
| 10 | DELETE | `/admin-db/delete-db-backup/:filename` | Yes | Returns 200 with `{ result: true, message }` (mock fs) | [ ] |
| 11 | DELETE | `/admin-db/delete-db-backup/:filename` | Yes | Returns 404 for missing file | [ ] |
| 12 | DELETE | `/admin-db/the-entire-database` | Yes | Returns 200 with `{ result: true, message, backupFile }` (mock fs) | [ ] |
| 13 | DELETE | `/admin-db/table/:tableName` | Yes | Returns 200 with `{ result: true, message }` | [ ] |
| 14 | DELETE | `/admin-db/table/:tableName` | Yes | Returns 400 for invalid table name | [ ] |
| 15 | GET | `/admin-db/table-clean/:tableName` | Yes | Returns 200 with `{ result: true, data }` | [ ] |
| 16 | DELETE | `/admin-db/table-row/:tableName/:rowId` | Yes | Returns 200 with `{ result: true, message }` | [ ] |
| 17 | PUT | `/admin-db/table-row/:tableName/:rowId` | Yes | Returns 200 with `{ result: true, message }` on create/update | [ ] |
| 18 | PUT | `/admin-db/table-row/:tableName/:rowId` | Yes | Returns 404 when row not found for update | [ ] |

### `index.test.ts` — prefix: `/`

| # | Method | Path | Auth | Test Description | Status |
|---|--------|------|------|-----------------|--------|
| 1 | GET | `/` | No | Returns 200 with HTML content | [ ] |

---

## Summary

| Category | Count |
|----------|-------|
| Test files to create | 13 |
| Total test cases | 96 |
| Auth-required endpoints tested | ~80 |
| Unauthenticated endpoints tested | ~16 |
| External services to mock | 3 (email, YouTube/worker-node, filesystem) |

## Implementation Order (suggested)

1. **Setup** — Jest config, `setup.ts`, mocks, package.json scripts
2. **`users.test.ts`** — foundational (register/login produce the JWT used everywhere)
3. **`teams.test.ts`** — core CRUD, needed by most other tests
4. **`sessions.test.ts`** — depends on teams
5. **`players.test.ts`** — depends on teams
6. **`leagues.test.ts`** — depends on teams
7. **`contractTeamUsers.test.ts`** — depends on teams + users
8. **`contractPlayerUsers.test.ts`** — depends on players + users
9. **`scripts.test.ts`** — depends on sessions
10. **`contractUserActions.test.ts`** — depends on sessions + actions
11. **`contractVideoActions.test.ts`** — depends on videos + actions
12. **`videos.test.ts`** — depends on sessions, heavy mocking needed
13. **`adminDb.test.ts`** — standalone, heavy mocking needed
14. **`index.test.ts`** — trivial, do whenever
