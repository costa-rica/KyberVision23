"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUniquePlayerObjArray = createUniquePlayerObjArray;
exports.createUniquePlayerNamesArray = createUniquePlayerNamesArray;
exports.addNewPlayerToTeam = addNewPlayerToTeam;
const db_1 = require("@kybervision/db");
const logger_1 = __importDefault(require("../modules/logger"));
async function createUniquePlayerObjArray(actions) {
    try {
        // 🔹 Extract unique player IDs
        const uniquePlayerIds = Array.from(new Set(actions.map((action) => action.playerId)));
        if (uniquePlayerIds.length === 0) {
            return []; // Return empty array if no players are found
        }
        // 🔹 Query the Player table for their full objects
        const players = await db_1.Player.findAll({
            where: { id: uniquePlayerIds },
            attributes: ["id", "firstName", "lastName", "birthDate"], // Adjust attributes as needed
        });
        return players; // Return full player objects
    }
    catch (error) {
        logger_1.default.error("Error fetching unique player objects:", error);
        throw new Error("Failed to fetch unique player objects.");
    }
}
async function createUniquePlayerNamesArray(actions) {
    try {
        // 🔹 Extract unique player IDs
        const uniquePlayerIds = Array.from(new Set(actions.map((action) => action.playerId)));
        if (uniquePlayerIds.length === 0) {
            return []; // Return empty array if no players are found
        }
        // 🔹 Query the Player table for their first names
        const players = await db_1.Player.findAll({
            where: { id: uniquePlayerIds },
            attributes: ["firstName"], // Only retrieve the firstName column
        });
        // 🔹 Extract first names and ensure uniqueness
        const uniquePlayerNames = Array.from(new Set(players.map((player) => player.firstName)));
        return uniquePlayerNames;
    }
    catch (error) {
        logger_1.default.error("Error fetching unique player names:", error);
        throw new Error("Failed to fetch unique player names.");
    }
}
async function addNewPlayerToTeam(teamId, firstName, lastName, shirtNumber, position, positionAbbreviation) {
    try {
        const playerNew = await db_1.Player.create({
            firstName,
            lastName: lastName || "", // Provide empty string as default if null/undefined
        });
        await db_1.ContractTeamPlayer.create({
            teamId,
            playerId: playerNew.id,
            shirtNumber,
            position,
            positionAbbreviation,
        });
        return Object.assign(Object.assign({}, playerNew.toJSON()), { teamId });
    }
    catch (error) {
        logger_1.default.error("Error adding player to team:", error);
        throw new Error("Failed to add player to team.");
    }
}
