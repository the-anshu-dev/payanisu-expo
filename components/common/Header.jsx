import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

const Header = () => {
  const data = useSelector((state) => state.user);
  const { user } = data;

  const route = user ? "/Menu" : "/login";

  const picture =
    user?.picture ||
    "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png";

  return (
    <View className="absolute mt-[45px] w-full h-[60px] bg-white">
      <View
        className={` h-full py-3 flex justify-between items-center flex-row px-4`}
      >
        <TouchableOpacity
          onPress={() => router.push("/")}
          activeOpacity={0.6}
          className="flex flex-row space-x-2 justify-center items-start"
        >
          <FontAwesome6 name="person-hiking" size={32} color="green" />
          <Text className="text-3xl tracking-widest font-semibold text-green-700">
            Trekies
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(route)}
          activeOpacity={0.7}
        >
          <View className="h-12 w-12 rounded-full border-2 border-green-700 p-0.5 ">
            <Image
              source={{ uri: picture }}
              className="h-full w-full rounded-full"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
