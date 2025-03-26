import { View, Text } from "react-native";
import React from "react";
import { format } from "date-fns";
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

  const { handleDirectionModal, setDestination } = props;

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
      <View className="flex flex-row justify-start items-center my-1">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setDestination({ latitude, longitude });
            handleDirectionModal();
          }}
          className="mt-3 flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-md"
        >
          <Ionicons name="compass" size={16} color={"#228B22"} />
          <Text className={`font-semibold text-sm text-[#228B22]`}>
            View Direction
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BoardingPointCard;
