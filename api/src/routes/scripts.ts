import express, { Request, Response } from "express";
import { Action, Script, ContractUserAction, sequelize } from "@kybervision/db";
import { authenticateToken } from "../modules/userAuthentication";
import { recordPing } from "../modules/common";
import logger from "../modules/logger";

const router = express.Router();

// interface ActionData {
// 	timestamp: string;
// 	favorite?: boolean;
// 	[key: string]: any;
// }
interface ActionData {
  timestamp: string;
  type: string;
  subtype: string | null;
  quality: string;
  playerId: string;
  scriptId: number | null;
  newAction: boolean;
  pointId: string;
  area: number;
  favorite?: boolean;
  scoreTeamAnalyzed: number;
  scoreTeamOther: number;
  setNumber: number;
  [key: string]: any;
}

// POST /scripts/scripting-live-screen/receive-actions-array
router.post(
  "/scripting-live-screen/receive-actions-array",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info(
      "- accessed POST /scripts/scripting-live-screen/receive-actions-array",
    );
    // logger.info("--- something ---");
    // logger.info(JSON.stringify(req.body));

    try {
      const user = req.user;
      let {
        actionsArray,
        sessionId,
        userDeviceTimestamp,
      }: {
        actionsArray: ActionData[];
        sessionId: number;
        userDeviceTimestamp: string;
      } = req.body;

      if (userDeviceTimestamp) {
        // logger.info("🚨 Recording ping");
        const ping = await recordPing({
          userId: user.id,
          serverTimestamp: new Date(),
          endpointName:
            "POST /scripts/scripting-live-screen/receive-actions-array",
          userDeviceTimestamp: new Date(userDeviceTimestamp),
        });
        // logger.info(ping);
      }

      // Validate input data
      if (
        !actionsArray ||
        !Array.isArray(actionsArray) ||
        actionsArray.length === 0
      ) {
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
      const earliestTimestamp = actionsArray.reduce(
        (min: string, action: ActionData) => {
          return action.timestamp < min ? action.timestamp : min;
        },
        actionsArray[0].timestamp,
      );

      // Create a new script
      const script = await Script.create({
        sessionId: Number(sessionId),
        timestampReferenceFirstAction: new Date(earliestTimestamp),
        isScriptingLive: true,
      });

      const scriptId = script.id;

      // Sort by timestamp ascending
      actionsArray = actionsArray.sort((a, b) => {
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });

      for (const elem of actionsArray) {
        await sequelize.transaction(async (t) => {
          const actionObj = {
            ...elem,
            scriptId,
            timestamp: new Date(elem.timestamp),
          };

          const action = await Action.create(actionObj as any, {
            transaction: t,
          });

          if (elem.favorite === true) {
            await ContractUserAction.create(
              {
                actionId: action.id,
                userId: user.id,
                sessionId: Number(sessionId),
              },
              { transaction: t },
            );
          }
        });
      }

      res.json({
        result: true,
        message: `Actions for scriptId: ${scriptId}`,
        scriptId,
        actionsCount: actionsArray.length,
      });
    } catch (error: any) {
      logger.info(error.message);
      logger.error("❌ Error in /receive-actions-array:", error);
      res.status(500).json({
        result: false,
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
);

export default router;
