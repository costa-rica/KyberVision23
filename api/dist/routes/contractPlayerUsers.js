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
// POST /contract-player-users/link-user-to-player
router.post("/link-user-to-player", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed POST /contract-player-users/link-user-to-player");
    try {
        const { playerId, userId } = req.body;
        // Convert to numbers to ensure type consistency
        const playerIdNumber = Number(playerId);
        const userIdNumber = Number(userId);
        // Check if a contract already exists for this player
        let contractPlayerUserObject = await db_1.ContractPlayerUser.findOne({
            where: { playerId: playerIdNumber },
        });
        // Check if the user is already linked to another player
        let contractPlayerUserObjectUserAlreadyLinked = await db_1.ContractPlayerUser.findOne({
            where: { userId: userIdNumber },
        });
        if (contractPlayerUserObject) {
            // Update existing player contract with new user
            contractPlayerUserObject.userId = userIdNumber;
            await contractPlayerUserObject.save();
        }
        else if (contractPlayerUserObjectUserAlreadyLinked) {
            // Update existing user contract with new player
            contractPlayerUserObjectUserAlreadyLinked.playerId = playerIdNumber;
            await contractPlayerUserObjectUserAlreadyLinked.save();
            contractPlayerUserObject = contractPlayerUserObjectUserAlreadyLinked;
        }
        else {
            // Create new contract linking user to player
            contractPlayerUserObject = await db_1.ContractPlayerUser.create({
                playerId: playerIdNumber,
                userId: userIdNumber,
            });
        }
        res.json({ result: true, contractPlayerUserObject });
    }
    catch (error) {
        logger_1.default.error("❌ Error linking user to player:", error);
        res.status(500).json({
            result: false,
            message: "Error linking user to player",
            error: error.message,
        });
    }
});
// DELETE /contract-player-users/:playerId
router.delete("/:playerId", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed DELETE /contract-player-users/:playerId");
    try {
        const playerId = Number(req.params.playerId);
        logger_1.default.info(`playerId: ${playerId}`);
        await db_1.ContractPlayerUser.destroy({ where: { playerId } });
        res.json({ result: true });
    }
    catch (error) {
        logger_1.default.error("❌ Error deleting contract player user:", error);
        res.status(500).json({
            result: false,
            message: "Error deleting contract player user",
            error: error.message,
        });
    }
});
exports.default = router;
