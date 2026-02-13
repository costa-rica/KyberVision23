# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload (nodemon + ts-node)
- `npm run build` - Compile TypeScript to `dist/`
- `npm start` - Run compiled output from `dist/server.js`

## Architecture Overview

Express.js REST API in TypeScript. Entry point is `src/app.ts` (creates and configures the Express app) + `src/server.ts` (starts the HTTP server and sets up process-level error handlers).

### Bootstrap Sequence

1. `dotenv.config()` then `import logger` — logger must be first
2. `initModels()` — registers all Sequelize model associations
3. `sequelize.sync()` — syncs schema to the SQLite database
4. `verifyCheckDirectoryExists()` — creates required `PATH_*` directories from env
5. `onStartUpCreateEnvUsers()` / `onStartUpCreateLeague()` — seed defaults

### Project Structure

```
src/
├── app.ts              - Express app configuration, middleware, route mounting
├── server.ts           - HTTP server start, process error handlers, logger override
├── routes/             - One file per resource (adminDb, users, teams, sessions, …)
└── modules/
    ├── logger.ts       - Winston singleton (import before everything else)
    ├── userAuthentication.ts - JWT middleware (authenticateToken)
    ├── onStartUp.ts    - Startup checks and seed functions
    ├── adminDb.ts      - DB backup/import business logic
    └── emailService.ts - Nodemailer helpers
```

### Key Patterns

**Route file structure**: each route file creates its own `express.Router()` and is mounted in `app.ts` under a prefix (e.g. `/admin-db`, `/teams`).

**File uploads**: multer is configured with `dest` pointing to `PATH_PROJECT_RESOURCES/uploads-delete-ok/`. This directory is created on startup by `verifyCheckDirectoryExists`. When wrapping `upload.single()`, always use the explicit callback form to catch multer errors:
```typescript
upload.single("fieldName")(req, res, (err) => {
  if (err) { /* handle */ }
  next();
});
```

**Logger override in `server.ts`**: `logger.info` and `logger.error` are wrapped to prepend `[NAME_APP]` but only accept **one argument**. Use template literals — never pass an object/Error as a second argument or it will be silently dropped.

**Authentication bypass**: set `AUTHENTIFICATION_TURNED_OFF=true` in `.env` for local development.

### Database

- SQLite via Sequelize, models provided by `@kybervision/db` (from `../db-models`)
- After changing `db-models/` source, run `npm run build` in `db-models/` before restarting the API
- See `docs/api/` for endpoint documentation and `docs/DATABASE_OVERVIEW.md` for schema reference

### Middleware Ordering Issue

The `express.json({ limit: "6gb" })` and `express.urlencoded({ limit: "6gb" })` calls in `app.ts` are registered **after** the route mounts and are therefore dead code. Effective body-size configuration must be placed in the initial middleware block (before routes).
