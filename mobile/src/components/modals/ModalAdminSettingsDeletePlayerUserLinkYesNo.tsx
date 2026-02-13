import React from "react";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	Alert,
} from "react-native";
import ButtonKvNoDefaultTextOnly from "../buttons/ButtonKvNoDefaultTextOnly";
import { Player } from "../../reducers/team";

interface ModalAdminSettingsDeletePlayerUserLinkYesNoProps {
	playerObject: Player;
	setIsVisibleDeletePlayerUserLinkModal: (visible: boolean) => void;
	setPlayerObject: (player: Player) => void;
}

export default function ModalAdminSettingsDeletePlayerUserLinkYesNo({
	playerObject,
	setIsVisibleDeletePlayerUserLinkModal,
	setPlayerObject,
}: ModalAdminSettingsDeletePlayerUserLinkYesNoProps) {
	const handleDeleteLink = () => {
		Alert.alert("Coming Soon", "This feature is not yet implemented");
		setIsVisibleDeletePlayerUserLinkModal(false);
	};

	return (
		<View style={styles.modalContent}>
			<Text style={styles.txtModalTitle}>Remove User Link</Text>
			<Text style={styles.txtModalMessage}>
				Are you sure you want to remove the link between {playerObject.firstName} {playerObject.lastName} and user account "{playerObject.username}"?
			</Text>
			<View style={styles.vwButtons}>
				<ButtonKvNoDefaultTextOnly
					onPress={() => setIsVisibleDeletePlayerUserLinkModal(false)}
					styleView={styles.btnNo}
					styleText={styles.txtBtnNo}
				>
					No
				</ButtonKvNoDefaultTextOnly>
				<ButtonKvNoDefaultTextOnly
					onPress={handleDeleteLink}
					styleView={styles.btnYes}
					styleText={styles.txtBtnYes}
				>
					Yes
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
		padding: 20,
		backgroundColor: "#D9CDD9",
		gap: 15,
	},
	txtModalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
		color: "#806181",
	},
	txtModalMessage: {
		fontSize: 14,
		textAlign: "center",
		color: "#333",
	},
	vwButtons: {
		flexDirection: "row",
		gap: 20,
	},
	btnNo: {
		justifyContent: "center",
		alignItems: "center",
		width: 80,
		borderRadius: 20,
		backgroundColor: "#E8E8E8",
		borderColor: "#806181",
		borderWidth: 2,
		padding: 10,
	},
	txtBtnNo: {
		fontSize: 16,
		color: "#806181",
	},
	btnYes: {
		justifyContent: "center",
		alignItems: "center",
		width: 80,
		borderRadius: 20,
		backgroundColor: "#806181",
		borderColor: "#806181",
		borderWidth: 2,
		padding: 10,
	},
	txtBtnYes: {
		fontSize: 16,
		color: "white",
	},
});