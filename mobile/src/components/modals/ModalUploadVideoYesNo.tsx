import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ViewStyle,
  TextStyle,
} from "react-native";
import ButtonKvStd from "../buttons/ButtonKvStd";
import { useSelector } from "react-redux";
import { RootState } from "../../types/store";

interface ModalUploadVideoYesNoProps {
  onPressYes: () => void;
}

export default function ModalUploadVideoYesNo({ onPressYes }: ModalUploadVideoYesNoProps) {
  const uploadReducer = useSelector((state: RootState) => state.upload);
  
  return (
    <View style={styles.modalContent}>
      <Text style={styles.txtModalTitle}>
        Are you sure you want to delete this video?
      </Text>
      <View style={styles.vwVideoDetails}>
        <Text>
          filename: {uploadReducer.uploadReducerDeleteVideoObject?.filename}
        </Text>
        <Text>video ID: {uploadReducer.uploadReducerDeleteVideoObject?.id}</Text>
        <Text>
          session date:{" "}
          {uploadReducer.uploadReducerDeleteVideoObject?.session.sessionDate &&
            new Date(
              uploadReducer.uploadReducerDeleteVideoObject.session.sessionDate
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}{" "}
          {uploadReducer.uploadReducerDeleteVideoObject?.session.sessionDate &&
            new Date(
              uploadReducer.uploadReducerDeleteVideoObject.session.sessionDate
            ).toLocaleTimeString("en-GB", {
              hour: "2-digit",
            })}
          h
        </Text>
        <Text>
          Session ID: {uploadReducer.uploadReducerDeleteVideoObject?.session.id}
        </Text>
      </View>

      <View style={styles.vwButtons}>
        <ButtonKvStd
          onPress={() => {
            console.log("Yes ....");
            onPressYes();
          }}
        >
          Yes
        </ButtonKvStd>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").height * 0.3,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    padding: 10,
  } as ViewStyle,
  txtModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  } as TextStyle,
  vwVideoDetails: {
    width: "100%",
    marginBottom: 20,
  } as ViewStyle,
  vwButtons: {} as ViewStyle,
});