import React, { ReactNode } from "react";
import {
	StyleSheet,
	View,
	Image,
	Text,
	TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ButtonKvImage from "../buttons/ButtonKvImage";
import BackArrow from "../../assets/images/screen-frame/btnBackArrow.svg";
import { useSelector } from "react-redux";
import type { RootState } from "../../types/store";

interface ScreenFrameWithTopChildrenProps {
	children: ReactNode;
	navigation?: any; // TODO: Type this properly with navigation
	topChildren?: ReactNode;
	screenName?: string;
	isVisibleModal?: boolean;
	setDisplayModal?: (visible: boolean) => void;
	modalComponent?: ReactNode;
	onBackPress?: () => boolean;
}

export default function ScreenFrameWithTopChildren({
	children,
	navigation,
	topChildren,
	screenName,
	isVisibleModal = false,
	setDisplayModal = () => {},
	modalComponent = null,
	onBackPress = () => {
		return true;
	},
}: ScreenFrameWithTopChildrenProps) {
	const insets = useSafeAreaInsets();
	// Note: uploadReducer not implemented yet, so commenting out for now
	// const uploadReducer = useSelector((state: RootState) => state.upload);

	const handleBackPress = async () => {
		const goBack = onBackPress();
		if (goBack) {
			navigation?.goBack();
		}
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
				<View style={styles.vwLogoAndTopChildren}>
					<Image
						source={require("../../assets/images/multi-use/KyberV2Shiny.png")}
						style={styles.imgLogo}
					/>
					{screenName && <Text style={{ color: "white" }}>{screenName}</Text>}
					{topChildren}
				</View>
			</View>
			<View style={styles.containerBottom}>{children}</View>

			{isVisibleModal && (
				<TouchableWithoutFeedback onPress={() => setDisplayModal(false)}>
					<View style={styles.modalOverlay}>
						<View onStartShouldSetResponder={() => true}>{modalComponent}</View>
					</View>
				</TouchableWithoutFeedback>
			)}
			{/* Loading modal commented out until upload reducer is implemented */}
			{/* {uploadReducer.uploadReducerLoading && (
				<View style={styles.modalOverlay}>
					<ModalLoading />
				</View>
			)} */}
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
	},
	btnBack: {
		position: "absolute",
		top: 50,
		left: 20,
	},
	vwLogoAndTopChildren: {
		position: "absolute",
		bottom: 0,
		alignItems: "center",
	},
	imgLogo: {
		marginBottom: 10,
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
