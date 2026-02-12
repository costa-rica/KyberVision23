import express, { Request, Response } from "express";
import { League, ContractLeagueTeam } from "kybervision23db";
import { authenticateToken } from "../modules/userAuthentication";

const router = express.Router();

interface LeagueData {
  id: number;
  name: string;
  contractLeagueTeamId: number;
}

// GET /leagues/team/:teamId
router.get(
  "/team/:teamId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.params.teamId);

      const contractLeagueTeamsArray = await ContractLeagueTeam.findAll({
        where: {
          teamId,
        },
      });

      const leaguesArray: LeagueData[] = await Promise.all(
        contractLeagueTeamsArray.map(async (contractLeagueTeam) => {
          const league = await League.findByPk(contractLeagueTeam.leagueId);

          if (!league) {
            throw new Error(
              `League not found for leagueId: ${contractLeagueTeam.leagueId}`,
            );
          }

          return {
            id: league.id,
            name: league.name,
            contractLeagueTeamId: contractLeagueTeam.id,
          };
        }),
      );

      // Sort leagues by leagueId
      leaguesArray.sort((a, b) => a.id - b.id);

      res.status(200).json({ leaguesArray });
    } catch (error: any) {
      console.error("❌ Error retrieving leagues:", error);
      res.status(500).json({
        error: "Error retrieving leagues",
        details: error.message,
      });
    }
  },
);

export default router;
