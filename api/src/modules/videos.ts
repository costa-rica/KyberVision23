import multer from "multer";
import path from "path";
import fs from "fs";
import { Video } from "kybervision23db";
import ffmpeg from "fluent-ffmpeg";
import axios from "axios";
import { google } from "googleapis";

interface VideoDeleteResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface YouTubeProcessingResult {
  result: boolean;
  messageFromYouTubeQueuer: string;
}

interface MontageQueueResult {
  success: boolean;
  status?: number;
  message?: string;
  data?: any;
}

// Configure multer storage [cb = callback]
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.PATH_VIDEOS_UPLOADED!);
  },
  filename: (req, file, cb) => {
    const now = new Date();

    // Format the datetime as YYYYMMDD-HHMMSS
    const formattedDate = now.toISOString().split("T")[0].replace(/-/g, "");
    const formattedTime = now.toTimeString().split(" ")[0].replace(/:/g, "");
    const datetimeString = `${formattedDate}-${formattedTime}`;

    // Generate the complete filename
    const filename = `${datetimeString}${path.extname(file.originalname)}`;

    cb(null, filename);
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/quicktime"]; // quicktime for .mov
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only .mp4 and .mov are allowed."),
      );
    }
    cb(null, true);
  },
});

// ✅ New function to rename video files with desired format
export function renameVideoFile(
  videoId: number,
  sessionId: number,
  userId?: number,
): string {
  // Ensure the numbers are formatted with leading zeros
  const formattedVideoId = videoId.toString().padStart(4, "0");
  return `${process.env.PREFIX_VIDEO_FILE_NAME}-videoId${formattedVideoId}-sessionId${sessionId}.mp4`;
}

// need to update this with all the places the video could be
export async function deleteVideo(videoId: number): Promise<VideoDeleteResult> {
  try {
    const video = await Video.findByPk(videoId);
    if (!video) {
      return { success: false, error: "Video not found" };
    }

    if (!video.filename) {
      return { success: false, error: "Video filename is missing" };
    }

    const filePathToVideoFile = path.join(
      video.pathToVideoFile || process.env.PATH_VIDEOS_UPLOADED!,
      video.filename,
    );

    // Delete from original location
    fs.unlink(filePathToVideoFile, (err) => {
      if (err) {
        console.error(`❌ Error deleting file ${filePathToVideoFile}:`, err);
      }
    });

    // Delete from upload directory
    const filePathToVideoFileInUpload = path.join(
      process.env.PATH_VIDEOS_UPLOADED!,
      video.filename,
    );

    fs.unlink(filePathToVideoFileInUpload, (err) => {
      if (err) {
        console.error(
          `❌ Error deleting file ${filePathToVideoFileInUpload}:`,
          err,
        );
      }
    });

    await video.destroy();
    return { success: true, message: "Video deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting video:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteVideoFromYouTube(
  videoId: number,
): Promise<VideoDeleteResult> {
  try {
    const video = await Video.findByPk(videoId);

    if (!video || !video.youTubeVideoId) {
      throw new Error("Video not found or has no YouTube ID");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    console.log(`YouTube video ID: ${video.youTubeVideoId}`);
    await youtube.videos.delete({
      id: video.youTubeVideoId,
    });

    console.log(`✅ Deleted YouTube video ID: ${video.youTubeVideoId}`);
    return { success: true, message: "YouTube video deleted successfully" };
  } catch (err: any) {
    console.log(
      "Error (not critical) deleting video from YouTube:",
      err.message,
    );
    return { success: false, error: err.message };
  }
}

export async function requestJobQueuerVideoUploaderYouTubeProcessing(
  filename: string,
  videoId: number,
): Promise<YouTubeProcessingResult> {
  try {
    const response = await fetch("http://localhost:8003/youtube-uploader/add", {
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
    console.log("✅ Queuer YouTube response:", responseJson);

    return {
      result: true,
      messageFromYouTubeQueuer: "YouTube video uploaded successfully",
    };
  } catch (err: any) {
    console.error("❌ Error contacting YouTube Queuer:", err.message);

    return {
      result: false,
      messageFromYouTubeQueuer: `Is KyberVisionQueuer running? Error from attempt to contact Queuer: ${err.message}`,
    };
  }
}

export async function requestJobQueuerVideoMontageMaker(
  filename: string,
  actionsArray: any[],
  user: any,
  token: string,
): Promise<MontageQueueResult> {
  try {
    const response = await fetch(
      `${process.env.URL_KV_JOB_QUEUER}/video-montage-maker/add`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          actionsArray,
          user,
          token,
        }),
      },
    );

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
    } catch (err) {
      resultData = resultText; // fallback if response is not JSON
    }

    return {
      success: true,
      status: response.status,
      data: resultData,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 500,
      message: `Error contacting montage queuer: ${err.message}`,
    };
  }
}
