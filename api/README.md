![Logo](./docs/images/kyberVisionLogo01.png)

# API v23

## Overview

## Development & Deployment

### Local Development (Your Workstation)

**Setup:**
```bash
npm install              # Install all dependencies (including dev/test packages)
npm run dev              # Start with hot reload (nodemon + ts-node)
# OR
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled code from dist/
```

**Testing:**
```bash
npm test                 # Run test suite locally
npm test -- --watch      # Watch mode for TDD
```

**Building:**
```bash
npm run build            # Compiles src/ → dist/
git add dist/            # Commit compiled code
git commit && git push   # Deploy to GitHub
```

**Important:** Always build locally and commit `dist/` files. Production servers run pre-compiled JavaScript, not TypeScript.

---

### Production Deployment (Ubuntu Server)

**⚠️ Production servers should NEVER build or run tests.**

**Deployment workflow:**
```bash
# 1. Pull latest code
git pull origin main

# 2. Install production dependencies ONLY
npm install --omit=dev

# 3. Restart the service
systemctl restart kybervision23api
# OR however you start your service

# 4. Verify deployment (optional)
./smoke-test.sh https://api.kv23.dashanddata.com
```

**Critical rules for production:**
- ❌ **NEVER** run `npm install` (without --omit=dev)
- ❌ **NEVER** run `npm run build`
- ❌ **NEVER** run `npm test`
- ✅ **ALWAYS** use `npm install --omit=dev`
- ✅ **ALWAYS** pull pre-built code from git

**Why?**
- Production servers lack TypeScript compiler and test packages
- Building requires dev dependencies (~500MB)
- Tests require dev dependencies and can crash production
- Pre-built `dist/` files are committed and ready to run

**Automated testing:** Tests run automatically in GitHub Actions before deployment. Check the Actions tab for test results.

---

## .env

`api/.env` is loaded at runtime via `path.join(__dirname, "../.env")` — `dist/` has no `.env`. `NODE_ENV` must be `production`; `testing` skips database initialization.

```bash
NAME_APP=KyberVision23API
JWT_SECRET=secret_code
PATH_DATABASE=/Users/nick/Documents/_databases/KyberVision23
NAME_DB=kv22.db
PATH_VIDEOS=/Users/nick/Documents/_project_resources/KyberVision23API/session_videos
PATH_VIDEOS_UPLOADED=/Users/nick/Documents/_project_resources/KyberVision23API/session_videos/uploaded
PATH_VIDEOS_MONTAGE_CLIPS=/Users/nick/Documents/_project_resources/KyberVision23API/session_videos/montage_clips
PATH_VIDEOS_MONTAGE_COMPLETE=/Users/nick/Documents/_project_resources/KyberVision23API/session_videos/montage_complete
ADMIN_EMAIL_ADDRESS=kyber.vision.info@gmail.com
ADMIN_EMAIL_PASSWORD="secret_code"
PATH_DB_BACKUPS=/Users/nick/Documents/_project_resources/KyberVision23API/db_backups
PATH_PROJECT_RESOURCES=/Users/nick/Documents/_project_resources/KyberVision23API
ADMIN_EMAIL_KV_MANAGER_WEBSITE=["nrodrig1@gmail.com"]
URL_KV_MANAGER_WEBSITE=https://kv22-manager.dashanddata.com
URL_KV_JOB_QUEUER=http://localhost:8003
URL_BASE_KV_API=https://api.kv22.dashanddata.com
PATH_TEST_REQUEST_ARGS=/Users/nick/Documents/project_resources/KyberVision23API/test_request_args
NODE_ENV=production
AUTHENTIFICATION_TURNED_OFF=false
YOUTUBE_CLIENT_ID=secret.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=secret
YOUTUBE_REDIRECT_URI=http://localhost
YOUTUBE_REFRESH_TOKEN=secret
YOUTUBE_UPLOADER_QUEUE_NAME=KyberVision23YouTubeUploader
PREFIX_VIDEO_FILE_NAME=kv22
PATH_PROFILE_PICTURES_PLAYER_DIR=/Users/nick/Documents/_project_resources/KyberVision23API/profile_pictures_player
```

## Folder Structure

```
.
├── AGENT.md
├── dist
│   ├── app.js
│   ├── modules
│   │   ├── adminDb.js
│   │   ├── common.js
│   │   ├── contractVideoAction.js
│   │   ├── mailer.js
│   │   ├── onStartUp.js
│   │   ├── players.js
│   │   ├── sessions.js
│   │   ├── userAuthentication.js
│   │   └── videos.js
│   ├── routes
│   │   ├── adminDb.js
│   │   ├── contractPlayerUsers.js
│   │   ├── contractTeamUsers.js
│   │   ├── contractUserActions.js
│   │   ├── contractVideoActions.js
│   │   ├── index.js
│   │   ├── leagues.js
│   │   ├── players.js
│   │   ├── scripts.js
│   │   ├── sessions.js
│   │   ├── teams.js
│   │   ├── users.js
│   │   └── videos.js
│   └── server.js
├── docs
│   ├── API_REFERENCE.md
│   ├── DATABASE_SCHEMA_OVERVIEW.md
│   ├── images
│   │   └── kyberVisionLogo01.png
│   ├── KyberVision18ApiReference
│   │   ├── app.js
│   │   ├── modules
│   │   └── routes
│   └── TS_CONVERSION_STATUS.md
├── package-lock.json
├── package.json
├── README.md
├── src
│   ├── app.ts
│   ├── modules
│   │   ├── adminDb.ts
│   │   ├── common.ts
│   │   ├── contractVideoAction.ts
│   │   ├── mailer.ts
│   │   ├── onStartUp.ts
│   │   ├── players.ts
│   │   ├── sessions.ts
│   │   ├── userAuthentication.ts
│   │   └── videos.ts
│   ├── public
│   ├── routes
│   │   ├── adminDb.ts
│   │   ├── contractPlayerUsers.ts
│   │   ├── contractTeamUsers.ts
│   │   ├── contractUserActions.ts
│   │   ├── contractVideoActions.ts
│   │   ├── index.ts
│   │   ├── leagues.ts
│   │   ├── players.ts
│   │   ├── scripts.ts
│   │   ├── sessions.ts
│   │   ├── teams.ts
│   │   ├── users.ts
│   │   └── videos.ts
│   ├── server.ts
│   └── templates
│       ├── registrationConfirmationEmail.html
│       ├── requestToRegisterEmail.html
│       ├── resetPasswordLinkEmail.html
│       └── videoMontageCompleteNotificationEmail.html
└── tsconfig.json
```

## Testing

The API includes a comprehensive test suite using Jest and Supertest. Tests use an in-memory SQLite database for fast, isolated execution.

### Running Tests

**Run all tests:**

```bash
npm test
```

**Run a specific test file:**

```bash
npm test -- users.test.ts
npm test -- teams.test.ts
npm test -- sessions.test.ts
```

**Run tests in watch mode:**

```bash
npm test -- --watch
```

**Run tests with coverage:**

```bash
npm test -- --coverage
```

**Run tests matching a pattern:**

```bash
npm test -- --testNamePattern="should return 200"
```
