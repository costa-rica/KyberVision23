import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import os from "os";
import {
  sendRegistrationEmail,
  sendResetPasswordEmail,
} from "../modules/mailer";
import { authenticateToken } from "../modules/userAuthentication";
import { deleteVideoFromYouTube, deleteVideo } from "../modules/videos";
import { Video } from "@kybervision/db";
import { recordPing } from "../modules/common";
import logger from "../modules/logger";

// Import from the KyberVision23Db package
import { User, ContractTeamUser, PendingInvitations } from "@kybervision/db";

const router = express.Router();

// POST /users/register
router.post("/register", async (req: Request, res: Response) => {
  const { firstName, lastName, password, email } = req.body;

  if (!password || !email) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const username = email.split("@")[0];

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    password: hashedPassword,
    email,
    username,
  });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

  const areWeOnMacMiniWorkstation = os.hostname();
  logger.info(`areWeOnMacMiniWorkstation: ${areWeOnMacMiniWorkstation}`);
  if (
    areWeOnMacMiniWorkstation !== "Nicks-Mac-mini.local" &&
    areWeOnMacMiniWorkstation !== "Nicks-MacBook-Air.local"
  ) {
    await sendRegistrationEmail(email, username)
      .then(() => logger.info("Email sent successfully"))
      .catch((error) => logger.error("Email failed:", error));
  } else {
    logger.info("Email not sent");
  }

  // Check if pending invitation exists
  const pendingInvitationArray = await PendingInvitations.findAll({
    where: { email },
  });
  if (pendingInvitationArray.length > 0) {
    // Create contract team user for each teamId in pendingInvitationArray
    await Promise.all(
      pendingInvitationArray.map(async (pendingInvitation) => {
        await ContractTeamUser.create({
          teamId: pendingInvitation.teamId,
          userId: user.id,
        });
        // Delete pending invitation
        await pendingInvitation.destroy();
      }),
    );
  }

  res.status(201).json({ message: "Successfully created user", user, token });
});

// POST /users/login
router.post("/login", async (req: Request, res: Response) => {
  const {
    email,
    password,
    userDeviceTimestamp,
    deviceName,
    deviceType,
    isTablet,
    manufacturer,
    modelName,
    osName,
    osVersion,
  } = req.body;

  // Log the entire request body for testing/verification
  logger.info(
    "📱 POST /users/login - Request Body:",
    JSON.stringify(req.body, null, 2),
  );

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await User.findOne({
    where: { email },
    include: [ContractTeamUser],
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
    logger.info("🚨 Recording ping with device data");
    const ping = await recordPing({
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
    logger.info("✅ Ping recorded:", ping);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid password." });
  }

  // updatedAt is automatically managed by Sequelize
  await user.save();

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

  const { password: _, ...userWithoutPassword } = user.toJSON();

  res.status(200).json({
    message: "Successfully logged in",
    token,
    user: userWithoutPassword,
  });
});

// POST /users/request-reset-password-email
router.post(
  "/request-reset-password-email",
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // logger.info("[ POST /users/request-reset-password-email 1]token:", token);

    await sendResetPasswordEmail(email, token)
      .then(() => logger.info("Email sent successfully"))
      .catch((error) => logger.error("Email failed:", error));

    res.status(200).json({ message: "Email sent successfully" });
  },
);

// POST /users/reset-password-with-new-password
router.post(
  "/reset-password-with-new-password",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const user = await User.findOne({ where: { id: req.user?.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: "Password reset successfully" });
  },
);

// DELETE /users/delete-account
router.delete(
  "/delete-account",

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (!user.password) {
      return res.status(401).json({
        error: "User missing password. Probably registered via Google.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password." });
    }
    await user.destroy();
    res.status(200).json({ message: "Account deleted successfully" });
  },
);

// POST /users/register-or-login-via-google
router.post(
  "/register-or-login-via-google",
  async (req: Request, res: Response) => {
    logger.info("--- POST /users/register-or-login-via-google 1 ----");
    try {
      const { email, name } = req.body as { email?: string; name?: string };

      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }

      // Derive a safe username from email local-part
      const username = email.split("@")[0];

      // Derive firstName / lastName from provided name (fallbacks included)
      const safeName = (name ?? username).trim();
      let firstName = "";
      let lastName = "";

      if (safeName.length > 0) {
        const idx = safeName.indexOf(" ");
        if (idx === -1) {
          firstName = safeName;
          lastName = "";
        } else {
          firstName = safeName.slice(0, idx).trim();
          lastName = safeName.slice(idx + 1).trim();
        }
      }

      // 1) Try to find existing user
      let user = await User.findOne({
        where: { email },
        include: [ContractTeamUser],
      });

      if (!user) {
        // 2) Create user WITHOUT storing a password
        // If your User model requires a non-null password, consider allowing NULL in the schema
        // or storing a sentinel value like "" (but you said not to store a password, so we try null).
        user = await User.create({
          email,
          username,
          firstName,
          lastName,
          password: null, // make sure your DB column allows NULL
        });

        // Process any pending invitations for this email (same behavior as /register)
        const pendingInvitationArray = await PendingInvitations.findAll({
          where: { email },
        });

        if (pendingInvitationArray.length > 0) {
          await Promise.all(
            pendingInvitationArray.map(async (pendingInvitation) => {
              await ContractTeamUser.create({
                teamId: pendingInvitation.teamId,
                userId: user!.id,
              });
              await pendingInvitation.destroy();
            }),
          );
        }

        // Re-fetch including relations for a consistent response shape
        user = await User.findOne({
          where: { id: user.id },
          include: [ContractTeamUser],
        });
      } else {
        // Keep behavior consistent with /login: touch updatedAt
        await user.save();
      }

      if (!user) {
        return res.status(500).json({ error: "User fetch failed." });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

      // Remove password from response
      const { password: _ignored, ...userWithoutPassword } = user.toJSON();

      return res.status(200).json({
        message: "Successfully logged in",
        token,
        user: userWithoutPassword,
      });
    } catch (err: any) {
      logger.error("Google register/login error:", err);
      return res
        .status(500)
        .json({ error: err?.message || "Internal server error" });
    }
  },
);

export default router;
