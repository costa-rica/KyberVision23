import express, { Request, Response } from "express";
import {
  Team,
  ContractTeamUser,
  ContractLeagueTeam,
  League,
  ContractTeamPlayer,
  ContractPlayerUser,
} from "kybervision23db";
import { authenticateToken } from "../modules/userAuthentication";
import { addNewPlayerToTeam } from "../modules/players";

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
  console.log("- accessed GET /teams");

  const teams = await Team.findAll();
  console.log(`- we have ${teams.length} teams`);
  res.json({ result: true, teams });
});

// POST /teams/create
router.post(
  "/create",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("- accessed POST /teams/create");

    const { teamName, description, playersArray, leagueName } = req.body;
    console.log(`teamName: ${teamName}`);

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

    console.log(`teamNew: ${JSON.stringify(teamNew)}`);

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
    console.log("- accessed POST /teams/update-visibility");

    const { teamId, visibility } = req.body;
    console.log(`teamId: ${teamId}`);

    const team = await Team.findOne({ where: { id: teamId } });
    // console.log(`team: ${JSON.stringify(team)}`);

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
    console.log("- accessed POST /teams/add-player");

    const {
      teamId,
      firstName,
      lastName,
      shirtNumber,
      position,
      positionAbbreviation,
    } = req.body;
    console.log(`teamId: ${teamId}`);

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
    console.log("- accessed DELETE /teams/player");

    const { teamId, playerId } = req.body;
    console.log(`playerId: ${playerId}`);

    await ContractTeamPlayer.destroy({ where: { playerId, teamId } });

    res.json({ result: true });
  },
);

// GET /teams/public
router.get(
  "/public",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("- accessed GET /teams/public");

    const publicTeamsArray = await Team.findAll({
      where: { visibility: "Public" },
    });
    console.log(`- we have ${publicTeamsArray.length} public teams`);
    res.json({ result: true, publicTeamsArray });
  },
);

export default router;
