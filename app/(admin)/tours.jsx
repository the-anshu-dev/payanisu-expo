import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useCallback, useState } from "react";
import TourCard from "../../components/admin/UI/TourCard";
import { router, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setTour } from "../../redux/slices/tourSlice";
import { showError } from "../../utils/toastHelper";
import NotAvailableComponent from "../../components/UI/NotAvailableComponent";
import Loader from "../../components/common/Loader";
import { tourScreenStyles } from "../../constants/Styles";

const Tours = () => {
  const [adminTours, setAdminTours] = useState([]);
  const { user } = useSelector((state) => state.user);
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
      dispatch(setTour(tour));
      await AsyncStorage.setItem("tours", JSON.stringify(tour));
      const adminTours = tour.filter((item) => item?.email === user?.email);
      setAdminTours(adminTours);
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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <View style={tourScreenStyles.container}>
        <ScrollView
          contentContainerStyle={tourScreenStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={tourScreenStyles.tourListContainer}>
            {!adminTours.length > 0 ? (
              adminTours.map((item) => <TourCard key={item?._id} tour={item} />)
            ) : (
              <NotAvailableComponent
                text="No Tours Available"
                iconName="alert-circle-outline"
              />
            )}
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
