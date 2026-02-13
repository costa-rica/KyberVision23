import React, { useRef, useState, ReactNode } from "react";
import { Animated, Pressable, ViewStyle, TextStyle } from "react-native";

interface ButtonKvNoDefaultProps {
	onPress?: () => void;
	styleView: ViewStyle;
	styleText?: TextStyle;
	pressInColor?: string;
	children: ReactNode;
	active?: boolean;
}

export default function ButtonKvNoDefault({
	onPress,
	styleView,
	styleText,
	pressInColor = "gray",
	children,
	active = true,
}: ButtonKvNoDefaultProps) {
	const scaleValue = useRef(new Animated.Value(1)).current;

	const [currentBackgroundColor, setCurrentBackgroundColor] = useState<string>(
		(styleView.backgroundColor as string) || "transparent"
	);

	const handlePressIn = () => {
		if (!active) return;
		setCurrentBackgroundColor(pressInColor);
		Animated.spring(scaleValue, {
			toValue: 0.7,
			useNativeDriver: true,
		}).start();
	};

	const handlePressOut = () => {
		if (!active) return;
		setCurrentBackgroundColor((styleView.backgroundColor as string) || "transparent");
		Animated.spring(scaleValue, {
			toValue: 1,
			friction: 3,
			tension: 40,
			useNativeDriver: true,
		}).start();

		if (onPress) {
			onPress();
		}
	};

	const dynamicStyleView: ViewStyle = {
		...styleView,
		backgroundColor: active ? currentBackgroundColor : (styleView.backgroundColor || "transparent"),
		opacity: active ? 1 : 0.6,
	};

	return (
		<Animated.View style={{ transform: [{ scale: scaleValue }] }}>
			<Pressable
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				style={dynamicStyleView}
				disabled={!active}
			>
				{children}
			</Pressable>
		</Animated.View>
	);
}