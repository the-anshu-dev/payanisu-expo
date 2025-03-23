import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "../../utils/helpers";
import { ActivityIndicator } from "react-native-paper";
import { setTour } from "../../redux/slices/tourSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError, showSuccess, showWarning } from "../../utils/toastHelper";

const { width } = Dimensions.get("window");

const TourDetails = () => {
  const { id } = useLocalSearchParams();
  const { tour } = useSelector((state) => state.tour);
  const { user } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [unPublishLoading, setUnPublishLoading] = useState(false);

  const tourDetail = tour?.find((item) => item._id === id) ?? null;

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
      await dispatch(setTour(tour));
    } catch (error) {
      showWarning(error.message || "Failed to fetch tours.");
      console.log("Error fetching tours:", error);
    }
  };

  const handleDeleteTour = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/delete-tour?id=${id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          "Failed to delete tour. Server responded with an error."
        );
      }
      await getAllTours();
      showSuccess("Tour deleted.");
      router.replace("/(admin)/tours");
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTourStatus = async () => {
    setUnPublishLoading(true);
    try {
      const body = {
        id: id,
        status: tourDetail.status ? false : true,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/update-tour`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to unpublish");
      }

      const refreshTour = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/get-alltours`
      );

      if (!refreshTour.ok) {
        throw new Error("Failed to fetch tours");
      }

      const tour = await refreshTour.json();
      dispatch(setTour(tour));

      showSuccess("Tour Status Updated.");
      router.push("/(admin)/tours");
    } catch (error) {
      showError(error.message || "Please try again.");
      console.log("error:", error);
    } finally {
      setUnPublishLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      await getAllTours();
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  if (!tourDetail) {
    return (
      <View className="h-full w-full flex justify-center items-center">
        <ActivityIndicator size={"large"} color="#228B22" />
        <Text className="mt-2 text-gray-500">Tour details not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-1 flex-col w-full h-full justify-between items-center">
      <StatusBar
        style="dark"
        backgroundColor="#fff"
        translucent={true}
        animated
      />
      <View className="mt-2 w-full px-4">
        <View className="w-full  rounded-lg border border-[#228B22] bg-[#228B22]">
          <View
            className={`flex flex-row justify-between py-3 px-4 rounded-lg `}
          >
            <View className="gap-2">
              <Text className={`font-semibold text-white text-lg`}>
                {tourDetail.name}
              </Text>
              <Text className={`font-semibold text-white`}>
                {formatDate(tourDetail.tour_start)}
              </Text>
            </View>
            <View className="gap-2">
              <Text
                className={`font-semibold text-right text-white`}
              >{`${tourDetail.total_seats} Seats`}</Text>
              <Text className={`font-semibold text-right text-white`}>
                {formatDate(tourDetail.tour_end)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          marginTop: 5,
          width: "100%",
          paddingBottom: 80,
          paddingHorizontal: 15,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading || unPublishLoading}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex space-y-5 w-full">
          {DetailTitle.map((detail) => (
            <DetailScreenButton
              key={detail.id}
              title={detail.title}
              href={detail.href}
              id={id}
            />
          ))}
        </View>
      </ScrollView>
      <View className="w-full flex flex-row justify-between items-center h-16 px-4 mb-2">
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={unPublishLoading}
          onPress={handleTourStatus}
          style={{
            width: width * 0.45,
            backgroundColor:
              tourDetail.status === false ? "#228B22" : "gray",
            height: 48,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
          }}
        >
          {unPublishLoading ? (
            <ActivityIndicator size={"small"} color="white" />
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              {tourDetail.status === false ? "Publish" : "Unpublish"} Tour
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={loading}
          onPress={handleDeleteTour}
          style={{
            width: width * 0.45,
            height: 44,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "red",
          }}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color="red" />
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: "red",
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              Delete Tour
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DetailTitle = [
  {
    id: 1,
    title: "Tour Details",
    href: "/(addTourDetails)/tourDetails",
  },
  {
    id: 2,
    title: "What is included/not-included",
    href: "/(addTourDetails)/includedNotIncluded",
  },
  {
    id: 9,
    title: "Bag Pack & Check-in Baggage",
    href: "/(addTourDetails)/luggage",
  },
  {
    id: 3,
    title: "Guests Enrolled",
    href: "/(addTourDetails)/guestsEnrolled",
  },
  {
    id: 4,
    title: "Accomodation/Allocation",
    href: "/(addTourDetails)/accomodation",
  },
  {
    id: 5,
    title: "Transportation Details",
    href: "/(addTourDetails)/transportation",
  },
  {
    id: 6,
    title: "Check Points",
    href: "/(addTourDetails)/checkPoints",
  },
  {
    id: 7,
    title: "Allocated Coordinators",
    href: "/(addTourDetails)/allocatedCoordinators",
  },
  {
    id: 8,
    title: "My Notes",
    href: "/(addTourDetails)/myNotes",
  },
];

const DetailScreenButton = ({ title, href, id }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`${href}/${id}`)}
      className="py-4 rounded-lg mt-3 w-full bg-white shadow-xl shadow-black/50"
    >
      <View className="flex flex-row justify-between items-center px-2 w-full">
        <Text>{title}</Text>
        <Ionicons size={20} name="chevron-forward-outline" color={"#228B22"} />
      </View>
    </TouchableOpacity>
  );
};

export default TourDetails;
