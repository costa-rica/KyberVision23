import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from "react-native";
import {
  // GestureHandlerRootView,
  GestureDetector,
} from "react-native-gesture-handler";
import ScreenFrameWithTopChildrenSmallLandscape from "../screen-frames/ScreenFrameWithTopChildrenSmallLandscape";
import * as ScreenOrientation from "expo-screen-orientation";
import Lightning from "../../assets/images/scripting/lightning.svg";
import Volleyball from "../../assets/images/welcome/Tribe.svg";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../types/store";
import ButtonKvImage from "../buttons/ButtonKvImage";
import BtnService from "../../assets/images/scripting/btnService.svg";
import BtnReception from "../../assets/images/scripting/btnReception.svg";
import SvgVolleyballCourt from "../../assets/images/scripting/volleyballCourt.svg";
import ButtonKvStd from "../buttons/ButtonKvStd";
import BtnWin from "../../assets/images/scripting/btnWin.svg";
import BtnLose from "../../assets/images/scripting/btnLose.svg";
import {
  updateCoordsScriptLiveLandscapeContainerLeft,
  updateCoordsScriptLiveLandscapeContainerMiddleTop,
  updateCoordsScriptLiveLandscapeContainerMiddleBottom,
  updateCoordsScriptLiveLandscapeVwPlayerSuper,
  updateCoordsScriptLiveLandscapeVwBelowSvgVolleyballCourt,
  updatePlayersArray,
  setScriptingForPlayerObject,
  Player,
} from "../../reducers/script";
import BtnFavorite from "../../assets/images/scripting/btnFavorite.svg";
import ButtonKvNoDefault from "../buttons/ButtonKvNoDefault";

interface ScriptingLiveLandscapeProps {
  renderSwipePad: () => React.ReactElement | undefined;
  navigation: any;
  combinedGestures: any;
  orientation: string;
  setOrientation: (orientation: string) => void;
  handleExitScriptingLive: () => Promise<boolean>;
  setScores: {
    teamAnalyzed: number;
    teamOpponent: number;
  };
  matchSetsWon: {
    teamAnalyzed: number;
    teamOpponent: number;
  };
  handleSetCirclePress: (
    team: "analyzed" | "opponent",
    setIndex: number
  ) => void;
  handleSetScorePress: (
    team: "analyzed" | "opponent",
    scoreAdjust: number
  ) => void;
  handleModifyQuality: (quality: string) => void;
  handleModifyPosition: (position: number) => void;
  handleModifyLastActionPlayer: (playerObj: Player) => void;
  handleModifyType: (type: string) => void;
  handleModifySubtype: (subtype: string) => void;
  handleModifyFavorite: () => void;
  lastActionDropDownIsVisibleQuality: boolean;
  lastActionDropDownIsVisiblePosition: boolean;
  lastActionDropDownIsVisiblePlayer: boolean;
  lastActionDropDownIsVisibleType: boolean;
  lastActionDropDownIsVisibleSubtype: boolean;
  scriptingPlayerDropdownIsVisible: boolean;
  setDropdownVisibility: (dropdownName: string) => void;
  subtypesArrayForLastAction: readonly string[];
  getSubtypeForLastAction: () => string;
  sendScriptReducerSessionActionsArrayToServer: () => Promise<void>;
  lastActionIsFavorite: boolean;
  setCurrentRallyServer: (server: "analyzed" | "opponent" | null) => void;
  currentRallyServer: "analyzed" | "opponent" | null;
  isVisibleCourtLines: boolean;
  setIsVisibleCourtLines: (isVisible: boolean) => void;
}

export default function ScriptingLiveLandscape(
  props: ScriptingLiveLandscapeProps
) {
  const teamReducer = useSelector((state: RootState) => state.team);
  const scriptReducer = useSelector((state: RootState) => state.script);
  const dispatch = useDispatch();

  const topChildren = (
    <View style={styles.vwTopChildren}>
      <View style={styles.vwTopChildrenLeft}>
        <Volleyball />
        <Text style={styles.txtTopChildren}>
          {teamReducer.teamsArray.find((tribe) => tribe.selected)?.teamName}
        </Text>
      </View>
      <Lightning />
      <Text style={styles.txtTopChildren}>Opponent</Text>
    </View>
  );

  const CIRCLE_SIZE = Dimensions.get("window").width * 0.1;
  const DIAGONAL_LEN = Math.ceil(CIRCLE_SIZE * Math.SQRT2);
  const LINE_THICKNESS = 8;

  const stylesBtnTop: ViewStyle = {
    width: Dimensions.get("window").width * 0.1,
    height: Dimensions.get("window").width * 0.1,
  };

  const stylesBtnBottom: ViewStyle = {
    width: Dimensions.get("window").width * 0.1,
    height: Dimensions.get("window").width * 0.1,
  };

  const stylesVwGroupButtons: ViewStyle = {
    justifyContent: "center",
    alignItems: "center",
  };

  const stylesVwGroupButtonsCircle: ViewStyle = {
    borderRadius: (Dimensions.get("window").width * 0.1) / 2,
    backgroundColor: "#806181",
    opacity: 0.25,
    width: Dimensions.get("window").width * 0.1,
    height: Dimensions.get("window").width * 0.1,
  };

  const stylesVwGroupButtonsDiagonalLine: ViewStyle = {
    width: DIAGONAL_LEN,
    height: LINE_THICKNESS,
    borderRadius: LINE_THICKNESS / 2,
    backgroundColor: "#806181",
    opacity: 0.8,
    transform: [{ rotate: "-45deg" }],
  };

  const stylesBtnKvImageTopRight: ViewStyle = {
    marginTop: -CIRCLE_SIZE / 2,
    marginLeft: CIRCLE_SIZE / 2,
  };

  const stylesBtnKvImageBottomLeft: ViewStyle = {
    marginBottom: -CIRCLE_SIZE / 2,
    marginRight: CIRCLE_SIZE / 2,
  };

  const stylesVwRowButtonsAdjustScore: ViewStyle = {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: CIRCLE_SIZE / 2.5,
  };

  const stylesVwRowScore: ViewStyle = {
    backgroundColor: "#806181",
    borderRadius: 20,
    flexDirection: "row",
    width: CIRCLE_SIZE * 1.5,
    justifyContent: "center",
    alignItems: "center",
    gap: CIRCLE_SIZE / 4,
  };

  const stylesVwPlayer: ViewStyle = {
    borderWidth: 1,
    borderColor: "#6E4C84",
    borderRadius: 30,
    backgroundColor: "white",
    flexDirection: "row",
    gap: 10,
    padding: 5,
    width: CIRCLE_SIZE * 2,
  };

  const stylesVwButtonFavorite: ViewStyle = {
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "white",
    marginTop:
      -35 -
      scriptReducer.coordsScriptLiveLandscapeVwBelowSvgVolleyballCourt.height!,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    zIndex: 1,
  };

  const stylesBtnFavorite: ViewStyle = {
    width: CIRCLE_SIZE * 0.75,
    height: CIRCLE_SIZE * 0.75,
  };

  const stylesVwPlayerSuperNoHeight: ViewStyle = {
    width: "100%",
    alignItems: "center",
  };

  const stylesVwPlayerSuperSpacer: ViewStyle = {
    width: "100%",
    height: CIRCLE_SIZE / 2,
    backgroundColor: "#F0EAF9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  };

  const stylesVwPlayerSuperSpacerFavorited: ViewStyle = {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#806181",
  };

  const stylesVwPlayerAbsolutePosition: ViewStyle = {
    position: "absolute",
    top: CIRCLE_SIZE / 10,
    zIndex: 1,
  };

  const stylesDropDownScriptingPlayer: ViewStyle = {
    position: "absolute",
    top:
      scriptReducer.coordsScriptLiveLandscapeContainerMiddleTop.height! +
      scriptReducer.coordsScriptLiveLandscapeVwPlayerSuper.height!,
    left:
      scriptReducer.coordsScriptLiveLandscapeContainerMiddleTop.width! / 2 -
      CIRCLE_SIZE,
    zIndex: 1,
  };

  const stylesDropDownScriptingPlayerScrollView: ViewStyle = {
    height: CIRCLE_SIZE * 1.2,
  };

  // ---- Court Lines Visibility ----

  const stylesVwLineCourtLeft: ViewStyle = {
    position: "absolute",
    left:
      scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom.width! *
      0.33,
    width: 0,
    height:
      scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom.height!,
    zIndex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "gray",
  };
  const stylesVwLineCourtRight: ViewStyle = {
    position: "absolute",
    right:
      scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom.width! *
      0.33,
    width: 0,
    height:
      scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom.height!,
    zIndex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "gray",
  };
  const stylesVwLineCourtTop: ViewStyle = {
    position: "absolute",
    left: 0,
    width: scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom.width!,
    top:
      scriptReducer.coordsScriptLiveLandscapeContainerMiddleBottom.height! *
      0.5,
    zIndex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "gray",
  };

  // ---- END Court Lines Visibility ----

  const handleOnLayoutContainerLeftLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    dispatch(
      updateCoordsScriptLiveLandscapeContainerLeft({ x, y, width, height })
    );
  };

  const handleOnLayoutContainerMiddleTopLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    dispatch(
      updateCoordsScriptLiveLandscapeContainerMiddleTop({ x, y, width, height })
    );
  };

  const handleOnLayoutContainerMiddleBottomLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    // console.log(
    //   "---> [ScriptingLiveLandscape] in handleOnLayoutContainerMiddleBottomLayout"
    // );
    // console.log("event.nativeEvent.layout", event.nativeEvent.layout);

    dispatch(
      updateCoordsScriptLiveLandscapeContainerMiddleBottom({
        x,
        y,
        width,
        height,
      })
    );
  };

  const handleOnLayoutVwPlayerSuper = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    dispatch(
      updateCoordsScriptLiveLandscapeVwPlayerSuper({ x, y, width, height })
    );
  };

  const handleOnLayoutVwBelowSvgVolleyballCourt = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    dispatch(
      updateCoordsScriptLiveLandscapeVwBelowSvgVolleyballCourt({
        x,
        y,
        width,
        height,
      })
    );
  };

  return (
    <ScreenFrameWithTopChildrenSmallLandscape
      navigation={props.navigation}
      topChildren={topChildren}
      topHeight={50}
      onBackPress={props.handleExitScriptingLive}
    >
      {props.renderSwipePad()}
      <View style={styles.container}>
        <View
          style={styles.containerLeft}
          onLayout={(event) => handleOnLayoutContainerLeftLayout(event)}
        >
          <View style={styles.vwContainerOfButtons}>
            <View style={stylesVwGroupButtons}>
              <View style={stylesVwGroupButtonsCircle} />
              <View style={styles.vwLayerAndCentered}>
                <View style={stylesVwGroupButtonsDiagonalLine} />
              </View>
              <View
                style={[styles.vwLayerAndCentered, { flexDirection: "row" }]}
              >
                <View style={styles.vwButtonKvImageBottomAndLeft}>
                  <ButtonKvImage
                    onPress={() => {
                      console.log("pressed service");
                      props.setCurrentRallyServer("analyzed");
                    }}
                    style={stylesBtnKvImageBottomLeft}
                  >
                    <BtnService style={stylesBtnBottom} />
                  </ButtonKvImage>
                </View>
                <View style={styles.vwButtonKvImageTopAndRight}>
                  <ButtonKvImage
                    onPress={() => {
                      console.log("pressed reception");
                      props.setCurrentRallyServer("opponent");
                    }}
                    style={stylesBtnKvImageTopRight}
                  >
                    <BtnReception style={stylesBtnTop} />
                  </ButtonKvImage>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.vwContainerLeftBottom}>
            <Text style={{ color: "#806181" }}>
              {" "}
              {scriptReducer.sessionActionsArray.length} actions recorded
            </Text>
            <Text style={{ fontStyle: "italic", color: "#806181" }}>
              {" "}
              {
                scriptReducer.sessionActionsArray.filter(
                  (action) => action.favorite
                ).length
              }{" "}
              favorites
            </Text>
            <Text style={{ color: "#806181" }}>
              Current server: {props.currentRallyServer}
            </Text>
          </View>
        </View>

        <View style={[styles.column]}>
          <View style={styles.containerMiddle}>
            <View
              style={styles.containerMiddleTop}
              onLayout={(event) =>
                handleOnLayoutContainerMiddleTopLayout(event)
              }
            >
              <View style={styles.vwGroupScoreAndSets}>
                <View style={styles.vwGroupSetSuper}>
                  <View
                    style={[
                      styles.vwGroupSet,
                      { flexDirection: "row-reverse" },
                    ]}
                  >
                    {Array.from({ length: 3 }).map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() =>
                          props.handleSetCirclePress("analyzed", index + 1)
                        }
                        style={[
                          styles.touchOpSetsCircle,
                          props.matchSetsWon.teamAnalyzed > index &&
                            styles.touchOpSetsCircleFilled,
                        ]}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.vwGroupScore}>
                  <View style={stylesVwRowButtonsAdjustScore}>
                    <ButtonKvStd
                      onPress={() => {
                        props.handleSetScorePress("analyzed", 1);
                      }}
                      style={styles.btnPlus}
                    >
                      +
                    </ButtonKvStd>
                    <ButtonKvStd
                      onPress={() => {
                        props.handleSetScorePress("opponent", 1);
                      }}
                      style={styles.btnPlus}
                    >
                      +
                    </ButtonKvStd>
                  </View>
                  <View style={stylesVwRowScore}>
                    <Text style={styles.txtRowScore}>
                      {props.setScores.teamAnalyzed}
                    </Text>
                    <Text style={styles.txtRowScore}>-</Text>
                    <Text style={styles.txtRowScore}>
                      {props.setScores.teamOpponent}
                    </Text>
                  </View>
                  <View style={stylesVwRowButtonsAdjustScore}>
                    <ButtonKvStd
                      onPress={() => {
                        props.handleSetScorePress("analyzed", -1);
                      }}
                      style={styles.btnPlus}
                    >
                      -
                    </ButtonKvStd>
                    <ButtonKvStd
                      onPress={() => {
                        props.handleSetScorePress("opponent", -1);
                      }}
                      style={styles.btnPlus}
                    >
                      -
                    </ButtonKvStd>
                  </View>
                </View>
                <View style={styles.vwGroupSetSuper}>
                  <View style={styles.vwGroupSet}>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() =>
                          props.handleSetCirclePress("opponent", index + 1)
                        }
                        style={[
                          styles.touchOpSetsCircle,
                          props.matchSetsWon.teamOpponent > index &&
                            styles.touchOpSetsCircleFilled,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
            {scriptReducer.scriptingForPlayerObject && (
              <View style={stylesVwPlayerSuperNoHeight}>
                <View style={stylesVwPlayerAbsolutePosition}>
                  <ButtonKvNoDefault
                    onPress={() => {
                      console.log("pressed");
                      props.setDropdownVisibility("scriptingPlayer");
                    }}
                    styleView={stylesVwPlayer}
                  >
                    <View style={styles.vwPlayerLeft}>
                      <Text style={styles.txtShirtNumber}>
                        {scriptReducer.scriptingForPlayerObject?.shirtNumber}
                      </Text>
                    </View>
                    <View style={styles.vwPlayerRight}>
                      <Text style={styles.txtPlayerName}>
                        {scriptReducer.scriptingForPlayerObject?.firstName}
                      </Text>
                      <Text style={styles.txtPlayerName}>
                        {scriptReducer.scriptingForPlayerObject?.lastName}
                      </Text>
                    </View>
                  </ButtonKvNoDefault>
                </View>
              </View>
            )}
            {props.scriptingPlayerDropdownIsVisible && (
              <View style={stylesDropDownScriptingPlayer}>
                <ScrollView style={stylesDropDownScriptingPlayerScrollView}>
                  {scriptReducer.playersArray.map(
                    (player, index) =>
                      !player.selected && (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            const tempArray = scriptReducer.playersArray.map(
                              (item) => {
                                if (item.id === player.id) {
                                  return {
                                    ...item,
                                    selected: !item.selected,
                                  };
                                }
                                return { ...item, selected: false };
                              }
                            );
                            dispatch(updatePlayersArray(tempArray));
                            dispatch(setScriptingForPlayerObject(player));
                            props.setDropdownVisibility("scriptingPlayer");
                          }}
                          style={stylesVwPlayer}
                        >
                          <View style={styles.vwPlayerLeft}>
                            <Text style={styles.txtShirtNumber}>
                              {player.shirtNumber}
                            </Text>
                          </View>
                          <View style={styles.vwPlayerRight}>
                            <Text style={styles.txtPlayerName}>
                              {player.firstName}
                            </Text>
                            <Text style={styles.txtPlayerName}>
                              {player.lastName}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )
                  )}
                </ScrollView>
              </View>
            )}
            {/* <GestureHandlerRootView> */}
            <View style={styles.column}>
              {props.isVisibleCourtLines && (
                <>
                  <View style={stylesVwLineCourtLeft} />
                  <View style={stylesVwLineCourtRight} />
                  <View style={stylesVwLineCourtTop} />
                </>
              )}
              <GestureDetector gesture={props.combinedGestures}>
                <View
                  style={styles.containerMiddleBottom}
                  onLayout={(event) =>
                    handleOnLayoutContainerMiddleBottomLayout(event)
                  }
                >
                  <View
                    style={[
                      stylesVwPlayerSuperSpacer,
                      props.lastActionIsFavorite
                        ? stylesVwPlayerSuperSpacerFavorited
                        : null,
                    ]}
                    onLayout={(event) => handleOnLayoutVwPlayerSuper(event)}
                  />

                  <View
                    style={[
                      styles.vwSvgVolleyballCourt,
                      props.lastActionIsFavorite
                        ? styles.vwSvgVolleyballCourtFavorited
                        : null,
                    ]}
                  >
                    <SvgVolleyballCourt />
                  </View>
                  <View
                    style={styles.vwBelowSvgVolleyballCourt}
                    onLayout={(event) =>
                      handleOnLayoutVwBelowSvgVolleyballCourt(event)
                    }
                  />
                </View>
              </GestureDetector>
            </View>
            {/* </GestureHandlerRootView> */}
          </View>
          <View style={styles.vwFavoriteParent}>
            <View style={stylesVwButtonFavorite}>
              <ButtonKvImage
                onPress={() => {
                  console.log("pressed favorite");
                  props.handleModifyFavorite();
                }}
                style={{
                  margin: 0,
                  padding: 0,
                }}
              >
                <BtnFavorite style={stylesBtnFavorite} />
              </ButtonKvImage>
            </View>
          </View>
        </View>

        <View style={styles.containerRight}>
          <View style={{ position: "absolute", right: 10, padding: 10 }}>
            <ButtonKvStd
              onPress={() => {
                console.log("change court lines visibility");
                props.setIsVisibleCourtLines(!props.isVisibleCourtLines);
              }}
              style={{
                backgroundColor: "#806181",
                width: "100%",
              }}
            >
              Show Grid{" "}
            </ButtonKvStd>
          </View>
          <View style={styles.vwContainerOfButtons}>
            <View style={stylesVwGroupButtons}>
              <View style={stylesVwGroupButtonsCircle} />
              <View style={styles.vwLayerAndCentered}>
                <View style={stylesVwGroupButtonsDiagonalLine} />
              </View>
              <View
                style={[styles.vwLayerAndCentered, { flexDirection: "row" }]}
              >
                <View style={styles.vwButtonKvImageBottomAndLeft}>
                  <ButtonKvImage
                    onPress={() => {
                      console.log("pressed lose");
                      props.handleSetScorePress("opponent", 1);
                    }}
                    style={stylesBtnKvImageBottomLeft}
                  >
                    <BtnLose style={stylesBtnTop} />
                  </ButtonKvImage>
                </View>
                <View style={styles.vwButtonKvImageTopAndRight}>
                  <ButtonKvImage
                    onPress={() => {
                      console.log("pressed win");
                      props.handleSetScorePress("analyzed", 1);
                    }}
                    style={stylesBtnKvImageTopRight}
                  >
                    <BtnWin style={stylesBtnBottom} />
                  </ButtonKvImage>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.vwContainerRightBottom}>
            <View style={styles.vwSendScriptButton}>
              <ButtonKvStd
                onPress={() => {
                  console.log("pressed send script");
                  props.sendScriptReducerSessionActionsArrayToServer();
                }}
                style={{
                  backgroundColor: "#806181",
                  width: "100%",
                }}
              >
                Send script to{" "}
                {
                  teamReducer.teamsArray.find((tribe) => tribe.selected)
                    ?.teamName
                }
              </ButtonKvStd>
            </View>
          </View>
        </View>
      </View>
    </ScreenFrameWithTopChildrenSmallLandscape>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "white",
  },
  column: {
    flex: 1,
  },
  vwContainerOfButtons: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vwLayerAndCentered: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  vwButtonKvImageTopAndRight: {
    width: "50%",
  },
  vwButtonKvImageBottomAndLeft: {
    width: "50%",
  },
  vwTopChildren: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 10,
  },
  vwTopChildrenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  txtTopChildren: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  containerLeft: {
    width: "30%",
  },
  vwContainerLeftTop: {
    flex: 1,
  },
  vwContainerLeftTopLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  vwContainerLeftBottom: {
    paddingBottom: 20,
    paddingLeft: 40,
  },
  containerMiddle: {
    flex: 1,
    zIndex: 0,
  },
  containerMiddleTop: {
    // Add any specific styling if needed
  },
  vwGroupScoreAndSets: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    paddingVertical: 10,
  },
  vwGroupSetSuper: {
    // Add any specific styling if needed
  },
  vwGroupSet: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#806181",
    padding: 5,
    borderRadius: 15,
    gap: 5,
  },
  touchOpSetsCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    marginHorizontal: 1,
    backgroundColor: "#806181",
  },
  touchOpSetsCircleFilled: {
    backgroundColor: "white",
  },
  vwGroupScore: {
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  btnPlus: {
    padding: 0,
    margin: 0,
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#806181",
    color: "white",
    width: 35,
    borderRadius: 10,
    height: undefined,
    fontSize: undefined,
    opacity: 0.5,
  },
  txtRowScore: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  containerMiddleBottom: {
    flex: 1,
    alignItems: "center",
  },
  vwSvgVolleyballCourt: {
    backgroundColor: "#F0EAF9",
    width: "100%",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  vwSvgVolleyballCourtFavorited: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#806181",
  },
  vwPlayerLeft: {
    justifyContent: "center",
    backgroundColor: "#806181",
    borderRadius: 30,
  },
  txtShirtNumber: {
    fontWeight: "bold",
    color: "white",
    fontSize: 15,
    borderRadius: 7,
    height: 15,
    width: 20,
    textAlign: "center",
    fontFamily: "ApfelGrotezkBold",
  },
  vwPlayerRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  txtPlayerName: {
    textAlign: "center",
    color: "#6E4C84",
    fontSize: 11,
  },
  vwBelowSvgVolleyballCourt: {
    width: "100%",
    flex: 1,
    alignItems: "center",
  },
  vwFavoriteParent: {
    height: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  containerRight: {
    width: "25%",
  },
  vwContainerRightBottom: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  vwSendScriptButton: {
    // Add any specific styling if needed
  },
});
