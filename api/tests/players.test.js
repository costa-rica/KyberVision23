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
    await db_1.ContractTeamPlayer.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.Player.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.Team.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.User.destroy({ where: {}, truncate: true, cascade: true });
    // Reset SQLite auto-increment sequences
    await db_1.sequelize.query("DELETE FROM sqlite_sequence");
});
afterAll(async () => {
    await db_1.sequelize.close();
});
describe("GET /players/team/:teamId", () => {
    it("should return 200 with { result: true, team, playersArray }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id, { teamName: "Test Team" });
        // Create players for the team
        await (0, helpers_1.createTestPlayer)(team.id, {
            firstName: "John",
            lastName: "Doe",
        });
        await (0, helpers_1.createTestPlayer)(team.id, {
            firstName: "Jane",
            lastName: "Smith",
        });
        const response = await (0, supertest_1.default)(app)
            .get(`/players/team/${team.id}`)
            .set((0, helpers_1.authHeader)(testUser.token));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("team");
        expect(response.body).toHaveProperty("playersArray");
        expect(Array.isArray(response.body.playersArray)).toBe(true);
        expect(response.body.playersArray.length).toBe(2);
        expect(response.body.team.id).toBe(team.id);
    });
    it("should return 401 without auth token", async () => {
        const response = await (0, supertest_1.default)(app).get("/players/team/1");
        expect(response.status).toBe(401);
    });
});
describe("GET /players/profile-picture/:filename", () => {
    it("should return 404 when file not found", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        // Without actual files in the test environment, this returns 404
        const response = await (0, supertest_1.default)(app)
            .get("/players/profile-picture/nonexistent.png")
            .set((0, helpers_1.authHeader)(testUser.token));
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error");
    });
    it("should require authentication", async () => {
        const response = await (0, supertest_1.default)(app).get("/players/profile-picture/test.png");
        expect(response.status).toBe(401);
    });
});
