import React, { useState } from "react";
import { View, StyleSheet, Dimensions, LayoutChangeEvent } from "react-native";
import {
	Gesture,
	GestureStateChangeEvent,
	GestureUpdateEvent,
	TapGestureHandlerEventPayload,
	PanGestureHandlerEventPayload,
	GestureDetector,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

interface TimelineProps {
	timelineWidth?: number;
	playerRef: React.RefObject<any>;
	currentTime: number;
	duration: number;
	onSeek?: (time: number) => void;
}

interface TimelineLayout {
	x: number;
	y: number;
	width: number;
	height: number;
}

export default function Timeline({
	timelineWidth = Dimensions.get("window").width,
	playerRef,
	currentTime,
	duration,
	onSeek,
}: TimelineProps) {
	const [timelineLayout, setTimelineLayout] = useState<TimelineLayout | null>(
		null
	);

	const calculateTimelineLength = (event: LayoutChangeEvent) => {
		const { x, y, width, height } = event.nativeEvent.layout;
		setTimelineLayout({ x, y, width, height });
	};

	const handleTimelineNewPosition = (newProgress: number) => {
		const newTime = newProgress * duration;
		if (playerRef.current) {
			playerRef.current.seekTo(newTime);
		}
		if (onSeek) onSeek(newTime);
	};

	const handleTapEndDetected = (
		event: GestureStateChangeEvent<TapGestureHandlerEventPayload>
	) => {
		if (!timelineLayout) return;
		const newProgress = Math.min(
			Math.max(event.x / timelineLayout.width, 0),
			1
		);
		// console.log("- newProgress: ", newProgress);
		handleTimelineNewPosition(newProgress);
	};
	const gestureTapTimeline = Gesture.Tap().onEnd((event) => {
		runOnJS(handleTapEndDetected)(event);
	});

	const handleSwipeOnChange = (
		event: GestureUpdateEvent<PanGestureHandlerEventPayload>
	) => {
		if (!timelineLayout) return;
		const newProgress = Math.min(
			Math.max(event.x / timelineLayout.width, 0),
			1
		);
		handleTimelineNewPosition(newProgress);
	};
	const gestureSwipeTimeline = Gesture.Pan().onUpdate(
		(event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
			runOnJS(handleSwipeOnChange)(event);
		}
	);

	const combinedTimelineGesture = Gesture.Race(
		gestureTapTimeline,
		gestureSwipeTimeline
	);

	return (
		<GestureDetector gesture={combinedTimelineGesture}>
			<View
				style={[styles.vwTimeline, { width: timelineWidth }]}
				onLayout={calculateTimelineLength}
			>
				<View
					style={[
						styles.vwTimelineProgress,
						{
							width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
						},
					]}
				/>
			</View>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({
	vwTimeline: {
		height: 15,
		backgroundColor: "#170418",
		overflow: "hidden",
		position: "relative",
		borderRadius: 10,
	},
	vwTimelineProgress: {
		height: "100%",
		backgroundColor: "#8D0B90",
	},
	vwTimelineProgressCircle: {
		position: "absolute",
		top: "50%",
		width: 16,
		height: 16,
		backgroundColor: "#C3C3C3",
		borderRadius: 8,
		borderColor: "#A3A3A3",
		borderWidth: 2,
		transform: [{ translateY: -8 }, { translateX: -2.5 }],
		zIndex: 1,
	},
	vwActionMarker: {
		backgroundColor: "#838383",
		borderRadius: 5,
		width: 9,
		height: 9,
		position: "absolute",
		top: "50%",
		transform: [{ translateY: -5 }],
		zIndex: 2,
	},
});
