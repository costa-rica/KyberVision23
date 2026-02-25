import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest", // TypeScript support
  testEnvironment: "node", // Node.js environment (not browser)
  roots: ["<rootDir>/tests"], // Test directory
  testMatch: ["**/*.test.ts"], // Test file pattern
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"], // Global setup
  collectCoverageFrom: [
    // Coverage tracking
    "src/**/*.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  verbose: true,
  forceExit: true, // Force exit after tests complete
  clearMocks: true, // Clear mocks between tests
  resetMocks: true,
  restoreMocks: true,
  maxWorkers: 1, // Serial execution (avoids conflicts)
  testTimeout: 30000, // 30 second timeout
};

export default config;
