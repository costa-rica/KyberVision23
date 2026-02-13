import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  ViewStyle,
  TextStyle,
  ListRenderItem,
} from "react-native";
import ButtonKvStd from "../buttons/ButtonKvStd";
import ButtonKvNoDefault from "../buttons/ButtonKvNoDefault";
import { useSelector, useDispatch } from "react-redux";
import { updateUploadReducerModalUploadVideoSelectedSessionObject } from "../../reducers/upload";
import { RootState } from "../../types/store";
import { Session } from "../../reducers/script";
import { SelectedVideoObject } from "../../reducers/upload";

interface ModalUploadVideoProps {
  handleSendVideo: (video: SelectedVideoObject) => Promise<void>;
}

export default function ModalUploadVideo({ handleSendVideo }: ModalUploadVideoProps) {
  const scriptReducer = useSelector((state: RootState) => state.script);
  const uploadReducer = useSelector((state: RootState) => state.upload);
  const dispatch = useDispatch();

  const renderSessionItem: ListRenderItem<Session> = ({ item }) => (
    <ButtonKvNoDefault
      onPress={() =>
        dispatch(updateUploadReducerModalUploadVideoSelectedSessionObject(item))
      }
      styleView={styles.btnVideoItem}
    >
      <Text style={styles.txtVideoItemDate}>{item.sessionDateString}</Text>
      <Text style={styles.txtVideoItemCity}>{item.city}</Text>
      <Text style={styles.txtVideoItemSessionId}>{item.id}</Text>
    </ButtonKvNoDefault>
  );

  return (
    <View style={styles.modalContent}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Link video to session
      </Text>
      <View style={styles.vwSelectionDetails}>
        <View style={{ flexDirection: "row" }}>
          <Text>Uploading:</Text>
          <Text
            style={{ backgroundColor: "#E8E8E8", borderRadius: 5, padding: 2 }}
          >
            {uploadReducer.uploadReducerSelectedVideoObject?.fileName}
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 5 }}>
          <Text>To session ID:</Text>
          <Text
            style={{ backgroundColor: "#E8E8E8", borderRadius: 5, padding: 2 }}
          >
            {uploadReducer.uploadReducerModalUploadVideoSelectedSessionObject?.id}
          </Text>
        </View>
      </View>
      <View style={styles.vwVideoHeader}>
        <Text style={styles.txtVideoItemDate}>Date</Text>
        <Text style={styles.txtVideoItemCity}>City</Text>
        <Text style={styles.txtVideoItemSessionId}>Session ID</Text>
      </View>
      <View style={styles.underline} />
      <FlatList
        data={scriptReducer.sessionsArray}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSessionItem}
      />

      <View style={styles.vwButtons}>
        <ButtonKvStd
          onPress={() => {
            console.log("uploading [ModalUploadVideo] ....");
            if (uploadReducer.uploadReducerSelectedVideoObject) {
              handleSendVideo(uploadReducer.uploadReducerSelectedVideoObject);
            }
          }}
        >
          Upload
        </ButtonKvStd>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    width: Dimensions.get("window").width * 0.95,
    height: Dimensions.get("window").height * 0.5,
    padding: 2,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  } as ViewStyle,
  vwSelectionDetails: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: 10,
  } as ViewStyle,
  vwVideoHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    marginTop: 10,
    width: Dimensions.get("window").width * 0.8,
  } as ViewStyle,
  underline: {
    height: 1,
    backgroundColor: "#ccc",
    width: Dimensions.get("window").width * 0.9,
    alignSelf: "center",
    marginBottom: 5,
  } as ViewStyle,
  txtVideoItemDate: {
    width: Dimensions.get("window").width * 0.3,
    color: "black",
    fontSize: 11,
  } as TextStyle,
  txtVideoItemCity: {
    width: Dimensions.get("window").width * 0.3,
    color: "black",
    fontSize: 11,
  } as TextStyle,
  txtVideoItemSessionId: {
    width: Dimensions.get("window").width * 0.2,
    color: "black",
    fontSize: 11,
    textAlign: "center",
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
    width: "100%",
    borderColor: "#806181",
    borderWidth: 1,
  } as ViewStyle,
  vwButtons: {} as ViewStyle,
});