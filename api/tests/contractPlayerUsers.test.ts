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
  ContractPlayerUser,
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
  await ContractPlayerUser.destroy({ where: {}, truncate: true, cascade: true });
  await ContractTeamPlayer.destroy({ where: {}, truncate: true, cascade: true });
  await Player.destroy({ where: {}, truncate: true, cascade: true });
  await Team.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("POST /contract-player-users/link-user-to-player", () => {
  it("should return 200 with { result: true, contractPlayerUserObject }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const player = await createTestPlayer(team.id, {
      firstName: "Test",
      lastName: "Player",
    });

    const response = await request(app)
      .post("/contract-player-users/link-user-to-player")
      .set(authHeader(testUser.token))
      .send({
        playerId: player.id,
        userId: testUser.id,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("contractPlayerUserObject");
    expect(response.body.contractPlayerUserObject.playerId).toBe(player.id);
    expect(response.body.contractPlayerUserObject.userId).toBe(testUser.id);

    // Verify the link was created in the database
    const link = await ContractPlayerUser.findOne({
      where: { playerId: player.id, userId: testUser.id },
    });
    expect(link).not.toBeNull();
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app)
      .post("/contract-player-users/link-user-to-player")
      .send({
        playerId: 1,
        userId: 1,
      });

    expect(response.status).toBe(401);
  });
});

describe("DELETE /contract-player-users/:playerId", () => {
  it("should return 200 with { result: true }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const player = await createTestPlayer(team.id, {
      firstName: "Test",
      lastName: "Player",
    });

    // Create a contract player user link
    await ContractPlayerUser.create({
      playerId: player.id,
      userId: testUser.id,
    });

    const response = await request(app)
      .delete(`/contract-player-users/${player.id}`)
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);

    // Verify the link was deleted
    const link = await ContractPlayerUser.findOne({
      where: { playerId: player.id },
    });
    expect(link).toBeNull();
  });
});
