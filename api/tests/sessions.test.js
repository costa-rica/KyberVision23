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
    // Clear all tables before each test - order matters for foreign keys
    await db_1.Action.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.ContractVideoAction.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.Script.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.Video.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.Session.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.ContractTeamPlayer.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.Player.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.ContractLeagueTeam.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.League.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.Team.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.User.destroy({ where: {}, truncate: true, cascade: true });
    // Reset SQLite auto-increment sequences
    await db_1.sequelize.query("DELETE FROM sqlite_sequence");
});
afterAll(async () => {
    await db_1.sequelize.close();
});
describe("GET /sessions/:teamId", () => {
    it("should return 200 with { result: true, sessionsArray }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id);
        const league = await (0, helpers_1.createTestLeague)();
        const contractLeagueTeam = await (0, helpers_1.createContractLeagueTeam)(league.id, team.id);
        await (0, helpers_1.createTestSession)(team.id, contractLeagueTeam.id, {
            sessionName: "Session 1",
        });
        await (0, helpers_1.createTestSession)(team.id, contractLeagueTeam.id, {
            sessionName: "Session 2",
        });
        const response = await (0, supertest_1.default)(app)
            .get(`/sessions/${team.id}`)
            .set((0, helpers_1.authHeader)(testUser.token));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("sessionsArray");
        expect(Array.isArray(response.body.sessionsArray)).toBe(true);
        expect(response.body.sessionsArray.length).toBe(2);
    });
    it("should return 401 without auth token", async () => {
        const response = await (0, supertest_1.default)(app).get("/sessions/1");
        expect(response.status).toBe(401);
    });
});
describe("POST /sessions/create", () => {
    it("should return 200 with { result: true, sessionNew } on valid input", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id);
        const league = await (0, helpers_1.createTestLeague)();
        const contractLeagueTeam = await (0, helpers_1.createContractLeagueTeam)(league.id, team.id);
        const response = await (0, supertest_1.default)(app)
            .post("/sessions/create")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            teamId: team.id,
            contractLeagueTeamId: contractLeagueTeam.id,
            sessionDate: new Date().toISOString(),
            sessionName: "New Session",
            sessionCity: "Test City",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("sessionNew");
        expect(response.body.sessionNew.sessionName).toBe("New Session");
    });
    it("should return 404 when contractLeagueTeamId not found", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id);
        const response = await (0, supertest_1.default)(app)
            .post("/sessions/create")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            teamId: team.id,
            contractLeagueTeamId: 99999,
            sessionDate: new Date().toISOString(),
            sessionName: "Invalid Session",
            sessionCity: "Test City",
        });
        expect(response.status).toBe(404);
    });
});
describe("POST /sessions/review-selection-screen/get-actions", () => {
    it("should return 200 with { result: true, actionsArray, playerDbObjectsArray }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id);
        const league = await (0, helpers_1.createTestLeague)();
        const contractLeagueTeam = await (0, helpers_1.createContractLeagueTeam)(league.id, team.id);
        const session = await (0, helpers_1.createTestSession)(team.id, contractLeagueTeam.id);
        const player = await (0, helpers_1.createTestPlayer)(team.id);
        // Create a script with actions
        const script = await db_1.Script.create({
            sessionId: session.id,
        });
        await db_1.Action.create({
            scriptId: script.id,
            playerId: player.id,
            type: 1,
            quality: "good",
            timestamp: new Date(),
            area: "center",
            setNumber: 1,
            scoreTeamAnalyzed: 0,
            scoreTeamOther: 0,
        });
        // Create a video for the session
        const video = await db_1.Video.create({
            sessionId: session.id,
            filename: "test.mp4",
            processingCompleted: true,
        });
        const response = await (0, supertest_1.default)(app)
            .post("/sessions/review-selection-screen/get-actions")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            sessionId: session.id,
            videoId: video.id,
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("actionsArray");
        expect(response.body).toHaveProperty("playerDbObjectsArray");
        expect(Array.isArray(response.body.actionsArray)).toBe(true);
        expect(Array.isArray(response.body.playerDbObjectsArray)).toBe(true);
    });
});
describe("GET /sessions/scripting-sync-video/:sessionId/actions", () => {
    it("should return 200 with { result: true, actionsArray }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id);
        const league = await (0, helpers_1.createTestLeague)();
        const contractLeagueTeam = await (0, helpers_1.createContractLeagueTeam)(league.id, team.id);
        const session = await (0, helpers_1.createTestSession)(team.id, contractLeagueTeam.id);
        const player = await (0, helpers_1.createTestPlayer)(team.id);
        // Create a script with actions
        const script = await db_1.Script.create({
            sessionId: session.id,
        });
        await db_1.Action.create({
            scriptId: script.id,
            playerId: player.id,
            type: 1,
            quality: "good",
            timestamp: new Date(),
            area: "center",
            setNumber: 1,
            scoreTeamAnalyzed: 0,
            scoreTeamOther: 0,
        });
        await db_1.Action.create({
            scriptId: script.id,
            playerId: player.id,
            type: 2,
            quality: "excellent",
            timestamp: new Date(),
            area: "left",
            setNumber: 1,
            scoreTeamAnalyzed: 0,
            scoreTeamOther: 0,
        });
        const response = await (0, supertest_1.default)(app)
            .get(`/sessions/scripting-sync-video/${session.id}/actions`)
            .set((0, helpers_1.authHeader)(testUser.token));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("actionsArray");
        expect(Array.isArray(response.body.actionsArray)).toBe(true);
        expect(response.body.actionsArray.length).toBe(2);
    });
});
describe("GET /sessions/scripting-sync-video-screen/get-actions-for-syncing/:sessionId", () => {
    it("should return 200 with { result: true, actionsArrayByScript }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id);
        const league = await (0, helpers_1.createTestLeague)();
        const contractLeagueTeam = await (0, helpers_1.createContractLeagueTeam)(league.id, team.id);
        const session = await (0, helpers_1.createTestSession)(team.id, contractLeagueTeam.id);
        const player = await (0, helpers_1.createTestPlayer)(team.id);
        // Create a script with actions
        const script = await db_1.Script.create({
            sessionId: session.id,
        });
        await db_1.Action.create({
            scriptId: script.id,
            playerId: player.id,
            type: 1,
            quality: "good",
            timestamp: new Date(),
            area: "center",
            setNumber: 1,
            scoreTeamAnalyzed: 0,
            scoreTeamOther: 0,
        });
        const response = await (0, supertest_1.default)(app)
            .get(`/sessions/scripting-sync-video-screen/get-actions-for-syncing/${session.id}`)
            .set((0, helpers_1.authHeader)(testUser.token));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("actionsArrayByScript");
        expect(Array.isArray(response.body.actionsArrayByScript)).toBe(true);
    });
});
