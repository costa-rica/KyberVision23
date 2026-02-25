/**
 * Tests for app.ts
 * Verifies that the Express app initializes correctly with mocked dependencies
 */

// Mocks MUST be defined before any imports
jest.mock("../src/modules/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
}));

jest.mock("ioredis");
jest.mock("bullmq");
jest.mock("@kybervision/db", () => ({
  __esModule: true,
  initModels: jest.fn(),
  sequelize: {
    sync: jest.fn().mockResolvedValue(undefined),
  },
  Video: {
    findByPk: jest.fn(),
  },
}));

// Now import dependencies
import request from "supertest";
import app from "../src/app";

describe("Express App", () => {
  it("should create Express app instance", () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe("function");
  });

  it("should respond to GET /users", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.text).toBe("respond with a resource");
  });
});

describe("Middleware Configuration", () => {
  it("should parse JSON bodies", async () => {
    // The montage-maker endpoint accepts JSON
    const response = await request(app)
      .post("/video-montage-maker/add")
      .send({ test: "data" })
      .set("Content-Type", "application/json");

    // We expect it to process the JSON (even if it fails validation)
    // Status may be 400 or 500, but not 415 (Unsupported Media Type)
    expect(response.status).not.toBe(415);
  });

  it("should have CORS enabled", async () => {
    const response = await request(app)
      .get("/users")
      .set("Origin", "http://example.com");

    expect(response.headers["access-control-allow-origin"]).toBeDefined();
  });
});
