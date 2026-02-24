"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = createTestUser;
exports.createTestTeam = createTestTeam;
exports.createTestLeague = createTestLeague;
exports.createTestSession = createTestSession;
exports.createContractLeagueTeam = createContractLeagueTeam;
exports.createTestPlayer = createTestPlayer;
exports.authHeader = authHeader;
// Test helper utilities
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("@kybervision/db");
const userAuthentication_1 = require("../src/modules/userAuthentication");
/**
 * Creates a test user in the database and returns user details + JWT token
 */
async function createTestUser(overrides = {}) {
    const email = overrides.email || `test${Date.now()}@example.com`;
    const password = overrides.password || "password123";
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await db_1.User.create({
        email,
        password: hashedPassword,
        firstName: overrides.firstName || "Test",
        lastName: overrides.lastName || "User",
        username: email.split("@")[0],
    });
    const token = (0, userAuthentication_1.tokenizeObject)({ id: user.id });
    return {
        id: user.id,
        email,
        password, // Plain text password for login tests
        token,
        user: user.toJSON(),
    };
}
/**
 * Creates a test team in the database
 */
async function createTestTeam(userId, overrides = {}) {
    const team = await db_1.Team.create({
        teamName: overrides.teamName || `Test Team ${Date.now()}`,
        description: overrides.description || "Test team description",
        visibility: overrides.visibility || "Private",
    });
    // Create ContractTeamUser relationship
    await db_1.ContractTeamUser.create({
        userId,
        teamId: team.id,
        isSuperUser: true,
        isAdmin: true,
        isCoach: false,
    });
    return team;
}
/**
 * Creates a test league in the database
 */
async function createTestLeague(overrides = {}) {
    return await db_1.League.create({
        name: overrides.name || `Test League ${Date.now()}`,
        category: overrides.category || "Test Category",
    });
}
/**
 * Creates a test session in the database
 */
async function createTestSession(teamId, contractLeagueTeamId, overrides = {}) {
    return await db_1.Session.create({
        teamId,
        contractLeagueTeamId,
        sessionDate: overrides.sessionDate || new Date(),
        sessionName: overrides.sessionName || "Test Session",
        city: overrides.city || "Test City",
    });
}
/**
 * Creates a ContractLeagueTeam relationship
 */
async function createContractLeagueTeam(leagueId, teamId) {
    return await db_1.ContractLeagueTeam.create({
        leagueId,
        teamId,
    });
}
/**
 * Creates a test player and links to team
 */
async function createTestPlayer(teamId, overrides = {}) {
    const player = await db_1.Player.create({
        firstName: overrides.firstName || "Test",
        lastName: overrides.lastName || "Player",
        birthDate: overrides.birthDate || null,
    });
    await db_1.ContractTeamPlayer.create({
        teamId,
        playerId: player.id,
    });
    return player;
}
/**
 * Helper to generate auth header for supertest requests
 */
function authHeader(token) {
    return { Authorization: `Bearer ${token}` };
}
