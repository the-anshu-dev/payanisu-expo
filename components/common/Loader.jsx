import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import walk from "../../assets/walk.gif";

const { width, height } = Dimensions.get("window");

const Loader = () => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <View style={styles.container}>
        <ActivityIndicator size={"large"} color={"green"} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default Loader;
