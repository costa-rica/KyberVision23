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
  Video,
  ContractVideoAction,
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
  await ContractVideoAction.destroy({ where: {}, truncate: true, cascade: true });
  await Action.destroy({ where: {}, truncate: true, cascade: true });
  await Video.destroy({ where: {}, truncate: true, cascade: true });
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

describe("POST /contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script", () => {
  it("should return 200 with { result: true, message, scriptId, updatedCount }", async () => {
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

    // Create a video
    const video = await Video.create({
      sessionId: session.id,
      filename: "test-video.mp4",
      processingCompleted: true,
    });

    // Create ContractVideoActions linking actions to video
    await ContractVideoAction.create({
      actionId: action1.id,
      videoId: video.id,
      deltaTimeInSeconds: 0,
    });

    await ContractVideoAction.create({
      actionId: action2.id,
      videoId: video.id,
      deltaTimeInSeconds: 0,
    });

    const response = await request(app)
      .post(
        "/contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script"
      )
      .set(authHeader(testUser.token))
      .send({
        newDeltaTimeInSeconds: 5.5,
        scriptId: script.id,
        videoId: video.id,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("scriptId", script.id);
    expect(response.body).toHaveProperty("updatedCount", 2);

    // Verify delta time was updated
    const updatedContracts = await ContractVideoAction.findAll({
      where: { videoId: video.id },
    });
    updatedContracts.forEach((contract) => {
      expect(contract.deltaTimeInSeconds).toBe(5.5);
    });
  });

  it("should return 404 when script not found", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);
    const league = await createTestLeague();
    const contractLeagueTeam = await createContractLeagueTeam(league.id, team.id);
    const session = await createTestSession(team.id, contractLeagueTeam.id);

    // Create a video
    const video = await Video.create({
      sessionId: session.id,
      filename: "test-video.mp4",
      processingCompleted: true,
    });

    const response = await request(app)
      .post(
        "/contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script"
      )
      .set(authHeader(testUser.token))
      .send({
        newDeltaTimeInSeconds: 5.5,
        scriptId: 99999, // Non-existent script
        videoId: video.id,
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("result", false);
    expect(response.body.message).toContain("not found");
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app)
      .post(
        "/contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script"
      )
      .send({
        newDeltaTimeInSeconds: 5.5,
        scriptId: 1,
        videoId: 1,
      });

    expect(response.status).toBe(401);
  });
});
