# TRANSITION_YouTubeUploader_TODO.md

Migration checklist for absorbing `KyberVision22YouTubeUploader` into `worker-node/` so that YouTube uploading is no longer an external child process.

## Feasibility Summary

This is a straightforward migration. The uploader is ~60 lines of active code split across two files (`index.js`, `modules/uploader.js`). Worker-node already has all YouTube OAuth environment variables and already imports `Video` from `@kybervision/db`. The primary work is porting the upload logic to TypeScript, replacing the `child_process.spawn()` call with a direct function call, and adding `googleapis` as a dependency.

---

## Phase 1 — Audit & Preparation

- [x] Confirm the `Video` model in `@kybervision/db` has the same field names used by the uploader: `youTubeVideoId`, `processingCompleted`, `processingFailed`
- [x] Confirm `initModels()` is called at worker-node startup — it is **not** currently called anywhere in `worker-node/src/`. Add it to `worker-node/src/app.ts` alongside `sequelize.sync()` (mirroring the pattern in `api/src/app.ts`), otherwise `Video.findByPk()` will fail at runtime
- [x] Add `googleapis` to `worker-node/package.json` dependencies (`npm install googleapis`)
- [x] Verify the YouTube OAuth env vars already present in `worker-node/.env` are correct and still valid: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI`, `YOUTUBE_REFRESH_TOKEN`
- [x] Note any design decisions that need to be made before implementation (see Decision Points section below)

---

## Phase 2 — Port Upload Logic to TypeScript

- [x] Create `worker-node/src/modules/youtubeUploadService.ts`
- [x] Port the `uploadVideo(filePath, videoId)` function from `KyberVision22YouTubeUploader/modules/uploader.js` to TypeScript
- [x] Replace `require("kybervision22db")` with `import { Video } from "@kybervision/db"`
- [x] Remove the `initModels()` call from inside the upload function — it will be handled at app startup (Phase 1)
- [x] Remove the unused `fileSize` variable (`fs.statSync(filePath).size` is computed but never used in the original)
- [x] Add explicit TypeScript types for function parameters (`filePath: string`, `videoId: number`) and return type (`Promise<string>` returning the YouTube video ID)
- [x] Update the hardcoded video description from `"Uploaded by KyberVision22YouTubeUploader"` to `"Uploaded by KyberVision23"`
- [x] Ensure thrown errors propagate correctly so the BullMQ worker can catch and mark the job as failed

---

## Phase 3 — Update the BullMQ Worker

- [x] Open `worker-node/src/routes/youtubeUploader.ts`
- [x] Remove the `child_process.spawn` import and the entire child process block from the `Worker` processor function
- [x] Remove the `path` import (no longer needed for service directory resolution)
- [x] Import and call `uploadVideo` from `../modules/youtubeUploadService` directly inside the worker processor
- [x] Replace stdout-based progress updates (which were driven by child process output) with explicit `job.updateProgress()` calls at meaningful points in the upload lifecycle (e.g., 25% after OAuth setup, 75% after upload completes, 100% after DB update)
- [x] Replace stderr-based `processingFailed` DB updates with a try/catch around the `uploadVideo()` call — set `processingFailed = true` on the Video record in the catch block
- [x] Add `job.log()` calls at key steps to preserve visibility in the Bull Board dashboard

---

## Phase 4 — Environment Variable Cleanup

- [ ] Remove `PATH_TO_YOUTUBE_UPLOADER_SERVICE` from `worker-node/.env`
- [ ] Remove `PATH_TO_YOUTUBE_UPLOADER_SERVICE` from `worker-node/.env.example`
- [ ] Update `YOUTUBE_UPLOADER_QUEUE_NAME` to `YouTubeUploadProcess` in `worker-node/.env` and `worker-node/.env.example`
- [ ] Update `YOUTUBE_UPLOADER_QUEUE_NAME` to `YouTubeUploadProcess` in `api/.env` and `api/.env.example` (if present) so the API sends jobs to the renamed queue
- [ ] Add a comment in `.env.example` noting that `YOUTUBE_*` variables are now consumed directly by worker-node (no longer passed to an external process)

---

## Phase 5 — Testing

- [ ] Run `npm run build` in `worker-node/` and confirm zero TypeScript errors
- [ ] Start worker-node and verify the Bull Board dashboard loads at `http://localhost:8003/dashboard` and the `YouTubeUploadProcess` queue appears
- [ ] Submit a test job via `POST /youtube-uploader/add` with a valid `filename` and `videoId` and confirm the job reaches `active` state in the dashboard
- [ ] Confirm the video file is uploaded to YouTube (check YouTube Studio)
- [ ] Confirm the `Video` database record is updated with a non-null `youTubeVideoId` and `processingCompleted = true`
- [ ] Simulate a failure (invalid filename or revoked token) and confirm `processingFailed = true` is written to the DB and the job appears as failed in the dashboard
- [ ] Run the full end-to-end flow via the API: `POST /videos/upload-youtube` → API → worker-node queue → upload → DB update

---

## Phase 6 — Cleanup & Documentation

- [ ] Update `worker-node/CLAUDE.md` to reflect that YouTube upload logic now lives in `src/modules/youtubeUploadService.ts` and that no external microservice is required
- [ ] Remove `PATH_TO_YOUTUBE_UPLOADER_SERVICE` from the environment variable table in `worker-node/CLAUDE.md`
- [ ] Update the root `CLAUDE.md` service communication diagram to show that worker-node handles YouTube upload directly instead of spawning a child process
- [ ] Archive or delete `KyberVision22YouTubeUploader/` — it is no longer part of the active workflow. If kept for reference, add a clearly visible deprecation notice to its `README.md`

---

## Decision Points

These are design choices resolved before implementation:

| #   | Question                                                                            | Decision                                                 |
| --- | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | Should the YouTube video title remain the raw filename?                             | Yes — filename is used as-is                             |
| 2   | Should the privacy status remain `"unlisted"`?                                      | Yes                                                      |
| 3   | Keep the queue name `KyberVision23YouTubeUploader` or rename?                       | Rename to `YouTubeUploadProcess`                         |
| 4   | Should `youtubeUploadService.ts` live in `modules/` or a new `services/` directory? | `modules/` to stay consistent with existing structure    |
