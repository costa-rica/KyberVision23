"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("@kybervision/db");
const userAuthentication_1 = require("../modules/userAuthentication");
const common_1 = require("../modules/common");
const logger_1 = __importDefault(require("../modules/logger"));
const router = express_1.default.Router();
// POST /scripts/scripting-live-screen/receive-actions-array
router.post("/scripting-live-screen/receive-actions-array", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed POST /scripts/scripting-live-screen/receive-actions-array");
    // logger.info("--- something ---");
    // logger.info(JSON.stringify(req.body));
    try {
        const user = req.user;
        let { actionsArray, sessionId, userDeviceTimestamp, } = req.body;
        if (userDeviceTimestamp) {
            // logger.info("🚨 Recording ping");
            const ping = await (0, common_1.recordPing)({
                userId: user.id,
                serverTimestamp: new Date(),
                endpointName: "POST /scripts/scripting-live-screen/receive-actions-array",
                userDeviceTimestamp: new Date(userDeviceTimestamp),
            });
            // logger.info(ping);
        }
        // Validate input data
        if (!actionsArray ||
            !Array.isArray(actionsArray) ||
            actionsArray.length === 0) {
            return res.status(400).json({
                result: false,
                error: "Invalid or empty actionsArray",
            });
        }
        if (!sessionId) {
            return res.status(400).json({
                result: false,
                error: "sessionId is required",
            });
        }
        // Search actionsArray for earliest timestamp
        const earliestTimestamp = actionsArray.reduce((min, action) => {
            return action.timestamp < min ? action.timestamp : min;
        }, actionsArray[0].timestamp);
        // Create a new script
        const script = await db_1.Script.create({
            sessionId: Number(sessionId),
            timestampReferenceFirstAction: new Date(earliestTimestamp),
            isScriptingLive: true,
        });
        const scriptId = script.id;
        // Sort by timestamp ascending
        actionsArray = actionsArray.sort((a, b) => {
            return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        });
        for (const elem of actionsArray) {
            await db_1.sequelize.transaction(async (t) => {
                const actionObj = Object.assign(Object.assign({}, elem), { scriptId, timestamp: new Date(elem.timestamp) });
                const action = await db_1.Action.create(actionObj, {
                    transaction: t,
                });
                if (elem.favorite === true) {
                    await db_1.ContractUserAction.create({
                        actionId: action.id,
                        userId: user.id,
                        sessionId: Number(sessionId),
                    }, { transaction: t });
                }
            });
        }
        res.json({
            result: true,
            message: `Actions for scriptId: ${scriptId}`,
            scriptId,
            actionsCount: actionsArray.length,
        });
    }
    catch (error) {
        logger_1.default.info(error.message);
        logger_1.default.error("❌ Error in /receive-actions-array:", error);
        res.status(500).json({
            result: false,
            error: "Internal Server Error",
            details: error.message,
        });
    }
});
exports.default = router;
