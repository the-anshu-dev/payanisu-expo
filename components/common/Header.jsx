import { View, TouchableOpacity, Dimensions } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "@/assets/Logo.svg";
import { setProfile } from "../../redux/slices/userSlice";
import { showError } from "../../utils/toastHelper";

const { width, height } = Dimensions.get("window");

const Header = () => {
  const { user, profile } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const handleProfilePress = async () => {
    if (profile) {
      router.push("/profile");
    } else {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/users/getProfile`,
          {
            method: "GET",
            headers: { email: user.email },
          }
        );
        if (response.status == 404) {
          router.push("/editProfile");
        }
        if (response.status == 200) {
          const profileData = await response.json();
          dispatch(setProfile(profileData));
          router.push("/profile");
        }
      } catch (error) {
        showError(error?.message || "Failed to fetch profile data.");
      }
    }
  };

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
              onPress={() => router.push("/Menu")}
              activeOpacity={0.9}
              className="px-3 py-2"
            >
              <FontAwesome6 name="bars" size={24} color="#228B22" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              activeOpacity={0.9}
            >
              <Logo width={width * 0.4} height={height * 0.04} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.9} onPress={handleProfilePress}>
            <View className="h-12 w-12 rounded-full border-2 border-[#228B22] p-0.5 overflow-hidden">
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
