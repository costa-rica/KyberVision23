"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const multer_1 = __importDefault(require("multer"));
const unzipper_1 = __importDefault(require("unzipper"));
const logger_1 = __importDefault(require("../modules/logger"));
const userAuthentication_1 = require("../modules/userAuthentication");
const adminDb_1 = require("../modules/adminDb");
const router = express_1.default.Router();
const unlinkAsync = (0, util_1.promisify)(fs_1.default.unlink);
const mkdirAsync = (0, util_1.promisify)(fs_1.default.mkdir);
// upload data to database
const upload = (0, multer_1.default)({
    dest: path_1.default.join(process.env.PATH_PROJECT_RESOURCES || "./temp", "uploads-delete-ok/"),
}); // Temporary storage for file uploads
// GET /admin-db/table/:tableName
router.get("/table/:tableName", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const { tableName } = req.params;
        logger_1.default.info(`- in GET /admin-db/table/${tableName}`);
        if (!adminDb_1.models[tableName]) {
            return res
                .status(400)
                .json({ result: false, message: `Table '${tableName}' not found.` });
        }
        let tableData = await adminDb_1.models[tableName].findAll({ raw: true });
        if (tableData.length === 0) {
            const attributes = Object.keys(adminDb_1.models[tableName].rawAttributes);
            const dummyRow = {};
            attributes.forEach((attr) => {
                dummyRow[attr] = null;
            });
            tableData = [dummyRow];
        }
        if (tableName === "User") {
            tableData = tableData.map((_a) => {
                var { password } = _a, rest = __rest(_a, ["password"]);
                return rest;
            });
        }
        const columnMeta = Object.entries(adminDb_1.models[tableName].rawAttributes).map(([key, attr]) => {
            var _a, _b;
            return ({
                key,
                sequelizeType: ((_b = (_a = attr.type) === null || _a === void 0 ? void 0 : _a.key) !== null && _b !== void 0 ? _b : "STRING").toLowerCase(),
            });
        });
        res.json({ result: true, data: tableData, columnMeta });
    }
    catch (error) {
        logger_1.default.error("Error fetching table data:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
router.get("/create-database-backup", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in GET /admin-db/create-database-backup`);
    try {
        const zipFilePath = await (0, adminDb_1.createDatabaseBackupZipFile)();
        logger_1.default.info(`Backup zip created: ${zipFilePath}`);
        res.json({
            result: true,
            message: "Database backup completed",
            backupFile: zipFilePath,
        });
    }
    catch (error) {
        logger_1.default.error("Error creating database backup:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// 🔹 Get Database Backup List (GET /admin-db/backup-database-list)
router.get("/backup-database-list", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in GET /admin-db/backup-database-list`);
    try {
        const backupDir = process.env.PATH_DB_BACKUPS;
        if (!backupDir) {
            return res
                .status(500)
                .json({ result: false, message: "Backup directory not configured." });
        }
        // Read files in the backup directory
        const files = await fs_1.default.promises.readdir(backupDir);
        // Filter only .zip files
        const zipFiles = files.filter((file) => file.endsWith(".zip"));
        // logger.info(`Found ${zipFiles.length} backup files.`);
        res.json({ result: true, backups: zipFiles });
    }
    catch (error) {
        logger_1.default.error("Error retrieving backup list:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
router.get("/send-db-backup/:filename", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in GET /admin-db/send-db-backup/${req.params.filename}`);
    try {
        const { filename } = req.params;
        const backupDir = process.env.PATH_DB_BACKUPS;
        if (!backupDir) {
            return res
                .status(500)
                .json({ result: false, message: "Backup directory not configured." });
        }
        const filePath = path_1.default.join(backupDir, filename);
        // Check if file exists
        if (!fs_1.default.existsSync(filePath)) {
            return res
                .status(404)
                .json({ result: false, message: "File not found." });
        }
        logger_1.default.info(`Sending file: ${filePath}`);
        res.download(filePath, filename, (err) => {
            if (err) {
                logger_1.default.error("Error sending file:", err);
                res
                    .status(500)
                    .json({ result: false, message: "Error sending file." });
            }
        });
    }
    catch (error) {
        logger_1.default.error("Error processing request:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
router.get("/db-row-counts-by-table", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in GET /admin-db/db-row-counts-by-table`);
    try {
        let arrayRowCountsByTable = [];
        for (const tableName in adminDb_1.models) {
            // logger.info(`Checking table: ${tableName}`);
            if (adminDb_1.models.hasOwnProperty(tableName)) {
                // logger.info(`Checking table: ${tableName}`);
                // Count rows in the table
                const rowCount = await adminDb_1.models[tableName].count();
                arrayRowCountsByTable.push({
                    tableName,
                    rowCount: rowCount || 0, // Ensure it's 0 if empty
                });
            }
        }
        // logger.info(`Database row counts by table:`, arrayRowCountsByTable);
        res.json({ result: true, arrayRowCountsByTable });
    }
    catch (error) {
        logger_1.default.error("Error retrieving database row counts:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
router.post("/import-db-backup", userAuthentication_1.authenticateToken, (req, res, next) => {
    var _a;
    logger_1.default.info(`- in POST /admin-db/import-db-backup — request received, content-length: ${(_a = req.headers["content-length"]) !== null && _a !== void 0 ? _a : "unknown"} bytes`);
    req.on("close", () => {
        logger_1.default.warn("- /import-db-backup — req 'close' event fired (client disconnected or request finished)");
    });
    req.on("aborted", () => {
        logger_1.default.warn("- /import-db-backup — req 'aborted' event fired (client dropped connection)");
    });
    next();
}, (req, res, next) => {
    var _a;
    logger_1.default.info(`- /import-db-backup — invoking multer, content-type: ${(_a = req.headers["content-type"]) !== null && _a !== void 0 ? _a : "unknown"}`);
    const sock = req.socket;
    logger_1.default.info(`- /import-db-backup — socket state before multer: destroyed=${sock === null || sock === void 0 ? void 0 : sock.destroyed}, readable=${sock === null || sock === void 0 ? void 0 : sock.readable}, writable=${sock === null || sock === void 0 ? void 0 : sock.writable}`);
    logger_1.default.info(`- /import-db-backup — req state before multer: destroyed=${req.destroyed}, readable=${req.readable}`);
    sock === null || sock === void 0 ? void 0 : sock.on("close", (hadError) => {
        logger_1.default.warn(`- /import-db-backup — socket 'close' fired, hadError=${hadError}`);
    });
    sock === null || sock === void 0 ? void 0 : sock.on("error", (sockErr) => {
        logger_1.default.error(`- /import-db-backup — socket 'error': ${sockErr === null || sockErr === void 0 ? void 0 : sockErr.message} | code: ${sockErr === null || sockErr === void 0 ? void 0 : sockErr.code}`);
    });
    upload.single("backupFile")(req, res, (err) => {
        var _a;
        if (err) {
            logger_1.default.error(`- /import-db-backup — multer error — message: "${err === null || err === void 0 ? void 0 : err.message}" | code: "${err === null || err === void 0 ? void 0 : err.code}" | name: "${err === null || err === void 0 ? void 0 : err.name}" | type: ${typeof err} | string: "${String(err)}"`);
            logger_1.default.error("- /import-db-backup — multer error stack:", { stack: err === null || err === void 0 ? void 0 : err.stack });
            return res
                .status(500)
                .json({ result: false, message: "File upload failed", error: String(err) });
        }
        logger_1.default.info(`- /import-db-backup — multer succeeded, req.file: ${JSON.stringify((_a = req.file) !== null && _a !== void 0 ? _a : null)}`);
        next();
    });
}, async (req, res) => {
    logger_1.default.info("- in POST /admin-db/import-db-backup — multer complete, processing file");
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ result: false, message: "No file uploaded." });
        }
        const backupDir = process.env.PATH_PROJECT_RESOURCES;
        if (!backupDir) {
            logger_1.default.info("*** no file ***");
            return res.status(500).json({
                result: false,
                message: "Temporary directory not configured.",
            });
        }
        const tempExtractPath = path_1.default.join(backupDir, "temp_db_import");
        // Ensure the temp_db_import folder is clean before extracting
        if (fs_1.default.existsSync(tempExtractPath)) {
            logger_1.default.info("Previous temp_db_import folder found. Deleting...");
            await fs_1.default.promises.rm(tempExtractPath, { recursive: true });
            logger_1.default.info("Old temp_db_import folder deleted.");
        }
        await mkdirAsync(tempExtractPath, { recursive: true });
        logger_1.default.info(`Extracting backup to: ${tempExtractPath}`);
        // Unzip the uploaded file
        await fs_1.default
            .createReadStream(req.file.path)
            .pipe(unzipper_1.default.Extract({ path: tempExtractPath }))
            .promise();
        logger_1.default.info("Backup extracted successfully.");
        // Read all subfolders inside tempExtractPath
        const extractedFolders = await fs_1.default.promises.readdir(tempExtractPath);
        // Find the correct folder that starts with "db_backup_"
        let backupFolder = extractedFolders.find((folder) => folder.startsWith("db_backup_") && folder !== "__MACOSX");
        // Determine the path where CSV files should be searched
        let backupFolderPath = backupFolder
            ? path_1.default.join(tempExtractPath, backupFolder)
            : tempExtractPath;
        logger_1.default.info(`Using backup folder: ${backupFolderPath}`);
        // Call the new function to read and append database tables
        const status = await (0, adminDb_1.readAndAppendDbTables)(backupFolderPath);
        // Clean up temporary files
        await fs_1.default.promises.rm(tempExtractPath, { recursive: true });
        await fs_1.default.promises.unlink(req.file.path);
        logger_1.default.info("Temporary files deleted.");
        logger_1.default.info(status);
        if (status === null || status === void 0 ? void 0 : status.failedOnTableName) {
            res.status(500).json({
                result: false,
                error: status.error,
                failedOnTableName: status.failedOnTableName,
            });
        }
        else {
            res.json({
                result: status.success,
                message: status.message,
            });
        }
    }
    catch (error) {
        logger_1.default.error("Error importing database backup:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
router.delete("/delete-db-backup/:filename", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info(`- in DELETE /admin-db/delete-db-backup/${req.params.filename}`);
    try {
        const { filename } = req.params;
        const backupDir = process.env.PATH_DB_BACKUPS;
        if (!backupDir) {
            return res
                .status(500)
                .json({ result: false, message: "Backup directory not configured." });
        }
        const filePath = path_1.default.join(backupDir, filename);
        // Check if file exists
        if (!fs_1.default.existsSync(filePath)) {
            return res
                .status(404)
                .json({ result: false, message: "File not found." });
        }
        // Delete the file
        await fs_1.default.promises.unlink(filePath);
        logger_1.default.info(`Deleted file: ${filePath}`);
        res.json({ result: true, message: "Backup file deleted successfully." });
    }
    catch (error) {
        logger_1.default.error("Error deleting backup file:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// 🔹 DELETE route to remove the entire database
router.delete("/the-entire-database", userAuthentication_1.authenticateToken, async (req, res) => {
    logger_1.default.info("- in DELETE /admin-db/the-entire-database");
    try {
        // Create a backup before deletion
        logger_1.default.info("Creating database backup before deletion...");
        const backupPath = await (0, adminDb_1.createDatabaseBackupZipFile)("_last_before_db_delete");
        logger_1.default.info(`Backup created at: ${backupPath}`);
        // Get database path and name from environment variables
        const dbPath = process.env.PATH_DATABASE;
        const dbName = process.env.NAME_DB;
        const fullDbPath = path_1.default.join(dbPath, dbName);
        // Check if the database file exists
        if (!fs_1.default.existsSync(fullDbPath)) {
            return res.status(404).json({
                result: false,
                message: "Database file not found.",
            });
        }
        // Delete the database file
        await unlinkAsync(fullDbPath);
        logger_1.default.info(`Database file deleted: ${fullDbPath}`);
        res.json({
            result: true,
            message: "Database successfully deleted.",
            backupFile: backupPath,
        });
    }
    catch (error) {
        logger_1.default.error("Error deleting the database:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
});
// 🔹 DELETE route to remove a specific table
router.delete("/table/:tableName", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const { tableName } = req.params;
        logger_1.default.info(`- in DELETE /admin-db/table/${tableName}`);
        // Check if the requested table exists in the models
        if (!adminDb_1.models[tableName]) {
            return res
                .status(400)
                .json({ result: false, message: `Table '${tableName}' not found.` });
        }
        // Delete all records from the table
        await adminDb_1.models[tableName].destroy({ where: {}, truncate: true });
        res.json({
            result: true,
            message: `Table '${tableName}' has been deleted.`,
        });
    }
    catch (error) {
        logger_1.default.error("Error deleting table:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// 🔹 GET /admin-db/table-clean/:tableName : route to clean a specific table
router.get("/table-clean/:tableName", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const { tableName } = req.params;
        logger_1.default.info(`- in GET /admin-db/table-clean/${tableName}`);
        // Check if the requested table exists in the models
        if (!adminDb_1.models[tableName]) {
            return res
                .status(400)
                .json({ result: false, message: `Table '${tableName}' not found.` });
        }
        // Fetch all records from the table
        const tableData = (await adminDb_1.models[tableName].findAll({ raw: true })) || [];
        res.json({ result: true, data: tableData });
    }
    catch (error) {
        logger_1.default.error("Error fetching table data:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// DELETE /table-row/:tableName/:rowId : route to delete a specific row from a table
router.delete("/table-row/:tableName/:rowId", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const { tableName, rowId } = req.params;
        logger_1.default.info(`- in DELETE /admin-db/table-row/${tableName}/${rowId}`);
        // Check if the requested table exists in the models
        if (!adminDb_1.models[tableName]) {
            return res
                .status(400)
                .json({ result: false, message: `Table '${tableName}' not found.` });
        }
        // Delete the specific row from the table
        await adminDb_1.models[tableName].destroy({ where: { id: rowId } });
        res.json({
            result: true,
            message: `Row ${rowId} from table '${tableName}' has been deleted.`,
        });
    }
    catch (error) {
        logger_1.default.error("Error deleting row:", error);
        res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// 🔹 PUT /admin-db/table-row/:tableName/:rowId : route to update a specific row from a table
router.put("/table-row/:tableName/:rowId", userAuthentication_1.authenticateToken, async (req, res) => {
    try {
        const { tableName, rowId } = req.params;
        const dataToSave = req.body;
        logger_1.default.info(`- in PUT /admin-db/table-row/${tableName}/${rowId}`);
        logger_1.default.info("Incoming data:", dataToSave);
        // Validate table
        if (!adminDb_1.models[tableName]) {
            return res
                .status(400)
                .json({ result: false, message: `Table '${tableName}' not found.` });
        }
        const Model = adminDb_1.models[tableName];
        let result;
        if (!rowId || rowId === "null" || rowId === "undefined") {
            // ➕ Create new record
            result = await Model.create(dataToSave);
        }
        else {
            // 🔁 Update existing record
            const [rowsUpdated] = await Model.update(dataToSave, {
                where: { id: rowId },
            });
            if (rowsUpdated === 0) {
                return res.status(404).json({
                    result: false,
                    message: `No record found with id ${rowId} in table '${tableName}'.`,
                });
            }
            result = await Model.findByPk(rowId); // Return updated record
        }
        return res.json({
            result: true,
            message: `Row ${rowId || result.id} in '${tableName}' successfully saved.`,
            // data: result,
        });
    }
    catch (error) {
        logger_1.default.error("Error saving row:", error);
        return res.status(500).json({
            result: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
exports.default = router;
