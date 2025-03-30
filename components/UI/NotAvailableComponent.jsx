import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { height } from "../../constants/Styles";

const NotAvailableComponent = ({ text, iconName, iconSize = 48 }) => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <View style={styles.container}>
        <View>
          <Ionicons name={iconName} size={iconSize} />
        </View>
        <Text style={styles.text}>{text}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.5,
    width: "100%",
  },
  text: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
});

export default NotAvailableComponent;
