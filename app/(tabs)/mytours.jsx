import { View, RefreshControl } from "react-native";
import React, { useState, useCallback } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import { setBookedTour } from "../../redux/slices/tourSlice";
import MyTourCard from "../../components/UI/MyTourCard";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, useFocusEffect } from "expo-router";
import { showError } from "../../utils/toastHelper";
import { myTourScreenStyles } from "../../constants/Styles";
import Loader from "../../components/common/Loader";
import NotAvailableComponent from "../../components/UI/NotAvailableComponent";

const MyTours = () => {
  const { user } = useSelector((state) => state.user);
  const { bookedTour } = useSelector((state) => state.tour);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const getAllBookedTours = async () => {
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
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getAllBookedTours();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  if (loading) {
    return <Loader />;
  }

  if (bookedTour.length === 0) {
    return (
      <NotAvailableComponent
        text={"No Booked Tours"}
        iconName={"alert-circle-outline"}
      />
    );
  }

  return (
    <SafeAreaView
      style={myTourScreenStyles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#fff" translucent animated />
      <View style={myTourScreenStyles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={myTourScreenStyles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={myTourScreenStyles.toursContainer}>
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
    </SafeAreaView>
  );
};

export default MyTours;
