import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import MyTourInfo from "../../components/MyTourInfo";
import MyTourCheckPoints from "../../components/MyTourCheckPoints";
import { Ionicons } from "@expo/vector-icons";
import MyTourCheckPointsListView from "../../components/MyTourCheckPointsListView";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError } from "../../utils/toastHelper";

const { width } = Dimensions.get("window");

const MyTourDetails = () => {
  const { id } = useLocalSearchParams();
  const { user } = useSelector((state) => state.user);
  const { mapLink } = useSelector((state) => state.map);

  const { bookedTour } = useSelector((state) => state.tour);
  const tour = bookedTour?.find((t) => t.tourDetails._id === id);

  const isTourCurrentlyActive =
    tour?.tourDetails.tour_start > new Date() ? true : false;

  const [loading, setLoading] = useState();
  const [checkPoints, setCheckPoints] = useState();

  const [geoTaggedCheckPoints, setGeoTaggedCheckPoints] = useState([]);

  const [activeTab, setActiveTab] = useState("tourInfo");
  const [listView, setListView] = useState(true);

  const tabWidth = width * 0.5;
  const barWidth = width * 0.35;
  const translateX = useSharedValue(-tabWidth);
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + (tabWidth - barWidth) / 2 }],
  }));

  const handleGetCheckPoints = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/get?email=${user?.email}&tourId=${id}`
      );
      if (response.status !== 200) {
        throw new Error("Failed to get checkpoints.");
      }
      const result = await response.json();
      setCheckPoints(result);
      const geoTaggedData = result.filter(
        (i) => i.type === "Geo Tagging" && i.checked === false
      );
      await AsyncStorage.setItem("geoTaggedCheckPoints", JSON.stringify(geoTaggedData));
      setGeoTaggedCheckPoints(geoTaggedData);
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    translateX.value = withSpring(tab === "checkPoints" ? 0 : -tabWidth);
  };

  const handleOpenMap = () => {
    if (!mapLink) {
      return;
    }
    Linking.openURL(mapLink);
  };

  useEffect(() => {
    handleGetCheckPoints();
  }, []);

  return (
    <View className={`relative h-full flex items-center`}>
      <View className="px-8 w-full flex justify-center items-center">
        <View className="flex flex-row justify-between">
          <Pressable onPress={() => handleTabPress("tourInfo")}>
            <View style={{ width: tabWidth }} className="py-2">
              <Text className="text-center text-xl font-semibold">
                Tour Details
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={() => handleTabPress("checkPoints")}>
            <View style={{ width: tabWidth }} className="py-2">
              <Text className="text-center text-xl font-semibold">
                Checkpoints
              </Text>
            </View>
          </Pressable>
        </View>
        <Animated.View style={[animatedStyles]}>
          <View
            style={{ width: barWidth }}
            className="bg-[#228B22] h-1.5 rounded-t-xl absolute bottom-0"
          />
        </Animated.View>
      </View>
      <View className={`w-full`}>
        {activeTab === "tourInfo" ? (
          <MyTourInfo tour={tour} />
        ) : listView ? (
          <MyTourCheckPointsListView
            isTourCurrentlyActive={isTourCurrentlyActive}
            checkPoints={checkPoints}
            geoTaggedCheckPoints={geoTaggedCheckPoints}
            tourId={id}
            handleGetCheckPoints={handleGetCheckPoints}
          />
        ) : (
          <MyTourCheckPoints
            isTourCurrentlyActive={isTourCurrentlyActive}
            checkPoints={checkPoints}
          />
        )}
      </View>
      <View
        className={`absolute bottom-0 w-full py-2 flex flex-row justify-center gap-4 bg-white`}
      >
        {activeTab === "tourInfo" ? (
          <TouchableOpacity
            onPress={() => handleTabPress("checkPoints")}
            activeOpacity={0.9}
          >
            <View
              style={{ width: width * 0.4 }}
              className={`flex flex-row justify-center items-center bg-gray-500 h-12 gap-2 rounded-lg`}
            >
              <Ionicons
                name={"checkmark-circle-outline"}
                size={20}
                color="white"
              />
              <Text className={`font-semibold text-white`}>Check Points</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setListView(!listView)}
            activeOpacity={0.9}
          >
            <View
              style={{ width: width * 0.45 }}
              className={`flex flex-row justify-center items-center bg-gray-500 h-12 gap-2 rounded-lg`}
            >
              <Ionicons
                name={listView ? "compass" : "list"}
                size={20}
                color="white"
              />
              <Text className={`font-semibold text-white`}>
                {listView ? "Map View" : "List View"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleOpenMap}
          disabled={activeTab === "tourInfo" || listView}
          activeOpacity={0.9}
          style={{ opacity: activeTab === "tourInfo" || listView ? 0.8 : 1 }}
        >
          <View
            style={{ width: width * 0.45 }}
            className={`flex flex-row justify-center items-center bg-[#228B22] h-12 gap-2 rounded-lg`}
          >
            <Ionicons name="locate-outline" size={20} color="white" />
            <Text className={`font-semibold text-white`}>Open in Maps</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MyTourDetails;
