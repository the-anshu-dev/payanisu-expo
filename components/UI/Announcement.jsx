import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { shorten } from "./PostComponent";
import { FontAwesome6 } from "@expo/vector-icons";
import { format } from "date-fns";

const Announcement = ({ title, content, date }) => {
  return (
    <TouchableOpacity activeOpacity={0.9}>
      <View className="border-2 h-fit rounded-lg border-[#228B22]/20 p-2 mt-3">
        <View className="flex flex-row justify-start items-center gap-3">
          <FontAwesome6 name="bell" size={16} color={"#228B22"} />
          <Text className={`text-base font-semibold `}>{title}</Text>
        </View>
        <View className="mt-2">
          <Text className={`tracking-wide text-justify`}>
            {shorten(content, 160)}
          </Text>
        </View>
        <View className="mt-1">
          <Text className={`text-sm text-[#228B22]/50`}>
            {format(new Date(date), "dd MMMM yyyy")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Announcement;
