const app = require("./app"); // Import the configured app
const PORT = process.env.PORT || 8003;
const NAME_APP = process.env.NAME_APP || "KyberVision23Queuer";

// Override logger.info and logger.error to include the app name
logger.info = (
  (log) => (message) =>
    log(`[${NAME_APP}] ${message}`)
)(logger.info);

logger.error = (
  (log) => (message) =>
    log(`[${NAME_APP}] ${message}`)
)(logger.error);

// Capture stack traces for errors
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(`Stack Trace:\n${err.stack}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at:`, promise);
  logger.error(`Reason:`, reason);
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`✅ Server running at http://0.0.0.0:${PORT}`);
});
