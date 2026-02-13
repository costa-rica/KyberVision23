import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	Dimensions,
	Alert,
} from "react-native";
import ButtonKvNoDefaultTextOnly from "../buttons/ButtonKvNoDefaultTextOnly";
import { useSelector } from "react-redux";
import * as Clipboard from "expo-clipboard";
import { RootState } from "../../types/store";

interface ModalAdminSettingsInviteToSquadProps {
	onPressYes: (email: string) => void;
}

export default function ModalAdminSettingsInviteToSquad({
	onPressYes,
}: ModalAdminSettingsInviteToSquadProps) {
	const teamReducer = useSelector((state: RootState) => state.team);
	const [email, setEmail] = useState("");

	const selectedTeam = teamReducer.teamsArray.find((team) => team.selected);

	return (
		<View style={styles.modalContent}>
			<View style={styles.vwInputAndButton}>
				<View style={styles.vwInputWithLabel}>
					<TextInput
						style={styles.txtInputInviteUrl}
						value={selectedTeam?.genericJoinToken || ""}
						editable={false}
					/>
				</View>
				<ButtonKvNoDefaultTextOnly
					onPress={() => {
						const inviteLink = selectedTeam?.genericJoinToken;
						if (inviteLink) {
							Clipboard.setStringAsync(inviteLink);
							Alert.alert(
								"Copied to clipboard!",
								"The invitation link has been copied."
							);
						}
					}}
					styleView={styles.btnCopyInvite}
					styleText={styles.txtBtnCopyInvite}
				>
					Copy invitation link
				</ButtonKvNoDefaultTextOnly>
			</View>

			<View style={styles.vwInputAndButton}>
				<View style={styles.vwInputWithLabel}>
					<View style={styles.vwInputWithLabelForUnderline}>
						<Text style={styles.txtInputLabel}>email:</Text>
						<TextInput
							placeholder="player@example.com"
							style={styles.txtInputEmail}
							value={email}
							onChangeText={setEmail}
						/>
					</View>
				</View>
				<ButtonKvNoDefaultTextOnly
					onPress={() => {
						if (email) {
							onPressYes(email);
						} else {
							Alert.alert("Email is required");
						}
					}}
					styleView={styles.btnYes}
					styleText={styles.txtBtnYes}
				>
					Invite
				</ButtonKvNoDefaultTextOnly>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	modalContent: {
		width: Dimensions.get("window").width * 0.8,
		height: Dimensions.get("window").height * 0.3,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		padding: 10,
		backgroundColor: "#D9CDD9",
	},
	vwModalTitle: {
		flexDirection: "row",
		flexWrap: "wrap",
		width: "100%",
		alignItems: "center",
		flexShrink: 1,
	},
	txtModalTitle: {
		fontSize: 18,
		textAlign: "center",
	},
	txtModalTitleTeamName: {
		textDecorationLine: "underline",
		textDecorationColor: "black",
	},
	vwInputAndButton: {
		width: "100%",
		gap: 10,
		marginTop: 10,
		alignItems: "center",
	},
	vwInputWithLabel: {
		backgroundColor: "white",
		padding: 5,
		width: "100%",
	},
	vwInputWithLabelForUnderline: {
		borderBottomWidth: 1,
		borderBottomColor: "#806181",
	},
	txtInputLabel: {
		color: "gray",
	},
	txtInputInviteUrl: {
		width: "100%",
		height: 40,
		borderRadius: 5,
		backgroundColor: "white",
		padding: 5,
		fontStyle: "italic",
	},
	txtInputEmail: {
		width: "100%",
		height: 40,
		borderRadius: 5,
		backgroundColor: "white",
		padding: 5,
	},
	btnCopyInvite: {
		justifyContent: "center",
		alignItems: "center",
		width: 200,
		borderRadius: 20,
		color: "white",
		backgroundColor: "#E8E8E8",
		borderColor: "#806181",
		borderWidth: 2,
		padding: 5,
	},
	txtBtnCopyInvite: {
		fontSize: 16,
		color: "#806181",
		justifyContent: "center",
		alignItems: "center",
	},
	btnYes: {
		justifyContent: "center",
		alignItems: "center",
		width: 100,
		borderRadius: 20,
		color: "white",
		backgroundColor: "#E8E8E8",
		borderColor: "#806181",
		borderWidth: 2,
		padding: 5,
	},
	btnYesSelected: {
		borderColor: "#FF6666",
		borderWidth: 4,
	},
	txtBtnYes: {
		fontSize: 24,
		color: "#806181",
		justifyContent: "center",
		alignItems: "center",
	},
});