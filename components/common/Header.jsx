import {
  View,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from "react-native";
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
      <View
        style={{ height: 0.07 * height, elevation: 0.9 }}
        className="w-full bg-white"
      >
        <View
          className={`h-full flex justify-between items-center flex-row px-5 py-2`}
        >
          <View className="flex flex-row w-[50%] justify-center items-center">
            <TouchableOpacity
              onPress={() => router.push(route)}
              activeOpacity={0.9}
              className="px-3 py-2"
            >
              <FontAwesome6 name="bars" size={34} color="green" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              activeOpacity={0.9}
            >
              <Logo width={width * 0.35} height={height * 0.04} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/profile")}
          >
            <View className="h-12 w-12 rounded-full border-2 border-green-700 p-0.5 overflow-hidden">
              <Image
                source={user?.picture}
                style={{ height: "100%", width: "100%", borderRadius: 50 }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;
