import { StyleSheet, Text, View, Alert, ViewStyle } from "react-native";
import ScreenFrameWithTopChildrenSmall from "../../components/screen-frames/ScreenFrameWithTopChildrenSmall";
import ModalInformationOk from "../../components/modals/ModalInformationOk";
import ModalInformationYesNoCancel from "../../components/modals/ModalInformationYesNoCancel";
import ScriptingLivePortrait from "../../components/scripting/ScriptingLivePortrait";
import ScriptingLiveLandscape from "../../components/scripting/ScriptingLiveLandscape";
import {
  Gesture,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  TapGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import * as ScreenOrientation from "expo-screen-orientation";
import { Platform } from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../types/store";
import {
  updateScriptSessionActionsArray,
  updatePlayersArray,
  Player,
  SessionAction,
  createPlayerArrayPositionProperties,
} from "../../reducers/script";
import SwipePad from "../../components/swipe-pads/SwipePad";
import { useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { runOnJS } from "react-native-reanimated";

type ScriptingLiveProps = NativeStackScreenProps<
  RootStackParamList,
  "ScriptingLive"
>;

export default function ScriptingLive({ navigation }: ScriptingLiveProps) {
  const topChildren = (
    <View>
      <Text style={styles.txtTopChildren}>Live Scripting </Text>
    </View>
  );

  const userReducer = useSelector((state: RootState) => state.user);
  const scriptReducer = useSelector((state: RootState) => state.script);
  const dispatch = useDispatch();

  const [setScores, setSetScores] = useState({
    teamAnalyzed: 0,
    teamOpponent: 0,
  });

  const [matchSetsWon, setMatchSetsWon] = useState({
    teamAnalyzed: 0,
    teamOpponent: 0,
  });

  // Dropdowns Visibility
  const [
    lastActionDropDownIsVisibleQuality,
    setLastActionDropDownIsVisibleQuality,
  ] = useState(false);
  const [
    lastActionDropDownIsVisiblePosition,
    setLastActionDropDownIsVisiblePosition,
  ] = useState(false);
  const [
    lastActionDropDownIsVisiblePlayer,
    setLastActionDropDownIsVisiblePlayer,
  ] = useState(false);
  const [lastActionDropDownIsVisibleType, setLastActionDropDownIsVisibleType] =
    useState(false);
  const [
    lastActionDropDownIsVisibleSubtype,
    setLastActionDropDownIsVisibleSubtype,
  ] = useState(false);
  const [
    scriptingPlayerDropdownIsVisible,
    setScriptingPlayerDropdownIsVisible,
  ] = useState(false);

  const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({
    title: "",
    message: "",
    variant: "info" as "info" | "success" | "error" | "warning",
  });

  const [isVisibleRallyServerModal, setIsVisibleRallyServerModal] =
    useState(false);
  const rallyServerResolverRef = useRef<
    ((value: "analyzed" | "opponent" | null) => void) | null
  >(null);

  // Set only one to true all others to false
  const setDropdownVisibility = (dropdownName: string) => {
    console.log(`setDropdownVisibility: ${dropdownName}`);
    console.log("There was no error");
    switch (dropdownName) {
      case "quality":
        setLastActionDropDownIsVisibleQuality((prev) => !prev);
        setLastActionDropDownIsVisiblePosition(false);
        setLastActionDropDownIsVisiblePlayer(false);
        setLastActionDropDownIsVisibleType(false);
        setLastActionDropDownIsVisibleSubtype(false);
        setScriptingPlayerDropdownIsVisible(false);
        break;
      case "position":
        console.log("setDropdownVisibility: position");
        setLastActionDropDownIsVisibleQuality(false);
        setLastActionDropDownIsVisiblePosition((prev) => !prev);
        setLastActionDropDownIsVisiblePlayer(false);
        setLastActionDropDownIsVisibleType(false);
        setLastActionDropDownIsVisibleSubtype(false);
        setScriptingPlayerDropdownIsVisible(false);
        break;
      case "player":
        setLastActionDropDownIsVisibleQuality(false);
        setLastActionDropDownIsVisiblePosition(false);
        setLastActionDropDownIsVisiblePlayer((prev) => !prev);
        setLastActionDropDownIsVisibleType(false);
        setLastActionDropDownIsVisibleSubtype(false);
        setScriptingPlayerDropdownIsVisible(false);
        break;
      case "type":
        setLastActionDropDownIsVisibleQuality(false);
        setLastActionDropDownIsVisiblePosition(false);
        setLastActionDropDownIsVisiblePlayer(false);
        setLastActionDropDownIsVisibleType((prev) => !prev);
        setLastActionDropDownIsVisibleSubtype(false);
        setScriptingPlayerDropdownIsVisible(false);
        break;
      case "subtype":
        setLastActionDropDownIsVisibleQuality(false);
        setLastActionDropDownIsVisiblePosition(false);
        setLastActionDropDownIsVisiblePlayer(false);
        setLastActionDropDownIsVisibleType(false);
        setLastActionDropDownIsVisibleSubtype((prev) => !prev);
        setScriptingPlayerDropdownIsVisible(false);
        break;
      case "scriptingPlayer":
        setLastActionDropDownIsVisibleQuality(false);
        setLastActionDropDownIsVisiblePosition(false);
        setLastActionDropDownIsVisiblePlayer(false);
        setLastActionDropDownIsVisibleType(false);
        setLastActionDropDownIsVisibleSubtype(false);
        setScriptingPlayerDropdownIsVisible((prev) => !prev);
        break;
      default:
        break;
    }
  };
  const [currentRallyServer, setCurrentRallyServer] = useState<
    "analyzed" | "opponent" | null
  >(null);

  // Orientation Stuff
  const [orientation, setOrientation] = useState("portrait");

  useEffect(() => {
    let sub: ScreenOrientation.Subscription | null = null;

    (async () => {
      // Allow free rotation while on this screen (choose ALL or ALL_BUT_UPSIDE_DOWN)
      await ScreenOrientation.lockAsync(
        Platform.OS === "ios"
          ? ScreenOrientation.OrientationLock.DEFAULT // iPhone default excludes upside-down
          : ScreenOrientation.OrientationLock.ALL // Android: allow all
      );

      // Set initial state once
      const initial = await ScreenOrientation.getOrientationAsync();
      setOrientation(
        initial === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          initial === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
          ? "landscape"
          : "portrait"
      );

      sub = ScreenOrientation.addOrientationChangeListener((e) => {
        const o = e.orientationInfo.orientation;
        setOrientation(
          o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
            o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
            ? "landscape"
            : "portrait"
        );
      });
    })();

    return () => {
      sub?.remove();
      // Optional safety if your exit handler always locks to PORTRAIT_UP:
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => {});
    };
  }, []); // <-- not [orientation]

  // Server status required
  const serverStatusRequiredFlag =
    scriptReducer.scriptingForPlayerObject === null &&
    currentRallyServer === null;

  const askCurrentRallyServer = (): Promise<"analyzed" | "opponent" | null> =>
    new Promise((resolve) => {
      rallyServerResolverRef.current = resolve;
      setIsVisibleRallyServerModal(true);
    });
  useEffect(() => {
    if (serverStatusRequiredFlag) {
      askCurrentRallyServer().then((choice) => {
        if (choice === null) return;
        setCurrentRallyServer(choice);
      });
    }
  }, []);

  // Replace the old askCurrentRallyServer with this:
  const alertUserOfServiceStatus = (): Promise<void> =>
    new Promise((resolve) => {
      Alert.alert(
        "Set service status",
        // "Please select:\n• “S” if your team is serving\n• “R” if your team is receiving",
        "Please select: “S” or “R” if your team is receiving",
        [{ text: "OK", onPress: () => resolve() }],
        { cancelable: true, onDismiss: () => resolve() }
      );
    });

  // Keep the name; now it only warns and blocks when unset
  const handleCurrentRallyServerNotAssigned = async (): Promise<boolean> => {
    if (currentRallyServer !== null) return true; // already chosen via S/R elsewhere
    await alertUserOfServiceStatus(); // show guidance
    return false; // block the action for now
  };

  const [padVisible, setPadVisible] = useState(false);
  const [tapIsActive, setTapIsActive] = useState(true);
  const [tapDetails, setTapDetails] = useState({
    timestamp: "no date",
    padPosCenterX: 0,
    padPosCenterY: 0,
  });
  const [padPositionCenter, setPadPositionCenter] = useState({ x: 0, y: 0 });
  const [swipeColorDict, setSwipeColorDict] = useState(
    userReducer.defaultWheelColors
  );

  const stdSwipePadDefaultTextColor = "black";
  const stdSwipePadDefaultTextFontSize = 10;
  const defaultTextStyles = Object.fromEntries(
    Array.from({ length: 16 }, (_, i) => [
      i + 1,
      {
        color: stdSwipePadDefaultTextColor,
        fontSize: stdSwipePadDefaultTextFontSize,
        selected: false,
      },
    ])
  );
  const [swipeTextStyleDict, setSwipeTextStyleDict] =
    useState(defaultTextStyles);

  const [numTrianglesMiddle, setNumTrianglesMiddle] = useState(4);
  const [numTrianglesOuter, setNumTrianglesOuter] = useState(12);

  // Gesture Stuff
  const handleTapBeginDetected = async (
    event: GestureStateChangeEvent<TapGestureHandlerEventPayload>
  ) => {
    console.log("gestureTapBegin");

    if (serverStatusRequiredFlag) {
      await handleCurrentRallyServerNotAssigned();
      return;
    }

    // Stop if match already won (best of 5 → first to 3)
    if (matchSetsWon.teamAnalyzed === 3 || matchSetsWon.teamOpponent === 3) {
      setInfoModalContent({
        title: "Reached end of game",
        message: "Please send the script.",
        variant: "info",
      });
      setIsVisibleInfoModal(true);
      return;
    }

    setSwipeColorDict(userReducer.defaultWheelColors);
    setSwipeTextStyleDict(defaultTextStyles);
    if (tapIsActive) {
      const timestamp = new Date().toISOString();
      const { x, y, absoluteX, absoluteY } = event;
      if (orientation == "portrait") {
        const xPosPortait = x - userReducer.circleRadiusOuter;
        const yPosPortait =
          y +
          scriptReducer.coordsScriptLivePortraitContainerMiddle.y! -
          userReducer.circleRadiusOuter;

        setPadPositionCenter({
          x: xPosPortait,
          y: yPosPortait,
        });
        console.log(`TapBegin - X: ${xPosPortait} - Y: ${yPosPortait}`);
        console.log(
          `scriptReducer.coordsScriptLivePortraitVwPlayerSuperSpacer.height: ${scriptReducer.coordsScriptLivePortraitVwPlayerSuperSpacer.height}`
        );
        setTapDetails({
          timestamp,
          padPosCenterX: xPosPortait,
          padPosCenterY: yPosPortait,
        });

        if (
          y > scriptReducer.coordsScriptLivePortraitVwPlayerSuperSpacer.height!
        ) {
          setPadVisible(true);
          setTapIsActive(false);
        }
      } else {
        // Landscape
        const xPosLandscape =
          x +
          scriptReducer.coordsScriptLiveLandscapeContainerLeft.width! -
          userReducer.circleRadiusOuter;
        const yPosLandscape =
          y +
          scriptReducer.coordsScriptLiveLandscapeContainerMiddleTop.height! -
          userReducer.circleRadiusOuter;
        setPadPositionCenter({
          x: xPosLandscape,
          y: yPosLandscape,
        });
        console.log(`TapBegin - X: ${xPosLandscape} - Y: ${yPosLandscape}`);
        setTapDetails({
          timestamp,
          padPosCenterX: xPosLandscape,
          padPosCenterY: yPosLandscape,
        });
        if (
          y > scriptReducer.coordsScriptLiveLandscapeVwPlayerSuper.height! &&
          y <
            scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom
              .height! -
              scriptReducer.coordsScriptLiveLandscapeVwBelowSvgVolleyballCourt
                .height!
        ) {
          setPadVisible(true);
          setTapIsActive(false);
        }
      }
    }
  };

  const gestureTapBegin = Gesture.Tap().onBegin((event) => {
    runOnJS(handleTapBeginDetected)(event);
  });
  const handleTapEndDetected = async (
    event: GestureStateChangeEvent<TapGestureHandlerEventPayload>
  ) => {
    if (serverStatusRequiredFlag) return;
    console.log("gestureTapEnd");
    setPadVisible(false);
    setTapIsActive(true);
  };

  const gestureTapEnd = Gesture.Tap()
    .maxDuration(10000) // <-- basically if user keeps hold for more than 10 seconds the wheel will just stay there.
    .onEnd((event: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => {
      runOnJS(handleTapEndDetected)(event);
    });

  const handleSwipeOnChange = (
    event: GestureUpdateEvent<PanGestureHandlerEventPayload>
  ) => {
    if (serverStatusRequiredFlag) return;
    const { x, y, translationX, translationY, absoluteX, absoluteY } = event;

    let swipePosX: number;
    let swipePosY: number;
    if (orientation === "portrait") {
      swipePosX = x - userReducer.circleRadiusOuter;
      swipePosY =
        y +
        scriptReducer.coordsScriptLivePortraitContainerMiddle.y! -
        userReducer.circleRadiusOuter;
    } else {
      // Landscape
      swipePosX =
        x +
        scriptReducer.coordsScriptLiveLandscapeContainerLeft.width! -
        userReducer.circleRadiusOuter;
      swipePosY =
        y +
        scriptReducer.coordsScriptLiveLandscapeContainerMiddleTop.height! -
        userReducer.circleRadiusOuter;
    }

    const distanceFromCenter = Math.sqrt(
      Math.pow(swipePosX - tapDetails.padPosCenterX, 2) +
        Math.pow(swipePosY - tapDetails.padPosCenterY, 2)
    );

    const relativeToPadCenterX = swipePosX - tapDetails.padPosCenterX;
    const relativeToPadCenterY = swipePosY - tapDetails.padPosCenterY;

    const inInnerCircle = distanceFromCenter < userReducer.circleRadiusInner;
    const inMiddleCircle = distanceFromCenter < userReducer.circleRadiusMiddle;

    if (inInnerCircle) {
      handleSwipeColorChange("center");
    } else {
      logicFourTwelveCircle(
        relativeToPadCenterX,
        relativeToPadCenterY,
        inMiddleCircle
      );
    }
  };
  const gestureSwipeOnChange = Gesture.Pan().onChange((event) => {
    runOnJS(handleSwipeOnChange)(event);
  });

  const lastActionTypeIndexRef = useRef<number | null>(null);
  const lastActionQualityIndexRef = useRef<number | null>(null);
  // const lastActionPositionIndexRef = useRef<number | null>(null);
  const lastActionAreaIndexRef = useRef<number | null>(null);

  // Combine swipe and tap gestures

  const handleSwipeOnEnd = (
    event: GestureUpdateEvent<PanGestureHandlerEventPayload>
  ) => {
    if (serverStatusRequiredFlag) return;
    const { x, y, translationX, translationY, absoluteX, absoluteY } = event;

    const swipePosX = x - userReducer.circleRadiusOuter;
    const swipePosY =
      y +
      scriptReducer.coordsScriptLivePortraitContainerMiddle.y! -
      userReducer.circleRadiusOuter;

    const distanceFromCenter = Math.sqrt(
      Math.pow(swipePosX - tapDetails.padPosCenterX, 2) +
        Math.pow(swipePosY - tapDetails.padPosCenterY, 2)
    );

    if (distanceFromCenter > userReducer.circleRadiusInner) {
      console.log(
        `tapDetails: ${tapDetails.padPosCenterX} - ${tapDetails.padPosCenterY}`
      );

      const tapYAdjusted =
        tapDetails.padPosCenterY + userReducer.circleRadiusOuter;
      const tapXAdjusted =
        tapDetails.padPosCenterX + userReducer.circleRadiusOuter;

      // Determine position portrait
      if (orientation == "portrait") {
        if (
          tapYAdjusted >
          scriptReducer.coordsScriptLivePortraitContainerMiddle.y! +
            scriptReducer.coordsScriptLivePortraitContainerMiddle.height! * 0.5
        ) {
          if (
            tapXAdjusted >
            scriptReducer.coordsScriptLivePortraitContainerMiddle.width! * 0.66
          ) {
            // lastActionPositionIndexRef.current = 1;
            lastActionAreaIndexRef.current = 1;
          } else if (
            tapXAdjusted >
            scriptReducer.coordsScriptLivePortraitContainerMiddle.width! * 0.33
          ) {
            // lastActionPositionIndexRef.current = 6;
            lastActionAreaIndexRef.current = 6;
          } else {
            lastActionAreaIndexRef.current = 5;
          }
        } else {
          if (
            tapXAdjusted >
            scriptReducer.coordsScriptLivePortraitContainerMiddle.width! * 0.66
          ) {
            // lastActionPositionIndexRef.current = 2;
            lastActionAreaIndexRef.current = 2;
          } else if (
            tapXAdjusted >
            scriptReducer.coordsScriptLivePortraitContainerMiddle.width! * 0.33
          ) {
            // lastActionPositionIndexRef.current = 3;
            lastActionAreaIndexRef.current = 3;
          } else {
            lastActionAreaIndexRef.current = 4;
          }
        }
      } else {
        console.log(`tapXAdjusted: ${tapXAdjusted}`);
        console.log(
          `landscape gest first 1/3: ${
            scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom
              .width! * 0.33
          }`
        );
        if (
          tapYAdjusted >
          scriptReducer.coordsScriptLiveLandscapeContainerMiddleTop.height! +
            scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom
              .height! /
              2
        ) {
          // Landscape Back Row
          if (
            tapXAdjusted >
            scriptReducer.coordsScriptLiveLandscapeContainerLeft.width! +
              scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom
                .width! *
                0.66
          ) {
            // lastActionPositionIndexRef.current = 1;
            lastActionAreaIndexRef.current = 1;
          } else if (
            tapXAdjusted >
            scriptReducer.coordsScriptLiveLandscapeContainerLeft.width! +
              scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom
                .width! *
                0.33
          ) {
            // lastActionPositionIndexRef.current = 6;
            lastActionAreaIndexRef.current = 6;
          } else {
            lastActionAreaIndexRef.current = 5;
          }
        } else {
          // Landscape Front Row
          if (
            tapXAdjusted >
            scriptReducer.coordsScriptLiveLandscapeContainerLeft.width! +
              scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom
                .width! *
                0.66
          ) {
            // lastActionPositionIndexRef.current = 2;
            lastActionAreaIndexRef.current = 2;
          } else if (
            tapXAdjusted >
            scriptReducer.coordsScriptLiveLandscapeContainerLeft.width! +
              scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom
                .width! *
                0.33
          ) {
            // lastActionPositionIndexRef.current = 3;
            lastActionAreaIndexRef.current = 3;
          } else {
            lastActionAreaIndexRef.current = 4;
          }
        }
      }
      addNewActionToScriptReducersActionsArray(
        scriptReducer.typesArray[lastActionTypeIndexRef.current!],
        scriptReducer.qualityArrayOuterCircle[
          lastActionQualityIndexRef.current!
        ]
      );
    } else {
      console.log(" no action registered on this swipe ");
    }
  };
  const gestureSwipeOnEnd = Gesture.Pan().onEnd((event) => {
    runOnJS(handleSwipeOnEnd)(event);
  });
  const combinedGestures = Gesture.Simultaneous(
    gestureTapBegin,
    gestureTapEnd,
    gestureSwipeOnChange,
    gestureSwipeOnEnd
  );

  // Swiping Functions
  const handleSwipeColorChange = (
    direction: string | number,
    outerDirection: string | number | false = false
  ) => {
    setSwipeColorDict(userReducer.defaultWheelColors);
    setSwipeTextStyleDict(defaultTextStyles);

    if (!outerDirection) {
      setSwipeColorDict((prevColors) => ({
        ...prevColors,
        [direction]:
          userReducer.selectedWheelColors[
            direction as keyof typeof userReducer.selectedWheelColors
          ],
      }));
      setSwipeTextStyleDict((prevTextStyles) => ({
        ...prevTextStyles,
        [direction]: {
          color: "black",
          fontSize: 15,
          fontWeight: "bold",
          selected: true,
        },
      }));
    } else {
      setSwipeColorDict((prevColors) => ({
        ...prevColors,
        [direction]:
          userReducer.selectedWheelColors[
            direction as keyof typeof userReducer.selectedWheelColors
          ],
        [outerDirection]:
          userReducer.selectedWheelColors[
            outerDirection as keyof typeof userReducer.selectedWheelColors
          ],
      }));
      setSwipeTextStyleDict((prevTextStyles) => ({
        ...prevTextStyles,
        [direction]: {
          color: "black",
          fontSize: 15,
          fontWeight: "bold",
          selected: true,
        },
        [outerDirection]: {
          color: "black",
          fontSize: 15,
          fontWeight: "bold",
          selected: true,
        },
      }));
    }
  };

  const logicFourTwelveCircle = (
    relativeToPadCenterX: number,
    relativeToPadCenterY: number,
    inMiddleCircle: boolean
  ) => {
    // Y dependent
    const boundary15Y = relativeToPadCenterX * Math.tan((Math.PI / 180) * 15);
    const boundary45Y = relativeToPadCenterX * Math.tan((Math.PI / 180) * 45);
    // X dependent
    const boundary75X =
      relativeToPadCenterY * (1 / Math.tan((Math.PI / 180) * 75));

    let wheelPositionMiddle = 0;
    let wheelPositionOuter = 5;

    if (Math.abs(relativeToPadCenterY) < boundary45Y) {
      // Right side
      wheelPositionMiddle = 1;
      handleSwipeColorChange(wheelPositionMiddle);
      lastActionTypeIndexRef.current = wheelPositionMiddle - 1;
      if (!inMiddleCircle) {
        wheelPositionOuter = 16;
        lastActionQualityIndexRef.current = 0;
        if (-relativeToPadCenterY > boundary15Y) {
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        } else if (Math.abs(relativeToPadCenterY) < boundary15Y) {
          wheelPositionOuter = 5;
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        } else {
          wheelPositionOuter = 6;
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        }
      }
    } else if (relativeToPadCenterY > Math.abs(boundary45Y)) {
      // Bottom
      wheelPositionMiddle = 2;
      lastActionQualityIndexRef.current = 0;
      handleSwipeColorChange(wheelPositionMiddle);
      lastActionTypeIndexRef.current = wheelPositionMiddle - 1;
      if (!inMiddleCircle) {
        wheelPositionOuter = 7;
        if (relativeToPadCenterX > boundary75X) {
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        } else if (Math.abs(relativeToPadCenterX) < boundary75X) {
          wheelPositionOuter = 8;
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        } else {
          wheelPositionOuter = 9;
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        }
      }
    } else if (relativeToPadCenterY > boundary45Y) {
      // Left
      wheelPositionMiddle = 3;
      lastActionQualityIndexRef.current = 0;
      handleSwipeColorChange(wheelPositionMiddle);
      lastActionTypeIndexRef.current = wheelPositionMiddle - 1;
      if (!inMiddleCircle) {
        wheelPositionOuter = 10;
        if (relativeToPadCenterY > Math.abs(boundary15Y)) {
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        } else if (relativeToPadCenterY > boundary15Y) {
          wheelPositionOuter = 11;
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        } else {
          wheelPositionOuter = 12;
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        }
      }
    } else if (relativeToPadCenterY < boundary45Y) {
      // Top
      wheelPositionMiddle = 4;
      lastActionQualityIndexRef.current = 0;
      handleSwipeColorChange(wheelPositionMiddle);
      lastActionTypeIndexRef.current = wheelPositionMiddle - 1;
      if (!inMiddleCircle) {
        wheelPositionOuter = 13;
        if (relativeToPadCenterX < boundary75X) {
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        } else if (relativeToPadCenterX < Math.abs(boundary75X)) {
          wheelPositionOuter = 14;
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        } else {
          wheelPositionOuter = 15;
          handleSwipeColorChange(wheelPositionMiddle, wheelPositionOuter);
          lastActionQualityIndexRef.current = wheelPositionOuter - 5;
        }
      }
    } else {
      console.log(" !! Not add action ");
      setSwipeColorDict(userReducer.defaultWheelColors);
    }
  };

  const addNewActionToScriptReducersActionsArray = (
    type: string,
    quality: string
  ) => {
    if (lastActionAreaIndexRef.current === null) {
      alert(
        "lastActionAreaIndexRef is null (addNewActionToScriptReducersActionsArray function) -- problem in ScriptingLivePortrait.tsx -> report to Nick"
      );
      return;
    }

    let playerId = null;
    if (scriptReducer.scriptingForPlayerObject !== null) {
      playerId = scriptReducer.scriptingForPlayerObject.id.toString();
    } else {
      playerId =
        scriptReducer.playerObjectPositionalArray[
          lastActionAreaIndexRef.current! - 1
        ].id.toString();
    }

    const newActionObj: SessionAction = {
      dateScripted: new Date().toISOString(),
      timestamp: Date.now(),
      type: type,
      subtype: null,
      quality: quality || "0",
      // playerId: scriptReducer.scriptingForPlayerObject!.id.toString(),
      playerId: playerId,
      scriptId: null,
      newAction: true,
      pointId: `${Date.now()}`,
      area: lastActionAreaIndexRef.current,
      // Missing properties:
      // setNumber: scriptReducer.currentSetNumber,
      setNumber: matchSetsWon.teamAnalyzed + matchSetsWon.teamOpponent + 1,
      scoreTeamAnalyzed: setScores.teamAnalyzed,
      scoreTeamOther: setScores.teamOpponent,
      currentRallyServer: currentRallyServer,
    };

    let tempArray = [...scriptReducer.sessionActionsArray, newActionObj];
    tempArray.sort((a, b) => a.timestamp - b.timestamp);
    dispatch(updateScriptSessionActionsArray(tempArray));
  };

  const sendScriptReducerSessionActionsArrayToServer = async () => {
    console.log("----> sendScriptReducerSessionActionsArrayToServer");

    const bodyObj = {
      actionsArray: scriptReducer.sessionActionsArray,
      sessionId: scriptReducer.sessionsArray.find((s) => s.selected)?.id,
      userDeviceTimestamp: new Date().toISOString(),
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/scripts/scripting-live-screen/receive-actions-array`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userReducer.token}`,
        },
        body: JSON.stringify(bodyObj),
      }
    );

    console.log("Received response:", response.status);

    let resJson = null;
    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      resJson = await response.json();
    }

    if (response.ok && resJson) {
      dispatch(updateScriptSessionActionsArray([]));
      alert(
        `${scriptReducer.sessionActionsArray.length} actions sent to server successfully`
      );
    } else {
      const errorMessage =
        resJson?.error ||
        `There was a server error (and no resJson): ${response.status}`;
      alert(errorMessage);
    }
  };

  // Last Action - Modify
  const handleModifyQuality = (quality: string) => {
    console.log(`lastActionQuality: ${quality}`);
    const lastRecordedAction =
      scriptReducer.sessionActionsArray[
        scriptReducer.sessionActionsArray.length - 1
      ];

    if (!lastRecordedAction) return;

    const updatedArray = scriptReducer.sessionActionsArray.map((action) =>
      action.timestamp === lastRecordedAction.timestamp
        ? { ...action, quality }
        : action
    );

    dispatch(updateScriptSessionActionsArray(updatedArray));
  };

  const handleModifyPosition = (position: number) => {
    console.log(`lastActionPosition: ${position}`);
    const lastRecordedAction =
      scriptReducer.sessionActionsArray[
        scriptReducer.sessionActionsArray.length - 1
      ];

    if (!lastRecordedAction) return;

    const updatedArray = scriptReducer.sessionActionsArray.map((action) =>
      action.timestamp === lastRecordedAction.timestamp
        ? { ...action, zone: position }
        : action
    );

    dispatch(updateScriptSessionActionsArray(updatedArray));
  };

  const handleModifyLastActionPlayer = (playerObj: Player) => {
    console.log(`lastActionPlayer: ${playerObj.firstName}`);
    const tempArray = scriptReducer.playersArray.map((player) => {
      if (player.id === playerObj.id) {
        return {
          ...player,
          selected: !player.selected,
        };
      }
      return { ...player, selected: false };
    });
    dispatch(updatePlayersArray(tempArray));

    console.log(`- selected player [2]: ${playerObj.firstName}`);
    const lastRecordedAction =
      scriptReducer.sessionActionsArray[
        scriptReducer.sessionActionsArray.length - 1
      ];

    if (!lastRecordedAction) return;

    const updatedArray = scriptReducer.sessionActionsArray.map((action) =>
      action.timestamp === lastRecordedAction.timestamp
        ? { ...action, playerId: playerObj.id.toString() }
        : action
    );

    dispatch(updateScriptSessionActionsArray(updatedArray));
  };

  const handleModifyType = (type: string) => {
    console.log(`lastActionType: ${type}`);
    const lastRecordedAction =
      scriptReducer.sessionActionsArray[
        scriptReducer.sessionActionsArray.length - 1
      ];

    if (!lastRecordedAction) return;

    const updatedArray = scriptReducer.sessionActionsArray.map((action) =>
      action.timestamp === lastRecordedAction.timestamp
        ? { ...action, type }
        : action
    );

    dispatch(updateScriptSessionActionsArray(updatedArray));
  };

  const handleModifySubtype = (subtype: string) => {
    console.log(`lastActionSubtype: ${subtype}`);

    const lastRecordedAction =
      scriptReducer.sessionActionsArray[
        scriptReducer.sessionActionsArray.length - 1
      ];

    if (!lastRecordedAction) return;

    const updatedArray = scriptReducer.sessionActionsArray.map((action) =>
      action.timestamp === lastRecordedAction.timestamp
        ? { ...action, subtype }
        : action
    );

    dispatch(updateScriptSessionActionsArray(updatedArray));
  };

  // Score + Set Logic (best of 5, win by 2; set 5 to 15)
  const handleSetScorePress = async (
    team: "analyzed" | "opponent",
    scoreAdjust: number
  ) => {
    if (serverStatusRequiredFlag) {
      await handleCurrentRallyServerNotAssigned();
      return;
    }
    // Compute new set scores with floor at 0
    let newAnalyzed = setScores.teamAnalyzed;
    let newOpponent = setScores.teamOpponent;

    if (team === "analyzed") {
      const next = newAnalyzed + scoreAdjust;
      if (next < 0) return;
      newAnalyzed = next;

      // --- Determine if rotation should occur ---
      // Rotate only when the opponent served and the analyzed team just scored a point (+1)
      const rotationFlag = scoreAdjust > 0 && currentRallyServer === "opponent";

      // rotate the order of scriptReducer.playerObjectPositionalArray
      const first = scriptReducer.playerObjectPositionalArray[0];
      const rest = scriptReducer.playerObjectPositionalArray.slice(1);

      if (rotationFlag && first)
        dispatch(createPlayerArrayPositionProperties([...rest, first]));
      // (optional) If you want to reflect that analyzed now serves:
      // setCurrentRallyServer("analyzed");

      // ---- END Rotation Logic ----
    } else {
      const next = newOpponent + scoreAdjust;
      if (next < 0) return;
      newOpponent = next;
    }

    // Push the score change into the last recorded action (if any)
    const lastRecordedAction =
      scriptReducer.sessionActionsArray[
        scriptReducer.sessionActionsArray.length - 1
      ];
    if (!lastRecordedAction) {
      // No actions yet: just update the local set score state and bail
      setSetScores({ teamAnalyzed: newAnalyzed, teamOpponent: newOpponent });
      return;
    }

    // Update last action's score fields
    let updatedArray = scriptReducer.sessionActionsArray.map((action) =>
      action.timestamp === lastRecordedAction.timestamp
        ? {
            ...action,
            scoreTeamAnalyzed: newAnalyzed,
            scoreTeamOther: newOpponent,
          }
        : action
    );

    // Decide current set number and its target points
    const currentSetNumber =
      matchSetsWon.teamAnalyzed + matchSetsWon.teamOpponent + 1; // 1..5
    const setTarget = currentSetNumber === 5 ? 15 : 25;

    // Only check for set end on increment (+1). Decrements simply adjust scores.
    let setJustEnded = false;
    let winner: "analyzed" | "opponent" | null = null;

    if (scoreAdjust > 0) {
      // Win-by-2 condition
      if (newAnalyzed >= setTarget && newAnalyzed - newOpponent >= 2) {
        setJustEnded = true;
        winner = "analyzed";
      } else if (newOpponent >= setTarget && newOpponent - newAnalyzed >= 2) {
        setJustEnded = true;
        winner = "opponent";
      }
    }

    if (setJustEnded) {
      // 1) Update matchSetsWon
      setMatchSetsWon((prev) => {
        const next = {
          teamAnalyzed: prev.teamAnalyzed + (winner === "analyzed" ? 1 : 0),
          teamOpponent: prev.teamOpponent + (winner === "opponent" ? 1 : 0),
        };
        return next;
      });

      // 2) Reset set scores to begin next set (if match not over)
      const winsAnalyzed =
        matchSetsWon.teamAnalyzed + (winner === "analyzed" ? 1 : 0);
      const winsOpponent =
        matchSetsWon.teamOpponent + (winner === "opponent" ? 1 : 0);
      const matchOver = winsAnalyzed === 3 || winsOpponent === 3;

      setSetScores({
        teamAnalyzed: 0,
        teamOpponent: 0,
      });

      // 3) Optionally append a "Set" action to mark the start of the next set
      if (!matchOver) {
        const nextSetNumber = currentSetNumber + 1;
        const nowIso = new Date().toISOString();

        if (lastActionAreaIndexRef.current === null) {
          alert(
            "lastActionAreaIndexRef is null -- problem in ScriptingLivePortrait.tsx -> report to Nick"
          );
          return;
        }

        const setStartAction: SessionAction = {
          dateScripted: nowIso,
          timestamp: Date.now(),
          type: "Set",
          subtype: null,
          quality: "0",
          playerId: scriptReducer.scriptingForPlayerObject!.id.toString(),
          scriptId: null,
          newAction: true,
          pointId: `${Date.now()}`,
          area: lastActionAreaIndexRef.current,
          setNumber: matchSetsWon.teamAnalyzed + matchSetsWon.teamOpponent + 1,
          scoreTeamAnalyzed: setScores.teamAnalyzed,
          scoreTeamOther: setScores.teamOpponent,
          currentRallyServer: currentRallyServer,
          // currentPointWonByTeam: team,
        };

        updatedArray = [...updatedArray, setStartAction];
      }
    } else {
      // No set end: just persist the new running scores
      setSetScores({
        teamAnalyzed: newAnalyzed,
        teamOpponent: newOpponent,
      });
    }
    setCurrentRallyServer(team);
    // Persist actions array
    dispatch(updateScriptSessionActionsArray(updatedArray));
  };

  const handleModifyFavorite = () => {
    const lastRecordedAction =
      scriptReducer.sessionActionsArray[
        scriptReducer.sessionActionsArray.length - 1
      ];

    if (!lastRecordedAction) return;
    //toggle favorite
    const updatedArray = scriptReducer.sessionActionsArray.map((action) =>
      action.timestamp === lastRecordedAction.timestamp
        ? { ...action, favorite: !action.favorite }
        : action
    );

    dispatch(updateScriptSessionActionsArray(updatedArray));
  };

  const lastActionIsFavorite = () => {
    if (scriptReducer.sessionActionsArray.length === 0) return false;
    const lastRecordedAction =
      scriptReducer.sessionActionsArray[
        scriptReducer.sessionActionsArray.length - 1
      ];
    return lastRecordedAction.favorite || false;
  };

  // Set Circle (score)
  const handleSetCirclePress = (
    team: "analyzed" | "opponent",
    setIndex: number
  ) => {
    if (team === "analyzed") {
      if (matchSetsWon.teamAnalyzed === setIndex) {
        setMatchSetsWon({
          teamAnalyzed: setIndex - 1,
          teamOpponent: matchSetsWon.teamOpponent,
        });
      } else if (matchSetsWon.teamAnalyzed + 1 === setIndex) {
        setMatchSetsWon({
          teamAnalyzed: setIndex,
          teamOpponent: matchSetsWon.teamOpponent,
        });
      }
    } else {
      if (matchSetsWon.teamOpponent === setIndex) {
        setMatchSetsWon({
          teamAnalyzed: matchSetsWon.teamAnalyzed,
          teamOpponent: setIndex - 1,
        });
      } else if (matchSetsWon.teamOpponent + 1 === setIndex) {
        setMatchSetsWon({
          teamAnalyzed: matchSetsWon.teamAnalyzed,
          teamOpponent: setIndex,
        });
      }
    }
  };

  const styleVwMainPosition: ViewStyle = {
    position: "absolute",
    left: padPositionCenter.x,
    top: padPositionCenter.y,
    zIndex: 2,
  };

  // Determine which component to render
  const renderSwipePad = () => {
    if (padVisible) {
      return (
        <SwipePad
          styleVwMainPosition={styleVwMainPosition}
          swipeColorDict={swipeColorDict}
          numTrianglesMiddle={numTrianglesMiddle}
          numTrianglesOuter={numTrianglesOuter}
        />
      );
    }
  };

  const subtypesArrayForLastAction = useMemo(() => {
    const lastActionType = scriptReducer.sessionActionsArray.at(-1)?.type;
    if (!lastActionType) return [];
    return scriptReducer.subtypesByType[lastActionType] ?? [];
  }, [scriptReducer.sessionActionsArray, scriptReducer.subtypesByType]);

  const getSubtypeForLastAction = useCallback(() => {
    const last = scriptReducer.sessionActionsArray.at(-1);
    if (!last) return "?";
    const v = last.subtype ?? null;
    return typeof v === "string" && v.length > 0 ? v.slice(0, 4) : "?";
  }, [scriptReducer.sessionActionsArray]);

  // Put this helper near your other functions in ScriptingLive.js
  const confirmAsync = (title: string, message: string): Promise<boolean> =>
    new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: "OK", onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) }
      );
    });

  const handleExitScriptingLive = async (): Promise<boolean> => {
    const scriptSessionActionsArrayIsEmpty =
      scriptReducer.sessionActionsArray.length === 0;
    if (scriptSessionActionsArrayIsEmpty) {
      return true;
    }
    const confirmed = await confirmAsync(
      "Confirm Exit",
      "Are you sure you want to exit Scripting Live?"
    );
    if (confirmed) {
      // clear any local state you want before leaving
      dispatch(updateScriptSessionActionsArray([]));

      if (orientation == "landscape") {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        setOrientation("portrait");
      }
    }
    return confirmed;
  };

  // ---- Court Lines Visibility ----
  const [isVisibleCourtLines, setIsVisibleCourtLines] = useState(true);

  const whichModalToDisplay = () => {
    if (isVisibleRallyServerModal) {
      return {
        modalComponent: (
          <ModalInformationYesNoCancel
            title="Which team is serving?"
            message=""
            yesButtonText="Analyzed"
            noButtonText="Opponent"
            cancelButtonText="Cancel"
            onYes={() => {
              if (rallyServerResolverRef.current) {
                rallyServerResolverRef.current("analyzed");
              }
              setIsVisibleRallyServerModal(false);
            }}
            onNo={() => {
              if (rallyServerResolverRef.current) {
                rallyServerResolverRef.current("opponent");
              }
              setIsVisibleRallyServerModal(false);
            }}
            onCancel={() => {
              if (rallyServerResolverRef.current) {
                rallyServerResolverRef.current(null);
              }
              setIsVisibleRallyServerModal(false);
              navigation.goBack();
            }}
            onClose={() => {
              if (rallyServerResolverRef.current) {
                rallyServerResolverRef.current(null);
              }
              setIsVisibleRallyServerModal(false);
            }}
          />
        ),
        useState: isVisibleRallyServerModal,
        useStateSetter: () => {
          if (rallyServerResolverRef.current) {
            rallyServerResolverRef.current(null);
          }
          setIsVisibleRallyServerModal(false);
        },
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

  return orientation == "portrait" ? (
    <ScreenFrameWithTopChildrenSmall
      navigation={navigation}
      topChildren={topChildren}
      topHeight="10%"
      onBackPress={handleExitScriptingLive}
      modalComponentAndSetterObject={whichModalToDisplay()}
    >
      <ScriptingLivePortrait
        combinedGestures={combinedGestures}
        orientation={orientation}
        setScores={setScores}
        matchSetsWon={matchSetsWon}
        handleSetCirclePress={handleSetCirclePress}
        handleSetScorePress={handleSetScorePress}
        handleModifyQuality={handleModifyQuality}
        handleModifyPosition={handleModifyPosition}
        handleModifyLastActionPlayer={handleModifyLastActionPlayer}
        handleModifyType={handleModifyType}
        handleModifySubtype={handleModifySubtype}
        handleModifyFavorite={handleModifyFavorite}
        lastActionDropDownIsVisibleQuality={lastActionDropDownIsVisibleQuality}
        setLastActionDropDownIsVisibleQuality={
          setLastActionDropDownIsVisibleQuality
        }
        lastActionDropDownIsVisiblePosition={
          lastActionDropDownIsVisiblePosition
        }
        setLastActionDropDownIsVisiblePosition={
          setLastActionDropDownIsVisiblePosition
        }
        lastActionDropDownIsVisiblePlayer={lastActionDropDownIsVisiblePlayer}
        setLastActionDropDownIsVisiblePlayer={
          setLastActionDropDownIsVisiblePlayer
        }
        lastActionDropDownIsVisibleType={lastActionDropDownIsVisibleType}
        setLastActionDropDownIsVisibleType={setLastActionDropDownIsVisibleType}
        lastActionDropDownIsVisibleSubtype={lastActionDropDownIsVisibleSubtype}
        setLastActionDropDownIsVisibleSubtype={
          setLastActionDropDownIsVisibleSubtype
        }
        scriptingPlayerDropdownIsVisible={scriptingPlayerDropdownIsVisible}
        setDropdownVisibility={setDropdownVisibility}
        subtypesArrayForLastAction={subtypesArrayForLastAction}
        getSubtypeForLastAction={getSubtypeForLastAction}
        sendScriptReducerSessionActionsArrayToServer={
          sendScriptReducerSessionActionsArrayToServer
        }
        lastActionIsFavorite={lastActionIsFavorite()}
        setCurrentRallyServer={setCurrentRallyServer}
        currentRallyServer={currentRallyServer}
        isVisibleCourtLines={isVisibleCourtLines}
        setIsVisibleCourtLines={setIsVisibleCourtLines}
      />
      {renderSwipePad()}
    </ScreenFrameWithTopChildrenSmall>
  ) : (
    <View style={{ flex: 1 }}>
      <ScriptingLiveLandscape
        renderSwipePad={renderSwipePad}
        navigation={navigation}
        combinedGestures={combinedGestures}
        orientation={orientation}
        setOrientation={setOrientation}
        handleExitScriptingLive={handleExitScriptingLive}
        setScores={setScores}
        matchSetsWon={matchSetsWon}
        handleSetCirclePress={handleSetCirclePress}
        handleSetScorePress={handleSetScorePress}
        handleModifyQuality={handleModifyQuality}
        handleModifyPosition={handleModifyPosition}
        handleModifyLastActionPlayer={handleModifyLastActionPlayer}
        handleModifyType={handleModifyType}
        handleModifySubtype={handleModifySubtype}
        handleModifyFavorite={handleModifyFavorite}
        lastActionDropDownIsVisibleQuality={lastActionDropDownIsVisibleQuality}
        lastActionDropDownIsVisiblePosition={
          lastActionDropDownIsVisiblePosition
        }
        lastActionDropDownIsVisiblePlayer={lastActionDropDownIsVisiblePlayer}
        lastActionDropDownIsVisibleType={lastActionDropDownIsVisibleType}
        lastActionDropDownIsVisibleSubtype={lastActionDropDownIsVisibleSubtype}
        scriptingPlayerDropdownIsVisible={scriptingPlayerDropdownIsVisible}
        setDropdownVisibility={setDropdownVisibility}
        subtypesArrayForLastAction={subtypesArrayForLastAction}
        getSubtypeForLastAction={getSubtypeForLastAction}
        sendScriptReducerSessionActionsArrayToServer={
          sendScriptReducerSessionActionsArrayToServer
        }
        lastActionIsFavorite={lastActionIsFavorite()}
        setCurrentRallyServer={setCurrentRallyServer}
        currentRallyServer={currentRallyServer}
        isVisibleCourtLines={isVisibleCourtLines}
        setIsVisibleCourtLines={setIsVisibleCourtLines}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  txtTopChildren: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
