import { View, TouchableOpacity, Dimensions, useWindowDimensions } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "@/assets/Logo.svg";

const Header = () => {
  const { width, height } = useWindowDimensions();

  const data = useSelector((state) => state.user);
  const { user } = data;

  const route = user ? "/Menu" : "/login";

  return (
    <SafeAreaView>
      <View style={{ height: 0.07 * height, elevation: 0.9 }} className="w-full bg-white">
        <View
          className={`h-full flex justify-between items-center flex-row px-5 py-2`}
        >
          <TouchableOpacity
            onPress={() => router.push(route)}
            activeOpacity={0.7}
            className="flex flex-row gap-2 justify-center items-center h-full w-[50%]"
          >
            <FontAwesome6 name="bars" size={32} color="green" />
            <Logo width={width * 0.35} height={height * 0.04} />
          </TouchableOpacity>
          <View>
            <View className="h-12 w-12 rounded-full border-2 border-green-700 p-0.5 overflow-hidden">
              <Image source={user?.picture} style={{ height: "100%", width: "100%", borderRadius: 50 }} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;
