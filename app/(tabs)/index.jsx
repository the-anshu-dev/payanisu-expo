import { SafeAreaView } from "react-native-safe-area-context";
import V1 from "@/assets/welcomeTile.svg";
import { Dimensions, View, Text, TouchableOpacity } from "react-native";
import CarouselComponent from "@/components/CarouselComponent";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { setTour } from "../../redux/slices/tourSlice";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import {
  setAdminAccessEnabled,
  setMembers,
} from "../../redux/slices/userSlice";
import { checkNetworkStatus } from "../../utils/offlineLocationHelper";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError } from "../../utils/toastHelper";
import { homeScreenStyles } from "../../constants/Styles";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [isConnected, setIsConnected] = useState(true);
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const isFocused = useIsFocused();

  const checkNetworkConnection = async () => {
    const status = await checkNetworkStatus();
    setIsConnected(status);
  };

  const handleGetMembers = async () => {
    if (!user?.email) {
      showError("User email is not available.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/get-member?email=${user.email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        const text = await response.text();
        throw new Error("Failed to fetch members.");
      }
      const data = await response.json();
      dispatch(setMembers(data));
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  const getAllTours = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/get-alltours`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tours due to server error.");
      }
      const tour = await response.json();
      if (tour.length === 0) {
        showError("No upcoming tours available.");
      }
      await AsyncStorage.setItem("tours", JSON.stringify(tour));
      dispatch(setTour(tour));
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  useEffect(() => {
    dispatch(setAdminAccessEnabled(false));
  }, [isFocused]);

  useEffect(() => {
    checkNetworkStatus();
    getAllTours();
    handleGetMembers();
    const interval = setInterval(() => {
      checkNetworkConnection();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isConnected) {
    return (
      <SafeAreaView
        style={homeScreenStyles.safeArea}
        edges={["left", "right", "bottom"]}
      >
        <View style={homeScreenStyles.offlineContainer}>
          <View style={homeScreenStyles.modalContent}>
            <MaterialIcons name="wifi-off" size={60} color="red" />
            <Text style={homeScreenStyles.modalText}>You are offline</Text>
            <Text style={homeScreenStyles.modalSubText}>
              Please check your network connection
            </Text>
            <View className="flex flex-row justify-between w-full items-center gap-4 mt-4">
              <TouchableOpacity
                activeOpacity={0.9}
                style={homeScreenStyles.retryButton}
                onPress={checkNetworkConnection}
              >
                <Text style={homeScreenStyles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                style={homeScreenStyles.retryButton}
                onPress={() => router.push("/(offlinemode)/mytours")}
              >
                <Text style={homeScreenStyles.retryButtonText}>
                  Offline Mode
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={homeScreenStyles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <View style={homeScreenStyles.container}>
        <View style={homeScreenStyles.imageContainer}>
          <V1 width={width * 1.8} height={height * 0.7} />
        </View>
        <View style={homeScreenStyles.carouselContainer}>
          <CarouselComponent />
        </View>
      </View>
    </SafeAreaView>
  );
}
