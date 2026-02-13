import type {
	NativeStackNavigationProp,
	NativeStackScreenProps,
} from "@react-navigation/native-stack";
import type { Player, SquadMember } from "../reducers/team";

export type RootStackParamList = {
	Splash: undefined;
	Login: undefined;
	Register: undefined;
	Logout: undefined;
	SelectTeam: undefined;
	CreateTeam: undefined;
	Home: undefined;
	ScriptingLiveSelectSession: undefined;
	ScriptingLiveSelectPlayers: undefined;
	ScriptingLive: undefined;
	ReviewSelection: undefined;
	ReviewVideo: undefined;
	UploadVideo: undefined;
	ScriptingSyncVideoSelection: undefined;
	ScriptingSyncVideo: undefined;
	AdminSettings: undefined;
	AdminSettingsPlayerCard: { playerObject: Player };
	AdminSettingsUserCard: { userObject: SquadMember };
	JoinPublicTeam: undefined;
};

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;

// Screen-specific prop helpers
// explaination: NativeStackScreenProps<...> — a utility type that produces:
// -- navigation.navigate('Login') is type-checked
// -- route.params is typed (for Splash it’s undefined).
export type SplashScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Splash"
>;

export type LoginScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Login"
>;

export type RegisterScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Register"
>;

export type LogoutScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Logout"
>;

export type SelectTeamScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"SelectTeam"
>;

export type HomeScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Home"
>;

export type ScriptingLiveSelectSessionScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ScriptingLiveSelectSession"
>;

export type ScriptingLiveSelectPlayersScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ScriptingLiveSelectPlayers"
>;

export type ReviewSelectionScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ReviewSelection"
>;

export type ReviewVideoScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ReviewVideo"
>;

export type UploadVideoScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"UploadVideo"
>;

export type ScriptingSyncVideoSelectionScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ScriptingSyncVideoSelection"
>;

export type ScriptingSyncVideoScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ScriptingSyncVideo"
>;

export type AdminSettingsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"AdminSettings"
>;

export type AdminSettingsPlayerCardScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"AdminSettingsPlayerCard"
>;

export type AdminSettingsUserCardScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"AdminSettingsUserCard"
>;

export type JoinPublicTeamScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"JoinPublicTeam"
>;
