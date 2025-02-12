import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import TourCard from "../../components/admin/UI/TourCard";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setTour } from "../../redux/slices/tourSlice";
import { showError } from "../../utils/toastHelper";

const { width, height } = Dimensions.get("window");

const Tours = () => {
  const [tours, setTours] = useState([]);

  const [refresh, setRefresh] = useState(false);

  const dispatch = useDispatch();

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
      setTours(tour);
      dispatch(setTour(tour));
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  const onRefresh = async () => {
    setRefresh(true);
    try {
      await getAllTours();
    } finally {
      setRefresh(false);
    }
  };

  useEffect(() => {
    getAllTours();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refresh} />
          }
        >
          <View style={styles.tourListContainer}>
            {tours.length > 0 ? (
              tours.map((item) => <TourCard key={item?._id} tour={item} />)
            ) : (
              <View style={styles.noToursCard}>
                <Text style={styles.noToursText}>No Tours Available</Text>
              </View>
            )}
          </View>
        </ScrollView>
        <View style={styles.createButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.createButton}
            onPress={() => router.push("/addTours")}
          >
            <Text style={styles.createButtonText}>Create Tour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: height * 0.1,
    width: "100%",
  },
  tourListContainer: {
    width: width,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 15,
  },
  noToursCard: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: height * 0.02,
  },
  noToursText: {
    color: "gray",
    fontSize: width * 0.06,
    fontWeight: "bold",
  },
  createButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: width * 0.04,
    paddingVertical: 5,
  },
  createButton: {
    backgroundColor: "green",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
});

export default Tours;
