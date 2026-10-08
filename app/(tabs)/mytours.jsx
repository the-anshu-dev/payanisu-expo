import {
  View,
  RefreshControl,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { myTourScreenStyles } from "../../constants/Styles";
import MyTourCard from "../../components/UI/MyTourCard";
import Loader from "../../components/common/Loader";
import NotAvailableComponent from "../../components/UI/NotAvailableComponent";

import { fetchBookedTours } from "../../redux/slices/bookedToursSlice";
import { useBookedTours } from "../../hooks/useBookedTours";

const MyTours = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { bookedTours, loading } = useBookedTours();

  const [refreshing, setRefreshing] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(1);

  const onRefresh = async () => {
    if (!user?.email) return;
    console.log(user.email);
    setRefreshing(true);
    dispatch(fetchBookedTours(user.email));
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.email) {
        dispatch(fetchBookedTours(user.email));
      }
    }, [user?.email])
  );

  const filteredTours = bookedTours.filter(
    (tour) => tour.status !== 0 && tour.status === bookingStatus
  );

  if (loading) return <Loader />;

  return (
    <SafeAreaView
      style={myTourScreenStyles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <View style={myTourScreenStyles.toggleContainer}>
        <TouchableOpacity
          onPress={() => setBookingStatus(1)}
          style={[
            myTourScreenStyles.toggleButton,
            {
              backgroundColor: bookingStatus === 1 ? "green" : "white",
              borderColor: "green",
            },
          ]}
        >
          <Text
            style={{
              color: bookingStatus === 1 ? "white" : "black",
              fontWeight: "600",
            }}
          >
            Booked
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setBookingStatus(2)}
          style={[
            myTourScreenStyles.toggleButton,
            {
              backgroundColor: bookingStatus === 2 ? "green" : "white",
              borderColor: "green",
            },
          ]}
        >
          <Text
            style={{
              color: bookingStatus === 2 ? "white" : "black",
              fontWeight: "600",
            }}
          >
            Pending
          </Text>
        </TouchableOpacity>
      </View>
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
            {filteredTours.length > 0 ? (
              filteredTours.map((tourItem, idx) => (
                <MyTourCard
                  key={tourItem._id || idx}
                  tour={tourItem.tourDetails}
                  status={
                    new Date(tourItem.tourDetails.tour_end) < new Date()
                      ? 4
                      : tourItem.status
                  }
                />
              ))
            ) : (
              <NotAvailableComponent
                text={
                  bookingStatus === 1 ? "No Booked Tours" : "No Pending Tours"
                }
                iconName="alert-circle-outline"
              />
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MyTours;
