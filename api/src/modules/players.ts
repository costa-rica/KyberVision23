import { Player, ContractTeamPlayer } from "@kybervision/db";

interface Action {
  playerId: number;
  [key: string]: any;
}

export async function createUniquePlayerObjArray(
  actions: Action[],
): Promise<any[]> {
  try {
    // 🔹 Extract unique player IDs
    const uniquePlayerIds = Array.from(
      new Set(actions.map((action) => action.playerId)),
    );

    if (uniquePlayerIds.length === 0) {
      return []; // Return empty array if no players are found
    }

    // 🔹 Query the Player table for their full objects
    const players = await Player.findAll({
      where: { id: uniquePlayerIds },
      attributes: ["id", "firstName", "lastName", "birthDate"], // Adjust attributes as needed
    });

    return players; // Return full player objects
  } catch (error: any) {
    console.error("Error fetching unique player objects:", error);
    throw new Error("Failed to fetch unique player objects.");
  }
}

export async function createUniquePlayerNamesArray(
  actions: Action[],
): Promise<string[]> {
  try {
    // 🔹 Extract unique player IDs
    const uniquePlayerIds = Array.from(
      new Set(actions.map((action) => action.playerId)),
    );

    if (uniquePlayerIds.length === 0) {
      return []; // Return empty array if no players are found
    }

    // 🔹 Query the Player table for their first names
    const players = await Player.findAll({
      where: { id: uniquePlayerIds },
      attributes: ["firstName"], // Only retrieve the firstName column
    });

    // 🔹 Extract first names and ensure uniqueness
    const uniquePlayerNames = Array.from(
      new Set(players.map((player) => player.firstName)),
    );

    return uniquePlayerNames;
  } catch (error: any) {
    console.error("Error fetching unique player names:", error);
    throw new Error("Failed to fetch unique player names.");
  }
}

export async function addNewPlayerToTeam(
  teamId: number,
  firstName: string,
  lastName?: string | null,
  shirtNumber?: number | null,
  position?: string | null,
  positionAbbreviation?: string | null,
): Promise<any> {
  try {
    const playerNew = await Player.create({
      firstName,
      lastName: lastName || "", // Provide empty string as default if null/undefined
    });

    await ContractTeamPlayer.create({
      teamId,
      playerId: playerNew.id,
      shirtNumber,
      position,
      positionAbbreviation,
    });

    return { ...playerNew.toJSON(), teamId };
  } catch (error: any) {
    console.error("Error adding player to team:", error);
    throw new Error("Failed to add player to team.");
  }
}
