import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

const CustomBackButton = ({ icon }) => {
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.8}
      className={`mr-4 p-1`}
    >
      <Ionicons name={icon} size={24} color={"green"} />
    </TouchableOpacity>
  );
};

export default CustomBackButton;
