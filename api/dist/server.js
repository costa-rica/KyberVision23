"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app")); // Import the configured app
const logger_1 = __importDefault(require("./modules/logger"));
const PORT = parseInt(process.env.PORT || "3000", 10);
const NAME_APP = process.env.NAME_APP || "KyberVision23API"; // Fallback if NAME_APP is undefined
// Override logger.info and logger.error to include the app name
logger_1.default.info = ((log) => (message) => log(`[${NAME_APP}] ${message}`))(logger_1.default.info);
logger_1.default.error = ((log) => (message) => log(`[${NAME_APP}] ${message}`))(logger_1.default.error);
// Capture stack traces for errors
process.on("uncaughtException", (err) => {
    logger_1.default.error("There is an error");
    logger_1.default.error(`Uncaught Exception: ${err.message}`);
    logger_1.default.error(`Stack Trace:\n${err.stack}`);
    process.exit(1); // Exit the process to avoid undefined behavior
});
process.on("unhandledRejection", (reason, promise) => {
    logger_1.default.error(`Unhandled Rejection at:`, promise);
    if (reason instanceof Error) {
        logger_1.default.error(`Reason: ${reason.message}`);
        logger_1.default.error(`Stack Trace:\n${reason.stack}`);
    }
    else {
        logger_1.default.error(`Reason:`, reason);
    }
});
// Start the server
app_1.default.listen(PORT, "0.0.0.0", () => {
    logger_1.default.info(`Server running on http://0.0.0.0:${PORT}`);
});
