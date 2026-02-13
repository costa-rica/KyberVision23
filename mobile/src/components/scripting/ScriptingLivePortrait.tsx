import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useState, useCallback } from "react";
import { FontAwesome } from "@expo/vector-icons";
import ButtonKvImage from "../buttons/ButtonKvImage";
import ButtonKvStd from "../buttons/ButtonKvStd";
import ButtonKvNoDefaultTextOnly from "../buttons/ButtonKvNoDefaultTextOnly";
import ButtonKvNoDefault from "../buttons/ButtonKvNoDefault";
import {
  // GestureHandlerRootView,
  GestureDetector,
} from "react-native-gesture-handler";
import SvgVolleyballCourt from "../../assets/images/scripting/volleyballCourt.svg";
import BtnReception from "../../assets/images/scripting/btnReception.svg";
import BtnService from "../../assets/images/scripting/btnService.svg";
import BtnFavorite from "../../assets/images/scripting/btnFavorite.svg";
import BtnWin from "../../assets/images/scripting/btnWin.svg";
import BtnLose from "../../assets/images/scripting/btnLose.svg";
import Lightning from "../../assets/images/scripting/lightning.svg";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../types/store";
import {
  updateCoordsScriptLivePortraitContainerMiddle,
  updateScriptSessionActionsArray,
  updateCoordsScriptLivePortraitVwPlayerSuperSpacer,
  setScriptingForPlayerObject,
  updatePlayersArray,
  Player,
} from "../../reducers/script";

interface ScriptingLivePortraitProps {
  combinedGestures: any;
  orientation: string;
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
  setLastActionDropDownIsVisibleQuality: (visible: boolean) => void;
  lastActionDropDownIsVisiblePosition: boolean;
  setLastActionDropDownIsVisiblePosition: (visible: boolean) => void;
  lastActionDropDownIsVisiblePlayer: boolean;
  setLastActionDropDownIsVisiblePlayer: (visible: boolean) => void;
  lastActionDropDownIsVisibleType: boolean;
  setLastActionDropDownIsVisibleType: (visible: boolean) => void;
  lastActionDropDownIsVisibleSubtype: boolean;
  setLastActionDropDownIsVisibleSubtype: (visible: boolean) => void;
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

export default function ScriptingLivePortrait(
  props: ScriptingLivePortraitProps
) {
  const scriptReducer = useSelector((state: RootState) => state.script);
  const teamReducer = useSelector((state: RootState) => state.team);
  const dispatch = useDispatch();

  const handleOnLayoutContainerMiddle = (event: any) => {
    // console.log("-- handleOnLayoutContainerMiddle --");
    // console.log(event.nativeEvent.layout);
    const { width, height, x, y } = event.nativeEvent.layout;

    dispatch(
      updateCoordsScriptLivePortraitContainerMiddle({ x, y, width, height })
    );
  };

  const handleOnLayoutPlayerSuperSpacer = (event: any) => {
    // console.log("--- handleOnLayoutPlayerSuperSpacer ---");
    // console.log(event.nativeEvent.layout);
    const { width, height, x, y } = event.nativeEvent.layout;
    dispatch(
      updateCoordsScriptLivePortraitVwPlayerSuperSpacer({ x, y, width, height })
    );
  };

  const handleLastActionPlayerName = () => {
    const lastActionPlayerId =
      scriptReducer.sessionActionsArray[
        scriptReducer.sessionActionsArray.length - 1
      ]?.playerId;

    if (!lastActionPlayerId) return null;

    const player = scriptReducer.playersArray.find(
      (player) => player.id.toString() === lastActionPlayerId
    );

    return player?.firstName || null;
  };

  const btnDiameter = Dimensions.get("window").width * 0.15;

  const stylesBtnTop: ViewStyle = {
    width: btnDiameter,
    height: btnDiameter,
    zIndex: 2,
  };

  const stylesBtnBottom: ViewStyle = {
    width: btnDiameter,
    height: btnDiameter,
    zIndex: 2,
  };

  const stylesBtnFavorite: ViewStyle = {
    width: btnDiameter,
    height: btnDiameter,
  };

  const stylesVwGroupButtonsDiagonalLine: ViewStyle = {
    position: "absolute",
    width: btnDiameter * Math.sqrt(2),
    height: 8,
    backgroundColor: "#806181",
    top: "50%",
    left: "50%",
    transform: [
      { translateX: -0.5 * Dimensions.get("window").width * 0.21 },
      { translateY: -5 },
      { rotate: "-45deg" },
    ],
    zIndex: 0,
  };

  const stylesVwGroupButtonsCircle: ViewStyle = {
    borderRadius: (Dimensions.get("window").width * 0.2) / 2,
    backgroundColor: "#806181",
    opacity: 0.5,
    width: Dimensions.get("window").width * 0.2,
    height: Dimensions.get("window").width * 0.2,
    top: Dimensions.get("window").width * 0.05,
    left:
      (Dimensions.get("window").width * 0.4) / 2 -
      (Dimensions.get("window").width * 0.2) / 2,
    position: "absolute",
  };

  const stylesDropDownPositionQuality: TextStyle = {
    left: 5,
    width: Dimensions.get("window").width * 0.1 - 5,
  };

  const stylesDropDownPositionPosition: TextStyle = {
    left: Dimensions.get("window").width * 0.1 + 5,
    width: Dimensions.get("window").width * 0.1 - 5,
  };

  const stylesDropDownPositionPlayer: TextStyle = {
    left: Dimensions.get("window").width * 0.2 + 5,
    width: Dimensions.get("window").width * 0.2 - 5,
  };

  const stylesDropDownPositionType: TextStyle = {
    left: Dimensions.get("window").width * 0.4 + 5,
    width: Dimensions.get("window").width * 0.2 - 5,
  };

  const stylesDropDownPositionSubtype: TextStyle = {
    left: Dimensions.get("window").width * 0.6 + 5,
    width: Dimensions.get("window").width * 0.2 - 5,
  };
  const stylesDropDownPositionQualityView: ViewStyle = {
    left: 5,
    width: Dimensions.get("window").width * 0.1 - 5,
  };

  const stylesDropDownPositionPositionView: ViewStyle = {
    left: Dimensions.get("window").width * 0.1 + 5,
    width: Dimensions.get("window").width * 0.1 - 5,
  };

  const stylesDropDownPositionPlayerView: ViewStyle = {
    left: Dimensions.get("window").width * 0.2 + 5,
    width: Dimensions.get("window").width * 0.2 - 5,
  };

  const stylesDropDownPositionTypeView: ViewStyle = {
    left: Dimensions.get("window").width * 0.4 + 5,
    width: Dimensions.get("window").width * 0.2 - 5,
  };

  const stylesDropDownPositionSubtypeView: ViewStyle = {
    left: Dimensions.get("window").width * 0.6 + 5,
    width: Dimensions.get("window").width * 0.2 - 5,
  };

  const stylesVwPlayerSuperNoHeight: ViewStyle = {
    width: "100%",
    alignItems: "center",
  };

  const stylesVwPlayerSuperSpacer: ViewStyle = {
    width: "100%",
    height: btnDiameter,
  };

  const stylesVwPlayerAbsolutePosition: ViewStyle = {
    position: "absolute",
    top: btnDiameter / 4,
    zIndex: 1,
  };

  const stylesVwPlayer: ViewStyle = {
    borderWidth: 1,
    borderColor: "#6E4C84",
    borderRadius: 30,
    backgroundColor: "white",
    flexDirection: "row",
    gap: 10,
    padding: 5,
    width: Dimensions.get("window").width * 0.3,
    zIndex: 1,
  };

  const stylesDropDownScriptingPlayer: ViewStyle = {
    position: "absolute",
    top: btnDiameter * 0.85,
    zIndex: 1,
  };

  const stylesDropDownScriptingPlayerScrollView: ViewStyle = {
    height: btnDiameter * 1.2,
  };

  const stylesVwPlayerPositionArea1: ViewStyle = {
    position: "absolute",
    top: scriptReducer.coordsScriptLivePortraitContainerMiddle.height! - 100,
    right: 100,
    zIndex: 1,
  };

  const stylesVwPlayerPositionArea5: ViewStyle = {
    position: "absolute",
    top: scriptReducer.coordsScriptLivePortraitVwPlayerSuperSpacer.height! + 20,
    left: 120,
    zIndex: 1,
  };

  // ---- Court Lines Visibility ----

  const stylesVwLinePortaitCourtLeft: ViewStyle = {
    position: "absolute",
    left: scriptReducer.coordsScriptLivePortraitContainerMiddle.width! * 0.33,
    width: 0,
    height: scriptReducer.coordsScriptLivePortraitContainerMiddle.height!,
    zIndex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "gray",
  };
  const stylesVwLinePortaitCourtRight: ViewStyle = {
    position: "absolute",
    right: scriptReducer.coordsScriptLivePortraitContainerMiddle.width! * 0.33,
    width: 0,
    height: scriptReducer.coordsScriptLivePortraitContainerMiddle.height!,
    zIndex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "gray",
  };
  const stylesVwLinePortaitCourtTop: ViewStyle = {
    position: "absolute",
    left: 0,
    width: scriptReducer.coordsScriptLivePortraitContainerMiddle.width!,
    top: scriptReducer.coordsScriptLivePortraitContainerMiddle.height! * 0.5,
    zIndex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "gray",
  };

  // ---- END Court Lines Visibility ----

  return (
    <View style={styles.container}>
      <View style={styles.containerTop}>
        <View style={styles.vwTeamNames}>
          <View style={styles.vwTeamNameSub}>
            <Text style={styles.txtTeamName}>
              {teamReducer.teamsArray.find((tribe) => tribe.selected)?.teamName}
            </Text>
          </View>
          <Lightning />
          <View style={styles.vwTeamNameSub}>
            <Text style={styles.txtTeamName}>Team 2</Text>
          </View>
        </View>

        <View style={styles.vwGroupScoreAndSets}>
          <View style={styles.vwGroupSetSuper}>
            <View style={[styles.vwGroupSet, { flexDirection: "row-reverse" }]}>
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
            <View style={styles.vwRowButtonsAdjustScore}>
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
            <View style={styles.vwRowScore}>
              <Text style={styles.txtRowScore}>
                {props.setScores.teamAnalyzed}
              </Text>
              <Text style={styles.txtRowScore}>-</Text>
              <Text style={styles.txtRowScore}>
                {props.setScores.teamOpponent}
              </Text>
            </View>
            <View style={styles.vwRowButtonsAdjustScore}>
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
        <View style={styles.vwGroupLastActionButtonsInstructionsAndLabels}>
          <View style={styles.vwGroupInstructionsAndLabels}>
            <Text style={styles.txtInstructions}>Last scripted point</Text>
            <View style={styles.vwGroupLabels}>
              <Text
                style={[stylesDropDownPositionQuality, styles.txtGroupLabel]}
              >
                Quality
              </Text>
              <Text
                style={[stylesDropDownPositionPosition, styles.txtGroupLabel]}
              >
                Pos.
              </Text>
              <Text
                style={[stylesDropDownPositionPlayer, styles.txtGroupLabel]}
              >
                Player
              </Text>
              <Text style={[stylesDropDownPositionType, styles.txtGroupLabel]}>
                Type
              </Text>
              <Text
                style={[stylesDropDownPositionSubtype, styles.txtGroupLabel]}
              >
                Subtype
              </Text>
            </View>
          </View>

          <View style={styles.vwGroupLastActionButtonsSuper}>
            <View style={styles.vwGroupLastActionButtons}>
              <ButtonKvNoDefaultTextOnly
                onPress={() => {
                  if (scriptReducer.sessionActionsArray.length > 0) {
                    props.setDropdownVisibility("quality");
                  }
                }}
                styleView={{
                  ...styles.btnLastAction,
                  ...styles.btnLastActionSmall,
                }}
                styleText={styles.txtLastAction}
              >
                {scriptReducer.sessionActionsArray[
                  scriptReducer.sessionActionsArray.length - 1
                ]?.quality || "?"}
              </ButtonKvNoDefaultTextOnly>
              <ButtonKvNoDefaultTextOnly
                onPress={() => {
                  if (scriptReducer.sessionActionsArray.length > 0) {
                    props.setDropdownVisibility("position");
                  }
                }}
                styleView={{
                  ...styles.btnLastAction,
                  ...styles.btnLastActionSmall,
                }}
                styleText={styles.txtLastAction}
              >
                {scriptReducer.sessionActionsArray[
                  scriptReducer.sessionActionsArray.length - 1
                ]?.area || "?"}
              </ButtonKvNoDefaultTextOnly>
              <ButtonKvNoDefaultTextOnly
                onPress={() => {
                  console.log("pressed Player");
                  if (scriptReducer.sessionActionsArray.length > 0) {
                    props.setDropdownVisibility("player");
                  }
                }}
                styleView={{
                  ...styles.btnLastAction,
                  ...styles.btnLastActionBig,
                }}
                styleText={styles.txtLastAction}
              >
                {handleLastActionPlayerName() !== null
                  ? handleLastActionPlayerName()!.slice(0, 4)
                  : "?"}
              </ButtonKvNoDefaultTextOnly>
              <ButtonKvNoDefaultTextOnly
                onPress={() => {
                  console.log("pressed Type");
                  if (scriptReducer.sessionActionsArray.length > 0) {
                    props.setDropdownVisibility("type");
                  }
                }}
                styleView={{
                  ...styles.btnLastAction,
                  ...styles.btnLastActionBig,
                }}
                styleText={styles.txtLastAction}
              >
                {scriptReducer.sessionActionsArray[
                  scriptReducer.sessionActionsArray.length - 1
                ]?.type || "?"}
              </ButtonKvNoDefaultTextOnly>
              <ButtonKvNoDefaultTextOnly
                onPress={() => {
                  console.log("pressed Subtype");
                  if (scriptReducer.sessionActionsArray.length > 0) {
                    props.setDropdownVisibility("subtype");
                  }
                }}
                styleView={{
                  ...styles.btnLastAction,
                  ...styles.btnLastActionBig,
                }}
                styleText={styles.txtLastAction}
              >
                {props.getSubtypeForLastAction()}
              </ButtonKvNoDefaultTextOnly>

              {props.lastActionDropDownIsVisibleQuality && (
                <View
                  style={[
                    stylesDropDownPositionQualityView,
                    styles.vwDropDownContainer,
                  ]}
                >
                  {scriptReducer.qualityArray.map((quality, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        props.handleModifyQuality(quality);
                        props.setLastActionDropDownIsVisibleQuality(false);
                      }}
                      style={styles.btnDropDown}
                    >
                      <Text style={styles.txtDropDownBtn}>{quality}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {props.lastActionDropDownIsVisiblePosition && (
                <View
                  style={[
                    stylesDropDownPositionPositionView,
                    styles.vwDropDownContainer,
                  ]}
                >
                  {scriptReducer.positionalAreasArray.map(
                    (positionalArea, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          props.handleModifyPosition(positionalArea);
                          props.setLastActionDropDownIsVisiblePosition(false);
                        }}
                        style={styles.btnDropDown}
                      >
                        <Text style={styles.txtDropDownBtn}>
                          {positionalArea}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              )}
              {props.lastActionDropDownIsVisiblePlayer && (
                <View
                  style={[
                    stylesDropDownPositionPlayerView,
                    styles.vwDropDownContainer,
                  ]}
                >
                  {scriptReducer.playersArray.map((player, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        props.handleModifyLastActionPlayer(player);
                        props.setLastActionDropDownIsVisiblePlayer(false);
                      }}
                      style={styles.btnDropDown}
                    >
                      <Text style={styles.txtDropDownBtn}>
                        {player.firstName.slice(0, 4)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {props.lastActionDropDownIsVisibleType && (
                <View
                  style={[
                    stylesDropDownPositionTypeView,
                    styles.vwDropDownContainer,
                  ]}
                >
                  {scriptReducer.typesArray.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        props.handleModifyType(type);
                        props.setLastActionDropDownIsVisibleType(false);
                      }}
                      style={styles.btnDropDown}
                    >
                      <Text style={styles.txtDropDownBtn}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {props.lastActionDropDownIsVisibleSubtype && (
                <View
                  style={[
                    stylesDropDownPositionSubtypeView,
                    styles.vwDropDownContainer,
                  ]}
                >
                  {(props.subtypesArrayForLastAction || []).map(
                    (subtype, index) => (
                      <TouchableOpacity
                        key={`${subtype}-${index}`}
                        onPress={() => {
                          props.setLastActionDropDownIsVisibleSubtype(false);
                          props.handleModifySubtype(subtype);
                        }}
                        style={styles.btnDropDown}
                      >
                        <Text style={styles.txtDropDownBtn}>
                          {subtype !== null ? subtype.slice(0, 4) : ""}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View
        style={styles.containerMiddle}
        onLayout={(event) => handleOnLayoutContainerMiddle(event)}
      >
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
        {/* <GestureHandlerRootView style={{}}> */}
        <View style={{}}>
          {props.isVisibleCourtLines && (
            <>
              <View style={stylesVwLinePortaitCourtLeft} />
              <View style={stylesVwLinePortaitCourtRight} />
              <View style={stylesVwLinePortaitCourtTop} />
            </>
          )}
          <GestureDetector gesture={props.combinedGestures}>
            <View
              style={[
                styles.containerMiddleSub,
                props.lastActionIsFavorite
                  ? styles.containerMiddleSubFavorited
                  : null,
              ]}
            >
              <View
                style={stylesVwPlayerSuperSpacer}
                onLayout={handleOnLayoutPlayerSuperSpacer}
              />
              {/* <View style={stylesVwPlayerPositionArea1}>
								<Text>Area 1</Text>
								<Text>
									{
										scriptReducer.playersArray.find(
											(player) => player.positionArea === 1
										)?.firstName
									}
								</Text>
							</View>
							<View style={stylesVwPlayerPositionArea5}>
								<Text>Area 5</Text>
								<Text>
									{
										scriptReducer.playersArray.find(
											(player) => player.positionArea === 5
										)?.firstName
									}
								</Text>
							</View> */}
              <SvgVolleyballCourt />
            </View>
          </GestureDetector>
        </View>
        {/* </GestureHandlerRootView> */}
      </View>

      <View style={styles.containerBottom}>
        <View style={styles.vwRallyButtonsGroup}>
          <View style={styles.vwGroupButtons}>
            <View style={stylesVwGroupButtonsCircle} />
            <View style={stylesVwGroupButtonsDiagonalLine} />
            <ButtonKvImage
              onPress={() => {
                console.log("pressed service");
                props.setCurrentRallyServer("analyzed");
              }}
              style={styles.btnRallyGroupBottom}
            >
              <BtnService style={stylesBtnBottom} />
            </ButtonKvImage>
            <ButtonKvImage
              onPress={() => {
                console.log("pressed reception");
                props.setCurrentRallyServer("opponent");
              }}
              style={styles.btnRallyGroupTop}
            >
              <BtnReception style={stylesBtnTop} />
            </ButtonKvImage>
          </View>
          <View style={styles.vwButtonFavorite}>
            <ButtonKvImage
              onPress={() => {
                console.log("pressed favorite");
                props.handleModifyFavorite();
              }}
              style={{ margin: 0, padding: 0 }}
            >
              <BtnFavorite style={stylesBtnFavorite} />
            </ButtonKvImage>
          </View>
          <View style={styles.vwGroupButtons}>
            <View style={stylesVwGroupButtonsCircle} />
            <View style={stylesVwGroupButtonsDiagonalLine} />
            <ButtonKvImage
              onPress={() => {
                console.log("pressed win");
                props.handleSetScorePress("analyzed", 1);
              }}
              style={styles.btnRallyGroupBottom}
            >
              <BtnWin style={stylesBtnBottom} />
            </ButtonKvImage>

            <ButtonKvImage
              onPress={() => {
                console.log("pressed lose");
                props.handleSetScorePress("opponent", 1);
              }}
              style={styles.btnRallyGroupTop}
            >
              <BtnLose style={stylesBtnTop} />
            </ButtonKvImage>
          </View>
        </View>
        <View style={styles.vwSendScriptGroup}>
          <View>
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
              {teamReducer.teamsArray.find((tribe) => tribe.selected)?.teamName}
            </ButtonKvStd>
          </View>
        </View>
        <View
          style={{ position: "absolute", bottom: -50, right: 10, padding: 10 }}
        >
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
      </View>
      {/* <View>
				<Text>currentRallyServer: {props.currentRallyServer}</Text>
				<ScrollView style={{ height: 150 }}>
					<Text>
						{JSON.stringify(scriptReducer.sessionActionsArray, null, 2)}
					</Text>
				</ScrollView>
			</View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  containerTop: {
    width: "100%",
  },
  testActionsContainer: {
    height: 80,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  vwTeamNames: {
    backgroundColor: "#806181",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    height: 50,
    overflow: "hidden",
  },
  vwTeamNameSub: {
    // Add any specific styling if needed
  },
  txtTeamName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  vwGroupScoreAndSets: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
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
    width: Dimensions.get("window").width * 0.4,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  vwRowButtonsAdjustScore: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
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
  } as TextStyle & ViewStyle,
  vwRowScore: {
    backgroundColor: "#806181",
    borderRadius: 20,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  txtRowScore: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  vwGroupLastActionButtonsInstructionsAndLabels: {
    justifyContent: "center",
    alignItems: "center",
  },
  vwGroupInstructionsAndLabels: {
    width: Dimensions.get("window").width,
    justifyContent: "center",
    alignItems: "center",
  },
  txtInstructions: {
    color: "#806181",
    fontSize: 12,
    fontWeight: "bold",
    width: Dimensions.get("window").width * 0.8 + 5,
  },
  vwGroupLabels: {
    flexDirection: "row",
    position: "relative",
    height: 15,
    width: Dimensions.get("window").width * 0.8 + 5,
  },
  txtGroupLabel: {
    color: "gray",
    fontSize: 10,
    position: "absolute",
    top: 0,
    zIndex: 1,
    textAlign: "center",
  } as TextStyle,
  vwGroupLastActionButtonsSuper: {
    width: Dimensions.get("window").width,
    justifyContent: "center",
    alignItems: "center",
  },
  vwGroupLastActionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#806181",
    borderRadius: 20,
    padding: 5,
    width: Dimensions.get("window").width * 0.8 + 5,
  },
  btnLastAction: {
    backgroundColor: "#BD9AC1",
    borderWidth: 0,
    height: undefined,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    width: undefined,
  } as ViewStyle,
  btnLastActionSmall: {
    width: Dimensions.get("window").width * 0.1 - 5,
  },
  btnLastActionBig: {
    width: Dimensions.get("window").width * 0.2 - 5,
  },
  txtLastAction: {
    color: "#806181",
    fontSize: 15,
  },
  vwDropDownContainer: {
    position: "absolute",
    top: 30,
    backgroundColor: "#806181",
    borderRadius: 10,
    padding: 5,
    zIndex: 2,
    gap: 5,
  },
  btnDropDown: {
    backgroundColor: "white",
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
  },
  txtDropDownBtn: {
    color: "#806181",
  },
  containerMiddle: {
    alignItems: "center",
  },
  containerMiddleSub: {
    backgroundColor: "#F0EAF9",
    alignItems: "center",
    width: Dimensions.get("window").width,
    paddingBottom: 20,
    borderWidth: 2,
    borderColor: "#F0EAF9",
  },
  containerMiddleSubFavorited: {
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
  containerBottom: {
    width: "100%",
  },
  vwRallyButtonsGroup: {
    flexDirection: "row",
  },
  vwGroupButtons: {
    position: "relative",
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.4,
    justifyContent: "center",
  },
  btnRallyGroupBottom: {
    paddingHorizontal: 0,
    paddingTop: 50,
  },
  btnRallyGroupTop: {
    // Add any specific styling if needed
  },
  vwButtonFavorite: {
    borderRadius: (Dimensions.get("window").width * 0.2) / 2,
    backgroundColor: "white",
    marginTop: -35,
    paddingTop: 5,
    width: Dimensions.get("window").width * 0.2,
    alignItems: "center",
  },
  vwSendScriptGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  vwSendScriptButton: {
    // Add any specific styling if needed
  },
});
