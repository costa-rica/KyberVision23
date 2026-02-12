import { ContractLeagueTeam, League, Session, Team } from "kybervision23db";

interface SessionResult {
  success: boolean;
  session?: any;
  error?: string;
}

interface SessionWithTeamData {
  [key: string]: any;
  teamId?: number;
  teamName?: string;
  teamCity?: string;
  teamCoach?: string;
}

export async function createSessionWithFreeAgentLeague(
  teamId: number,
): Promise<any | null> {
  try {
    const freeAgentLeague = await League.findOne({
      where: { name: "Free Agent League" },
    });

    if (!freeAgentLeague) {
      console.log("ℹ️  Free Agent league not found. Skipping setup.");
      return null;
    }

    const contractLeagueTeam = await ContractLeagueTeam.create({
      leagueId: freeAgentLeague.id,
      teamId: teamId,
    });

    const session = await Session.create({
      teamId: teamId,
      contractLeagueTeamId: contractLeagueTeam.id,
      city: "Practice",
      sessionDate: new Date(),
    });

    console.log(`✅ Session created with Free Agent league.`);
    return session;
  } catch (err: any) {
    console.error(`❌ Error creating session with Free Agent league:`, err);
    return null;
  }
}

export async function createSession(
  sessionData: Record<string, any>,
): Promise<SessionResult> {
  try {
    const session = await Session.create(sessionData as any);
    return { success: true, session };
  } catch (error: any) {
    console.error("Error creating session:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSession(sessionId: number): Promise<SessionResult> {
  try {
    const session = await Session.findByPk(sessionId);
    if (!session) {
      return { success: false, error: "Session not found" };
    }

    await session.destroy();
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting session:", error);
    return { success: false, error: error.message };
  }
}

export async function getSessionWithTeams(
  sessionId: number,
): Promise<SessionResult> {
  try {
    // Fetch session with team details
    const session = await Session.findByPk(sessionId, {
      include: [
        {
          model: Team,
          attributes: ["id", "teamName", "city", "coachName"],
          required: true,
        },
      ],
      attributes: {
        exclude: ["teamId", "contractLeagueTeamId"],
      },
    });

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    // Access team data through association
    const sessionJSON = session.toJSON() as any;

    // Rename team attributes by prefixing them
    const formattedSession: SessionWithTeamData = {
      ...sessionJSON,
      teamId: sessionJSON.Team?.id,
      teamName: sessionJSON.Team?.teamName,
      teamCity: sessionJSON.Team?.city,
      teamCoach: sessionJSON.Team?.coachName,
    };

    // Remove the nested team objects
    delete formattedSession.Team;

    return { success: true, session: formattedSession };
  } catch (error: any) {
    console.error("Error fetching session with teams:", error);
    return { success: false, error: error.message };
  }
}
