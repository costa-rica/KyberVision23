import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import type { HomeScreenProps } from "../../types/navigation";
import ScreenFrameWithTopChildren from "../../components/screen-frames/ScreenFrameWithTopChildren";
import ButtonKvStd from "../../components/buttons/ButtonKvStd";
import ButtonKvNoDefaultTextOnly from "../../components/buttons/ButtonKvNoDefaultTextOnly";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../types/store";
import { updateTeamsArray } from "../../reducers/team";
import { logoutUser } from "../../reducers/user";
import type { Team } from "../../reducers/team";
import { updateSessionsArray } from "../../reducers/script";

export default function Home({ navigation }: HomeScreenProps) {
  const userReducer = useSelector((state: RootState) => state.user);
  const teamReducer = useSelector((state: RootState) => state.team);
  const [displayTeamList, setDisplayTeamList] = useState(false);
  const dispatch = useDispatch();
  const [sessionsArray, setSessionsArray] = useState<any[]>([]);

  const handleTribeSelect = (selectedId: number) => {
    const updatedArray = teamReducer.teamsArray.map((team) => ({
      ...team,
      selected: team.id === selectedId,
    }));
    dispatch(updateTeamsArray(updatedArray));
    setDisplayTeamList(false);
  };

  const topChildren = (
    <View style={styles.vwTopChildren}>
      <View style={styles.vwCapsuleSuper}>
        <View
          style={displayTeamList ? styles.vwCapsuleExpanded : styles.vwCapsule}
        >
          <View style={[styles.vwLeftCapsule]}>
            {displayTeamList ? (
              <View>
                {teamReducer.teamsArray.map((tribe: Team) => (
                  <TouchableOpacity
                    key={tribe.id}
                    onPress={() => handleTribeSelect(tribe.id)}
                    style={[styles.vwTeamRow]}
                  >
                    <Text
                      style={[
                        styles.txtDropdownTopChildTeamName,
                        tribe.selected && { fontWeight: "bold" },
                      ]}
                    >
                      {tribe.teamName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.txtTopChildSelectedTribeName}>
                {teamReducer.teamsArray.find((tribe) => tribe.selected)
                  ?.teamName || "No team selected"}
              </Text>
            )}
          </View>
          <View style={styles.vwRightCapsule}>
            {teamReducer.teamsArray.length > 1 && (
              <TouchableOpacity
                onPress={() => setDisplayTeamList(!displayTeamList)}
                style={styles.btnSelectTribe}
              >
                <Image
                  source={
                    displayTeamList
                      ? require("../../assets/images/multi-use/btnBackArrow.png")
                      : require("../../assets/images/multi-use/btnDownArrow.png")
                  }
                  style={{ width: 40, height: 40 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    fetchSessionsArray();
  }, []);

  const fetchSessionsArray = async () => {
    const selectedTeam = teamReducer.teamsArray.find((team) => team.selected);
    if (!selectedTeam) {
      console.log("No selected team found");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/sessions/${selectedTeam.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
        }
      );

      let resJson = null;
      const contentType = response.headers.get("Content-Type");

      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      if (response.ok && resJson?.sessionsArray) {
        const tempArray = resJson.sessionsArray.map((session: any) => ({
          ...session,
          selected: false,
        }));
        // TODO: Implement script reducer and updateSessionsArray action
        dispatch(updateSessionsArray(tempArray));
        setSessionsArray(tempArray);
      }
    } catch (error) {
      console.error("Fetch sessions error:", error);
    }
  };

  const createAdminButtonText = () => {
    const selectedTeam = teamReducer.teamsArray.find((team) => team.selected);
    const teamName = selectedTeam?.teamName || "Team";
    const userTeamIsAdmin = false; // TODO: Implement admin check
    const adminButtonText = userTeamIsAdmin
      ? `Administrate ${teamName}`
      : `${teamName} Settings`;
    return adminButtonText;
  };

  return (
    <ScreenFrameWithTopChildren
      navigation={navigation}
      topChildren={topChildren}
      screenName="HomeScreen"
    >
      <View style={styles.container}>
        <View style={styles.containerTop}>
          <View style={styles.vwInputGroup}>
            <ButtonKvStd
              onPress={() => navigation.navigate("ScriptingLiveSelectSession")}
              style={styles.btnHomeNavigation}
            >
              Scripting
            </ButtonKvStd>
            <ButtonKvStd
              onPress={() => navigation.navigate("ReviewSelection")}
              style={styles.btnHomeNavigation}
            >
              Review
            </ButtonKvStd>
            <ButtonKvNoDefaultTextOnly
              onPress={() => navigation.navigate("UploadVideo")}
              styleView={styles.btnHomeNavigationUploadVideo}
              styleText={styles.txtHomeNavigationUploadVideo}
            >
              Upload Video
            </ButtonKvNoDefaultTextOnly>
            <ButtonKvNoDefaultTextOnly
              onPress={() => navigation.navigate("ScriptingSyncVideoSelection")}
              styleView={styles.btnHomeNavigationUploadVideo}
              styleText={styles.txtHomeNavigationUploadVideo}
            >
              Sync Video
            </ButtonKvNoDefaultTextOnly>
            <ButtonKvNoDefaultTextOnly
              onPress={() => navigation.navigate("AdminSettings")}
              styleView={styles.btnHomeNavigationUploadVideo}
              styleText={styles.txtHomeNavigationUploadVideo}
            >
              {createAdminButtonText()}
            </ButtonKvNoDefaultTextOnly>
          </View>
        </View>
        <View style={styles.containerBottom}>
          <ButtonKvStd
            onPress={() => {
              dispatch(logoutUser());
              navigation.navigate("Splash");
            }}
            style={styles.btnHomeNavigation}
          >
            Logout
          </ButtonKvStd>
        </View>
      </View>
    </ScreenFrameWithTopChildren>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
    width: "100%",
  },
  // ----- TOP Children -----
  vwTopChildren: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  txtTopChildSelectedTribeName: {
    color: "white",
    fontSize: 20,
  },
  vwCapsuleSuper: {
    position: "relative",
    width: Dimensions.get("window").width * 0.8,
    height: 50,
  },
  vwCapsule: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#806181",
    borderRadius: 10,
    padding: 5,
    height: 50,
  },
  vwCapsuleExpanded: {
    // flexDirection: "column",
    // alignItems: "flex-start",
    // backgroundColor: "#806181",
    // borderRadius: 10,
    // padding: 5,
    // width: Dimensions.get("window").width * 0.8,
    // position: "absolute",
    // top: 0,
    // zIndex: 1,
    // minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#806181",
    borderRadius: 10,
    padding: 5,
    width: Dimensions.get("window").width * 0.8,
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  vwLeftCapsule: {
    flex: 1,
    paddingLeft: 10,
  },
  vwRightCapsule: {
    // width: 50,
    height: "100%",
    // justifyContent: "center",
    // alignItems: "center",
  },
  btnSelectTribe: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  vwTeamRow: {
    paddingVertical: 8,
    paddingLeft: 10,
  },
  txtDropdownTopChildTeamName: {
    color: "white",
    fontSize: 18,
  },
  // ----- TOP -----
  containerTop: {
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    flex: 2,
  },
  // ----- Bottom -----
  containerBottom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  vwInputGroup: {
    width: "90%",
    alignItems: "center",
    paddingTop: 30,
    gap: 15,
  },
  btnHomeNavigation: {
    width: Dimensions.get("window").width * 0.7,
    height: 50,
    justifyContent: "center",
    fontSize: 20,
    color: "white",
    backgroundColor: "#806181",
  },
  btnHomeNavigationUploadVideo: {
    width: Dimensions.get("window").width * 0.7,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 25,
    borderColor: "#806181",
    borderWidth: 2,
  },
  txtHomeNavigationUploadVideo: {
    fontSize: 18,
    color: "#806181",
    textAlign: "center",
  },
});
