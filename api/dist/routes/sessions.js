"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
// POST /sessions/review-selection-screen/get-actions
router.post("/review-selection-screen/get-actions", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in POST /sessions/review-selection-screen/get-actions`);
    try {
        const { sessionId, videoId } = req.body;
        // Step 1: Find all Scripts linked to this sessionId
        const scriptsArray = await db_1.Script.findAll({
            where: { sessionId },
        });
        // Step 2: Find all Actions linked to this sessionId and this videoId
        // -- > for each script make an array of actions with the correct timestampFromStartOfVideo
        let actionsArrayByScript = [];
        for (let i = 0; i < scriptsArray.length; i++) {
            const actionsArray = await db_1.Action.findAll({
                where: { scriptId: scriptsArray[i].id },
                order: [["timestamp", "ASC"]],
                include: [db_1.ContractVideoAction],
            });
            // 👇 Make map callback async and wrap in Promise.all --> needed for favorite
            const modifiedActionsArray = await Promise.all(actionsArray.map(async (action, index) => {
                const actionJSON = action.toJSON();
                const { ContractVideoActions } = actionJSON, actionWithoutContractVideoActions = __rest(actionJSON, ["ContractVideoActions"]);
                const contractVideoActionOfThisVideo = ContractVideoActions === null || ContractVideoActions === void 0 ? void 0 : ContractVideoActions.find((contractVideoAction) => contractVideoAction.videoId === Number(videoId));
                const actionTimestamp = new Date(actionWithoutContractVideoActions.timestamp).getTime();
                const referenceTimestamp = new Date(scriptsArray[i].timestampReferenceFirstAction || 0).getTime();
                const differenceInTimeActionMinusTimestampReferenceFirstAction = (actionTimestamp - referenceTimestamp) / 1000;
                // 🔹 now we can await here
                const contractUserActionObj = await db_1.ContractUserAction.findOne({
                    where: {
                        actionId: actionWithoutContractVideoActions.id,
                        userId: req.user.id,
                    },
                });
                const favorite = contractUserActionObj ? true : false;
                return Object.assign(Object.assign({}, actionWithoutContractVideoActions), { timestampReferenceFirstAction: scriptsArray[i].timestampReferenceFirstAction, timeDeltaInSeconds: (contractVideoActionOfThisVideo === null || contractVideoActionOfThisVideo === void 0 ? void 0 : contractVideoActionOfThisVideo.deltaTimeInSeconds) || 0, timestampFromStartOfVideo: differenceInTimeActionMinusTimestampReferenceFirstAction +
                        ((contractVideoActionOfThisVideo === null || contractVideoActionOfThisVideo === void 0 ? void 0 : contractVideoActionOfThisVideo.deltaTimeInSeconds) || 0), favorite });
            }));
            actionsArrayByScript.push({
                scriptId: scriptsArray[i].id,
                actionsArray: modifiedActionsArray,
            });
        }
        // Step 3: Merge all The actionsArrayByScript into one array
        const actionsArrayMerged = actionsArrayByScript
            .map((script) => script.actionsArray)
            .flat();
        // Step 4: Sort by timestampFromStartOfVideo
        actionsArrayMerged.sort((a, b) => a.timestampFromStartOfVideo - b.timestampFromStartOfVideo);
        // Step 5: Add the reviewVideoActionsArrayIndex for each action
        actionsArrayMerged.forEach((action, index) => {
            action.reviewVideoActionsArrayIndex = index + 1;
        });
        // Step 6: Get unique player objects
        const uniqueListOfPlayerObjArray = await (0, players_1.createUniquePlayerObjArray)(actionsArrayMerged);
        res.json({
            result: true,
            sessionId,
            videoId,
            actionsArray: actionsArrayMerged,
            playerDbObjectsArray: uniqueListOfPlayerObjArray,
        });
    }
    catch (error) {
        logger_1.default.error("❌ Error fetching scripts for sessionId:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// GET /sessions/:teamId
router.get("/:teamId", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in GET /sessions/${req.params.teamId}`);
    try {
        const { teamId } = req.params;
        logger_1.default.info(`teamId: ${teamId}`);
        // 🔹 Find all Sessions linked to this teamId
        const sessionsArray = await db_1.Session.findAll({
            where: { teamId },
        });
        if (sessionsArray.length === 0) {
            return res.json({ result: true, sessionsArray: [] });
        }
        // ---- KEEP THIS ------
        // Format sessionDateString for each session
        const formattedSessionsArray = sessionsArray.map((session) => {
            const date = new Date(session.sessionDate);
            const day = date.getDate().toString().padStart(2, "0"); // "15"
            const month = date.toLocaleString("fr-FR", { month: "short" }); // "mar"
            const hour = date.getHours().toString().padStart(2, "0"); // "20"
            const minute = date.getMinutes().toString().padStart(2, "0"); // "00"
            return Object.assign(Object.assign({}, session.toJSON()), { sessionDateString: `${day} ${month} ${hour}h${minute}`, sessionDate: date });
        });
        // ---- [end] KEEP THIS ------
        res.json({ result: true, sessionsArray: formattedSessionsArray });
    }
    catch (error) {
        logger_1.default.error("❌ Error fetching sessions for teamId:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// POST /sessions/create
router.post("/create", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in POST /sessions/create`);
    try {
        const { teamId, sessionDate, contractLeagueTeamId, sessionName, sessionCity, } = req.body;
        const city = "Practice";
        logger_1.default.info(`teamId: ${teamId}`);
        logger_1.default.info(`sessionDate: ${sessionDate}`);
        logger_1.default.info(`city: ${city}`);
        // find contractLeagueTeam For now use default League
        const contractLeagueTeam = await db_1.ContractLeagueTeam.findOne({
            where: { id: 1 },
        });
        if (!contractLeagueTeam) {
            return res.status(404).json({
                result: false,
                message: "Default league contract not found",
            });
        }
        // 🔹 Create new Session
        const sessionNew = await db_1.Session.create({
            teamId,
            sessionDate,
            city: sessionCity,
            contractLeagueTeamId: contractLeagueTeam.id,
            sessionName,
        });
        logger_1.default.info(`sessionNew: ${JSON.stringify(sessionNew)}`);
        // Format sessionDateString for sessionNew
        const sessionDate_obj = new Date(sessionNew.sessionDate);
        const formattedSessionNew = Object.assign(Object.assign({}, sessionNew.toJSON()), { sessionDateString: `${sessionDate_obj
                .getDate()
                .toString()
                .padStart(2, "0")} ${sessionDate_obj.toLocaleString("fr-FR", {
                month: "short",
            })} ${sessionDate_obj
                .getHours()
                .toString()
                .padStart(2, "0")}h${sessionDate_obj
                .getMinutes()
                .toString()
                .padStart(2, "0")}` });
        logger_1.default.info(`formattedSessionNew: ${JSON.stringify(formattedSessionNew)}`);
        res.json({ result: true, sessionNew: formattedSessionNew });
    }
    catch (error) {
        logger_1.default.error("❌ Error creating session:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// This is used for the mobile ScriptingSyncVideo Screen (after the user has selected a video)
// GET /sessions/scripting-sync-video/:sessionId/actions
router.get("/scripting-sync-video/:sessionId/actions", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in GET sessions/scripting-sync-video/${req.params.sessionId}/actions`);
    try {
        const { sessionId } = req.params;
        // 🔹 Find all Scripts linked to this sessionId
        const scriptsArray = await db_1.Script.findAll({
            where: { sessionId },
            attributes: ["id"], // Only need script IDs
        });
        const actionsArray = await db_1.Action.findAll({
            where: { scriptId: scriptsArray.map((script) => script.id) },
        });
        if (actionsArray.length === 0) {
            return res.status(404).json({
                result: false,
                message: "No actions found for this session.",
            });
        }
        res.json({ result: true, actionsArray });
    }
    catch (error) {
        logger_1.default.error("❌ Error fetching actions for session:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// GET /sessions/scripting-sync-video-screen/get-actions-for-syncing/:sessionId
// This is used for the ScriptingSyncVideo Screen
router.get("/scripting-sync-video-screen/get-actions-for-syncing/:sessionId", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("in GET get-actions-for-syncing");
    try {
        const { sessionId } = req.params;
        // Step 1: Find all Scripts linked to this sessionId
        const scriptsArray = await db_1.Script.findAll({
            where: { sessionId },
        });
        // Step 2: Find all Actions linked to this sessionId
        // -- > this an array of arrays
        // -- > modify so each action has the scriptFirstActionTimestamp and deltaTimeInSeconds
        let actionsArrayByScript = [];
        for (let i = 0; i < scriptsArray.length; i++) {
            const actionsArray = await db_1.Action.findAll({
                where: { scriptId: scriptsArray[i].id },
                include: [db_1.ContractVideoAction],
            });
            let deltaTimeInSeconds = 0;
            let deltaTimeInSecondsIsSameForAllActions = true;
            const actionsArrayModified = actionsArray.map((action, index) => {
                const actionJSON = action.toJSON();
                const { ContractVideoActions } = actionJSON, actionWithoutContractVideoActions = __rest(actionJSON, ["ContractVideoActions"]);
                const contractVideoAction = ContractVideoActions === null || ContractVideoActions === void 0 ? void 0 : ContractVideoActions[0];
                const deltaTime = (contractVideoAction === null || contractVideoAction === void 0 ? void 0 : contractVideoAction.deltaTimeInSeconds) || 0;
                const actionTimestamp = new Date(action.timestamp).getTime();
                const referenceTimestamp = new Date(scriptsArray[i].timestampReferenceFirstAction || 0).getTime();
                const videoTimestampCalculation = (actionTimestamp - referenceTimestamp + deltaTime * 1000) / 1000;
                if (index === 0) {
                    deltaTimeInSeconds = deltaTime;
                }
                else {
                    if (deltaTime !== deltaTimeInSeconds) {
                        deltaTimeInSecondsIsSameForAllActions = false;
                    }
                }
                return Object.assign(Object.assign({}, actionWithoutContractVideoActions), { scriptFirstActionTimestamp: scriptsArray[i].timestampReferenceFirstAction, deltaTimeInSeconds: deltaTime, videoTimestampCalculation });
            });
            actionsArrayByScript.push({
                scriptId: scriptsArray[i].id,
                actionsArray: actionsArrayModified,
                deltaTimeInSecondsIsSameForAllActions,
                deltaTimeInSeconds,
            });
        }
        res.json({ result: true, sessionId, actionsArrayByScript });
    }
    catch (error) {
        logger_1.default.error("❌ Error fetching actions for session:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
exports.default = router;
