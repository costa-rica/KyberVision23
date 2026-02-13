import React from "react";
import {
	View,
	TouchableOpacity,
	Text,
	StyleSheet,
} from "react-native";

interface SwitchKvWhiteProps {
	state: boolean;
	onPressCustom: () => void;
}

export default function SwitchKvWhite({
	state,
	onPressCustom,
}: SwitchKvWhiteProps) {
	return (
		<TouchableOpacity
			style={[styles.switch]}
			onPress={onPressCustom}
		>
			{/* "Y" on the left */}
			<Text style={[styles.trackText, { right: 10 }]}>Y</Text>

			{/* "N" on the right */}
			<Text style={[styles.trackText, { left: 10 }]}>No</Text>

			{/* Thumb */}
			<View
				style={[
					styles.thumb,
					{
						left: state ? 2 : 32,
					},
				]}
			>
				<Text style={styles.thumbText}>{state ? "N" : "Y"}</Text>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	switch: {
		width: 60,
		height: 30,
		borderRadius: 15,
		padding: 2,
		justifyContent: "center",
		position: "relative",
		borderColor: "white",
		backgroundColor: "rgba(74,74,74,.74)",
		borderWidth: 1,
	},
	thumb: {
		backgroundColor: "white",
		width: 22,
		height: 22,
		borderRadius: 11,
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
		margin: 3,
	},
	thumbText: {
		fontSize: 14,
		fontWeight: "bold",
		color: "white",
		fontFamily: "ApfelGrotezk",
	},
	trackText: {
		position: "absolute",
		fontSize: 14,
		fontWeight: "bold",
		color: "rgba(200,200,200,.7)",
	},
});