import {
	StyleSheet,
	View,
	Image,
	TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { type ReactNode } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
	NavigationProp,
	ParamListBase,
	RouteProp,
} from "@react-navigation/native";
import ButtonKvImage from "../buttons/ButtonKvImage";
import BackArrow from "../../assets/images/screen-frame/btnBackArrow.svg";

interface ModalComponentAndSetterObject {
	modalComponent: ReactNode | null;
	useState: boolean;
	useStateSetter: (value: boolean) => void;
}

type Props = {
	children: ReactNode;
	modalComponentAndSetterObject?: ModalComponentAndSetterObject;
};
export default function ScreenFrame({
	children,
	modalComponentAndSetterObject = {
		modalComponent: null,
		useState: false,
		useStateSetter: () => {},
	},
}: Props) {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationProp<ParamListBase>>();
	const route = useRoute<RouteProp<ParamListBase, string>>();
	const handleBackPress = async () => {
		navigation.goBack();
	};
	return (
		<View style={[styles.container, { paddingBottom: insets.bottom }]}>
			<View style={styles.containerTop}>
				<Image
					source={require("../../assets/images/screen-frame/imgBackgroundBottomFade.png")}
				/>

				{navigation && (
					<View style={styles.btnBack}>
						<ButtonKvImage
							onPress={() => {
								handleBackPress();
							}}
						>
							<BackArrow width={28} height={28} />
						</ButtonKvImage>
					</View>
				)}
				<Image
					source={require("../../assets/images/multi-use/KyberV2Shiny.png")}
					style={styles.imgLogo}
				/>
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
		height: "35%",
		overflow: "hidden",
	},
	btnBack: {
		position: "absolute",
		top: 50,
		left: 20,
		// zIndex: 10,
	},
	imgLogo: {
		position: "absolute",
		bottom: 0,
	},
	containerBottom: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	// Modal styles
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
	},
	modalContainer: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 10,
	},
});
