# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KyberVision23Queuer is an ExpressJS application that manages job queues using BullMQ and Redis for the KyberVision ecosystem. It serves as the central job orchestration service, spawning child processes to handle video processing tasks for connected microservices.

**Version**: 0.22.0

## Development Commands

### Starting the Application

```bash
# Start the server (runs on port 8003 by default)
yarn start

# Start Redis (required dependency)
# macOS:
brew services start redis

# Ubuntu:
sudo systemctl start redis
```

### Redis Management

```bash
# Check Redis connection
redis-cli ping

# Delete all data
redis-cli FLUSHALL

# Delete specific database
redis-cli -n 0 FLUSHDB

# Delete specific queue pattern
redis-cli --raw keys "*KyberVisionVideoUploader03*" | xargs redis-cli del

# Check Redis status (macOS)
brew services list | grep redis

# Check Redis status (Ubuntu)
sudo systemctl status redis
```

### Accessing the Dashboard

Bull Board dashboard for monitoring queues and jobs:

```
http://localhost:8003/dashboard
```

### Testing Endpoints

```bash
# Queue a YouTube upload job
curl -X POST http://localhost:8003/youtube-uploader/add \
--header "Content-Type: application/json" \
--data '{"filename": "Video01_trimmed.mp4", "videoId": 123}'

# Queue a video montage job
curl -X POST http://localhost:8003/video-montage-maker/add \
--header "Content-Type: application/json" \
--data '{"filename": "example.mp4", "actionsArray": [], "token": "jwt-token", "user": {}}'
```

## Architecture

### Application Structure

```
app.js              # Express app configuration, middleware, and Bull Board setup
server.js           # Server entry point with error handling and logging overrides
routes/             # Route handlers for different job types
  montageVideoMaker.js   # Video montage queue management
  youtubeUploader.js     # YouTube upload queue management
  users.js               # User routes
  index.js               # Route exports
```

### Job Processing Architecture

The application uses a **worker-based queue system** where:

1. **API Layer (Express)**: Receives job requests and adds them to Redis queues
2. **Queue Layer (BullMQ)**: Manages job queues with Redis as the backing store
3. **Worker Layer**: Processes jobs by spawning child processes to external microservices
4. **Microservice Layer**: External Node.js services that perform the actual work

### Child Process Pattern

All job workers use a consistent child process spawning pattern:

```javascript
const child = spawn("node", ["index.js", ...args], {
  cwd: path.join(process.env.PATH_TO_SERVICE),
  stdio: ["pipe", "pipe", "pipe"],
});
```

**Key aspects:**

- `stdio: ["pipe", "pipe", "pipe"]` enables parent-child IPC via stdin, stdout, stderr
- Progress tracking: stdout messages update job progress and logs in BullMQ
- Error handling: stderr messages are captured and logged to job
- Exit codes: Process exit code 0 = success, non-zero = failure

### Queue Configuration

**Two primary queues:**

1. **KyberVision23VideoMontageMaker** (montageQueue)
   - Concurrency: 2
   - Creates video montages from action clips
   - Spawns: KyberVision23VideoMontageMaker service

2. **KyberVision23YouTubeUploader** (youtubeUploadQueue)
   - Concurrency: 2
   - Uploads videos to YouTube
   - Spawns: KyberVision23YouTubeUploader service
   - Updates Video table via @kybervision/db package on completion/failure

**Queue settings:**

- `removeOnComplete: false` - Keeps completed jobs for dashboard inspection
- `removeOnFail: false` - Keeps failed jobs for debugging
- Progress tracking via `job.updateProgress()` and `job.log()`

### Database Integration

The application uses the local `@kybervision/db` package (`file:../db-models`) for:

- Video record lookups and updates (youtubeUploader.js:67-69)
- Marking videos as `processingFailed` on upload errors
- Sequelize ORM models with TypeScript definitions

Database location controlled by environment variables:

- `PATH_DATABASE`: Directory containing the SQLite database
- `NAME_DB`: Database filename (e.g., kv22.db)

### Logging and Error Handling

**Console Prefixing Architecture:**

The Queuer uses a centralized logging approach where ALL output (parent and child) gets the same `[NAME_APP]` prefix, with origin distinguished by message content:

**Parent Process (server.js:6-14):**

- `console.log` and `console.error` are overridden to add `[NAME_APP]` prefix
- All direct Queuer logs appear as: `[KyberVision23Queuer] message`

**Child Process Logs:**

- Child stdout captured via `child.stdout.on("data")` and logged with "Microservice Output:" marker
- Child stderr captured via `child.stderr.on("data")` and logged with "Microservice Error:" marker
- Appears as: `[KyberVision23Queuer] Microservice Output: child message`

**IMPORTANT:** Child microservices (YouTubeUploader, VideoMontageMaker) should NOT override console or add their own prefixes. The parent handles all formatting. See `docs/LOGGING_FIX_INSTRUCTIONS.md` for details.

**Global error handlers** (server.js:17-26):

- `uncaughtException`: Logs stack trace and exits process
- `unhandledRejection`: Logs promise rejections without exiting
- Error handlers do NOT manually add brackets (console override handles it)

**Morgan logging** (app.js:25-31):

- Disabled for `/dashboard` routes to reduce noise
- Uses 'dev' format for all other routes

**Example log output:**

```
[KyberVision23Queuer] ⚙️ Starting Job ID: 4
[KyberVision23Queuer] Microservice Output: ✅ initModels() is called successfully.
[KyberVision23Queuer] Microservice Error: ❌ Upload failed: SQLITE_ERROR
[KyberVision23Queuer] Microservice exited with code 1
```

## Environment Configuration

Critical environment variables (see .env.example for full list):

### Core Settings

- `NAME_APP`: Application identifier for logging
- `PORT`: Server port (default: 8003)
- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port

### Database

- `PATH_DATABASE`: Path to SQLite database directory
- `NAME_DB`: Database filename

### Queue Names

- `NAME_KV_VIDEO_MONTAGE_MAKER_QUEUE`: Montage maker queue name
- `YOUTUBE_UPLOADER_QUEUE_NAME`: YouTube uploader queue name

### Microservice Paths

- `PATH_TO_VIDEO_MONTAGE_MAKER_SERVICE`: Path to video montage maker service
- `PATH_TO_YOUTUBE_UPLOADER_SERVICE`: Path to YouTube uploader service
- `PATH_TO_TEST_JOB_SERVICE`: Path to test job service (if used)

### Video Storage Paths

- `PATH_VIDEOS_UPLOADED`: Uploaded session videos
- `PATH_VIDEOS_MONTAGE_CLIPS`: Montage clip segments
- `PATH_VIDEOS_MONTAGE_COMPLETE`: Completed montage videos

### YouTube API

- `YOUTUBE_CLIENT_ID`: OAuth client ID
- `YOUTUBE_CLIENT_SECRET`: OAuth client secret
- `YOUTUBE_REDIRECT_URI`: OAuth redirect URI
- `YOUTUBE_REFRESH_TOKEN`: Refresh token for uploads

### API Integration

- `URL_BASE_KV_API`: Base URL for KyberVision API
- `URL_LOCAL_KV_API_FOR_VIDEO_MONTAGE_MAKER`: Local API endpoint for montage maker

## Key Implementation Details

### YouTube Uploader Worker (routes/youtubeUploader.js)

- Receives jobs with `filename` and `videoId`
- Spawns child process with CLI args: `--filename <name> --videoId <id>`
- On stderr events, marks video as failed in database (lines 67-69)
- Updates Video table via @kybervision/db Sequelize models

### Montage Maker Worker (routes/montageVideoMaker.js)

- Receives jobs with `filename`, `actionsArray`, `token`, and `user`
- Passes complex data as JSON stringified arguments to child process
- Uses 5-step progress tracking (totalSteps = 5)
- Each stdout message increments progress by 20%

### Dynamic Queue Creation (routes/youtubeUploader.js:111-113)

The `/youtube-uploader/add` endpoint supports dynamic queue creation:

```javascript
const dynamicQueue = new Queue(queueName, { connection: redisConnection });
```

This allows custom queue names via the `queueName` request parameter, defaulting to `YOUTUBE_UPLOADER_QUEUE_NAME` if not provided.

### Bull Board Integration (app.js:58-70)

- Uses `@bull-board/express` adapter
- Mounted at `/dashboard` route
- Must be registered BEFORE other routes to prevent conflicts
- Monitors both montageQueue and youtubeUploadQueue

## API Routes

### Video Montage Maker

**POST /video-montage-maker/add**

- Body: `{ filename, actionsArray, token, user }`
- Returns: `{ message, jobId }`

### YouTube Uploader

**POST /youtube-uploader/add**

- Body: `{ filename, videoId, queueName? }`
- Returns: `{ message, jobId }`

### Users

**Placeholder route** - minimal implementation (routes/users.js)

## Dependencies

- `express` (v5.1.0): Web framework
- `bullmq` (v5.46.1): Queue management
- `ioredis` (v5.6.0): Redis client
- `@bull-board/express` + `@bull-board/api`: Queue monitoring UI
- `@kybervision/db` (local package): Database models
- `dotenv`: Environment variable management
- `morgan`: HTTP request logging
- `cors`: Cross-origin resource sharing
- `cookie-parser`: Cookie parsing middleware
- `ejs`: Template engine (if used)

## Common Development Tasks

### Adding a New Queue

1. Create new route file in `routes/<queueName>.js`
2. Define queue with Redis connection:
   ```javascript
   const newQueue = new Queue("QueueName", { connection: redisConnection });
   ```
3. Create worker with job processor function:
   ```javascript
   const worker = new Worker("QueueName", async (job) => { ... }, {
     connection: redisConnection,
     concurrency: 2
   });
   ```
4. Add queue to Bull Board in `app.js`:
   ```javascript
   new BullMQAdapter(newQueue);
   ```
5. Register route in `app.js`:
   ```javascript
   app.use("/queue-path", newQueueRouter);
   ```

### Debugging Job Failures

1. Access Bull Board dashboard: `http://localhost:8003/dashboard`
2. Click on queue name to view jobs
3. Click on failed job ID to see error messages and logs
4. Check stderr output in job logs
5. Review Redis connection if jobs aren't appearing
6. Check microservice paths in .env are correct

### Modifying Child Process Arguments

When changing arguments passed to child processes:

- Update spawn call in worker function
- Update corresponding microservice's argument parsing
- Update README examples for consistency
- Consider backward compatibility with existing jobs

## Relationship to KyberVision Ecosystem

This queuer is part of a larger microservices architecture:

- **KyberVision23API**: Main REST API that queues jobs to this service
- **KyberVision23YouTubeUploader**: Handles YouTube video uploads
- **KyberVision23VideoMontageMaker**: Creates video montages from action clips
- **KyberVision23Db**: Shared SQLite database package with Sequelize models

The queuer acts as the orchestration layer, receiving job requests from the API and delegating processing to specialized microservices while providing monitoring via Bull Board.
