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
import { initModels, sequelize, User, Team, Player, ContractTeamPlayer } from "@kybervision/db";
import { createTestUser, createTestTeam, createTestLeague, createContractLeagueTeam, createTestPlayer, authHeader } from "./helpers";

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
  await Team.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
  await Player.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("GET /teams", () => {
  it("should return 200 with { result: true, teams }", async () => {
    const testUser = await createTestUser();
    await createTestTeam(testUser.id, { teamName: "Test Team 1" });
    await createTestTeam(testUser.id, { teamName: "Test Team 2" });

    const response = await request(app)
      .get("/teams")
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("teams");
    expect(Array.isArray(response.body.teams)).toBe(true);
    expect(response.body.teams.length).toBeGreaterThanOrEqual(2);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).get("/teams");

    expect(response.status).toBe(401);
  });
});

describe("POST /teams/create", () => {
  it("should return 200 with { result: true, teamNew } on valid input", async () => {
    const testUser = await createTestUser();
    const league = await createTestLeague({ name: "Test League" });

    const response = await request(app)
      .post("/teams/create")
      .set(authHeader(testUser.token))
      .send({
        teamName: "New Test Team",
        description: "Team description",
        leagueName: "Test League",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("teamNew");
    expect(response.body.teamNew.teamName).toBe("New Test Team");
  });

  it("should create team with players when playersArray provided", async () => {
    const testUser = await createTestUser();
    const league = await createTestLeague({ name: "Test League" });

    const response = await request(app)
      .post("/teams/create")
      .set(authHeader(testUser.token))
      .send({
        teamName: "Team with Players",
        description: "Team description",
        leagueName: "Test League",
        playersArray: [
          { firstName: "John", lastName: "Doe" },
          { firstName: "Jane", lastName: "Smith" },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("teamNew");

    // Verify players were created and linked to team
    const players = await Player.findAll({
      include: [
        {
          model: ContractTeamPlayer,
          where: { teamId: response.body.teamNew.id },
        },
      ],
    });
    expect(players.length).toBe(2);
  });
});

describe("POST /teams/update-visibility", () => {
  it("should return 200 with { result: true, team }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id, {
      teamName: "Visibility Test Team",
      visibility: "Private",
    });

    const response = await request(app)
      .post("/teams/update-visibility")
      .set(authHeader(testUser.token))
      .send({
        teamId: team.id,
        visibility: "Public",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("team");
    expect(response.body.team.visibility).toBe("Public");
  });

  it("should return 404 when team not found", async () => {
    const testUser = await createTestUser();

    const response = await request(app)
      .post("/teams/update-visibility")
      .set(authHeader(testUser.token))
      .send({
        teamId: 99999,
        visibility: "Public",
      });

    expect(response.status).toBe(404);
  });
});

describe("POST /teams/add-player", () => {
  it("should return 200 with { result: true, playerNew }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);

    const response = await request(app)
      .post("/teams/add-player")
      .set(authHeader(testUser.token))
      .send({
        teamId: team.id,
        firstName: "New",
        lastName: "Player",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("playerNew");
    expect(response.body.playerNew.firstName).toBe("New");
    expect(response.body.playerNew.lastName).toBe("Player");
  });
});

describe("DELETE /teams/player", () => {
  it("should return 200 with { result: true }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const player = await createTestPlayer(team.id, {
      firstName: "Delete",
      lastName: "Me",
    });

    const response = await request(app)
      .delete("/teams/player")
      .set(authHeader(testUser.token))
      .send({
        teamId: team.id,
        playerId: player.id,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);

    // Verify player-team link was deleted
    const contractTeamPlayer = await ContractTeamPlayer.findOne({
      where: { teamId: team.id, playerId: player.id },
    });
    expect(contractTeamPlayer).toBeNull();
  });
});

describe("GET /teams/public", () => {
  it("should return 200 with { result: true, publicTeamsArray }", async () => {
    const testUser = await createTestUser();
    await createTestTeam(testUser.id, {
      teamName: "Public Team 1",
      visibility: "Public",
    });
    await createTestTeam(testUser.id, {
      teamName: "Public Team 2",
      visibility: "Public",
    });
    await createTestTeam(testUser.id, {
      teamName: "Private Team",
      visibility: "Private",
    });

    const response = await request(app)
      .get("/teams/public")
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("publicTeamsArray");
    expect(Array.isArray(response.body.publicTeamsArray)).toBe(true);
    // Should only return public teams
    expect(response.body.publicTeamsArray.length).toBe(2);
    response.body.publicTeamsArray.forEach((team: any) => {
      expect(team.visibility).toBe("Public");
    });
  });
});
