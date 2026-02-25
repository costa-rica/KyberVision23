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
// POST /contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script
router.post("/scripting-sync-video-screen/update-delta-time-all-actions-in-script", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in POST /scripting-sync-video-screen/update-delta-time-all-actions-in-script`);
    try {
        const { newDeltaTimeInSeconds, scriptId, videoId } = req.body;
        logger_1.default.info(`newDeltaTimeInSeconds: ${newDeltaTimeInSeconds}`);
        logger_1.default.info(`scriptId: ${scriptId}, videoId: ${videoId}`);
        // Convert parameters to ensure proper types
        const scriptIdNumber = Number(scriptId);
        const videoIdNumber = Number(videoId);
        const deltaTimeNumber = Number(newDeltaTimeInSeconds);
        const actionsArray = await db_1.Action.findAll({
            where: { scriptId: scriptIdNumber },
            order: [["timestamp", "ASC"]],
            include: [db_1.ContractVideoAction],
        });
        logger_1.default.info(`Found ${actionsArray.length} actions for scriptId ${scriptIdNumber}`);
        if (!actionsArray || actionsArray.length === 0) {
            logger_1.default.info(`❌ 404: No actions found for scriptId ${scriptIdNumber}`);
            return res.status(404).json({
                result: false,
                message: `Actions not found`,
                scriptId: scriptIdNumber,
            });
        }
        const actionIds = actionsArray.map((action) => action.id);
        logger_1.default.info(`Action IDs: [${actionIds.join(", ")}]`);
        // Get array of ContractVideoActions where actionId is in actionsArray
        const contractVideoActionsArray = await db_1.ContractVideoAction.findAll({
            where: {
                actionId: actionIds,
                videoId: videoIdNumber,
            },
        });
        logger_1.default.info(`Found ${contractVideoActionsArray.length} ContractVideoActions for videoId ${videoIdNumber}`);
        if (contractVideoActionsArray.length === 0) {
            logger_1.default.info(`❌ 404: No ContractVideoActions found for videoId ${videoIdNumber} with actionIds [${actionIds.join(", ")}]`);
            return res.status(404).json({
                result: false,
                message: `ContractVideoActions not found for video ${videoIdNumber}`,
                scriptId: scriptIdNumber,
                videoId: videoIdNumber,
            });
        }
        // Modify contractVideoActionsArray.deltaTimeInSeconds
        for (let i = 0; i < contractVideoActionsArray.length; i++) {
            contractVideoActionsArray[i].deltaTimeInSeconds = deltaTimeNumber;
            await contractVideoActionsArray[i].save();
        }
        logger_1.default.info(`✅ Successfully updated ${contractVideoActionsArray.length} ContractVideoActions with deltaTime ${deltaTimeNumber}`);
        res.json({
            result: true,
            message: `ContractVideoAction modified with success`,
            scriptId: scriptIdNumber,
            updatedCount: contractVideoActionsArray.length,
        });
    }
    catch (error) {
        logger_1.default.error("❌ Error updating contract video actions:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
exports.default = router;
