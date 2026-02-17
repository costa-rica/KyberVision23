# TRANSITION VideoMontageMaker TODO

## Phase 1: Discovery and Decisions

- [x] Review KV22VideoMontageMaker entrypoints and helpers (`index.js`, `modules/apiRequests.js`, `modules/watermark.js`).
- [x] Catalog required env vars used by montage flow (`PATH_VIDEOS_UPLOADED`, `PATH_VIDEOS_MONTAGE_CLIPS`, `PATH_VIDEOS_MONTAGE_COMPLETE`, `URL_LOCAL_KV_API_FOR_VIDEO_MONTAGE_MAKER`, optional `PATH_TEST_REQUEST_ARGS`).
- [x] Confirm API callback contract for `/videos/montage-service/video-completed-notify-user` (payload + auth header expectations).
- [x] Decide worker-node module layout and naming (e.g., `src/modules/videoMontageService.ts`, `src/modules/videoMontageApi.ts`).
- [x] Decide where the watermark asset will live inside worker-node and how it is packaged for `dist/`.

## Phase 2: Dependency and Asset Migration

- [x] Add `axios` and `fluent-ffmpeg` to `worker-node/package.json` dependencies.
- [x] Add any required type packages or ambient typings for `fluent-ffmpeg` if needed.
- [x] Copy watermark image into worker-node (e.g., `worker-node/assets/KyberV2Shiny.png`).
- [x] Add a build step to copy montage assets into `worker-node/dist/` (or resolve a runtime path outside `dist/`).

## Phase 3: Core Montage Logic (Native)

- [x] Port `createVideoMontage` to TypeScript module using worker-node logging instead of `console.*`.
- [x] Keep clip extraction logic (3s clips with 1.5s pre-roll) and concat file list behavior.
- [x] Port watermark step (`addWatermarkToVideo`) and ensure robust file existence checks.
- [x] Port `apiPostRequestVideoMontageIsComplete` to use worker-node HTTP client and current env vars.
- [x] Remove all `process.exit()` usage; throw errors so BullMQ can mark jobs failed.
- [x] Centralize cleanup of montage clips on success and failure.

## Phase 4: Worker Integration

- [x] Replace child process spawn in `worker-node/src/routes/montageVideoMaker.ts` with a direct function call.
- [x] Map job progress updates to internal steps (clip creation, merge, watermark, API notify).
- [x] Keep job payload shape (`filename`, `actionsArray`, `user`, `token`) unchanged for API compatibility.
- [x] Remove references to `PATH_TO_VIDEO_MONTAGE_MAKER_SERVICE` from montage worker logic.

## Phase 5: Configuration and Docs

- [x] Update `worker-node/.env.example` to remove `PATH_TO_VIDEO_MONTAGE_MAKER_SERVICE` and document any new vars.
- [x] Update `worker-node/AGENT.md` to describe native montage processing (no child process).
- [x] Update `docs/PROJECT_OVERVIEW.md` to reflect montage maker absorption into worker-node.
- [x] Add migration notes to `docs/transition-to-kv23` if operational changes are required (ffmpeg install, assets).
