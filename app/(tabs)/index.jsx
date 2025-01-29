import { SafeAreaView } from "react-native-safe-area-context";
import V1 from "@/assets/welcomeTile.svg";
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import CarouselComponent from "@/components/CarouselComponent";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { setTour } from "../../redux/slices/tourSlice";
import { setAdminAccessEnabled } from "@/redux/slices/userSlice";
import { MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(true); 
  const { user } = useSelector((state) => state.user);
  const isFocused = useIsFocused();

  const checkNetworkStatus = async () => {
    try {
      const response = await fetch("https://www.google.com", { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  };

  const checkNetworkConnection = async () => {
    const connection = await checkNetworkStatus();
    setIsConnected(connection);
  };

  useEffect(() => {
    checkNetworkConnection();
  }, []);

  useEffect(() => {
    if (isConnected && user) {
      (async () => {
        try {
          if (!process.env.EXPO_PUBLIC_BASE_URL) throw new Error("Base URL missing");
          const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/get-alltours`);
          if (!response.ok) throw new Error("Failed to fetch tours");
          const tours = await response.json();
          dispatch(setTour(tours));
        } catch (error) {
          console.error("Error fetching tours:", error);
        }
      })();
    }
  }, [isConnected, user]);

  useEffect(() => {
    if (isFocused) {
      dispatch(setAdminAccessEnabled(false));
    }
  }, [isFocused]);

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.offlineContainer}>
          <View style={styles.modalContent}>
            <MaterialIcons name="wifi-off" size={60} color="red" />
            <Text style={styles.modalText}>You are offline</Text>
            <Text style={styles.modalSubText}>
              Please check your network connection
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={checkNetworkConnection}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
    color: "red",
    marginTop: 10,
  },
  modalSubText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
