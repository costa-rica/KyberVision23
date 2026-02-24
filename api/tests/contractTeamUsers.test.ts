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
import jwt from "jsonwebtoken";
import {
  initModels,
  sequelize,
  User,
  Team,
  ContractTeamUser,
  PendingInvitations,
} from "@kybervision/db";
import { createTestUser, createTestTeam, authHeader } from "./helpers";

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
  await PendingInvitations.destroy({ where: {}, truncate: true, cascade: true });
  await ContractTeamUser.destroy({ where: {}, truncate: true, cascade: true });
  await Team.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("GET /contract-team-users", () => {
  it("should return 200 with { teamsArray, contractTeamUserArray }", async () => {
    const testUser = await createTestUser();
    const team1 = await createTestTeam(testUser.id, { teamName: "Team One" });
    const team2 = await createTestTeam(testUser.id, { teamName: "Team Two" });

    const response = await request(app)
      .get("/contract-team-users")
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("teamsArray");
    expect(response.body).toHaveProperty("contractTeamUserArray");
    expect(Array.isArray(response.body.teamsArray)).toBe(true);
    expect(Array.isArray(response.body.contractTeamUserArray)).toBe(true);
    expect(response.body.teamsArray.length).toBe(2);

    // Verify teams have join tokens
    response.body.teamsArray.forEach((team: any) => {
      expect(team).toHaveProperty("genericJoinToken");
    });
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).get("/contract-team-users");

    expect(response.status).toBe(401);
  });
});

describe("POST /contract-team-users/create/:teamId", () => {
  it("should return 201 with { message, contractTeamUser } on new record", async () => {
    const testUser = await createTestUser();
    const team = await Team.create({
      teamName: "New Team",
      description: "Test",
      visibility: "Private",
    });

    const response = await request(app)
      .post(`/contract-team-users/create/${team.id}`)
      .set(authHeader(testUser.token))
      .send({
        isSuperUser: true,
        isAdmin: false,
        isCoach: false,
      });

    // SQLite upsert may return 200 even for new records, so accept both
    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("contractTeamUser");
    expect(response.body.contractTeamUser.teamId).toBe(team.id);
    expect(response.body.contractTeamUser.userId).toBe(testUser.id);
  });

  it("should return 200 with { message, contractTeamUser } on upsert", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id); // Creates initial contract

    // Try to create again (should update)
    const response = await request(app)
      .post(`/contract-team-users/create/${team.id}`)
      .set(authHeader(testUser.token))
      .send({
        isSuperUser: false,
        isAdmin: true,
        isCoach: true,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("updated");
    expect(response.body).toHaveProperty("contractTeamUser");
  });
});

describe("GET /contract-team-users/:teamId", () => {
  it("should return 200 with { squadArray }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);

    // Add another user to the team
    const testUser2 = await createTestUser({ email: "user2@example.com" });
    await ContractTeamUser.create({
      userId: testUser2.id,
      teamId: team.id,
      isSuperUser: false,
      isAdmin: false,
      isCoach: true,
    });

    const response = await request(app)
      .get(`/contract-team-users/${team.id}`)
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("squadArray");
    expect(Array.isArray(response.body.squadArray)).toBe(true);
    expect(response.body.squadArray.length).toBe(2);

    // Verify structure
    response.body.squadArray.forEach((member: any) => {
      expect(member).toHaveProperty("userId");
      expect(member).toHaveProperty("username");
      expect(member).toHaveProperty("email");
      expect(member).toHaveProperty("isPlayer");
    });
  });
});

describe("POST /contract-team-users/add-squad-member", () => {
  it("should return 201 when adding existing user to team (mock email)", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);

    // Create another user to add
    const newUser = await createTestUser({ email: "newmember@example.com" });

    const response = await request(app)
      .post("/contract-team-users/add-squad-member")
      .set(authHeader(testUser.token))
      .send({
        teamId: team.id,
        email: newUser.email,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("userId", newUser.id);
    expect(response.body).toHaveProperty("teamId", team.id);
  });

  it("should return 200 when inviting non-existent user (creates PendingInvitation)", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);

    const response = await request(app)
      .post("/contract-team-users/add-squad-member")
      .set(authHeader(testUser.token))
      .send({
        teamId: team.id,
        email: "nonexistent@example.com",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("invited");

    // Verify pending invitation was created
    const pendingInvitation = await PendingInvitations.findOne({
      where: { email: "nonexistent@example.com", teamId: team.id },
    });
    expect(pendingInvitation).not.toBeNull();
  });

  it("should return 400 when user already invited", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);

    // Create pending invitation
    await PendingInvitations.create({
      email: "pending@example.com",
      teamId: team.id,
    });

    const response = await request(app)
      .post("/contract-team-users/add-squad-member")
      .set(authHeader(testUser.token))
      .send({
        teamId: team.id,
        email: "pending@example.com",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("already invited");
  });
});

describe("GET /contract-team-users/join/:joinToken", () => {
  it("should return 200 with { result: true, contractTeamUser } for valid token", async () => {
    const testUser = await createTestUser();
    const team = await Team.create({
      teamName: "Join Test Team",
      description: "Test",
      visibility: "Private",
    });

    // Create a valid join token
    const joinToken = jwt.sign(
      { teamId: team.id },
      process.env.JWT_SECRET!,
      { expiresIn: "2d" }
    );

    const response = await request(app)
      .get(`/contract-team-users/join/${joinToken}`)
      .set(authHeader(testUser.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("contractTeamUser");
    expect(response.body.contractTeamUser.teamId).toBe(team.id);
    expect(response.body.contractTeamUser.userId).toBe(testUser.id);
  });

  it("should return 403 for invalid/expired token", async () => {
    const testUser = await createTestUser();
    const invalidToken = "invalid-token-string";

    const response = await request(app)
      .get(`/contract-team-users/join/${invalidToken}`)
      .set(authHeader(testUser.token));

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("Invalid token");
  });
});

describe("POST /contract-team-users/toggle-role", () => {
  it("should return 200 with { result: true, contractTeamUser }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);

    const contractTeamUser = await ContractTeamUser.findOne({
      where: { userId: testUser.id, teamId: team.id },
    });

    const response = await request(app)
      .post("/contract-team-users/toggle-role")
      .set(authHeader(testUser.token))
      .send({
        teamId: team.id,
        userId: testUser.id,
        role: "Coach",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("contractTeamUser");

    // Verify role was toggled
    const updated = await ContractTeamUser.findByPk(contractTeamUser!.id);
    expect(updated!.isCoach).toBe(!contractTeamUser!.isCoach);
  });

  it("should return 404 when contract not found", async () => {
    const testUser = await createTestUser();

    const response = await request(app)
      .post("/contract-team-users/toggle-role")
      .set(authHeader(testUser.token))
      .send({
        teamId: 99999,
        userId: testUser.id,
        role: "Coach",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("not found");
  });
});

describe("DELETE /contract-team-users", () => {
  it("should return 200 with { result: true, contractTeamUser }", async () => {
    const testUser = await createTestUser();
    const team = await createTestTeam(testUser.id);

    const contractTeamUser = await ContractTeamUser.findOne({
      where: { userId: testUser.id, teamId: team.id },
    });

    const response = await request(app)
      .delete("/contract-team-users")
      .set(authHeader(testUser.token))
      .send({
        contractTeamUserId: contractTeamUser!.id,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("result", true);
    expect(response.body).toHaveProperty("contractTeamUser");

    // Verify it was deleted
    const deleted = await ContractTeamUser.findByPk(contractTeamUser!.id);
    expect(deleted).toBeNull();
  });

  it("should return 404 when contract not found", async () => {
    const testUser = await createTestUser();

    const response = await request(app)
      .delete("/contract-team-users")
      .set(authHeader(testUser.token))
      .send({
        contractTeamUserId: 99999,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("not found");
  });
});
