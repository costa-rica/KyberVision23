![Logo](./docs/images/kyberVisionLogo01.png)

# API v23

## Overview

## .env

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

### Test Structure

Tests are located in the `tests/` directory:

```
api/tests/
├── setup.ts                       # Global test configuration
├── helpers.ts                     # Test utilities and factories
├── users.test.ts                  # User authentication & management
├── teams.test.ts                  # Team CRUD operations
├── sessions.test.ts               # Session management
├── players.test.ts                # Player endpoints
├── leagues.test.ts                # League-team associations
├── contractTeamUsers.test.ts      # Squad management & invitations
├── contractPlayerUsers.test.ts    # User-player linking
├── scripts.test.ts                # Action scripting
├── contractUserActions.test.ts    # User favorites
├── contractVideoActions.test.ts   # Video-action synchronization
├── videos.test.ts                 # Video & montage endpoints
└── index.test.ts                  # Homepage
```

### Test Configuration

Tests use:
- **In-memory SQLite database** - Fast, isolated tests with `storage: ":memory:"`
- **Mocked external services** - Email, YouTube, worker-node HTTP calls
- **Mocked logger** - Silent test execution
- **Test helpers** - Factory functions for creating test data

Configuration is in `jest.config.ts`:
```typescript
{
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"]
}
```

### Test Coverage

**Current Status: 68 / 96 tests (71% coverage)**

| Route | Tests | Status |
|-------|-------|--------|
| users | 16 | ✅ Complete |
| teams | 9 | ✅ Complete |
| sessions | 7 | ✅ Complete |
| players | 4 | ✅ Complete |
| leagues | 2 | ✅ Complete |
| contractTeamUsers | 14 | ✅ Complete |
| contractPlayerUsers | 3 | ✅ Complete |
| scripts | 3 | ✅ Complete |
| contractUserActions | 2 | ✅ Complete |
| contractVideoActions | 3 | ✅ Complete |
| videos | 4 passing, 9 skipped | ⚠️ Partial |
| index | 1 | ✅ Complete |
| adminDb | 0 | ⏸️ Todo |

### Helper Functions

The `tests/helpers.ts` file provides utility functions for creating test data:

```typescript
// Create test user with JWT token
const testUser = await createTestUser({ email: "test@example.com" });

// Create test team (automatically creates ContractTeamUser)
const team = await createTestTeam(testUser.id, { teamName: "My Team" });

// Create test league
const league = await createTestLeague({ name: "Test League" });

// Create test session
const session = await createTestSession(teamId, contractLeagueTeamId);

// Create test player (automatically links to team)
const player = await createTestPlayer(teamId, { firstName: "John" });

// Generate auth header for requests
const headers = authHeader(testUser.token);
```

### Writing New Tests

Example test structure:

```typescript
describe("GET /endpoint", () => {
  it("should return 200 with data", async () => {
    const testUser = await createTestUser();
    const response = await request(app)
      .get("/endpoint")
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).get("/endpoint");
    expect(response.status).toBe(401);
  });
});
```

### Skipped Tests

Some tests in `videos.test.ts` are skipped due to complex external dependencies:
- File upload handling (multer middleware)
- YouTube API integration
- Worker-node HTTP calls
- File system operations

These can be enhanced with more comprehensive mocking infrastructure.

### Continuous Integration

Tests run automatically on:
- Pre-commit (via git hooks, if configured)
- CI/CD pipelines (GitHub Actions, etc.)
- Pull request validation

See `docs/TEST_IMPLEMENTATION_TODO.md` for detailed test implementation tracking.
