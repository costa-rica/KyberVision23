# Worker-Node Test Implementation TODO

This document tracks the phased implementation of tests for the `worker-node/` project. Each phase ends with a **stop point** where the engineer should run tests, verify the build, and commit changes.

**Instructions:** Mark completed tasks with `[x]` before committing at each stop point.

---

## Phase 1: Test Infrastructure Setup

> Install dependencies, create config files, and get a minimal test passing.

- [x] Install dev dependencies: `jest`, `ts-jest`, `@types/jest`, `@types/supertest`, `supertest`
- [x] Create `jest.config.ts` (ts-jest preset, serial execution, 30s timeout)
- [x] Add `test`, `test:watch`, `test:coverage` scripts to `package.json`
- [x] Create `tests/setup.ts` — set env vars (`NODE_ENV=testing`, `REDIS_HOST`, queue names, paths, etc.)
- [x] Create `tests/helpers.ts` — shared mock factories and utilities
- [x] Create a minimal smoke test (`tests/smoke.test.ts`) that verifies Jest runs
- [x] Update `tsconfig.json` `exclude` to include `tests/` (so tests don't compile to `dist/`)

### Stop Point 1

```bash
npm test          # all tests pass
npm run build     # no TypeScript errors, tests excluded from dist/
```

Commit changes with a message describing Phase 1 completion.

---

## Phase 2: Mock Foundation & App Import Test

> Establish the mocking strategy so `app.ts` can be imported without Redis/DB connections.

- [ ] Create mock for `ioredis` (prevents real Redis connections)
- [ ] Create mock for `bullmq` (Queue, Worker, Job stubs)
- [ ] Create mock for `@kybervision/db` (initModels, sequelize.sync, Video model)
- [ ] Create mock for `modules/logger` (silent winston)
- [ ] Write `tests/app.test.ts` — verify app imports without errors, Express instance is created
- [ ] Test `GET /` returns 200 (index route)
- [ ] Test `GET /users` returns 200 (users placeholder)

### Stop Point 2

```bash
npm test          # all tests pass
npm run build     # no TypeScript errors
```

Commit changes with a message describing Phase 2 completion.

---

## Phase 3: Route Tests — YouTube Uploader

> Test the `POST /youtube-uploader/add` endpoint and the upload service module.

- [ ] Create mock for `googleapis` (OAuth2 client, youtube.videos.insert)
- [ ] Create mock for `fs` (createReadStream for upload)
- [ ] Write `tests/youtubeUploader.test.ts`:
  - [ ] POST `/youtube-uploader/add` with valid payload returns 200 + jobId
  - [ ] POST `/youtube-uploader/add` with missing fields returns error
  - [ ] POST `/youtube-uploader/add` with custom `queueName` works
- [ ] Write `tests/youtubeUploadService.test.ts`:
  - [ ] `uploadVideo()` calls YouTube API with correct params
  - [ ] `uploadVideo()` updates Video record in DB on success
  - [ ] `uploadVideo()` handles API errors gracefully

### Stop Point 3

```bash
npm test          # all tests pass
npm run build     # no TypeScript errors
```

Commit changes with a message describing Phase 3 completion.

---

## Phase 4: Route Tests — Video Montage Maker

> Test the `POST /video-montage-maker/add` endpoint and the montage service module.

- [ ] Create mock for `fluent-ffmpeg` (chainable API)
- [ ] Create mock for `fs` operations (existsSync, mkdirSync, promises.readdir, promises.unlink, writeFileSync)
- [ ] Write `tests/montageVideoMaker.test.ts`:
  - [ ] POST `/video-montage-maker/add` with valid payload returns 200 + jobId
  - [ ] POST `/video-montage-maker/add` with missing fields returns error
- [ ] Write `tests/videoMontageService.test.ts`:
  - [ ] `createVideoMontage()` validates source file exists
  - [ ] `createVideoMontage()` validates actionsArray is not empty
  - [ ] `createVideoMontage()` calls FFmpeg for clip extraction
  - [ ] `createVideoMontage()` calls onProgress at correct checkpoints
  - [ ] `createVideoMontage()` cleans up temp files
- [ ] Write `tests/videoMontageApi.test.ts`:
  - [ ] `notifyVideoMontageComplete()` sends correct POST request
  - [ ] `notifyVideoMontageComplete()` handles API errors

### Stop Point 4

```bash
npm test          # all tests pass
npm run build     # no TypeScript errors
```

Commit changes with a message describing Phase 4 completion.

---

## Phase 5: GitHub Actions & Deployment Verification

> Add worker-node to CI pipeline and verify production build is unaffected.

- [ ] Update `.github/workflows/test.yml` to add a `test-worker-node` job
  - Build db-models first, then install worker-node deps, then run tests
  - Set appropriate env vars (`NODE_ENV`, `REDIS_HOST`, queue names, paths)
- [ ] Verify `npm run build` still produces clean `dist/` output (test files excluded)
- [ ] Verify `npm start` works with compiled output (no test code bundled)
- [ ] Run full test suite with `npm test -- --coverage` and review coverage report

### Stop Point 5

```bash
npm test                    # all tests pass
npm test -- --coverage      # review coverage report
npm run build               # no TypeScript errors
```

Commit & push changes with a message describing Phase 5 completion.

---

## Mocking Reference

| Dependency | Mock Strategy |
|---|---|
| `ioredis` | `jest.mock('ioredis')` — return stub with `connect/disconnect/quit` |
| `bullmq` | `jest.mock('bullmq')` — Queue.add returns fake jobId, Worker is no-op |
| `@kybervision/db` | `jest.mock('@kybervision/db')` — initModels no-op, Video.findByPk returns mock |
| `googleapis` | `jest.mock('googleapis')` — OAuth2 + videos.insert stub |
| `fluent-ffmpeg` | `jest.mock('fluent-ffmpeg')` — chainable builder pattern mock |
| `axios` | `jest.mock('axios')` — post returns resolved promise |
| `fs` | `jest.mock('fs')` — stub file operations |
| `logger` | `jest.mock('../src/modules/logger')` — silent no-op |
