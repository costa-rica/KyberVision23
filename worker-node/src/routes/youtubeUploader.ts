import express, { Request, Response } from "express";
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { Video } from "@kybervision/db";
import logger from "../modules/logger";
import { uploadVideo } from "../modules/youtubeUploadService";

const router = express.Router();

const QUEUE_NAME = process.env.YOUTUBE_UPLOADER_QUEUE_NAME as string;

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Define the queue
const youtubeUploadQueue = new Queue(QUEUE_NAME, { connection: redisConnection });

// Create a worker to process jobs from the queue
const worker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { filename, videoId } = job.data;

    logger.info(`⚙️ Starting YouTube upload job ID: ${job.id}`);
    logger.info(`filename: ${filename}`);
    logger.info(`videoId: ${videoId}`);

    await job.updateProgress(10);
    await job.log(`Job started — file: ${filename}, videoId: ${videoId}`);

    try {
      await job.updateProgress(25);
      await job.log("OAuth2 client configured, beginning upload");

      const youTubeVideoId = await uploadVideo(filename, videoId);

      await job.updateProgress(100);
      await job.log(`Upload complete — YouTube video ID: ${youTubeVideoId}`);

      return { success: true, youTubeVideoId };
    } catch (err: any) {
      logger.error(`Upload failed for videoId ${videoId}: ${err.message}`);
      await job.log(`Upload failed: ${err.message}`);

      const uploadedVideo = await Video.findByPk(videoId);
      if (uploadedVideo) {
        uploadedVideo.processingFailed = true;
        await uploadedVideo.save();
      }

      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

worker.on("completed", (job: Job) => {
  logger.info(`🎉 Job ${job.id} has been completed!`);
});

worker.on("failed", (job: Job | undefined, err: Error) => {
  logger.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

// POST /youtube-uploader/add
router.post("/add", async (req: Request, res: Response) => {
  try {
    let { filename, videoId, queueName } = req.body;

    if (!queueName) {
      logger.error("- No queue name provided, assigning default name");
      queueName = QUEUE_NAME;
    }

    logger.info(`Adding job to queue: ${queueName}`);

    const dynamicQueue = new Queue(queueName, { connection: redisConnection });

    const job = await dynamicQueue.add(
      "youtube-upload-job",
      { filename, videoId },
      {
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    logger.info(`Job added to queue '${queueName}' with ID: ${job.id}`);
    res.status(200).json({ message: "Job triggered successfully!", jobId: job.id });
  } catch (error: any) {
    logger.error(`❌ Error triggering job: ${error.message}`);
    res.status(500).json({ error: "Error triggering job" });
  }
});

export default router;
