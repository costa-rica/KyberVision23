"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts — KyberVision23API
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from parent directory of dist/ (i.e., api/.env)
// This ensures .env is found regardless of current working directory
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../.env") });
// Logger must be initialized immediately after dotenv so all subsequent
// modules can import it as a fully configured singleton.
const logger_1 = __importDefault(require("./modules/logger"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
// ⬇️ Import your DB package (use the exact package.json "name" from KyberVision23Db)
const db_1 = require("@kybervision/db");
// Import onStartUp functions
const onStartUp_1 = require("./modules/onStartUp");
// Routers (keep whatever you already have)
const index_1 = __importDefault(require("./routes/index"));
const users_1 = __importDefault(require("./routes/users"));
const adminDb_1 = __importDefault(require("./routes/adminDb"));
const teams_1 = __importDefault(require("./routes/teams"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const contractTeamUsers_1 = __importDefault(require("./routes/contractTeamUsers"));
const players_1 = __importDefault(require("./routes/players"));
const contractPlayerUsers_1 = __importDefault(require("./routes/contractPlayerUsers"));
const contractUserActions_1 = __importDefault(require("./routes/contractUserActions"));
const contractVideoActions_1 = __importDefault(require("./routes/contractVideoActions"));
const leagues_1 = __importDefault(require("./routes/leagues"));
const scripts_1 = __importDefault(require("./routes/scripts"));
const videos_1 = __importDefault(require("./routes/videos"));
// Verify and create necessary directories first
(0, onStartUp_1.verifyCheckDirectoryExists)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// CORS configuration
app.use((0, cors_1.default)({
    credentials: true,
    exposedHeaders: ["Content-Disposition"], // <-- this line is key
}));
// Middleware configuration
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// Routes
app.use("/", index_1.default);
app.use("/users", users_1.default);
app.use("/admin-db", adminDb_1.default);
app.use("/teams", teams_1.default);
app.use("/sessions", sessions_1.default);
app.use("/contract-team-users", contractTeamUsers_1.default);
app.use("/players", players_1.default);
app.use("/contract-player-users", contractPlayerUsers_1.default);
app.use("/contract-user-actions", contractUserActions_1.default);
app.use("/contract-video-actions", contractVideoActions_1.default);
app.use("/leagues", leagues_1.default);
app.use("/scripts", scripts_1.default);
app.use("/videos", videos_1.default);
// Increase payload size for large files
app.use(express_1.default.json({ limit: "6gb" }));
app.use(express_1.default.urlencoded({ limit: "6gb", extended: true }));
// Initialize database and startup functions
async function initializeApp() {
    try {
        // Initialize and sync DB
        (0, db_1.initModels)();
        await db_1.sequelize.sync(); // or { alter: true } while iterating
        logger_1.default.info("✅ Database connected & synced");
        // Run startup functions after database is ready
        await (0, onStartUp_1.onStartUpCreateEnvUsers)();
        await (0, onStartUp_1.onStartUpCreateLeague)();
        logger_1.default.info("✅ App initialization completed");
    }
    catch (err) {
        logger_1.default.error("❌ App initialization failed:", err);
        // Only exit in non-test environments
        if (process.env.NODE_ENV !== "testing") {
            process.exit(1);
        }
        else {
            throw err; // Re-throw in tests so they can handle it
        }
    }
}
// Initialize the app when this module is imported (skip in test environment)
if (process.env.NODE_ENV !== "testing") {
    initializeApp();
}
// Start server if this file is run directly (for development)
if (require.main === module) {
    app.listen(port, () => {
        logger_1.default.info(`✅ Development server running on http://localhost:${port}`);
    });
}
// Export the app for server.ts to use
exports.default = app;
