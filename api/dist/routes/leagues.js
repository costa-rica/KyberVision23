"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("@kybervision/db");
const userAuthentication_1 = require("../modules/userAuthentication");
const logger_1 = __importDefault(require("../modules/logger"));
const router = express_1.default.Router();
// GET /leagues/team/:teamId
router.get("/team/:teamId", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);
        const contractLeagueTeamsArray = await db_1.ContractLeagueTeam.findAll({
            where: {
                teamId,
            },
        });
        const leaguesArray = await Promise.all(contractLeagueTeamsArray.map(async (contractLeagueTeam) => {
            const league = await db_1.League.findByPk(contractLeagueTeam.leagueId);
            if (!league) {
                throw new Error(`League not found for leagueId: ${contractLeagueTeam.leagueId}`);
            }
            return {
                id: league.id,
                name: league.name,
                contractLeagueTeamId: contractLeagueTeam.id,
            };
        }));
        // Sort leagues by leagueId
        leaguesArray.sort((a, b) => a.id - b.id);
        res.status(200).json({ leaguesArray });
    }
    catch (error) {
        logger_1.default.error("❌ Error retrieving leagues:", error);
        res.status(500).json({
            error: "Error retrieving leagues",
            details: error.message,
        });
    }
});
exports.default = router;
