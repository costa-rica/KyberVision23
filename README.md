![Logo](./docs/images/kyberVisionLogo01.png)

# v23

## Overview

Kyber Vision 23 is a unified monorepo powering a complete ecosystem for volleyball performance analysis and sharing. It brings together the API, database models, web manager, and background workers into a single, maintainable architecture, while the mobile app (data collection tool) remains separate for now.

Athletes and coaches use the mobile app to script live matches or review recorded sessions, capturing detailed action data such as player involvement, rotation, score, and quality. This data flows through a centralized API and structured SQLite schema, enabling rich analysis across teams, sessions, and videos.

The integrated worker-node service consolidates queue management and media processing, handling automated video montage creation and YouTube uploads. Through the web manager, users can review plays, sync actions to video, generate highlights, and share key moments—turning raw match data into collaborative, social performance insights that drive continuous improvement.

## Directory Structure

```
.
├── CLAUDE.md               - AI assistant guidance for this monorepo
├── README.md
├── api/                    - Express.js REST API (TypeScript)
│   ├── src/
│   └── package.json
├── db-models/              - Shared Sequelize models (@kybervision/db)
│   ├── src/
│   └── package.json
├── docs/                   - Project-wide documentation
│   ├── API_REFERENCE.md
│   ├── PROJECT_OVERVIEW.md
│   ├── api/                - Per-route API docs
│   ├── images/
│   ├── references/
│   ├── requirements/
│   └── transition-to-kv23/
├── web-manager/            - Next.js frontend
│   ├── components/
│   ├── pages/
│   └── package.json
└── worker-node/            - BullMQ job queue service (TypeScript)
    ├── src/
    └── package.json
```

## Services

| Service       | Default Port | Purpose                                           |
| ------------- | ------------ | ------------------------------------------------- |
| `api`         | 3000         | REST API — authentication, data, job dispatch     |
| `worker-node` | 3002         | BullMQ job queues — video montage, YouTube upload |
| `web-manager` | 3001         | Next.js frontend — session review, highlights     |

## Shared Packages

**`db-models`** (`@kybervision/db`) is a local package shared by both `api` and `worker-node` via `file:../db-models`. It contains all Sequelize model definitions for the SQLite database.

After making any changes to `db-models/src`, rebuild before running dependent services:

```bash
cd db-models && npm run build
```

## Prerequisites

- **Node.js** v18+
- **Redis** (required by `worker-node`)
- **ffmpeg** (required for video montage creation in `worker-node`)

```bash
# macOS
brew install redis ffmpeg
brew services start redis

# Verify Redis
redis-cli ping   # → PONG
```

## Getting Started

Each package is independent with its own `node_modules`. Install and run them in the following order:

```bash
# 1. Build shared database models first
cd db-models
npm install && npm run build

# 2. Start the API
cd ../api
npm install && npm run dev

# 3. Start the worker-node (requires Redis)
cd ../worker-node
npm install && npm run dev

# 4. Start the web manager
cd ../web-manager
npm install && npm run dev
```

## Environment Variables

Each service has its own `.env` file. Copy the example and fill in values:

```bash
cp api/.env.example api/.env
cp worker-node/.env.example worker-node/.env
```

Key inter-service variables:

| Variable                    | Service              | Purpose                                                   |
| --------------------------- | -------------------- | --------------------------------------------------------- |
| `URL_KV_JOB_QUEUER`         | `api`                | Base URL for `worker-node` (e.g. `http://localhost:3002`) |
| `PATH_DATABASE` / `NAME_DB` | `api`, `worker-node` | SQLite database path and filename                         |
| `YOUTUBE_*`                 | `worker-node`        | Google OAuth2 credentials for YouTube upload              |

## Documentation

- [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) — full endpoint reference
- [`docs/PROJECT_OVERVIEW.md`](./docs/PROJECT_OVERVIEW.md) — architecture and data flow
- [`CLAUDE.md`](./CLAUDE.md) — guidance for AI-assisted development
- Per-service `CLAUDE.md` files in `api/`, `worker-node/`
