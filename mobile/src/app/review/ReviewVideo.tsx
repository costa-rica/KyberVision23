import React, { useState, useEffect, useRef } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

import ScreenFrameWithTopChildrenSmall from "../../components/screen-frames/ScreenFrameWithTopChildrenSmall";
import ModalInformationYesOrNo from "../../components/modals/ModalInformationYesOrNo";
import ModalInformationOk from "../../components/modals/ModalInformationOk";

import { useDispatch, useSelector } from "react-redux";
import * as ScreenOrientation from "expo-screen-orientation";
import ReviewVideoPortrait from "../../components/review/ReviewVideoPortrait";
import ReviewVideoLandscape from "../../components/review/ReviewVideoLandscape";
import {
	filterReviewReducerActionsArrayOnPlayer,
	updateReviewReducerIsPlayingForActionsArrayV6,
	ReviewAction,
	PlayerDbObject,
} from "../../reducers/review";

import { RootState } from "../../types/store";

type Props = NativeStackScreenProps<RootStackParamList, "ReviewVideo">;

export default function ReviewVideo({ navigation }: Props) {
	const dispatch = useDispatch();
	const reviewReducer = useSelector((state: RootState) => state.review);
	const userReducer = useSelector((state: RootState) => state.user);

	const [orientation, setOrientation] = useState("portrait");

	const handleBackPress = async () => {
		await sendReviewReducerActionsArray();
		await ScreenOrientation.lockAsync(
			ScreenOrientation.OrientationLock.PORTRAIT_UP
		);
		setOrientation("portrait");
		navigation.goBack();
	};

	useEffect(() => {
		const lockToLandscape = async () => {
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
			);
			setOrientation("landscape");
		};

		lockToLandscape();

		return () => {
			ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.PORTRAIT_UP
			);
		};
	}, []);

	const playerRef = useRef<any>(null);
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isVisibleConfirmModal, setIsVisibleConfirmModal] = useState(false);
	const [selectionsCount, setSelectionsCount] = useState(0);
	const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
	const [infoModalContent, setInfoModalContent] = useState({
		title: "",
		message: "",
		variant: "info" as "info" | "success" | "error" | "warning",
	});

	useEffect(() => {
		const interval = setInterval(async () => {
			if (playerRef.current && playing) {
				const currentPlayTime = await playerRef.current.getCurrentTime();
				setCurrentTime(currentPlayTime);

				dispatch(
					updateReviewReducerIsPlayingForActionsArrayV6(currentPlayTime)
				);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [playing, dispatch]);

	const handleStateChange = (state: string) => {
		if (state === "playing" && playerRef.current) {
			playerRef.current.getDuration().then((dur: number) => {
				setDuration(dur);
			});
		}
	};

	const togglePlaying = () => {
		console.log("--> play button fired !!");
		setPlaying((prev) => !prev);
	};

	const rewind = async () => {
		if (playerRef.current) {
			const currentTime = await playerRef.current.getCurrentTime();
			playerRef.current.seekTo(Math.max(currentTime - 2, 0), true);
		}
	};

	const forward = async () => {
		if (playerRef.current) {
			const currentTime = await playerRef.current.getCurrentTime();
			playerRef.current.seekTo(currentTime + 5, true);
		}
	};

	const handleSelectedAction = (action: ReviewAction) => {
		if (!playing) {
			togglePlaying();
		}
		if (playerRef.current) {
			playerRef.current.seekTo(action.timestamp - 1, true);
		}
	};

	const filterActions = (parameterName: string, object: PlayerDbObject) => {
		if (parameterName === "player") {
			dispatch(filterReviewReducerActionsArrayOnPlayer(object));
		}
	};

	const handlePressRequestMontageVideo = async () => {
		const count = reviewReducer.reviewReducerActionsArray.filter(
			(action) => action.isDisplayed
		).length;
		if (count > 5) {
			setSelectionsCount(count);
			setIsVisibleConfirmModal(true);
		} else {
			requestMontageVideo();
		}
	};

	const requestMontageVideo = async () => {
		console.log(`in requestMontage video`);
		console.log(reviewReducer.reviewReducerVideoObject?.id);

		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_BASE_URL}/videos/montage-service/queue-a-job`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${userReducer.token}`,
					},
					body: JSON.stringify({
						matchId: 1,
						videoId: reviewReducer.reviewReducerVideoObject?.id,
						actionsArray: reviewReducer.reviewReducerActionsArray.filter(
							(action) => action.isDisplayed
						),
						token: userReducer.token,
					}),
				}
			);

			if (response.status !== 200) {
				setInfoModalContent({
					title: "Error",
					message: `There was a server error: ${response.status}`,
					variant: "error",
				});
				setIsVisibleInfoModal(true);
				return;
			} else {
				const contentType = response.headers.get("Content-Type");
				if (contentType?.includes("application/json")) {
					await response.json();
					setInfoModalContent({
						title: "Video request sent",
						message: "Check your email for the video.",
						variant: "success",
					});
					setIsVisibleInfoModal(true);
				}
			}
		} catch (error) {
			console.error("Error requesting montage video:", error);
			setInfoModalContent({
				title: "Error",
				message: "Failed to request montage video",
				variant: "error",
			});
			setIsVisibleInfoModal(true);
		}
	};

	const sendReviewReducerActionsArray = async () => {
		console.log("in sendReviewReducerActionsArray");
		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_BASE_URL}/contract-user-actions/update-user-favorites`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${userReducer.token}`,
					},
					body: JSON.stringify({
						sessionId: reviewReducer.reviewReducerVideoObject?.session.id,
						actionsArray: reviewReducer.reviewReducerActionsArray,
					}),
				}
			);
			if (response.status !== 200) {
				setInfoModalContent({
					title: "Error",
					message: `There was a server error: ${response.status}`,
					variant: "error",
				});
				setIsVisibleInfoModal(true);
				return;
			}
			const contentType = response.headers.get("Content-Type");

			if (contentType?.includes("application/json")) {
				await response.json();
			}

			console.log(" --- finished getting Actions and other stuff ---");
		} catch (error) {
			setInfoModalContent({
				title: "Error fetching actions for match",
				message: error instanceof Error ? error.message : "Unknown error",
				variant: "error",
			});
			setIsVisibleInfoModal(true);
		}
	};

	const whichModalToDisplay = () => {
		if (isVisibleConfirmModal) {
			return {
				modalComponent: (
					<ModalInformationYesOrNo
						title={`You are about to request a montage of ${selectionsCount} actions`}
						message="Are you sure you want to proceed?"
						noButtonText="Cancel"
						onYes={() => {
							requestMontageVideo();
							setIsVisibleConfirmModal(false);
						}}
						onNo={() => {
							console.log("❌ No Pressed");
							setIsVisibleConfirmModal(false);
						}}
						onClose={() => {
							setIsVisibleConfirmModal(false);
						}}
					/>
				),
				useState: isVisibleConfirmModal,
				useStateSetter: () => setIsVisibleConfirmModal(false),
			};
		}

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

	return orientation === "portrait" ? (
		<ScreenFrameWithTopChildrenSmall
			navigation={navigation}
			modalComponentAndSetterObject={whichModalToDisplay()}
		>
			<ReviewVideoPortrait
				orientation={orientation}
				playerRef={playerRef}
				playing={playing}
				currentTime={currentTime}
				duration={duration}
				handleStateChange={handleStateChange}
				togglePlaying={togglePlaying}
				rewind={rewind}
				forward={forward}
				handleSelectedAction={handleSelectedAction}
				handleBackPress={handleBackPress}
			/>
		</ScreenFrameWithTopChildrenSmall>
	) : (
		<ReviewVideoLandscape
			navigation={navigation}
			orientation={orientation}
			playerRef={playerRef}
			playing={playing}
			currentTime={currentTime}
			duration={duration}
			handleStateChange={handleStateChange}
			togglePlaying={togglePlaying}
			rewind={rewind}
			forward={forward}
			handleSelectedAction={handleSelectedAction}
			handleBackPress={handleBackPress}
			filterActions={filterActions}
			handlePressRequestMontageVideo={handlePressRequestMontageVideo}
			onSeek={(time: number) => setCurrentTime(time)}
		/>
	);
}
