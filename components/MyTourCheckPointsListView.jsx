import React from "react";
import { View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import CheckPointElement from "./UI/CheckPointElement";
import { Ionicons } from "@expo/vector-icons";

const MyTourCheckPointsListView = ({
  checkPoints,
  handleGetCheckPoints,
  isTourCurrentlyActive,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >
      <View className="px-3 flex flex-col gap-3 mt-2">
        {checkPoints && checkPoints.length > 0 ? (
          checkPoints.map((points, index) => (
            <CheckPointElement
              key={index}
              points={points}
              index={index}
              handleGetCheckPoints={handleGetCheckPoints}
              isTourCurrentlyActive={isTourCurrentlyActive}
            />
          ))
        ) : (
          <View
            style={{
              height: "100%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Ionicons name="navigate-circle-outline" size={48} color={"gray"} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 4,
                color: "gray",
              }}
            >
              No checkpoints added yet
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default MyTourCheckPointsListView;
