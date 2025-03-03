import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useState } from "react";
import { shorten } from "./PostComponent";
import { apiRequest } from "../../utils/helpers";
import { useSelector } from "react-redux";
import { format } from "date-fns";

const { height, width } = Dimensions.get("window");

const Notifications = ({ id, title, content, seen, createdAt }) => {
  const { user } = useSelector((state) => state.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const maxModalHeight = height * 0.5;

  const handleSeen = async () => {
    if (!seen) {
      try {
        await apiRequest(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/update`,
          "POST",
          { email: user.email, notificationId: id }
        );
      } catch (error) {
        console.log("Failed to update", error);
      }
    }
    setModalVisible(true);
  };

  const formattedDateTime = format(new Date(createdAt), "dd MMM yyyy h:mm a");

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={handleSeen}>
        <View className="border border-green-600 h-fit rounded-lg p-2 mt-3 relative">
          {!seen && (
            <View className="h-2 w-2 bg-red-600 absolute right-2 top-2 rounded-full" />
          )}
          <View className="flex flex-row justify-start items-center gap-3">
            <FontAwesome6 name="bell" size={16} color={"green"} />
            <Text className="text-base font-semibold">{title}</Text>
          </View>
          {content && (
            <View className="mt-2">
              <Text className="tracking-wide text-justify ">
                {shorten(content, 160)}
              </Text>
            </View>
          )}
          <View style={{ marginTop: 5 }}>
            <Text className="text-sm font-semibold text-gray-400">
              {formattedDateTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View
            style={{
              maxHeight: maxModalHeight,
              width: width * 0.9,
            }}
            className="bg-white rounded-lg p-5"
          >
            <ScrollView
              style={{ maxHeight: maxModalHeight }}
              scrollEnabled={contentHeight > maxModalHeight}
              showsVerticalScrollIndicator={false}
            >
              <View
                onLayout={(event) => {
                  const { height } = event.nativeEvent.layout;
                  setContentHeight(height);
                }}
              >
                <Text className="text-lg font-bold">{title}</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {formattedDateTime}
                </Text>
                <Text className="text-base mt-3">{content}</Text>
              </View>
            </ScrollView>
            <TouchableOpacity
              className="mt-3 bg-green-600 py-2 rounded-lg"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Notifications;
