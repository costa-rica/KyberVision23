import { View, Text } from "react-native";
// import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "./welcome/Splash";
import Login from "./welcome/Login";
import Register from "./welcome/Register";
import Logout from "./welcome/Logout";
import SelectTeam from "./welcome/SelectTeam";
import Home from "./welcome/Home";
import ScriptingLiveSelectSession from "./scripting/ScriptingLiveSelectSession";
import ScriptingLiveSelectPlayers from "./scripting/ScriptingLiveSelectPlayers";
import ScriptingLive from "./scripting/ScriptingLive";
import CreateTeam from "./user-admin/CreateTeam";
import UploadVideo from "./review/UploadVideo";
import ReviewSelection from "./review/ReviewSelection";
import ReviewVideo from "./review/ReviewVideo";
import ScriptingSyncVideoSelection from "./review/ScriptingSyncVideoSelection";
import ScriptingSyncVideo from "./review/ScriptingSyncVideo";
import AdminSettings from "./user-admin/AdminSettings";
import AdminSettingsPlayerCard from "./user-admin/AdminSettingsPlayerCard";
import AdminSettingsUserCard from "./user-admin/AdminSettingsUserCard";
import JoinPublicTeam from "./welcome/JoinPublicTeam";

// if (process.env.EXPO_PUBLIC_ENVIRONMENT_01 !== "workstation") {
// 	import { GoogleSignin } from "@react-native-google-signin/google-signin";
// }

// ✅ NEW: use the safe wrapper
import { configureGoogleSignin } from "../components/google/googleSignIn";

import type { RootStackParamList } from "../types/navigation";
const Stack = createNativeStackNavigator<RootStackParamList>();

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../types/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useState, useEffect } from "react";
import * as Font from "expo-font";
const Index = () => {
	const [fontsLoaded, setFontsLoaded] = useState(false);
	useEffect(() => {
		async function loadFonts() {
			await Font.loadAsync({
				ApfelGrotezk: require("../assets/fonts/ApfelGrotezk-Regular.otf"),
				ApfelGrotezkSemiBold: require("../assets/fonts/ApfelGrotezk-Mittel.otf"),
				ApfelGrotezkBold: require("../assets/fonts/ApfelGrotezk-Fett.otf"),
				ApfelGrotezkSuperBold: require("../assets/fonts/ApfelGrotezk-Satt.otf"),
				Caveat: require("../assets/fonts/Caveat-VariableFont_wght.ttf"),
			});
			setFontsLoaded(true);
		}
		loadFonts();
	}, []);

	// useEffect(() => {
	// 	GoogleSignin.configure({
	// 		iosClientId: process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_IOS_CLIENT_ID,
	// 		webClientId: process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_WEB_CLIENT_ID,
	// 		profileImageSize: 150,
	// 	});
	// }, []);
	// ✅ NEW: configure once; no-op in Expo Go
	useEffect(() => {
		configureGoogleSignin();
	}, []);

	if (!fontsLoaded) {
		console.log("-font NOT loaded");
	} else {
		console.log("- font loaded 🖋️ ");
	}
	return (
		<Provider store={store}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<PersistGate persistor={persistor}>
					<NavigationContainer>
						<Stack.Navigator screenOptions={{ headerShown: false }}>
							<Stack.Screen name="Splash" component={Splash} />
							<Stack.Screen name="Login" component={Login} />
							<Stack.Screen name="Register" component={Register} />
							<Stack.Screen name="Logout" component={Logout} />
							<Stack.Screen name="SelectTeam" component={SelectTeam} />
							<Stack.Screen name="Home" component={Home} />
							<Stack.Screen
								name="ScriptingLiveSelectSession"
								component={ScriptingLiveSelectSession}
							/>
							<Stack.Screen
								name="ScriptingLiveSelectPlayers"
								component={ScriptingLiveSelectPlayers}
							/>
							<Stack.Screen name="ScriptingLive" component={ScriptingLive} />
							<Stack.Screen name="CreateTeam" component={CreateTeam} />
							<Stack.Screen name="UploadVideo" component={UploadVideo} />
							<Stack.Screen
								name="ReviewSelection"
								component={ReviewSelection}
							/>
							<Stack.Screen name="ReviewVideo" component={ReviewVideo} />
							<Stack.Screen
								name="ScriptingSyncVideoSelection"
								component={ScriptingSyncVideoSelection}
							/>
							<Stack.Screen
								name="ScriptingSyncVideo"
								component={ScriptingSyncVideo}
							/>
							<Stack.Screen name="AdminSettings" component={AdminSettings} />
							<Stack.Screen
								name="AdminSettingsPlayerCard"
								component={AdminSettingsPlayerCard}
							/>
							<Stack.Screen
								name="AdminSettingsUserCard"
								component={AdminSettingsUserCard}
							/>
							<Stack.Screen name="JoinPublicTeam" component={JoinPublicTeam} />
						</Stack.Navigator>
					</NavigationContainer>
				</PersistGate>
			</GestureHandlerRootView>
		</Provider>
	);
};

export default Index;
