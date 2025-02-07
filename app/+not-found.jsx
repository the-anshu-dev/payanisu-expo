import { View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import walk from "../assets/walk.gif";

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["bottom", "left", "right", "top"]}>
      <View className="h-screen w-full items-center justify-center">
        <Image source={walk} style={{ height: 200, width: 200 }} />
      </View>
    </SafeAreaView>
  );
}
