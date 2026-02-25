"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = void 0;
exports.readAndAppendDbTables = readAndAppendDbTables;
exports.createDatabaseBackupZipFile = createDatabaseBackupZipFile;
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const json2csv_1 = require("json2csv");
const util_1 = require("util");
const logger_1 = __importDefault(require("../modules/logger"));
const db_1 = require("@kybervision/db");
const mkdirAsync = (0, util_1.promisify)(fs_1.default.mkdir);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const models = {
    User: db_1.User,
    Video: db_1.Video,
    Action: db_1.Action,
    ContractLeagueTeam: db_1.ContractLeagueTeam,
    Complex: db_1.Complex,
    ContractTeamUser: db_1.ContractTeamUser,
    League: db_1.League,
    Session: db_1.Session,
    OpponentServeTimestamp: db_1.OpponentServeTimestamp,
    Player: db_1.Player,
    ContractTeamPlayer: db_1.ContractTeamPlayer,
    Script: db_1.Script,
    ContractVideoAction: db_1.ContractVideoAction,
    Team: db_1.Team,
    ContractPlayerUser: db_1.ContractPlayerUser,
    ContractUserAction: db_1.ContractUserAction,
    PendingInvitations: db_1.PendingInvitations,
    Ping: db_1.Ping,
};
exports.models = models;
async function readAndAppendDbTables(backupFolderPath) {
    logger_1.default.info(`Processing CSV files from: ${backupFolderPath}`);
    logger_1.default.info(`Sequelize instance: ${db_1.sequelize}`);
    let currentTable = null;
    try {
        // Read all CSV files from the backup directory
        const csvFiles = await fs_1.default.promises.readdir(backupFolderPath);
        let totalRecordsImported = 0;
        // Separate CSV files into four append batches
        const appendBatch1 = [];
        csvFiles.forEach((file) => {
            if (!file.endsWith(".csv"))
                return; // Skip non-CSV files
            appendBatch1.push(file);
        });
        logger_1.default.info(`Append Batch 1 (First): ${appendBatch1}`);
        // Helper function to process CSV files
        const processCSVFiles = async (files) => {
            let recordsImported = 0;
            for (const file of files) {
                const tableName = file.replace(".csv", "");
                if (!models[tableName]) {
                    logger_1.default.info(`Skipping ${file}, no matching table found.`);
                    continue;
                }
                logger_1.default.info(`Importing data into table: ${tableName}`);
                currentTable = tableName;
                const filePath = path_1.default.join(backupFolderPath, file);
                const records = [];
                // Read CSV file
                await new Promise((resolve, reject) => {
                    fs_1.default.createReadStream(filePath)
                        .pipe((0, csv_parser_1.default)())
                        .on("data", (row) => records.push(row))
                        .on("end", resolve)
                        .on("error", reject);
                });
                if (records.length > 0) {
                    await models[tableName].bulkCreate(records, {
                        ignoreDuplicates: true,
                    });
                    recordsImported += records.length;
                    logger_1.default.info(`Imported ${records.length} records into ${tableName}`);
                }
                else {
                    logger_1.default.info(`No records found in ${file}`);
                }
            }
            return recordsImported;
        };
        // 🔹 Disable foreign key constraints before importing
        // ↪This allows us to append when necessary foreign keys are not yet populated.
        logger_1.default.info("Disabling foreign key constraints...");
        await db_1.sequelize.query("PRAGMA foreign_keys = OFF;");
        // Process the batches in order
        totalRecordsImported += await processCSVFiles(appendBatch1); // First batch
        // 🔹 Re-enable foreign key constraints after importing
        logger_1.default.info("Re-enabling foreign key constraints...");
        await db_1.sequelize.query("PRAGMA foreign_keys = ON;");
        return {
            success: true,
            message: `Successfully imported ${totalRecordsImported} records.`,
        };
    }
    catch (error) {
        logger_1.default.error("Error processing CSV files:", error);
        // Ensure foreign key constraints are re-enabled even if an error occurs
        await db_1.sequelize.query("PRAGMA foreign_keys = ON;");
        return {
            success: false,
            error: error.message,
            failedOnTableName: currentTable || undefined,
        };
    }
}
async function createDatabaseBackupZipFile(suffix = "") {
    logger_1.default.info(`suffix: ${suffix}`);
    try {
        const timestamp = new Date()
            .toISOString()
            .replace(/[-T:.Z]/g, "")
            .slice(0, 15);
        const backupDir = path_1.default.join(process.env.PATH_DB_BACKUPS, `db_backup_${timestamp}${suffix}`);
        logger_1.default.info(`Backup directory: ${backupDir}`);
        await mkdirAsync(backupDir, { recursive: true });
        let hasData = false;
        for (const tableName in models) {
            // logger.info(`Processing table: ${tableName}`);
            if (models.hasOwnProperty(tableName)) {
                const records = await models[tableName].findAll({ raw: true });
                if (records.length === 0)
                    continue;
                const json2csvParser = new json2csv_1.Parser();
                const csvData = json2csvParser.parse(records);
                const filePath = path_1.default.join(backupDir, `${tableName}.csv`);
                await writeFileAsync(filePath, csvData);
                hasData = true;
            }
        }
        if (!hasData) {
            await fs_1.default.promises.rmdir(backupDir, { recursive: true });
            throw new Error("No data found in any tables. Backup skipped.");
        }
        const zipFileName = `db_backup_${timestamp}${suffix}.zip`;
        const zipFilePath = path_1.default.join(process.env.PATH_DB_BACKUPS, zipFileName);
        const output = fs_1.default.createWriteStream(zipFilePath);
        const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        return new Promise((resolve, reject) => {
            output.on("close", () => resolve(zipFilePath));
            archive.on("error", reject);
            archive.pipe(output);
            archive.directory(backupDir, false);
            archive.finalize().then(() => {
                fs_1.default.promises.rmdir(backupDir, { recursive: true });
            });
        });
    }
    catch (error) {
        logger_1.default.error("Error creating database backup:", error);
        throw error;
    }
}
