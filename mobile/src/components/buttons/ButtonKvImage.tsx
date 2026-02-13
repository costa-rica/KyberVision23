// src/components/buttons/ButtonKvImage.tsx
import React, { useRef, useState } from "react";
import {
	Animated,
	Pressable,
	type StyleProp,
	type ViewStyle,
} from "react-native";

type ButtonKvImageProps = {
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
	children?: React.ReactNode;
	disabled?: boolean;
};

const ButtonKvImage: React.FC<ButtonKvImageProps> = ({
	onPress,
	style,
	children,
	disabled,
}) => {
	const scaleValue = useRef(new Animated.Value(1)).current;
	const [currentBg, setCurrentBg] = useState<string>("transparent");

	const defaultStyles: ViewStyle = {
		backgroundColor: currentBg,
		padding: 5,
		borderRadius: 35,
		justifyContent: "center",
		alignItems: "center",
	};

	// React Native accepts array styles; this preserves incoming overrides
	const mergedStyle: StyleProp<ViewStyle> = [defaultStyles, style];

	const handlePressIn = () => {
		setCurrentBg("gray");
		Animated.spring(scaleValue, {
			toValue: 0.7,
			useNativeDriver: true,
		}).start();
	};

	const handlePressOut = () => {
		setCurrentBg("transparent");
		Animated.spring(scaleValue, {
			toValue: 1,
			friction: 3,
			tension: 40,
			useNativeDriver: true,
		}).start();

		onPress?.();
	};

	return (
		<Animated.View style={{ transform: [{ scale: scaleValue }] }}>
			<Pressable
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				style={mergedStyle}
			>
				{children}
			</Pressable>
		</Animated.View>
	);
};

export default ButtonKvImage;
