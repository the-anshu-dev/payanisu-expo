import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { shorten } from "./PostComponent";
import { apiRequest } from "../../utils/helpers";
import { useSelector } from "react-redux";

const Notifications = ({ id, title, content, seen }) => {
  const { user } = useSelector((state) => state.user);

  const handleSeen = async () => {
    const userEmail = user.email;
    try {
      await apiRequest(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/update`,
        "POST",
        { email: userEmail, notificationId: id }
      );
    } catch (error) {
      console.log("Failed to update", error);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handleSeen}>
      <View
        className={`border-2 border-green-600 h-fit rounded-lg p-2 mt-3 relative`}
      >
        {seen === false && (
          <View className="h-2 w-2 bg-red-600  absolute right-2 top-2 rounded-full" />
        )}
        <View className="flex flex-row justify-start items-center space-x-3">
          <FontAwesome6 name="bell" size={20} color={"green"} />
          <Text className={`text-base font-semibold `}>{title}</Text>
        </View>
        {content && (
          <View className="mt-2">
            <Text className={`tracking-wide text-justify `}>
              {shorten(content, 160)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Notifications;
