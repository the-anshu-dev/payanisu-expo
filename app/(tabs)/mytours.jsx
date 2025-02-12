import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import { setBookedTour } from "../../redux/slices/tourSlice";
import MyTourCard from "../../components/UI/MyTourCard";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { showError } from "../../utils/toastHelper";

const { width, height } = Dimensions.get("window");

const MyTours = () => {
  const { user } = useSelector((state) => state.user);
  const { bookedTour } = useSelector((state) => state.tour);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const getAllBookedTours = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/get-my-tour?email=${user.email}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch booked tours.");
      }

      const data = await response.json();
      await AsyncStorage.setItem("bookedTours", JSON.stringify(data.data));
      dispatch(setBookedTour(data.data));
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, dispatch]);

  useEffect(() => {
    getAllBookedTours();
  }, [getAllBookedTours]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getAllBookedTours();
    setRefreshing(false);
  };

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#fff" translucent animated />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : bookedTour?.length > 0 ? (
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.toursContainer}>
              {bookedTour.map((tour, idx) => (
                <MyTourCard
                  key={tour.id || idx}
                  tour={tour.tourDetails}
                  status={tour.status}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.noTourContainer}>
          <Text style={styles.noTourText}>No booked tours available</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollContainer: {
    width: "100%",
    paddingBottom: height * 0.1,
    paddingHorizontal: width * 0.05,
  },
  toursContainer: {
    width: "100%",
    alignItems: "center",
  },
  noTourContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTourText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyTours;
