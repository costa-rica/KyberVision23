"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionWithFreeAgentLeague = createSessionWithFreeAgentLeague;
exports.createSession = createSession;
exports.deleteSession = deleteSession;
exports.getSessionWithTeams = getSessionWithTeams;
const db_1 = require("@kybervision/db");
const logger_1 = __importDefault(require("../modules/logger"));
async function createSessionWithFreeAgentLeague(teamId) {
    try {
        const freeAgentLeague = await db_1.League.findOne({
            where: { name: "Free Agent League" },
        });
        if (!freeAgentLeague) {
            logger_1.default.info("ℹ️  Free Agent league not found. Skipping setup.");
            return null;
        }
        const contractLeagueTeam = await db_1.ContractLeagueTeam.create({
            leagueId: freeAgentLeague.id,
            teamId: teamId,
        });
        const session = await db_1.Session.create({
            teamId: teamId,
            contractLeagueTeamId: contractLeagueTeam.id,
            city: "Practice",
            sessionDate: new Date(),
        });
        logger_1.default.info(`✅ Session created with Free Agent league.`);
        return session;
    }
    catch (err) {
        logger_1.default.error(`❌ Error creating session with Free Agent league:`, err);
        return null;
    }
}
async function createSession(sessionData) {
    try {
        const session = await db_1.Session.create(sessionData);
        return { success: true, session };
    }
    catch (error) {
        logger_1.default.error("Error creating session:", error);
        return { success: false, error: error.message };
    }
}
async function deleteSession(sessionId) {
    try {
        const session = await db_1.Session.findByPk(sessionId);
        if (!session) {
            return { success: false, error: "Session not found" };
        }
        await session.destroy();
        return { success: true };
    }
    catch (error) {
        logger_1.default.error("Error deleting session:", error);
        return { success: false, error: error.message };
    }
}
async function getSessionWithTeams(sessionId) {
    var _a, _b, _c, _d;
    try {
        // Fetch session with team details
        const session = await db_1.Session.findByPk(sessionId, {
            include: [
                {
                    model: db_1.Team,
                    attributes: ["id", "teamName", "city", "coachName"],
                    required: true,
                },
            ],
            attributes: {
                exclude: ["teamId", "contractLeagueTeamId"],
            },
        });
        if (!session) {
            return { success: false, error: "Session not found" };
        }
        // Access team data through association
        const sessionJSON = session.toJSON();
        // Rename team attributes by prefixing them
        const formattedSession = Object.assign(Object.assign({}, sessionJSON), { teamId: (_a = sessionJSON.Team) === null || _a === void 0 ? void 0 : _a.id, teamName: (_b = sessionJSON.Team) === null || _b === void 0 ? void 0 : _b.teamName, teamCity: (_c = sessionJSON.Team) === null || _c === void 0 ? void 0 : _c.city, teamCoach: (_d = sessionJSON.Team) === null || _d === void 0 ? void 0 : _d.coachName });
        // Remove the nested team objects
        delete formattedSession.Team;
        return { success: true, session: formattedSession };
    }
    catch (error) {
        logger_1.default.error("Error fetching session with teams:", error);
        return { success: false, error: error.message };
    }
}
