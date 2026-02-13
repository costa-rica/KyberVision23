import React, { useState, useRef, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	Image,
	FlatList,
	ListRenderItem,
} from "react-native";
import {
	filterReviewReducerActionsArrayOnPlayer,
	toggleReviewReducerActionIsFavorite,
	filterReviewReducerActionsArrayOnIsFavorite,
	filterReviewReducerActionsArrayShowAll,
	ReviewAction,
	PlayerDbObject,
} from "../../reducers/review";
import SwitchKvWhite from "../buttons/SwitchKvWhite";
import Timeline from "./Timeline";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
import ButtonKvImage from "../buttons/ButtonKvImage";
import { useDispatch, useSelector } from "react-redux";
import YoutubePlayer from "react-native-youtube-iframe";
import { RootState } from "../../types/store";

interface ReviewVideoLandscapeProps {
	navigation: any;
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
	filterActions: (parameterName: string, object: PlayerDbObject) => void;
	handlePressRequestMontageVideo: () => void;
	onSeek: (time: number) => void;
}

export default function ReviewVideoLandscape(props: ReviewVideoLandscapeProps) {
	const reviewReducer = useSelector((state: RootState) => state.review);
	const dispatch = useDispatch();
	const [isDropdownVisible, setDropdownVisible] = useState(false);
	const [topAndRightIsVisible, setTopAndRightIsVisible] = useState(false);
	const [isFavoritesOnly, setIsFavoritesOnly] = useState(
		reviewReducer.isFavoriteToggle
	);
	const [videoWidth, setVideoWidth] = useState(Dimensions.get("window").width);
	const [videoHeight, setVideoHeight] = useState(
		Dimensions.get("window").height
	);

	const flatListRef = useRef<FlatList>(null);

	const forceScrollFlatlistToAction = () => {
		const currentPlayingIndex =
			reviewReducer.reviewReducerActionsArray.findIndex(
				(action) => action.isPlaying
			);

		if (flatListRef.current && currentPlayingIndex !== -1) {
			flatListRef.current.scrollToIndex({
				index: currentPlayingIndex,
				animated: true,
				viewPosition: 0.5,
			});
		}
	};

	useEffect(() => {
		setIsFavoritesOnly(reviewReducer.isFavoriteToggle);
	}, [reviewReducer.isFavoriteToggle]);

	const renderActionItem: ListRenderItem<ReviewAction> = ({ item }) => {
		if (!item.isDisplayed) return null;
		if (!item.isPlaying) {
			return (
				<TouchableOpacity
					style={styles.touchOpAction}
					onPress={() => props.handleSelectedAction(item)}
				>
					{item.isFavorite && (
						<Image
							source={require("../../assets/images/review/reviewVideoFavoriteStarYellowInterior.png")}
							resizeMode="contain"
							style={styles.imgIsFavorite}
						/>
					)}
					<Text style={styles.txtAction}>
						{item.reviewVideoActionsArrayIndex}{" "}
					</Text>
				</TouchableOpacity>
			);
		}
		return (
			<View>
				<TouchableOpacity
					style={styles.touchOpBtnFavorite}
					onPress={() =>
						dispatch(toggleReviewReducerActionIsFavorite(item.actionsDbTableId))
					}
				>
					<Image
						source={require("../../assets/images/review/btnReviewVideoFavoriteStar.png")}
						resizeMode="contain"
						style={styles.imgBtnFavorite}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.touchOpAction, styles.touchOpActionPlaying]}
					onPress={() => props.handleSelectedAction(item)}
				>
					{item.isFavorite && (
						<Image
							source={require("../../assets/images/review/reviewVideoFavoriteStarYellowInterior.png")}
							resizeMode="contain"
							style={styles.imgIsFavorite}
						/>
					)}
					<Text style={[styles.txtAction]}>
						{item.reviewVideoActionsArrayIndex}{" "}
					</Text>
				</TouchableOpacity>
			</View>
		);
	};

	useEffect(() => {
		const handleDimensionChange = ({ window }: { window: any }) => {
			setVideoWidth(window.width);
			setVideoHeight(window.height);
		};

		const subscription = Dimensions.addEventListener(
			"change",
			handleDimensionChange
		);

		return () => {
			subscription?.remove();
		};
	}, []);

	const stylesVideoWrapper = {
		width: Dimensions.get("window").width,
		height: videoHeight,
	};
	const stylesContainerBottom = {
		position: "absolute" as const,
		bottom: 15,
		width: Dimensions.get("window").width,
		zIndex: 1,
		flexDirection: "row" as const,
		gap: 5,
		height: 90,
	};
	const stylesVwContainerBottomLeft = {
		flexDirection: "row" as const,
		gap: 10,
		alignItems: "flex-end" as const,
		width: Dimensions.get("window").width * 0.12,
	};
	const stylesVwActionsFlatListSuper = {
		width: Dimensions.get("window").width * 0.7,
	};
	const stylesVwActionsFlatList = {
		flexDirection: "row" as const,
		paddingTop: 35,
		paddingBottom: 10,
		paddingLeft: 10,
		flexGrow: 1,
	};
	const stylesTouchOpSetTopAndRightIsVisible = {
		position: "absolute" as const,
		top: 15,
		right: 15,
		zIndex: 1,
	};

	return (
		<View style={styles.container}>
			<View style={{ position: "absolute", top: 15, left: 15, zIndex: 1 }}>
				<TouchableOpacity
					onPress={() => {
						props.handleBackPress();
					}}
				>
					<Image
						source={require("../../assets/images/multi-use/btnBackArrowWhite.png")}
						resizeMode="contain"
					/>
				</TouchableOpacity>
			</View>
			{!topAndRightIsVisible && (
				<TouchableOpacity
					onPress={() => setTopAndRightIsVisible(true)}
					style={stylesTouchOpSetTopAndRightIsVisible}
				>
					<Image
						source={require("../../assets/images/review/btnReviewVideoSideTab.png")}
						resizeMode="contain"
						style={{}}
					/>
				</TouchableOpacity>
			)}
			{topAndRightIsVisible && (
				<View style={styles.containerTopRight}>
					<View style={styles.vwPlayersSelectedGroupAndFavoritesSuper}>
						<TouchableOpacity
							onPress={() => setTopAndRightIsVisible(false)}
							style={styles.containerTopRightSideTabClose}
						>
							<Image
								source={require("../../assets/images/review/btnReviewVideoSideTabClose.png")}
								resizeMode="contain"
								style={{}}
							/>
						</TouchableOpacity>
						<View style={styles.vwPlayersSelectedGroupAndFavorites}>
							<View style={styles.vwPlayersSelectedGroup}>
								<Text style={styles.txtPlayersTitle}>Players</Text>
								<View style={styles.vwPlayersSelectedAndDropDown}>
									<View style={styles.vwPlayersSelected}>
										{reviewReducer.reviewReducerListOfPlayerDbObjects.map(
											(playerDbObject) => {
												if (playerDbObject.isDisplayed) {
													return (
														<TouchableOpacity
															key={playerDbObject.id}
															onPress={() =>
																props.filterActions("player", playerDbObject)
															}
															style={styles.touchOpSelectPlayer}
														>
															<Text style={styles.txtPlayer}>
																{playerDbObject.firstName.substring(0, 3)}
															</Text>
															<Image
																source={require("../../assets/images/multi-use/whiteX.png")}
																resizeMode="contain"
																style={{
																	width: 15,
																	height: 15,
																	paddingLeft: 5,
																}}
															/>
														</TouchableOpacity>
													);
												}
											}
										)}
									</View>
									<View style={styles.vwPlayersDropDownArrow}>
										<TouchableOpacity
											onPress={() => setDropdownVisible(!isDropdownVisible)}
										>
											<Image
												source={require("../../assets/images/review/btnReviewVideoPlayersDownArrow.png")}
												resizeMode="contain"
												style={{
													transform: [
														{ rotate: isDropdownVisible ? "90deg" : "0deg" },
													],
													width: 20,
													height: 20,
												}}
											/>
										</TouchableOpacity>
									</View>
								</View>
							</View>

							<View style={styles.vwFavoritesSwitchAndTitle}>
								<Text style={styles.txtFavoritesTitle}>Favorites Only</Text>
								<View style={styles.vwFavoritesSwitch}>
									<SwitchKvWhite
										state={isFavoritesOnly}
										onPressCustom={() => {
											dispatch(filterReviewReducerActionsArrayOnIsFavorite());
											forceScrollFlatlistToAction();
										}}
									/>
								</View>
							</View>
						</View>
					</View>

					<View style={styles.vwShare}>
						<TouchableOpacity
							onPress={() => {
								console.log("pressed middle right");
								props.handlePressRequestMontageVideo();
							}}
							style={styles.touchOpMiddleRight}
						>
							<Image
								source={require("../../assets/images/review/btnShareDiagram.png")}
								resizeMode="contain"
								style={{ width: 30, height: 30 }}
							/>
							<Text style={styles.txtMiddleRight}>
								Share or export{" "}
								{
									reviewReducer.reviewReducerActionsArray.filter(
										(action) => action.isDisplayed
									).length
								}{" "}
								actions
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
			<View style={stylesVideoWrapper}>
				<YoutubePlayer
					ref={props.playerRef}
					height={videoHeight}
					width={videoWidth}
					play={props.playing}
					videoId={reviewReducer.reviewReducerVideoObject?.youTubeVideoId || ""}
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
			<View style={stylesContainerBottom}>
				<View style={stylesVwContainerBottomLeft}>
					<ButtonKvImage
						onPress={() => {
							props.togglePlaying();
						}}
						style={{ padding: 0 }}
					>
						<View style={styles.vwBtnPausePlay}>
							<Image
								source={
									props.playing
										? require("../../assets/images/multi-use/btnPause.png")
										: require("../../assets/images/multi-use/btnPlay.png")
								}
								alt="logo"
								resizeMode="contain"
								style={{ width: 20, height: 20 }}
							/>
						</View>
					</ButtonKvImage>

					<ButtonKvImage
						onPress={() => {
							dispatch(filterReviewReducerActionsArrayShowAll());
						}}
						style={styles.vwBtnShowAll}
					>
						<Text style={styles.txtShowAll}>tout lire</Text>
					</ButtonKvImage>
				</View>
				<View style={stylesVwActionsFlatListSuper}>
					<FlatList
						ref={flatListRef}
						data={reviewReducer.reviewReducerActionsArray}
						renderItem={renderActionItem}
						keyExtractor={(item) =>
							item.reviewVideoActionsArrayIndex.toString()
						}
						horizontal={true}
						contentContainerStyle={stylesVwActionsFlatList}
						extraData={reviewReducer.reviewReducerActionsArray}
						getItemLayout={(data, index) => ({
							length: 50,
							offset: 50 * index,
							index,
						})}
						showsHorizontalScrollIndicator={false}
					/>
				</View>
			</View>
			<View
				style={{
					position: "absolute",
					bottom: 0,
					width: Dimensions.get("window").width,
					height: 15,
					zIndex: 2,
				}}
			>
				{/* <GestureHandlerRootView style={styles.gestureViewTimeline}> */}
				<View style={styles.gestureViewTimeline}>
					<Timeline
						currentTime={props.currentTime}
						duration={props.duration}
						playerRef={props.playerRef}
						onSeek={props.onSeek}
					/>
					{/* </GestureHandlerRootView> */}
				</View>
			</View>
			{isDropdownVisible && (
				<View style={styles.vwPlayersOptions}>
					{reviewReducer.reviewReducerListOfPlayerDbObjects.map(
						(playerDbObject) => {
							if (!playerDbObject.isDisplayed) {
								return (
									<TouchableOpacity
										key={playerDbObject.id}
										onPress={() => {
											dispatch(
												filterReviewReducerActionsArrayOnPlayer(playerDbObject)
											);
											forceScrollFlatlistToAction();
										}}
										style={styles.touchOpSelectPlayer}
									>
										<Text>{playerDbObject.firstName.substring(0, 3)}</Text>
									</TouchableOpacity>
								);
							}
						}
					)}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "purple",
	},
	containerTopRight: {
		position: "absolute",
		top: 0,
		right: 0,
		zIndex: 1,
		justifyContent: "flex-end",
		alignItems: "flex-end",
	},
	vwPlayersSelectedGroupAndFavoritesSuper: {
		justifyContent: "flex-end",
		alignItems: "center",
		borderBottomLeftRadius: 12,
		flexDirection: "row",
	},
	containerTopRightSideTabClose: {},
	vwFavoritesSwitch: {
		height: 50,
		width: 100,
		justifyContent: "center",
		alignItems: "center",
	},
	vwFavoritesSwitchAndTitle: {
		alignItems: "center",
	},
	txtFavoritesTitle: {
		color: "white",
		fontWeight: "bold",
	},
	vwPlayersSelectedGroupAndFavorites: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(74,74,74,.74)",
		borderBottomLeftRadius: 10,
	},
	vwPlayersSelectedGroup: {
		alignItems: "center",
		padding: 3,
	},
	txtPlayersTitle: {
		color: "white",
		fontWeight: "bold",
	},
	vwPlayersSelectedAndDropDown: {
		backgroundColor: "rgba(209,207,201,1)",
		justifyContent: "flex-end",
		alignItems: "center",
		flexDirection: "row",
		gap: 10,
		padding: 3,
		borderRadius: 5,
		height: 50,
	},
	vwPlayersSelected: {
		flexDirection: "row",
		gap: 5,
	},
	vwPlayersDropDownArrow: {},
	vwPlayersOptions: {
		position: "absolute",
		top: 80,
		right: 120,
		backgroundColor: "rgba(74,74,74,.74)",
		zIndex: 1,
		borderRadius: 12,
		flexDirection: "row",
		gap: 5,
		padding: 5,
	},
	touchOpSelectPlayer: {
		backgroundColor: "rgba(110,110,110,1)",
		padding: 5,
		borderRadius: 5,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	txtPlayer: {
		color: "white",
		fontFamily: "ApfelGrotezk",
	},
	vwShare: {
		width: 70,
		backgroundColor: "rgba(74,74,74,.74)",
		zIndex: 1,
		borderTopLeftRadius: 12,
		borderBottomLeftRadius: 12,
		flexDirection: "row",
		gap: 5,
		padding: 5,
		justifyContent: "center",
	},
	touchOpMiddleRight: {
		padding: 2,
		borderRadius: 5,
		alignItems: "center",
	},
	txtMiddleRight: {
		color: "white",
		fontFamily: "ApfelGrotezk",
		fontSize: 12,
		textAlign: "center",
	},
	coverView: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "transparent",
		opacity: 0.7,
	},
	vwBtnPausePlay: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "transparent",
		borderRadius: 35,
		height: 40,
		paddingLeft: 20,
		paddingBottom: 20,
	},
	vwBtnShowAll: {
		padding: 0,
		paddingBottom: 20,
	},
	txtShowAll: {
		color: "white",
		fontFamily: "ApfelGrotezk",
		fontSize: 15,
	},
	txtAction: {
		color: "white",
		fontWeight: "bold",
		fontFamily: "ApfelGrotezkBold",
		fontSize: 20,
	},
	touchOpAction: {
		borderRadius: 5,
		backgroundColor: "rgba(110,110,110,.7)",
		justifyContent: "center",
		alignItems: "center",
		width: 45,
		height: 45,
		marginLeft: 5,
	},
	touchOpActionPlaying: {
		borderWidth: 3,
		borderColor: "white",
		borderRadius: 12,
	},
	imgIsFavorite: {
		position: "absolute",
		top: -15,
		width: 20,
		height: 20,
		zIndex: 20,
	},
	touchOpBtnFavorite: {
		position: "absolute",
		top: -35,
		left: 10,
	},
	imgBtnFavorite: {},
	gestureViewTimeline: {
		alignItems: "center",
		height: 30,
		zIndex: 2,
	},
});
