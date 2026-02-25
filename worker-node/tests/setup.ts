/**
 * Global test setup for worker-node tests
 *
 * This file runs before all tests and sets up the test environment.
 * It sets environment variables, configures mocks, and provides
 * test cleanup hooks.
 */

// Set NODE_ENV to testing first
process.env.NODE_ENV = "testing";

// Configure test environment variables
process.env.NAME_APP = "KyberVision23Queuer-Test";
process.env.PORT = "8003";

// Redis configuration (will be mocked, but values needed for validation)
process.env.REDIS_HOST = "127.0.0.1";
process.env.REDIS_PORT = "6379";

// Database configuration (will be mocked)
process.env.PATH_DATABASE = "/tmp/test-db/";
process.env.NAME_DB = "test-kv.db";

// Queue names
process.env.NAME_KV_VIDEO_MONTAGE_MAKER_QUEUE = "KyberVision23VideoMontageMaker-Test";
process.env.YOUTUBE_UPLOADER_QUEUE_NAME = "YouTubeUploadProcess-Test";

// File paths (will be mocked in tests)
process.env.PATH_VIDEOS_UPLOADED = "/tmp/test-videos/uploaded/";
process.env.PATH_VIDEOS_MONTAGE_CLIPS = "/tmp/test-videos/clips/";
process.env.PATH_VIDEOS_MONTAGE_COMPLETE = "/tmp/test-videos/complete/";
process.env.PATH_TO_TEST_JOB_SERVICE = "/tmp/test-job-service/";
process.env.PATH_TEST_REQUEST_ARGS = "/tmp/test-request-args/";
process.env.PATH_TO_LOGS = "/tmp/test-logs/";

// YouTube OAuth2 (mocked, but required for validation)
process.env.YOUTUBE_CLIENT_ID = "test-client-id";
process.env.YOUTUBE_CLIENT_SECRET = "test-client-secret";
process.env.YOUTUBE_REDIRECT_URI = "http://localhost";
process.env.YOUTUBE_REFRESH_TOKEN = "test-refresh-token";

// API URLs (will be mocked)
process.env.URL_BASE_KV_API = "http://localhost:3000";
process.env.URL_LOCAL_KV_API_FOR_VIDEO_MONTAGE_MAKER = "http://localhost:3000";

// Logging configuration
process.env.LOG_MAX_SIZE = "1m";
process.env.LOG_MAX_FILES = "2";

// Global test hooks
beforeAll(() => {
  // Any global setup before all tests
});

afterAll(() => {
  // Any global cleanup after all tests
});

beforeEach(() => {
  // Reset state before each test
});

afterEach(() => {
  // Cleanup after each test
});
