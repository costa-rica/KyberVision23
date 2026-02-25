/**
 * Test helpers and utilities
 *
 * This file provides shared mock factories, test data generators,
 * and utility functions used across multiple test files.
 */

/**
 * Create a mock Video model instance
 */
export function createMockVideo(overrides = {}) {
  return {
    id: 1,
    filename: "test-video.mp4",
    youTubeVideoId: null,
    processingCompleted: false,
    processingFailed: false,
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

/**
 * Create a mock user object (typical payload from API)
 */
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    ...overrides,
  };
}

/**
 * Create a mock BullMQ Job instance
 */
export function createMockJob(data: any, overrides = {}) {
  return {
    id: "test-job-123",
    name: "test-job",
    data,
    updateProgress: jest.fn().mockResolvedValue(true),
    log: jest.fn(),
    ...overrides,
  };
}

/**
 * Generate a test JWT token (not cryptographically valid, just for testing)
 */
export function generateTestToken() {
  return "test-jwt-token-abc123";
}

/**
 * Create mock actions array for video montage
 */
export function createMockActionsArray() {
  return [
    { timestamp: 10.5 },
    { timestamp: 25.3 },
    { timestamp: 42.7 },
  ];
}
