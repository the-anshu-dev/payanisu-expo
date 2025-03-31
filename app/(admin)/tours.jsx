import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useCallback, useState } from "react";
import TourCard from "../../components/admin/UI/TourCard";
import { router, useFocusEffect } from "expo-router";
import { useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setTour } from "../../redux/slices/tourSlice";
import { showError } from "../../utils/toastHelper";
import NotAvailableComponent from "../../components/UI/NotAvailableComponent";
import Loader from "../../components/common/Loader";
import { tourScreenStyles } from "../../constants/Styles";

const Tours = () => {
  const [tours, setTours] = useState([]);

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const getAllTours = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getAllTours();
    }, [])
  );

  if (loading) {
    return <Loader />;
  }

  if (tours.length == 0) {
    return <NotAvailableComponent text="No Tours Available" iconName="car" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <View style={tourScreenStyles.container}>
        <ScrollView
          contentContainerStyle={tourScreenStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={tourScreenStyles.tourListContainer}>
            {tours.map((item) => (
              <TourCard key={item?._id} tour={item} />
            ))}
          </View>
        </ScrollView>
        <View style={tourScreenStyles.createButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={tourScreenStyles.createButton}
            onPress={() => router.push("/addTours")}
          >
            <Text style={tourScreenStyles.createButtonText}>Create Tour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Tours;
