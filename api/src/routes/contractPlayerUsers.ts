import express, { Request, Response } from "express";
import { ContractPlayerUser } from "kybervision23db";
import { authenticateToken } from "../modules/userAuthentication";

const router = express.Router();

// POST /contract-player-users/link-user-to-player
router.post(
  "/link-user-to-player",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("- accessed POST /contract-player-users/link-user-to-player");

    try {
      const { playerId, userId } = req.body;

      // Convert to numbers to ensure type consistency
      const playerIdNumber = Number(playerId);
      const userIdNumber = Number(userId);

      // Check if a contract already exists for this player
      let contractPlayerUserObject = await ContractPlayerUser.findOne({
        where: { playerId: playerIdNumber },
      });

      // Check if the user is already linked to another player
      let contractPlayerUserObjectUserAlreadyLinked =
        await ContractPlayerUser.findOne({
          where: { userId: userIdNumber },
        });

      if (contractPlayerUserObject) {
        // Update existing player contract with new user
        contractPlayerUserObject.userId = userIdNumber;
        await contractPlayerUserObject.save();
      } else if (contractPlayerUserObjectUserAlreadyLinked) {
        // Update existing user contract with new player
        contractPlayerUserObjectUserAlreadyLinked.playerId = playerIdNumber;
        await contractPlayerUserObjectUserAlreadyLinked.save();
        contractPlayerUserObject = contractPlayerUserObjectUserAlreadyLinked;
      } else {
        // Create new contract linking user to player
        contractPlayerUserObject = await ContractPlayerUser.create({
          playerId: playerIdNumber,
          userId: userIdNumber,
        });
      }

      res.json({ result: true, contractPlayerUserObject });
    } catch (error: any) {
      console.error("❌ Error linking user to player:", error);
      res.status(500).json({
        result: false,
        message: "Error linking user to player",
        error: error.message,
      });
    }
  },
);

// DELETE /contract-player-users/:playerId
router.delete(
  "/:playerId",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("- accessed DELETE /contract-player-users/:playerId");

    try {
      const playerId = Number(req.params.playerId);
      console.log(`playerId: ${playerId}`);

      await ContractPlayerUser.destroy({ where: { playerId } });

      res.json({ result: true });
    } catch (error: any) {
      console.error("❌ Error deleting contract player user:", error);
      res.status(500).json({
        result: false,
        message: "Error deleting contract player user",
        error: error.message,
      });
    }
  },
);

export default router;
