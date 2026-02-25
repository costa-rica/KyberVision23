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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mailer_1 = require("../modules/mailer");
const logger_1 = __importDefault(require("../modules/logger"));
const router = express_1.default.Router();
// NOTE: This is the "Tribe" router. Formerly GroupContract
// --> would be the groups.js file in KV15API
// GET /contract-team-users
router.get("/", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed GET /contract-team-users");
    // logger.info(" 👉 Called by SelectTeamScreen in mobile app");
    try {
        const userId = req.user.id;
        logger_1.default.info(`userId: ${userId} -- user sending request to API`);
        const contractTeamUsers = await db_1.ContractTeamUser.findAll({
            where: { userId },
            include: [
                {
                    model: db_1.Team,
                    // attributes: ["id", "teamName", "city", "coachName"], // specify fields you want
                },
            ],
        });
        // logger.info(" --- contractTeamUsers ------");
        // logger.info(contractTeamUsers[0].dataValues);
        // logger.info(" -----------------------------");
        // const teamsArray = groupContracts.map((gc) => gc.Team);
        const teamsArray = await Promise.all(contractTeamUsers.map(async (ctu) => {
            const ctuJSON = ctu.toJSON();
            const team = ctuJSON.Team; // convert to plain object
            if (!team) {
                logger_1.default.info("Warning: Team association not found for ContractTeamUser", ctu.id);
                return null;
            }
            const joinToken = jsonwebtoken_1.default.sign({ teamId: team.id }, process.env.JWT_SECRET, {
                expiresIn: "2d",
            });
            team.genericJoinToken = joinToken;
            return team;
        })).then((teams) => teams.filter((team) => team !== null));
        const contractTeamUserArrayModified = await Promise.all(contractTeamUsers.map(async (ctu) => {
            const ctuJSON = ctu.toJSON();
            const { Team } = ctuJSON, ctuData = __rest(ctuJSON, ["Team"]);
            return ctuData;
        }));
        res.status(200).json({
            teamsArray,
            contractTeamUserArray: contractTeamUserArrayModified,
        });
    }
    catch (error) {
        logger_1.default.info(error);
        res.status(500).json({
            error: "Error retrieving contractTeamUsers",
            details: error.message,
        });
    }
});
// POST contract-team-users/create/:teamId
router.post("/create/:teamId", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const teamId = Number(req.params.teamId);
        const userId = req.user.id;
        const { isSuperUser, isAdmin, isCoach } = req.body;
        // create or modify contract team user
        const [contractTeamUser, created] = await db_1.ContractTeamUser.upsert({ userId, teamId, isSuperUser, isAdmin, isCoach }, { returning: true });
        // res.status(201).json(group);
        res.status(created ? 201 : 200).json({
            message: created
                ? "ContractTeamUser created with success"
                : "ContractTeamUser updated with success",
            contractTeamUser,
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Error creating or updating contractTeamUser",
            details: error.message,
        });
    }
});
// GET /contract-team-users/:teamId
router.get("/:teamId", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("------- > accessed GET /contract-team-users/:teamId");
    // logger.info(" 👉 Called by AdminSettings in mobile app");
    try {
        const teamId = Number(req.params.teamId);
        logger_1.default.info(`teamId: ${teamId}`);
        const contractTeamUser = await db_1.ContractTeamUser.findAll({
            where: { teamId },
            include: {
                model: db_1.User,
                attributes: ["id", "username", "email"], // specify fields you want
                include: [
                    {
                        model: db_1.ContractPlayerUser,
                    },
                ],
            },
        });
        // logger.info(JSON.stringify(contractTeamUser, null, 2));
        const squadArray = contractTeamUser.map((ctu) => {
            var _a;
            const ctuJSON = ctu.toJSON();
            const { User } = ctuJSON, ctuData = __rest(ctuJSON, ["User"]);
            return Object.assign(Object.assign({}, ctuData), { userId: User.id, username: User.username, email: User.email, isPlayer: User.ContractPlayerUser ? true : false, playerId: (_a = User.ContractPlayerUser) === null || _a === void 0 ? void 0 : _a.playerId });
        });
        const contractTeamPlayerArray = await db_1.ContractTeamPlayer.findAll({
            where: { teamId },
        });
        const contractTeamPlayerIds = contractTeamPlayerArray.map((ctp) => ctp.playerId);
        const contractPlayerUserArray = await db_1.ContractPlayerUser.findAll({
            where: { playerId: contractTeamPlayerIds },
        });
        const squadArrayWithPlayerFlag = squadArray.map((squadMember) => {
            // const { User, ...ctuData } = ctu.get();
            return Object.assign(Object.assign({}, squadMember), { isPlayer: contractPlayerUserArray.some((cpu) => cpu.userId === squadMember.userId) });
        });
        res.status(200).json({ squadArray: squadArrayWithPlayerFlag });
    }
    catch (error) {
        res.status(500).json({
            error: "Error retrieving contractTeamUser",
            details: error.message,
        });
    }
});
// POST /contract-team-users/add-squad-member
router.post("/add-squad-member", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("------- > accessed POST /contract-team-users/add-squad-member");
    try {
        const { teamId, email } = req.body;
        const teamIdNumber = Number(teamId);
        const user = await db_1.User.findOne({ where: { email } });
        if (!user) {
            logger_1.default.info("-- User not found, triggering email function --  ");
            // check if pending invitation exists
            const pendingInvitation = await db_1.PendingInvitations.findOne({
                where: { email, teamId: teamIdNumber },
            });
            if (pendingInvitation) {
                return res.status(400).json({
                    message: "User already invited.",
                });
            }
            else {
                // create pending invitation
                await db_1.PendingInvitations.create({
                    email,
                    teamId: teamIdNumber,
                });
                // trigger function to send email to email address provided.
                (0, mailer_1.sendJoinSquadNotificationEmail)(email);
                return res.status(200).json({
                    message: "User invited successfully.",
                });
            }
        }
        const contractTeamUser = await db_1.ContractTeamUser.create({
            teamId: teamIdNumber,
            userId: user.id,
        });
        res.status(201).json(contractTeamUser);
    }
    catch (error) {
        res.status(500).json({
            error: "Error adding squad member",
            details: error.message,
        });
    }
});
// NOT currently being used
// GET /contract-team-users/create-join-token/:teamId
router.get("/create-join-token/:teamId", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed GET /contract-team-users/create-join-token/:teamId");
    const teamId = Number(req.params.teamId);
    // const joinToken = tokenizeObject({ teamId });
    const joinToken = jsonwebtoken_1.default.sign({ teamId }, process.env.JWT_SECRET, {
        expiresIn: "2m",
    });
    const shareUrl = `${process.env.URL_BASE_KV_API}/contract-team-users/join/${joinToken}`;
    res.status(200).json({ shareUrl });
});
// GET /contract-team-users/join/:joinToken
router.get("/join/:joinToken", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed GET /contract-team-users/join/:joinToken");
    const joinToken = req.params.joinToken;
    jsonwebtoken_1.default.verify(joinToken, process.env.JWT_SECRET, async (err, decoded) => {
        if (err)
            return res.status(403).json({ message: "Invalid token" });
        const { teamId } = decoded;
        const contractTeamUserExists = await db_1.ContractTeamUser.findOne({
            where: { teamId: Number(teamId), userId: req.user.id },
        });
        if (contractTeamUserExists) {
            return res.status(400).json({ message: "User already in team" });
        }
        // check if contractTeamUser already exists and if not create it
        const contractTeamUser = await db_1.ContractTeamUser.create({
            teamId: Number(teamId),
            userId: req.user.id,
        });
        res.json({ result: true, contractTeamUser });
    });
});
// POST /contract-team-users/toggle-role
router.post("/toggle-role", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed POST /contract-team-users/toggle-role");
    try {
        const { teamId, role, userId } = req.body;
        logger_1.default.info(`userId: ${userId}`);
        logger_1.default.info(`teamId: ${teamId}`);
        logger_1.default.info(`role: ${role}`);
        const contractTeamUser = await db_1.ContractTeamUser.findOne({
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
    }
    catch (error) {
        res.status(500).json({
            error: "Error modifying contractTeamUser role",
            details: error.message,
        });
    }
});
// DELETE /contract-team-users/
router.delete("/", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- accessed DELETE /contract-team-users/");
    try {
        const { contractTeamUserId } = req.body;
        const contractTeamUser = await db_1.ContractTeamUser.findOne({
            where: { id: contractTeamUserId },
        });
        if (!contractTeamUser) {
            return res.status(404).json({ message: "ContractTeamUser not found" });
        }
        await contractTeamUser.destroy();
        res.json({ result: true, contractTeamUser });
    }
    catch (error) {
        res.status(500).json({
            error: "Error deleting contractTeamUser",
            details: error.message,
        });
    }
});
exports.default = router;
