# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KyberVision23Queuer is an Express.js TypeScript application that manages job queues using BullMQ and Redis. It serves as the central job orchestration service for the KyberVision ecosystem.

**YouTube upload** is handled natively inside this service via `src/modules/youtubeUploadService.ts` — no external microservice or child process is required. **Video montage creation** still delegates to an external child process (`KyberVision23VideoMontageMaker`).

## Development Commands

```bash
npm run dev    # ts-node + nodemon hot reload
npm run build  # compile TypeScript to dist/
npm start      # run compiled output from dist/server.js
```

Redis must be running before starting the service:

```bash
brew services start redis   # macOS
sudo systemctl start redis  # Ubuntu
redis-cli ping              # verify connection
```

### Redis Management

```bash
redis-cli FLUSHALL                                              # delete all data
redis-cli --raw keys "*YouTubeUploadProcess*" | xargs redis-cli del  # flush a specific queue
brew services list | grep redis                                # check status (macOS)
sudo systemctl status redis                                    # check status (Ubuntu)
```

### Bull Board Dashboard

```
http://localhost:<PORT>/dashboard
```

### Testing Endpoints

```bash
# Queue a YouTube upload job
curl -X POST http://localhost:<PORT>/youtube-uploader/add \
  --header "Content-Type: application/json" \
  --data '{"filename": "video.mp4", "videoId": 123}'

# Queue a video montage job
curl -X POST http://localhost:<PORT>/video-montage-maker/add \
  --header "Content-Type: application/json" \
  --data '{"filename": "example.mp4", "actionsArray": [], "token": "jwt-token", "user": {}}'
```

## Architecture

### Project Structure

```
src/
├── app.ts                      - Express app, middleware, Bull Board, DB init
├── server.ts                   - HTTP server startup, process error handlers
├── modules/
│   ├── logger.ts               - Winston singleton (import before everything else)
│   └── youtubeUploadService.ts - Native YouTube upload logic (OAuth2 + DB update)
└── routes/
    ├── youtubeUploader.ts      - BullMQ queue + worker for YouTube uploads
    ├── montageVideoMaker.ts    - BullMQ queue + worker for video montages
    ├── users.ts                - Placeholder
    └── index.ts                - Placeholder
```

### Job Processing

Two queues are defined. Their names are driven entirely by environment variables.

| Queue env var | Default name | Worker location | Processing method |
|---|---|---|---|
| `YOUTUBE_UPLOADER_QUEUE_NAME` | `YouTubeUploadProcess` | `routes/youtubeUploader.ts` | Direct function call |
| `NAME_KV_VIDEO_MONTAGE_MAKER_QUEUE` | `KyberVision23VideoMontageMaker` | `routes/montageVideoMaker.ts` | Child process spawn |

**Both queues:** `concurrency: 2`, `removeOnComplete: false`, `removeOnFail: false`.

### YouTube Upload Worker (`routes/youtubeUploader.ts`)

Calls `uploadVideo(filename, videoId)` from `src/modules/youtubeUploadService.ts` directly inside the BullMQ worker processor. No child process is involved.

Progress checkpoints:
- `10%` — job started
- `25%` — OAuth2 client configured, upload beginning
- `100%` — upload complete, DB updated

On error: sets `Video.processingFailed = true` via `@kybervision/db` and re-throws so BullMQ marks the job as failed.

### YouTube Upload Service (`modules/youtubeUploadService.ts`)

`uploadVideo(filename: string, videoId: number): Promise<string>`

1. Resolves file path from `PATH_VIDEOS_UPLOADED + filename`
2. Creates an OAuth2 client using `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI`, `YOUTUBE_REFRESH_TOKEN`
3. Calls `youtube.videos.insert()` — title = filename, privacy = `unlisted`
4. Updates `Video.youTubeVideoId` and `Video.processingCompleted = true` via `@kybervision/db`
5. Returns the YouTube video ID string

### Video Montage Worker (`routes/montageVideoMaker.ts`)

Spawns `KyberVision23VideoMontageMaker` as a child process:

```typescript
spawn("node", ["index.js", filename, JSON.stringify(actionsArray), JSON.stringify(user), token], {
  cwd: process.env.PATH_TO_VIDEO_MONTAGE_MAKER_SERVICE,
  stdio: ["pipe", "pipe", "pipe"],
});
```

Progress is updated on each stdout message (5-step tracking). Child stderr is captured and logged.

### Database Initialization

`initModels()` and `sequelize.sync()` are called in `app.ts` at startup before any routes are registered. This is required for `@kybervision/db` model operations (`Video.findByPk()`, `save()`) to work at runtime.

### Logging

Uses Winston via `src/modules/logger.ts`. The `[NAME_APP]` prefix is applied inside the logger format — no override in `server.ts` (unlike the API). Logger accepts multiple arguments correctly.

- `development` → console only
- `testing` → console + rotating log files at `PATH_TO_LOGS`
- `production` → log files only

Morgan HTTP logging is disabled for `/dashboard` routes.

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose |
|---|---|
| `PORT` | HTTP listen port (default: 8003) |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `PATH_DATABASE` / `NAME_DB` | SQLite database location |
| `YOUTUBE_UPLOADER_QUEUE_NAME` | YouTube upload queue name (`YouTubeUploadProcess`) |
| `NAME_KV_VIDEO_MONTAGE_MAKER_QUEUE` | Montage queue name |
| `YOUTUBE_CLIENT_ID` | Google OAuth2 client ID |
| `YOUTUBE_CLIENT_SECRET` | Google OAuth2 client secret |
| `YOUTUBE_REDIRECT_URI` | Google OAuth2 redirect URI |
| `YOUTUBE_REFRESH_TOKEN` | Long-lived refresh token for YouTube API |
| `PATH_VIDEOS_UPLOADED` | Directory where uploaded video files are stored |
| `PATH_TO_VIDEO_MONTAGE_MAKER_SERVICE` | Path to montage maker service directory |
| `PATH_TO_LOGS` | Winston log file directory |

`PATH_TO_YOUTUBE_UPLOADER_SERVICE` has been removed — YouTube upload runs natively.

## Adding a New Queue

1. Create `src/routes/<queueName>.ts`
2. Define a `Queue` and `Worker` using `redisConnection`
3. Add the queue to the Bull Board in `src/app.ts` (`new BullMQAdapter(newQueue)`)
4. Mount the router in `src/app.ts` (`app.use("/path", router)`)
5. Add the queue name to `.env` and `.env.example`

## Relationship to KyberVision Ecosystem

- **KyberVision23API** — sends job requests to this service via `URL_KV_JOB_QUEUER`
- **KyberVision23VideoMontageMaker** — external child process for montage creation (still active)
- **KyberVision23YouTubeUploader** — decommissioned; functionality now native to this service
- **@kybervision/db** (`file:../db-models`) — shared Sequelize models; run `npm run build` in `db-models/` after any model changes
