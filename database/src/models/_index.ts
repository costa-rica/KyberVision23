// src/models/_index.ts
import { sequelize } from "./_connection";

import { initUser, User } from "./User";
import {
	initContractUserAction,
	ContractUserAction,
} from "./ContractUserAction";
import { initAction, Action } from "./Action";
import { initLeague, League } from "./League";
import { initTeam, Team } from "./Team";
import { initPlayer, Player } from "./Player";
import { initSession, Session } from "./Session";
import { initVideo, Video } from "./Video";
import { initScript, Script } from "./Script";
import { initComplex, Complex } from "./Complex";
import {
	initContractTeamPlayer,
	ContractTeamPlayer,
} from "./ContractTeamPlayer";
import {
	initContractVideoAction,
	ContractVideoAction,
} from "./ContractVideoAction";
import { initContractTeamUser, ContractTeamUser } from "./ContractTeamUser";
import {
	initContractLeagueTeam,
	ContractLeagueTeam,
} from "./ContractLeagueTeam";
import {
	initContractPlayerUser,
	ContractPlayerUser,
} from "./ContractPlayerUser";
import {
	initOpponentServeTimestamp,
	OpponentServeTimestamp,
} from "./OpponentServeTimestamp";
import {
	initPendingInvitations,
	PendingInvitations,
} from "./PendingInvitations";
import { initPing, Ping } from "./Ping";
import { applyAssociations } from "./_associations";

/** Initialize all models and associations once per process. */
export function initModels() {
	initUser();
	initContractUserAction();
	initAction();
	initLeague();
	initTeam();
	initPlayer();
	initSession();
	initVideo();
	initScript();
	initComplex();
	initContractTeamPlayer();
	initContractVideoAction();
	initContractTeamUser();
	initContractLeagueTeam();
	initContractPlayerUser();
	initOpponentServeTimestamp();
	initPendingInvitations();
	initPing();
	applyAssociations();

	return {
		sequelize,
		User,
		ContractUserAction,
		Action,
		League,
		Team,
		Player,
		Session,
		Video,
		Script,
		Complex,
		ContractTeamPlayer,
		ContractVideoAction,
		ContractTeamUser,
		ContractLeagueTeam,
		ContractPlayerUser,
		OpponentServeTimestamp,
		PendingInvitations,
		Ping,
	};
}

// 👇 Export named items for consumers
export {
	sequelize,
	User,
	ContractUserAction,
	Action,
	League,
	Team,
	Player,
	Session,
	Video,
	Script,
	Complex,
	ContractTeamPlayer,
	ContractVideoAction,
	ContractTeamUser,
	ContractLeagueTeam,
	ContractPlayerUser,
	OpponentServeTimestamp,
	PendingInvitations,
	Ping,
};
