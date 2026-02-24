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
    await db_1.Team.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.User.destroy({ where: {}, truncate: true, cascade: true });
    await db_1.Player.destroy({ where: {}, truncate: true, cascade: true });
});
afterAll(async () => {
    await db_1.sequelize.close();
});
describe("GET /teams", () => {
    it("should return 200 with { result: true, teams }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        await (0, helpers_1.createTestTeam)(testUser.id, { teamName: "Test Team 1" });
        await (0, helpers_1.createTestTeam)(testUser.id, { teamName: "Test Team 2" });
        const response = await (0, supertest_1.default)(app)
            .get("/teams")
            .set((0, helpers_1.authHeader)(testUser.token));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("teams");
        expect(Array.isArray(response.body.teams)).toBe(true);
        expect(response.body.teams.length).toBeGreaterThanOrEqual(2);
    });
    it("should return 401 without auth token", async () => {
        const response = await (0, supertest_1.default)(app).get("/teams");
        expect(response.status).toBe(401);
    });
});
describe("POST /teams/create", () => {
    it("should return 200 with { result: true, teamNew } on valid input", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const league = await (0, helpers_1.createTestLeague)({ name: "Test League" });
        const response = await (0, supertest_1.default)(app)
            .post("/teams/create")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            teamName: "New Test Team",
            description: "Team description",
            leagueName: "Test League",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("teamNew");
        expect(response.body.teamNew.teamName).toBe("New Test Team");
    });
    it("should create team with players when playersArray provided", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const league = await (0, helpers_1.createTestLeague)({ name: "Test League" });
        const response = await (0, supertest_1.default)(app)
            .post("/teams/create")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            teamName: "Team with Players",
            description: "Team description",
            leagueName: "Test League",
            playersArray: [
                { firstName: "John", lastName: "Doe" },
                { firstName: "Jane", lastName: "Smith" },
            ],
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("teamNew");
        // Verify players were created and linked to team
        const players = await db_1.Player.findAll({
            include: [
                {
                    model: db_1.ContractTeamPlayer,
                    where: { teamId: response.body.teamNew.id },
                },
            ],
        });
        expect(players.length).toBe(2);
    });
});
describe("POST /teams/update-visibility", () => {
    it("should return 200 with { result: true, team }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id, {
            teamName: "Visibility Test Team",
            visibility: "Private",
        });
        const response = await (0, supertest_1.default)(app)
            .post("/teams/update-visibility")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            teamId: team.id,
            visibility: "Public",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("team");
        expect(response.body.team.visibility).toBe("Public");
    });
    it("should return 404 when team not found", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const response = await (0, supertest_1.default)(app)
            .post("/teams/update-visibility")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            teamId: 99999,
            visibility: "Public",
        });
        expect(response.status).toBe(404);
    });
});
describe("POST /teams/add-player", () => {
    it("should return 200 with { result: true, playerNew }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id);
        const response = await (0, supertest_1.default)(app)
            .post("/teams/add-player")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            teamId: team.id,
            firstName: "New",
            lastName: "Player",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("playerNew");
        expect(response.body.playerNew.firstName).toBe("New");
        expect(response.body.playerNew.lastName).toBe("Player");
    });
});
describe("DELETE /teams/player", () => {
    it("should return 200 with { result: true }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        const team = await (0, helpers_1.createTestTeam)(testUser.id);
        const player = await (0, helpers_1.createTestPlayer)(team.id, {
            firstName: "Delete",
            lastName: "Me",
        });
        const response = await (0, supertest_1.default)(app)
            .delete("/teams/player")
            .set((0, helpers_1.authHeader)(testUser.token))
            .send({
            teamId: team.id,
            playerId: player.id,
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        // Verify player-team link was deleted
        const contractTeamPlayer = await db_1.ContractTeamPlayer.findOne({
            where: { teamId: team.id, playerId: player.id },
        });
        expect(contractTeamPlayer).toBeNull();
    });
});
describe("GET /teams/public", () => {
    it("should return 200 with { result: true, publicTeamsArray }", async () => {
        const testUser = await (0, helpers_1.createTestUser)();
        await (0, helpers_1.createTestTeam)(testUser.id, {
            teamName: "Public Team 1",
            visibility: "Public",
        });
        await (0, helpers_1.createTestTeam)(testUser.id, {
            teamName: "Public Team 2",
            visibility: "Public",
        });
        await (0, helpers_1.createTestTeam)(testUser.id, {
            teamName: "Private Team",
            visibility: "Private",
        });
        const response = await (0, supertest_1.default)(app)
            .get("/teams/public")
            .set((0, helpers_1.authHeader)(testUser.token));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result", true);
        expect(response.body).toHaveProperty("publicTeamsArray");
        expect(Array.isArray(response.body.publicTeamsArray)).toBe(true);
        // Should only return public teams
        expect(response.body.publicTeamsArray.length).toBe(2);
        response.body.publicTeamsArray.forEach((team) => {
            expect(team.visibility).toBe("Public");
        });
    });
});
