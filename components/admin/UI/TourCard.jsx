import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import React from "react";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { formatDate, shorten } from "../../../utils/helpers";
import TourStatus from "./TourStatus";

const { height } = Dimensions.get("window");

const TourCard = ({ tour }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className={`w-full flex flex-1 justify-center items-center ${tour.status === false ? "bg-slate-300" : "bg-white"}  rounded-lg overflow-hidden shadow-xl shadow-black `}
      onPress={() => router.push(`/tour/${tour?._id}`)}
    >
      <View
        style={{ height: height * 0.16, width: "100%" }}
        className="flex flex-row justify-between p-3"
      >
        <View>
          <Text className="text-xl font-medium text-gray-700">
            {shorten(tour?.name, 20)}
          </Text>
          <View className="flex flex-row mt-4 gap-2 justify-start items-center">
            <Ionicons name="calendar-outline" size={16} color="#228B22" />
            <Text>{`${formatDate(tour?.tour_start)} - ${formatDate(
              tour?.tour_end
            )}`}</Text>
          </View>
          <View className="flex flex-row justify-between items-center mt-4 py-2">
            <View className="flex flex-row gap-1 items-center">
              <Ionicons name="location" size={18} color="#228B22" />
              <Text className="text-base font-medium text-gray-600">
                {tour?.location?.split(" ")[0]}
              </Text>
            </View>
            <View className="flex flex-row gap-1 items-center justify-center">
              <FontAwesome6 name="route" size={16} color="#228B22" />
              <Text className="text-base font-medium text-gray-600">
                {tour?.distance} KM
              </Text>
            </View>
          </View>
        </View>
        <View className="flex justify-start items-end">
          <View>
            <Text className="text-gray-600 font-medium">Seats Booked</Text>
            <View className="flex flex-row justify-end items-center mt-2">
              <Text className="text-3xl font-medium text-[#228B22]">
                {tour?.bookedCount}/
              </Text>
              <Text className="-mb-1 text-lg font-medium">
                {tour?.total_seats}
              </Text>
            </View>
          </View>
          <TourStatus
            status={tour.status}
            tourStart={tour.tour_start}
            tourEnd={tour.tour_end}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TourCard;
