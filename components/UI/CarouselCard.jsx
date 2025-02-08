import { View, Text, Dimensions } from "react-native";
import React from "react";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import CarouselImageRender from "./CarouselImageRender";
import { formatDate, calculateDuration } from "../../utils/helpers.js";

const { width, height } = Dimensions.get("window");

const CarouselCard = ({ tour }) => {
  const images = tour.images.filter((i) => !i.type).map((i) => i.url);

  return (
    <Link push href={`/details/${tour._id}`} className="ml-6">
      <View
        style={{ width: width * 0.75, height: height * 0.52 }}
        className="rounded-xl relative"
      >
        <View
          className="rounded-xl overflow-hidden bg-white shadow-lg shadow-black/20"
          style={{ height: "100%", width: "100%", paddingBottom: 10 }}
        >
          <View style={{ height: height * 0.25, width: "100%" }}>
            <Carousel
              loop
              width={width * 0.75}
              height={height * 0.25}
              data={images}
              scrollAnimationDuration={1000}
              renderItem={({ item }) => <CarouselImageRender item={item} />}
            />
          </View>
          <View className="flex flex-row justify-between px-2 mt-2">
            <View>
              <Text className="text-lg font-semibold text-gray-900">{tour.name}</Text>
              <Text className="text-md text-gray-600">{calculateDuration(tour.tour_start, tour.tour_end)}</Text>
            </View>
            <View className="flex flex-col justify-center items-end">
              <Text className="text-lg font-semibold text-green-600">{`₹${tour.tour_cost}`}</Text>
              <Text className="text-sm text-gray-500">per seat</Text>
            </View>
          </View>
          <View className="px-2 py-3 gap-3">
            <View className="flex flex-row items-center gap-3">
              <Ionicons name="calendar-outline" size={16} color="green" />
              <Text className="text-gray-700">{`${formatDate(tour.tour_start)} - ${formatDate(tour.tour_end)}`}</Text>
            </View>
            <View className="flex flex-row items-center gap-3">
              <FontAwesome6 name="person-hiking" size={16} color="green" />
              <Text className="text-gray-700">{tour.difficulty}</Text>
            </View>
            <View className="flex flex-row items-center gap-3">
              <FontAwesome6 name="route" size={16} color="green" />
              <Text className="text-gray-700">{`${tour.distance} Km`}</Text>
            </View>
            <View className="flex flex-row items-center gap-3">
              <Ionicons name="person-outline" size={16} color="green" />
              <Text className="text-gray-700">{`${tour.total_seats} seats`}</Text>
            </View>
          </View>
        </View>
        <View className="absolute -bottom-6 w-full flex items-center">
          <View className="bg-green-700 shadow-md shadow-green-800/40 px-8 py-3 rounded-lg">
            <Text className="text-white font-medium">Explore more</Text>
          </View>
        </View>
      </View>
    </Link>
  );
};

export default CarouselCard;
