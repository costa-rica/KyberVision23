import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Polygon, Svg, Circle } from "react-native-svg";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../types/store";
import { WheelColors } from "../../reducers/user";

interface TextPosition {
  top: number;
  left: number;
  selected: boolean;
}

interface SwipePadProps {
  numTrianglesOuter: number;
  numTrianglesMiddle: number;
  swipeColorDict: WheelColors;
  styleVwMainPosition: ViewStyle;
}

export default function SwipePad(props: SwipePadProps) {
  const userReducer = useSelector((state: RootState) => state.user);
  const scriptReducer = useSelector((state: RootState) => state.script);

  const numTrianglesOuter = props.numTrianglesOuter;
  const extensionFactor = 1.5;

  const trianglesMiddle = Array.from({ length: props.numTrianglesMiddle }).map(
    (_, index) => {
      const cx = userReducer.circleRadiusMiddle;
      const cy = userReducer.circleRadiusMiddle;

      const angle = (index * 360) / props.numTrianglesMiddle;
      const rad = (Math.PI / 180) * angle;

      const base1X =
        cx + userReducer.circleRadiusMiddle * extensionFactor * Math.cos(rad);
      const base1Y =
        cy + userReducer.circleRadiusMiddle * extensionFactor * Math.sin(rad);

      const base2X =
        cx +
        userReducer.circleRadiusMiddle *
          extensionFactor *
          Math.cos(rad + Math.PI / (props.numTrianglesMiddle / 2));
      const base2Y =
        cy +
        userReducer.circleRadiusMiddle *
          extensionFactor *
          Math.sin(rad + Math.PI / (props.numTrianglesMiddle / 2));

      const apexX = cx;
      const apexY = cy;

      return `${apexX},${apexY} ${base1X},${base1Y} ${base2X},${base2Y}`;
    }
  );

  const trianglesOuter = Array.from({ length: numTrianglesOuter }).map(
    (_, index) => {
      const cx = userReducer.circleRadiusOuter;
      const cy = userReducer.circleRadiusOuter;
      const angle = (index * 360) / numTrianglesOuter;
      const rad = (Math.PI / 180) * angle;

      const base1X =
        cx + userReducer.circleRadiusOuter * extensionFactor * Math.cos(rad);
      const base1Y =
        cy + userReducer.circleRadiusOuter * extensionFactor * Math.sin(rad);

      const base2X =
        cx +
        userReducer.circleRadiusOuter *
          extensionFactor *
          Math.cos(rad + Math.PI / (numTrianglesOuter / 2));
      const base2Y =
        cy +
        userReducer.circleRadiusOuter *
          extensionFactor *
          Math.sin(rad + Math.PI / (numTrianglesOuter / 2));

      const apexX = cx;
      const apexY = cy;

      return `${apexX},${apexY} ${base1X},${base1Y} ${base2X},${base2Y}`;
    }
  );

  const [rotateOuter, setRotateOuter] = useState(false);
  const [rotateMiddle, setRotateMiddle] = useState(false);

  useEffect(() => {
    if (props.numTrianglesMiddle === 5) {
      setRotateOuter(true);
      setRotateMiddle(false);
    } else if (
      props.numTrianglesMiddle === 4 &&
      props.numTrianglesOuter === 12
    ) {
      setRotateOuter(true);
      setRotateMiddle(true);
    } else {
      setRotateOuter(false);
      setRotateMiddle(false);
    }
  }, [props.numTrianglesMiddle, props.numTrianglesOuter]);

  const styleVwOuterSizeAndRotation: ViewStyle = {
    width: userReducer.circleRadiusOuter * 2,
    height: userReducer.circleRadiusOuter * 2,
    borderRadius: userReducer.circleRadiusOuter,
    overflow: "hidden",
    transform: [{ rotate: rotateOuter ? "-15deg" : "0deg" }],
  };

  const styleVwMiddleCircle: ViewStyle = {
    position: "absolute",
    width: userReducer.circleRadiusMiddle * 2,
    height: userReducer.circleRadiusMiddle * 2,
    top: userReducer.circleRadiusOuter - userReducer.circleRadiusMiddle,
    left: userReducer.circleRadiusOuter - userReducer.circleRadiusMiddle,
    borderRadius: userReducer.circleRadiusMiddle,
    overflow: "hidden",
    transform: [{ rotate: rotateMiddle ? "-30deg" : "0deg" }],
  };

  const styleCircleInner: ViewStyle = {
    position: "absolute",
    top: userReducer.circleRadiusMiddle - userReducer.circleRadiusInner,
    left: userReducer.circleRadiusMiddle - userReducer.circleRadiusInner,
    height: userReducer.circleRadiusInner * 2,
    width: userReducer.circleRadiusInner * 2,
  };

  const estimatedWidthOfTextMiddle = 35;
  const estimatedHeightOfTextMiddle = 20;
  const estimatedWidthOfTextOuter = 10;
  const estimatedHeightOfTextOuter = 10;

  const dictTextPositionsMiddle: Record<number, TextPosition> = {
    1: {
      top: userReducer.circleRadiusOuter - estimatedHeightOfTextMiddle / 2,
      left: userReducer.circleRadiusOuter + userReducer.circleRadiusInner,
      selected: true,
    },
    2: {
      top: userReducer.circleRadiusOuter + userReducer.circleRadiusInner,
      left: userReducer.circleRadiusOuter - estimatedWidthOfTextMiddle / 2,
      selected: true,
    },
    3: {
      top: userReducer.circleRadiusOuter - estimatedHeightOfTextMiddle / 2,
      left:
        userReducer.circleRadiusOuter -
        userReducer.circleRadiusInner -
        estimatedWidthOfTextMiddle,
      selected: true,
    },
    4: {
      top:
        userReducer.circleRadiusOuter -
        userReducer.circleRadiusInner -
        estimatedHeightOfTextMiddle,
      left: userReducer.circleRadiusOuter - estimatedWidthOfTextMiddle / 2,
      selected: true,
    },
  };

  const dictTextPositionsOuterPlaceholder: Record<number, TextPosition> = Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [i + 5, { top: 0, left: 0, selected: false }])
  );

  const dictTextPositionsOuter: Record<number, TextPosition> = {
    ...dictTextPositionsOuterPlaceholder,
    5: {
      top: userReducer.circleRadiusOuter - estimatedHeightOfTextOuter,
      left: userReducer.circleRadiusOuter * 2 - estimatedWidthOfTextOuter * 1.5,
      selected: true,
    },
    6: {
      top: userReducer.circleRadiusOuter * 1.3,
      left: userReducer.circleRadiusOuter * 2 - estimatedWidthOfTextOuter * 2,
      selected: true,
    },
    7: {
      top: userReducer.circleRadiusOuter * 2 - estimatedHeightOfTextOuter * 2.5,
      left: userReducer.circleRadiusOuter * 1.4,
      selected: true,
    },
    8: {
      top: userReducer.circleRadiusOuter * 1.75,
      left: userReducer.circleRadiusOuter - estimatedWidthOfTextOuter * 0.75,
      selected: true,
    },
    9: {
      top: userReducer.circleRadiusOuter * 2 - estimatedHeightOfTextOuter * 2.8,
      left: userReducer.circleRadiusOuter * 0.5,
      selected: true,
    },
    10: {
      top: userReducer.circleRadiusOuter * 1.3,
      left: estimatedWidthOfTextOuter * 1.5,
      selected: true,
    },
    11: {
      top: userReducer.circleRadiusOuter - estimatedHeightOfTextOuter,
      left: estimatedWidthOfTextOuter * 0.5,
      selected: true,
    },
    12: {
      top: userReducer.circleRadiusOuter * 0.4,
      left: estimatedWidthOfTextOuter * 1.3,
      selected: true,
    },
    13: {
      top: estimatedHeightOfTextOuter * 0.5,
      left: userReducer.circleRadiusOuter * 0.5,
      selected: true,
    },
    14: {
      top: estimatedHeightOfTextOuter * 0.2,
      left: userReducer.circleRadiusOuter - estimatedWidthOfTextOuter * 0.6,
      selected: true,
    },
    15: {
      top: estimatedHeightOfTextOuter * 0.5,
      left: userReducer.circleRadiusOuter * 1.35,
      selected: true,
    },
    16: {
      top: userReducer.circleRadiusOuter * 0.4,
      left: userReducer.circleRadiusOuter * 2 - estimatedWidthOfTextOuter * 2.5,
      selected: true,
    },
  };

  return (
    <View style={props.styleVwMainPosition}>
      <View style={styleVwOuterSizeAndRotation}>
        <Svg
          height={userReducer.circleRadiusOuter * 2}
          width={userReducer.circleRadiusOuter * 2}
        >
          {trianglesOuter.map((points, index) => (
            <Polygon
              key={index}
              points={points}
              fill={props.swipeColorDict[
                (1 + props.numTrianglesMiddle + index) as keyof WheelColors
              ]}
            />
          ))}
        </Svg>
        <View style={styleVwMiddleCircle}>
          <Svg
            height={userReducer.circleRadiusMiddle * 2}
            width={userReducer.circleRadiusMiddle * 2}
          >
            {trianglesMiddle.map((points, index) => (
              <View
                key={index}
                style={{
                  width: userReducer.circleRadiusMiddle + 5,
                  height: userReducer.circleRadiusMiddle + 5,
                }}
              >
                <Polygon
                  key={index}
                  points={points}
                  fill={props.swipeColorDict[(index + 1) as keyof WheelColors]}
                />
              </View>
            ))}
          </Svg>
          <Svg
            height={userReducer.circleRadiusInner * 2}
            width={userReducer.circleRadiusInner * 2}
            style={styleCircleInner}
          >
            <Circle
              cx={userReducer.circleRadiusInner}
              cy={userReducer.circleRadiusInner}
              r={userReducer.circleRadiusInner}
              fill={props.swipeColorDict["center"]}
            />
          </Svg>
        </View>
      </View>
      {Array.from({ length: 4 }, (_, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            top: dictTextPositionsMiddle[index + 1].top,
            left: dictTextPositionsMiddle[index + 1].left,
            justifyContent: "center",
            alignItems: "center",
            width: estimatedWidthOfTextMiddle,
          }}
        >
          <Text
            key={index}
            style={{
              color: userReducer.swipePadTextStyleMiddleCircle[index + 1].color,
              fontSize:
                userReducer.swipePadTextStyleMiddleCircle[index + 1].fontSize,
              fontWeight:
                userReducer.swipePadTextStyleMiddleCircle[index + 1].fontWeight as TextStyle["fontWeight"],
            }}
          >
            {dictTextPositionsMiddle[index + 1].selected
              ? scriptReducer.typesArray[index]
              : null}
          </Text>
        </View>
      ))}
      {Array.from({ length: 12 }, (_, index) => (
        <View
          key={index + 4}
          style={{
            position: "absolute",
            top: dictTextPositionsOuter[index + 5].top,
            left: dictTextPositionsOuter[index + 5].left,
          }}
        >
          <Text
            key={index}
            style={{
              color: userReducer.swipePadTextStyleOuterCircle[index + 1].color,
              fontSize:
                userReducer.swipePadTextStyleOuterCircle[index + 1].fontSize,
              fontWeight:
                userReducer.swipePadTextStyleOuterCircle[index + 1].fontWeight as TextStyle["fontWeight"],
            }}
          >
            {dictTextPositionsOuter[index + 5].selected
              ? scriptReducer.qualityArrayOuterCircle[index]
              : null}
          </Text>
        </View>
      ))}
    </View>
  );
}