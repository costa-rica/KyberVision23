const fs = require("fs");
const { google } = require("googleapis");
// const { Video } = require("kybervision23db");
// ⭐ import initModels alongside Video
const { initModels, Video, sequelize } = require("kybervision23db");

async function uploadVideo(filePath, videoId) {
  // BEFORE calling any Video.* methods:
  // -- this is needed to initialize the db from the kybervision23db package
  initModels();
  console.log("✅ initModels() is called successfully.");
  try {
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

    const fileSize = fs.statSync(filePath).size;
    const fileName = filePath.split("/").pop();

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: fileName,
          description: "Uploaded by KyberVision23YouTubeUploader",
        },
        status: {
          privacyStatus: "unlisted",
        },
      },
      media: {
        body: fs.createReadStream(filePath),
      },
    });

    console.log("YouTubeVideo ID:", res.data.id);
    console.log("KV Video ID:", videoId);
    const uploadedVideo = await Video.findByPk(videoId);
    uploadedVideo.youTubeVideoId = res.data.id;
    uploadedVideo.processingCompleted = true;
    await uploadedVideo.save();
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    console.error(err.stack);
    throw err; // Let index.js decide whether to call process.exit(1)
  }
}

module.exports = uploadVideo;

// const fs = require("fs");
// const { google } = require("googleapis");
// const { Video } = require("kybervision18db");

// async function uploadVideo(filePath, videoId) {
//   const oauth2Client = new google.auth.OAuth2(
//     process.env.YOUTUBE_CLIENT_ID,
//     process.env.YOUTUBE_CLIENT_SECRET,
//     process.env.YOUTUBE_REDIRECT_URI
//   );

//   oauth2Client.setCredentials({
//     refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
//   });

//   const youtube = google.youtube({
//     version: "v3",
//     auth: oauth2Client,
//   });

//   const fileSize = fs.statSync(filePath).size;
//   const fileName = filePath.split("/").pop();

//   const res = await youtube.videos.insert({
//     part: ["snippet", "status"],
//     requestBody: {
//       snippet: {
//         title: fileName,
//         description: "Uploaded by KyberVision18YouTubeUploader",
//       },
//       status: {
//         privacyStatus: "unlisted",
//       },
//     },
//     media: {
//       body: fs.createReadStream(filePath),
//     },
//   });

//   console.log("YouTubeVideo ID:", res.data.id);
//   console.log("KV Video ID:", videoId);
//   const uploadedVideo = await Video.findByPk(videoId);
//   uploadedVideo.youTubeVideoId = res.data.id;
//   uploadedVideo.processingCompleted = true;
//   await uploadedVideo.save();
// }

// module.exports = uploadVideo;
