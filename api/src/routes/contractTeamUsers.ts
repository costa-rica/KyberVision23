import express, { Request, Response } from "express";
import {
  User,
  ContractTeamUser,
  Team,
  ContractTeamPlayer,
  ContractPlayerUser,
  PendingInvitations,
} from "@kybervision/db";
import { authenticateToken } from "../modules/userAuthentication";
import jwt from "jsonwebtoken";
import { sendJoinSquadNotificationEmail } from "../modules/mailer";

const router = express.Router();

// NOTE: This is the "Tribe" router. Formerly GroupContract
// --> would be the groups.js file in KV15API

// GET /contract-team-users
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  console.log("- accessed GET /contract-team-users");
  // console.log(" 👉 Called by SelectTeamScreen in mobile app");
  try {
    const userId = req.user.id;
    console.log(`userId: ${userId} -- user sending request to API`);
    const contractTeamUsers = await ContractTeamUser.findAll({
      where: { userId },
      include: [
        {
          model: Team,
          // attributes: ["id", "teamName", "city", "coachName"], // specify fields you want
        },
      ],
    });
    // console.log(" --- contractTeamUsers ------");
    // console.log(contractTeamUsers[0].dataValues);
    // console.log(" -----------------------------");

    // const teamsArray = groupContracts.map((gc) => gc.Team);
    const teamsArray = await Promise.all(
      contractTeamUsers.map(async (ctu) => {
        const ctuJSON = ctu.toJSON() as any;
        const team = ctuJSON.Team; // convert to plain object
        if (!team) {
          console.log(
            "Warning: Team association not found for ContractTeamUser",
            ctu.id,
          );
          return null;
        }
        const joinToken = jwt.sign(
          { teamId: team.id },
          process.env.JWT_SECRET!,
          {
            expiresIn: "2d",
          },
        );
        team.genericJoinToken = joinToken;
        return team;
      }),
    ).then((teams) => teams.filter((team) => team !== null));
    const contractTeamUserArrayModified = await Promise.all(
      contractTeamUsers.map(async (ctu) => {
        const ctuJSON = ctu.toJSON() as any;
        const { Team, ...ctuData } = ctuJSON;
        return ctuData;
      }),
    );

    res.status(200).json({
      teamsArray,
      contractTeamUserArray: contractTeamUserArrayModified,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      error: "Error retrieving contractTeamUsers",
      details: error.message,
    });
  }
});

// POST contract-team-users/create/:teamId
router.post(
  "/create/:teamId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.params.teamId);
      const userId = req.user.id;
      const { isSuperUser, isAdmin, isCoach } = req.body;
      // create or modify contract team user
      const [contractTeamUser, created] = await ContractTeamUser.upsert(
        { userId, teamId, isSuperUser, isAdmin, isCoach },
        { returning: true },
      );
      // res.status(201).json(group);
      res.status(created ? 201 : 200).json({
        message: created
          ? "ContractTeamUser created with success"
          : "ContractTeamUser updated with success",
        contractTeamUser,
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Error creating or updating contractTeamUser",
        details: error.message,
      });
    }
  },
);

// GET /contract-team-users/:teamId
router.get(
  "/:teamId",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("------- > accessed GET /contract-team-users/:teamId");
    // console.log(" 👉 Called by AdminSettings in mobile app");
    try {
      const teamId = Number(req.params.teamId);
      console.log(`teamId: ${teamId}`);
      const contractTeamUser = await ContractTeamUser.findAll({
        where: { teamId },
        include: {
          model: User,
          attributes: ["id", "username", "email"], // specify fields you want
          include: [
            {
              model: ContractPlayerUser,
            },
          ],
        },
      });

      // console.log(JSON.stringify(contractTeamUser, null, 2));

      const squadArray = contractTeamUser.map((ctu) => {
        const ctuJSON = ctu.toJSON() as any;
        const { User, ...ctuData } = ctuJSON;

        return {
          ...ctuData, // Extract raw contractTeamUser data
          userId: User.id,
          username: User.username,
          email: User.email,
          isPlayer: User.ContractPlayerUser ? true : false,
          playerId: User.ContractPlayerUser?.playerId,
        };
      });

      const contractTeamPlayerArray = await ContractTeamPlayer.findAll({
        where: { teamId },
      });
      const contractTeamPlayerIds = contractTeamPlayerArray.map(
        (ctp) => ctp.playerId,
      );
      const contractPlayerUserArray = await ContractPlayerUser.findAll({
        where: { playerId: contractTeamPlayerIds },
      });

      const squadArrayWithPlayerFlag = squadArray.map((squadMember) => {
        // const { User, ...ctuData } = ctu.get();
        return {
          ...squadMember, // Extract raw contractTeamUser data
          isPlayer: contractPlayerUserArray.some(
            (cpu) => cpu.userId === squadMember.userId,
          ),
        };
      });
      res.status(200).json({ squadArray: squadArrayWithPlayerFlag });
    } catch (error: any) {
      res.status(500).json({
        error: "Error retrieving contractTeamUser",
        details: error.message,
      });
    }
  },
);

// POST /contract-team-users/add-squad-member
router.post(
  "/add-squad-member",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log(
      "------- > accessed POST /contract-team-users/add-squad-member",
    );
    try {
      const { teamId, email } = req.body;
      const teamIdNumber = Number(teamId);
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log("-- User not found, triggering email function --  ");

        // check if pending invitation exists
        const pendingInvitation = await PendingInvitations.findOne({
          where: { email, teamId: teamIdNumber },
        });
        if (pendingInvitation) {
          return res.status(400).json({
            message: "User already invited.",
          });
        } else {
          // create pending invitation
          await PendingInvitations.create({
            email,
            teamId: teamIdNumber,
          });
          // trigger function to send email to email address provided.
          sendJoinSquadNotificationEmail(email);

          return res.status(200).json({
            message: "User invited successfully.",
          });
        }
      }
      const contractTeamUser = await ContractTeamUser.create({
        teamId: teamIdNumber,
        userId: user.id,
      });
      res.status(201).json(contractTeamUser);
    } catch (error: any) {
      res.status(500).json({
        error: "Error adding squad member",
        details: error.message,
      });
    }
  },
);

// NOT currently being used
// GET /contract-team-users/create-join-token/:teamId
router.get(
  "/create-join-token/:teamId",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log(
      "- accessed GET /contract-team-users/create-join-token/:teamId",
    );
    const teamId = Number(req.params.teamId);
    // const joinToken = tokenizeObject({ teamId });
    const joinToken = jwt.sign({ teamId }, process.env.JWT_SECRET!, {
      expiresIn: "2m",
    });
    const shareUrl = `${process.env.URL_BASE_KV_API}/contract-team-users/join/${joinToken}`;
    res.status(200).json({ shareUrl });
  },
);

// GET /contract-team-users/join/:joinToken
router.get(
  "/join/:joinToken",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("- accessed GET /contract-team-users/join/:joinToken");
    const joinToken = req.params.joinToken;
    jwt.verify(
      joinToken,
      process.env.JWT_SECRET!,
      async (err, decoded: any) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        const { teamId } = decoded;
        const contractTeamUserExists = await ContractTeamUser.findOne({
          where: { teamId: Number(teamId), userId: req.user.id },
        });
        if (contractTeamUserExists) {
          return res.status(400).json({ message: "User already in team" });
        }
        // check if contractTeamUser already exists and if not create it
        const contractTeamUser = await ContractTeamUser.create({
          teamId: Number(teamId),
          userId: req.user.id,
        });

        res.json({ result: true, contractTeamUser });
      },
    );
  },
);

// POST /contract-team-users/toggle-role
router.post(
  "/toggle-role",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("- accessed POST /contract-team-users/toggle-role");
    try {
      const { teamId, role, userId } = req.body;
      console.log(`userId: ${userId}`);
      console.log(`teamId: ${teamId}`);
      console.log(`role: ${role}`);
      const contractTeamUser = await ContractTeamUser.findOne({
        where: { teamId: Number(teamId), userId },
      });
      if (!contractTeamUser) {
        return res.status(404).json({ message: "ContractTeamUser not found" });
      }
      // await contractTeamUser.update({ role });
      if (role === "Coach") {
        await contractTeamUser.update({ isCoach: !contractTeamUser.isCoach });
      }
      if (role === "Admin") {
        await contractTeamUser.update({ isAdmin: !contractTeamUser.isAdmin });
      }
      if (role === "Member") {
        await contractTeamUser.update({
          isSuperUser: false,
          isAdmin: false,
          isCoach: false,
        });
      }
      res.json({ result: true, contractTeamUser });
    } catch (error: any) {
      res.status(500).json({
        error: "Error modifying contractTeamUser role",
        details: error.message,
      });
    }
  },
);

// DELETE /contract-team-users/
router.delete("/", authenticateToken, async (req: Request, res: Response) => {
  console.log("- accessed DELETE /contract-team-users/");
  try {
    const { contractTeamUserId } = req.body;
    const contractTeamUser = await ContractTeamUser.findOne({
      where: { id: contractTeamUserId },
    });
    if (!contractTeamUser) {
      return res.status(404).json({ message: "ContractTeamUser not found" });
    }
    await contractTeamUser.destroy();
    res.json({ result: true, contractTeamUser });
  } catch (error: any) {
    res.status(500).json({
      error: "Error deleting contractTeamUser",
      details: error.message,
    });
  }
});

export default router;
