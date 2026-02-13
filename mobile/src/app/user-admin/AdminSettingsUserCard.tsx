import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	Dimensions,
	TouchableOpacity,
	ImageBackground,
} from "react-native";
import ScreenFrameWithTopChildrenSmall from "../../components/screen-frames/ScreenFrameWithTopChildrenSmall";
import { useSelector, useDispatch } from "react-redux";
import BtnVisibilityDown from "../../assets/images/review/btnVisibilityDown.svg";
import BtnVisibilityUp from "../../assets/images/review/btnVisibilityUp.svg";
import BtnUserCardRemoveUser from "../../assets/images/user-admin/btnUserCardRemoveUser.svg";
import { updateSquadMembersArray, SquadMember } from "../../reducers/team";
import ModalInformationOk from "../../components/modals/ModalInformationOk";
import ModalInformationYesOrNo from "../../components/modals/ModalInformationYesOrNo";
import { RootState } from "../../types/store";
import { AdminSettingsUserCardScreenProps } from "../../types/navigation";

interface RoleOption {
	type: string;
	value: string;
}

export default function AdminSettingsUserCard({
	navigation,
	route,
}: AdminSettingsUserCardScreenProps) {
	const [userObject, setUserObject] = useState<SquadMember>(route.params.userObject);
	const userReducer = useSelector((state: RootState) => state.user);
	const teamReducer = useSelector((state: RootState) => state.team);
	const [showRolesOptions, setShowRolesOptions] = useState(false);
	const [rolesArray, setRolesArray] = useState<string[]>([]);
	const dispatch = useDispatch();
	const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
	const [infoModalContent, setInfoModalContent] = useState({
		title: "",
		message: "",
		variant: "info" as "info" | "success" | "error" | "warning",
	});
	const [isVisibleConfirmModal, setIsVisibleConfirmModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState<SquadMember | null>(null);

	const selectedTeam = teamReducer.teamsArray.filter((team) => team.selected)[0];
	const selectedTeamId = teamReducer.teamsArray.find((t) => t.selected)?.id;
	const isAdminOfThisTeam =
		userReducer.contractTeamUserArray.find(
			(ctu) => Number(ctu.teamId) === Number(selectedTeamId)
		)?.isAdmin ?? false;

	const topChildren = (
		<Text>
			{selectedTeam?.teamName} Settings
		</Text>
	);

	useEffect(() => {
		const tempRoles: string[] = [];
		if (userObject.isAdmin) tempRoles.push("Admin");
		if (userObject.isCoach) tempRoles.push("Coach");
		if (userObject.isPlayer) tempRoles.push("Player");
		tempRoles.push("Member");
		setRolesArray(tempRoles);
	}, [userObject]);

	const handleSelectRole = async (role: string): Promise<void> => {
		if (role === "Admin" && userObject.email === userReducer.user.email) {
			setInfoModalContent({
				title: "Cannot modify own status",
				message: "You cannot modify your own admin status. Another admin must do this.",
				variant: "warning",
			});
			setIsVisibleInfoModal(true);
			return;
		}

		try {
			const bodyObj = {
				teamId: selectedTeam?.id,
				role: role,
				userId: userObject.userId,
			};
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_BASE_URL}/contract-team-users/toggle-role`,
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
				const updatedUserObject: SquadMember = {
					...userObject,
					isAdmin: resJson.contractTeamUser.isAdmin,
					isCoach: resJson.contractTeamUser.isCoach,
				};

				const updatedSquadMembersArray = teamReducer.squadMembersArray.map(
					(user) => (user.userId === userObject.userId ? updatedUserObject : user)
				);
				dispatch(updateSquadMembersArray(updatedSquadMembersArray));

				setUserObject(updatedUserObject);
				setShowRolesOptions(false);
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
			console.error("Error updating role:", error);
			setInfoModalContent({
				title: "Error",
				message: "Failed to update role",
				variant: "error",
			});
			setIsVisibleInfoModal(true);
		}
	};

	const confirmDeleteSquadMember = (contractTeamUserObject: SquadMember): void => {
		setUserToDelete(contractTeamUserObject);
		setIsVisibleConfirmModal(true);
	};

	const handleRemoveSquadMember = async (contractTeamUserObject: SquadMember): Promise<void> => {
		try {
			const bodyObj = {
				contractTeamUserId: contractTeamUserObject.id,
			};
			console.log("--- removed User ----");
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

	const whichModalToDisplay = () => {
		if (isVisibleConfirmModal && userToDelete) {
			return {
				modalComponent: (
					<ModalInformationYesOrNo
						title="Are you sure?"
						message={`you want to delete ${userToDelete.username} (user id: ${userToDelete.userId}) from the squad?`}
						yesButtonStyle="danger"
						onYes={() => {
							handleRemoveSquadMember(userToDelete);
							navigation.goBack();
						}}
						onNo={() => {
							setIsVisibleConfirmModal(false);
							setUserToDelete(null);
						}}
						onClose={() => {
							setIsVisibleConfirmModal(false);
							setUserToDelete(null);
						}}
					/>
				),
				useState: isVisibleConfirmModal,
				useStateSetter: () => {
					setIsVisibleConfirmModal(false);
					setUserToDelete(null);
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

	return (
		<ScreenFrameWithTopChildrenSmall
			navigation={navigation}
			topChildren={topChildren}
			screenName={"AdminSettingsUserCard"}
			topHeight={"15%"}
			modalComponentAndSetterObject={whichModalToDisplay()}
		>
			<View style={styles.container}>
				<View style={styles.containerTop}>
					<View style={styles.vwUserNameAndShirtNumber}>
						<View style={styles.vwUserRight}>
							<Text style={styles.txtUserName}>{userObject.username}</Text>
						</View>
					</View>
					<View style={styles.vwUserImage}>
						<Image
							source={require("../../assets/images/multi-use/iconMissingProfilePicture.png")}
							style={styles.imgUser}
						/>
					</View>
				</View>
				<ImageBackground
					source={require("../../assets/images/user-admin/AdminSettingsPlayerCardWaveThing.png")}
					style={styles.vwUserRolesWaveThing}
				>
					<View style={styles.vwUserLabels}>
						{rolesArray.map((role) => (
							<View key={role} style={styles.vwUserLabel}>
								<Text style={styles.txtUserLabel}>{role}</Text>
							</View>
						))}
					</View>
				</ImageBackground>
				<View style={styles.containerMiddle}>
					{isAdminOfThisTeam && (
						<View style={styles.vwTeamRole}>
							<TouchableOpacity
								style={[
									styles.touchableOpacityRoleCapsule,
									styles.vwDropdownOptionCapsule,
								]}
								onPress={() => setShowRolesOptions(!showRolesOptions)}
							>
								<View>
									<Text style={styles.txtRoleCapsule}>Select role ...</Text>
								</View>
								<View style={{ padding: 5 }}>
									{showRolesOptions ? (
										<BtnVisibilityUp />
									) : (
										<BtnVisibilityDown />
									)}
								</View>
							</TouchableOpacity>
							{showRolesOptions && (
								<View style={styles.vwRoleDropdown}>
									{([
										{ type: "Admin", value: "Full rights over team" },
										{ type: "Coach", value: "" },
									] as RoleOption[])
										.filter((option) => option.type !== selectedTeam?.visibility)
										.map((option) => (
											<TouchableOpacity
												key={option.type}
												style={styles.touchableOpacityDropdownOption}
												onPress={() => {
													handleSelectRole(option.type);
												}}
											>
												<View
													style={[
														styles.vwDropdownOptionCapsule,
														rolesArray.includes(option.type)
															? styles.vwDropdownOptionCapsuleSelected
															: null,
													]}
												>
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
				<View style={styles.containerBottom}>
					<View style={styles.vwRemoveUserButtonContainer}>
						<TouchableOpacity
							style={styles.btnRemoveUser}
							onPress={() => {
								confirmDeleteSquadMember(userObject);
							}}
						>
							<BtnUserCardRemoveUser />
						</TouchableOpacity>
					</View>
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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		zIndex: 1,
		paddingTop: 10,
	},
	vwUserTop: {
		flexDirection: "row",
	},
	vwUserNameAndShirtNumber: {
		flexDirection: "row",
		flex: 1,
		gap: 10,
		padding: 5,
		marginTop: 20,
		marginLeft: 30,
	},
	vwUserLeft: {
		justifyContent: "center",
		backgroundColor: "#806181",
		borderRadius: 30,
		height: 60,
		width: 60,
		alignItems: "center",
	},
	vwUserRight: {
		justifyContent: "center",
	},
	txtUserName: {
		color: "#6E4C84",
		fontSize: 24,
		fontWeight: "600",
	},
	vwUserImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
		overflow: "hidden",
	},
	imgUser: {
		width: "90%",
		height: "90%",
		resizeMode: "cover",
	},
	vwUserRolesWaveThing: {
		width: Dimensions.get("window").width,
		height: 100,
		marginTop: -50,
		padding: 10,
	},
	vwUserLabels: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "flex-start",
		width: Dimensions.get("window").width * 0.5,
		height: 100,
		gap: 5,
	},
	vwUserLabel: {
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 30,
		backgroundColor: "#806181",
		padding: 5,
	},
	txtUserLabel: {
		fontSize: 20,
		color: "white",
		lineHeight: 20,
	},

	// ------------
	// Middle
	// ------------
	containerMiddle: {
		width: "100%",
		padding: 20,
		flex: 1,
	},
	vwTeamRole: {
		width: "100%",
	},
	touchableOpacityRoleCapsule: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 12,
		marginTop: 5,
	},
	txtRoleCapsule: {
		fontSize: 14,
	},
	arrow: {
		marginLeft: 8,
	},
	vwRoleDropdown: {
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
		width: Dimensions.get("window").width * 0.4,
		paddingLeft: 5,
		paddingVertical: 3,
	},
	vwDropdownOptionCapsuleSelected: {
		backgroundColor: "#806181",
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
		width: "100%",
		padding: 20,
		paddingBottom: 50,
	},
	vwRemoveUserButtonContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		gap: 10,
	},
	btnRemoveUser: {
		padding: 10,
	},
});