import express, { Request, Response } from "express";
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import path from "path";
import { spawn } from "child_process";
import { Video } from "@kybervision/db";
import logger from "../modules/logger";

const router = express.Router();

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Define the queue
const youtubeUploadQueue = new Queue(
  process.env.YOUTUBE_UPLOADER_QUEUE_NAME as string,
  { connection: redisConnection }
);

// Create a worker to process jobs from the queue
const worker = new Worker(
  process.env.YOUTUBE_UPLOADER_QUEUE_NAME as string,
  async (job: Job) => {
    logger.info(`⚙️ Starting Job ID: ${job.id}`);

    const { filename, videoId } = job.data;

    logger.info("--- New Logging ---");
    logger.info(`filename: ${filename}`);
    logger.info(`videoId: ${videoId}`);

    const child = spawn(
      "node",
      ["index.js", "--filename", filename, "--videoId", videoId],
      {
        cwd: path.join(process.env.PATH_TO_YOUTUBE_UPLOADER_SERVICE as string),
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let progress = 0;
    const totalSteps = 5;

    child.stdout.on("data", async (data: Buffer) => {
      const message = data.toString().trim();
      logger.info(`Microservice Output: ${message}`);
      if (message) {
        progress += 1;
        await job.updateProgress((progress / totalSteps) * 100);
        await job.log(message);
      }
    });

    child.stderr.on("data", async (data: Buffer) => {
      logger.error(`Microservice Error: ${data}`);
      const uploadedVideo = await Video.findByPk(videoId);
      if (uploadedVideo) {
        uploadedVideo.processingFailed = true;
        await uploadedVideo.save();
      }
      await job.log(`Microservice Error: ${data}`);
    });

    return new Promise<{ success: boolean }>((resolve, reject) => {
      child.on("close", (code: number | null) => {
        logger.info(`Microservice exited with code ${code}`);
        if (code === 0) {
          resolve({ success: true });
        } else {
          reject(new Error(`Microservice failed with code ${code}`));
        }
      });
    });
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
      queueName = process.env.YOUTUBE_UPLOADER_QUEUE_NAME;
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
    logger.error("❌ Error triggering job:", error.message);
    res.status(500).json({ error: "Error triggering job" });
  }
});

export default router;
