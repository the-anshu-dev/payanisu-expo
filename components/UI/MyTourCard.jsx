import { View, Text, TouchableOpacity, Alert, Dimensions } from "react-native";
import React from "react";
import { router } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import CarouselImageRender from "./CarouselImageRender";
import Carousel from "react-native-reanimated-carousel";
import { calculateDuration, formatDate } from "../../utils/helpers";

const { width, height } = Dimensions.get("window")

const MyTourCard = ({ tour, status }) => {

  const images = tour?.images?.filter((i) => !i.type).map((i) => i.url);

  const onClickHandler = () => {
    const clickEnabled = status === 1 || 2 ? true : false;
    if (clickEnabled) {
      router.push(`/mytour/${tour?._id}`);
    } else {
      Alert.alert("Booking Rejected", "Your booking request has been rejected.");
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onClickHandler}
      className="mt-4"
    >
      <View
        style={{ width: width * 0.9 }}
        className={`rounded-xl overflow-hidden bg-white shadow-xl shadow-black/70 `}
      >
        <View style={{ height: height / 4, width: "100%" }}>
          <Carousel
            loop
            width={width * 0.9}
            height={height / 4}
            autoPlay
            data={images}
            autoPlayInterval={2000}
            scrollAnimationDuration={1000}
            renderItem={CarouselImageRender}
          />
        </View>
        <View className="flex flex-row justify-between px-3 mt-3">
          <View>
            <Text className={`text-xl font-semibold`}>{tour?.name}</Text>
            <Text >{calculateDuration(tour?.tour_start, tour?.tour_end)}</Text>
          </View>
          <View
            className={`w-28 ${status === 1
              ? "bg-green-700"
              : status === 2
                ? "bg-orange-500"
                : "bg-red-500"
              } flex flex-row justify-center items-center gap-2 mt-2 rounded-lg h-6`}
          >
            <Ionicons
              name={`${status === 1
                ? "checkmark-outline"
                : status === 2
                  ? "time-outline"
                  : "close-circle-outline"
                }`}
              size={16}
              color={"white"}
            />
            <Text className="text-center font-bold text-white capitalize">
              {status === 1 ? "Booked" : status === 2 ? "Pending" : "Rejected"}
            </Text>
          </View>
        </View>
        <View className="p-3 gap-3 mt-2 mb-2">
          <View className="flex flex-row gap-3">
            <Ionicons name="calendar-outline" size={16} color="green" />
            <Text>{`${formatDate(tour?.tour_start)} - ${formatDate(
              tour.tour_end
            )}`}</Text>
          </View>
          <View className="flex flex-row gap-3">
            <FontAwesome6 name="person-hiking" size={16} color="green" />
            <Text>{tour?.difficulty}</Text>
          </View>

          <View className="flex flex-row gap-3">
            <FontAwesome6 name="route" size={16} color="green" />
            <Text>{tour?.distance} Kms</Text>
          </View>

          <View className="flex flex-row gap-3">
            <Ionicons name="person-outline" size={16} color="green" />
            <Text>{`${tour?.total_seats} seats`}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyTourCard;
