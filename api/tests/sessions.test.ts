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
  Session,
  League,
  ContractLeagueTeam,
  Script,
  Action,
  Video,
  ContractVideoAction,
  Player,
  ContractTeamPlayer,
} from "@kybervision/db";
import {
  createTestUser,
  createTestTeam,
  createTestLeague,
  createContractLeagueTeam,
  createTestSession,
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
});

beforeEach(async () => {
  // Clear all tables before each test - order matters for foreign keys
  await Action.destroy({ where: {}, truncate: true, cascade: true });
  await ContractVideoAction.destroy({ where: {}, truncate: true, cascade: true });
  await Script.destroy({ where: {}, truncate: true, cascade: true });
  await Video.destroy({ where: {}, truncate: true, cascade: true });
  await Session.destroy({ where: {}, truncate: true, cascade: true });
  await ContractTeamPlayer.destroy({ where: {}, truncate: true, cascade: true });
  await Player.destroy({ where: {}, truncate: true, cascade: true });
  await ContractLeagueTeam.destroy({ where: {}, truncate: true, cascade: true });
  await League.destroy({ where: {}, truncate: true, cascade: true });
  await Team.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });

  // Reset SQLite auto-increment sequences
  await sequelize.query("DELETE FROM sqlite_sequence");
});

afterAll(async () => {
  await sequelize.close();
});

describe("GET /sessions/:teamId", () => {
  it("should return 200 with { result: true, sessionsArray }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const league = await createTestLeague();
    const contractLeagueTeam = await createContractLeagueTeam(league.id, team.id);

    await createTestSession(team.id, contractLeagueTeam.id, {
      sessionName: "Session 1",
    });
    await createTestSession(team.id, contractLeagueTeam.id, {
      sessionName: "Session 2",
    });

    const response = await request(app)
      .get(`/sessions/${team.id}`)
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("sessionsArray");
    expect(Array.isArray(response.body.sessionsArray)).toBe(true);
    expect(response.body.sessionsArray.length).toBe(2);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).get("/sessions/1");

    expect(response.status).toBe(401);
  });
});

describe("POST /sessions/create", () => {
  it("should return 200 with { result: true, sessionNew } on valid input", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const league = await createTestLeague();
    const contractLeagueTeam = await createContractLeagueTeam(league.id, team.id);

    const response = await request(app)
      .post("/sessions/create")
      .set(authHeader(testUser.token))
      .send({
        teamId: team.id,
        contractLeagueTeamId: contractLeagueTeam.id,
        sessionDate: new Date().toISOString(),
        sessionName: "New Session",
        sessionCity: "Test City",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("sessionNew");
    expect(response.body.sessionNew.sessionName).toBe("New Session");
  });

  it("should return 404 when contractLeagueTeamId not found", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);

    const response = await request(app)
      .post("/sessions/create")
      .set(authHeader(testUser.token))
      .send({
        teamId: team.id,
        contractLeagueTeamId: 99999,
        sessionDate: new Date().toISOString(),
        sessionName: "Invalid Session",
        sessionCity: "Test City",
      });

    expect(response.status).toBe(404);
  });
});

describe("POST /sessions/review-selection-screen/get-actions", () => {
  it("should return 200 with { result: true, actionsArray, playerDbObjectsArray }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const league = await createTestLeague();
    const contractLeagueTeam = await createContractLeagueTeam(league.id, team.id);
    const session = await createTestSession(team.id, contractLeagueTeam.id);
    const player = await createTestPlayer(team.id);

    // Create a script with actions
    const script = await Script.create({
      sessionId: session.id,
    });

    await Action.create({
      scriptId: script.id,
      playerId: player.id,
      type: 1,
      quality: "good",
      timestamp: new Date(),
      area: "center",
      setNumber: 1,
      scoreTeamAnalyzed: 0,
      scoreTeamOther: 0,
    });

    // Create a video for the session
    const video = await Video.create({
      sessionId: session.id,
      filename: "test.mp4",
      processingCompleted: true,
    });

    const response = await request(app)
      .post("/sessions/review-selection-screen/get-actions")
      .set(authHeader(testUser.token))
      .send({
        sessionId: session.id,
        videoId: video.id,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("actionsArray");
    expect(response.body).toHaveProperty("playerDbObjectsArray");
    expect(Array.isArray(response.body.actionsArray)).toBe(true);
    expect(Array.isArray(response.body.playerDbObjectsArray)).toBe(true);
  });
});

describe("GET /sessions/scripting-sync-video/:sessionId/actions", () => {
  it("should return 200 with { result: true, actionsArray }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const league = await createTestLeague();
    const contractLeagueTeam = await createContractLeagueTeam(league.id, team.id);
    const session = await createTestSession(team.id, contractLeagueTeam.id);
    const player = await createTestPlayer(team.id);

    // Create a script with actions
    const script = await Script.create({
      sessionId: session.id,
    });

    await Action.create({
      scriptId: script.id,
      playerId: player.id,
      type: 1,
      quality: "good",
      timestamp: new Date(),
      area: "center",
      setNumber: 1,
      scoreTeamAnalyzed: 0,
      scoreTeamOther: 0,
    });

    await Action.create({
      scriptId: script.id,
      playerId: player.id,
      type: 2,
      quality: "excellent",
      timestamp: new Date(),
      area: "left",
      setNumber: 1,
      scoreTeamAnalyzed: 0,
      scoreTeamOther: 0,
    });

    const response = await request(app)
      .get(`/sessions/scripting-sync-video/${session.id}/actions`)
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("actionsArray");
    expect(Array.isArray(response.body.actionsArray)).toBe(true);
    expect(response.body.actionsArray.length).toBe(2);
  });
});

describe("GET /sessions/scripting-sync-video-screen/get-actions-for-syncing/:sessionId", () => {
  it("should return 200 with { result: true, actionsArrayByScript }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const league = await createTestLeague();
    const contractLeagueTeam = await createContractLeagueTeam(league.id, team.id);
    const session = await createTestSession(team.id, contractLeagueTeam.id);
    const player = await createTestPlayer(team.id);

    // Create a script with actions
    const script = await Script.create({
      sessionId: session.id,
    });

    await Action.create({
      scriptId: script.id,
      playerId: player.id,
      type: 1,
      quality: "good",
      timestamp: new Date(),
      area: "center",
      setNumber: 1,
      scoreTeamAnalyzed: 0,
      scoreTeamOther: 0,
    });

    const response = await request(app)
      .get(`/sessions/scripting-sync-video-screen/get-actions-for-syncing/${session.id}`)
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("actionsArrayByScript");
    expect(Array.isArray(response.body.actionsArrayByScript)).toBe(true);
  });
});
