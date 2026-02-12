require("dotenv").config();
const path = require("path");
const yargs = require("yargs");
const uploadVideo = require("./modules/uploader");
// const fs = require("fs");
// const now = new Date().toISOString();
// fs.writeFileSync("status.txt", `Started at: ${now}\n`, { flag: "a" });

const argv = yargs
  .option("filename", {
    alias: "f",
    description: "Name of the video file to upload",
    type: "string",
    demandOption: true,
  })
  .option("videoId", {
    alias: "v",
    description: "ID of the video to upload",
    type: "string",
    demandOption: true,
  })
  .help()
  .alias("help", "h").argv;

const filePath = path.join(process.env.PATH_VIDEOS_UPLOADED, argv.filename);

// uploadVideo(filePath, argv.videoId)
//   .then(() => console.log("Upload completed!"))
//   .catch((err) => console.error("Upload failed:", err.message));
uploadVideo(filePath, argv.videoId)
  .then(() => {
    console.log("✅ Upload completed!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Upload failed:", err.message);
    process.exit(1);
  });
