import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  ViewStyle,
} from "react-native";
import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ButtonKvImage from "../buttons/ButtonKvImage";
import ButtonKvNoDefault from "../buttons/ButtonKvNoDefault";
import BackArrow from "../../assets/images/screen-frame/btnBackArrow.svg";
import { useNavigation } from "@react-navigation/native";
import KyberVisionLogoCrystal from "../../assets/images/welcome/Tribe.svg";
import { useSelector } from "react-redux";
import { RootState } from "../../types/store";

interface ScreenFrameWithTopChildrenSmallLandscapeProps {
  children: ReactNode;
  navigation: any;
  topChildren: ReactNode;
  sizeOfLogo?: number;
  topHeight?: number;
  screenName?: string;
  modalComponentAndSetterObject?: {
    modalComponent: ReactNode | null;
    useState: boolean;
    useStateSetter: () => void;
  };
  onBackPress?: () => Promise<boolean> | boolean;
}

export default function ScreenFrameWithTopChildrenSmallLandscape({
  children,
  navigation,
  topChildren,
  sizeOfLogo = 30,
  topHeight = 50,
  screenName,
  modalComponentAndSetterObject = {
    modalComponent: null,
    useState: false,
    useStateSetter: () => {},
  },
  onBackPress = () => true,
}: ScreenFrameWithTopChildrenSmallLandscapeProps) {
  const insets = useSafeAreaInsets();
  const handleBackPress = async () => {
    const goBack = await onBackPress();
    if (goBack) {
      navigation.goBack();
    }
  };

  const stylesContainerTop: ViewStyle = {
    position: "relative",
    height: topHeight,
    width: "100%",
  };

  const stylesVwTopChildren: ViewStyle = {
    backgroundColor: "#806181",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: topHeight,
  };

  const stylesVwButtonBackArrow: ViewStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    height: topHeight,
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  };

  const stylesVwLogo: ViewStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
    height: topHeight,
    paddingRight: 15,
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={stylesContainerTop}>
        <View style={stylesVwTopChildren}>
          {topChildren}
        </View>
        <View style={stylesVwButtonBackArrow}>
          <ButtonKvImage
            onPress={handleBackPress}
            style={styles.btnBackArrow}
          >
            <BackArrow style={{ width: 30, height: 30 }} />
          </ButtonKvImage>
        </View>
        <View style={stylesVwLogo}>
          <KyberVisionLogoCrystal style={{ width: sizeOfLogo, height: sizeOfLogo }} />
        </View>
      </View>
      <View style={styles.containerMain}>
        {children}
      </View>
      {modalComponentAndSetterObject.useState && modalComponentAndSetterObject.modalComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  containerMain: {
    flex: 1,
  },
  btnBackArrow: {
    margin: 0,
    padding: 0,
  },
});