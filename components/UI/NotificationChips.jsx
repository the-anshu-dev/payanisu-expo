import { View, Text, Dimensions } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

const NotificationChips = ({ title, onPress, value, selectedValue }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{
        width: width * 0.28,
        height: 30,
        borderRadius: 50,
        borderColor: "#228B22",
        borderWidth: 1,
        backgroundColor: selectedValue === value ? "#228B22" : "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
    >
      <View className="flex flex-row justify-center items-center">
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: selectedValue === value ? "white" : "#228B22",
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationChips;
