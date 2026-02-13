import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	FlatList,
	TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import ScreenFrameWithTopChildrenSmall from "../../components/screen-frames/ScreenFrameWithTopChildrenSmall";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../types/store";
import ButtonKvNoDefaultTextOnly from "../../components/buttons/ButtonKvNoDefaultTextOnly";
import ModalInformationOk from "../../components/modals/ModalInformationOk";
import WarningTriangle from "../../assets/images/scripting/warningTriangle.svg";
import Tribe from "../../assets/images/welcome/Tribe.svg";
import {
	setScriptingForPlayerObject,
	updatePlayersArray,
	createPlayerArrayPositionProperties,
} from "../../reducers/script";
import { reducerSetUserSwipePadWheel } from "../../reducers/user";
import { scriptReducerOffline } from "../../data/scriptReducerOffline";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../types/navigation";

import DraggableFlatList, {
	ScaleDecorator,
} from "react-native-draggable-flatlist";
// NEW: import the types for the draggable list
import type { RenderItemParams } from "react-native-draggable-flatlist";

type ScriptingLiveSelectPlayersScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ScriptingLiveSelectPlayers"
>;

// 1) Give your items a concrete, reusable type
export interface Player {
	id: number;
	firstName: string;
	lastName: string;
	shirtNumber: number;
	positionArea?: number | null;
	selected?: boolean;
}

export default function ScriptingLiveSelectPlayers({
	navigation,
}: ScriptingLiveSelectPlayersScreenProps) {
	const userReducer = useSelector((state: RootState) => state.user);
	const scriptReducer = useSelector((state: RootState) => state.script);
	const teamReducer = useSelector((state: RootState) => state.team);
	const dispatch = useDispatch<AppDispatch>();
	// const [displayWarning, setDisplayWarning] = useState(false);
	const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
	const [infoModalContent, setInfoModalContent] = useState({
		title: "",
		message: "",
		variant: "info" as "info" | "success" | "error" | "warning",
	});

	const topChildren = (
		<View style={styles.vwTopChildren}>
			<Text style={styles.txtTopChildren}>Scripting Live Select Players</Text>
			<Text style={styles.txtSelectedTribeName}>
				{teamReducer.teamsArray.find((tribe) => tribe.selected)?.teamName}
			</Text>
		</View>
	);

	const fetchPlayers = async () => {
		// console.log("[4] Fetching players online");
		const selectedTeam = teamReducer.teamsArray.find((tribe) => tribe.selected);

		if (!selectedTeam) {
			setInfoModalContent({
				title: "Error",
				message: "No team selected",
				variant: "error",
			});
			setIsVisibleInfoModal(true);
			return;
		}

		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_BASE_URL}/players/team/${selectedTeam.id}`,
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

			if (response.ok && resJson?.playersArray) {
				console.log("Response OK");
				const tempArray = resJson.playersArray.map((item: any) => ({
					...item,
					selected: false,
				}));
				// console.log(JSON.stringify(tempArray, null, 2));
				dispatch(updatePlayersArray(tempArray));
				dispatch(createPlayerArrayPositionProperties(tempArray));
			} else {
				const errorMessage =
					resJson?.error || `There was a server error: ${response.status}`;
				setInfoModalContent({
				title: "Error",
				message: errorMessage,
				variant: "error",
			});
			setIsVisibleInfoModal(true);
			}
		} catch (error) {
			console.error("Fetch players error:", error);
			setInfoModalContent({
				title: "Error",
				message: "Failed to fetch players",
				variant: "error",
			});
			setIsVisibleInfoModal(true);
		}
	};

	const fetchPlayersOffline = () => {
		console.log("Fetched players offline");
		dispatch(updatePlayersArray(scriptReducerOffline.playersArray));
		dispatch(
			createPlayerArrayPositionProperties(scriptReducerOffline.playersArray)
		);
	};

	useEffect(() => {
		// console.log("--- [1] useEffect scriptReducer.playerObjectPositionalArray");
		// scriptReducer.playerObjectPositionalArray.map((p, i) =>
		// 	console.log(`pos: ${i + 1}, name: ${p.firstName}`)
		// );
		// console.log(scriptReducer.playerObjectPositionalArray)
		if (scriptReducer.playerObjectPositionalArray.length === 0) {
			// console.log("[2] Fetching players");
			if (userReducer.token === "offline") {
				fetchPlayersOffline();
			} else {
				fetchPlayers();
			}
		}
		dispatch(
			reducerSetUserSwipePadWheel({
				circleRadiusOuter: 60,
				circleRadiusMiddle: 40,
				circleRadiusInner: 20,
			})
		);
	}, []);

	// -- DraggableFlatList

	const renderItemPlayerRow = useCallback(
		({ item, drag, isActive }: RenderItemParams<Player>) => {
			const player = item;
			const playerIsActiveInCurrentMatch = player.positionArea !== null;
			const handleSelectPlayer = () => {
				const tempArray = scriptReducer.playersArray.map((p) => {
					if (p.id === player.id) {
						// setDisplayWarning(false);
						return {
							...p,
							selected: !p.selected,
						};
					}
					return { ...p, selected: false };
				});
				// setData(tempArray);
				dispatch(updatePlayersArray(tempArray));
				if (scriptReducer.scriptingForPlayerObject?.id !== player.id) {
					dispatch(setScriptingForPlayerObject(player));
				} else {
					dispatch(setScriptingForPlayerObject(null));
				}
				dispatch(createPlayerArrayPositionProperties(tempArray));
			};

			return (
				<ScaleDecorator>
					<TouchableOpacity
						onPress={() => {
							// console.log(player);
							handleSelectPlayer();
						}}
						key={player.id}
						style={[
							styles.btnPlayer,
							player.selected && styles.btnPlayerSelected,
							playerIsActiveInCurrentMatch &&
								styles.btnPlayerIsActiveInCurrentMatch,
						]}
						onLongPress={drag} // 👈 hold to start dragging
						disabled={isActive}
						activeOpacity={0.8}
					>
						<View style={styles.vwRowLeft}>
							<View style={styles.vwShirtNumber}>
								<Text style={styles.txtShirtNumber}>{player.shirtNumber}</Text>
							</View>
							<View style={styles.btnPlayerNameDetails}>
								<Text style={styles.txtPlayerName}>{player.firstName}</Text>
								<Text style={styles.txtPlayerName}>{player.lastName}</Text>
							</View>
						</View>
						<View style={styles.vwRowRight}>
							{playerIsActiveInCurrentMatch && (
								<View style={styles.vwPositionArea}>
									<Text style={styles.txtPositionAreaLabel}>
										position area:
									</Text>
									<Text style={styles.txtPositionAreaValue}>
										{player.positionArea}
									</Text>
								</View>
							)}
						</View>
					</TouchableOpacity>
				</ScaleDecorator>
			);
		},
		[dispatch, scriptReducer.playersArray]
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
			sizeOfLogo={0}
			modalComponentAndSetterObject={whichModalToDisplay()}
		>
			<View style={styles.container}>
				<View style={styles.containerTop}>
					<View style={styles.vwPlayersTableHeading}>
						<View style={styles.vwTribeCrop}>
							<Tribe width={50} height={60} />
						</View>
						<Text>Players</Text>
					</View>
					<View style={styles.vwPlayersTable}>
						{scriptReducer.playersArray?.length > 0 ? (
							<DraggableFlatList<Player>
								// data={data}
								data={scriptReducer.playersArray}
								keyExtractor={(item: Player) => String(item.id)}
								renderItem={renderItemPlayerRow}
								// onDragEnd={({ data: newData }) => setData(newData)} // 👈 updates order after drop
								onDragEnd={({ data: newData }) => {
									dispatch(updatePlayersArray(newData));
									dispatch(createPlayerArrayPositionProperties(newData));
								}} // 👈 updates order after drop
								// Optional niceties:
								activationDistance={0} // start on long-press by default
								autoscrollSpeed={50}
								autoscrollThreshold={50}
							/>
						) : (
							<Text>No players found</Text>
						)}
					</View>
				</View>
				<View style={styles.containerBottom}>
					{/* <View style={{ padding: 5 }}>
						{scriptReducer.scriptingForPlayerObject ? (
							<Text style={{ fontSize: 16, color: "black" }}>
								scriptingForPlayerObject:{" "}
								{scriptReducer.scriptingForPlayerObject?.firstName}
							</Text>
						) : (
							<View>
								<Text>
									Positional Players count:{" "}
									{scriptReducer.playerObjectPositionalArray.length}
								</Text>
								{scriptReducer.playerObjectPositionalArray.map((p, i) => (
									<Text key={p.id}>
										{i + 1}: {p.firstName}
									</Text>
								))}
							</View>
						)}
					</View> */}
					<View>
						{!scriptReducer.scriptingForPlayerObject && (
							<View>
								<Text style={{ color: "black" }}>
									Presss, hold and drag to change player position
								</Text>
							</View>
						)}
					</View>
					<View style={styles.vwInputGroup}>
						<ButtonKvNoDefaultTextOnly
							// active={
							// 	scriptReducer.playersArray.filter((player) => player.selected)
							// 		.length > 0
							// }
							// onPress={handleSelectPlayerPress}
							onPress={() => navigation.navigate("ScriptingLive")}
							styleView={styles.btnSelectPlayer}
							styleText={styles.btnSelectPlayerText}
							// styleText={
							// 	scriptReducer.playersArray.filter((player) => player.selected)
							// 		.length > 0
							// 		? styles.btnSelectPlayerText
							// 		: styles.btnSelectPlayerTextInactive
							// }
						>
							{scriptReducer.scriptingForPlayerObject
								? "Script selected player"
								: "Script 6 players"}
						</ButtonKvNoDefaultTextOnly>
					</View>
				</View>
			</View>
		</ScreenFrameWithTopChildrenSmall>
	);
}
const styles = StyleSheet.create({
	// ---- Screen frame + top header ----
	container: {
		flex: 1,
		justifyContent: "center",
		gap: 10,
		paddingVertical: 10,
	},
	vwTopChildren: {
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
	},
	txtTopChildren: {
		color: "white",
		fontSize: 20,
		borderBottomWidth: 1,
		borderColor: "white",
	},
	txtSelectedTribeName: {
		color: "white",
		fontSize: 20,
		fontWeight: "bold",
	},

	// ---- Players table (top section) ----
	containerTop: {
		flex: 1,
		width: Dimensions.get("window").width * 0.9,
	},
	vwPlayersTableHeading: {
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "flex-start",
		gap: 10,
		borderBottomWidth: 1,
		borderColor: "gray",
	},
	vwTribeCrop: {
		height: 45,
	},
	vwPlayersTable: {
		flex: 1,
	},

	// ---- Row item styles used inside DraggableFlatList renderItem ----
	btnPlayer: {
		// flex: 1,
		width: "100%", // ensure full-row width
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#6E4C84",
		borderRadius: 30,
		// backgroundColor: "green",
		marginVertical: 5,
		flexDirection: "row",
		gap: 10,
		padding: 3,
		overflow: "hidden", // avoid visual spill during drag/scale
	},
	btnPlayerSelected: {
		backgroundColor: "gray",
	},
	btnPlayerIsActiveInCurrentMatch: {
		borderWidth: 5,
		borderColor: "#6E4C84",
	},
	vwRowLeft: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		flexShrink: 0, // never let the left side shrink weirdly
	},
	vwShirtNumber: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#806181",
		borderRadius: 30,
		padding: 5,
		// width: "10%",
	},
	txtShirtNumber: {
		fontWeight: "bold",
		color: "white",
		fontSize: 36,
		padding: 10,
		fontFamily: "ApfelGrotezkBold",
	},
	btnPlayerNameDetails: {
		alignItems: "center",
		justifyContent: "center",
	},
	txtPlayerName: {
		textAlign: "center",
		color: "#6E4C84",
		fontSize: 22,
	},
	vwRowRight: {
		flex: 1, // take up the remaining width
		alignItems: "flex-end",
		justifyContent: "center", // vertically center right-side content
		paddingRight: 16, // smaller, consistent right padding
		minWidth: 0, // IMPORTANT on Android: allow flex child to shrink
	},
	vwPositionArea: {
		// flex: 1,
		alignItems: "center",
		justifyContent: "center",
		// backgroundColor: "purple",
		// borderRadius: 30,
		// padding: 5,
		// width: "100%",
		// width: "10%",
	},
	txtPositionAreaLabel: {
		color: "gray",
	},
	txtPositionAreaValue: {
		color: "black",
		fontSize: 22,
		fontWeight: "bold",
	},

	// ---- Bottom controls ----
	containerBottom: {
		// height: "15%",
		width: Dimensions.get("window").width * 0.9,
	},
	vwSelectPlayerWarningSuper: {
		flex: 1,
		alignItems: "center",
	},
	vwSelectPlayerWarning: {
		flexDirection: "row",
		alignItems: "center",
	},
	vwInputGroup: {
		alignItems: "center",
		paddingTop: 30,
	},
	btnSelectPlayer: {
		width: Dimensions.get("window").width * 0.6,
		height: 50,
		justifyContent: "center",
		fontSize: 24,
		color: "white",
		backgroundColor: "#C0A9C0",
		borderRadius: 35,
		alignItems: "center",
	},
	btnSelectPlayerText: {
		color: "white",
		fontSize: 24,
	},
	btnSelectPlayerTextInactive: {
		color: "#AB8EAB",
		fontSize: 24,
	},
});
