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
// POST /contract-user-actions/update-user-favorites
router.post("/update-user-favorites", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- in POST /contract-user-actions/update-user-favorites");
    try {
        const { sessionId, actionsArray, } = req.body;
        // Step 1: Make array of actionIds and favorite status from actionsArray and sessionId
        const actionIdsAndFavoriteStatusArray = actionsArray.map((action) => {
            return {
                actionId: action.actionsDbTableId,
                sessionId: Number(sessionId),
                favorite: action.isFavorite,
                userId: req.user.id,
            };
        });
        // Step 2: create array of existing contractUserActions of user and session
        const existingContractUserActionsArray = await db_1.ContractUserAction.findAll({
            where: {
                sessionId: Number(sessionId),
                userId: req.user.id,
            },
        });
        // Step 3: compare actionIdsAndFavoriteStatusArray with existingContractUserActionsArray
        // -- > if actionId does not exist in existingContractUserActionsArray, create new contractUserAction
        for (let i = 0; i < actionIdsAndFavoriteStatusArray.length; i++) {
            const action = actionIdsAndFavoriteStatusArray[i];
            const existingContractUserAction = existingContractUserActionsArray.find((contractUserAction) => contractUserAction.actionId === action.actionId);
            if (!existingContractUserAction && action.favorite) {
                await db_1.ContractUserAction.create({
                    actionId: action.actionId,
                    userId: action.userId,
                    sessionId: action.sessionId,
                });
            }
        }
        // Step 4: delete contractUserActions that are in existingContractUserActionsArray but not in actionIdsAndFavoriteStatusArray
        for (let i = 0; i < existingContractUserActionsArray.length; i++) {
            const contractUserAction = existingContractUserActionsArray[i];
            // logger.info(`exiting - actionId: ${contractUserAction.actionId}`);
            const action = actionIdsAndFavoriteStatusArray.find((action) => action.actionId === contractUserAction.actionId);
            // logger.info(`action: ${JSON.stringify(action, null, 2)}`);
            if (action && action.favorite === false) {
                await contractUserAction.destroy();
            }
        }
        // logger.info(`scriptsArray: ${JSON.stringify(scriptsArray, null, 2)}`);
        res.json({
            result: true,
            message: "User favorites updated successfully",
        });
    }
    catch (error) {
        logger_1.default.error("❌ Error updating user favorites:", error);
        res.status(500).json({
            result: false,
            error: "Internal server error",
            details: error.message,
        });
    }
});
exports.default = router;
