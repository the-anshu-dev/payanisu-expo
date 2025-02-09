import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import React from "react";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { shorten } from "../../UI/PostComponent";
import { formatDate } from "../../../utils/helpers";

const { height, width } = Dimensions.get("window");

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
            <Ionicons name="calendar-outline" size={16} color="green" />
            <Text>{`${formatDate(tour?.tour_start)} - ${formatDate(
              tour?.tour_end
            )}`}</Text>
          </View>
          <View className="flex flex-row justify-between items-center mt-4 py-2">
            <View className="flex flex-row gap-1 items-center">
              <Ionicons name="location" size={18} color="green" />
              <Text className="text-base font-medium text-gray-600">
                {tour?.location}
              </Text>
            </View>
            <View className="flex flex-row gap-1 items-center justify-center">
              <FontAwesome6 name="route" size={16} color="green" />
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
              <Text className="text-3xl font-medium text-green-700">
                {tour?.bookedCount}/
              </Text>
              <Text className="-mb-1 text-lg font-medium">
                {tour?.total_seats}
              </Text>
            </View>
          </View>
          <View className="mt-5 bg-green-700/20 px-4 py-1 rounded-full">
            <Text className="font-medium capitalize text-green-600">
              completed
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const enrolledMemberProfileImgs = [
  "https://images.pexels.com/photos/39866/entrepreneur-startup-start-up-man-39866.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/845457/pexels-photo-845457.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/819530/pexels-photo-819530.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/886285/pexels-photo-886285.jpeg?auto=compress&cs=tinysrgb&w=600",
];

export default TourCard;
