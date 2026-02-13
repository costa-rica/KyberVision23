// server.ts — KyberVision23Queuer
// Entry point. Importing app first ensures dotenv and the logger singleton
// are fully initialized before anything else in this file runs.
import app from "./app";
import logger from "./modules/logger";

const PORT = Number(process.env.PORT) || 8003;

// Global error handlers
process.on("uncaughtException", (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(`Stack Trace:\n${err.stack}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  logger.error(`Unhandled Rejection at: ${promise}`);
  logger.error(`Reason: ${reason}`);
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`✅ Server running at http://0.0.0.0:${PORT}`);
});
