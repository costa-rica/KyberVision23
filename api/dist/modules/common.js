"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBody = checkBody;
exports.checkBodyReturnMissing = checkBodyReturnMissing;
exports.writeRequestArgs = writeRequestArgs;
exports.recordPing = recordPing;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("@kybervision/db");
const logger_1 = __importDefault(require("../modules/logger"));
function checkBody(body, keys) {
    let isValid = true;
    for (const field of keys) {
        if (!body[field] || body[field] === "") {
            isValid = false;
        }
    }
    return isValid;
}
function checkBodyReturnMissing(body, keys) {
    let isValid = true;
    let missingKeys = [];
    for (const field of keys) {
        if (!body[field] || body[field] === "") {
            isValid = false;
            missingKeys.push(field);
        }
    }
    return { isValid, missingKeys };
}
function writeRequestArgs(requestBody, fileNameSuffix) {
    // 🔹 Write request arguments to a JSON file
    const testDir = process.env.PATH_TEST_REQUEST_ARGS;
    if (testDir) {
        try {
            // Ensure the directory exists
            if (!fs_1.default.existsSync(testDir)) {
                fs_1.default.mkdirSync(testDir, { recursive: true });
            }
            // Generate file name with timestamp
            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-")
                .split("T")[1]
                .split("Z")[0]; // HHMMSS format
            const filePath = path_1.default.join(testDir, `request_${timestamp}_${fileNameSuffix}.json`);
            // Write request body to file
            fs_1.default.writeFileSync(filePath, JSON.stringify(requestBody, null, 2), "utf8");
            logger_1.default.info(`✅ Request arguments saved to: ${filePath}`);
        }
        catch (err) {
            logger_1.default.error("❌ Error writing request arguments file:", err);
        }
    }
    else {
        logger_1.default.warn("⚠️ PATH_TEST_REQUEST_ARGS is not set, skipping request logging.");
    }
}
/**
 * Record a device/server time sample for drift analysis.
 *
 * @param args.userId                The user's id (from auth/context).
 * @param args.endpointName          Endpoint label (e.g., "POST /auth/login").
 * @param args.userDeviceTimestamp   Timestamp sent by the device (UTC ISO or Date).
 * @param args.serverTimestamp       Optional server-side timestamp (UTC). If omitted, uses now().
 * @param args.deviceName            Optional device name (e.g., "iPhone 15 Pro").
 * @param args.deviceType            Optional device type (e.g., "Tablet").
 * @param args.isTablet              Optional flag indicating if device is a tablet.
 * @param args.manufacturer          Optional device manufacturer (e.g., "Apple").
 * @param args.modelName             Optional device model name.
 * @param args.osName                Optional OS name (e.g., "iOS").
 * @param args.osVersion             Optional OS version.
 *
 * @returns { success, pingId?, error? }
 */
async function recordPing(args) {
    var _a;
    try {
        // --- Validate required primitives ---
        const { userId, endpointName } = args;
        if (typeof userId !== "number" ||
            Number.isNaN(userId) ||
            !endpointName ||
            typeof endpointName !== "string") {
            return { success: false, error: "Invalid userId or endpointName." };
        }
        // --- Normalize timestamps (expect UTC) ---
        const deviceTs = args.userDeviceTimestamp instanceof Date
            ? args.userDeviceTimestamp
            : new Date(args.userDeviceTimestamp);
        if (!deviceTs || isNaN(deviceTs.getTime())) {
            return { success: false, error: "Invalid userDeviceTimestamp." };
        }
        // If not provided, prefer server wall-clock now (UTC)
        const serverTs = (_a = args.serverTimestamp) !== null && _a !== void 0 ? _a : new Date();
        // --- Persist row ---
        const row = await db_1.Ping.create({
            userId,
            endpointName,
            userDeviceTimestamp: deviceTs, // stored as DATE; treat as UTC
            serverTimestamp: serverTs, // can omit to use DB default; here we pass in for explicitness
            deviceName: args.deviceName,
            deviceType: args.deviceType,
            isTablet: args.isTablet,
            manufacturer: args.manufacturer,
            modelName: args.modelName,
            osName: args.osName,
            osVersion: args.osVersion,
        });
        return { success: true, pingId: row.id };
    }
    catch (err) {
        logger_1.default.error("❌ recordPing error:", (err === null || err === void 0 ? void 0 : err.message) || err);
        return { success: false, error: (err === null || err === void 0 ? void 0 : err.message) || "Unknown error" };
    }
}
