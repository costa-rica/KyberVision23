import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "./script";

// Types for upload reducer state
export interface SelectedVideoObject {
	uri: string;
	fileName: string;
	duration: number;
	fileSize: number;
	height: number;
	width: number;
}

export interface DeleteVideoObject {
	id: number;
	filename: string;
	session: {
		id: number;
		sessionDate: string;
	};
}

export interface UploadState {
	uploadReducerSelectedVideoObject: SelectedVideoObject | null;
	uploadReducerLoading: boolean;
	uploadReducerDeleteVideoObject: DeleteVideoObject | null;
	uploadReducerModalUploadVideoSelectedSessionObject: Session | null;
}

const initialState: UploadState = {
	uploadReducerSelectedVideoObject: null,
	uploadReducerLoading: false,
	uploadReducerDeleteVideoObject: null,
	uploadReducerModalUploadVideoSelectedSessionObject: null,
};

export const uploadSlice = createSlice({
	name: "upload",
	initialState,
	reducers: {
		updateUploadReducerSelectedVideoObject: (
			state,
			action: PayloadAction<SelectedVideoObject | null>
		) => {
			state.uploadReducerSelectedVideoObject = action.payload;
		},
		updateUploadReducerLoading: (state, action: PayloadAction<boolean>) => {
			state.uploadReducerLoading = action.payload;
		},
		updateUploadReducerDeleteVideoObject: (
			state,
			action: PayloadAction<DeleteVideoObject | null>
		) => {
			state.uploadReducerDeleteVideoObject = action.payload;
		},
		updateUploadReducerModalUploadVideoSelectedSessionObject: (
			state,
			action: PayloadAction<Session | null>
		) => {
			state.uploadReducerModalUploadVideoSelectedSessionObject = action.payload;
		},
		clearUploadReducer: (state) => {
			state.uploadReducerSelectedVideoObject = null;
			state.uploadReducerLoading = false;
			state.uploadReducerDeleteVideoObject = null;
			state.uploadReducerModalUploadVideoSelectedSessionObject = null;
		},
	},
});

export const {
	updateUploadReducerSelectedVideoObject,
	updateUploadReducerLoading,
	updateUploadReducerDeleteVideoObject,
	updateUploadReducerModalUploadVideoSelectedSessionObject,
	clearUploadReducer,
} = uploadSlice.actions;

export default uploadSlice.reducer;

// // Export types for use in components
// export type { UploadState };
