import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const AccomodationDetailsElement = ({ details, accommodation }) => {
  return (
    <View className="mt-4 space-y-2 pl-2">
      {/* <View>
        <Text>{`Day ${details?.id}`}</Text>
        <Text className={`font-semibold `}>{`${details?.date}`}</Text>
      </View> */}
      <View>
        <Text>{`Place`}</Text>
        <Text
          className={`font-semibold `}
        >{`${accommodation[0]?.location}`}</Text>
      </View>
      <View>
        <Text>{`Hotel Name`}</Text>
        <Text
          className={`font-semibold `}
        >{`${accommodation[0]?.guestHouseName}`}</Text>
      </View>
      <View>
        <Text className={`font-bold `}>{`Room`}</Text>
        <Text
          className={`font-bold `}
        >{`${details?.roomNumber} (${details?.roomType})`}</Text>
      </View>
      <View className={`w-full h-[1px] "bg-green-700"`} />
    </View>
  );
};

export default AccomodationDetailsElement;
