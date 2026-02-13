import React, { useState } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import type { LogoutScreenProps } from "../../types/navigation";
import ScreenFrame from "../../components/screen-frames/ScreenFrame";
import ButtonKvStd from "../../components/buttons/ButtonKvStd";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../types/store";
import { loginUser, logoutUser } from "../../reducers/user";
import { userReducerOffline } from "../../data/userReducerOffline";

export default function Logout({ navigation }: LogoutScreenProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const dispatch = useDispatch();
	const userReducer = useSelector((state: RootState) => state.user);
	const teamReducer = useSelector((state: RootState) => state.team);

	const handleLoginGuestOffline = () => {
		console.log("Guest login");

		dispatch(
			loginUser({
				userId: userReducerOffline.user.id,
				email: userReducerOffline.user.email,
				token: userReducerOffline.token,
				username: userReducerOffline.user.username,
			})
		);
		navigation.navigate("SelectTeam");
	};

	return (
		<ScreenFrame>
			<View style={styles.container}>
				{/* -------- TOP ----- */}
				<View style={styles.containerTop}>
					<View style={styles.vwEmailButtons}>
						<ButtonKvStd
							title="Login"
							onPress={() => {
								if (userReducer.token) {
									navigation.navigate("SelectTeam");
								} else {
									navigation.navigate("Login");
								}
							}}
							style={styles.btnEmailLogin}
						>
							{userReducer.token ? "Select Squad" : "Email Login"}
						</ButtonKvStd>
						
						{userReducer.token && (
							<ButtonKvStd
								title="Logout"
								onPress={() => {
									dispatch(logoutUser());
									navigation.navigate("Splash");
								}}
								style={styles.btnEmailLogin}
							>
								Logout
							</ButtonKvStd>
						)}

						{/* Guest Login Option */}
						{!userReducer.token && (
							<ButtonKvStd
								title="Guest Login"
								onPress={() => {
									handleLoginGuestOffline();
								}}
								style={styles.btnGuestLogin}
								disabled={isSubmitting}
							>
								Continue as Guest
							</ButtonKvStd>
						)}
					</View>

					<View style={styles.vwLineContainer}>
						<View style={styles.vwLine} />
					</View>

					{/* User Info Display */}
					{userReducer.token && (
						<View style={styles.vwUserInfo}>
							<Text style={styles.txtUserInfo}>
								Logged in as: {userReducer.user.username}
							</Text>
							<Text style={styles.txtUserInfo}>
								Email: {userReducer.user.email}
							</Text>
						</View>
					)}
				</View>
			</View>
		</ScreenFrame>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FDFDFD",
	},
	// ----- TOP -----
	containerTop: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	vwEmailButtons: {
		width: "100%",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 30,
	},
	btnEmailLogin: {
		width: Dimensions.get("window").width * 0.8,
		backgroundColor: "white",
		color: "#585858",
		fontSize: 24,
		borderColor: "#585858",
		borderWidth: 2,
		borderStyle: "solid",
		padding: 5,
		height: 50,
		justifyContent: "center",
	},
	btnGuestLogin: {
		width: Dimensions.get("window").width * 0.8,
		backgroundColor: "#806181",
		color: "white",
		fontSize: 20,
		height: 50,
		justifyContent: "center",
	},
	vwLineContainer: {
		width: Dimensions.get("window").width,
		alignItems: "center",
		marginVertical: 20,
	},
	vwLine: {
		width: "80%",
		borderColor: "#A3A3A3",
		borderWidth: 1,
		borderStyle: "solid",
	},
	vwUserInfo: {
		alignItems: "center",
		padding: 20,
		backgroundColor: "#F8F8F8",
		borderRadius: 10,
		width: "90%",
	},
	txtUserInfo: {
		fontSize: 16,
		color: "#585858",
		marginVertical: 5,
		textAlign: "center",
	},
});