"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("@kybervision/db");
const userAuthentication_1 = require("../modules/userAuthentication");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../modules/logger"));
const router = express_1.default.Router();
// GET /players/team/:teamId
router.get("/team/:teamId", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed GET /players/team/:teamId");
    try {
        const teamId = Number(req.params.teamId);
        const playersArray = await db_1.Player.findAll({
            include: [
                {
                    model: db_1.ContractTeamPlayer,
                    where: { teamId },
                },
                {
                    model: db_1.ContractPlayerUser,
                    include: [
                        {
                            model: db_1.User,
                            attributes: ["id", "username", "email"], // specify fields you want
                        },
                    ],
                },
            ],
        });
        const team = await db_1.Team.findByPk(teamId);
        let playersArrayResponse = [];
        if (playersArray && playersArray.length > 0) {
            playersArray.forEach((player) => {
                var _a, _b, _c;
                const playerJSON = player.toJSON();
                const contractTeamPlayer = (_a = playerJSON.ContractTeamPlayers) === null || _a === void 0 ? void 0 : _a[0];
                const contractPlayerUser = playerJSON.ContractPlayerUser;
                const playerObj = {
                    id: playerJSON.id,
                    firstName: playerJSON.firstName,
                    lastName: playerJSON.lastName,
                    birthDate: playerJSON.birthDate,
                    shirtNumber: contractTeamPlayer === null || contractTeamPlayer === void 0 ? void 0 : contractTeamPlayer.shirtNumber,
                    position: contractTeamPlayer === null || contractTeamPlayer === void 0 ? void 0 : contractTeamPlayer.position,
                    positionAbbreviation: contractTeamPlayer === null || contractTeamPlayer === void 0 ? void 0 : contractTeamPlayer.positionAbbreviation,
                    role: contractTeamPlayer === null || contractTeamPlayer === void 0 ? void 0 : contractTeamPlayer.role,
                    image: playerJSON.image,
                    isUser: contractPlayerUser ? true : false,
                    userId: contractPlayerUser === null || contractPlayerUser === void 0 ? void 0 : contractPlayerUser.userId,
                    username: (_b = contractPlayerUser === null || contractPlayerUser === void 0 ? void 0 : contractPlayerUser.User) === null || _b === void 0 ? void 0 : _b.username,
                    email: (_c = contractPlayerUser === null || contractPlayerUser === void 0 ? void 0 : contractPlayerUser.User) === null || _c === void 0 ? void 0 : _c.email,
                };
                playersArrayResponse.push(playerObj);
            });
        }
        else {
            logger_1.default.info(`- no players found`);
        }
        // for (let i = 0; i < playersArrayResponse.length; i++) {
        // 	logger.info(playersArrayResponse[i].firstName);
        // }
        res.json({ result: true, team, playersArray: playersArrayResponse });
    }
    catch (error) {
        logger_1.default.error("❌ Error fetching players for team:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// GET /players/profile-picture/:filename
router.get("/profile-picture/:filename", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const filename = req.params.filename;
        logger_1.default.info(`get file from: ${process.env.PATH_PROFILE_PICTURES_PLAYER_DIR}/${filename}`);
        if (!process.env.PATH_PROFILE_PICTURES_PLAYER_DIR) {
            return res.status(500).json({
                error: "Profile pictures directory not configured",
            });
        }
        const profilePicturePath = path_1.default.join(process.env.PATH_PROFILE_PICTURES_PLAYER_DIR, filename);
        if (!fs_1.default.existsSync(profilePicturePath)) {
            return res.status(404).json({ error: "Profile picture not found" });
        }
        return res.sendFile(path_1.default.resolve(profilePicturePath));
    }
    catch (error) {
        logger_1.default.error("❌ Error serving profile picture:", error);
        res.status(500).json({
            error: "Error serving profile picture",
            details: error.message,
        });
    }
});
exports.default = router;
