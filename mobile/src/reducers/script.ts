import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interfaces
export interface Session {
	id: number;
	sessionDate: string;
	sessionName: string;
	city: string;
	selected: boolean;
	sessionDateString?: string;
}

export interface SessionAction {
	dateScripted: string;
	timestamp: number;
	type: string;
	subtype: string | null;
	quality: string;
	playerId: string;
	scriptId: number | null;
	newAction: boolean;
	pointId: string;
	// zone?: number;
	area: number;
	favorite?: boolean;
	scoreTeamAnalyzed: number;
	scoreTeamOther: number;
	setNumber: number;
	// currentPointWonByTeam?: "analyzed" | "opponent" | null;
	currentRallyServer: "analyzed" | "opponent" | null;
}

export interface SessionPoint {
	pointId: string;
	setNumber: number;
	scoreTeamAnalyzed: number;
	scoreTeamOpponent: number;
	rotation: string;
	opponentServed: boolean;
	favorite: boolean;
}

export interface Player {
	id: number;
	firstName: string;
	lastName: string;
	shirtNumber: number;
	positionArea?: number | null;
	selected?: boolean;
}

export interface ScriptingPlayerObject {
	id: number;
	firstName: string;
	lastName: string;
	shirtNumber: number;
}

export interface ScriptingTeamObject {
	id: number;
	name: string;
}

export interface Coordinates {
	x: number | null;
	y: number | null;
	width: number | null;
	height: number | null;
}

export interface ScriptState {
	scriptId: number | null;
	sessionsArray: Session[];
	sessionActionsArray: SessionAction[];
	sessionPointsTableArray: SessionPoint[];
	playersArray: Player[];
	scriptingPlayerCount: number | null;
	scriptingForPlayerObject: ScriptingPlayerObject | null;
	scriptingTeamObject: ScriptingTeamObject | null;
	typesArray: readonly string[];
	subtypesByType: Record<string, readonly string[]>;
	qualityArrayOuterCircle: readonly string[];
	qualityArray: readonly string[];
	rotationArray: readonly string[];
	positionalAreasArray: readonly number[];
	playerObjectPositionalArray: Player[];
	pointsArray: readonly number[];
	setOptionsArray: readonly number[];
	coordsScriptLivePortraitContainerMiddle: Coordinates;
	coordsScriptLivePortraitVwPlayerSuperSpacer: Coordinates;
	coordsScriptLiveLandscapeContainerLeft: Coordinates;
	coordsScriptLiveLandscapeContainerMiddleTop: Coordinates;
	coordsScriptLiveLandscapeContainerMiddleBottom: Coordinates;
	coordsScriptLiveLandscapeVwPlayerSuper: Coordinates;
	coordsScriptLiveLandscapeVwBelowSvgVolleyballCourt: Coordinates;
	coordsScriptLivePortraitSvgCourt: Coordinates;
	coordsScriptLiveLandscapeSvgCourt: Coordinates;
}

const initialState: ScriptState = {
	scriptId: null,
	sessionsArray: [],
	sessionActionsArray: [],
	sessionPointsTableArray: [],
	playersArray: [],
	scriptingPlayerCount: null,
	scriptingForPlayerObject: null,
	scriptingTeamObject: null,
	typesArray: ["Bl", "Def", "Set", "Att", "Serve", "Reception"] as const,
	subtypesByType: {
		Serve: [
			"Default (Power serve)",
			"Float (or jump float)",
			"Spin (or jump spin)",
			"Hybrid",
		] as const,
		Bl: ["1 player", "2 players (default)", "3 players"] as const,
		Def: ["Dig (default)", "Attack cover", "Tip cover", "Freeball"] as const,
		Reception: ["Default (Pass)", "Overhead", "Dive"] as const,
		Set: [
			"Second tempo (default)",
			"First tempo",
			"High ball",
			"Negative tempo",
		] as const,
		Att: [
			"Power (default)",
			"Fake (or Tip or Deep shot)",
			"Block Out attempt",
			"Block Touch attempt",
			"First hand (or pushed)",
			"Over the net fight",
			"Freeball",
			"Block recycle",
			"Roll shot",
			"Off Speed",
		] as const,
	} as const,
	qualityArrayOuterCircle: [
		"0",
		"-",
		"+",
		"0",
		"-",
		"-",
		"0",
		"+",
		"-",
		"0",
		"+",
		"+",
		"tap",
	] as const,
	qualityArray: ["=", "-", "0", "+", "#"] as const,
	rotationArray: ["P1", "P2", "P3", "P4", "P5", "P6"] as const,
	positionalAreasArray: Array.from(
		{ length: 6 },
		(_, i) => i + 1
	) as readonly number[],
	playerObjectPositionalArray: [],
	pointsArray: Array.from({ length: 50 }, (_, i) => i) as readonly number[],
	setOptionsArray: Array.from({ length: 4 }, (_, i) => i) as readonly number[],
	coordsScriptLivePortraitContainerMiddle: {
		x: null,
		y: null,
		width: null,
		height: null,
	},
	coordsScriptLivePortraitVwPlayerSuperSpacer: {
		x: null,
		y: null,
		width: null,
		height: null,
	},
	coordsScriptLiveLandscapeContainerLeft: {
		x: null,
		y: null,
		width: null,
		height: null,
	},
	coordsScriptLiveLandscapeContainerMiddleTop: {
		x: null,
		y: null,
		width: null,
		height: null,
	},
	coordsScriptLiveLandscapeContainerMiddleBottom: {
		x: null,
		y: null,
		width: null,
		height: null,
	},
	coordsScriptLiveLandscapeVwPlayerSuper: {
		x: null,
		y: null,
		width: null,
		height: null,
	},
	coordsScriptLiveLandscapeVwBelowSvgVolleyballCourt: {
		x: null,
		y: null,
		width: null,
		height: null,
	},
	coordsScriptLivePortraitSvgCourt: {
		x: null,
		y: null,
		width: null,
		height: null,
	},
	coordsScriptLiveLandscapeSvgCourt: {
		x: null,
		y: null,
		width: null,
		height: null,
	},
};

export const scriptSlice = createSlice({
	name: "script",
	initialState,
	reducers: {
		updateScriptSessionActionsArray: (
			state,
			action: PayloadAction<SessionAction[]>
		) => {
			// console.log("--> updateScriptSessionActionsArray");
			state.sessionActionsArray = action.payload;
		},
		updateScriptingPlayerCount: (state, action: PayloadAction<number>) => {
			state.scriptingPlayerCount = action.payload;
		},
		updateQualityPropertyInObjectOfSessionActionsArray: (
			state,
			action: PayloadAction<{ timestamp: number; quality: string }>
		) => {
			const { timestamp, quality } = action.payload;
			const index = state.sessionActionsArray.findIndex(
				(obj) => obj.timestamp === timestamp
			);
			if (index !== -1) {
				const updatedObject = { ...state.sessionActionsArray[index], quality };
				const updatedArray = [
					...state.sessionActionsArray.slice(0, index),
					updatedObject,
					...state.sessionActionsArray.slice(index + 1),
				];
				state.sessionActionsArray = updatedArray.sort(
					(a, b) => a.timestamp - b.timestamp
				);
			}
		},
		updateTypePropertyInObjectOfSessionActionsArray: (
			state,
			action: PayloadAction<{ timestamp: number; type: string }>
		) => {
			const { timestamp, type } = action.payload;
			const index = state.sessionActionsArray.findIndex(
				(obj) => obj.timestamp === timestamp
			);
			if (index !== -1) {
				const updatedObject = { ...state.sessionActionsArray[index], type };
				const updatedArray = [
					...state.sessionActionsArray.slice(0, index),
					updatedObject,
					...state.sessionActionsArray.slice(index + 1),
				];
				state.sessionActionsArray = updatedArray.sort(
					(a, b) => a.timestamp - b.timestamp
				);
			}
		},
		updateSubtypePropertyInObjectOfSessionActionsArray: (
			state,
			action: PayloadAction<{ timestamp: number; subtype: string }>
		) => {
			const { timestamp, subtype } = action.payload;
			const index = state.sessionActionsArray.findIndex(
				(obj) => obj.timestamp === timestamp
			);
			if (index !== -1) {
				const updatedObject = { ...state.sessionActionsArray[index], subtype };
				const updatedArray = [
					...state.sessionActionsArray.slice(0, index),
					updatedObject,
					...state.sessionActionsArray.slice(index + 1),
				];
				state.sessionActionsArray = updatedArray.sort(
					(a, b) => a.timestamp - b.timestamp
				);
			}
		},
		updateSessionPointsTableArray: (
			state,
			action: PayloadAction<{ sessionPointsTableArray: SessionPoint[] }>
		) => {
			state.sessionPointsTableArray = action.payload.sessionPointsTableArray;
		},
		setScriptingForPlayerObject: (
			state,
			action: PayloadAction<ScriptingPlayerObject | null>
		) => {
			state.scriptingForPlayerObject = action.payload;
		},
		setScriptingTeamObject: (
			state,
			action: PayloadAction<ScriptingTeamObject>
		) => {
			state.scriptingTeamObject = action.payload;
		},
		updateCoordsScriptLivePortraitContainerMiddle: (
			state,
			action: PayloadAction<Coordinates>
		) => {
			state.coordsScriptLivePortraitContainerMiddle = action.payload;
		},
		updatePlayersArray: (state, action: PayloadAction<Player[]>) => {
			state.playersArray = action.payload;
		},
		updateSessionsArray: (state, action: PayloadAction<Session[]>) => {
			state.sessionsArray = action.payload;
		},
		updateCoordsScriptLiveLandscapeContainerLeft: (
			state,
			action: PayloadAction<Coordinates>
		) => {
			state.coordsScriptLiveLandscapeContainerLeft = action.payload;
		},
		updateCoordsScriptLiveLandscapeContainerMiddleTop: (
			state,
			action: PayloadAction<Coordinates>
		) => {
			state.coordsScriptLiveLandscapeContainerMiddleTop = action.payload;
		},
		updateCoordsScriptLiveLandscapeContainerMiddleBottom: (
			state,
			action: PayloadAction<Coordinates>
		) => {
			state.coordsScriptLiveLandscapeContainerMiddleBottom = action.payload;
		},
		updateCoordsScriptLivePortraitVwPlayerSuperSpacer: (
			state,
			action: PayloadAction<Coordinates>
		) => {
			state.coordsScriptLivePortraitVwPlayerSuperSpacer = action.payload;
		},
		updateCoordsScriptLiveLandscapeVwPlayerSuper: (
			state,
			action: PayloadAction<Coordinates>
		) => {
			state.coordsScriptLiveLandscapeVwPlayerSuper = action.payload;
		},
		updateCoordsScriptLiveLandscapeVwBelowSvgVolleyballCourt: (
			state,
			action: PayloadAction<Coordinates>
		) => {
			state.coordsScriptLiveLandscapeVwBelowSvgVolleyballCourt = action.payload;
		},
		updateCoordsScriptLivePortraitSvgCourt: (
			state,
			action: PayloadAction<Coordinates>
		) => {
			state.coordsScriptLivePortraitSvgCourt = action.payload;
		},
		updateCoordsScriptLiveLandscapeSvgCourt: (
			state,
			action: PayloadAction<Coordinates>
		) => {
			state.coordsScriptLiveLandscapeSvgCourt = action.payload;
		},
		createPlayerArrayPositionProperties: (
			state,
			action: PayloadAction<Player[]>
		) => {
			// derive a fresh array with positions (no mutation of payload)
			const withPositions = action.payload.map((player, index) => ({
				...player,
				positionArea: index < 6 ? index + 1 : null,
			}));

			// make a rest of players array which is all the players from the playersArray that are not in the withPositions array
			const restOfPlayers = state.playersArray.filter((player) => {
				return !withPositions.find((p) => p.id === player.id);
			});

			// (optional but helpful) keep playersArray in sync with the derived positions
			state.playersArray = [...withPositions, ...restOfPlayers];

			// helper type (optional but nice)
			type PlayerWithNumberPosition = Omit<Player, "positionArea"> & {
				positionArea: number;
			};

			// keep only the 6 positioned players, ensure it’s strictly numbers 1..6
			state.playerObjectPositionalArray = withPositions.filter(
				(p): p is PlayerWithNumberPosition =>
					typeof p.positionArea === "number" &&
					p.positionArea >= 1 &&
					p.positionArea <= 6
			);
		},
		// createPlayerArrayPositionProperties: (
		// 	state,
		// 	action: PayloadAction<Player[]>
		// ) => {
		// 	action.payload.forEach((player, index) => {
		// 		player.positionArea = index < 6 ? index + 1 : null;
		// 	});
		// 	// state.playerObjectPositionalArray = action.payload.filter(
		// 	// 	(player) => player.positionArea !== null
		// 	// );
		// 	state.playerObjectPositionalArray = action.payload.filter(
		// 		(p): p is Player =>
		// 			typeof p.positionArea === "number" &&
		// 			p.positionArea >= 1 &&
		// 			p.positionArea <= 6
		// 	);
		// },
	},
});

export const {
	updateScriptSessionActionsArray,
	updateScriptingPlayerCount,
	updateQualityPropertyInObjectOfSessionActionsArray,
	updateTypePropertyInObjectOfSessionActionsArray,
	updateSubtypePropertyInObjectOfSessionActionsArray,
	updateSessionPointsTableArray,
	setScriptingForPlayerObject,
	setScriptingTeamObject,
	updateCoordsScriptLivePortraitContainerMiddle,
	updatePlayersArray,
	updateSessionsArray,
	updateCoordsScriptLiveLandscapeContainerLeft,
	updateCoordsScriptLiveLandscapeContainerMiddleTop,
	updateCoordsScriptLiveLandscapeContainerMiddleBottom,
	updateCoordsScriptLivePortraitVwPlayerSuperSpacer,
	updateCoordsScriptLiveLandscapeVwPlayerSuper,
	updateCoordsScriptLiveLandscapeVwBelowSvgVolleyballCourt,
	updateCoordsScriptLivePortraitSvgCourt,
	updateCoordsScriptLiveLandscapeSvgCourt,
	createPlayerArrayPositionProperties,
} = scriptSlice.actions;

export default scriptSlice.reducer;
