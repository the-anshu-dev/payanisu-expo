import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { shorten } from "./PostComponent";
import { FontAwesome6 } from "@expo/vector-icons";

const Announcement = () => {
  const text =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos fuga nesciunt, minima perferendis aut quia rem, eos id quo quod, liberodeserunt alias enim corrupti! Lorem ipsum dolor sit amet consectetur   adipisicing elit. Laboriosam fugit placeat atque ut at porro est eligendi sed possimus excepturi qui sequi omnis debitis, adipisci alias, nulla hic doloremque? Corrupti labore beatae dolor. Ipsum accusamus voluptatum exercitationem fuga, nisi doloremque, totam rerum explicabo provident consequatur corporis deserunt corrupti nostrum cupiditate.";
  return (
    <TouchableOpacity activeOpacity={0.8}>
      <View className="border-2 h-32 rounded-lg border-green-600/20 p-2 mt-3">
        <View className="flex flex-row justify-start items-center space-x-3">
          <FontAwesome6 name="bell" size={20} color={"green"} />
          <Text className={`text-base font-semibold `}>ShriShailm Trek</Text>
        </View>
        <View className="mt-2 ">
          <Text className={`tracking-wide text-justify `}>
            {shorten(text, 160)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Announcement;
