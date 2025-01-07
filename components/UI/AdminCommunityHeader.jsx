import { View, Text } from "react-native";
import React from "react";
import CustomBackButton from "./CustomBackButton";

const AdminCommunityHeader = ({ title }) => {
  return (
    <View className="top-10 bg-white h-16 shadow-sm shadow-black/20 flex flex-row justify-start">
      <View className="flex flex-row justify-start items-center space-x-3 pt-3 pl-3 ">
        <CustomBackButton icon="chevron-back-outline" />
        <Text className="text-lg font-semibold tracking-wider text-green-700">
          {title}
        </Text>
      </View>
    </View>
  );
};

export default AdminCommunityHeader;
