# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

KyberVision23 is a sports video analysis platform with four independent packages. There is no root `package.json` — each package has its own `node_modules` and must be managed separately.

| Package | Language | Port | Purpose |
|---|---|---|---|
| `api/` | TypeScript / Express | 3000 | REST API, all business logic |
| `db-models/` | TypeScript | — | Shared Sequelize models (library only) |
| `web-manager/` | JavaScript / Next.js | 3001 | Frontend |
| `worker-node/` | TypeScript / Express | 8003 | BullMQ job queue orchestrator |

Each package (`api/`, `worker-node/`) has its own `CLAUDE.md` with package-specific commands.

## Development Commands

Run all commands from inside the relevant package directory.

```bash
# API
cd api && npm run dev        # ts-node + nodemon hot reload
cd api && npm run build && npm start

# Frontend
cd web-manager && npm run dev

# Worker node (requires Redis)
cd worker-node && npm run dev

# Database models (after any model changes — must rebuild before dependents)
cd db-models && npm run build
```

## Shared Database Package (`db-models/`)

All Node.js services depend on `@kybervision/db` via `"file:../db-models"`. After changing any model in `db-models/src/`, run `npm run build` in `db-models/` before restarting dependent services. The compiled output in `db-models/dist/` is what gets imported.

Import pattern used in `api/` and `worker-node/`:
```typescript
import { initModels, sequelize, User, Video, ... } from "@kybervision/db";
```

`initModels()` must be called once at startup before any model is used. It registers all Sequelize associations.

## Architecture and Service Communication

```
web-manager (Next.js, :3001)
    ↓ HTTP  (NEXT_PUBLIC_API_BASE_URL)
api (Express, :3000)
    ↓ HTTP  (URL_WORKER_NODE)
worker-node (Express + BullMQ, :8003)
    ↓ child_process.spawn
External microservices (YouTubeUploader, VideoMontageMaker)
```

- **api** is the sole entry point for the frontend; it owns all authentication and database writes.
- **worker-node** receives job requests from the API and enqueues them via BullMQ (Redis-backed). It does not expose routes to the frontend.
- The **single SQLite database** is shared across `api` and `worker-node` through `@kybervision/db`. Its location is set by `PATH_DATABASE` + `NAME_DB` env vars.

## Logging

All Node.js services use Winston via a `modules/logger.ts` singleton that must be imported **before** any other module (including routes). The logger must be initialized immediately after `dotenv.config()`.

Behavior by `NODE_ENV`:
- `development` — console only
- `testing` — console + rotating log files at `PATH_TO_LOGS`
- `production` — log files only

`server.ts` in `api/` and `worker-node/` overrides `logger.info` and `logger.error` to prepend `[NAME_APP]`. These overrides only accept a **single string argument** — passing an object as a second argument silently drops it. Use template literals for inline values.

## Environment Variables

Each service has its own `.env`. Naming conventions across all services:

- `PATH_*` — filesystem paths (directories, not files)
- `URL_*` — inter-service URLs
- `NAME_*` — service/app identifiers
- `PORT` — HTTP listen port
- `NODE_ENV` — `development` | `testing` | `production`
- `JWT_SECRET` — shared secret for token signing/verification
- `REDIS_HOST` / `REDIS_PORT` — worker-node Redis connection
- `NEXT_PUBLIC_*` — frontend-visible variables (web-manager only)

See `.env.example` files in `worker-node/` and `web-manager/` for required variables.

## Key Cross-Cutting Concerns

**Authentication**: `authenticateToken` middleware in `api/src/modules/userAuthentication.ts` validates JWTs on protected routes. Set `AUTHENTIFICATION_TURNED_OFF=true` in `.env` to bypass during local development (falls back to a hardcoded email lookup).

**Startup directory checks**: `api/src/modules/onStartUp.ts:verifyCheckDirectoryExists()` creates required filesystem directories from env vars on boot. Add new `PATH_*` dirs here when introducing new file upload destinations.

**Middleware ordering in `api/src/app.ts`**: The 6 GB `express.json`/`express.urlencoded` limits at the bottom of the file are registered **after** routes and have no effect. Body size limits must be set in the initial middleware block.
