import React, { useState } from "react";
import { Alert, Button, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS, FONTS } from "../config/miscellaneous";
import Modal from "react-native-modal";

const RegisterScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <SafeAreaView nativeID={"container"} style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle={"dark-content"} />
      <View nativeID={"top_view"} style={styles.top_bar}>
        <Text nativeID={"top_text"} style={styles.top_text}>
          Sign Up
        </Text>
      </View>

      <View nativeID={"top_view_divider"} style={styles.divider}>
      </View>

      <View nativeID={"dummy_view"}>
      </View>
      <View nativeID={"country_holder"} style={styles.container}>
        <View style={styles.row}>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter your phone number"
            type="numeric"/>
        </View>
        <Button style={styles.submitBtn}
                title="Continue"
                onPress={() => setModalVisible(!modalVisible)} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.primary,

  },
  row: {
    flex: 1,
    flexDirection: "row",

  },
  phoneInput: {
    flex: 1,
    margin: 15,
    height: 40,
    width: "60%",
    borderColor: COLORS.accent,
    borderWidth: 1,
  },
  submitBtn: {
    color: "#566193",
  },
  top_bar: {
    flexDirection: "row",
    padding: 10,
  },
  divider: {
    width: -1,
    height: 1,
    backgroundColor: COLORS.controlHighlight,
  },
  top_text: {
    position: "relative",
    right: 0,
    fontSize: 20,
    color: COLORS.accent,
    fontFamily: FONTS.regular,
  },
  country_holder: {
    flexDirection: "row",
    padding: 16,
  },
  textCenter: {
    textAlign: "center",
    justifyContent: "center",
  },
  loginImg: {
    width: 200,
    height: 200,
  },

  dropDown: {
    margin: 15,
    height: 40,
    width: "40%",
    borderColor: COLORS.accent,
    borderWidth: 1,
  },

});

export default RegisterScreen;
