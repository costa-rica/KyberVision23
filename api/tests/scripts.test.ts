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
  Session,
  Script,
  Action,
  ContractUserAction,
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
}, 30000); // 30 second timeout for initialization

beforeEach(async () => {
  // Clear all tables before each test
  await ContractUserAction.destroy({ where: {}, truncate: true, cascade: true });
  await Action.destroy({ where: {}, truncate: true, cascade: true });
  await Script.destroy({ where: {}, truncate: true, cascade: true });
  await Session.destroy({ where: {}, truncate: true, cascade: true });
  await ContractLeagueTeam.destroy({ where: {}, truncate: true, cascade: true });
  await League.destroy({ where: {}, truncate: true, cascade: true });
  await Team.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("POST /scripts/scripting-live-screen/receive-actions-array", () => {
  it("should return 200 with { result: true, message, scriptId, actionsCount }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const league = await createTestLeague();
    const contractLeagueTeam = await createContractLeagueTeam(league.id, team.id);
    const session = await createTestSession(team.id, contractLeagueTeam.id);
    const player = await createTestPlayer(team.id);

    const actionsArray = [
      {
        timestamp: new Date().toISOString(),
        type: "1",
        subtype: null,
        quality: "good",
        playerId: player.id.toString(),
        scriptId: null,
        newAction: true,
        pointId: "1",
        area: 1,
        scoreTeamAnalyzed: 0,
        scoreTeamOther: 0,
        setNumber: 1,
      },
      {
        timestamp: new Date(Date.now() + 1000).toISOString(),
        type: "2",
        subtype: null,
        quality: "excellent",
        playerId: player.id.toString(),
        scriptId: null,
        newAction: true,
        pointId: "2",
        area: 2,
        scoreTeamAnalyzed: 1,
        scoreTeamOther: 0,
        setNumber: 1,
        favorite: true, // This should create a ContractUserAction
      },
    ];

    const response = await request(app)
      .post("/scripts/scripting-live-screen/receive-actions-array")
      .set(authHeader(testUser.token))
      .send({
        actionsArray,
        sessionId: session.id,
        userDeviceTimestamp: new Date().toISOString(),
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("scriptId");
    expect(response.body).toHaveProperty("actionsCount", 2);

    // Verify script was created
    const script = await Script.findByPk(response.body.scriptId);
    expect(script).not.toBeNull();
    expect(script!.sessionId).toBe(session.id);

    // Verify actions were created
    const actions = await Action.findAll({
      where: { scriptId: response.body.scriptId },
    });
    expect(actions.length).toBe(2);

    // Verify favorite action created ContractUserAction
    const contractUserAction = await ContractUserAction.findOne({
      where: { userId: testUser.id, sessionId: session.id },
    });
    expect(contractUserAction).not.toBeNull();
  });

  it("should return 400 when actionsArray is empty", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const league = await createTestLeague();
    const contractLeagueTeam = await createContractLeagueTeam(league.id, team.id);
    const session = await createTestSession(team.id, contractLeagueTeam.id);

    const response = await request(app)
      .post("/scripts/scripting-live-screen/receive-actions-array")
      .set(authHeader(testUser.token))
      .send({
        actionsArray: [],
        sessionId: session.id,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("result", false);
    expect(response.body.error).toContain("Invalid or empty actionsArray");
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app)
      .post("/scripts/scripting-live-screen/receive-actions-array")
      .send({
        actionsArray: [{ test: "data" }],
        sessionId: 1,
      });

    expect(response.status).toBe(401);
  });
});
