import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import ScreenFrameWithTopChildrenSmall from "../../components/screen-frames/ScreenFrameWithTopChildrenSmall";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import BtnVisibilityDown from "../../assets/images/review/btnVisibilityDown.svg";
import BtnVisibilityUp from "../../assets/images/review/btnVisibilityUp.svg";
import IconMagnifingGlass from "../../assets/images/review/iconMagnifingGlass.svg";
import {
  updateTeamsArray,
  updateSelectedPlayerObject,
  updateSquadMembersArray,
  Player,
  Team,
  SquadMember,
} from "../../reducers/team";

import ButtonKvNoDefault from "../../components/buttons/ButtonKvNoDefault";
import ButtonKvNoDefaultTextOnly from "../../components/buttons/ButtonKvNoDefaultTextOnly";
import ModalTeamAddPlayer from "../../components/modals/ModalTeamAddPlayer";
import ModalAdminSettingsInviteToSquad from "../../components/modals/ModalAdminSettingsInviteToSquad";
import ModalInformationOk from "../../components/modals/ModalInformationOk";
import ModalInformationYesOrNo from "../../components/modals/ModalInformationYesOrNo";
import { RootState } from "../../types/store";
import { AdminSettingsScreenProps } from "../../types/navigation";
import { PlayerObject } from "../../types/user-admin";

interface ModalComponentAndSetterObject {
  modalComponent: React.ReactElement;
  useState: boolean;
  useStateSetter: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AdminSettings({
  navigation,
}: AdminSettingsScreenProps) {
  const userReducer = useSelector((state: RootState) => state.user);
  const teamReducer = useSelector((state: RootState) => state.team);
  const [showVisibilityOptions, setShowVisibilityOptions] = useState(false);
  const dispatch = useDispatch();
  const [playersArray, setPlayersArray] = useState<Player[]>([]);
  const [isVisibleModalAddPlayer, setIsVisibleModalAddPlayer] = useState(false);
  const [isVisibleRemovePlayerModal, setIsVisibleRemovePlayerModal] =
    useState(false);
  const [isVisibleInviteToSquadModal, setIsVisibleInviteToSquadModal] =
    useState(false);
  const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({
    title: "",
    message: "",
    variant: "info" as "info" | "success" | "error" | "warning",
  });
  const [isVisibleConfirmDeletePlayer, setIsVisibleConfirmDeletePlayer] =
    useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [
    isVisibleConfirmDeleteSquadMember,
    setIsVisibleConfirmDeleteSquadMember,
  ] = useState(false);
  const [squadMemberToDelete, setSquadMemberToDelete] =
    useState<SquadMember | null>(null);

  // Triggers whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPlayers();
      fetchSquadMembers();
    }, [])
  );

  const selectedTeam = teamReducer.teamsArray.filter(
    (team) => team.selected
  )[0];
  const selectedTeamId = teamReducer.teamsArray.find((t) => t.selected)?.id;
  const isAdminOfThisTeam =
    userReducer.contractTeamUserArray.find(
      (ctu) => Number(ctu.teamId) === Number(selectedTeamId)
    )?.isAdmin ?? false;
  const topChildren = <Text>{selectedTeam?.teamName} Settings</Text>;

  const fetchPlayers = async (): Promise<void> => {
    const selectedTeamId = teamReducer.teamsArray.find(
      (tribe) => tribe.selected
    )?.id;
    if (!selectedTeamId) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/players/team/${selectedTeamId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
        }
      );

      console.log("Received response:", response.status);

      let resJson = null;
      const contentType = response.headers.get("Content-Type");

      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      if (response.ok && resJson) {
        console.log(`response ok`);
        setPlayersArray(resJson.playersArray);
      } else {
        const errorMessage =
          resJson?.error ||
          `There was a server error (and no resJson): ${response.status}`;
        setInfoModalContent({
          title: "Error",
          message: errorMessage,
          variant: "error",
        });
        setIsVisibleInfoModal(true);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      setInfoModalContent({
        title: "Error",
        message: "Failed to fetch players",
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }
  };

  const fetchSquadMembers = async (): Promise<void> => {
    const selectedTeamId = teamReducer.teamsArray.find(
      (tribe) => tribe.selected
    )?.id;
    if (!selectedTeamId) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/contract-team-users/${selectedTeamId}`,
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

      if (response.ok && resJson) {
        dispatch(updateSquadMembersArray(resJson.squadArray));
      } else {
        const errorMessage =
          resJson?.error ||
          `There was a server error (and no resJson): ${response.status}`;
        setInfoModalContent({
          title: "Error",
          message: errorMessage,
          variant: "error",
        });
        setIsVisibleInfoModal(true);
      }
    } catch (error) {
      console.error("Error fetching squad members:", error);
      setInfoModalContent({
        title: "Error",
        message: "Failed to fetch squad members",
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }
  };

  const updateTeamVisibility = async (visibility: string): Promise<void> => {
    const selectedTeamId = teamReducer.teamsArray.filter(
      (team) => team.selected
    )[0]?.id;
    if (!selectedTeamId) return;

    try {
      const bodyObj = {
        teamId: selectedTeamId,
        visibility: visibility,
      };
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/teams/update-visibility`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );
      let resJson = null;
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      if (response.ok && resJson) {
        const updatedTeams = teamReducer.teamsArray.map((team) =>
          team.selected ? { ...team, visibility } : team
        );
        dispatch(updateTeamsArray(updatedTeams));
      } else {
        const errorMessage =
          resJson?.error ||
          `There was a server error (and no resJson): ${response.status}`;
        setInfoModalContent({
          title: "Error",
          message: errorMessage,
          variant: "error",
        });
        setIsVisibleInfoModal(true);
      }
    } catch (error) {
      console.error("Error updating team visibility:", error);
      setInfoModalContent({
        title: "Error",
        message: "Failed to update team visibility",
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }
  };

  const handleSelectVisibility = (visibility: string): void => {
    updateTeamVisibility(visibility);
    setShowVisibilityOptions(false);
    if (visibility === "On invitation") {
      console.log("----> On invitation");
      setIsVisibleInviteToSquadModal(true);
    }
  };

  const whichModalToDisplay = (): ModalComponentAndSetterObject | undefined => {
    if (isVisibleConfirmDeletePlayer && playerToDelete) {
      const idForMsg =
        teamReducer.selectedPlayerObject?.id ?? playerToDelete.id;
      const firstName =
        teamReducer.selectedPlayerObject?.firstName ?? playerToDelete.firstName;
      const lastName =
        teamReducer.selectedPlayerObject?.lastName ?? playerToDelete.lastName;

      return {
        modalComponent: (
          <ModalInformationYesOrNo
            title="Are you sure?"
            message={`you want to delete ${firstName} ${lastName} (player id: ${idForMsg})?`}
            yesButtonStyle="danger"
            onYes={() => {
              handleRemovePlayer(playerToDelete);
              setIsVisibleConfirmDeletePlayer(false);
              setPlayerToDelete(null);
            }}
            onNo={() => {
              setIsVisibleConfirmDeletePlayer(false);
              setPlayerToDelete(null);
            }}
            onClose={() => {
              setIsVisibleConfirmDeletePlayer(false);
              setPlayerToDelete(null);
            }}
          />
        ),
        useState: isVisibleConfirmDeletePlayer,
        useStateSetter: () => {
          setIsVisibleConfirmDeletePlayer(false);
          setPlayerToDelete(null);
        },
      };
    }

    if (isVisibleConfirmDeleteSquadMember && squadMemberToDelete) {
      return {
        modalComponent: (
          <ModalInformationYesOrNo
            title="Are you sure?"
            message={`you want to delete ${squadMemberToDelete.username} (user id: ${squadMemberToDelete.userId}) from the squad?`}
            yesButtonStyle="danger"
            onYes={() => {
              handleRemoveSquadMember(squadMemberToDelete);
              setIsVisibleConfirmDeleteSquadMember(false);
              setSquadMemberToDelete(null);
            }}
            onNo={() => {
              setIsVisibleConfirmDeleteSquadMember(false);
              setSquadMemberToDelete(null);
            }}
            onClose={() => {
              setIsVisibleConfirmDeleteSquadMember(false);
              setSquadMemberToDelete(null);
            }}
          />
        ),
        useState: isVisibleConfirmDeleteSquadMember,
        useStateSetter: () => {
          setIsVisibleConfirmDeleteSquadMember(false);
          setSquadMemberToDelete(null);
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
        useStateSetter: setIsVisibleInfoModal,
      };
    }

    if (isVisibleModalAddPlayer) {
      return {
        modalComponent: (
          <ModalTeamAddPlayer addPlayerToTeam={addPlayerToTeam} />
        ),
        useState: isVisibleModalAddPlayer,
        useStateSetter: setIsVisibleModalAddPlayer,
      };
    }

    if (isVisibleInviteToSquadModal) {
      return {
        modalComponent: (
          <ModalAdminSettingsInviteToSquad onPressYes={handleInviteToSquad} />
        ),
        useState: isVisibleInviteToSquadModal,
        useStateSetter: setIsVisibleInviteToSquadModal,
      };
    }
  };

  const addPlayerToTeam = async (playerObject: PlayerObject): Promise<void> => {
    const selectedTeamId = teamReducer.teamsArray.filter(
      (team) => team.selected
    )[0]?.id;
    if (!selectedTeamId) return;

    try {
      const bodyObj = {
        teamId: selectedTeamId,
        firstName: playerObject.firstName,
        lastName: playerObject.lastName,
        shirtNumber: playerObject.shirtNumber,
        position: playerObject.position,
        positionAbbreviation: playerObject.positionAbbreviation,
      };
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/teams/add-player`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );
      let resJson = null;
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      if (response.ok && resJson) {
        fetchPlayers();
      } else {
        const errorMessage =
          resJson?.error ||
          `There was a server error (and no resJson): ${response.status}`;
        setInfoModalContent({
          title: "Error",
          message: errorMessage,
          variant: "error",
        });
        setIsVisibleInfoModal(true);
      }
    } catch (error) {
      console.error("Error adding player to team:", error);
      setInfoModalContent({
        title: "Error",
        message: "Failed to add player to team",
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }

    setIsVisibleModalAddPlayer(false);
  };

  const handleRemovePlayer = async (playerObject: Player): Promise<void> => {
    console.log("--- removed Player ----");
    console.log(JSON.stringify(playerObject));
    const selectedTeamId = teamReducer.teamsArray.filter(
      (team) => team.selected
    )[0]?.id;
    if (!selectedTeamId) return;

    try {
      const bodyObj = {
        teamId: selectedTeamId,
        playerId: playerObject.id,
      };
      console.log("--- removed Player ----");
      console.log(JSON.stringify(bodyObj));
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/teams/player`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );
      let resJson = null;
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      if (response.ok && resJson) {
        fetchPlayers();
        setInfoModalContent({
          title: "Player removed successfully",
          message: "",
          variant: "success",
        });
        setIsVisibleInfoModal(true);
      } else {
        const errorMessage =
          resJson?.error ||
          `There was a server error (and no resJson): ${response.status}`;
        setInfoModalContent({
          title: "Error",
          message: errorMessage,
          variant: "error",
        });
        setIsVisibleInfoModal(true);
      }
    } catch (error) {
      console.error("Error removing player:", error);
      setInfoModalContent({
        title: "Error",
        message: "Failed to remove player",
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }

    setIsVisibleRemovePlayerModal(false);
  };

  const handleInviteToSquad = async (emailString: string): Promise<void> => {
    console.log("----> handleInviteToSquad");
    const selectedTeamId = teamReducer.teamsArray.filter(
      (team) => team.selected
    )[0]?.id;
    if (!selectedTeamId) return;

    try {
      const bodyObj = {
        teamId: selectedTeamId,
        email: emailString,
      };
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/contract-team-users/add-squad-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );
      let resJson = null;
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      if (response.ok && resJson) {
        fetchSquadMembers();

        if (response.status === 201) {
          setInfoModalContent({
            title: "Squad member added successfully",
            message: "",
            variant: "success",
          });
          setIsVisibleInfoModal(true);
        } else {
          setInfoModalContent({
            title: "Sent invitation email to non-registered user",
            message: "",
            variant: "info",
          });
          setIsVisibleInfoModal(true);
        }
      } else {
        const errorMessage =
          resJson?.error ||
          `There was a server error (and no resJson): ${response.status}`;
        setInfoModalContent({
          title: "Error",
          message: errorMessage,
          variant: "error",
        });
        setIsVisibleInfoModal(true);
      }
    } catch (error) {
      console.error("Error inviting to squad:", error);
      setInfoModalContent({
        title: "Error",
        message: "Failed to invite to squad",
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }

    setIsVisibleInviteToSquadModal(false);
  };

  const confirmDeletePlayer = (player: Player): void => {
    // keep your global selection in sync if other parts read it
    dispatch(updateSelectedPlayerObject(player));
    setPlayerToDelete(player);
    setIsVisibleConfirmDeletePlayer(true);
  };

  const confirmDeleteSquadMember = (
    contractTeamUserObject: SquadMember
  ): void => {
    setSquadMemberToDelete(contractTeamUserObject);
    setIsVisibleConfirmDeleteSquadMember(true);
  };

  const handleRemoveSquadMember = async (
    contractTeamUserObject: SquadMember
  ): Promise<void> => {
    try {
      const bodyObj = {
        contractTeamUserId: contractTeamUserObject.id,
      };
      console.log("--- removed Player ----");
      console.log(JSON.stringify(bodyObj));
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/contract-team-users/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );
      let resJson = null;
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      if (response.ok && resJson) {
        fetchSquadMembers();
        setInfoModalContent({
          title: "Squad member removed successfully",
          message: "",
          variant: "success",
        });
        setIsVisibleInfoModal(true);
      } else {
        const errorMessage =
          resJson?.error ||
          `There was a server error (and no resJson): ${response.status}`;
        setInfoModalContent({
          title: "Error",
          message: errorMessage,
          variant: "error",
        });
        setIsVisibleInfoModal(true);
      }
    } catch (error) {
      console.error("Error removing squad member:", error);
      setInfoModalContent({
        title: "Error",
        message: "Failed to remove squad member",
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }
  };

  const renderPlayerRow = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={styles.vwPlayerRow}
      onPress={() => {
        // Navigate to AdminSettingsPlayerCard
        navigation.navigate("AdminSettingsPlayerCard", {
          playerObject: item,
        });
      }}
      onLongPress={() => {
        if (!isAdminOfThisTeam) {
          return;
        }
        confirmDeletePlayer(item);
      }}
      delayLongPress={500}
    >
      <View style={styles.vwPlayerShirtNumber}>
        <Text style={styles.txtPlayerShirtNumber}>{item.shirtNumber}</Text>
      </View>
      <View style={styles.vwPlayerName}>
        <Text style={styles.txtPlayerName}>
          {item.firstName} {item.lastName}
        </Text>
      </View>
      <View style={styles.vwPlayerPosition}>
        <Text style={styles.txtPlayerPosition}>
          {item.positionAbbreviation}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSquadMemberRow = ({ item }: { item: SquadMember }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("AdminSettingsUserCard", {
          userObject: item,
        });
      }}
      onLongPress={() => {
        // Check if user is trying to delete themselves
        if (
          Number(item.userId) ===
          Number(userReducer.contractTeamUserArray[0]?.userId)
        ) {
          setInfoModalContent({
            title: "Cannot delete yourself",
            message:
              "Only another Admin can delete an admin. There must be at least one admin on the squad.",
            variant: "warning",
          });
          setIsVisibleInfoModal(true);
          return;
        }

        confirmDeleteSquadMember(item);
      }}
      delayLongPress={500}
      style={styles.vwSquadMembersRow}
    >
      <View style={styles.vwSquadMembersUserName}>
        <Text style={styles.txtSquadMembersUserName}>{item?.username}</Text>
      </View>
      {item?.isPlayer && (
        <View style={styles.vwSquadMembersPlayer}>
          <Text style={styles.txtSquadMembersPlayer}>Player</Text>
        </View>
      )}
      {item?.isCoach && (
        <View style={styles.vwSquadMembersPlayer}>
          <Text style={styles.txtSquadMembersPlayer}>Coach</Text>
        </View>
      )}
      {item?.isAdmin && (
        <View style={styles.vwSquadMembersAdmin}>
          <Text style={styles.txtSquadMembersAdmin}>Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenFrameWithTopChildrenSmall
      navigation={navigation}
      topChildren={topChildren}
      screenName={"AdminSettings"}
      modalComponentAndSetterObject={whichModalToDisplay()}
      topHeight={"15%"}
    >
      <View style={styles.container}>
        {/* --------
            TOP
            ----- */}
        <View style={styles.containerTop}>
          <View style={styles.vwContainerTopInner}>
            <View style={styles.vwTeamName}>
              <Text style={styles.txtTeamNameTitle}>Team Name</Text>
              <Text style={styles.txtTeamNameValue}>
                {selectedTeam?.teamName}
              </Text>
            </View>
            <View style={styles.vwTeamDescription}>
              <Text style={styles.txtTeamDescriptionTitle}>Description</Text>
              <Text style={styles.txtTeamDescriptionValue}>
                {selectedTeam?.description}
              </Text>
            </View>
            {isAdminOfThisTeam && (
              <View style={styles.vwTeamVisibility}>
                <Text style={styles.txtTeamVisibilityTitle}>Visibility</Text>
                <View
                  style={[
                    styles.touchableOpacityVisibilityCapsule,
                    styles.vwDropdownOptionCapsule,
                  ]}
                >
                  {selectedTeam?.visibility === "On invitation" ? (
                    <TouchableOpacity
                      onPress={() => handleSelectVisibility("On invitation")}
                    >
                      <Text style={styles.txtVisibilityCapsule}>
                        {selectedTeam?.visibility}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.txtVisibilityCapsule}>
                      {selectedTeam?.visibility}
                    </Text>
                  )}

                  {showVisibilityOptions ? (
                    <TouchableOpacity
                      onPress={() => setShowVisibilityOptions(false)}
                      style={{ padding: 5 }}
                    >
                      <BtnVisibilityUp />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setShowVisibilityOptions(true)}
                      style={{ padding: 5 }}
                    >
                      <BtnVisibilityDown />
                    </TouchableOpacity>
                  )}
                </View>
                {showVisibilityOptions && (
                  <View style={styles.vwVisibilityDropdown}>
                    {[
                      { type: "Public", value: "Anyone can join" },
                      {
                        type: "On invitation",
                        value: "Only people with link can join",
                      },
                      { type: "Private", value: "No one can join" },
                    ]
                      .filter(
                        (option) => option.type !== selectedTeam?.visibility
                      )
                      .map((option) => (
                        <TouchableOpacity
                          key={option.type}
                          style={styles.touchableOpacityDropdownOption}
                          onPress={() => {
                            handleSelectVisibility(option.type);
                          }}
                        >
                          <View style={styles.vwDropdownOptionCapsule}>
                            <Text style={styles.txtDropdownOption}>
                              {option.type}
                            </Text>
                          </View>
                          <Text style={styles.txtDropdownOptionValue}>
                            {option.value}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        {/* --------
            BOTTOM
            ----- */}
        <View style={styles.containerBottom}>
          <View style={styles.vwPlayersGroup}>
            <View style={styles.vwTableHeading}>
              <View style={styles.vwTableHeadingLeft}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  Team Roster
                </Text>
                <Text> ({playersArray.length})</Text>
              </View>
              <View style={styles.vwTableHeadingRight}>
                <ButtonKvNoDefault
                  onPress={() => {
                    console.log("Search");
                  }}
                  styleView={styles.btnSearch}
                >
                  <IconMagnifingGlass />
                </ButtonKvNoDefault>
                <ButtonKvNoDefaultTextOnly
                  onPress={() => {
                    console.log("Add");
                    setIsVisibleModalAddPlayer(true);
                  }}
                  styleView={styles.btnAddElement}
                  styleText={styles.txtBtnAddElement}
                >
                  +
                </ButtonKvNoDefaultTextOnly>
              </View>
            </View>
            <View style={styles.vwPlayersTable}>
              <FlatList
                data={playersArray}
                keyExtractor={(item, index) =>
                  item.id?.toString() || index.toString()
                }
                renderItem={renderPlayerRow}
              />
            </View>
          </View>
          {isAdminOfThisTeam && (
            <View style={styles.vwSquadMembersGroup}>
              <View style={styles.vwTableHeading}>
                <View style={styles.vwTableHeadingLeft}>
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    Squad Members
                  </Text>
                  <Text> ({teamReducer.squadMembersArray?.length})</Text>
                </View>
                <View style={styles.vwTableHeadingRight}>
                  <ButtonKvNoDefault
                    onPress={() => {
                      console.log("Search");
                    }}
                    styleView={styles.btnSearch}
                  >
                    <IconMagnifingGlass />
                  </ButtonKvNoDefault>
                  <ButtonKvNoDefaultTextOnly
                    onPress={() => {
                      console.log("Add");
                      if (isAdminOfThisTeam)
                        setIsVisibleInviteToSquadModal(true);
                    }}
                    styleView={styles.btnAddElement}
                    styleText={styles.txtBtnAddElement}
                  >
                    +
                  </ButtonKvNoDefaultTextOnly>
                </View>
              </View>
              <View style={styles.vwSquadMembersTable}>
                <FlatList
                  data={teamReducer.squadMembersArray}
                  keyExtractor={(item, index) =>
                    item.id?.toString() || index.toString()
                  }
                  renderItem={renderSquadMemberRow}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </ScreenFrameWithTopChildrenSmall>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  // ------------
  // Top
  // ------------
  containerTop: {
    width: "100%",
  },
  vwContainerTopInner: {
    padding: 20,
    width: "100%",
  },
  vwTeamName: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    width: "100%",
    marginBottom: 10,
  },
  txtTeamNameTitle: {
    color: "gray",
    marginBottom: 5,
  },
  txtTeamNameValue: {
    fontSize: 16,
  },
  vwTeamDescription: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  txtTeamDescriptionTitle: {
    color: "gray",
    marginBottom: 5,
  },
  txtTeamDescriptionValue: {
    fontSize: 16,
  },
  txtTeamVisibilityTitle: {
    color: "gray",
    marginBottom: 5,
  },
  vwTeamVisibility: {
    width: "50%",
    marginBottom: 10,
  },
  touchableOpacityVisibilityCapsule: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 5,
  },
  txtVisibilityCapsule: {
    fontSize: 14,
  },
  arrow: {
    marginLeft: 8,
  },
  vwVisibilityDropdown: {
    position: "absolute",
    top: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    width: Dimensions.get("window").width * 0.8,
    zIndex: 10,
    elevation: 5,
  },
  touchableOpacityDropdownOption: {
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  vwDropdownOptionCapsule: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    width: Dimensions.get("window").width * 0.3,
    paddingLeft: 5,
    paddingVertical: 3,
  },
  txtDropdownOption: {
    fontSize: 14,
  },
  txtDropdownOptionValue: {
    fontSize: 12,
    color: "gray",
  },
  // ------------
  // Bottom
  // ------------
  containerBottom: {
    flex: 1,
    paddingBottom: Dimensions.get("window").height * 0.05,
  },
  vwTableHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  vwTableHeadingLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  vwTableHeadingRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  btnSearch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#E8E8E8",
    borderColor: "#806181",
    borderWidth: 1,
  },
  btnAddElement: {
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: 40,
    borderRadius: 20,
    color: "white",
    backgroundColor: "#E8E8E8",
    borderColor: "#806181",
    borderWidth: 2,
  },
  txtBtnAddElement: {
    fontSize: 24,
    color: "#806181",
    justifyContent: "center",
    alignItems: "center",
  },
  vwPlayersGroup: {
    width: "100%",
    flex: 1,
  },
  vwSquadMembersGroup: {
    width: "100%",
    flex: 1,
  },

  // ---- Player Table styles ----
  vwPlayersTable: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 20,
    marginHorizontal: 5,
    padding: 5,
  },
  vwPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 5,
    height: 50,
  },
  vwPlayerShirtNumber: {
    height: "100%",
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  txtPlayerShirtNumber: {
    fontWeight: "bold",
    fontSize: 16,
  },
  vwPlayerName: {
    height: "100%",
    flex: 1,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  txtPlayerName: {
    fontSize: 16,
  },
  vwPlayerPosition: {
    height: "100%",
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  txtPlayerPosition: {
    fontSize: 14,
    color: "gray",
  },

  // ---- Squad Members Table styles ----
  vwSquadMembersTable: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 20,
    marginHorizontal: 5,
    padding: 5,
  },
  vwSquadMembersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 5,
    height: 50,
  },
  vwSquadMembersUserName: {
    height: "100%",
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    paddingLeft: 10,
  },
  txtSquadMembersUserName: {
    fontSize: 16,
  },
  vwSquadMembersPlayer: {
    borderWidth: 1,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    padding: 5,
  },
  txtSquadMembersPlayer: {
    color: "gray",
    fontSize: 16,
    fontWeight: "bold",
  },
  vwSquadMembersAdmin: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#806181",
    padding: 5,
  },
  txtSquadMembersAdmin: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
