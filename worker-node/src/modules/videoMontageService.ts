import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import logger from "./logger";
import { notifyVideoMontageComplete } from "./videoMontageApi";

const WATERMARK_FILENAME = "KyberV2Shiny.png";

function resolveRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

async function cleanupClipsFolder(clipsPath: string): Promise<void> {
  try {
    const files = await fs.promises.readdir(clipsPath);
    for (const file of files) {
      const filePath = path.join(clipsPath, file);
      await fs.promises.unlink(filePath);
      logger.info(`🗑️ Deleted: ${filePath}`);
    }
    logger.info("✅ All temporary clips deleted");
  } catch (error: any) {
    logger.error(`❌ Error cleaning up clips folder: ${error?.message}`);
  }
}

async function addWatermarkToVideo(inputVideoPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputVideoPath)) {
      return reject(new Error(`Input video not found: ${inputVideoPath}`));
    }

    const watermarkImage = path.join(
      __dirname,
      "..",
      "..",
      "assets",
      WATERMARK_FILENAME
    );

    if (!fs.existsSync(watermarkImage)) {
      return reject(new Error(`Watermark image not found: ${watermarkImage}`));
    }

    const outputVideoPath = inputVideoPath.replace(/\.mp4$/, "_watermarked.mp4");

    ffmpeg(inputVideoPath)
      .input(watermarkImage)
      .complexFilter(["[0:v][1:v] overlay=10:main_h-overlay_h-10"])
      .output(outputVideoPath)
      .on("start", (cmd) => logger.info(`🚀 FFmpeg Command: ${cmd}`))
      .on("end", () => {
        logger.info(`✅ Watermarked video created: ${outputVideoPath}`);
        resolve(outputVideoPath);
      })
      .on("error", (err) => {
        logger.error(`❌ Error adding watermark: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

export async function createVideoMontage(
  filename: string,
  actionsArray: Array<{ timestamp: number }>,
  user: Record<string, unknown>,
  token: string,
  onProgress?: (progress: number, message: string) => Promise<void> | void
): Promise<void> {
  logger.info("🎬 Create video montage started");

  const uploadedVideosPath = resolveRequiredEnv("PATH_VIDEOS_UPLOADED");
  const clipsPath = resolveRequiredEnv("PATH_VIDEOS_MONTAGE_CLIPS");
  const outputPath = resolveRequiredEnv("PATH_VIDEOS_MONTAGE_COMPLETE");

  const videoFilePathAndName = path.join(uploadedVideosPath, filename);

  if (!fs.existsSync(videoFilePathAndName)) {
    throw new Error(`Source video file not found: ${videoFilePathAndName}`);
  }

  if (!Array.isArray(actionsArray) || actionsArray.length === 0) {
    throw new Error("No timestamps provided for montage creation");
  }

  [clipsPath, outputPath].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const clipFilePaths: string[] = [];

  if (onProgress) {
    await onProgress(10, "Starting clip extraction");
  }

  for (let i = 0; i < actionsArray.length; i++) {
    const timestamp = actionsArray[i].timestamp;
    const clipStart = Math.max(timestamp - 1.5, 0);
    const clipDuration = 3.0;
    const clipFilePath = path.join(clipsPath, `${i + 1}.mp4`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoFilePathAndName)
        .setStartTime(clipStart)
        .setDuration(clipDuration)
        .output(clipFilePath)
        .on("end", () => {
          clipFilePaths.push(clipFilePath);
          resolve();
        })
        .on("error", reject)
        .run();
    });
  }

  if (onProgress) {
    await onProgress(45, "Clip extraction complete");
  }

  const montageVideoFilename = `montage_${Date.now()}.mp4`;
  const finalOutputPath = path.join(outputPath, montageVideoFilename);
  const fileListPath = path.join(clipsPath, "file_list.txt");

  fs.writeFileSync(
    fileListPath,
    clipFilePaths.map((file) => `file '${file}'`).join("\n")
  );

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(fileListPath)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .output(finalOutputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });

  if (onProgress) {
    await onProgress(70, "Montage merge complete");
  }

  const watermarkedVideoPath = await addWatermarkToVideo(finalOutputPath);

  if (onProgress) {
    await onProgress(85, "Watermark applied");
  }

  await notifyVideoMontageComplete(path.basename(watermarkedVideoPath), user, token);

  if (onProgress) {
    await onProgress(100, "Montage creation complete");
  }

  await cleanupClipsFolder(clipsPath);
}
