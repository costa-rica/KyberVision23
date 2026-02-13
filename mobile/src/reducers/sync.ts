import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VideoObject, VideoSession } from "./review";

// Types for sync reducer state
export interface SyncState {
	syncReducerSelectedVideoObject: VideoObject | null;
	syncReducerSelectedSessionObject: VideoSession | null;
	syncReducerScriptsArray: any[];
}

const initialState: SyncState = {
	syncReducerSelectedVideoObject: null,
	syncReducerSelectedSessionObject: null,
	syncReducerScriptsArray: [],
};

export const syncSlice = createSlice({
	name: "sync",
	initialState,
	reducers: {
		updateSyncReducerSelectedVideoObject: (
			state,
			action: PayloadAction<VideoObject>
		) => {
			state.syncReducerSelectedVideoObject = action.payload;
		},
		updateSyncReducerSelectedSessionObject: (
			state,
			action: PayloadAction<VideoSession>
		) => {
			state.syncReducerSelectedSessionObject = action.payload;
		},
		updateSyncReducerScriptsArray: (
			state,
			action: PayloadAction<any[]>
		) => {
			state.syncReducerScriptsArray = action.payload;
		},
	},
});

export const {
	updateSyncReducerSelectedVideoObject,
	updateSyncReducerSelectedSessionObject,
	updateSyncReducerScriptsArray,
} = syncSlice.actions;

export default syncSlice.reducer;