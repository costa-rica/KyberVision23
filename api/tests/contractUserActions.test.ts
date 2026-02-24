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
  Player,
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
  await Player.destroy({ where: {}, truncate: true, cascade: true });
  await Team.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("POST /contract-user-actions/update-user-favorites", () => {
  it("should return 200 with { result: true, message }", async () => {
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

    const action1 = await Action.create({
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

    const action2 = await Action.create({
      scriptId: script.id,
      playerId: player.id,
      type: 2,
      quality: "excellent",
      timestamp: new Date(),
      area: "left",
      setNumber: 1,
      scoreTeamAnalyzed: 1,
      scoreTeamOther: 0,
    });

    // Mark actions as favorites
    const actionsArray = [
      { actionsDbTableId: action1.id, isFavorite: true },
      { actionsDbTableId: action2.id, isFavorite: true },
    ];

    const response = await request(app)
      .post("/contract-user-actions/update-user-favorites")
      .set(authHeader(testUser.token))
      .send({
        sessionId: session.id,
        actionsArray,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("favorites updated");

    // Verify favorites were created
    const favorites = await ContractUserAction.findAll({
      where: { userId: testUser.id, sessionId: session.id },
    });
    expect(favorites.length).toBe(2);

    // Test unfavoriting an action
    const updatedActionsArray = [
      { actionsDbTableId: action1.id, isFavorite: true },
      { actionsDbTableId: action2.id, isFavorite: false }, // Unfavorite this one
    ];

    const response2 = await request(app)
      .post("/contract-user-actions/update-user-favorites")
      .set(authHeader(testUser.token))
      .send({
        sessionId: session.id,
        actionsArray: updatedActionsArray,
      });

    expect(response2.status).toBe(200);

    // Verify only one favorite remains
    const favoritesAfterUpdate = await ContractUserAction.findAll({
      where: { userId: testUser.id, sessionId: session.id },
    });
    expect(favoritesAfterUpdate.length).toBe(1);
    expect(favoritesAfterUpdate[0].actionId).toBe(action1.id);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app)
      .post("/contract-user-actions/update-user-favorites")
      .send({
        sessionId: 1,
        actionsArray: [],
      });

    expect(response.status).toBe(401);
  });
});
