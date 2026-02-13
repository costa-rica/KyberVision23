import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState } from "react";
import ButtonKvStd from "../buttons/ButtonKvStd";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../types/store";
import { updateSessionsArray } from "../../reducers/script";

interface ModalCreateSessionProps {
  isVisibleModalCreateSession: boolean;
  setIsVisibleModalCreateSession: (visible: boolean) => void;
}

export default function ModalCreateSession({
  isVisibleModalCreateSession,
  setIsVisibleModalCreateSession,
}: ModalCreateSessionProps) {
  const userReducer = useSelector((state: RootState) => state.user);
  const scriptReducer = useSelector((state: RootState) => state.script);
  const teamReducer = useSelector((state: RootState) => state.team);
  const dispatch = useDispatch<AppDispatch>();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessionCity, setSessionCity] = useState("");

  const onChangeDate = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const onChangeTime = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleCreateSession = async () => {
    const teamId = teamReducer.teamsArray.filter((team) => team.selected)[0]?.id;

    if (!teamId) {
      Alert.alert("Error", "No team selected.");
      return;
    }

    const combinedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    const sessionDate = combinedDateTime.toISOString();

    const bodyObj = {
      teamId,
      sessionDate,
      sessionName,
      sessionCity,
    };

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/sessions/create`,
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
      const contentType = response.headers.get("Content-Type");

      if (contentType?.includes("application/json")) {
        const resJson = await response.json();
        if (resJson.result) {
          Alert.alert("Success", "Session created successfully");
          const tempArray = [...scriptReducer.sessionsArray];
          tempArray.push({
            ...resJson.sessionNew,
            selected: false,
          });
          dispatch(updateSessionsArray(tempArray));
          setIsVisibleModalCreateSession(false);
        } else {
          Alert.alert("Error", `Failed to create session: ${resJson.error}`);
        }
      } else {
        console.warn("Unexpected response type");
        Alert.alert("Error", "Unexpected response type");
      }
    } catch (error) {
      console.error("❌ Failed to create session:", error);
      Alert.alert("Error", `Failed to create session: ${error}`);
    }
  };

  return (
    <View style={styles.modalWrapper}>
      <View style={styles.modalContent}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>
          Enter session details:
        </Text>
        <View style={styles.vwTxtInputGroup}>
          <Text style={styles.txtInputLabel}>Name: </Text>
          <TextInput
            placeholder="practice session name..."
            placeholderTextColor="gray"
            value={sessionName}
            onChangeText={(text) => setSessionName(text)}
            style={styles.txtInput}
          />
        </View>
        <View style={styles.vwTxtInputGroup}>
          <Text style={styles.txtInputLabel}>City: </Text>
          <TextInput
            placeholder="Aix-en-Provence"
            placeholderTextColor="gray"
            value={sessionCity}
            onChangeText={(text) => setSessionCity(text)}
            style={styles.txtInput}
          />
        </View>

        <View style={styles.vwDateTimeTouchOpacityWrapper}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.btnDatePicker}
          >
            <Text>
              {selectedDate.toLocaleDateString("fr-FR", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChangeDate}
            />
          )}
        </View>
        <View style={styles.vwDateTimeTouchOpacityWrapper}>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={{
              borderColor: "#806181",
              borderWidth: 1,
              borderRadius: 5,
              padding: 10,
            }}
          >
            <Text>
              {selectedTime.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeTime}
              is24Hour={true}
            />
          )}
        </View>
        <View style={styles.vwButtons}>
          <ButtonKvStd onPress={() => setIsVisibleModalCreateSession(false)}>
            Cancel
          </ButtonKvStd>
          <ButtonKvStd onPress={() => handleCreateSession()}>
            Create
          </ButtonKvStd>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: Dimensions.get("window").width * 0.9,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    gap: 20,
  },
  vwTxtInputGroup: {
    flexDirection: "row",
    width: "100%",
    gap: 5,
    alignItems: "center",
  },
  txtInputLabel: {
    fontSize: 16,
  },
  txtInput: {
    flex: 1,
    borderColor: "#806181",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  vwDateTimeTouchOpacityWrapper: {
    width: "100%",
  },
  btnDatePicker: {
    borderColor: "#806181",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  vwButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
});