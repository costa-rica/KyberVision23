import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	ViewStyle,
	TextStyle,
} from "react-native";
import ButtonKvStd from "../buttons/ButtonKvStd";

interface ModalInformationOkProps {
	title: string;
	message: string;
	onClose: () => void;
	okButtonText?: string;
	variant?: "info" | "success" | "error" | "warning";
}

export default function ModalInformationOk({
	title,
	message,
	onClose,
	okButtonText = "Ok",
	variant = "info",
}: ModalInformationOkProps) {
	const getFormattedTitle = (): string => {
		switch (variant) {
			case "success":
				return `Success: ${title}`;
			case "error":
				return `Error: ${title}`;
			case "warning":
				return `Warning: ${title}`;
			case "info":
			default:
				return title;
		}
	};

	return (
		<View style={styles.modalContent}>
			<View style={styles.containerTop}>
				<Text style={styles.txtTitle}>{getFormattedTitle()}</Text>
			</View>
			<View style={styles.containerMiddle}>
				<Text style={styles.txtMessage}>{message}</Text>
			</View>
			<View style={styles.containerBottom}>
				<ButtonKvStd onPress={onClose} style={styles.btnOk}>
					{okButtonText}
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
	} as ViewStyle,
	btnOk: {
		backgroundColor: "#806181",
		paddingHorizontal: 40,
	} as ViewStyle & TextStyle,
});
