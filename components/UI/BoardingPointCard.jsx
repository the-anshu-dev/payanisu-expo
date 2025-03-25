import { View, Text } from "react-native";
import React from "react";
import { format } from "date-fns";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BoardingPointCard = (props) => {
  const {
    boardingPointDate,
    boardingPointName,
    boardingPointTime,
    location,
    latitude,
    longitude,
  } = props.point;

  const { handleBusModal, handleDirectionModal, setDestination, transportId } =
    props;

  return (
    <View className="border-2 border-gray-300 rounded-md p-1 ">
      <View>
        <Text>Boarding Point {props.index}</Text>
        <Text className={`mt-1 font-semibold`}>{`${boardingPointName}`}</Text>
      </View>
      <View className="mt-2">
        <Text>Boarding Location</Text>
        <Text className={`mt-1 font-semibold`}>{`${location}`}</Text>
      </View>
      <View className="mt-2">
        <Text>Boarding Time</Text>
        <Text
          className={`mt-1 font-semibold`}
        >{`${boardingPointDate && format(new Date(boardingPointDate), "dd MMM yyyy")} - ${boardingPointTime && format(new Date(boardingPointTime), "hh:mm a")}`}</Text>
      </View>
      <View className="flex flex-row justify-between items-center mt-1 px-2">
        <TouchableOpacity
          onPress={handleBusModal}
          activeOpacity={0.9}
          className="mt-3 flex flex-row justify-start items-center gap-2"
        >
          <Ionicons name="images" size={12} color={"#228B22"} />
          <Text className={`font-semibold text-xs text-[#228B22]`}>
            View Bus Images
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setDestination({ latitude, longitude });
            handleDirectionModal();
          }}
          className="mt-3 flex flex-row justify-start items-center gap-2"
        >
          <Ionicons name="compass" size={12} color={"#228B22"} />
          <Text className={`font-semibold text-xs text-[#228B22]`}>
            View Direction
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/bus-mates/${transportId}`)}
          activeOpacity={0.9}
          className="mt-3 flex flex-row justify-start items-center gap-2"
        >
          <Ionicons name="compass" size={12} color={"#228B22"} />
          <Text className={`font-semibold text-xs text-[#228B22]`}>
            Your Bus Mates
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BoardingPointCard;
