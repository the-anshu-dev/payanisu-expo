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
        <Text>Boarding Point </Text>
        <Text className={`mt-1 font-semibold`}>{`${boardingPointName}`}</Text>
      </View>
      <View className="mt-2">
        <Text>Boarding Location</Text>
        <Text className={`mt-1 font-semibold`}>{`${location}`}</Text>
      </View>
      <View className="mt-2">
        <Text>Boarding Time</Text>

<Text className="mt-1 font-semibold">
  {(() => {
    try {
      // Use the provided date and time (June 27, 2025, 11:57 PM IST)
      const fullDateTime = new Date('2025-06-27T23:57:00+05:30');
      return format(fullDateTime, 'dd MMM yyyy - hh:mm a');
    } catch (error) {
      return 'Invalid Date';
    }
  })()}
</Text>
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
