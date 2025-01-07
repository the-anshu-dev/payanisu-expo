import { View, Text } from "react-native";
import React from "react";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import CarouselImageRender from "./CarouselImageRender";
import { formatDate, calculateDuration } from "../../utils/helpers.js";

const CarouselCard = ({ tour }) => {

  const images = tour.images.filter((i) => !i.type).map((i) => i.url);

  return (
    <Link push href={`/details/${tour._id}`} className="ml-5 ">
      <View className={`h-[430px] w-72 rounded-xl relative `}>
        <View className="h-full w-full rounded-xl overflow-hidden bg-white  shadow-xl shadow-black/50 ">
          <View className="h-[200px] w-full">
            <Carousel
              loop
              width={320}
              height={200}
              autoPlay={true}
              data={images}
              autoPlayInterval={2000}
              scrollAnimationDuration={1000}
              renderItem={CarouselImageRender}
            />
          </View>
          <View className="flex flex-row justify-between px-2 mt-1">
            <View className="space-y-0.5">
              <Text className={`text-lg font-semibold `}>{tour.name}</Text>
              <Text className={`text-md font-normal `}>{`${calculateDuration(
                tour.tour_start,
                tour.tour_end
              )}`}</Text>
            </View>
            <View>
              <Text className="text-lg font-semibold text-green-600 text-right">{`₹${tour.tour_cost}`}</Text>
              <Text className={`text-xs  text-right`}>per seat</Text>
            </View>
          </View>
          <View className="p-3 space-y-3 mt-2">
            <View className="flex flex-row space-x-3">
              <Ionicons name="calendar-outline" size={16} color="green" />
              <Text>{`${formatDate(tour.tour_start)} - ${formatDate(
                tour.tour_end
              )}`}</Text>
            </View>
            <View className="flex flex-row space-x-4">
              <FontAwesome6 name="person-hiking" size={16} color="green" />
              <Text>{tour.difficulty}</Text>
            </View>
            <View className="flex flex-row space-x-3">
              <FontAwesome6 name="route" size={16} color="green" />
              <Text>{`${tour.distance} Km`}</Text>
            </View>
            <View className="flex flex-row space-x-3">
              <Ionicons name="person-outline" size={16} color="green" />
              <Text>{`${tour.total_seats} seats`}</Text>
            </View>
          </View>
        </View>
        <View className="absolute -bottom-5 w-full z-50">
          <View className="bg-green-700 shadow-md shadow-green-800/40 mx-12 flex justify-center items-center py-3 rounded-lg">
            <Text className="text-white">Explore more</Text>
          </View>
        </View>
      </View>
    </Link>
  );
};

export default CarouselCard;
