// logger.ts — KyberVision23API
// Must be imported immediately after dotenv.config() in app.ts.
// Validates required env vars and exits with a fatal error if any are missing.

import winston from "winston";
import path from "path";

// ---------------------------------------------------------------------------
// Required environment variable validation
// Runs before logger is created so failures go directly to stderr.
// ---------------------------------------------------------------------------
const REQUIRED_VARS = ["NODE_ENV", "NAME_APP", "PATH_TO_LOGS"] as const;

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    process.stderr.write(
      `[FATAL] Missing required environment variable: ${key}\n`
    );
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Resolved configuration
// ---------------------------------------------------------------------------
const NODE_ENV = process.env.NODE_ENV as string;
const NAME_APP = process.env.NAME_APP as string;
const PATH_TO_LOGS = process.env.PATH_TO_LOGS as string;

// LOG_MAX_SIZE is specified in megabytes; Winston expects bytes.
const LOG_MAX_SIZE =
  parseInt(process.env.LOG_MAX_SIZE ?? "5", 10) * 1024 * 1024;
const LOG_MAX_FILES = parseInt(process.env.LOG_MAX_FILES ?? "5", 10);

// ---------------------------------------------------------------------------
// Log level
// Development: debug (all levels)
// Testing / Production: http (error, warn, info, http — excludes verbose/debug)
// ---------------------------------------------------------------------------
const LOG_LEVEL = NODE_ENV === "development" ? "debug" : "http";

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json()
);

// ---------------------------------------------------------------------------
// Transports
// Development  → console only
// Testing      → console + rotating file
// Production   → rotating file only
// ---------------------------------------------------------------------------
const fileTransport = new winston.transports.File({
  filename: path.join(PATH_TO_LOGS, `${NAME_APP}.log`),
  format: fileFormat,
  maxsize: LOG_MAX_SIZE,
  maxFiles: LOG_MAX_FILES,
  tailable: true, // keeps current log as NAME_APP.log; rotated as NAME_APP1.log, NAME_APP2.log, …
});

const transports: winston.transport[] = [];

if (NODE_ENV === "development") {
  transports.push(new winston.transports.Console({ format: consoleFormat }));
} else if (NODE_ENV === "testing") {
  transports.push(new winston.transports.Console({ format: consoleFormat }));
  transports.push(fileTransport);
} else if (NODE_ENV === "production") {
  transports.push(fileTransport);
} else {
  // Unrecognised NODE_ENV — fall back to console so the app is never silent.
  process.stderr.write(
    `[WARN] Unrecognised NODE_ENV="${NODE_ENV}". Falling back to console-only logging.\n`
  );
  transports.push(new winston.transports.Console({ format: consoleFormat }));
}

// ---------------------------------------------------------------------------
// Singleton logger instance
// ---------------------------------------------------------------------------
const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports,
});

export default logger;
