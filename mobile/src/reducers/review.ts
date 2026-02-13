import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Types for review reducer state
export interface VideoSession {
	id: number;
	sessionDate: string;
	city: string;
	createdAt: string;
	updatedAt: string;
	teamId: number;
	teamName: string;
	teamCity: string | null;
	teamCoach: string | null;
}

export interface ContractTeamUser {
	id: number;
	teamId: number;
	userId: number;
}

export interface VideoObject {
	id: number;
	sessionId: number;
	contractTeamUserId: number;
	filename: string;
	url: string;
	videoFileCreatedDateTimeEstimate: string | null;
	videoFileSizeInMb: number;
	pathToVideoFile: string;
	processingCompleted: boolean;
	processingFailed: boolean;
	youTubeVideoId: string;
	originalVideoFilename: string;
	createdAt: string;
	updatedAt: string;
	ContractTeamUser: ContractTeamUser;
	session: VideoSession;
	selected?: boolean;
}

export interface ReviewAction {
	actionsDbTableId: number;
	reviewVideoActionsArrayIndex: number;
	playerId: number;
	timestamp: number;
	type: string;
	subtype: string | null;
	quality: string;
	isDisplayed: boolean;
	isFavorite: boolean;
	isPlaying: boolean;
}

export interface PlayerDbObject {
	id: number;
	firstName: string;
	lastName: string;
	shirtNumber: number;
	birthDate: string;
	isDisplayed: boolean;
}

export interface ReviewState {
	reviewReducerVideoObject: VideoObject | null;
	reviewReducerActionsArray: ReviewAction[];
	reviewReducerListOfPlayerDbObjects: PlayerDbObject[];
	isFavoriteToggle: boolean;
	selectedActionObject: ReviewAction | null;
	selectedVideoObjectTimeEnd: number | null;
}

const initialState: ReviewState = {
	reviewReducerVideoObject: null,
	reviewReducerActionsArray: [],
	reviewReducerListOfPlayerDbObjects: [],
	isFavoriteToggle: false,
	selectedActionObject: null,
	selectedVideoObjectTimeEnd: null,
};

export const reviewSlice = createSlice({
	name: "review",
	initialState,
	reducers: {
		updateReviewReducerVideoObject: (
			state,
			action: PayloadAction<VideoObject>
		) => {
			state.reviewReducerVideoObject = action.payload;
			console.log(`- dans Redux: updateReviewReducerVideoObject 🔔`);
		},
		createReviewActionsArray: (
			state,
			action: PayloadAction<ReviewAction[]>
		) => {
			state.reviewReducerActionsArray = action.payload;
		},
		createReviewActionsArrayUniquePlayersNamesAndObjects: (
			state,
			action: PayloadAction<{ playerDbObjectsArray: PlayerDbObject[] }>
		) => {
			state.reviewReducerListOfPlayerDbObjects = action.payload.playerDbObjectsArray;
		},

		updateReviewReducerIsPlayingForActionsArrayV6: (
			state,
			action: PayloadAction<number>
		) => {
			const currentTime = action.payload;

			const allowNewActionBool = (action: ReviewAction) => {
				if (action.timestamp >= currentTime - 1) {
					if (action.timestamp <= currentTime + 2) {
						return true;
					}
				} else {
					return false;
				}
			};

			state.reviewReducerActionsArray = state.reviewReducerActionsArray.map(
				(action) => {
					if (allowNewActionBool(action)) {
						return { ...action, isPlaying: true };
					} else {
						return { ...action, isPlaying: false };
					}
				}
			);
		},

		pressedActionInReviewReducerActionArray: (
			state,
			action: PayloadAction<ReviewAction>
		) => {
			state.selectedActionObject = action.payload;
			const updateActionIsPlaying = {
				...action.payload,
				isPlaying: true,
			};

			state.reviewReducerActionsArray = state.reviewReducerActionsArray.map(
				(action) => ({
					...action,
					isPlaying:
						action.isDisplayed &&
						action.reviewVideoActionsArrayIndex ===
							updateActionIsPlaying.reviewVideoActionsArrayIndex,
				})
			);
		},

		filterReviewReducerActionsArrayOnPlayer: (
			state,
			action: PayloadAction<PlayerDbObject>
		) => {
			const playerId = action.payload.id;

			const player = state.reviewReducerListOfPlayerDbObjects.find(
				(p) => p.id === playerId
			);
			if (player) {
				player.isDisplayed = !player.isDisplayed;
			}

			state.reviewReducerActionsArray = state.reviewReducerActionsArray.map(
				(action) => {
					if (state.isFavoriteToggle) {
						return action.playerId === playerId && action.isFavorite
							? { ...action, isDisplayed: !action.isDisplayed }
							: action;
					} else {
						return action.playerId === playerId
							? { ...action, isDisplayed: !action.isDisplayed }
							: action;
					}
				}
			);
		},

		toggleReviewReducerActionIsFavorite: (
			state,
			action: PayloadAction<number>
		) => {
			const actionsDbTableId = action.payload;

			state.reviewReducerActionsArray = state.reviewReducerActionsArray.map(
				(item) =>
					item.actionsDbTableId === actionsDbTableId
						? { ...item, isFavorite: !item.isFavorite }
						: item
			);
		},

		filterReviewReducerActionsArrayOnIsFavorite: (state) => {
			state.isFavoriteToggle = !state.isFavoriteToggle;

			state.reviewReducerActionsArray = state.reviewReducerActionsArray.map(
				(actionItem) => {
					const matchingPlayer = state.reviewReducerListOfPlayerDbObjects.find(
						(player) => player.id === actionItem.playerId
					);

					if (!matchingPlayer) {
						return actionItem;
					}

					if (state.isFavoriteToggle) {
						return {
							...actionItem,
							isDisplayed: actionItem.isFavorite
								? matchingPlayer.isDisplayed
								: false,
						};
					}

					return {
						...actionItem,
						isDisplayed: matchingPlayer.isDisplayed,
					};
				}
			);
		},

		filterReviewReducerActionsArrayShowAll: (state) => {
			state.reviewReducerActionsArray = state.reviewReducerActionsArray.map(
				(action) => ({
					...action,
					isDisplayed: true,
				})
			);
			state.isFavoriteToggle = false;
			state.reviewReducerListOfPlayerDbObjects =
				state.reviewReducerListOfPlayerDbObjects.map((player) => ({
					...player,
					isDisplayed: true,
				}));
		},

		clearReviewReducer: (state) => {
			state.reviewReducerVideoObject = null;
			state.reviewReducerActionsArray = [];
			state.reviewReducerListOfPlayerDbObjects = [];
			state.isFavoriteToggle = false;
			state.selectedActionObject = null;
			state.selectedVideoObjectTimeEnd = null;
		},
	},
});

export const {
	updateReviewReducerVideoObject,
	createReviewActionsArray,
	createReviewActionsArrayUniquePlayersNamesAndObjects,
	filterReviewReducerActionsArrayOnPlayer,
	toggleReviewReducerActionIsFavorite,
	filterReviewReducerActionsArrayOnIsFavorite,
	filterReviewReducerActionsArrayShowAll,
	pressedActionInReviewReducerActionArray,
	updateReviewReducerIsPlayingForActionsArrayV6,
	clearReviewReducer,
} = reviewSlice.actions;

export default reviewSlice.reducer;

// // Export types for use in components
// export type { ReviewState };
