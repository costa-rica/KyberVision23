import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	ViewStyle,
	TextStyle,
} from "react-native";
import ButtonKvStd from "../buttons/ButtonKvStd";

interface ModalInformationYesOrNoProps {
	title: string;
	message: string;
	onYes?: () => void;
	onNo?: () => void;
	onClose: () => void;
	yesButtonText?: string;
	noButtonText?: string;
	yesButtonStyle?: "danger" | "primary";
}

export default function ModalInformationYesOrNo({
	title,
	message,
	onYes,
	onNo,
	onClose,
	yesButtonText = "Yes",
	noButtonText = "No",
	yesButtonStyle = "primary",
}: ModalInformationYesOrNoProps) {
	const handleYes = () => {
		if (onYes) {
			onYes();
		}
	};

	const handleNo = () => {
		if (onNo) {
			onNo();
		}
	};

	return (
		<View style={styles.modalContent}>
			<View style={styles.containerTop}>
				<Text style={styles.txtTitle}>{title}</Text>
			</View>
			<View style={styles.containerMiddle}>
				<Text style={styles.txtMessage}>{message}</Text>
			</View>
			<View style={styles.containerBottom}>
				<ButtonKvStd
					onPress={handleNo}
					style={styles.btnNo}
				>
					{noButtonText}
				</ButtonKvStd>
				<ButtonKvStd
					onPress={handleYes}
					style={{
						...styles.btnYes,
						...(yesButtonStyle === "danger" ? styles.btnYesDanger : styles.btnYesPrimary),
					}}
				>
					{yesButtonText}
				</ButtonKvStd>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	modalContent: {
		width: Dimensions.get("window").width * 0.85,
		padding: 20,
		backgroundColor: "#D9CDD9",
		borderRadius: 10,
		alignItems: "center",
	} as ViewStyle,
	containerTop: {
		width: "100%",
		alignItems: "center",
		paddingBottom: 15,
	} as ViewStyle,
	txtTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#333",
		textAlign: "center",
	} as TextStyle,
	containerMiddle: {
		width: "100%",
		paddingVertical: 10,
	} as ViewStyle,
	txtMessage: {
		fontSize: 16,
		color: "#5B5B5B",
		textAlign: "center",
		lineHeight: 22,
	} as TextStyle,
	containerBottom: {
		marginTop: 20,
		marginBottom: 5,
		flexDirection: "row",
		gap: 10,
	} as ViewStyle,
	btnNo: {
		backgroundColor: "#E8E8E8",
		color: "#333",
		paddingHorizontal: 30,
	} as ViewStyle & TextStyle,
	btnYes: {
		paddingHorizontal: 30,
	} as ViewStyle & TextStyle,
	btnYesPrimary: {
		backgroundColor: "#806181",
	} as ViewStyle & TextStyle,
	btnYesDanger: {
		backgroundColor: "#DC3545",
	} as ViewStyle & TextStyle,
});
