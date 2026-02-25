/**
 * Mock for src/modules/logger.ts
 * Provides a silent Winston logger for tests
 */

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn(),
};

export default mockLogger;
