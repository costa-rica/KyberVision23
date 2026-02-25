"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.renameVideoFile = renameVideoFile;
exports.deleteVideo = deleteVideo;
exports.deleteVideoFromYouTube = deleteVideoFromYouTube;
exports.requestJobQueuerVideoUploaderYouTubeProcessing = requestJobQueuerVideoUploaderYouTubeProcessing;
exports.requestJobQueuerVideoMontageMaker = requestJobQueuerVideoMontageMaker;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("@kybervision/db");
const googleapis_1 = require("googleapis");
const logger_1 = __importDefault(require("../modules/logger"));
// Configure multer storage [cb = callback]
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.PATH_VIDEOS_UPLOADED);
    },
    filename: (req, file, cb) => {
        const now = new Date();
        // Format the datetime as YYYYMMDD-HHMMSS
        const formattedDate = now.toISOString().split("T")[0].replace(/-/g, "");
        const formattedTime = now.toTimeString().split(" ")[0].replace(/:/g, "");
        const datetimeString = `${formattedDate}-${formattedTime}`;
        // Generate the complete filename
        const filename = `${datetimeString}${path_1.default.extname(file.originalname)}`;
        cb(null, filename);
    },
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["video/mp4", "video/quicktime"]; // quicktime for .mov
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type. Only .mp4 and .mov are allowed."));
        }
        cb(null, true);
    },
});
// ✅ New function to rename video files with desired format
function renameVideoFile(videoId, sessionId, userId) {
    // Ensure the numbers are formatted with leading zeros
    const formattedVideoId = videoId.toString().padStart(4, "0");
    return `${process.env.PREFIX_VIDEO_FILE_NAME}-videoId${formattedVideoId}-sessionId${sessionId}.mp4`;
}
// need to update this with all the places the video could be
async function deleteVideo(videoId) {
    try {
        const video = await db_1.Video.findByPk(videoId);
        if (!video) {
            return { success: false, error: "Video not found" };
        }
        if (!video.filename) {
            return { success: false, error: "Video filename is missing" };
        }
        const filePathToVideoFile = path_1.default.join(video.pathToVideoFile || process.env.PATH_VIDEOS_UPLOADED, video.filename);
        // Delete from original location
        fs_1.default.unlink(filePathToVideoFile, (err) => {
            if (err) {
                logger_1.default.error(`❌ Error deleting file ${filePathToVideoFile}:`, err);
            }
        });
        // Delete from upload directory
        const filePathToVideoFileInUpload = path_1.default.join(process.env.PATH_VIDEOS_UPLOADED, video.filename);
        fs_1.default.unlink(filePathToVideoFileInUpload, (err) => {
            if (err) {
                logger_1.default.error(`❌ Error deleting file ${filePathToVideoFileInUpload}:`, err);
            }
        });
        await video.destroy();
        return { success: true, message: "Video deleted successfully" };
    }
    catch (error) {
        logger_1.default.error("Error deleting video:", error);
        return { success: false, error: error.message };
    }
}
async function deleteVideoFromYouTube(videoId) {
    try {
        const video = await db_1.Video.findByPk(videoId);
        if (!video || !video.youTubeVideoId) {
            throw new Error("Video not found or has no YouTube ID");
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID, process.env.YOUTUBE_CLIENT_SECRET, process.env.YOUTUBE_REDIRECT_URI);
        oauth2Client.setCredentials({
            refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
        });
        const youtube = googleapis_1.google.youtube({
            version: "v3",
            auth: oauth2Client,
        });
        logger_1.default.info(`YouTube video ID: ${video.youTubeVideoId}`);
        await youtube.videos.delete({
            id: video.youTubeVideoId,
        });
        logger_1.default.info(`✅ Deleted YouTube video ID: ${video.youTubeVideoId}`);
        return { success: true, message: "YouTube video deleted successfully" };
    }
    catch (err) {
        logger_1.default.info("Error (not critical) deleting video from YouTube:", err.message);
        return { success: false, error: err.message };
    }
}
async function requestJobQueuerVideoUploaderYouTubeProcessing(filename, videoId) {
    try {
        const url = `${process.env.URL_KV_JOB_QUEUER}/youtube-uploader/add`;
        logger_1.default.info(`Sending YouTube upload job request to: ${url}`);
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filename,
                videoId,
                queueName: process.env.YOUTUBE_UPLOADER_QUEUE_NAME,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`❌ Failed to queue YouTube upload job: ${text}`);
        }
        const responseJson = await response.json();
        logger_1.default.info("✅ Queuer YouTube response:", responseJson);
        return {
            result: true,
            messageFromYouTubeQueuer: "YouTube video uploaded successfully",
        };
    }
    catch (err) {
        logger_1.default.error("❌ Error contacting YouTube Queuer:", err.message);
        return {
            result: false,
            messageFromYouTubeQueuer: `Is KyberVisionQueuer running? Error from attempt to contact Queuer: ${err.message}`,
        };
    }
}
async function requestJobQueuerVideoMontageMaker(filename, actionsArray, user, token) {
    try {
        const response = await fetch(`${process.env.URL_KV_JOB_QUEUER}/video-montage-maker/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filename,
                actionsArray,
                user,
                token,
            }),
        });
        const resultText = await response.text(); // handle both JSON and text
        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: `Queuer responded with error: ${resultText}`,
            };
        }
        let resultData;
        try {
            resultData = JSON.parse(resultText);
        }
        catch (err) {
            resultData = resultText; // fallback if response is not JSON
        }
        return {
            success: true,
            status: response.status,
            data: resultData,
        };
    }
    catch (err) {
        return {
            success: false,
            status: 500,
            message: `Error contacting montage queuer: ${err.message}`,
        };
    }
}
