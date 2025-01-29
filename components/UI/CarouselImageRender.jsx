import { View } from "react-native";
import React from "react";
import { Image } from "expo-image";

const CarouselImageRender = ({ item }) => {
  return (
    <View style={{ height: "100%", width: "100%" }}>
      <Image source={{ uri: item }} style={{ height: "100%", width: "100%" }} contentFit="cover" />
    </View>
  );
};

export default CarouselImageRender;
