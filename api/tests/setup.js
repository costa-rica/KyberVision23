"use strict";
// Global test setup - runs before all test suites
// This file ONLY sets up environment variables, no imports
// Set test environment variables BEFORE any module imports
process.env.NODE_ENV = "testing";
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.PORT = "3000";
process.env.AUTHENTIFICATION_TURNED_OFF = "false"; // Test real auth
process.env.URL_BASE_KV_API = "http://localhost:3000";
process.env.URL_KV_MANAGER_WEBSITE = "http://localhost:3001";
process.env.URL_WORKER_NODE = "http://localhost:8003";
process.env.ADMIN_EMAIL_ADDRESS = "test@test.com";
process.env.ADMIN_EMAIL_PASSWORD = "test-password";
process.env.ADMIN_EMAIL_KV_MANAGER_WEBSITE = "[]"; // Empty array, no admin seeding
process.env.PREFIX_VIDEO_FILE_NAME = "test";
// Use in-memory database for tests
// path.join(".", ":memory:") === ":memory:" in Node.js
process.env.PATH_DATABASE = ".";
process.env.NAME_DB = ":memory:";
// Mock file paths - tests won't actually create these
process.env.PATH_PROJECT_RESOURCES = "/tmp/test-resources";
process.env.PATH_VIDEOS = "/tmp/test-videos";
process.env.PATH_VIDEOS_UPLOADED = "/tmp/test-videos-uploaded";
process.env.PATH_DB_BACKUPS = "/tmp/test-db-backups";
process.env.PATH_PROFILE_PICTURES_PLAYER_DIR = "/tmp/test-profile-pictures";
process.env.PATH_TO_LOGS = "/tmp/test-logs";
