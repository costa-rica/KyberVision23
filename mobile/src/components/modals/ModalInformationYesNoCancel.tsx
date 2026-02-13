import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	ViewStyle,
	TextStyle,
} from "react-native";
import ButtonKvStd from "../buttons/ButtonKvStd";

interface ModalInformationYesNoCancelProps {
	title: string;
	message: string;
	onYes?: () => void;
	onNo?: () => void;
	onCancel?: () => void;
	onClose: () => void;
	yesButtonText?: string;
	noButtonText?: string;
	cancelButtonText?: string;
	yesButtonStyle?: "danger" | "primary";
	noButtonStyle?: "danger" | "primary";
}

export default function ModalInformationYesNoCancel({
	title,
	message,
	onYes,
	onNo,
	onCancel,
	onClose,
	yesButtonText = "Yes",
	noButtonText = "No",
	cancelButtonText = "Cancel",
	yesButtonStyle = "primary",
	noButtonStyle = "primary",
}: ModalInformationYesNoCancelProps) {
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

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
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
					onPress={handleYes}
					style={{
						...styles.btn,
						...(yesButtonStyle === "danger" ? styles.btnDanger : styles.btnPrimary),
					}}
				>
					{yesButtonText}
				</ButtonKvStd>
				<ButtonKvStd
					onPress={handleNo}
					style={{
						...styles.btn,
						...(noButtonStyle === "danger" ? styles.btnDanger : styles.btnPrimary),
					}}
				>
					{noButtonText}
				</ButtonKvStd>
				<ButtonKvStd
					onPress={handleCancel}
					style={styles.btnCancel}
				>
					{cancelButtonText}
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
		flexDirection: "column",
		gap: 10,
		width: "100%",
	} as ViewStyle,
	btn: {
		width: "100%",
		paddingVertical: 12,
	} as ViewStyle & TextStyle,
	btnPrimary: {
		backgroundColor: "#806181",
	} as ViewStyle & TextStyle,
	btnDanger: {
		backgroundColor: "#DC3545",
	} as ViewStyle & TextStyle,
	btnCancel: {
		width: "100%",
		paddingVertical: 12,
		backgroundColor: "#E8E8E8",
		color: "#333",
	} as ViewStyle & TextStyle,
});
