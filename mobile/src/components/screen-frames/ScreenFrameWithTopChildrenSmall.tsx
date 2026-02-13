import {
	StyleSheet,
	View,
	Image,
	Text,
	TouchableWithoutFeedback,
	ViewStyle,
} from "react-native";
import React, { ReactNode } from "react";
import ButtonKvImage from "../buttons/ButtonKvImage";
import BackArrow from "../../assets/images/screen-frame/btnBackArrow.svg";
import Tribe from "../../assets/images/welcome/Tribe.svg";

interface ModalComponentAndSetterObject {
	modalComponent: ReactNode | null;
	useState: boolean;
	useStateSetter: (value: boolean) => void;
}

interface TemplateViewWithTopChildrenSmallProps {
	children: ReactNode;
	navigation?: any;
	topChildren?: ReactNode;
	sizeOfLogo?: number;
	topHeight?: string | number;
	screenName?: string;
	modalComponentAndSetterObject?: ModalComponentAndSetterObject;
	onBackPress?: () => Promise<boolean> | boolean;
}

export default function TemplateViewWithTopChildrenSmall({
	children,
	navigation,
	topChildren,
	sizeOfLogo = 40,
	topHeight = "15%",
	screenName,
	modalComponentAndSetterObject = {
		modalComponent: null,
		useState: false,
		useStateSetter: () => {},
	},
	onBackPress = () => {
		return true;
	},
}: TemplateViewWithTopChildrenSmallProps) {
	const handleBackPress = async () => {
		const goBack = await onBackPress();
		if (goBack) {
			navigation?.goBack();
		}
	};

	return (
		<View style={styles.container}>
			<View style={[styles.containerTop, { height: topHeight } as ViewStyle]}>
				<Image
					source={require("../../assets/images/screen-frame/imgBackgroundBottomFade.png")}
				/>

				{navigation && (
					<View style={styles.btnBack}>
						<ButtonKvImage
							onPress={async () => {
								await handleBackPress();
							}}
						>
							<BackArrow style={styles.svgBackArrow} />
						</ButtonKvImage>
					</View>
				)}
				<View style={styles.vwLogoTopRight}>
					<Tribe width={sizeOfLogo} height={sizeOfLogo} />
				</View>
				<View style={styles.vwTopChildren}>
					{screenName && <Text style={{ color: "white" }}>{screenName}</Text>}
					{topChildren}
				</View>
			</View>
			<View style={styles.containerBottom}>{children}</View>
			{modalComponentAndSetterObject.useState && (
				<TouchableWithoutFeedback
					onPress={() => modalComponentAndSetterObject.useStateSetter(false)}
				>
					<View style={styles.modalOverlay}>
						<View onStartShouldSetResponder={() => true}>
							{modalComponentAndSetterObject.modalComponent}
						</View>
					</View>
				</TouchableWithoutFeedback>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	containerTop: {
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	btnBack: {
		position: "absolute",
		top: 50,
		left: 10,
	},
	svgBackArrow: {
		width: 24,
		height: 24,
	},
	vwLogoTopRight: {
		position: "absolute",
		top: 30,
		right: 10,
	},
	vwTopChildren: {
		position: "absolute",
		bottom: 0,
		alignItems: "center",
	},
	containerBottom: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 2,
	},
	modalContainer: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 3,
	},
});
