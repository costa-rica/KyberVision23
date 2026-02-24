// Mocks must be at the top level before any imports
jest.mock("../src/modules/logger", () => {
  const mockLogger = {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
  };
  return { default: mockLogger, __esModule: true };
});

jest.mock("../src/modules/mailer", () => ({
  __esModule: true,
  sendRegistrationEmail: () => Promise.resolve({ response: "250 OK" }),
  sendResetPasswordEmail: () => Promise.resolve({ response: "250 OK" }),
  sendVideoMontageCompleteNotificationEmail: () =>
    Promise.resolve({ response: "250 OK" }),
  sendJoinSquadNotificationEmail: () => Promise.resolve({ response: "250 OK" }),
}));

import request from "supertest";
import {
  initModels,
  sequelize,
  User,
  Team,
  Player,
  ContractTeamPlayer,
} from "@kybervision/db";
import {
  createTestUser,
  createTestTeam,
  createTestPlayer,
  authHeader,
} from "./helpers";

// Import app AFTER setup to ensure mocks are in place
let app: any;

beforeAll(async () => {
  // Initialize database models
  initModels();
  await sequelize.sync({ force: true });

  // Import app after DB is ready
  const appModule = await import("../src/app");
  app = appModule.default;
}, 30000); // 30 second timeout for initialization

beforeEach(async () => {
  // Clear all tables before each test
  await ContractTeamPlayer.destroy({ where: {}, truncate: true, cascade: true });
  await Player.destroy({ where: {}, truncate: true, cascade: true });
  await Team.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });

  // Reset SQLite auto-increment sequences
  await sequelize.query("DELETE FROM sqlite_sequence");
});

afterAll(async () => {
  await sequelize.close();
});

describe("GET /players/team/:teamId", () => {
  it("should return 200 with { result: true, team, playersArray }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id, { teamName: "Test Team" });

    // Create players for the team
    await createTestPlayer(team.id, {
      firstName: "John",
      lastName: "Doe",
    });
    await createTestPlayer(team.id, {
      firstName: "Jane",
      lastName: "Smith",
    });

    const response = await request(app)
      .get(`/players/team/${team.id}`)
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("team");
    expect(response.body).toHaveProperty("playersArray");
    expect(Array.isArray(response.body.playersArray)).toBe(true);
    expect(response.body.playersArray.length).toBe(2);
    expect(response.body.team.id).toBe(team.id);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).get("/players/team/1");

    expect(response.status).toBe(401);
  });
});

describe("GET /players/profile-picture/:filename", () => {
  it("should return 404 when file not found", async () => {
    const testUser = await createTestUser();

    // Without actual files in the test environment, this returns 404
    const response = await request(app)
      .get("/players/profile-picture/nonexistent.png")
      .set(authHeader(testUser.token));

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("should require authentication", async () => {
    const response = await request(app).get(
      "/players/profile-picture/test.png",
    );

    expect(response.status).toBe(401);
  });
});
