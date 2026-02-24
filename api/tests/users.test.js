"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Mocks must be at the top level before any imports
jest.mock("../src/modules/logger", () => {
    const mockLogger = {
        info: () => { },
        error: () => { },
        warn: () => { },
        debug: () => { },
    };
    return { default: mockLogger, __esModule: true };
});
jest.mock("../src/modules/mailer", () => ({
    __esModule: true,
    sendRegistrationEmail: () => Promise.resolve({ response: "250 OK" }),
    sendResetPasswordEmail: () => Promise.resolve({ response: "250 OK" }),
    sendVideoMontageCompleteNotificationEmail: () => Promise.resolve({ response: "250 OK" }),
    sendJoinSquadNotificationEmail: () => Promise.resolve({ response: "250 OK" }),
}));
const supertest_1 = __importDefault(require("supertest"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("@kybervision/db");
const helpers_1 = require("./helpers");
// Import app AFTER setup to ensure mocks are in place
let app;
beforeAll(async () => {
    // Initialize database models
    (0, db_1.initModels)();
    await db_1.sequelize.sync({ force: true });
    // Import app after DB is ready
    const appModule = await Promise.resolve().then(() => __importStar(require("../src/app")));
    app = appModule.default;
});
beforeEach(async () => {
    // Clear all tables before each test
    await db_1.User.destroy({ where: {}, truncate: true });
});
afterAll(async () => {
    await db_1.sequelize.close();
});
describe("POST /users/register", () => {
    it("should return 201 with { message, user, token } on valid input", async () => {
        const response = await (0, supertest_1.default)(app).post("/users/register").send({
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
        await (0, helpers_1.createTestUser)({ email: "existing@example.com" });
        const response = await (0, supertest_1.default)(app).post("/users/register").send({
            firstName: "Jane",
            lastName: "Doe",
            email: "existing@example.com",
            password: "password123",
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("already exists");
    });
    it("should return 400 when required fields missing", async () => {
        const response = await (0, supertest_1.default)(app).post("/users/register").send({
            email: "incomplete@example.com",
            // Missing firstName, lastName, password
        });
        expect(response.status).toBe(400);
    });
});
describe("POST /users/login", () => {
    it("should return 200 with { message, token, user } on valid credentials", async () => {
        const testUser = await (0, helpers_1.createTestUser)({
            email: "login@example.com",
            password: "password123",
        });
        const response = await (0, supertest_1.default)(app).post("/users/login").send({
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
        await (0, helpers_1.createTestUser)({
            email: "login@example.com",
            password: "password123",
        });
        const response = await (0, supertest_1.default)(app).post("/users/login").send({
            email: "login@example.com",
            password: "wrongpassword",
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toContain("Invalid");
    });
    it("should return 404 when user not found", async () => {
        const response = await (0, supertest_1.default)(app).post("/users/login").send({
            email: "nonexistent@example.com",
            password: "password123",
        });
        expect(response.status).toBe(404);
        expect(response.body.error).toContain("not found");
    });
});
describe("POST /users/request-reset-password-email", () => {
    it("should return 200 with { message } for existing email", async () => {
        await (0, helpers_1.createTestUser)({ email: "reset@example.com" });
        const response = await (0, supertest_1.default)(app)
            .post("/users/request-reset-password-email")
            .send({
            email: "reset@example.com",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
    });
    it("should return 404 for unknown email", async () => {
        const response = await (0, supertest_1.default)(app)
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
        const testUser = await (0, helpers_1.createTestUser)({ email: "change@example.com" });
        const response = await (0, supertest_1.default)(app)
            .post("/users/reset-password-with-new-password")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            password: "newpassword456",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        // Verify password was actually changed
        const user = await db_1.User.findByPk(testUser.id);
        expect(user).not.toBeNull();
        const passwordMatch = await bcrypt_1.default.compare("newpassword456", user.password);
        expect(passwordMatch).toBe(true);
    });
    it("should return 401 without auth token", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/users/reset-password-with-new-password")
            .send({
            password: "newpassword456",
        });
        expect(response.status).toBe(401);
    });
});
describe("DELETE /users/delete-account", () => {
    it("should return 200 with { message } on valid email/password", async () => {
        const testUser = await (0, helpers_1.createTestUser)({
            email: "delete@example.com",
            password: "password123",
        });
        const response = await (0, supertest_1.default)(app).delete("/users/delete-account").send({
            email: "delete@example.com",
            password: "password123",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        // Verify user was deleted
        const deletedUser = await db_1.User.findByPk(testUser.id);
        expect(deletedUser).toBeNull();
    });
    it("should return 401 on wrong password", async () => {
        await (0, helpers_1.createTestUser)({
            email: "delete@example.com",
            password: "password123",
        });
        const response = await (0, supertest_1.default)(app).delete("/users/delete-account").send({
            email: "delete@example.com",
            password: "wrongpassword",
        });
        expect(response.status).toBe(401);
    });
});
describe("POST /users/register-or-login-via-google", () => {
    it("should return 200 with { message, token, user } for new Google user", async () => {
        const response = await (0, supertest_1.default)(app)
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
        await (0, helpers_1.createTestUser)({ email: "existinggoogle@example.com" });
        // Login with Google
        const response = await (0, supertest_1.default)(app)
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
        const testUser = await (0, helpers_1.createTestUser)();
        const response = await (0, supertest_1.default)(app)
            .get("/users/user-growth-timeseries")
            .set((0, helpers_1.authHeader)(testUser.token));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("series");
        expect(response.body).toHaveProperty("summary");
    });
    it("should return 401 without auth token", async () => {
        const response = await (0, supertest_1.default)(app).get("/users/user-growth-timeseries");
        expect(response.status).toBe(401);
    });
});
