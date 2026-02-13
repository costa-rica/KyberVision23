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

interface ModalTeamYesNoProps {
  onPressYes: () => void;
}

export default function ModalTeamYesNo({ onPressYes }: ModalTeamYesNoProps) {
  const teamReducer = useSelector((state: RootState) => state.team);
  
  return (
    <View style={styles.modalContent}>
      <Text style={styles.txtModalTitle}>
        Are you sure you want to delete this player ?
      </Text>
      <View style={styles.vwVideoDetails}>
        <Text>
          Remove: {teamReducer.selectedPlayerObject?.firstName}{" "}
          {teamReducer.selectedPlayerObject?.lastName}
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