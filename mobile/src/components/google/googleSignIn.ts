// src/components/google/googleSignIn.ts
// Safe wrapper that works in both Expo Go (no native modules) and dev/prod builds.

const IS_EXPO_GO = process.env.EXPO_PUBLIC_ENVIRONMENT_01 === "workstation";

// Types are "any" to avoid importing the native module types in Expo Go.
let GoogleSignin: any;
let isSuccessResponse: any;
let isErrorWithCode: any;
let statusCodes: any;

/** Minimal, consistent error shape for our app */
type KvGoogleError = { code?: string; message?: string };

if (!IS_EXPO_GO) {
	// Only load native module when not running in Expo Go
	const g = require("@react-native-google-signin/google-signin");
	GoogleSignin = g.GoogleSignin;
	isSuccessResponse = g.isSuccessResponse;
	isErrorWithCode = g.isErrorWithCode;
	statusCodes = g.statusCodes;
} else {
	// Stubs so Expo Go doesn’t crash
	GoogleSignin = {
		configure: () => {},
		hasPlayServices: async () => {},
		signIn: async () => {
			const err: KvGoogleError = {
				code: "EXPO_GO_UNSUPPORTED",
				message: "Google Sign-In not available in Expo Go",
			};
			throw err;
		},
	};
	isSuccessResponse = () => false;
	isErrorWithCode = (e: unknown): e is KvGoogleError =>
		typeof e === "object" && !!e && "code" in (e as any);
	statusCodes = {};
}

/** Call once at app start; no-op in Expo Go */
export function configureGoogleSignin() {
	// If you ever want to guard per-platform, you can also check Platform.OS === 'ios'/'android'
	GoogleSignin.configure({
		iosClientId: process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_IOS_CLIENT_ID,
		webClientId: process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_WEB_CLIENT_ID,
		profileImageSize: 150,
	});
}

/** Convenience helpers that won’t throw on Expo Go load */
export async function googleHasPlayServices() {
	if (GoogleSignin?.hasPlayServices) {
		return GoogleSignin.hasPlayServices();
	}
}

export async function googleSignIn() {
	// Throws { code, message } on error; caught by caller
	return GoogleSignin.signIn();
}

export { isSuccessResponse, isErrorWithCode, statusCodes, IS_EXPO_GO };
