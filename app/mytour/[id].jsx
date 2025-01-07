import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
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

const MyTourDetails = () => {
  const { id } = useLocalSearchParams();
  const { user } = useSelector((state) => state.user);

  const { bookedTour } = useSelector((state) => state.tour);

  const [loading, setLoading] = useState();
  const [checkPoints, setCheckPoints] = useState();

  const [geoTaggedCheckPoints, setGeoTaggedCheckPoints] = useState([]);

  const tour = bookedTour?.find((t) => t.tourDetails._id === id);

  const translateX = useSharedValue(-200);

  const [activeTab, setActiveTab] = useState("tourInfo");
  const [listView, setListView] = useState(true);

  const handleTabPress = (tabIndex) => {
    setActiveTab(tabIndex);
    translateX.value = tabIndex === "tourInfo" ? -200 : 0;
  };

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
      setGeoTaggedCheckPoints(geoTaggedData);
    } catch (error) {
      console.log("error:", error);
      Alert.alert("Oops!", "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const springConfig = {
    damping: 20,
    stiffness: 100,
    mass: 1,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(translateX.value, springConfig) }],
  }));

  useEffect(() => {
    handleGetCheckPoints();
  }, []);

  return (
    <View className={`px-3 relative h-full flex items-center`}>
      <View className={`px-5 w-full flex justify-center items-center`}>
        <View className={`flex flex-row justify-between`}>
          <Pressable onPress={() => handleTabPress("tourInfo")}>
            <View className={`w-[200px] py-2`}>
              <Text className={`text-center text-[15px] font-semibold `}>
                Tour Information
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={() => handleTabPress("checkPoints")}>
            <View className={`w-[200px] py-2`}>
              <Text className={`text-center font-semibold `}>Checkpoints</Text>
            </View>
          </Pressable>
        </View>
        <Animated.View style={[animatedStyles]}>
          <View
            className={`bg-green-600 w-[160px] h-1.5 rounded-t-xl absolute bottom-0 left-5`}
          />
        </Animated.View>
      </View>
      <View className={`w-full`}>
        {activeTab === "tourInfo" ? (
          <MyTourInfo tour={tour} />
        ) : listView ? (
          <MyTourCheckPointsListView
            checkPoints={checkPoints}
            geoTaggedCheckPoints={geoTaggedCheckPoints}
            tourId={id}
            handleGetCheckPoints={handleGetCheckPoints}
          />
        ) : (
          <MyTourCheckPoints />
        )}
      </View>
      <View
        className={`absolute bottom-0 w-full py-2 px-2 flex flex-row justify-between bg-transparent`}
      >
        {activeTab === "tourInfo" ? (
          <TouchableOpacity
            onPress={() => handleTabPress("checkPoints")}
            activeOpacity={0.8}
          >
            <View
              className={`flex flex-row justify-center items-center bg-gray-500 w-[170px] h-12 space-x-4 rounded-lg`}
            >
              <Ionicons
                name={"checkmark-circle-outline"}
                size={20}
                color="white"
              />
              <Text className={` font-semibold`}>Check Points</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setListView(!listView)}
            activeOpacity={0.8}
          >
            <View
              className={`flex flex-row justify-center items-center bg-gray-500 w-[170px] h-12 space-x-4 rounded-lg`}
            >
              <Ionicons
                name={listView ? "compass" : "list"}
                size={20}
                color="white"
              />
              <Text className={` font-semibold`}>
                {listView ? "Map View" : "List View"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity activeOpacity={0.8}>
          <View
            className={`flex flex-row justify-center items-center bg-green-700 w-[170px] h-12 space-x-4 rounded-lg`}
          >
            <Ionicons name="qr-code-outline" size={20} color="white" />
            <Text className={` font-semibold`}>Check-In</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MyTourDetails;
