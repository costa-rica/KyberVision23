"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCheckDirectoryExists = verifyCheckDirectoryExists;
exports.onStartUpCreateLeague = onStartUpCreateLeague;
exports.onStartUpCreateEnvUsers = onStartUpCreateEnvUsers;
const fs_1 = __importDefault(require("fs"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("@kybervision/db");
const logger_1 = __importDefault(require("../modules/logger"));
function verifyCheckDirectoryExists() {
    // Add directory paths to check (and create if they don't exist)
    const pathsToCheck = [
        process.env.PATH_DATABASE,
        process.env.PATH_PROJECT_RESOURCES,
        process.env.PATH_VIDEOS,
        process.env.PATH_VIDEOS_UPLOADED,
        process.env.PATH_DB_BACKUPS,
        process.env.PATH_PROFILE_PICTURES_PLAYER_DIR,
        // Subdirectories derived from PATH_PROJECT_RESOURCES
        process.env.PATH_PROJECT_RESOURCES
            ? `${process.env.PATH_PROJECT_RESOURCES}/uploads-delete-ok`
            : undefined,
    ].filter((path) => typeof path === "string");
    pathsToCheck.forEach((dirPath) => {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
            logger_1.default.info(`Created directory: ${dirPath}`);
        }
    });
}
async function onStartUpCreateLeague() {
    const existingLeague = await db_1.League.findOne({
        where: { name: "General League" },
    });
    if (existingLeague) {
        logger_1.default.info("ℹ️  General league already initialized. Skipping setup.");
        return;
    }
    await db_1.League.create({
        name: "General League",
        category: "General",
    });
}
async function onStartUpCreateEnvUsers() {
    if (!process.env.ADMIN_EMAIL_KV_MANAGER_WEBSITE) {
        logger_1.default.warn("⚠️ No admin emails found in env variables.");
        return;
    }
    let adminEmails;
    try {
        adminEmails = JSON.parse(process.env.ADMIN_EMAIL_KV_MANAGER_WEBSITE);
        if (!Array.isArray(adminEmails))
            throw new Error();
    }
    catch (error) {
        logger_1.default.error("❌ Error parsing ADMIN_EMAIL_KV_MANAGER_WEBSITE. Ensure it's a valid JSON array.");
        return;
    }
    for (const email of adminEmails) {
        try {
            const existingUser = await db_1.User.findOne({ where: { email } });
            if (!existingUser) {
                logger_1.default.info(`🔹 Creating admin user: ${email}`);
                const hashedPassword = await bcrypt_1.default.hash("test", 10); // Default password, should be changed later.
                await db_1.User.create({
                    username: email.split("@")[0],
                    firstName: "Admin", // Default first name for admin users
                    lastName: "User", // Default last name for admin users
                    email,
                    password: hashedPassword,
                    isAdminForKvManagerWebsite: true, // Set admin flag
                });
                logger_1.default.info(`✅ Admin user created: ${email}`);
            }
            else {
                logger_1.default.info(`ℹ️  User already exists: ${email}`);
            }
        }
        catch (err) {
            logger_1.default.error(`❌ Error creating admin user (${email}):`, err);
        }
    }
}
