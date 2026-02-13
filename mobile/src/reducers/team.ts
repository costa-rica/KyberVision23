import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Types for team reducer state
interface Player {
	id: number;
	firstName: string;
	lastName: string;
	shirtNumber: number;
	birthDate?: string;
	selected: boolean;
	position?: string;
	positionAbbreviation?: string;
	image?: string;
	isUser?: boolean;
	username?: string;
}

interface Team {
	id: number;
	teamName: string;
	city: string;
	coachName: string;
	practiceMatch: string | null;
	selected: boolean;
	genericJoinToken?: string;
	visibility?: string;
	description?: string;
}

interface TeamDetails {
	id: number;
	teamName: string;
	city?: string;
	coachName?: string;
	description?: string;
	// Add other properties as needed
}

interface SquadMember {
	id: number;
	userId: number;
	teamId: number;
	username?: string;
	email?: string;
	isPlayer?: boolean;
	isCoach?: boolean;
	isAdmin?: boolean;
}

interface TeamState {
	playersArray: Player[];
	selectedPlayerObject: Player | null;
	teamDetails: TeamDetails | null;
	teamsArray: Team[];
	squadMembersArray: SquadMember[];
	publicTeamsArray: Team[] | null;
}

const initialState: TeamState = {
	playersArray: [],
	selectedPlayerObject: null,
	teamDetails: null,
	teamsArray: [],
	squadMembersArray: [],
	publicTeamsArray: [],
};

export const teamSlice = createSlice({
	name: "team",
	initialState,
	reducers: {
		updatePlayersArray: (state, action: PayloadAction<Player[]>) => {
			state.playersArray = action.payload;
		},
		updateSelectedPlayerObject: (
			state,
			action: PayloadAction<Player | null>
		) => {
			state.selectedPlayerObject = action.payload;
		},
		updateTeamDetails: (state, action: PayloadAction<TeamDetails | null>) => {
			state.teamDetails = action.payload;
		},
		clearTeamReducer: (state) => {
			state.playersArray = [];
			state.selectedPlayerObject = null;
			state.teamDetails = null;
			console.log("--- cleared all teamReducer state ---");
		},
		updateTeamsArray: (state, action: PayloadAction<Team[]>) => {
			state.teamsArray = action.payload;
		},
		updateSquadMembersArray: (state, action: PayloadAction<SquadMember[]>) => {
			state.squadMembersArray = action.payload;
		},
		updatePublicTeamsArray: (state, action: PayloadAction<Team[]>) => {
			state.publicTeamsArray = action.payload;
		},
	},
});

export const {
	updatePlayersArray,
	updateSelectedPlayerObject,
	updateTeamDetails,
	clearTeamReducer,
	updateTeamsArray,
	updateSquadMembersArray,
	updatePublicTeamsArray,
} = teamSlice.actions;

export default teamSlice.reducer;

// Export types for use in components
export type { TeamState, Player, Team, TeamDetails, SquadMember };
