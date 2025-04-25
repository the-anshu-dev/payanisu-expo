import { SafeAreaView } from "react-native-safe-area-context";
import V1 from "@/assets/welcomeTile.svg";
import { Dimensions, View, Text, TouchableOpacity } from "react-native";
import CarouselComponent from "@/components/CarouselComponent";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import {
  setAdminAccessEnabled,
} from "../../redux/slices/userSlice";
import { checkNetworkStatus } from "../../utils/offlineLocationHelper";
import { router } from "expo-router";
import { homeScreenStyles } from "../../constants/Styles";
import { fetchMembers } from "../../redux/slices/membersSlice";
import { fetchAllTours } from "../../redux/slices/toursSlice";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [isConnected, setIsConnected] = useState(true);
  const { user } = useSelector((state) => state.user);

  // thunk
  const dispatch = useDispatch();

  const isFocused = useIsFocused();

  const checkNetworkConnection = async () => {
    const status = await checkNetworkStatus();
    setIsConnected(status);
  };

  useEffect(() => {
    dispatch(setAdminAccessEnabled(false));
  }, [isFocused]);

  useEffect(() => {
    checkNetworkStatus();
    dispatch(fetchAllTours());
    dispatch(fetchMembers(user?.email));
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
