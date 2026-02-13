import {
	StyleSheet,
	Text,
	View,
	Image,
	Dimensions,
	TouchableOpacity,
	FlatList,
	ViewStyle,
	TextStyle,
	ListRenderItem,
} from "react-native";
import ScreenFrameWithTopChildrenSmall from "../../components/screen-frames/ScreenFrameWithTopChildrenSmall";
import ModalInformationOk from "../../components/modals/ModalInformationOk";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateTeamsArray, Team } from "../../reducers/team";
import {
	updateReviewReducerVideoObject,
	createReviewActionsArray,
	createReviewActionsArrayUniquePlayersNamesAndObjects,
	VideoObject,
	ReviewAction,
	PlayerDbObject,
} from "../../reducers/review";
import { RootState } from "../../types/store";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type ReviewSelectionProps = NativeStackScreenProps<
	RootStackParamList,
	"ReviewSelection"
>;

interface VideoWithSelection extends VideoObject {
	selected?: boolean;
}

interface ApiResponse {
	videosArray: VideoObject[];
	error?: string;
	message?: string;
}

interface ActionsApiResponse {
	actionsArray: Array<{
		id: number;
		playerId: number;
		timestampFromStartOfVideo: number;
		type: string;
		subtype: string | null;
		quality: string;
		favorite: boolean;
	}>;
	playerDbObjectsArray: Array<{
		id: number;
		firstName: string;
		lastName: string;
		shirtNumber: number;
		birthDate: string;
	}>;
}

// Offline data interface
interface OfflineReviewData extends ActionsApiResponse {
	videosArray: VideoObject[];
}

let reviewReducerOffline: OfflineReviewData;

export default function ReviewSelection({ navigation }: ReviewSelectionProps) {
	const userReducer = useSelector((state: RootState) => state.user);
	const teamReducer = useSelector((state: RootState) => state.team);
	const [displayTribeList, setDisplayTribeList] = useState(false);
	const dispatch = useDispatch();
	const [videoArray, setVideoArray] = useState<VideoWithSelection[]>([]);
	const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
	const [infoModalContent, setInfoModalContent] = useState({
		title: "",
		message: "",
		variant: "info" as "info" | "success" | "error" | "warning",
	});

	const handleTribeSelect = (selectedId: number) => {
		const updatedArray = teamReducer.teamsArray.map((tribe) => ({
			...tribe,
			selected: tribe.id === selectedId,
		}));
		dispatch(updateTeamsArray(updatedArray));
		setDisplayTribeList(false);
		fetchVideoArray(selectedId);
	};

	const topChildren = (
		<View style={styles.vwTopChildren}>
			<View style={styles.vwCapsuleSuper}>
				<View
					style={displayTribeList ? styles.vwCapsuleExpanded : styles.vwCapsule}
				>
					<View style={[styles.vwLeftCapsule]}>
						{displayTribeList ? (
							<View>
								{teamReducer.teamsArray.map((tribe) => (
									<TouchableOpacity
										key={tribe.id}
										onPress={() => handleTribeSelect(tribe.id)}
										style={[styles.vwTeamRow]}
									>
										<Text
											style={[
												styles.txtDropdownTopChildTeamName,
												tribe.selected && { fontWeight: "bold" },
											]}
										>
											{tribe.teamName}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						) : (
							<Text style={styles.txtTopChildSelectedTribeName}>
								{teamReducer.teamsArray.find((tribe) => tribe.selected)
									?.teamName || "No tribe selected"}
							</Text>
						)}
					</View>
					<View style={styles.vwRightCapsule}>
						<TouchableOpacity
							onPress={() => setDisplayTribeList(!displayTribeList)}
							style={styles.btnSelectTribe}
						>
							<Image
								source={
									displayTribeList
										? require("../../assets/images/multi-use/btnBackArrow.png")
										: require("../../assets/images/multi-use/btnDownArrow.png")
								}
								style={{ width: 40, height: 40 }}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</View>
	);

	const fetchVideoArray = async (teamId: number) => {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_BASE_URL}/videos/team/${teamId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${userReducer.token}`,
				},
			}
		);

		console.log("Received response:", response.status);

		let resJson: ApiResponse | null = null;
		const contentType = response.headers.get("Content-Type");

		if (contentType?.includes("application/json")) {
			resJson = await response.json();
		}

		if (response.ok && resJson) {
			console.log(`response ok`);
			const tempArray = resJson.videosArray.map((item) => ({
				...item,
				selected: false,
			}));
			console.log(`Count of videos: ${tempArray.length}`);
			setVideoArray(tempArray);
		} else {
			const errorMessage =
				resJson?.error ||
				`There was a server error (and no resJson): ${response.status}`;
			alert(errorMessage);
		}
	};

	const handleVideoSelect = async (videoObject: VideoObject) => {
		console.log("in handleVideoSelect for videoObject: ");
		dispatch(updateReviewReducerVideoObject(videoObject));
		await fetchActionsForSession(videoObject);
		navigation.navigate("ReviewVideo");
	};

	useEffect(() => {
		if (userReducer.token === "offline") {
			try {
				reviewReducerOffline = require("../../offlineData/reviewReducer.json");
				fetchVideoArrayOffline();
			} catch (error) {
				console.error("Failed to load offline data:", error);
			}
		} else {
			console.log("Fetching videos");
			const selectedTeam = teamReducer.teamsArray.find(
				(tribe) => tribe.selected
			);
			if (selectedTeam) {
				console.log("Selected team ID:", selectedTeam.id);
				fetchVideoArray(selectedTeam.id);
			}
		}
	}, []);

	const fetchVideoArrayOffline = () => {
		console.log("Fetched videos offline");
		setVideoArray(reviewReducerOffline.videosArray);
	};

	const fetchActionsForSession = async (videoObject: VideoObject) => {
		console.log(
			"in fetchActionsForSession for sessionId: ",
			videoObject.session.id,
			" and videoId: ",
			videoObject.id
		);

		let resJson: ActionsApiResponse;

		if (userReducer.token === "offline") {
			console.log(" ** [offline] Fetching actions for session");
			resJson = reviewReducerOffline;
		} else {
			try {
				const response = await fetch(
					`${process.env.EXPO_PUBLIC_API_BASE_URL}/sessions/review-selection-screen/get-actions`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${userReducer.token}`,
						},
						body: JSON.stringify({
							sessionId: videoObject.session.id,
							videoId: videoObject.id,
						}),
					}
				);

				if (response.status !== 200) {
					alert(`There was a server error: ${response.status}`);
					return;
				}

				const contentType = response.headers.get("Content-Type");
				if (contentType?.includes("application/json")) {
					resJson = await response.json();
				} else {
					throw new Error("Invalid response format");
				}

				console.log(" --- finished getting Actions and other stuff ---");
			} catch (error) {
				setInfoModalContent({
					title: "Error fetching actions for match",
					message: (error as Error).message,
					variant: "error",
				});
				setIsVisibleInfoModal(true);
				return;
			}
		}

		let tempCleanActionsArray: ReviewAction[] = [];
		let index = 0;

		for (const elem of resJson.actionsArray) {
			index++;
			tempCleanActionsArray.push({
				actionsDbTableId: elem.id,
				reviewVideoActionsArrayIndex: index,
				playerId: elem.playerId,
				timestamp: elem.timestampFromStartOfVideo,
				type: elem.type,
				subtype: elem.subtype,
				quality: elem.quality,
				isDisplayed: true,
				isFavorite: elem.favorite,
				isPlaying: false,
			});
		}

		dispatch(createReviewActionsArray(tempCleanActionsArray));

		let tempPlayerDbObjectsArray: PlayerDbObject[] = [];
		for (const elem of resJson.playerDbObjectsArray) {
			tempPlayerDbObjectsArray.push({
				...elem,
				isDisplayed: true,
			});
		}

		dispatch(
			createReviewActionsArrayUniquePlayersNamesAndObjects({
				playerDbObjectsArray: tempPlayerDbObjectsArray,
			})
		);
	};

	const renderVideoItem: ListRenderItem<VideoWithSelection> = ({
		item: video,
	}) => (
		<TouchableOpacity
			key={video.id}
			onPress={() => handleVideoSelect(video)}
			style={styles.btnVideo}
		>
			<View style={styles.vwVideoName}>
				<Text style={styles.txtVideoName}>{video.session.teamName}</Text>
			</View>
			<View style={styles.vwVideoName}>
				<Text style={{ fontSize: 13 }}>Session ID: {video.session.id}</Text>
				<Text style={{ fontSize: 12 }}>(Video ID: {video.id})</Text>
			</View>
			<View style={styles.vwVideoDate}>
				<Text style={styles.txtVideoDate}>
					{new Date(video.session.sessionDate).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
					})}{" "}
					{new Date(video.session.sessionDate).toLocaleTimeString("en-GB", {
						hour: "2-digit",
					})}
					h
				</Text>
			</View>
		</TouchableOpacity>
	);

	const whichModalToDisplay = () => {
		if (isVisibleInfoModal) {
			return {
				modalComponent: (
					<ModalInformationOk
						title={infoModalContent.title}
						message={infoModalContent.message}
						variant={infoModalContent.variant}
						onClose={() => setIsVisibleInfoModal(false)}
					/>
				),
				useState: isVisibleInfoModal,
				useStateSetter: () => setIsVisibleInfoModal(false),
			};
		}

		return undefined;
	};

	return (
		<ScreenFrameWithTopChildrenSmall
			navigation={navigation}
			topChildren={topChildren}
			topHeight={120}
			modalComponentAndSetterObject={whichModalToDisplay()}
		>
			<View style={styles.container}>
				<View style={styles.containerTop}>
					<Text style={styles.txtTitle}>Videos available for review</Text>
					<View style={styles.vwUnderLine} />
				</View>
				<View style={styles.containerMiddle}>
					<FlatList
						data={videoArray}
						renderItem={renderVideoItem}
						keyExtractor={(item) => item.id.toString()}
						contentContainerStyle={styles.scrollViewVideos}
					/>
				</View>
			</View>
		</ScreenFrameWithTopChildrenSmall>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		gap: 10,
		paddingVertical: 10,
	} as ViewStyle,

	// ----- TOP Children -----
	vwTopChildren: {
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	} as ViewStyle,

	txtTopChildSelectedTribeName: {
		color: "white",
		fontSize: 20,
	} as TextStyle,
	vwCapsuleSuper: {
		position: "relative",
		width: Dimensions.get("window").width * 0.8,
		height: 50,
	} as ViewStyle,
	vwCapsule: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		backgroundColor: "#806181",
		borderRadius: 10,
		padding: 5,
	} as ViewStyle,
	vwCapsuleExpanded: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		backgroundColor: "#806181",
		borderRadius: 10,
		padding: 5,
		width: Dimensions.get("window").width * 0.8,
		position: "absolute",
		top: 0,
		zIndex: 1,
	} as ViewStyle,
	vwLeftCapsule: {
		width: "80%",
	} as ViewStyle,
	vwLeftCapsuleExpanded: {
		width: Dimensions.get("window").width * 0.8,
		height: "100%",
		position: "absolute",
		top: 0,
		zIndex: 1,
		backgroundColor: "#C0A9C0",
	} as ViewStyle,
	txtDropdownTopChildTeamName: {
		color: "white",
		fontSize: 20,
	} as TextStyle,
	vwDropdownList: {
		padding: 5,
		width: "100%",
		height: "100%",
	} as ViewStyle,
	vwRightCapsule: {
		height: "100%",
	} as ViewStyle,
	vwTeamRow: {} as ViewStyle,
	btnSelectTribe: {} as ViewStyle,

	// ------- TOP ---------
	containerTop: {
		alignItems: "center",
		justifyContent: "center",
	} as ViewStyle,
	txtTitle: {
		fontSize: 20,
		color: "#A3A3A3",
	} as TextStyle,
	vwUnderLine: {
		width: "80%",
		height: 1,
		backgroundColor: "#A3A3A3",
	} as ViewStyle,

	// ------- MIDDLE ---------
	containerMiddle: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	} as ViewStyle,
	scrollViewVideos: {
		gap: 10,
		paddingVertical: 10,
	} as ViewStyle,
	btnVideo: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: Dimensions.get("window").width * 0.8,
		paddingHorizontal: 25,
		height: 50,
		borderRadius: 25,
		borderColor: "#585858",
		borderWidth: 1,
	} as ViewStyle,
	vwVideoName: {
		justifyContent: "center",
		gap: 2,
	} as ViewStyle,
	txtVideoName: {
		fontSize: 15,
	} as TextStyle,
	vwVideoDate: {
		alignItems: "center",
		justifyContent: "center",
	} as ViewStyle,
	txtVideoDate: {
		fontSize: 15,
	} as TextStyle,
});
