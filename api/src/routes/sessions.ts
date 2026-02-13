import express, { Request, Response } from "express";
import {
  Action,
  Script,
  ContractVideoAction,
  Session,
  ContractLeagueTeam,
  ContractUserAction,
} from "@kybervision/db";
import { authenticateToken } from "../modules/userAuthentication";
import { createEstimatedTimestampStartOfVideo } from "../modules/contractVideoAction";
import {
  createUniquePlayerNamesArray,
  createUniquePlayerObjArray,
} from "../modules/players";
import logger from "../modules/logger";

const router = express.Router();

// POST /sessions/review-selection-screen/get-actions
router.post(
  "/review-selection-screen/get-actions",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info(`- in POST /sessions/review-selection-screen/get-actions`);

    try {
      const { sessionId, videoId } = req.body;

      // Step 1: Find all Scripts linked to this sessionId
      const scriptsArray = await Script.findAll({
        where: { sessionId },
      });

      // Step 2: Find all Actions linked to this sessionId and this videoId
      // -- > for each script make an array of actions with the correct timestampFromStartOfVideo
      let actionsArrayByScript: any[] = [];
      for (let i = 0; i < scriptsArray.length; i++) {
        const actionsArray = await Action.findAll({
          where: { scriptId: scriptsArray[i].id },
          order: [["timestamp", "ASC"]],
          include: [ContractVideoAction],
        });

        // 👇 Make map callback async and wrap in Promise.all --> needed for favorite
        const modifiedActionsArray = await Promise.all(
          actionsArray.map(async (action, index) => {
            const actionJSON = action.toJSON() as any;
            const {
              ContractVideoActions,
              ...actionWithoutContractVideoActions
            } = actionJSON;

            const contractVideoActionOfThisVideo = ContractVideoActions?.find(
              (contractVideoAction: any) =>
                contractVideoAction.videoId === Number(videoId),
            );

            const actionTimestamp = new Date(
              actionWithoutContractVideoActions.timestamp,
            ).getTime();
            const referenceTimestamp = new Date(
              scriptsArray[i].timestampReferenceFirstAction || 0,
            ).getTime();
            const differenceInTimeActionMinusTimestampReferenceFirstAction =
              (actionTimestamp - referenceTimestamp) / 1000;

            // 🔹 now we can await here
            const contractUserActionObj = await ContractUserAction.findOne({
              where: {
                actionId: actionWithoutContractVideoActions.id,
                userId: req.user.id,
              },
            });

            const favorite = contractUserActionObj ? true : false;

            return {
              ...actionWithoutContractVideoActions,
              timestampReferenceFirstAction:
                scriptsArray[i].timestampReferenceFirstAction,
              timeDeltaInSeconds:
                contractVideoActionOfThisVideo?.deltaTimeInSeconds || 0,
              timestampFromStartOfVideo:
                differenceInTimeActionMinusTimestampReferenceFirstAction +
                (contractVideoActionOfThisVideo?.deltaTimeInSeconds || 0),
              favorite,
            };
          }),
        );

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
      actionsArrayMerged.sort(
        (a, b) => a.timestampFromStartOfVideo - b.timestampFromStartOfVideo,
      );

      // Step 5: Add the reviewVideoActionsArrayIndex for each action
      actionsArrayMerged.forEach((action, index) => {
        action.reviewVideoActionsArrayIndex = index + 1;
      });

      // Step 6: Get unique player objects
      const uniqueListOfPlayerObjArray =
        await createUniquePlayerObjArray(actionsArrayMerged);

      res.json({
        result: true,
        sessionId,
        videoId,
        actionsArray: actionsArrayMerged,
        playerDbObjectsArray: uniqueListOfPlayerObjArray,
      });
    } catch (error: any) {
      logger.error("❌ Error fetching scripts for sessionId:", error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// GET /sessions/:teamId
router.get(
  "/:teamId",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info(`- in GET /sessions/${req.params.teamId}`);

    try {
      const { teamId } = req.params;
      logger.info(`teamId: ${teamId}`);

      // 🔹 Find all Sessions linked to this teamId
      const sessionsArray = await Session.findAll({
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

        return {
          ...session.toJSON(),
          sessionDateString: `${day} ${month} ${hour}h${minute}`, // "15 mar 20h00"
          sessionDate: date,
        };
      });
      // ---- [end] KEEP THIS ------

      res.json({ result: true, sessionsArray: formattedSessionsArray });
    } catch (error: any) {
      logger.error("❌ Error fetching sessions for teamId:", error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// POST /sessions/create
router.post(
  "/create",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info(`- in POST /sessions/create`);

    try {
      const {
        teamId,
        sessionDate,
        contractLeagueTeamId,
        sessionName,
        sessionCity,
      } = req.body;
      const city = "Practice";
      logger.info(`teamId: ${teamId}`);
      logger.info(`sessionDate: ${sessionDate}`);
      logger.info(`city: ${city}`);

      // find contractLeagueTeam For now use default League
      const contractLeagueTeam = await ContractLeagueTeam.findOne({
        where: { id: 1 },
      });

      if (!contractLeagueTeam) {
        return res.status(404).json({
          result: false,
          message: "Default league contract not found",
        });
      }

      // 🔹 Create new Session
      const sessionNew = await Session.create({
        teamId,
        sessionDate,
        city: sessionCity,
        contractLeagueTeamId: contractLeagueTeam.id,
        sessionName,
      });

      logger.info(`sessionNew: ${JSON.stringify(sessionNew)}`);

      // Format sessionDateString for sessionNew
      const sessionDate_obj = new Date(sessionNew.sessionDate);
      const formattedSessionNew = {
        ...sessionNew.toJSON(),
        sessionDateString: `${sessionDate_obj
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
          .padStart(2, "0")}`, // "15 mar 20h00"
      };

      logger.info(
        `formattedSessionNew: ${JSON.stringify(formattedSessionNew)}`,
      );

      res.json({ result: true, sessionNew: formattedSessionNew });
    } catch (error: any) {
      logger.error("❌ Error creating session:", error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// This is used for the mobile ScriptingSyncVideo Screen (after the user has selected a video)
// GET /sessions/scripting-sync-video/:sessionId/actions
router.get(
  "/scripting-sync-video/:sessionId/actions",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info(
      `- in GET sessions/scripting-sync-video/${req.params.sessionId}/actions`,
    );
    try {
      const { sessionId } = req.params;

      // 🔹 Find all Scripts linked to this sessionId
      const scriptsArray = await Script.findAll({
        where: { sessionId },
        attributes: ["id"], // Only need script IDs
      });

      const actionsArray = await Action.findAll({
        where: { scriptId: scriptsArray.map((script) => script.id) },
      });

      if (actionsArray.length === 0) {
        return res.status(404).json({
          result: false,
          message: "No actions found for this session.",
        });
      }

      res.json({ result: true, actionsArray });
    } catch (error: any) {
      logger.error("❌ Error fetching actions for session:", error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// GET /sessions/scripting-sync-video-screen/get-actions-for-syncing/:sessionId
// This is used for the ScriptingSyncVideo Screen
router.get(
  "/scripting-sync-video-screen/get-actions-for-syncing/:sessionId",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info("in GET get-actions-for-syncing");
    try {
      const { sessionId } = req.params;

      // Step 1: Find all Scripts linked to this sessionId
      const scriptsArray = await Script.findAll({
        where: { sessionId },
      });

      // Step 2: Find all Actions linked to this sessionId
      // -- > this an array of arrays
      // -- > modify so each action has the scriptFirstActionTimestamp and deltaTimeInSeconds
      let actionsArrayByScript: any[] = [];
      for (let i = 0; i < scriptsArray.length; i++) {
        const actionsArray = await Action.findAll({
          where: { scriptId: scriptsArray[i].id },
          include: [ContractVideoAction],
        });
        let deltaTimeInSeconds = 0;
        let deltaTimeInSecondsIsSameForAllActions = true;

        const actionsArrayModified = actionsArray.map((action, index) => {
          const actionJSON = action.toJSON() as any;
          const { ContractVideoActions, ...actionWithoutContractVideoActions } =
            actionJSON;

          const contractVideoAction = ContractVideoActions?.[0];
          const deltaTime = contractVideoAction?.deltaTimeInSeconds || 0;

          const actionTimestamp = new Date(action.timestamp).getTime();
          const referenceTimestamp = new Date(
            scriptsArray[i].timestampReferenceFirstAction || 0,
          ).getTime();
          const videoTimestampCalculation =
            (actionTimestamp - referenceTimestamp + deltaTime * 1000) / 1000;

          if (index === 0) {
            deltaTimeInSeconds = deltaTime;
          } else {
            if (deltaTime !== deltaTimeInSeconds) {
              deltaTimeInSecondsIsSameForAllActions = false;
            }
          }

          return {
            ...actionWithoutContractVideoActions,
            scriptFirstActionTimestamp:
              scriptsArray[i].timestampReferenceFirstAction,
            deltaTimeInSeconds: deltaTime,
            videoTimestampCalculation,
          };
        });

        actionsArrayByScript.push({
          scriptId: scriptsArray[i].id,
          actionsArray: actionsArrayModified,
          deltaTimeInSecondsIsSameForAllActions,
          deltaTimeInSeconds,
        });
      }

      res.json({ result: true, sessionId, actionsArrayByScript });
    } catch (error: any) {
      logger.error("❌ Error fetching actions for session:", error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

export default router;
