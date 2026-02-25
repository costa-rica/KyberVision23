"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("@kybervision/db");
const userAuthentication_1 = require("../modules/userAuthentication");
const players_1 = require("../modules/players");
const logger_1 = __importDefault(require("../modules/logger"));
const router = express_1.default.Router();
// GET /teams
router.get("/", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed GET /teams");
    const teams = await db_1.Team.findAll();
    logger_1.default.info(`- we have ${teams.length} teams`);
    res.json({ result: true, teams });
});
// POST /teams/create
router.post("/create", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed POST /teams/create");
    const { teamName, description, playersArray, leagueName } = req.body;
    logger_1.default.info(`teamName: ${teamName}`);
    const teamNew = await db_1.Team.create({
        teamName,
        description,
    });
    let leagueId;
    if (!leagueName) {
        leagueId = 1;
    }
    else {
        const league = await db_1.League.findOne({ where: { name: leagueName } });
        leagueId = (league === null || league === void 0 ? void 0 : league.id) || 1;
    }
    const contractLeagueTeamNew = await db_1.ContractLeagueTeam.create({
        leagueId,
        teamId: teamNew.id,
    });
    const contractTeamUserNew = await db_1.ContractTeamUser.create({
        teamId: teamNew.id,
        userId: req.user.id,
        isSuperUser: true,
        isAdmin: true,
    });
    logger_1.default.info(`teamNew: ${JSON.stringify(teamNew)}`);
    if (playersArray && Array.isArray(playersArray)) {
        for (let i = 0; i < playersArray.length; i++) {
            const player = playersArray[i];
            await (0, players_1.addNewPlayerToTeam)(teamNew.id, player.firstName, player.lastName || null, player.shirtNumber || null, player.position || null, player.positionAbbreviation || null);
        }
    }
    res.json({ result: true, teamNew: Object.assign(Object.assign({}, teamNew.toJSON()), { playersArray }) });
});
// POST /teams/update-visibility
router.post("/update-visibility", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed POST /teams/update-visibility");
    const { teamId, visibility } = req.body;
    logger_1.default.info(`teamId: ${teamId}`);
    const team = await db_1.Team.findOne({ where: { id: teamId } });
    // logger.info(`team: ${JSON.stringify(team)}`);
    if (!team) {
        return res.status(404).json({ result: false, message: "Team not found" });
    }
    await team.update({ visibility });
    res.json({ result: true, team });
});
// POST /teams/add-player
router.post("/add-player", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed POST /teams/add-player");
    const { teamId, firstName, lastName, shirtNumber, position, positionAbbreviation, } = req.body;
    logger_1.default.info(`teamId: ${teamId}`);
    const playerNew = await (0, players_1.addNewPlayerToTeam)(teamId, firstName, lastName || null, shirtNumber || null, position || null, positionAbbreviation || null);
    res.json({ result: true, playerNew });
});
// DELETE /teams/player
router.delete("/player", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed DELETE /teams/player");
    const { teamId, playerId } = req.body;
    logger_1.default.info(`playerId: ${playerId}`);
    await db_1.ContractTeamPlayer.destroy({ where: { playerId, teamId } });
    res.json({ result: true });
});
// GET /teams/public
router.get("/public", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed GET /teams/public");
    const publicTeamsArray = await db_1.Team.findAll({
        where: { visibility: "Public" },
    });
    logger_1.default.info(`- we have ${publicTeamsArray.length} public teams`);
    res.json({ result: true, publicTeamsArray });
});
exports.default = router;
