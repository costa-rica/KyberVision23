// app.ts — KyberVision23Queuer
// "dotenv/config" must be the first import so env vars are loaded before the
// logger singleton is initialized.
import "dotenv/config";
import logger from "./modules/logger";

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { Queue } from "bullmq";
import Redis from "ioredis";

import usersRouter from "./routes/users";
import montageVideoMakerRouter from "./routes/montageVideoMaker";
import youtubeUploaderRouter from "./routes/youtubeUploader";

const app = express();

app.use(cors());

// HTTP request logging — disabled for Bull Board dashboard routes to reduce noise
app.use((req, res, next) => {
  if (req.path.startsWith("/dashboard")) {
    return next();
  }
  return morgan("dev")(req, res, next);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Increase payload size for large files
app.use(express.json({ limit: "6gb" }));
app.use(express.urlencoded({ limit: "6gb", extended: true }));

// Redis Connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Define Queues
const montageQueue = new Queue(
  process.env.NAME_KV_VIDEO_MONTAGE_MAKER_QUEUE as string,
  { connection: redisConnection }
);
const youtubeUploadQueue = new Queue("KyberVision23YouTubeUploader", {
  connection: redisConnection,
});

// Bull Board setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/dashboard");

createBullBoard({
  queues: [
    new BullMQAdapter(montageQueue),
    new BullMQAdapter(youtubeUploadQueue),
  ],
  serverAdapter,
});

// Dashboard route must be registered before all other routes
app.use("/dashboard", serverAdapter.getRouter());

// Application routes
app.use("/users", usersRouter);
app.use("/video-montage-maker", montageVideoMakerRouter);
app.use("/youtube-uploader", youtubeUploaderRouter);

export default app;
