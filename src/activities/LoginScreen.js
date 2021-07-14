import React, { useEffect } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text, View,
} from "react-native";
import { Button, IconButton, Menu, Provider, Snackbar, TextInput } from "react-native-paper";
import Modal from "react-native-modal";
import NetInfo from "@react-native-community/netinfo";

import { useNavigation } from "@react-navigation/native";
import { isAndroid, isIOS } from "../utils/device/DeviceInfo";

import auth from "@react-native-firebase/auth";
import { showMessage } from "../utils/device/toast/ToastMultiPlatform";
import CountriesList from "../modals/LoginScreen/CountriesList";
import PrivacyPolicy from "../modals/LoginScreen/PrivacyPolicy";
import { COLORS, FONTS } from "../config/Miscellaneous";
import LoadingIndicator from "../modals/CustomLoader/LoadingIndicator";
import OTPTextView from "../components/OtpView/OTPTextInput";


const LoginScreen = () => {

  /**
   * Checking if network is OK before sending SMS or catching and SnackBar Exception.
   * @type {Promise<NetInfoState>}
   */
  let isConnected = NetInfo.fetch().then(networkState => {
    isConnected = networkState.isConnected;
  });

  /**
   * Dummy NetInfoObserver
   */

  const addNetInfoObserver = () => {
    NetInfo.addEventListener(networkState => {
      console.info(networkState.details);
      console.info(networkState.type);
    });
  };

  useEffect(() => {
    addNetInfoObserver();
    setConfirmCode(!ConfirmCode);
    const LoginScreenTimerTask = setTimeout(() => {
      if (isConnected) {
        getCountryCodeFromApi();
      } else {
        setErrorSnackbarText("Please enable your Mobile Data or WiFi Network to can you access Moon Meet and Login");
        onToggleErrorSnackBar();
      }
    }, 500);
    return () => {
      clearTimeout(LoginScreenTimerTask);
    };
  }, []);

  const navigation = useNavigation();

  const [CountryText, CountrySetText] = React.useState("+");

  const [NumberText, NumberSetText] = React.useState("");


  const [PrivacyPolicyVisible, setPrivacyPolicyVisible] = React.useState(false);

  const [CountriesVisible, setCountriesVisible] = React.useState(false);

  const [MenuVisible, setMenuVisible] = React.useState(false);

  const openMenu = () => setMenuVisible(true);

  const closeMenu = () => setMenuVisible(false);

  /**
   *
   * @returns {boolean} allow SMS sending if country code and number is probably real
   */

  const isSMSSendingAcceptable = () => {
    return CountryText.length > 1 && NumberText.length > 4;
  };

  /**
   * Firebase Phone Auth Stuff
   */

  const [ConfirmCode, setConfirmCode] = React.useState(null);

  const [ReceivedCode, setReceivedCode] = React.useState("");

  /**
   * Loader stuff
   */
  const [LoaderVisible, setLoaderVisible] = React.useState(false);

  /**
   * function to send code to specific phone number.
   * @param {NaN, String} phoneNumber
   * @returns {Promise<void>}
   */

  async function signInWithPhoneNumber(phoneNumber) {
    const _sendCode = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirmCode(_sendCode);
  }

  /**
   * void to confirm code, else we handle a Toast Exception.
   * @returns {Promise<void>}
   */

  async function confirmCode() {
    try {
      await confirm.confirm(ReceivedCode);
    } catch (error) {
      showMessage("Invalid Code. + Error: " + error.toString(), true);
    }
  }

  /**
   * SnackBar Stuff
   */

  const [ErrorSnackbarText, setErrorSnackbarText] = React.useState(false);

  const [ErrorSnackBarVisible, setErrorSnackBarVisible] = React.useState(false);

  const onToggleErrorSnackBar = () => setErrorSnackBarVisible(!ErrorSnackBarVisible);

  const onDismissErrorSnackBar = () => setErrorSnackBarVisible(!ErrorSnackBarVisible);

  /**
   * get Country code from internet API
   * @return {NaN, String} data to {CountryText}
   */
  const getCountryCodeFromApi = () => {
    try {
      const ApiURL = "https://ipapi.co/country_calling_code";
      fetch(ApiURL).then(function(_countryDialCode) {
        return _countryDialCode.text();
      })
        .then(function(data) {
          CountrySetText(data);
        });
    } catch (e) {
      console.error(e);
    }
  };


  const _countryCodeOnFocus = () => {
    Keyboard.dismiss();
    setCountriesVisible(!CountriesVisible);
  };

  /**
   * changing Modal Visibility from CountriesList.js
   * @param {boolean} bool
   */
  const changeCountriesVisibility = (bool) => {
    setCountriesVisible(bool);
  };

  /**
   * changing Modal Visibility from PrivacyPolicy.js
   * @param {boolean} bool
   */
  const changePrivacyPolicyVisibility = (bool) => {
    setPrivacyPolicyVisible(bool);
  };

  /**
   * Loader stuff
   */

  const [LoaderText, setLoaderText] = React.useState("");

  /**
   * OTPTextInput Stuff
   */

  const [OTPCharSequence, setOTPCharSequence] = React.useState("");


  /**
   *
   * @param {NaN, String} data
   */

  const setData = (data) => {
    CountrySetText(data);
  };
  /**
   * Clean up NumberText
   * @param {NaN, String} text
   */
  const onNumberTextChange = (text) => {
    /**
     * Regex for removing crap characters in NumberText
     * @type {RegExp}
     * @private
     */
    let _regexNumberOnly = /[^0-9]/g;
    NumberSetText(text.replace(_regexNumberOnly, ""));
  };

  const DotsImage = require("../assets/images/dots.png");

  return (
    //////////////////////////// FIRST PART ////////////////////////////
    <KeyboardAvoidingView
      behavior={isIOS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle={"dark-content"} />
      <Provider>
        <View style={{
          alignItems: "flex-end",
        }}>
          <Menu
            visible={MenuVisible}
            onDismiss={closeMenu}
            anchor={<IconButton icon={DotsImage}
                                color={"#999999"}
                                size={24}
                                onPress={() => {
                                  openMenu();
                                }} />
            }>
            <Menu.Item onPress={() => {
              navigation.navigate("login_help");
            }} title="Help" />
          </Menu>
        </View>
        {!ConfirmCode ? (
            <SafeAreaView style={styles.container}>
              <View style={styles.top_bar}>
                <Text style={styles.top_text}>
                  Enter your phone number to
                  get started
                </Text>
              </View>
              <View style={{
                paddingLeft: "2%",
                paddingRight: "2%",
              }}>
                <Text style={{
                  color: COLORS.black,
                  fontSize: 16,
                  textAlign: "center",
                  paddingBottom: "4%",
                  opacity: 0.4,
                  fontFamily: FONTS.regular,
                }}>
                  You will receive a verification code, Carrier rates may apply.
                </Text>
              </View>
              <View style={{
                padding: "2%",
                flexDirection: "row",
                justifyContent: "center",
              }}>
                <TextInput style={{
                  width: "37%",
                  padding: "1%",
                }}
                           mode="outlined"
                           keyboardType={isAndroid ? "numeric" : "number-pad"}
                           label="Country Code"
                           value={CountryText}
                           onFocus={() => {
                             _countryCodeOnFocus();
                           }}
                           multiline={false}
                           theme={{
                             colors: {
                               text: COLORS.accentLight,
                               primary: COLORS.accentLight,
                               backgroundColor: COLORS.rippleColor,
                               placeholder: COLORS.darkGrey,
                               underlineColor: "#566193",
                               selectionColor: "#DADADA",
                               outlineColor: "#566193",
                             },
                           }}
                           onChangeText={CountryText => {
                             CountrySetText(CountryText);
                           }}
                />
                <Modal
                  style={{
                    margin: "5%",
                  }}
                  animationType={"slide"}
                  transparent={false}
                  visible={CountriesVisible}
                  onRequestClose={() => {
                    changeCountriesVisibility(!CountriesVisible);
                  }}>
                  <SafeAreaView style={{
                    flex: 1,
                    backgroundColor: COLORS.primaryLight,
                  }}>
                    <CountriesList
                      changeCountriesVisibility={changeCountriesVisibility}
                      setModalData={setData}
                    />
                  </SafeAreaView>
                </Modal>
                <TextInput style={{
                  width: "65%",
                  paddingRight: "2%",
                  paddingTop: "1%",
                }}
                           mode="outlined"
                           keyboardType={isAndroid ? "numeric" : "number-pad"}
                           label="Phone Number"
                           value={NumberText}
                           onFocus={() => {
                           }}
                           placeholder={"eg, +1 (566) 874 364"}
                           multiline={false}
                           theme={{
                             colors: {
                               text: COLORS.accentLight,
                               primary: COLORS.accentLight,
                               backgroundColor: COLORS.rippleColor,
                               placeholder: COLORS.darkGrey,
                               underlineColor: "#566193",
                               selectionColor: "#DADADA",
                               outlineColor: "#566193",
                             },
                           }}
                           onChangeText={NumberText => {
                             onNumberTextChange(NumberText);
                           }}
                />
              </View>
              <View style={{
                paddingLeft: "4%",
                paddingRight: "2%",
                position: "relative",
              }}>
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: 18,
                    opacity: 0.4,
                    fontFamily: FONTS.regular,
                  }}>
                  By signing up.
                </Text>
              </View>
              <View style={{
                flexDirection: "row",
                position: "relative",
                paddingLeft: "4%",
                paddingRight: "2%",
              }}>
                <Text style={{
                  color: COLORS.black,
                  fontSize: 18,
                  opacity: 0.4,
                  fontFamily: FONTS.regular,
                }}>You agree to the</Text>
                <Text style={{
                  color: COLORS.accentLight,
                  fontSize: 18,
                  fontFamily: FONTS.regular,
                }}
                      onPress={() => setPrivacyPolicyVisible(!PrivacyPolicyVisible)}> Terms of Service</Text>
              </View>
              <View style={{
                paddingTop: "4%",
                paddingLeft: "3%",
                paddingRight: "3%",
                position: "relative",
              }}>
                <Button
                  style={styles.SendCode}
                  uppercase={false}
                  color="#566193"
                  mode="contained"
                  onPress={() => {
                    Keyboard.dismiss();
                    if (isConnected) {
                      if (isSMSSendingAcceptable()) {
                        //TODO: Handle Code Sending
                        setLoaderVisible(!LoaderVisible);
                        //signInWithPhoneNumber(CountryText + NumberText)
                      } else {
                        setErrorSnackbarText("Please enter a valid Country Code and Phone Number");
                        onToggleErrorSnackBar();
                      }
                    } else {
                      setErrorSnackbarText("Please enable your Mobile Data or WiFi Network to can you access Moon Meet and Login");
                      onToggleErrorSnackBar();
                    }
                  }}>
                  Send Code
                </Button>
                <View style={{
                  padding: "3%",
                  flex: 1,
                }}>
                  <Modal
                    style={{
                      margin: "0%",
                    }}
                    animationType={"slide"}
                    transpaerent={true}
                    visible={LoaderVisible}
                    onRequestClose={() => {
                      setLoaderVisible(!LoaderVisible);
                    }}>
                    <LoadingIndicator
                      setLoaderText={"Loading..."}
                    />
                  </Modal>
                </View>
                <View style={{
                  padding: "3%",
                  flex: 1,
                }}>
                  <Modal
                    style={{
                      margin: "4%",
                    }}
                    animationType={"slide"}
                    transparent={false}
                    visible={PrivacyPolicyVisible}
                    onRequestClose={() => {
                      setPrivacyPolicyVisible(!PrivacyPolicyVisible);
                    }}>
                    <PrivacyPolicy
                      changePrivacyPolicyVisibility={changePrivacyPolicyVisibility}
                    />
                  </Modal>
                </View>
              </View>
              <Snackbar
                visible={ErrorSnackBarVisible}
                onDismiss={onDismissErrorSnackBar}
                duration={5000}
                action={{
                  label: "OK",
                  onPress: () => {
                    onDismissErrorSnackBar();
                  },
                }}
                theme={{
                  colors: {
                    onSurface: COLORS.redLightError,
                    accent: COLORS.white,
                  },
                }}
                style={{
                  margin: "4%",
                }}>
                {ErrorSnackbarText}
              </Snackbar>
            </SafeAreaView>
          ) :
          //////////////////////////// SECOND PART ////////////////////////////
          /**
           * Render ConfirmScreen when user is in ConfirmCode mode.
           */
          <SafeAreaView style={styles.container}>
            <View style={styles.top_bar}>
              <Text style={styles.top_text}>
                Enter the code that we sent to {" "}
                {CountryText + " " + NumberText}
              </Text>
            </View>
            <View style={{
              paddingLeft: "2%",
              paddingRight: "2%",
            }}>
              <OTPTextView
                inputCount={6}
                tintColor={COLORS.accentLight}
                offTintColor={COLORS.controlHighlight}
                containerStyle={styles.TextInputContainer}
                textInputStyle={styles.RoundedTextInput}
                handleTextChange={(text) => {
                  setOTPCharSequence(text)
                  addCodeObserver(text)
                }}
                keyboardType={'numeric'}/>
            </View>
            <View>
              <Text>
                WRONG NUMBER
              </Text>
            </View>
          </SafeAreaView>
        }
      </Provider>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
  },
  top_bar: {
    flexDirection: "row",
    paddingTop: "3%",
    paddingBottom: "3%",
    paddingLeft: "2%",
    paddingRight: "2%",
    justifyContent: "center",
  },
  divider: {
    width: "-1%",
    height: "1%",
    backgroundColor: COLORS.controlHighlight,
  },
  top_text: {
    position: "relative",
    fontSize: 28,
    paddingLeft: "3%",
    paddingRight: "3%",
    textAlign: "center",
    color: COLORS.accentLight,
    fontFamily: FONTS.regular,
  },
  SendCode: {
    position: "relative",
    textAlign: "center",
    fontSize: 22,
    fontFamily: FONTS.regular,
  },
  TextInputContainer: {
    marginBottom: 20,
  },
  RoundedTextInput: {
    borderRadius: 10,
    borderWidth: 4,
  },
});
export default LoginScreen;
