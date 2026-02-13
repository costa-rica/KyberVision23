import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	Dimensions,
	TouchableOpacity,
	FlatList,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

import ScreenFrameWithTopChildrenSmall from "../../components/screen-frames/ScreenFrameWithTopChildrenSmall";
import ModalInformationOk from "../../components/modals/ModalInformationOk";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../types/store";
import { updateTeamsArray } from "../../reducers/team";
import { updateSyncReducerSelectedVideoObject } from "../../reducers/sync";
import { VideoObject } from "../../reducers/review";

type Props = NativeStackScreenProps<
	RootStackParamList,
	"ScriptingSyncVideoSelection"
>;

export default function ScriptingSyncVideoSelection({ navigation }: Props) {
	const userReducer = useSelector((state: RootState) => state.user);
	const teamReducer = useSelector((state: RootState) => state.team);
	const [displayTribeList, setDisplayTribeList] = useState(false);
	const dispatch = useDispatch();
	const [userVideosArray, setUserVideosArray] = useState<VideoObject[]>([]);
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
		// Placeholder for team-specific video fetching
		// This would typically fetch videos for the selected team
		console.log(`Fetching videos for team: ${teamId}`);
	};

	const fetchUserVideosArray = async () => {
		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_BASE_URL}/videos/user`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${userReducer.token}`,
					},
				}
			);

			console.log("Received response:", response.status);

			let resJson = null;
			const contentType = response.headers.get("Content-Type");

			if (contentType?.includes("application/json")) {
				resJson = await response.json();
			}

			if (response.ok && resJson) {
				console.log(`response ok`);
				const tempArray = resJson.videosArray.map((item: VideoObject) => {
					return {
						...item,
						selected: false,
					};
				});
				console.log(`Count of videos: ${tempArray.length}`);
				setUserVideosArray(tempArray);
			} else {
				const errorMessage =
					resJson?.error ||
					`There was a server error (and no resJson): ${response.status}`;
				setInfoModalContent({
				title: "Error",
				message: errorMessage,
				variant: "error",
			});
			setIsVisibleInfoModal(true);
			}
		} catch (error) {
			console.error("Error fetching user videos:", error);
			setInfoModalContent({
				title: "Error",
				message: "Failed to fetch videos",
				variant: "error",
			});
			setIsVisibleInfoModal(true);
		}
	};

	const handleVideoSelect = (videoObject: VideoObject) => {
		dispatch(updateSyncReducerSelectedVideoObject(videoObject));
		navigation.navigate("ScriptingSyncVideo");
	};

	useEffect(() => {
		if (userReducer.token === "offline") {
			setInfoModalContent({
				title: "Offline Mode",
				message: "Offline mode not supported yet -- setup for fetchUserVideosArray()",
				variant: "info",
			});
			setIsVisibleInfoModal(true);
		} else {
			fetchUserVideosArray();
		}
	}, [userReducer.token]);

	const fetchVideoArrayOffline = () => {
		console.log("Fetched videos offline");
		// TODO: Implement offline video fetching
		// setVideoArray(reviewReducerOffline.videoArray);
	};

	const renderVideoItem = ({ item: video }: { item: VideoObject }) => (
		<TouchableOpacity
			key={video.id}
			onPress={() => handleVideoSelect(video)}
			style={styles.btnVideo}
		>
			<View style={styles.vwVideoName}>
				<Text style={styles.txtVideoName}>{video.session.teamName}</Text>
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
			<View
				style={{
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Text style={{ fontSize: 13 }}> Session ID: {video.session.id}</Text>
				<Text style={{ fontSize: 12 }}>(Video ID: {video.id})</Text>
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
			topHeight="20%"
			modalComponentAndSetterObject={whichModalToDisplay()}
		>
			<View style={styles.container}>
				<View style={styles.containerTop}>
					<Text style={styles.txtTitle}>Videos available for sync</Text>
					<View style={styles.vwUnderLine} />
				</View>
				<View style={styles.containerMiddle}>
					<FlatList
						data={userVideosArray}
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
	},

	// ----- TOP Children -----
	vwTopChildren: {
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},

	txtTopChildSelectedTribeName: {
		color: "white",
		fontSize: 20,
	},
	vwCapsuleSuper: {
		position: "relative",
		width: Dimensions.get("window").width * 0.8,
		height: 50,
	},
	vwCapsule: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		backgroundColor: "#806181",
		borderRadius: 10,
		padding: 5,
	},
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
	},
	vwLeftCapsule: {
		width: "80%",
	},
	vwLeftCapsuleExpanded: {
		width: Dimensions.get("window").width * 0.8,
		height: "100%",
		position: "absolute",
		top: 0,
		zIndex: 1,
		backgroundColor: "#C0A9C0",
	},
	vwTeamRow: {
		padding: 5,
	},
	txtDropdownTopChildTeamName: {
		color: "white",
		fontSize: 20,
	},
	vwDropdownList: {
		padding: 5,
		width: "100%",
		height: "100%",
	},
	vwRightCapsule: {
		height: "100%",
	},
	btnSelectTribe: {
		justifyContent: "center",
		alignItems: "center",
	},

	// ------- TOP ---------
	containerTop: {
		alignItems: "center",
		justifyContent: "center",
	},
	txtTitle: {
		fontSize: 20,
		color: "#A3A3A3",
	},
	vwUnderLine: {
		width: "80%",
		height: 1,
		backgroundColor: "#A3A3A3",
	},

	// ------- MIDDLE ---------
	containerMiddle: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	},
	scrollViewVideos: {
		gap: 10,
		paddingVertical: 10,
	},
	btnVideo: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: Dimensions.get("window").width * 0.8,
		paddingHorizontal: 25,
		height: 50,
		borderRadius: 25,
		borderColor: "#585858",
		borderWidth: 1,
	},
	vwVideoName: {
		justifyContent: "center",
		gap: 2,
	},

	txtVideoName: {
		fontSize: 15,
	},
	vwVideoDate: {
		alignItems: "center",
		justifyContent: "center",
	},
	txtVideoDate: {
		fontSize: 15,
	},
});
