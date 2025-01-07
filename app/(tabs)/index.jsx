import v1 from "@/assets/welcomeTile.svg";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import CarouselComponent from "@/components/CarouselComponent";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTour } from "@/redux/slices/tourSlice";
import { setAdminAccessEnabled } from "@/redux/slices/userSlice";
import { StatusBar } from "expo-status-bar";
import * as Network from "expo-network";
import { MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import {
  checkNetworkStatus,
  getUserLocation,
  requestLocationPermissions,
} from "../../utils/offlineLocationHelper";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(null);
  const { user } = useSelector((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const isFocused = useIsFocused();

  const getAllTours = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/get-alltours`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tours");
      }
      const tour = await response.json();
      dispatch(setTour(tour));
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

  const checkNetworkConnection = async () => {
    const isConnected = await checkNetworkStatus();
    setIsConnected(isConnected);
  };

  useEffect(() => {
    setIsMounted(true);
    checkNetworkConnection();
    if (isConnected && user) {
      getAllTours();
    }
    return () => {
      setIsMounted(false);
    };
  }, [isConnected, user, isMounted]);

  useEffect(() => {
    if (isFocused) {
      dispatch(setAdminAccessEnabled(false));
    }
  }, [isFocused]);


  // useEffect(() => {
  //   requestLocationPermissions();
  // }, []);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar
        style="dark"
        backgroundColor="#fff"
        translucent={true}
        animated
      />
      <View style={styles.container}>
        <Image source={v1} style={styles.image} />

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
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
        </Modal>

        {isConnected === false ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.offlineText}>Mobile data off</Text>
          </View>
        ) : (
          <View style={styles.carouselContainer}>
            <CarouselComponent />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: height * 0.45,
    contentFit: "cover",
    position: "absolute",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  offlineText: {
    fontSize: width * 0.05,
    color: "red",
  },
  carouselContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
