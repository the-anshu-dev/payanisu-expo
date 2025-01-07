import { View } from "react-native";
import React from "react";
import { Image } from "expo-image";

const CarouselImageRender = ({ item }) => {
  return (
    <View className="w-full h-full ">
      <Image source={{ uri: item }} className="h-full w-full object-cover" />
    </View>
  );
};

export default CarouselImageRender;
