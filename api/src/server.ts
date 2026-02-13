import app from "./app"; // Import the configured app
import logger from "./modules/logger";

const PORT = parseInt(process.env.PORT || "3000", 10);
const NAME_APP = process.env.NAME_APP || "KyberVision23API"; // Fallback if NAME_APP is undefined

// Override logger.info and logger.error to include the app name
logger.info = (
  (log) => (message: any) =>
    log(`[${NAME_APP}] ${message}`)
)(logger.info);

logger.error = (
  (log) => (message: any) =>
    log(`[${NAME_APP}] ${message}`)
)(logger.error);

// Capture stack traces for errors
process.on("uncaughtException", (err: Error) => {
  logger.error("There is an error");
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(`Stack Trace:\n${err.stack}`);
  process.exit(1); // Exit the process to avoid undefined behavior
});

process.on("unhandledRejection", (reason: unknown, promise: Promise<any>) => {
  logger.error(`Unhandled Rejection at:`, promise);
  if (reason instanceof Error) {
    logger.error(`Reason: ${reason.message}`);
    logger.error(`Stack Trace:\n${reason.stack}`);
  } else {
    logger.error(`Reason:`, reason);
  }
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on http://0.0.0.0:${PORT}`);
});
