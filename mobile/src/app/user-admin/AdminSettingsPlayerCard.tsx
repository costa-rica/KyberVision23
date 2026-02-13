import React, { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import {
	StyleSheet,
	Text,
	View,
	Image,
	Dimensions,
	ImageBackground,
} from "react-native";
import ScreenFrameWithTopChildrenSmall from "../../components/screen-frames/ScreenFrameWithTopChildrenSmall";
import { useSelector } from "react-redux";
import IconMagnifingGlass from "../../assets/images/review/iconMagnifingGlass.svg";
import ButtonKvNoDefault from "../../components/buttons/ButtonKvNoDefault";
import ModalAdminSettingsPlayerCardLinkUser from "../../components/modals/ModalAdminSettingsPlayerCardLinkUser";
import ModalAdminSettingsDeletePlayerUserLinkYesNo from "../../components/modals/ModalAdminSettingsDeletePlayerUserLinkYesNo";
import { RootState } from "../../types/store";
import { AdminSettingsPlayerCardScreenProps } from "../../types/navigation";
import { Player } from "../../reducers/team";

interface ModalComponentAndSetterObject {
	modalComponent: React.ReactElement;
	useState: boolean;
	useStateSetter: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AdminSettingsPlayerCard({
	navigation,
	route,
}: AdminSettingsPlayerCardScreenProps) {
	const [playerObject, setPlayerObject] = useState<Player>(route.params.playerObject);
	const userReducer = useSelector((state: RootState) => state.user);
	const teamReducer = useSelector((state: RootState) => state.team);
	const [localImageUri, setLocalImageUri] = useState<string | null>(null);
	const [isVisibleLinkUserModal, setIsVisibleLinkUserModal] = useState(false);
	const [isVisibleDeletePlayerUserLinkModal, setIsVisibleDeletePlayerUserLinkModal] = useState(false);

	const selectedTeam = teamReducer.teamsArray.filter((team) => team.selected)[0];
	const selectedTeamId = teamReducer.teamsArray.find((t) => t.selected)?.id;
	const isAdminOfThisTeam =
		userReducer.contractTeamUserArray.find(
			(ctu) => Number(ctu.teamId) === Number(selectedTeamId)
		)?.isAdmin ?? false;

	const topChildren = (
		<Text>
			{selectedTeam?.teamName} Settings
		</Text>
	);

	const fetchPlayerProfilePicture = async (): Promise<void> => {
		if (!playerObject.image) return;

		try {
			const localDir = `${FileSystem.documentDirectory}profile-pictures/`;
			await FileSystem.makeDirectoryAsync(localDir, { intermediates: true });
			const fileUri = `${localDir}${playerObject.image}`;

			const downloadResumable = await FileSystem.downloadAsync(
				`${process.env.EXPO_PUBLIC_API_BASE_URL}/players/profile-picture/${playerObject.image}`,
				fileUri,
				{
					headers: {
						Authorization: `Bearer ${userReducer.token}`,
					},
				}
			);

			if (downloadResumable.status === 200) {
				setLocalImageUri(fileUri);
			} else {
				console.log(
					"Failed to download image, status:",
					downloadResumable.status
				);
			}
		} catch (error) {
			console.log("Error downloading player profile picture:", error);
		}
	};

	useEffect(() => {
		const checkAndLoadImage = async () => {
			if (!playerObject.image) return;
			const localDir = `${FileSystem.documentDirectory}profile-pictures/`;
			const fileUri = `${localDir}${playerObject.image}`;
			try {
				const fileInfo = await FileSystem.getInfoAsync(fileUri);
				if (fileInfo.exists) {
					setLocalImageUri(fileUri);
				} else {
					await fetchPlayerProfilePicture();
				}
			} catch (error) {
				console.log("Error checking image file:", error);
				await fetchPlayerProfilePicture();
			}
		};
		checkAndLoadImage();
	}, [playerObject.image]);

	const whichModalToDisplay = (): ModalComponentAndSetterObject | undefined => {
		if (isVisibleLinkUserModal) {
			return {
				modalComponent: (
					<ModalAdminSettingsPlayerCardLinkUser
						playerObject={playerObject}
						setIsVisibleLinkUserModal={setIsVisibleLinkUserModal}
						setPlayerObject={setPlayerObject}
					/>
				),
				useState: isVisibleLinkUserModal,
				useStateSetter: setIsVisibleLinkUserModal,
			};
		}
		if (isVisibleDeletePlayerUserLinkModal) {
			return {
				modalComponent: (
					<ModalAdminSettingsDeletePlayerUserLinkYesNo
						playerObject={playerObject}
						setIsVisibleDeletePlayerUserLinkModal={
							setIsVisibleDeletePlayerUserLinkModal
						}
						setPlayerObject={setPlayerObject}
					/>
				),
				useState: isVisibleDeletePlayerUserLinkModal,
				useStateSetter: setIsVisibleDeletePlayerUserLinkModal,
			};
		}
	};

	return (
		<ScreenFrameWithTopChildrenSmall
			navigation={navigation}
			topChildren={topChildren}
			screenName={"AdminSettingsPlayerCard"}
			modalComponentAndSetterObject={whichModalToDisplay()}
			topHeight={"15%"}
		>
			<View style={styles.container}>
				<View style={styles.containerTop}>
					<View style={styles.vwPlayerNameAndShirtNumber}>
						<View style={styles.vwPlayerLeft}>
							<Text style={styles.txtShirtNumber}>
								{playerObject.shirtNumber}
							</Text>
						</View>
						<View style={styles.vwPlayerRight}>
							<Text style={styles.txtPlayerName}>{playerObject.firstName}</Text>
							<Text style={styles.txtPlayerName}>
								{playerObject.lastName?.toUpperCase()}
							</Text>
						</View>
					</View>
					<View style={styles.vwPlayerImage}>
						<Image
							source={localImageUri ? { uri: localImageUri } : undefined}
							style={styles.imgPlayer}
						/>
					</View>
				</View>
				<ImageBackground
					source={require("../../assets/images/user-admin/AdminSettingsPlayerCardWaveThing.png")}
					style={styles.vwPlayerRolesWaveThing}
				>
					<View style={styles.vwPlayerLabel}>
						<Text style={styles.txtPlayerLabel}>Player</Text>
					</View>
					<View style={styles.vwPlayerLabel}>
						<Text style={styles.txtPlayerLabel}>{playerObject.position}</Text>
					</View>
				</ImageBackground>
				<View style={styles.containerBottom}>
					<View style={styles.vwLinkedAccount}>
						<Text style={styles.txtLabel}>Squad member account linked</Text>
						<View style={styles.vwLinkeAccountInput}>
							{playerObject.isUser ? (
								<Text style={styles.txtValue}>{playerObject.username}</Text>
							) : (
								<Text style={styles.txtValue}> No account linked</Text>
							)}
							{isAdminOfThisTeam && !playerObject.isUser && (
								<ButtonKvNoDefault
									onPress={() => {
										setIsVisibleLinkUserModal(true);
									}}
									styleView={styles.btnSearch}
								>
									<IconMagnifingGlass />
								</ButtonKvNoDefault>
							)}
							{isAdminOfThisTeam && playerObject.isUser && (
								<ButtonKvNoDefault
									onPress={() => {
										console.log("Remove link");
										setIsVisibleDeletePlayerUserLinkModal(true);
									}}
									styleView={styles.btnCircleX}
								>
									<Image
										source={require("../../assets/images/multi-use/btnCircleXGray.png")}
										resizeMode="contain"
										style={styles.imgIconForLink}
									/>
								</ButtonKvNoDefault>
							)}
						</View>
					</View>

					<View style={styles.vwShirtNumber}>
						<Text style={styles.txtShirtNumberTitle}>Shirt Number</Text>
						<Text style={styles.txtShirtNumberValue}>
							{playerObject.shirtNumber}
						</Text>
					</View>
					<View style={styles.vwShirtNumber}>
						<Text style={styles.txtShirtNumberTitle}>Post</Text>
						<Text style={styles.txtShirtNumberValue}>
							{playerObject.position}
						</Text>
					</View>
				</View>
			</View>
		</ScreenFrameWithTopChildrenSmall>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
	},
	// ------------
	// Top
	// ------------
	containerTop: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		zIndex: 1,
	},
	vwPlayerTop: {
		flexDirection: "row",
	},
	vwPlayerNameAndShirtNumber: {
		flexDirection: "row",
		gap: 10,
		padding: 5,
		width: Dimensions.get("window").width * 0.3,
		marginTop: 20,
		marginLeft: 20,
	},
	vwPlayerLeft: {
		justifyContent: "center",
		backgroundColor: "#806181",
		borderRadius: 30,
		height: 60,
		width: 60,
		alignItems: "center",
	},
	txtShirtNumber: {
		color: "white",
		fontSize: 40,
		textAlign: "center",
		fontWeight: "bold",
	},
	vwPlayerRight: {
		justifyContent: "center",
	},
	txtPlayerName: {
		color: "#6E4C84",
		fontSize: 16,
		fontWeight: "600",
	},
	vwPlayerImage: {
		width: 150,
		height: 150,
		borderRadius: 75,
		overflow: "hidden",
	},
	imgPlayer: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	vwPlayerRolesWaveThing: {
		alignItems: "flex-start",
		width: Dimensions.get("window").width,
		height: 100,
		marginTop: -50,
		padding: 10,
	},
	vwPlayerLabel: {
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 30,
		backgroundColor: "#806181",
		padding: 5,
	},
	txtPlayerLabel: {
		fontSize: 20,
		color: "white",
		lineHeight: 20,
	},

	// ------------
	// Bottom
	// ------------
	containerBottom: {
		width: "100%",
		padding: 20,
		paddingRight: 60,
		gap: 20,
	},
	vwLinkedAccount: {
		width: "100%",
	},
	txtLabel: {
		color: "gray",
	},
	txtValue: {
		fontSize: 16,
		fontStyle: "italic",
	},
	vwLinkeAccountInput: {
		flexDirection: "row",
		alignItems: "center",
		gap: 30,
	},
	btnSearch: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 40,
		width: 40,
		borderRadius: 20,
		backgroundColor: "#E8E8E8",
		borderColor: "#806181",
		borderWidth: 1,
	},
	btnCircleX: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 40,
		width: 40,
		borderRadius: 20,
	},
	imgIconForLink: {
		width: 30,
		height: 30,
	},
	vwShirtNumber: {
		borderBottomColor: "gray",
		borderBottomWidth: 1,
		width: "100%",
		marginBottom: 10,
	},
	txtShirtNumberTitle: {
		color: "gray",
		marginBottom: 5,
	},
	txtShirtNumberValue: {
		fontSize: 16,
	},
});