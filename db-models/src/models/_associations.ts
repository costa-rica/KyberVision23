import { User } from "./User";
import { ContractUserAction } from "./ContractUserAction";
import { Action } from "./Action";
import { League } from "./League";
import { Team } from "./Team";
import { Player } from "./Player";
import { Session } from "./Session";
import { Video } from "./Video";
import { Script } from "./Script";
import { Complex } from "./Complex";
import { ContractTeamPlayer } from "./ContractTeamPlayer";
import { ContractVideoAction } from "./ContractVideoAction";
import { ContractTeamUser } from "./ContractTeamUser";
import { ContractLeagueTeam } from "./ContractLeagueTeam";
import { ContractPlayerUser } from "./ContractPlayerUser";
import { OpponentServeTimestamp } from "./OpponentServeTimestamp";
import { PendingInvitations } from "./PendingInvitations";

export function applyAssociations(): void {
	// Action & User Associations (0-N)
	Action.hasMany(ContractUserAction, {
		foreignKey: "actionId",
		onDelete: "CASCADE",
	});
	ContractUserAction.belongsTo(Action, { foreignKey: "actionId" });

	// User & Action Associations (0-N)
	User.hasMany(ContractUserAction, {
		foreignKey: "userId",
		onDelete: "CASCADE",
	});
	ContractUserAction.belongsTo(User, { foreignKey: "userId" });

	// Action & Video Associations (0-N)
	Action.hasMany(ContractVideoAction, {
		foreignKey: "actionId",
		onDelete: "CASCADE",
	});
	ContractVideoAction.belongsTo(Action, { foreignKey: "actionId" });

	// Video & Action Associations (0-N)
	Video.hasMany(ContractVideoAction, {
		foreignKey: "videoId",
		onDelete: "CASCADE",
	});
	ContractVideoAction.belongsTo(Video, { foreignKey: "videoId" });

	// Player & Team Associations
	Player.hasMany(ContractTeamPlayer, {
		foreignKey: "playerId",
		onDelete: "CASCADE",
	});
	Team.hasMany(ContractTeamPlayer, {
		foreignKey: "teamId",
		onDelete: "CASCADE",
	});
	ContractTeamPlayer.belongsTo(Player, { foreignKey: "playerId" });
	ContractTeamPlayer.belongsTo(Team, { foreignKey: "teamId" });

	// Player & User Associations
	Player.hasOne(ContractPlayerUser, {
		foreignKey: "playerId",
		onDelete: "CASCADE",
	});
	User.hasOne(ContractPlayerUser, {
		foreignKey: "userId",
		onDelete: "CASCADE",
	});
	ContractPlayerUser.belongsTo(Player, { foreignKey: "playerId" });
	ContractPlayerUser.belongsTo(User, { foreignKey: "userId" });

	// Session & Team Associations
	// Session.belongsTo(Team, { foreignKey: "teamId" });
	Session.belongsTo(Team, {
		foreignKey: "teamId",
		onDelete: "CASCADE", // applies to deleting the *Team* (parent)
	});
	// if a team is deleted all corresponding sessions are deleted

	// Video & Session Association
	// Video.belongsTo(Session, { foreignKey: "sessionId" });
	Video.belongsTo(Session, {
		foreignKey: "sessionId",
		onDelete: "CASCADE", // or "SET NULL" if you prefer to keep videos
	});
	// if a session is deleted all corresponding videos are deleted

	// User & Team Associations: ContractTeamUser (AKA Tribes)
	User.hasMany(ContractTeamUser, { foreignKey: "userId", onDelete: "CASCADE" });
	Team.hasMany(ContractTeamUser, { foreignKey: "teamId", onDelete: "CASCADE" });
	ContractTeamUser.belongsTo(User, { foreignKey: "userId" });
	ContractTeamUser.belongsTo(Team, { foreignKey: "teamId" });

	// Script & Action Associations (1-N)
	Script.hasMany(Action, {
		foreignKey: "scriptId",
		onDelete: "CASCADE",
	});
	Action.belongsTo(Script, { foreignKey: "scriptId" });

	// ContractTeamUser & Video Associations (1-N)
	ContractTeamUser.hasMany(Video, {
		foreignKey: "contractTeamUserId",
		onDelete: "CASCADE",
	});
	Video.belongsTo(ContractTeamUser, { foreignKey: "contractTeamUserId" });

	// League & Team Associations
	League.hasMany(ContractLeagueTeam, {
		foreignKey: "leagueId",
		onDelete: "CASCADE",
	});
	Team.hasMany(ContractLeagueTeam, {
		foreignKey: "teamId",
		onDelete: "CASCADE",
	});
	ContractLeagueTeam.belongsTo(League, { foreignKey: "leagueId" });
	ContractLeagueTeam.belongsTo(Team, { foreignKey: "teamId" });

	// Session cascade deletes to Script
	Session.hasMany(Script, {
		foreignKey: "sessionId",
		onDelete: "CASCADE",
	});
	Script.belongsTo(Session, { foreignKey: "sessionId" });
}
