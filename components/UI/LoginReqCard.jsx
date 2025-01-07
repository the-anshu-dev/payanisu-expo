import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";

const LoginReqCard = () => {
  return (
    <View className="h-full w-full flex justify-center items-center">
      <View className="h-[300px] w-[300px] shadow-xl shadow-black/80 bg-white rounded-lg flex justify-center items-center">
        <TouchableOpacity onPress={() => router.push("/login")} activeOpacity={0.8}>
          <View className="bg-green-700 px-8 py-2 rounded-lg">
            <Text className="text-white text-base font-semibold">Log In</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginReqCard;
