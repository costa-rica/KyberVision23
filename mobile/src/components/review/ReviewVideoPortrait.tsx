import React from "react";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { useSelector } from "react-redux";
import { RootState } from "../../types/store";
import { ReviewAction } from "../../reducers/review";

interface ReviewVideoPortraitProps {
	orientation: string;
	playerRef: React.RefObject<any>;
	playing: boolean;
	currentTime: number;
	duration: number;
	handleStateChange: (state: string) => void;
	togglePlaying: () => void;
	rewind: () => void;
	forward: () => void;
	handleSelectedAction: (action: ReviewAction) => void;
	handleBackPress: () => void;
}

export default function ReviewVideoPortrait(props: ReviewVideoPortraitProps) {
	const reviewReducer = useSelector((state: RootState) => state.review);

	return (
		<View style={styles.container}>
			<View style={styles.containerTop}>
				<Text>{reviewReducer.reviewReducerVideoObject?.id}</Text>
				<Text>{reviewReducer.reviewReducerVideoObject?.youTubeVideoId}</Text>
			</View>
			<View style={styles.containerMiddle}>
				<View style={styles.videoWrapper}>
					<YoutubePlayer
						ref={props.playerRef}
						height={220}
						width={Dimensions.get("window").width}
						play={props.playing}
						videoId={
							reviewReducer.reviewReducerVideoObject?.youTubeVideoId || ""
						}
						onChangeState={props.handleStateChange}
						webViewProps={{
							allowsInlineMediaPlayback: true,
						}}
						initialPlayerParams={{
							controls: false,
							modestbranding: true,
							rel: false,
							showinfo: false,
						}}
					/>
					<View style={styles.coverView} />
				</View>
				<View style={styles.vwButtonContainer}>
					<View style={styles.vwButtonRow}>
						<TouchableOpacity onPress={props.rewind} style={styles.skipButton}>
							<Text style={styles.playPauseButtonText}>-2s</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={props.togglePlaying}
							style={styles.playPauseButton}
						>
							<Text style={styles.playPauseButtonText}>
								{props.playing ? "Pause" : "Play"}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={props.forward} style={styles.skipButton}>
							<Text style={styles.playPauseButtonText}>+5s</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
			<View style={styles.containerBottom}>
				<ScrollView>
					{reviewReducer.reviewReducerActionsArray.map((action, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => props.handleSelectedAction(action)}
							style={{
								backgroundColor: "gray",
								padding: 10,
								marginVertical: 5,
							}}
						>
							<Text style={{ color: "white" }}>
								id: {action.actionsDbTableId} - timestamp:{action.timestamp}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	containerTop: {
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
		borderWidth: 4,
		borderColor: "gray",
		borderStyle: "dashed",
	},
	containerMiddle: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "gray",
		width: Dimensions.get("window").width,
		borderWidth: 4,
		borderColor: "gray",
		borderStyle: "dashed",
	},
	videoWrapper: {
		position: "relative",
		width: "100%",
		height: 220,
	},
	coverView: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "transparent",
		opacity: 0.7,
		zIndex: 2,
	},
	vwButtonContainer: {
		marginTop: 20,
		alignItems: "center",
	},
	vwButtonRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	playPauseButton: {
		backgroundColor: "black",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	skipButton: {
		backgroundColor: "black",
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderRadius: 5,
	},
	playPauseButtonText: {
		color: "white",
		fontSize: 16,
	},
	containerBottom: {
		flex: 1,
		width: Dimensions.get("window").width,
		borderWidth: 4,
		borderColor: "gray",
		borderStyle: "dashed",
	},
});
