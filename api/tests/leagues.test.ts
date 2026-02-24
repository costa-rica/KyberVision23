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
  League,
  ContractLeagueTeam,
} from "@kybervision/db";
import {
  createTestUser,
  createTestTeam,
  createTestLeague,
  createContractLeagueTeam,
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
  await ContractLeagueTeam.destroy({ where: {}, truncate: true, cascade: true });
  await League.destroy({ where: {}, truncate: true, cascade: true });
  await Team.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("GET /leagues/team/:teamId", () => {
  it("should return 200 with { leaguesArray }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id, { teamName: "Test Team" });

    // Create leagues and link to team
    const league1 = await createTestLeague({ name: "League One" });
    const league2 = await createTestLeague({ name: "League Two" });

    await createContractLeagueTeam(league1.id, team.id);
    await createContractLeagueTeam(league2.id, team.id);

    const response = await request(app)
      .get(`/leagues/team/${team.id}`)
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("leaguesArray");
    expect(Array.isArray(response.body.leaguesArray)).toBe(true);
    expect(response.body.leaguesArray.length).toBe(2);

    // Verify structure of league objects
    response.body.leaguesArray.forEach((league: any) => {
      expect(league).toHaveProperty("id");
      expect(league).toHaveProperty("name");
      expect(league).toHaveProperty("contractLeagueTeamId");
    });

    // Verify leagues are sorted by id
    const ids = response.body.leaguesArray.map((l: any) => l.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).get("/leagues/team/1");

    expect(response.status).toBe(401);
  });
});
