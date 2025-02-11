import { SafeAreaView } from "react-native-safe-area-context";
import V1 from "@/assets/welcomeTile.svg";
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import CarouselComponent from "@/components/CarouselComponent";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { setTour } from "../../redux/slices/tourSlice";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { setAdminAccessEnabled, setMembers } from "../../redux/slices/userSlice";
import { checkNetworkStatus } from "../../utils/offlineLocationHelper";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      console.error("User email is not available.");
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
      console.log("Error fetching members:", error);
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
      await AsyncStorage.setItem("tours", JSON.stringify(tour));
      dispatch(setTour(tour));
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong.");
      console.log("Error fetching tours:", error);
    }
  };

  useEffect(() => {
    dispatch(setAdminAccessEnabled(false));
  }, [isFocused]);

  useEffect(() => {
    checkNetworkStatus()
    getAllTours();
    handleGetMembers();
    const interval = setInterval(() => {
      checkNetworkConnection();
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  if (!isConnected) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={styles.offlineContainer}>
          <View style={styles.modalContent}>
            <MaterialIcons name="wifi-off" size={60} color="red" />
            <Text style={styles.modalText}>You are offline</Text>
            <Text style={styles.modalSubText}>
              Please check your network connection
            </Text>
            <View className="flex flex-row justify-between w-full items-center gap-4 mt-4">
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.retryButton}
                onPress={checkNetworkConnection}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.retryButton}
                onPress={() => router.push("/(offlinemode)/mytours")}
              >
                <Text style={styles.retryButtonText}>Offline Mode</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <V1 width={width * 1.8} height={height * 0.7} />
        </View>
        <View style={styles.carouselContainer}>
          <CarouselComponent />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  offlineContainer: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    height: height * 0.47,
    zIndex: 0,
  },
  carouselContainer: {
    width: width,
    height: height,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 1,
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
    marginTop: 10,
  },
  modalSubText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: "green",
    width: "45%",
    paddingVertical: 10,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
