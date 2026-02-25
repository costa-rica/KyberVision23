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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const os_1 = __importDefault(require("os"));
const mailer_1 = require("../modules/mailer");
const userAuthentication_1 = require("../modules/userAuthentication");
const common_1 = require("../modules/common");
const logger_1 = __importDefault(require("../modules/logger"));
// Import from the KyberVision23Db package
const db_1 = require("@kybervision/db");
const router = express_1.default.Router();
// POST /users/register
router.post("/register", async (req, res) => {
    const { firstName, lastName, password, email } = req.body;
    if (!password || !email) {
        return res.status(400).json({ error: "All fields are required." });
    }
    const username = email.split("@")[0];
    const existingUser = await db_1.User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ error: "User already exists." });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await db_1.User.create({
        firstName,
        lastName,
        password: hashedPassword,
        email,
        username,
    });
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
    const areWeOnMacMiniWorkstation = os_1.default.hostname();
    logger_1.default.info(`areWeOnMacMiniWorkstation: ${areWeOnMacMiniWorkstation}`);
    if (areWeOnMacMiniWorkstation !== "Nicks-Mac-mini.local" &&
        areWeOnMacMiniWorkstation !== "Nicks-MacBook-Air.local") {
        await (0, mailer_1.sendRegistrationEmail)(email, username)
            .then(() => logger_1.default.info("Email sent successfully"))
            .catch((error) => logger_1.default.error("Email failed:", error));
    }
    else {
        logger_1.default.info("Email not sent");
    }
    // Check if pending invitation exists
    const pendingInvitationArray = await db_1.PendingInvitations.findAll({
        where: { email },
    });
    if (pendingInvitationArray.length > 0) {
        // Create contract team user for each teamId in pendingInvitationArray
        await Promise.all(pendingInvitationArray.map(async (pendingInvitation) => {
            await db_1.ContractTeamUser.create({
                teamId: pendingInvitation.teamId,
                userId: user.id,
            });
            // Delete pending invitation
            await pendingInvitation.destroy();
        }));
    }
    res.status(201).json({ message: "Successfully created user", user, token });
});
// POST /users/login
router.post("/login", async (req, res) => {
    const { email, password, userDeviceTimestamp, deviceName, deviceType, isTablet, manufacturer, modelName, osName, osVersion, } = req.body;
    // Log the entire request body for testing/verification
    logger_1.default.info("📱 POST /users/login - Request Body:", JSON.stringify(req.body, null, 2));
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    const user = await db_1.User.findOne({
        where: { email },
        include: [db_1.ContractTeamUser],
    });
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }
    if (!user.password) {
        return res.status(401).json({
            error: "User missing password. Probably registered via Google.",
        });
    }
    if (userDeviceTimestamp) {
        logger_1.default.info("🚨 Recording ping with device data");
        const ping = await (0, common_1.recordPing)({
            userId: user.id,
            serverTimestamp: new Date(),
            endpointName: "POST /users/login",
            userDeviceTimestamp: new Date(userDeviceTimestamp),
            deviceName,
            deviceType,
            isTablet,
            manufacturer,
            modelName,
            osName,
            osVersion,
        });
        logger_1.default.info("✅ Ping recorded:", ping);
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password." });
    }
    // updatedAt is automatically managed by Sequelize
    await user.save();
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
    const _a = user.toJSON(), { password: _ } = _a, userWithoutPassword = __rest(_a, ["password"]);
    res.status(200).json({
        message: "Successfully logged in",
        token,
        user: userWithoutPassword,
    });
});
// POST /users/request-reset-password-email
router.post("/request-reset-password-email", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }
    const user = await db_1.User.findOne({ where: { email } });
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    // logger.info("[ POST /users/request-reset-password-email 1]token:", token);
    await (0, mailer_1.sendResetPasswordEmail)(email, token)
        .then(() => logger_1.default.info("Email sent successfully"))
        .catch((error) => logger_1.default.error("Email failed:", error));
    res.status(200).json({ message: "Email sent successfully" });
});
// POST /users/reset-password-with-new-password
router.post("/reset-password-with-new-password", userAuthentication_1.authenticateToken, async (req, res) => {
    var _a;
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: "Password is required." });
    }
    const user = await db_1.User.findOne({ where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } });
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await user.update({ password: hashedPassword });
    res.status(200).json({ message: "Password reset successfully" });
});
// DELETE /users/delete-account
router.delete("/delete-account", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({ error: "Email and password are required." });
    }
    const user = await db_1.User.findOne({ where: { email } });
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }
    if (!user.password) {
        return res.status(401).json({
            error: "User missing password. Probably registered via Google.",
        });
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password." });
    }
    await user.destroy();
    res.status(200).json({ message: "Account deleted successfully" });
});
// POST /users/register-or-login-via-google
router.post("/register-or-login-via-google", async (req, res) => {
    logger_1.default.info("--- POST /users/register-or-login-via-google 1 ----");
    try {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }
        // Derive a safe username from email local-part
        const username = email.split("@")[0];
        // Derive firstName / lastName from provided name (fallbacks included)
        const safeName = (name !== null && name !== void 0 ? name : username).trim();
        let firstName = "";
        let lastName = "";
        if (safeName.length > 0) {
            const idx = safeName.indexOf(" ");
            if (idx === -1) {
                firstName = safeName;
                lastName = "";
            }
            else {
                firstName = safeName.slice(0, idx).trim();
                lastName = safeName.slice(idx + 1).trim();
            }
        }
        // 1) Try to find existing user
        let user = await db_1.User.findOne({
            where: { email },
            include: [db_1.ContractTeamUser],
        });
        if (!user) {
            // 2) Create user WITHOUT storing a password
            // If your User model requires a non-null password, consider allowing NULL in the schema
            // or storing a sentinel value like "" (but you said not to store a password, so we try null).
            user = await db_1.User.create({
                email,
                username,
                firstName,
                lastName,
                password: null, // make sure your DB column allows NULL
            });
            // Process any pending invitations for this email (same behavior as /register)
            const pendingInvitationArray = await db_1.PendingInvitations.findAll({
                where: { email },
            });
            if (pendingInvitationArray.length > 0) {
                await Promise.all(pendingInvitationArray.map(async (pendingInvitation) => {
                    await db_1.ContractTeamUser.create({
                        teamId: pendingInvitation.teamId,
                        userId: user.id,
                    });
                    await pendingInvitation.destroy();
                }));
            }
            // Re-fetch including relations for a consistent response shape
            user = await db_1.User.findOne({
                where: { id: user.id },
                include: [db_1.ContractTeamUser],
            });
        }
        else {
            // Keep behavior consistent with /login: touch updatedAt
            await user.save();
        }
        if (!user) {
            return res.status(500).json({ error: "User fetch failed." });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
        // Remove password from response
        const _a = user.toJSON(), { password: _ignored } = _a, userWithoutPassword = __rest(_a, ["password"]);
        return res.status(200).json({
            message: "Successfully logged in",
            token,
            user: userWithoutPassword,
        });
    }
    catch (err) {
        logger_1.default.error("Google register/login error:", err);
        return res
            .status(500)
            .json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Internal server error" });
    }
});
// GET /users/user-growth-timeseries
router.get("/user-growth-timeseries", userAuthentication_1.authenticateToken, async (_req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const users = await db_1.User.findAll({
            attributes: ["createdAt"],
            order: [["createdAt", "ASC"]],
        });
        const dailyNewUsers = new Map();
        for (const user of users) {
            const createdAt = user.get("createdAt");
            if (!createdAt)
                continue;
            const dateKey = new Date(createdAt).toISOString().slice(0, 10);
            dailyNewUsers.set(dateKey, ((_a = dailyNewUsers.get(dateKey)) !== null && _a !== void 0 ? _a : 0) + 1);
        }
        let runningTotal = 0;
        const series = Array.from(dailyNewUsers.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, newUsers]) => {
            runningTotal += newUsers;
            return {
                date,
                newUsers,
                totalUsers: runningTotal,
            };
        });
        res.status(200).json({
            series,
            summary: {
                totalUsers: users.length,
                firstJoinDate: (_c = (_b = series[0]) === null || _b === void 0 ? void 0 : _b.date) !== null && _c !== void 0 ? _c : null,
                lastJoinDate: (_e = (_d = series[series.length - 1]) === null || _d === void 0 ? void 0 : _d.date) !== null && _e !== void 0 ? _e : null,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error in /users/user-growth-timeseries:", error);
        res
            .status(500)
            .json({ error: "Failed to fetch user growth timeseries." });
    }
});
exports.default = router;
