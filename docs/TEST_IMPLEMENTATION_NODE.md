# Node.js Testing Architecture Guide

This document outlines the testing patterns and architecture used across Node.js projects in this monorepo. Use this as a reference when implementing tests for new projects.

---

## Testing Philosophy

**Core principles:**
- Tests run in isolated environments (in-memory databases, mocked services)
- External dependencies are mocked to prevent side effects
- Tests are fast, deterministic, and can run in CI/CD
- Production code and test code are separate
- Environment variables are managed safely (no secrets in git)

**When to test:**
- Automatically: GitHub Actions runs tests on every push/PR
- Locally: Developers run tests before committing
- Never on production servers

---

## API Tests

The API project uses Jest + Supertest for testing Express.js REST endpoints.

### Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Test Runner | Jest | Executes tests, assertions, mocking |
| HTTP Testing | Supertest | Makes HTTP requests to Express app |
| Database | In-memory SQLite | Fast, isolated database for each test run |
| Mocking | jest.mock() | Mock external services (email, APIs, file system) |

### Project Structure

```
api/
├── src/                          # Source code (TypeScript)
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # HTTP server startup
│   ├── routes/                   # Route handlers
│   └── modules/                  # Business logic
├── tests/                        # Test files (TypeScript)
│   ├── setup.ts                  # Global test configuration
│   ├── helpers.ts                # Test utilities & factory functions
│   ├── users.test.ts             # One test file per route/resource
│   ├── teams.test.ts
│   └── ...
├── jest.config.ts                # Jest configuration
├── package.json                  # Test scripts & dependencies
└── .env                          # Environment variables (NOT in git)
```

**Key conventions:**
- Test files named `*.test.ts` (matches `testMatch` in jest.config.ts)
- One test file per route file (e.g., `routes/users.ts` → `tests/users.test.ts`)
- Shared setup in `setup.ts`, shared utilities in `helpers.ts`

### Configuration Files

#### jest.config.ts

```typescript
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",                    // TypeScript support
  testEnvironment: "node",              // Node.js environment (not browser)
  roots: ["<rootDir>/tests"],           // Test directory
  testMatch: ["**/*.test.ts"],          // Test file pattern
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],  // Global setup
  collectCoverageFrom: [                // Coverage tracking
    "src/**/*.ts",
    "!src/**/*.d.ts"
  ],
  coverageDirectory: "coverage",
  verbose: true,
  forceExit: true,                      // Force exit after tests complete
  clearMocks: true,                     // Clear mocks between tests
  resetMocks: true,
  restoreMocks: true,
  maxWorkers: 1,                        // Serial execution (avoids conflicts)
  testTimeout: 30000,                   // 30 second timeout
};

export default config;
```

**Critical settings:**
- `maxWorkers: 1` - Run tests serially to avoid resource conflicts (database, ports)
- `forceExit: true` - Ensure Jest exits after tests (handles hanging connections)
- `testTimeout: 30000` - Generous timeout for database setup

#### package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@types/jest": "^30.0.0",
    "@types/supertest": "^6.0.3",
    "jest": "^30.2.0",
    "supertest": "^7.2.2",
    "ts-jest": "^29.4.6"
  }
}
```

**Note:** Test dependencies are in `devDependencies` - they are NOT installed on production servers.

### Environment Variables in Tests

**Approach: Direct environment variable override**

Tests set `NODE_ENV=testing` and override critical environment variables directly in the test environment, rather than relying on `.env` files.

**Example in GitHub Actions:**
```yaml
- name: Run tests
  working-directory: ./api
  env:
    NODE_ENV: testing
    JWT_SECRET: test-secret-for-ci
    NAME_APP: KyberVision23API-CI
  run: npm test
```

**Example in setup.ts:**
```typescript
process.env.NODE_ENV = "testing";
process.env.JWT_SECRET = "test-secret";
```

**Why this approach?**
- Tests don't depend on local `.env` files (works in CI)
- Test values are separate from production values
- No risk of accidentally using production credentials

### Database Strategy: In-Memory SQLite

**Why in-memory?**
- Fast: No disk I/O
- Isolated: Each test run gets fresh database
- No cleanup needed: Database disappears when tests end
- No production data risk: Completely separate from production database

**Implementation:**

```typescript
// tests/setup.ts
import { Sequelize } from "sequelize";
import { initModels } from "@your-package/db";

// Create in-memory SQLite instance
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",  // ← Key: in-memory storage
  logging: false,       // Silent during tests
});

beforeAll(async () => {
  initModels();
  await sequelize.sync({ force: true });  // Create tables
});

beforeEach(async () => {
  // Clear all data between tests
  await User.destroy({ where: {}, truncate: true, cascade: true });
  await Team.destroy({ where: {}, truncate: true, cascade: true });
  // ... clear other tables

  // Reset auto-increment
  await sequelize.query("DELETE FROM sqlite_sequence");
});

afterAll(async () => {
  await sequelize.close();
});
```

**Best practices:**
- Use `force: true` in beforeAll to recreate schema
- Clear data in `beforeEach` for test isolation
- Reset SQLite sequences for predictable IDs
- Close connection in `afterAll`

### Mocking External Services

**Rule: Mock all external dependencies**

External services (email, third-party APIs, file system) should be mocked to:
- Prevent side effects (sending real emails, API calls)
- Make tests deterministic (no network failures)
- Speed up tests (no waiting for external services)

**Example: Mocking modules**

```typescript
// tests/users.test.ts (or any test file)
// Mocks MUST be at top level, before any imports

jest.mock("../src/modules/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("../src/modules/mailer", () => ({
  __esModule: true,
  sendRegistrationEmail: jest.fn(() => Promise.resolve({ response: "250 OK" })),
  sendResetPasswordEmail: jest.fn(() => Promise.resolve({ response: "250 OK" })),
}));

// Now import your app (after mocks are defined)
import request from "supertest";
import app from "../src/app";
```

**What to mock:**
- Logger (noisy output)
- Email service (prevent real emails)
- File system operations (fs.readFile, fs.writeFile)
- External HTTP APIs (YouTube, payment gateways, etc.)
- Background job queues

### Test Helpers & Factories

**Pattern: Factory functions for test data**

Instead of duplicating setup code in every test, create helper functions that generate test data.

**Example: helpers.ts**

```typescript
import jwt from "jsonwebtoken";
import { User, Team } from "@your-package/db";

// Create a test user with valid JWT token
export async function createTestUser(overrides = {}) {
  const user = await User.create({
    email: "test@example.com",
    password: "hashed-password",
    firstName: "Test",
    lastName: "User",
    ...overrides,
  });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  return { ...user.toJSON(), token };
}

// Create a test team (with user association)
export async function createTestTeam(userId: number, overrides = {}) {
  const team = await Team.create({
    teamName: "Test Team",
    userId,
    ...overrides,
  });

  return team;
}

// Helper to generate auth header
export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
```

**Benefits:**
- DRY: Reusable across tests
- Flexibility: Override default values as needed
- Consistency: All tests use same data structure

### Writing Tests

**Structure: describe() blocks + it() assertions**

```typescript
import request from "supertest";
import app from "../src/app";
import { createTestUser, authHeader } from "./helpers";

describe("POST /users/login", () => {
  it("should return 200 with token on valid credentials", async () => {
    // Arrange: Set up test data
    const testUser = await createTestUser({
      email: "login@test.com",
      password: await bcrypt.hash("password123", 10),
    });

    // Act: Make request
    const response = await request(app)
      .post("/users/login")
      .send({
        email: "login@test.com",
        password: "password123",
      });

    // Assert: Check response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
  });

  it("should return 401 on wrong password", async () => {
    const testUser = await createTestUser();

    const response = await request(app)
      .post("/users/login")
      .send({
        email: testUser.email,
        password: "wrong-password",
      });

    expect(response.status).toBe(401);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).get("/protected-route");
    expect(response.status).toBe(401);
  });
});
```

**Best practices:**
- Group related tests with `describe()` blocks
- Use clear, descriptive test names
- Follow Arrange-Act-Assert pattern
- Test happy path AND error cases
- Test authentication/authorization requirements

### GitHub Actions Integration

**Automated testing on every push/PR**

**Workflow file: `.github/workflows/test.yml`**

```yaml
name: Run API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]  # Test on multiple Node versions

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: api/package-lock.json

    # If monorepo with local packages (e.g., @kybervision/db)
    - name: Install db-models dependencies
      working-directory: ./db-models
      run: npm ci

    - name: Build db-models
      working-directory: ./db-models
      run: npm run build

    - name: Install api dependencies
      working-directory: ./api
      run: npm ci

    - name: Run tests
      working-directory: ./api
      env:
        NODE_ENV: testing
        JWT_SECRET: test-secret-for-ci
        NAME_APP: KyberVision23API-CI
      run: npm test

    - name: Upload coverage reports
      if: matrix.node-version == '20.x'
      uses: codecov/codecov-action@v3
      with:
        directory: ./api/coverage
        fail_ci_if_error: false
```

**Key features:**
- Runs on multiple Node versions (ensure compatibility)
- Uses `npm ci` (faster, more reliable than `npm install`)
- Sets environment variables for tests
- Uploads coverage reports (optional)
- Runs on Ubuntu (matches production environment)

**Viewing results:**
- Go to repository → Actions tab
- See ✅ green checkmark (passed) or ❌ red X (failed) on commits
- Click on run to see detailed logs

### Serial vs Parallel Execution

**Problem:** Multiple test files running in parallel can cause conflicts:
- Database port already in use
- Race conditions in shared resources
- Unpredictable test failures

**Solution:** Run tests serially with `maxWorkers: 1`

```typescript
// jest.config.ts
const config: Config = {
  maxWorkers: 1,  // Run one test file at a time
  // ...
};
```

**Trade-offs:**
- ✅ Pros: Reliable, no resource conflicts
- ❌ Cons: Slower (but still fast for most projects)

**Alternative:** If tests are truly isolated, you can increase `maxWorkers` for speed.

### Coverage Tracking

**Enable coverage reporting:**

```bash
npm test -- --coverage
```

**Coverage output:**
```
-----------------------|---------|----------|---------|---------|-------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------|---------|----------|---------|---------|-------------------
All files              |   85.23 |    78.45 |   90.12 |   85.67 |
 routes/users.ts       |   92.31 |    85.71 |   100   |   92.31 | 45-48
 routes/teams.ts       |   88.89 |    75.00 |   100   |   88.89 | 23,56
-----------------------|---------|----------|---------|---------|-------------------
```

**Integrate with CI:**
- Upload coverage to Codecov/Coveralls
- Set minimum coverage thresholds
- Block PRs that reduce coverage

### Common Patterns

#### Testing authenticated endpoints

```typescript
it("should require authentication", async () => {
  const response = await request(app).get("/protected");
  expect(response.status).toBe(401);
});

it("should allow access with valid token", async () => {
  const testUser = await createTestUser();
  const response = await request(app)
    .get("/protected")
    .set(authHeader(testUser.token));
  expect(response.status).toBe(200);
});
```

#### Testing database operations

```typescript
it("should create user in database", async () => {
  const response = await request(app)
    .post("/users/register")
    .send({ email: "new@test.com", password: "pass123" });

  expect(response.status).toBe(201);

  // Verify database state
  const user = await User.findOne({ where: { email: "new@test.com" } });
  expect(user).toBeTruthy();
  expect(user!.email).toBe("new@test.com");
});
```

#### Testing validation errors

```typescript
it("should return 400 for missing required fields", async () => {
  const response = await request(app)
    .post("/users/register")
    .send({ email: "missing-password@test.com" });

  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty("error");
});
```

### Troubleshooting

**Tests timeout:**
- Increase `testTimeout` in jest.config.ts
- Check for unclosed database connections
- Ensure mocks are properly configured

**Tests fail in CI but pass locally:**
- Environment variable differences
- Different Node.js versions
- Missing dependencies (check package-lock.json)

**Database errors:**
- Ensure `beforeEach` clears all data
- Check foreign key constraints (delete in correct order)
- Verify `initModels()` is called before `sync()`

**Port conflicts:**
- Use random ports: `app.listen(0)` (OS assigns available port)
- Or run tests serially (`maxWorkers: 1`)

---

## Summary: Checklist for New Projects

When adding tests to a new Node.js project:

- [ ] Install test dependencies: `jest`, `ts-jest`, `@types/jest`
- [ ] Create `jest.config.ts` with TypeScript preset
- [ ] Create `tests/` directory with `setup.ts` and `helpers.ts`
- [ ] Configure in-memory database (if using database)
- [ ] Add mocks for external services (logger, mailer, etc.)
- [ ] Write test files matching route/module structure
- [ ] Add npm scripts: `test`, `test:watch`, `test:coverage`
- [ ] Create GitHub Actions workflow (`.github/workflows/test.yml`)
- [ ] Set environment variables in workflow
- [ ] Run tests locally to verify setup
- [ ] Push and verify tests pass in CI

**Reference implementation:** See `api/` directory for complete example.

---

## Future Sections

- **NextJS Tests** - Coming soon
- **Worker Tests** - Coming soon
- **Integration Tests** - Coming soon
