import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import { setBookedTour } from "../../redux/slices/tourSlice";
import MyTourCard from "../../components/UI/MyTourCard";
import LoginReqCard from "../../components/UI/LoginReqCard.jsx";

const { width, height } = Dimensions.get("window");

const MyTours = () => {
  const { user } = useSelector((state) => state.user);
  const { bookedTour } = useSelector((state) => state.tour);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();

  const getAllBookedTours = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/get-my-tour?email=${user.email}`
      );

      if (res.status !== 200) {
        console.log("Failed to get my tours", res);
        throw new Error("Failed to get my tour");
      }

      const resData = await res.json();
      dispatch(setBookedTour(resData.data));
    } catch (error) {
      console.log("Failed to get my tours", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getAllBookedTours();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  if (!bookedTour || bookedTour.lenght <= 0) {
    return (
      <View style={styles.noBookedTourContainer}>
        <Text>No booked tours</Text>
      </View>
    );
  }

  return (
    <>
      {user ? (
        <View style={styles.container}>
          <StatusBar
            style="dark"
            backgroundColor="#fff"
            translucent={true}
            animated
          />
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
                  key={idx}
                  tour={tour.tourDetails}
                  status={tour.status}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        <LoginReqCard />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: height * 0.08,
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: height * 0.1,
    paddingHorizontal: width * 0.05,
  },
  toursContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: height * 0.05,
    paddingBottom: height * 0.01,
  },
  noBookedTourContainer: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyTours;
