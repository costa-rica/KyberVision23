import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  TextStyle,
  ListRenderItem,
} from "react-native";
import ScreenFrameWithTopChildrenSmall from "../../components/screen-frames/ScreenFrameWithTopChildrenSmall";
import ModalInformationOk from "../../components/modals/ModalInformationOk";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { updateTeamsArray, Team } from "../../reducers/team";
import {
  updateUploadReducerSelectedVideoObject,
  updateUploadReducerLoading,
  updateUploadReducerDeleteVideoObject,
  SelectedVideoObject,
  DeleteVideoObject,
} from "../../reducers/upload";
import * as ImagePicker from "expo-image-picker";
import ButtonKvNoDefault from "../../components/buttons/ButtonKvNoDefault";
import ButtonKvNoDefaultTextOnly from "../../components/buttons/ButtonKvNoDefaultTextOnly";
import ModalUploadVideo from "../../components/modals/ModalUploadVideo";
import ModalUploadVideoYesNo from "../../components/modals/ModalUploadVideoYesNo";
import { RootState } from "../../types/store";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { VideoObject } from "../../reducers/review";

type UploadVideoProps = NativeStackScreenProps<RootStackParamList, "UploadVideo">;

interface UserVideo {
  id: number;
  filename: string;
  session: {
    id: number;
    sessionDate: string;
  };
  selected?: boolean;
}

interface UserVideosApiResponse {
  videosArray: UserVideo[];
  error?: string;
}

export default function UploadVideo({ navigation }: UploadVideoProps) {
  const userReducer = useSelector((state: RootState) => state.user);
  const uploadReducer = useSelector((state: RootState) => state.upload);
  const teamReducer = useSelector((state: RootState) => state.team);
  const [displayTeamList, setDisplayTeamList] = useState(false);
  const dispatch = useDispatch();
  const [selectedVideosArray, setSelectedVideosArray] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isVisibleModalUploadVideo, setIsVisibleModalUploadVideo] = useState(false);
  const [isVisibleModalDeleteVideo, setIsVisibleModalDeleteVideo] = useState(false);
  const [userVideosArray, setUserVideosArray] = useState<UserVideo[]>([]);
  const [containerBottomExpanded, setContainerBottomExpanded] = useState(false);
  const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({
    title: "",
    message: "",
    variant: "info" as "info" | "success" | "error" | "warning",
  });

  useEffect(() => {
    fetchUserVideosArray();
  }, []);

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
                {teamReducer.teamsArray.map((tribe) => (
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
                  ?.teamName || "No tribe selected"}
              </Text>
            )}
          </View>
          <View style={styles.vwRightCapsule}>
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
          </View>
        </View>
      </View>
    </View>
  );

  const handleSelectVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setInfoModalContent({
        title: "Permission denied",
        message: "We need access to your media.",
        variant: "warning",
      });
      setIsVisibleInfoModal(true);
      return;
    }
    
    dispatch(updateUploadReducerLoading(true));
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const assets = result.assets || [];
      setSelectedVideosArray((prev) => [...prev, ...assets]);
    }
    
    dispatch(updateUploadReducerLoading(false));
  };

  const fetchUserVideosArray = async () => {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/videos/user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userReducer.token}`,
        },
      }
    );

    console.log("Received response:", response.status);

    let resJson: UserVideosApiResponse | null = null;
    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      resJson = await response.json();
    }

    if (response.ok && resJson) {
      console.log(`response ok`);
      const tempArray = resJson.videosArray.map((item) => ({
        ...item,
        selected: false,
      }));
      console.log(`Count of videos: ${tempArray.length}`);
      setUserVideosArray(tempArray);
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
  };

  const handleSendVideo = async (video: SelectedVideoObject) => {
    console.log(" --- > in handleSendVideo");
    dispatch(updateUploadReducerLoading(true));
    
    const formData = new FormData();
    console.log(" --- [2]");
    
    formData.append("video", {
      uri: video.uri,
      name: video.fileName || "video.mp4",
      type: "video/mp4",
    } as any);

    if (uploadReducer.uploadReducerModalUploadVideoSelectedSessionObject) {
      formData.append(
        "sessionId",
        uploadReducer.uploadReducerModalUploadVideoSelectedSessionObject.id.toString()
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 120 sec timeout
    
    console.log("uploading ... ");
    console.log(
      "---> sessionId: ",
      uploadReducer.uploadReducerModalUploadVideoSelectedSessionObject?.id
    );
    console.log(`formData: `, formData);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/videos/upload-youtube`,
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${userReducer.token}`,
          },
        }
      );
      
      clearTimeout(timeout);
      const data = await response.json();
      console.log("Upload response:", data);
      dispatch(updateUploadReducerLoading(false));
      setIsVisibleModalUploadVideo(false);
      setInfoModalContent({
        title: "Success",
        message: "Video sent successfully!",
        variant: "success",
      });
      setIsVisibleInfoModal(true);
    } catch (error) {
      clearTimeout(timeout);
      console.error("Upload error:", error);
      dispatch(updateUploadReducerLoading(false));
      setInfoModalContent({
        title: "Error",
        message: "Failed to send video.",
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }
  };

  const handleDeleteVideo = async () => {
    console.log("---- > handleDeleteVideo");
    
    if (!uploadReducer.uploadReducerDeleteVideoObject) return;
    
    const fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/videos/${uploadReducer.uploadReducerDeleteVideoObject.id}`;
    console.log("fetchUrl: ", fetchUrl);
    console.log("userReducer.token: ", userReducer.token);
    
    const response = await fetch(fetchUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userReducer.token}`,
      },
    });
    
    if (response.status === 200) {
      fetchUserVideosArray();
      const resJson = await response.json();
      setInfoModalContent({
        title: "Success",
        message: resJson.message,
        variant: "success",
      });
      setIsVisibleInfoModal(true);
      setIsVisibleModalDeleteVideo(false);
    } else {
      setInfoModalContent({
        title: "Error",
        message: `There was a server error: ${response.status}`,
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }
  };

  const whichModalToDisplay = () => {
    if (isVisibleModalUploadVideo) {
      return {
        modalComponent: <ModalUploadVideo handleSendVideo={handleSendVideo} />,
        useState: isVisibleModalUploadVideo,
        useStateSetter: () => setIsVisibleModalUploadVideo(false),
      };
    }

    if (isVisibleModalDeleteVideo) {
      return {
        modalComponent: <ModalUploadVideoYesNo onPressYes={handleDeleteVideo} />,
        useState: isVisibleModalDeleteVideo,
        useStateSetter: () => setIsVisibleModalDeleteVideo(false),
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

  const renderSelectedVideoItem: ListRenderItem<ImagePicker.ImagePickerAsset> = ({ item }) => (
    <ButtonKvNoDefault
      onPress={() => {
        console.log("Select Video");
        const videoObject: SelectedVideoObject = {
          uri: item.uri,
          fileName: item.fileName || "video.mp4",
          duration: item.duration || 0,
          fileSize: item.fileSize || 0,
          height: item.height,
          width: item.width,
        };
        dispatch(updateUploadReducerSelectedVideoObject(videoObject));
        setIsVisibleModalUploadVideo(true);
      }}
      styleView={styles.btnVideoItem}
      styleText={styles.txtVideoItem}
    >
      <Text style={styles.txtVideoItemFilename}>{item.fileName}</Text>
      <Text style={styles.txtVideoItemShort}>
        {item.duration ? (item.duration / 1000).toFixed(0) : "0"}
      </Text>
      <Text style={styles.txtVideoItemShort}>
        {item.fileSize
          ? (item.fileSize / 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          : "0"}
      </Text>
      <Text style={styles.txtVideoItemDimensions}>
        {item.height} x {item.width}
      </Text>
    </ButtonKvNoDefault>
  );

  const renderUserVideoItem: ListRenderItem<UserVideo> = ({ item }) => (
    <View style={styles.vwUserVideoItem}>
      <Text style={styles.txtVideoItemFilename}>{item.filename}</Text>
      <Text>
        {new Date(item.session.sessionDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })}{" "}
        {new Date(item.session.sessionDate).toLocaleTimeString("en-GB", {
          hour: "2-digit",
        })}
        h
      </Text>

      <ButtonKvNoDefault
        onPress={() => {
          console.log("Delete video", item.id);
          const deleteVideoObject: DeleteVideoObject = {
            id: item.id,
            filename: item.filename,
            session: item.session,
          };
          dispatch(updateUploadReducerDeleteVideoObject(deleteVideoObject));
          setIsVisibleModalDeleteVideo(true);
        }}
        styleView={styles.btnDeleteVideo}
        styleText={styles.txtDeleteVideo}
      >
        <Text style={styles.txtDeleteVideo}>X</Text>
      </ButtonKvNoDefault>
    </View>
  );

  return (
    <ScreenFrameWithTopChildrenSmall
      navigation={navigation}
      topChildren={topChildren}
      screenName={"UploadVideoScreen"}
      modalComponentAndSetterObject={whichModalToDisplay()}
      topHeight={120}
    >
      <View style={styles.container}>
        <View style={styles.containerTop}>
          <ButtonKvNoDefaultTextOnly
            onPress={() => {
              console.log("Upload Video");
              handleSelectVideo();
            }}
            styleView={styles.btnSelectVideo}
            styleText={styles.txtSelectVideo}
          >
            Add new files from the Gallery
          </ButtonKvNoDefaultTextOnly>

          <View style={styles.vwVideoHeader}>
            <Text style={styles.txtVideoItemFilename}>Filename</Text>
            <Text style={styles.txtVideoItemShort}>Dur. (s)</Text>
            <Text style={styles.txtVideoItemShort}>Size (MB)</Text>
            <Text style={styles.txtVideoItemDimensions}>Dimensions</Text>
          </View>
          <View style={styles.underline} />
          <FlatList
            data={selectedVideosArray}
            keyExtractor={(item) => item.uri}
            renderItem={renderSelectedVideoItem}
          />
        </View>

        <View
          style={[
            styles.containerBottom,
            containerBottomExpanded && styles.containerBottomExpanded,
          ]}
        >
          <TouchableOpacity
            style={{ justifyContent: "center", alignItems: "center" }}
            onPress={() => setContainerBottomExpanded(!containerBottomExpanded)}
          >
            <Text> Videos Uploaded </Text>

            <View style={styles.vwVideoHeaderBottom}>
              <Text style={styles.txtVideoItemFilename}>Filename</Text>
              <Text style={styles.txtVideoItemShort}>Date</Text>
              <Text
                style={[styles.txtVideoItemShort, { textAlign: "right" }]}
              ></Text>
            </View>

            <View style={styles.underline} />
          </TouchableOpacity>

          <View style={styles.vwUserVideoList}>
            <FlatList
              data={userVideosArray}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUserVideoItem}
            />
          </View>
        </View>
      </View>
    </ScreenFrameWithTopChildrenSmall>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  } as ViewStyle,

  // ----- TOP Children -----
  vwTopChildren: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  } as ViewStyle,

  txtTopChildSelectedTribeName: {
    color: "white",
    fontSize: 20,
  } as TextStyle,
  vwCapsuleSuper: {
    position: "relative",
    width: Dimensions.get("window").width * 0.8,
    height: 50,
  } as ViewStyle,
  vwCapsule: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#806181",
    borderRadius: 10,
    padding: 5,
  } as ViewStyle,
  vwCapsuleExpanded: {
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
  } as ViewStyle,
  vwLeftCapsule: {
    width: "80%",
  } as ViewStyle,
  vwLeftCapsuleExpanded: {
    width: Dimensions.get("window").width * 0.8,
    height: "100%",
    position: "absolute",
    top: 0,
    zIndex: 1,
    backgroundColor: "#C0A9C0",
  } as ViewStyle,
  txtDropdownTopChildTeamName: {
    color: "white",
    fontSize: 20,
  } as TextStyle,
  vwDropdownList: {
    padding: 5,
    width: "100%",
    height: "100%",
  } as ViewStyle,
  vwRightCapsule: {
    height: "100%",
  } as ViewStyle,
  vwTeamRow: {} as ViewStyle,
  btnSelectTribe: {} as ViewStyle,

  // ------------
  // TOP
  // ------------
  containerTop: {
    flex: 1,
    width: Dimensions.get("window").width,
    alignItems: "center",
    paddingVertical: 10,
  } as ViewStyle,
  vwVideoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: 10,
    width: Dimensions.get("window").width * 0.9,
  } as ViewStyle,
  underline: {
    height: 1,
    backgroundColor: "#ccc",
    width: Dimensions.get("window").width * 0.9,
    alignSelf: "center",
    marginBottom: 5,
  } as ViewStyle,
  txtVideoItemFilename: {
    width: Dimensions.get("window").width * 0.3,
    color: "black",
    fontSize: 11,
  } as TextStyle,

  txtVideoItemShort: {
    width: Dimensions.get("window").width * 0.1,
    color: "black",
    fontSize: 11,
  } as TextStyle,
  txtVideoItemDimensions: {
    width: Dimensions.get("window").width * 0.2,
    color: "black",
    fontSize: 11,
  } as TextStyle,
  btnVideoItem: {
    backgroundColor: "#E8E8E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
    marginVertical: 5,
    width: Dimensions.get("window").width * 0.9,
    borderColor: "#806181",
    borderWidth: 1,
  } as ViewStyle,
  txtVideoItem: {} as TextStyle,
  vwVideoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    marginVertical: 5,
    width: Dimensions.get("window").width * 0.9,
    borderColor: "#806181",
    borderWidth: 1,
  } as ViewStyle,

  // ------------
  // BOTTOM
  // ------------
  containerBottom: {
    height: "10%",
    alignItems: "center",
    backgroundColor: "#FDFDFD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  } as ViewStyle,
  containerBottomExpanded: {
    height: "60%",
  } as ViewStyle,

  vwVideoHeaderBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: 10,
    width: Dimensions.get("window").width * 0.9,
  } as ViewStyle,

  vwUserVideoList: {
    flex: 1,
    width: Dimensions.get("window").width,
    alignItems: "center",
    paddingVertical: 10,
  } as ViewStyle,
  btnSelectVideo: {
    width: Dimensions.get("window").width * 0.8,
    backgroundColor: "#806181",
    fontSize: 24,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35,
  } as ViewStyle,
  txtSelectVideo: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  } as TextStyle,

  vwUserVideoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    marginVertical: 5,
    width: Dimensions.get("window").width * 0.9,
    borderColor: "#806181",
    borderWidth: 1,
  } as ViewStyle,

  btnDeleteVideo: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  } as ViewStyle,

  txtDeleteVideo: {
    color: "gray",
    fontWeight: "bold",
    fontSize: 16,
  } as TextStyle,

  // ------------
  // Modal
  // ------------

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as ViewStyle,

  modalContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  } as ViewStyle,
});