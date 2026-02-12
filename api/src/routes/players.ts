import express, { Request, Response } from "express";
import {
  Player,
  ContractTeamPlayer,
  Team,
  ContractPlayerUser,
  User,
} from "kybervision23db";
import { authenticateToken } from "../modules/userAuthentication";
import fs from "fs";
import path from "path";

const router = express.Router();

// GET /players/team/:teamId
router.get(
  "/team/:teamId",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("- accessed GET /players/team/:teamId");

    try {
      const teamId = Number(req.params.teamId);

      const playersArray = await Player.findAll({
        include: [
          {
            model: ContractTeamPlayer,
            where: { teamId },
          },
          {
            model: ContractPlayerUser,
            include: [
              {
                model: User,
                attributes: ["id", "username", "email"], // specify fields you want
              },
            ],
          },
        ],
      });

      const team = await Team.findByPk(teamId);

      let playersArrayResponse: any[] = [];
      if (playersArray && playersArray.length > 0) {
        playersArray.forEach((player) => {
          const playerJSON = player.toJSON() as any;
          const contractTeamPlayer = playerJSON.ContractTeamPlayers?.[0];
          const contractPlayerUser = playerJSON.ContractPlayerUser;

          const playerObj = {
            id: playerJSON.id,
            firstName: playerJSON.firstName,
            lastName: playerJSON.lastName,
            birthDate: playerJSON.birthDate,
            shirtNumber: contractTeamPlayer?.shirtNumber,
            position: contractTeamPlayer?.position,
            positionAbbreviation: contractTeamPlayer?.positionAbbreviation,
            role: contractTeamPlayer?.role,
            image: playerJSON.image,
            isUser: contractPlayerUser ? true : false,
            userId: contractPlayerUser?.userId,
            username: contractPlayerUser?.User?.username,
            email: contractPlayerUser?.User?.email,
          };
          playersArrayResponse.push(playerObj);
        });
      } else {
        console.log(`- no players found`);
      }

      // for (let i = 0; i < playersArrayResponse.length; i++) {
      // 	console.log(playersArrayResponse[i].firstName);
      // }

      res.json({ result: true, team, playersArray: playersArrayResponse });
    } catch (error: any) {
      console.error("❌ Error fetching players for team:", error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// GET /players/profile-picture/:filename
router.get(
  "/profile-picture/:filename",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      console.log(
        `get file from: ${process.env.PATH_PROFILE_PICTURES_PLAYER_DIR}/${filename}`,
      );

      if (!process.env.PATH_PROFILE_PICTURES_PLAYER_DIR) {
        return res.status(500).json({
          error: "Profile pictures directory not configured",
        });
      }

      const profilePicturePath = path.join(
        process.env.PATH_PROFILE_PICTURES_PLAYER_DIR,
        filename,
      );

      if (!fs.existsSync(profilePicturePath)) {
        return res.status(404).json({ error: "Profile picture not found" });
      }

      return res.sendFile(path.resolve(profilePicturePath));
    } catch (error: any) {
      console.error("❌ Error serving profile picture:", error);
      res.status(500).json({
        error: "Error serving profile picture",
        details: error.message,
      });
    }
  },
);

export default router;
