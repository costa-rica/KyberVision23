import express, { Request, Response } from "express";
import {
  Team,
  ContractTeamUser,
  ContractLeagueTeam,
  League,
  ContractTeamPlayer,
  ContractPlayerUser,
} from "@kybervision/db";
import { authenticateToken } from "../modules/userAuthentication";
import { addNewPlayerToTeam } from "../modules/players";
import logger from "../modules/logger";

const router = express.Router();

interface Player {
  firstName: string;
  lastName?: string;
  shirtNumber?: number;
  position?: string;
  positionAbbreviation?: string;
}

// GET /teams
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  logger.info("- accessed GET /teams");

  const teams = await Team.findAll();
  logger.info(`- we have ${teams.length} teams`);
  res.json({ result: true, teams });
});

// POST /teams/create
router.post(
  "/create",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info("- accessed POST /teams/create");

    const { teamName, description, playersArray, leagueName } = req.body;
    logger.info(`teamName: ${teamName}`);

    const teamNew = await Team.create({
      teamName,
      description,
    });

    let leagueId: number;
    if (!leagueName) {
      leagueId = 1;
    } else {
      const league = await League.findOne({ where: { name: leagueName } });
      leagueId = league?.id || 1;
    }

    const contractLeagueTeamNew = await ContractLeagueTeam.create({
      leagueId,
      teamId: teamNew.id,
    });

    const contractTeamUserNew = await ContractTeamUser.create({
      teamId: teamNew.id,
      userId: req.user.id,
      isSuperUser: true,
      isAdmin: true,
    });

    logger.info(`teamNew: ${JSON.stringify(teamNew)}`);

    if (playersArray && Array.isArray(playersArray)) {
      for (let i = 0; i < playersArray.length; i++) {
        const player: Player = playersArray[i];
        await addNewPlayerToTeam(
          teamNew.id,
          player.firstName,
          player.lastName || null,
          player.shirtNumber || null,
          player.position || null,
          player.positionAbbreviation || null,
        );
      }
    }

    res.json({ result: true, teamNew: { ...teamNew.toJSON(), playersArray } });
  },
);

// POST /teams/update-visibility
router.post(
  "/update-visibility",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info("- accessed POST /teams/update-visibility");

    const { teamId, visibility } = req.body;
    logger.info(`teamId: ${teamId}`);

    const team = await Team.findOne({ where: { id: teamId } });
    // logger.info(`team: ${JSON.stringify(team)}`);

    if (!team) {
      return res.status(404).json({ result: false, message: "Team not found" });
    }

    await team.update({ visibility });

    res.json({ result: true, team });
  },
);

// POST /teams/add-player
router.post(
  "/add-player",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info("- accessed POST /teams/add-player");

    const {
      teamId,
      firstName,
      lastName,
      shirtNumber,
      position,
      positionAbbreviation,
    } = req.body;
    logger.info(`teamId: ${teamId}`);

    const playerNew = await addNewPlayerToTeam(
      teamId,
      firstName,
      lastName || null,
      shirtNumber || null,
      position || null,
      positionAbbreviation || null,
    );

    res.json({ result: true, playerNew });
  },
);

// DELETE /teams/player
router.delete(
  "/player",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info("- accessed DELETE /teams/player");

    const { teamId, playerId } = req.body;
    logger.info(`playerId: ${playerId}`);

    await ContractTeamPlayer.destroy({ where: { playerId, teamId } });

    res.json({ result: true });
  },
);

// GET /teams/public
router.get(
  "/public",
  authenticateToken,
  async (req: Request, res: Response) => {
    logger.info("- accessed GET /teams/public");

    const publicTeamsArray = await Team.findAll({
      where: { visibility: "Public" },
    });
    logger.info(`- we have ${publicTeamsArray.length} public teams`);
    res.json({ result: true, publicTeamsArray });
  },
);

export default router;
