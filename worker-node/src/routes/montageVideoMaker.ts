import express, { Request, Response } from "express";
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import logger from "../modules/logger";
import { createVideoMontage } from "../modules/videoMontageService";

const router = express.Router();

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Define the queue
const montageQueue = new Queue(
  process.env.NAME_KV_VIDEO_MONTAGE_MAKER_QUEUE as string,
  { connection: redisConnection }
);

// Create the worker to process montage jobs
const worker = new Worker(
  process.env.NAME_KV_VIDEO_MONTAGE_MAKER_QUEUE as string,
  async (job: Job) => {
    logger.info(`🎬 Starting Montage Job ID: ${job.id}`);
    const { filename, actionsArray, token, user } = job.data;

    await createVideoMontage(
      filename,
      actionsArray,
      user,
      token,
      async (progress: number, message: string) => {
        await job.updateProgress(progress);
        await job.log(message);
        logger.info(`🎬 Montage progress ${progress}%: ${message}`);
      }
    );

    return { success: true };
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

worker.on("completed", (job: Job) => {
  logger.info(`✅ Montage Job ${job.id} completed`);
});

worker.on("failed", (job: Job | undefined, err: Error) => {
  logger.error(`❌ Montage Job ${job?.id} failed: ${err.message}`);
});

// POST /video-montage-maker/add
router.post("/add", async (req: Request, res: Response) => {
  try {
    const { filename, actionsArray, token, user } = req.body;

    const job = await montageQueue.add(
      "montage-job",
      { filename, actionsArray, token, user },
      {
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    logger.info(`📥 Job added to montage queue with ID: ${job.id}`);
    res.status(200).json({ message: "Montage job added", jobId: job.id });
  } catch (error: any) {
    logger.error("❌ Error adding montage job:", error.message);
    res.status(500).json({ error: "Failed to queue montage job" });
  }
});

export default router;
