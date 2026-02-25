"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuthentication_1 = require("../modules/userAuthentication");
const db_1 = require("@kybervision/db");
const sessions_1 = require("../modules/sessions");
const videos_1 = require("../modules/videos");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mailer_1 = require("../modules/mailer");
const common_1 = require("../modules/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../modules/logger"));
const router = express_1.default.Router();
// Video file naming convention
// ${process.env.PREFIX_VIDEO_FILE_NAME}_videoId${video.id}_sessionId${video.sessionId}.mp4
// 🔹 GET /videos/ - Get All Videos with Match Data
router.get("/", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in GET /api/videos`);
    const user = req.user;
    try {
        // Fetch all videos with associated match data
        const videos = await db_1.Video.findAll();
        // Process videos to include match & team details
        const formattedVideos = await Promise.all(videos.map(async (video) => {
            const sessionData = await (0, sessions_1.getSessionWithTeams)(video.sessionId);
            return Object.assign(Object.assign({}, video.get()), { session: sessionData.success ? sessionData.session : null });
        }));
        res.json({ result: true, videosArray: formattedVideos });
    }
    catch (error) {
        logger_1.default.error("Error fetching videos:", error);
        res.status(500).json({
            result: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
// 🔹 GET /videos/team/:teamId - Get All Team Videos with Match Data
router.get("/team/:teamId", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in GET /api/videos/team/:teamId`);
    try {
        const teamId = Number(req.params.teamId);
        logger_1.default.info(`teamId: ${teamId}`);
        // Fetch videos whose contractTeamUser is associated with the given teamId
        const videosArray = await db_1.Video.findAll({
            include: [
                {
                    model: db_1.ContractTeamUser,
                    where: { teamId },
                    attributes: ["id", "teamId", "userId"], // optional: include related info
                },
            ],
            where: { processingCompleted: true },
        });
        // Process videos to include match & team details
        const formattedVideos = await Promise.all(videosArray.map(async (video) => {
            const sessionData = await (0, sessions_1.getSessionWithTeams)(video.sessionId);
            return Object.assign(Object.assign({}, video.get()), { session: sessionData.success ? sessionData.session : null });
        }));
        res.json({ result: true, videosArray: formattedVideos });
    }
    catch (error) {
        logger_1.default.error("Error fetching videos:", error);
        res.status(500).json({
            result: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
// 🔹 POST /videos/upload-youtube
router.post("/upload-youtube", userAuthentication_1.authenticateToken, videos_1.upload.single("video"), async (req, res) => {
    logger_1.default.info("- in POST /videos/upload-youtube");
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
        const session = await db_1.Session.findByPk(Number(sessionId));
        if (!session) {
            return res.status(404).json({
                result: false,
                message: "Session not found",
            });
        }
        // Verify user is associated with teamId in ContractTeamUser
        const contractTeamUser = await db_1.ContractTeamUser.findOne({
            where: {
                teamId: session.teamId,
                userId: user.id,
            },
        });
        if (!contractTeamUser) {
            return res.status(403).json({
                result: false,
                message: "User does not have privileges to upload video for this session",
            });
        }
        const contractTeamUserId = contractTeamUser.id;
        // Step 2: Get video file size in MB
        const fileSizeBytes = req.file.size;
        const fileSizeMb = (fileSizeBytes / (1024 * 1024)).toFixed(2);
        logger_1.default.info(`📁 Video File Size: ${fileSizeMb} MB`);
        // Step 3: Create video entry with placeholder URL & file size
        const newVideo = await db_1.Video.create({
            sessionId: Number(sessionId),
            filename: req.file.filename,
            url: "placeholder",
            videoFileSizeInMb: Number(fileSizeMb),
            pathToVideoFile: process.env.PATH_VIDEOS_UPLOADED,
            originalVideoFilename: req.file.originalname,
            contractTeamUserId: contractTeamUserId,
        });
        // Step 3.1: Rename the uploaded file
        const renamedFilename = (0, videos_1.renameVideoFile)(newVideo.id, Number(sessionId), user.id);
        const renamedFilePath = path_1.default.join(process.env.PATH_VIDEOS_UPLOADED, renamedFilename);
        // Step 3.2: Rename the file
        fs_1.default.renameSync(path_1.default.join(process.env.PATH_VIDEOS_UPLOADED, req.file.filename), renamedFilePath);
        await newVideo.update({
            filename: renamedFilename,
        });
        // Step 4: Generate and update video URL
        const videoURL = `https://${req.get("host")}/videos/${newVideo.id}`;
        await newVideo.update({ url: videoURL });
        // Step 5: Create ContractVideoActions for each action
        // Get all scripts for session
        const scriptsArray = await db_1.Script.findAll({
            where: { sessionId: Number(sessionId) },
        });
        const actionsArray = await db_1.Action.findAll({
            where: { scriptId: scriptsArray.map((script) => script.id) },
        });
        // Create ContractVideoActions for each action
        for (let i = 0; i < actionsArray.length; i++) {
            const action = actionsArray[i];
            await db_1.ContractVideoAction.create({
                actionId: action.id,
                videoId: newVideo.id,
            });
        }
        const videoId = newVideo.id;
        // Step 6: spawn KyberVision14YouTuber child process
        const { result, messageFromYouTubeQueuer } = await (0, videos_1.requestJobQueuerVideoUploaderYouTubeProcessing)(renamedFilename, videoId);
        if (!result) {
            await newVideo.update({
                processingFailed: true,
            });
            return res
                .status(400)
                .json({ result: false, message: messageFromYouTubeQueuer });
        }
        return res.json({ result: true, message: "All good." });
    }
    catch (error) {
        logger_1.default.error("Error in video upload:", error);
        res.status(500).json({
            result: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
// 🔹 DELETE /videos/:videoId
router.delete("/:videoId", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const videoId = Number(req.params.videoId);
        const { success: successYouTube, message: messageYouTube, error: errorYouTube, } = await (0, videos_1.deleteVideoFromYouTube)(videoId);
        logger_1.default.info(`YouTube delete response: ${JSON.stringify({
            successYouTube,
            messageYouTube,
            errorYouTube,
        })}`);
        if (!successYouTube) {
            logger_1.default.info("-- No YouTube video to delete");
        }
        const { success, message, error } = await (0, videos_1.deleteVideo)(videoId);
        if (!success) {
            return res.status(404).json({ error });
        }
        res.status(200).json({ message });
    }
    catch (error) {
        logger_1.default.error("Error in DELETE /videos/:videoId:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// 🔹 POST /videos/montage-service/queue-a-job: Queue a job to process a video montage
router.post("/montage-service/queue-a-job", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("Received request to queue a job...");
    try {
        const { videoId, actionsArray, token } = req.body;
        const user = req.user;
        const videoObj = await db_1.Video.findByPk(Number(videoId));
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
        const result = await (0, videos_1.requestJobQueuerVideoMontageMaker)(videoObj.filename, actionsArray, user, token);
        if (result.success) {
            res.json({
                result: true,
                message: "Job queued successfully",
                data: result.data,
            });
        }
        else {
            res.status(result.status || 500).json({
                result: false,
                message: result.message || "Failed to queue montage job",
            });
        }
    }
    catch (error) {
        logger_1.default.error("Error queuing montage job:", error);
        res.status(500).json({
            result: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
// 🔹 POST /videos/montage-service/video-completed-notify-user: Video montage completed
router.post("/montage-service/video-completed-notify-user", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- in POST /montage-service/video-completed-notify-user");
    try {
        const { filename } = req.body;
        const userId = req.user.id;
        (0, common_1.writeRequestArgs)(req.body, "-04-montage-service");
        const user = await db_1.User.findByPk(userId);
        if (!user) {
            return res
                .status(404)
                .json({ result: false, message: "User not found" });
        }
        logger_1.default.info(`filename: ${filename}`);
        logger_1.default.info(`userId: ${userId}`);
        // 🔹 Send email notification
        const tokenizedFilename = (0, userAuthentication_1.tokenizeObject)({ filename });
        await (0, mailer_1.sendVideoMontageCompleteNotificationEmail)(user.email, tokenizedFilename);
        res.json({ result: true, message: "Email sent successfully" });
    }
    catch (error) {
        logger_1.default.error("Error in video montage notification:", error);
        res.status(500).json({
            result: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
// 🔹 GET /videos/montage-service/play-video/:tokenizedMontageFilename: Play video montage in browser
router.get("/montage-service/play-video/:tokenizedMontageFilename", (req, res) => {
    logger_1.default.info("- in GET /montage-service/play-video/:tokenizedMontageFilename");
    const { tokenizedMontageFilename } = req.params;
    logger_1.default.info("------ Check Token from play-video -----");
    logger_1.default.info(tokenizedMontageFilename);
    logger_1.default.info("------ ENDCheck Token from play-video -----");
    // 🔹 Verify token
    jsonwebtoken_1.default.verify(tokenizedMontageFilename, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res
                .status(401)
                .json({ result: false, message: "Invalid token" });
        }
        const { filename } = decoded; // Extract full path
        logger_1.default.info(`📂 Decoded filename: ${filename}`);
        const videoFilePathAndName = path_1.default.join(process.env.PATH_VIDEOS_MONTAGE_COMPLETE, filename);
        logger_1.default.info(`📂 Video file path: ${videoFilePathAndName}`);
        // 🔹 Check if the file exists
        if (!fs_1.default.existsSync(videoFilePathAndName)) {
            return res
                .status(404)
                .json({ result: false, message: "File not found" });
        }
        // 🔹 Send the file
        res.sendFile(path_1.default.resolve(videoFilePathAndName), (err) => {
            if (err) {
                logger_1.default.error("❌ Error sending file:", err);
                res
                    .status(500)
                    .json({ result: false, message: "Error sending file" });
            }
            else {
                logger_1.default.info("✅ Video sent successfully");
            }
        });
    });
});
// 🔹 GET /videos/montage-service/download-video/:tokenizedMontageFilename: Download video montage
router.get("/montage-service/download-video/:tokenizedMontageFilename", (req, res) => {
    logger_1.default.info("- in GET /montage-service/download-video/:tokenizedMontageFilename");
    const { tokenizedMontageFilename } = req.params;
    // 🔹 Verify token
    jsonwebtoken_1.default.verify(tokenizedMontageFilename, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res
                .status(401)
                .json({ result: false, message: "Invalid token" });
        }
        const { filename } = decoded; // Extract full path
        logger_1.default.info(`📂 Decoded filename: ${filename}`);
        const videoFilePathAndName = path_1.default.join(process.env.PATH_VIDEOS_MONTAGE_COMPLETE, filename);
        // 🔹 Check if the file exists
        if (!fs_1.default.existsSync(videoFilePathAndName)) {
            return res
                .status(404)
                .json({ result: false, message: "File not found" });
        }
        // ✅ **Force Download Instead of Playing**
        res.setHeader("Content-Disposition", `attachment; filename="${path_1.default.basename(videoFilePathAndName)}"`);
        res.setHeader("Content-Type", "application/octet-stream");
        // ✅ **Send File**
        res.sendFile(path_1.default.resolve(videoFilePathAndName), (err) => {
            if (err) {
                logger_1.default.error("❌ Error sending file:", err);
                if (!res.headersSent) {
                    res
                        .status(500)
                        .json({ result: false, message: "Error sending file" });
                }
            }
            else {
                logger_1.default.info("✅ Video sent successfully for download");
            }
        });
    });
});
// GET /videos/user
router.get("/user", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const videosArray = await db_1.Video.findAll({
            include: [
                {
                    model: db_1.ContractTeamUser,
                    where: { userId: user.id },
                    attributes: ["id", "teamId", "userId"], // optional: include related info
                },
            ],
            where: { processingCompleted: true },
        });
        // Process videos to include match & team details
        const formattedVideos = await Promise.all(videosArray.map(async (video) => {
            const sessionData = await (0, sessions_1.getSessionWithTeams)(video.sessionId);
            return Object.assign(Object.assign({}, video.get()), { session: sessionData.success ? sessionData.session : null });
        }));
        res.json({ result: true, videosArray: formattedVideos });
    }
    catch (error) {
        logger_1.default.error("Error fetching videos:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
