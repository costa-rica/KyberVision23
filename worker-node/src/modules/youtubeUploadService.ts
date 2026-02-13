// youtubeUploadService.ts — KyberVision23Queuer
// Native TypeScript port of KyberVision22YouTubeUploader/modules/uploader.js.
// Uploads a video file to YouTube via OAuth2 and updates the Video record in
// the database with the resulting YouTube video ID.

import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { Video } from "@kybervision/db";
import logger from "./logger";

/**
 * Uploads a video file to YouTube and updates the corresponding Video record.
 *
 * @param filename - The video filename (resolved against PATH_VIDEOS_UPLOADED)
 * @param videoId  - The primary key of the Video record to update on completion
 * @returns        The YouTube video ID assigned by the API
 */
export async function uploadVideo(
  filename: string,
  videoId: number,
): Promise<string> {
  const filePath = path.join(
    process.env.PATH_VIDEOS_UPLOADED as string,
    filename,
  );

  logger.info(`Starting YouTube upload — file: ${filename}, videoId: ${videoId}`);

  // --- OAuth2 setup ---------------------------------------------------------
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI,
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  // --- Upload ---------------------------------------------------------------
  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: filename,
        description: "Uploaded by KyberVision23",
      },
      status: {
        privacyStatus: "unlisted",
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  const youTubeVideoId = res.data.id as string;
  logger.info(`YouTube upload complete — YouTube ID: ${youTubeVideoId}, videoId: ${videoId}`);

  // --- Database update ------------------------------------------------------
  const uploadedVideo = await Video.findByPk(videoId);
  if (!uploadedVideo) {
    throw new Error(`Video record not found for videoId: ${videoId}`);
  }

  uploadedVideo.youTubeVideoId = youTubeVideoId;
  uploadedVideo.processingCompleted = true;
  await uploadedVideo.save();

  logger.info(`Video record updated in database for videoId: ${videoId}`);

  return youTubeVideoId;
}
