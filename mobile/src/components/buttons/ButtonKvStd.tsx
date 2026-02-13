import React, { useRef, useState, ReactNode } from "react";
import { Animated, Pressable, Text, ViewStyle, TextStyle } from "react-native";

interface ButtonKvStdProps {
  onPress?: () => void;
  style?: ViewStyle & TextStyle;
  children: ReactNode;
  title?: string;
  disabled?: boolean;
}

export default function ButtonKvStd({ 
  onPress, 
  style, 
  children, 
  title, 
  disabled = false 
}: ButtonKvStdProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Define default styles
  const defaultStyles: ViewStyle & TextStyle = {
    width: 140,
    height: 40,
    borderRadius: 35,
    backgroundColor: "#A3A3A3",
    fontSize: 20,
    color: "white",
    fontWeight: "normal",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  };

  // Merge provided style with default styles
  const mergedStyle = { ...defaultStyles, ...style };
  
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState<string>(
    mergedStyle.backgroundColor as string
  );

  const handlePressIn = () => {
    if (disabled) return;
    setCurrentBackgroundColor("gray"); // Change color on press
    Animated.spring(scaleValue, {
      toValue: 0.7,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    setCurrentBackgroundColor(mergedStyle.backgroundColor as string); // Revert color when press is released
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Call the onPress function passed as a prop
    if (onPress) {
      onPress();
    }
  };

  const styleView: ViewStyle = {
    backgroundColor: disabled ? "#CCCCCC" : currentBackgroundColor,
    padding: mergedStyle.padding,
    borderRadius: mergedStyle.borderRadius,
    width: mergedStyle.width,
    height: mergedStyle.height,
    justifyContent: mergedStyle.justifyContent,
    alignItems: mergedStyle.alignItems,
    opacity: disabled ? 0.6 : (mergedStyle.opacity || 1),
    borderColor: mergedStyle.borderColor,
    borderWidth: mergedStyle.borderWidth,
    borderStyle: mergedStyle.borderStyle,
  };

  const styleText: TextStyle = {
    fontSize: mergedStyle.fontSize,
    color: disabled ? "#888888" : mergedStyle.color,
    textAlign: "center",
    fontWeight: mergedStyle.fontWeight,
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styleView}
        disabled={disabled}
      >
        <Text style={styleText}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}