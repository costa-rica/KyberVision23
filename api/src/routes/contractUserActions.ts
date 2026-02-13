import express, { Request, Response } from "express";
import { ContractUserAction } from "@kybervision/db";
import { authenticateToken } from "../modules/userAuthentication";
import logger from "../modules/logger";

const router = express.Router();

interface ActionFavoriteData {
  actionsDbTableId: number;
  isFavorite: boolean;
}

interface ActionFavoriteStatus {
  actionId: number;
  sessionId: number;
  favorite: boolean;
  userId: number;
}

// POST /contract-user-actions/update-user-favorites
router.post(
  "/update-user-favorites",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info("- in POST /contract-user-actions/update-user-favorites");
    try {
      const {
        sessionId,
        actionsArray,
      }: { sessionId: number; actionsArray: ActionFavoriteData[] } = req.body;

      // Step 1: Make array of actionIds and favorite status from actionsArray and sessionId
      const actionIdsAndFavoriteStatusArray: ActionFavoriteStatus[] =
        actionsArray.map((action) => {
          return {
            actionId: action.actionsDbTableId,
            sessionId: Number(sessionId),
            favorite: action.isFavorite,
            userId: req.user.id,
          };
        });

      // Step 2: create array of existing contractUserActions of user and session
      const existingContractUserActionsArray = await ContractUserAction.findAll(
        {
          where: {
            sessionId: Number(sessionId),
            userId: req.user.id,
          },
        },
      );

      // Step 3: compare actionIdsAndFavoriteStatusArray with existingContractUserActionsArray
      // -- > if actionId does not exist in existingContractUserActionsArray, create new contractUserAction
      for (let i = 0; i < actionIdsAndFavoriteStatusArray.length; i++) {
        const action = actionIdsAndFavoriteStatusArray[i];
        const existingContractUserAction =
          existingContractUserActionsArray.find(
            (contractUserAction) =>
              contractUserAction.actionId === action.actionId,
          );
        if (!existingContractUserAction && action.favorite) {
          await ContractUserAction.create({
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
        const action = actionIdsAndFavoriteStatusArray.find(
          (action) => action.actionId === contractUserAction.actionId,
        );
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
    } catch (error: any) {
      logger.error("❌ Error updating user favorites:", error);
      res.status(500).json({
        result: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  },
);

export default router;
