import express, { Request, Response } from "express";
import {
  authenticateToken,
  tokenizeObject,
  detokenizeObject,
} from "../modules/userAuthentication";
import {
  Video,
  ContractTeamUser,
  Session,
  User,
  Action,
  ContractVideoAction,
  Script,
} from "@kybervision/db";
import { getSessionWithTeams } from "../modules/sessions";
import {
  upload,
  requestJobQueuerVideoUploaderYouTubeProcessing,
  renameVideoFile,
  deleteVideo,
  deleteVideoFromYouTube,
  requestJobQueuerVideoMontageMaker,
} from "../modules/videos";
import path from "path";
import fs from "fs";
import { sendVideoMontageCompleteNotificationEmail } from "../modules/mailer";
import { writeRequestArgs } from "../modules/common";
import jwt from "jsonwebtoken";

const router = express.Router();

// Video file naming convention
// ${process.env.PREFIX_VIDEO_FILE_NAME}_videoId${video.id}_sessionId${video.sessionId}.mp4

// 🔹 GET /videos/ - Get All Videos with Match Data
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  console.log(`- in GET /api/videos`);
  const user = req.user;
  try {
    // Fetch all videos with associated match data
    const videos = await Video.findAll();

    // Process videos to include match & team details
    const formattedVideos = await Promise.all(
      videos.map(async (video) => {
        const sessionData = await getSessionWithTeams(video.sessionId);
        return {
          ...video.get(), // Extract raw video data
          session: sessionData.success ? sessionData.session : null, // Include match data if successful
        };
      }),
    );

    res.json({ result: true, videosArray: formattedVideos });
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      result: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// 🔹 GET /videos/team/:teamId - Get All Team Videos with Match Data
router.get(
  "/team/:teamId",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log(`- in GET /api/videos/team/:teamId`);
    try {
      const teamId = Number(req.params.teamId);
      console.log(`teamId: ${teamId}`);

      // Fetch videos whose contractTeamUser is associated with the given teamId
      const videosArray = await Video.findAll({
        include: [
          {
            model: ContractTeamUser,
            where: { teamId },
            attributes: ["id", "teamId", "userId"], // optional: include related info
          },
        ],
        where: { processingCompleted: true },
      });

      // Process videos to include match & team details
      const formattedVideos = await Promise.all(
        videosArray.map(async (video) => {
          const sessionData = await getSessionWithTeams(video.sessionId);
          return {
            ...video.get(), // Extract raw video data
            session: sessionData.success ? sessionData.session : null, // Include session data if successful
          };
        }),
      );

      res.json({ result: true, videosArray: formattedVideos });
    } catch (error: any) {
      console.error("Error fetching videos:", error);
      res.status(500).json({
        result: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
);

// 🔹 POST /videos/upload-youtube
router.post(
  "/upload-youtube",
  authenticateToken,
  upload.single("video"),
  async (req: Request, res: Response) => {
    console.log("- in POST /videos/upload-youtube");

    // Set timeout for this specific request to 2400 seconds (40 minutes)
    req.setTimeout(2400 * 1000);

    const { sessionId } = req.body;
    const user = req.user;

    // Validate required fields
    if (!sessionId) {
      return res
        .status(400)
        .json({ result: false, message: "sessionId is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ result: false, message: "No video file uploaded" });
    }

    try {
      // Step 1: verify user has privileges to upload video for this session
      // Get teamId of session
      const session = await Session.findByPk(Number(sessionId));

      if (!session) {
        return res.status(404).json({
          result: false,
          message: "Session not found",
        });
      }

      // Verify user is associated with teamId in ContractTeamUser
      const contractTeamUser = await ContractTeamUser.findOne({
        where: {
          teamId: session.teamId,
          userId: user.id,
        },
      });

      if (!contractTeamUser) {
        return res.status(403).json({
          result: false,
          message:
            "User does not have privileges to upload video for this session",
        });
      }
      const contractTeamUserId = contractTeamUser.id;

      // Step 2: Get video file size in MB
      const fileSizeBytes = req.file.size;
      const fileSizeMb = (fileSizeBytes / (1024 * 1024)).toFixed(2);

      console.log(`📁 Video File Size: ${fileSizeMb} MB`);

      // Step 3: Create video entry with placeholder URL & file size
      const newVideo = await Video.create({
        sessionId: Number(sessionId),
        filename: req.file.filename,
        url: "placeholder",
        videoFileSizeInMb: Number(fileSizeMb),
        pathToVideoFile: process.env.PATH_VIDEOS_UPLOADED!,
        originalVideoFilename: req.file.originalname,
        contractTeamUserId: contractTeamUserId,
      });

      // Step 3.1: Rename the uploaded file
      const renamedFilename = renameVideoFile(
        newVideo.id,
        Number(sessionId),
        user.id,
      );
      const renamedFilePath = path.join(
        process.env.PATH_VIDEOS_UPLOADED!,
        renamedFilename,
      );

      // Step 3.2: Rename the file
      fs.renameSync(
        path.join(process.env.PATH_VIDEOS_UPLOADED!, req.file.filename),
        renamedFilePath,
      );
      await newVideo.update({
        filename: renamedFilename,
      });

      // Step 4: Generate and update video URL
      const videoURL = `https://${req.get("host")}/videos/${newVideo.id}`;
      await newVideo.update({ url: videoURL });

      // Step 5: Create ContractVideoActions for each action
      // Get all scripts for session
      const scriptsArray = await Script.findAll({
        where: { sessionId: Number(sessionId) },
      });
      const actionsArray = await Action.findAll({
        where: { scriptId: scriptsArray.map((script) => script.id) },
      });

      // Create ContractVideoActions for each action
      for (let i = 0; i < actionsArray.length; i++) {
        const action = actionsArray[i];
        await ContractVideoAction.create({
          actionId: action.id,
          videoId: newVideo.id,
        });
      }

      const videoId = newVideo.id;
      // Step 6: spawn KyberVision14YouTuber child process
      const { result, messageFromYouTubeQueuer } =
        await requestJobQueuerVideoUploaderYouTubeProcessing(
          renamedFilename,
          videoId,
        );
      if (!result) {
        await newVideo.update({
          processingFailed: true,
        });
        return res
          .status(400)
          .json({ result: false, message: messageFromYouTubeQueuer });
      }
      return res.json({ result: true, message: "All good." });
    } catch (error: any) {
      console.error("Error in video upload:", error);
      res.status(500).json({
        result: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
);

// 🔹 DELETE /videos/:videoId
router.delete(
  "/:videoId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const videoId = Number(req.params.videoId);

      const {
        success: successYouTube,
        message: messageYouTube,
        error: errorYouTube,
      } = await deleteVideoFromYouTube(videoId);

      console.log(
        `YouTube delete response: ${JSON.stringify({
          successYouTube,
          messageYouTube,
          errorYouTube,
        })}`,
      );

      if (!successYouTube) {
        console.log("-- No YouTube video to delete");
      }

      const { success, message, error } = await deleteVideo(videoId);

      if (!success) {
        return res.status(404).json({ error });
      }

      res.status(200).json({ message });
    } catch (error: any) {
      console.error("Error in DELETE /videos/:videoId:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 🔹 POST /videos/montage-service/queue-a-job: Queue a job to process a video montage
router.post(
  "/montage-service/queue-a-job",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("Received request to queue a job...");

    try {
      const { videoId, actionsArray, token } = req.body;
      const user = req.user;

      const videoObj = await Video.findByPk(Number(videoId));

      if (!videoObj) {
        return res
          .status(404)
          .json({ result: false, message: "Video not found" });
      }

      if (!videoObj.filename) {
        return res
          .status(400)
          .json({ result: false, message: "Video filename is missing" });
      }

      const result = await requestJobQueuerVideoMontageMaker(
        videoObj.filename,
        actionsArray,
        user,
        token,
      );

      if (result.success) {
        res.json({
          result: true,
          message: "Job queued successfully",
          data: result.data,
        });
      } else {
        res.status(result.status || 500).json({
          result: false,
          message: result.message || "Failed to queue montage job",
        });
      }
    } catch (error: any) {
      console.error("Error queuing montage job:", error);
      res.status(500).json({
        result: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
);

// 🔹 POST /videos/montage-service/video-completed-notify-user: Video montage completed
router.post(
  "/montage-service/video-completed-notify-user",
  authenticateToken,
  async (req: Request, res: Response) => {
    console.log("- in POST /montage-service/video-completed-notify-user");

    try {
      const { filename } = req.body;
      const userId = req.user.id;

      writeRequestArgs(req.body, "-04-montage-service");

      const user = await User.findByPk(userId);
      if (!user) {
        return res
          .status(404)
          .json({ result: false, message: "User not found" });
      }

      console.log(`filename: ${filename}`);
      console.log(`userId: ${userId}`);

      // 🔹 Send email notification
      const tokenizedFilename = tokenizeObject({ filename });

      await sendVideoMontageCompleteNotificationEmail(
        user.email,
        tokenizedFilename,
      );

      res.json({ result: true, message: "Email sent successfully" });
    } catch (error: any) {
      console.error("Error in video montage notification:", error);
      res.status(500).json({
        result: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
);

// 🔹 GET /videos/montage-service/play-video/:tokenizedMontageFilename: Play video montage in browser
router.get(
  "/montage-service/play-video/:tokenizedMontageFilename",
  (req: Request, res: Response) => {
    console.log(
      "- in GET /montage-service/play-video/:tokenizedMontageFilename",
    );

    const { tokenizedMontageFilename } = req.params;
    console.log("------ Check Token from play-video -----");
    console.log(tokenizedMontageFilename);
    console.log("------ ENDCheck Token from play-video -----");

    // 🔹 Verify token
    jwt.verify(
      tokenizedMontageFilename,
      process.env.JWT_SECRET!,
      (err: any, decoded: any) => {
        if (err) {
          return res
            .status(401)
            .json({ result: false, message: "Invalid token" });
        }

        const { filename } = decoded; // Extract full path
        console.log(`📂 Decoded filename: ${filename}`);

        const videoFilePathAndName = path.join(
          process.env.PATH_VIDEOS_MONTAGE_COMPLETE!,
          filename,
        );
        console.log(`📂 Video file path: ${videoFilePathAndName}`);

        // 🔹 Check if the file exists
        if (!fs.existsSync(videoFilePathAndName)) {
          return res
            .status(404)
            .json({ result: false, message: "File not found" });
        }

        // 🔹 Send the file
        res.sendFile(path.resolve(videoFilePathAndName), (err) => {
          if (err) {
            console.error("❌ Error sending file:", err);
            res
              .status(500)
              .json({ result: false, message: "Error sending file" });
          } else {
            console.log("✅ Video sent successfully");
          }
        });
      },
    );
  },
);

// 🔹 GET /videos/montage-service/download-video/:tokenizedMontageFilename: Download video montage
router.get(
  "/montage-service/download-video/:tokenizedMontageFilename",
  (req: Request, res: Response) => {
    console.log(
      "- in GET /montage-service/download-video/:tokenizedMontageFilename",
    );

    const { tokenizedMontageFilename } = req.params;

    // 🔹 Verify token
    jwt.verify(
      tokenizedMontageFilename,
      process.env.JWT_SECRET!,
      (err: any, decoded: any) => {
        if (err) {
          return res
            .status(401)
            .json({ result: false, message: "Invalid token" });
        }

        const { filename } = decoded; // Extract full path
        console.log(`📂 Decoded filename: ${filename}`);

        const videoFilePathAndName = path.join(
          process.env.PATH_VIDEOS_MONTAGE_COMPLETE!,
          filename,
        );

        // 🔹 Check if the file exists
        if (!fs.existsSync(videoFilePathAndName)) {
          return res
            .status(404)
            .json({ result: false, message: "File not found" });
        }

        // ✅ **Force Download Instead of Playing**
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${path.basename(videoFilePathAndName)}"`,
        );
        res.setHeader("Content-Type", "application/octet-stream");

        // ✅ **Send File**
        res.sendFile(path.resolve(videoFilePathAndName), (err) => {
          if (err) {
            console.error("❌ Error sending file:", err);
            if (!res.headersSent) {
              res
                .status(500)
                .json({ result: false, message: "Error sending file" });
            }
          } else {
            console.log("✅ Video sent successfully for download");
          }
        });
      },
    );
  },
);

// GET /videos/user
router.get("/user", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const videosArray = await Video.findAll({
      include: [
        {
          model: ContractTeamUser,
          where: { userId: user.id },
          attributes: ["id", "teamId", "userId"], // optional: include related info
        },
      ],
      where: { processingCompleted: true },
    });

    // Process videos to include match & team details
    const formattedVideos = await Promise.all(
      videosArray.map(async (video) => {
        const sessionData = await getSessionWithTeams(video.sessionId);
        return {
          ...video.get(), // Extract raw video data
          session: sessionData.success ? sessionData.session : null, // Include session data if successful
        };
      }),
    );

    res.json({ result: true, videosArray: formattedVideos });
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
