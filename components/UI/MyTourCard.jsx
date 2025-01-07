import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { router } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import CarouselImageRender from "./CarouselImageRender";
import Carousel from "react-native-reanimated-carousel";
import { calculateDuration, formatDate } from "../../utils/helpers";

const MyTourCard = ({ tour, status }) => {
  const images = tour.images.filter((i) => !i.type).map((i) => i.url);

  const onClickHandler = () => {
    const clickEnabled = status === 1 ? true : false;

    if (clickEnabled) {
      router.push(`/mytour/${tour?._id}`);
    } else {
      Alert.alert("Sorry..", "Booking rejected or not accepted yet.");
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onClickHandler}
      className="mt-4"
    >
      <View
        className={`w-[360px] h-[470px] rounded-xl overflow-hidden bg-white shadow-xl shadow-black/70 `}
      >
        <View className="h-[256px] w-full">
          <Carousel
            loop
            width={390}
            height={256}
            autoPlay={true}
            data={images}
            autoPlayInterval={2000}
            scrollAnimationDuration={1000}
            renderItem={CarouselImageRender}
          />
        </View>
        <View className="flex flex-row justify-between px-3 mt-2">
          <View>
            <Text className={`text-xl font-bold`}>{tour?.name}</Text>
            <Text>{calculateDuration(tour?.tour_start, tour?.tour_end)}</Text>
          </View>
          <View
            className={`w-28 ${
              status === 1
                ? "bg-green-700"
                : status === 2
                  ? "bg-orange-500"
                  : "bg-red-500"
            } flex flex-row justify-center items-center space-x-2 mt-2 rounded-lg h-6`}
          >
            <Ionicons
              name={`${
                status === 1
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

        <View className="p-3 space-y-4 mt-2">
          <View className="flex flex-row space-x-3">
            <Ionicons name="calendar-outline" size={16} color="green" />
            <Text>{`${formatDate(tour?.tour_start)} - ${formatDate(
              tour.tour_end
            )}`}</Text>
          </View>
          <View className="flex flex-row space-x-4">
            <FontAwesome6 name="person-hiking" size={16} color="green" />
            <Text>{tour?.difficulty}</Text>
          </View>

          <View className="flex flex-row space-x-3">
            <FontAwesome6 name="route" size={16} color="green" />
            <Text>{tour?.distance} Kms</Text>
          </View>

          <View className="flex flex-row space-x-3">
            <Ionicons name="person-outline" size={16} color="green" />
            <Text>{`${tour?.total_seats} seats`}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyTourCard;
