// Mocks must be at the top level before any imports
jest.mock("../src/modules/logger", () => {
  const mockLogger = {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
  };
  return { default: mockLogger, __esModule: true };
});

jest.mock("../src/modules/mailer", () => ({
  __esModule: true,
  sendRegistrationEmail: () => Promise.resolve({ response: "250 OK" }),
  sendResetPasswordEmail: () => Promise.resolve({ response: "250 OK" }),
  sendVideoMontageCompleteNotificationEmail: () =>
    Promise.resolve({ response: "250 OK" }),
  sendJoinSquadNotificationEmail: () => Promise.resolve({ response: "250 OK" }),
}));

import request from "supertest";
import bcrypt from "bcrypt";
import { initModels, sequelize, User } from "@kybervision/db";
import { tokenizeObject } from "../src/modules/userAuthentication";
import { createTestUser, authHeader } from "./helpers";

// Import app AFTER setup to ensure mocks are in place
let app: any;

beforeAll(async () => {
  // Initialize database models
  initModels();
  await sequelize.sync({ force: true });

  // Import app after DB is ready
  const appModule = await import("../src/app");
  app = appModule.default;
});

beforeEach(async () => {
  // Clear all tables before each test
  await User.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("POST /users/register", () => {
  it("should return 201 with { message, user, token } on valid input", async () => {
    const response = await request(app).post("/users/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe("john@example.com");
  });

  it("should return 400 when email already exists", async () => {
    await createTestUser({ email: "existing@example.com" });

    const response = await request(app).post("/users/register").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "existing@example.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("already exists");
  });

  it("should return 400 when required fields missing", async () => {
    const response = await request(app).post("/users/register").send({
      email: "incomplete@example.com",
      // Missing firstName, lastName, password
    });

    expect(response.status).toBe(400);
  });
});

describe("POST /users/login", () => {
  it("should return 200 with { message, token, user } on valid credentials", async () => {
    const testUser = await createTestUser({
      email: "login@example.com",
      password: "password123",
    });

    const response = await request(app).post("/users/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("login@example.com");
  });

  it("should return 401 on wrong password", async () => {
    await createTestUser({
      email: "login@example.com",
      password: "password123",
    });

    const response = await request(app).post("/users/login").send({
      email: "login@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain("Invalid");
  });

  it("should return 404 when user not found", async () => {
    const response = await request(app).post("/users/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toContain("not found");
  });
});

describe("POST /users/request-reset-password-email", () => {
  it("should return 200 with { message } for existing email", async () => {
    await createTestUser({ email: "reset@example.com" });

    const response = await request(app)
      .post("/users/request-reset-password-email")
      .send({
        email: "reset@example.com",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  it("should return 404 for unknown email", async () => {
    const response = await request(app)
      .post("/users/request-reset-password-email")
      .send({
        email: "unknown@example.com",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toContain("not found");
  });
});

describe("POST /users/reset-password-with-new-password", () => {
  it("should return 200 with { message } on valid new password", async () => {
    const testUser = await createTestUser({ email: "change@example.com" });

    const response = await request(app)
      .post("/users/reset-password-with-new-password")
      .set(authHeader(testUser.token))
      .send({
        password: "newpassword456",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");

    // Verify password was actually changed
    const user = await User.findByPk(testUser.id);
    expect(user).not.toBeNull();
    const passwordMatch = await bcrypt.compare("newpassword456", user!.password!);
    expect(passwordMatch).toBe(true);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app)
      .post("/users/reset-password-with-new-password")
      .send({
        password: "newpassword456",
      });

    expect(response.status).toBe(401);
  });
});

describe("DELETE /users/delete-account", () => {
  it("should return 200 with { message } on valid email/password", async () => {
    const testUser = await createTestUser({
      email: "delete@example.com",
      password: "password123",
    });

    const response = await request(app).delete("/users/delete-account").send({
      email: "delete@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");

    // Verify user was deleted
    const deletedUser = await User.findByPk(testUser.id);
    expect(deletedUser).toBeNull();
  });

  it("should return 401 on wrong password", async () => {
    await createTestUser({
      email: "delete@example.com",
      password: "password123",
    });

    const response = await request(app).delete("/users/delete-account").send({
      email: "delete@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
  });
});

describe("POST /users/register-or-login-via-google", () => {
  it("should return 200 with { message, token, user } for new Google user", async () => {
    const response = await request(app)
      .post("/users/register-or-login-via-google")
      .send({
        email: "newgoogle@example.com",
        name: "Google User",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("newgoogle@example.com");
  });

  it("should return 200 with { message, token, user } for existing Google user", async () => {
    // Create user first
    await createTestUser({ email: "existinggoogle@example.com" });

    // Login with Google
    const response = await request(app)
      .post("/users/register-or-login-via-google")
      .send({
        email: "existinggoogle@example.com",
        name: "Google User",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
  });
});

describe("GET /users/user-growth-timeseries", () => {
  it("should return 200 with { series, summary }", async () => {
    const testUser = await createTestUser();

    const response = await request(app)
      .get("/users/user-growth-timeseries")
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("series");
    expect(response.body).toHaveProperty("summary");
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).get("/users/user-growth-timeseries");

    expect(response.status).toBe(401);
  });
});
