import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useCallback } from "react";
import TourCard from "../../components/admin/UI/TourCard";
import { router, useFocusEffect } from "expo-router";
import { useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import NotAvailableComponent from "../../components/UI/NotAvailableComponent";
import Loader from "../../components/common/Loader";
import { tourScreenStyles } from "../../constants/Styles";
import { fetchAllTours } from "../../redux/slices/toursSlice";
import { useTours } from "../../hooks/useTours";

const Tours = () => {
  const { tours, loading } = useTours();

  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAllTours());
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
            {tours.length > 0 ? (
              tours.map((item) => <TourCard key={item?._id} tour={item} />)
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
