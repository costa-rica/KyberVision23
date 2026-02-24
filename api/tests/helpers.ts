// Test helper utilities
import bcrypt from "bcrypt";
import { User, Team, League, Session, ContractLeagueTeam, Player, ContractTeamPlayer, ContractTeamUser } from "@kybervision/db";
import { tokenizeObject } from "../src/modules/userAuthentication";

export interface TestUser {
  id: number;
  email: string;
  password: string;
  token: string;
  user: any;
}

/**
 * Creates a test user in the database and returns user details + JWT token
 */
export async function createTestUser(overrides: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
} = {}): Promise<TestUser> {
  const email = overrides.email || `test${Date.now()}@example.com`;
  const password = overrides.password || "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    firstName: overrides.firstName || "Test",
    lastName: overrides.lastName || "User",
    username: email.split("@")[0],
  });

  const token = tokenizeObject({ id: user.id });

  return {
    id: user.id,
    email,
    password, // Plain text password for login tests
    token,
    user: user.toJSON(),
  };
}

/**
 * Creates a test team in the database
 */
export async function createTestTeam(userId: number, overrides: {
  teamName?: string;
  description?: string;
  visibility?: string;
} = {}) {
  const team = await Team.create({
    teamName: overrides.teamName || `Test Team ${Date.now()}`,
    description: overrides.description || "Test team description",
    visibility: overrides.visibility || "Private",
  });

  // Create ContractTeamUser relationship
  await ContractTeamUser.create({
    userId,
    teamId: team.id,
    isSuperUser: true,
    isAdmin: true,
    isCoach: false,
  });

  return team;
}

/**
 * Creates a test league in the database
 */
export async function createTestLeague(overrides: {
  name?: string;
  category?: string;
} = {}) {
  return await League.create({
    name: overrides.name || `Test League ${Date.now()}`,
    category: overrides.category || "Test Category",
  });
}

/**
 * Creates a test session in the database
 */
export async function createTestSession(
  teamId: number,
  contractLeagueTeamId: number,
  overrides: {
    sessionDate?: Date;
    sessionName?: string;
    city?: string;
  } = {},
) {
  return await Session.create({
    teamId,
    contractLeagueTeamId,
    sessionDate: overrides.sessionDate || new Date(),
    sessionName: overrides.sessionName || "Test Session",
    city: overrides.city || "Test City",
  });
}

/**
 * Creates a ContractLeagueTeam relationship
 */
export async function createContractLeagueTeam(leagueId: number, teamId: number) {
  return await ContractLeagueTeam.create({
    leagueId,
    teamId,
  });
}

/**
 * Creates a test player and links to team
 */
export async function createTestPlayer(
  teamId: number,
  overrides: {
    firstName?: string;
    lastName?: string;
    birthDate?: Date | null;
  } = {},
) {
  const player = await Player.create({
    firstName: overrides.firstName || "Test",
    lastName: overrides.lastName || "Player",
    birthDate: overrides.birthDate || null,
  });

  await ContractTeamPlayer.create({
    teamId,
    playerId: player.id,
  });

  return player;
}

/**
 * Helper to generate auth header for supertest requests
 */
export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
