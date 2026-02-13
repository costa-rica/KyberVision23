import React, { useState, useEffect } from "react";
import type { SplashScreenProps } from "../../types/navigation";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import ScreenFrame from "../../components/screen-frames/ScreenFrame";
import ButtonKvStd from "../../components/buttons/ButtonKvStd";
import ButtonKvImage from "../../components/buttons/ButtonKvImage";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../types/store";
import { loginUser, logoutUser } from "../../reducers/user";
import { userReducerOffline } from "../../data/userReducerOffline";
import ModalInformationYesOrNo from "../../components/modals/ModalInformationYesOrNo";
import ModalInformationOk from "../../components/modals/ModalInformationOk";
// import {
// 	GoogleSignin,
// 	isSuccessResponse,
// 	isErrorWithCode,
// 	statusCodes,
// } from "@react-native-google-signin/google-signin";
// ✅ NEW: import from the safe wrapper
import {
  googleHasPlayServices,
  googleSignIn,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
  IS_EXPO_GO,
} from "../../components/google/googleSignIn";

export default function Splash({ navigation }: SplashScreenProps) {
  const dispatch = useDispatch();
  const userReducer = useSelector((state: RootState) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisibleYesOrNoModal, setIsVisibleYesOrNoModal] = useState(false);
  const [yesOrNoModalContent, setYesOrNoModalContent] = useState({
    title: "",
    message: "",
    onYes: () => {},
    noButtonText: "No",
  });
  const [isVisibleInfoModal, setIsVisibleInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({
    title: "",
    message: "",
    variant: "info" as "info" | "success" | "error" | "warning",
  });

  const handleLoginGuestOffline = () => {
    console.log("Guest login");

    dispatch(
      loginUser({
        userId: userReducerOffline.user.id,
        email: userReducerOffline.user.email,
        token: userReducerOffline.token,
        username: userReducerOffline.user.username,
      })
    );
    navigation.navigate("SelectTeam");
  };

  useEffect(() => {
    console.log(
      `EXPO_PUBLIC_API_BASE_URL: ${process.env.EXPO_PUBLIC_API_BASE_URL}`
    );

    if (userReducer.token) {
      navigation.navigate("SelectTeam");
    }
  }, [userReducer.token, navigation]);

  const handleUserClickGoogleSignIn = async () => {
    setYesOrNoModalContent({
      title: "Google Sign In",
      message:
        "By clicking Yes, you agree that Kyber Vision will store your Google email and name in our database. Your password will NOT be stored.",
      onYes: () => {
        setIsVisibleYesOrNoModal(false);
        handleGoogleSignIn();
      },
      noButtonText: "Cancel",
    });
    setIsVisibleYesOrNoModal(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await googleHasPlayServices();
      const response = await googleSignIn();

      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        const { name, email } = user;
        const safeName = name ?? email.split("@")[0];
        await requestRegisterOrLoginGoogle(email, safeName);
      } else {
        // User likely cancelled
        console.log("Google Sign In: user cancelled");
      }
    } catch (error: any) {
      console.error(`Google Sign In error:`, error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes?.IN_PROGRESS:
            setInfoModalContent({
              title: "Google Sign In",
              message: "User is already signing in",
              variant: "info",
            });
            setIsVisibleInfoModal(true);
            break;
          case statusCodes?.PLAY_SERVICES_NOT_AVAILABLE:
            setInfoModalContent({
              title: "Google Sign In",
              message: "Play Services not available",
              variant: "error",
            });
            setIsVisibleInfoModal(true);
            break;
          case statusCodes?.SIGN_IN_CANCELLED:
            setInfoModalContent({
              title: "Google Sign In",
              message: "User cancelled the sign in",
              variant: "info",
            });
            setIsVisibleInfoModal(true);
            break;
          case "EXPO_GO_UNSUPPORTED":
            setInfoModalContent({
              title: "Google Sign In",
              message: "Not available in Expo Go. Use a dev client or a build.",
              variant: "warning",
            });
            setIsVisibleInfoModal(true);
            break;
          default:
            setInfoModalContent({
              title: "Google Sign In",
              message: String(error.code ?? "Unknown error"),
              variant: "error",
            });
            setIsVisibleInfoModal(true);
            break;
        }
      } else {
        setInfoModalContent({
          title: "Google Sign In",
          message: "An unexpected error occurred during Google Sign-In.",
          variant: "error",
        });
        setIsVisibleInfoModal(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestRegisterOrLoginGoogle = async (email: string, name: string) => {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/users/register-or-login-via-google`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username: name }),
      }
    );

    console.log(
      "Received response [requestRegisterOrLoginGoogle]:",
      response.status
    );

    let resJson: any = null;
    const contentType = response.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      resJson = await response.json();
    }

    if (response.status === 200 && resJson) {
      dispatch(
        loginUser({
          userId: resJson.user.id,
          email: resJson.user.email,
          token: resJson.token,
          username: resJson.user.email.split("@")[0],
        })
      );
      navigation.navigate("Home");
    } else if (resJson?.error) {
      console.log(
        "Received response [requestRegisterOrLoginGoogle]:",
        resJson.error
      );
      setInfoModalContent({
        title: "There was a KV server error while signing in with Google",
        message: resJson.error,
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    } else {
      setInfoModalContent({
        title: "There was a KV server error while signing in with Google",
        message: "An unknown error occurred",
        variant: "error",
      });
      setIsVisibleInfoModal(true);
    }
  };

  const whichModalToDisplay = () => {
    if (isVisibleYesOrNoModal) {
      return {
        modalComponent: (
          <ModalInformationYesOrNo
            title={yesOrNoModalContent.title}
            message={yesOrNoModalContent.message}
            onYes={yesOrNoModalContent.onYes}
            onNo={() => setIsVisibleYesOrNoModal(false)}
            onClose={() => setIsVisibleYesOrNoModal(false)}
            noButtonText={yesOrNoModalContent.noButtonText}
          />
        ),
        useState: isVisibleYesOrNoModal,
        useStateSetter: setIsVisibleYesOrNoModal,
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

    return undefined;
  };

  return (
    <ScreenFrame modalComponentAndSetterObject={whichModalToDisplay()}>
      <View style={styles.container}>
        {/* -------- TOP ----- */}
        <View style={styles.containerTop}>
          {/* <Text style={{ color: "gray" }}>
						API: {process.env.EXPO_PUBLIC_API_BASE_URL}
					</Text> */}
          <View style={styles.vwEmailButtons}>
            <ButtonKvStd
              title="Register"
              onPress={() => {
                navigation.navigate("Register");
              }}
              style={styles.btnEmailRegister}
            >
              Email Register
            </ButtonKvStd>
            <ButtonKvStd
              title="Login"
              onPress={() => {
                if (userReducer.token) {
                  navigation.navigate("SelectTeam");
                } else {
                  navigation.navigate("Login");
                }
              }}
              style={styles.btnEmailLogin}
            >
              {userReducer.token ? "Select Squad" : "Email Login"}
            </ButtonKvStd>
            {userReducer.token && (
              <ButtonKvStd
                title="Logout"
                onPress={() => {
                  dispatch(logoutUser());
                }}
                style={styles.btnEmailLogin}
              >
                Logout
              </ButtonKvStd>
            )}
          </View>
          <View style={styles.vwLineContainer}>
            <View style={styles.vwLine} />
          </View>
          <View style={styles.vwOr}>
            <Text>or</Text>
          </View>
          {/* <View style={styles.vwSocials}>
						<ButtonKvImage
							onPress={handleUserClickGoogleSignIn}
							style={styles.btnGoogle}
							disabled={isSubmitting}
						>
							<Image
								source={require("../../assets/images/welcome/btnGoogle.png")}
							/>
						</ButtonKvImage>
					</View> */}
          {/* ✅ Google button now safe in all environments */}
          <View style={styles.vwSocials}>
            <ButtonKvImage
              onPress={handleUserClickGoogleSignIn}
              style={styles.btnGoogle}
              disabled={isSubmitting}
            >
              <Image
                source={require("../../assets/images/welcome/btnGoogle.png")}
              />
            </ButtonKvImage>
          </View>
          <View style={styles.vwLineContainer}>
            <View style={styles.vwLine} />
          </View>
        </View>
        <View style={styles.containerBottom}>
          <ButtonKvStd
            title="Guest signin"
            onPress={() => {
              console.log("Guest Login");
              handleLoginGuestOffline();
            }}
            style={styles.btnContinueWithoutLogin}
          >
            continue without login
          </ButtonKvStd>
          <Text style={{ position: "absolute", bottom: 20, right: 30 }}>
            Version 0.22.0
          </Text>
        </View>
      </View>
    </ScreenFrame>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },

  // ----- TOP -----
  containerTop: {
    flex: 1,
  },
  vwEmailButtons: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  btnEmailRegister: {
    width: Dimensions.get("window").width * 0.8,
    backgroundColor: "#806181",
    fontSize: 24,
    height: 50,
    justifyContent: "center",
  },
  btnEmailLogin: {
    width: Dimensions.get("window").width * 0.8,
    backgroundColor: "white",
    color: "#585858",
    fontSize: 24,
    borderColor: "#585858",
    borderWidth: 2,
    borderStyle: "solid",
    padding: 5,
    height: 50,
    justifyContent: "center",
  },

  vwLineContainer: {
    width: Dimensions.get("window").width,
    alignItems: "center",
  },
  vwLine: {
    width: "80%",
    borderColor: "#A3A3A3",
    borderWidth: 1,
    borderStyle: "solid",
  },
  vwOr: {
    width: Dimensions.get("window").width,
    alignItems: "center",
  },
  vwSocials: {
    width: Dimensions.get("window").width,
    alignItems: "center",
  },
  btnGoogle: {
    // width: Dimensions.get("window").width * 0.8,
    // backgroundColor: "#4285F4",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  containerBottom: {
    width: Dimensions.get("window").width,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContinueWithoutLogin: {
    width: Dimensions.get("window").width * 0.8,
    backgroundColor: "transparent",
    color: "#585858",
    justifyContent: "center",
  },
});
