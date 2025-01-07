import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import CheckPointElement from "./UI/CheckPointElement";
import { checkInUser } from "../utils/helpers";
import { useSelector } from "react-redux";

const MyTourCheckPointsListView = ({
  geoTaggedCheckPoints,
  checkPoints,
  handleGetCheckPoints,
}) => {
  const [userLocation, setUserLocation] = useState(null);

  const { user } = useSelector((state) => state.user);

  // Function to calculate distance between two points (Haversine Formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Function to send a local notification
  const sendNotification = async (checkpoint) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Checkpoint Reached!",
        body: `You are near ${checkpoint?.name}.`,
        data: "You are checked in now.",
      },
      trigger: null, // Immediate notification
    });
  };

  // Function to check if user is within 100 meters of any checkpoint
  const checkProximity = async (location) => {
    const unprocessedCheckpoints = [];

    if (!geoTaggedCheckPoints) {
      return;
    }

    for (const checkpoint of geoTaggedCheckPoints) {
      // Skip checkpoints that are not activated
      if (!checkpoint?.activated) {
        continue;
      }

      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        checkpoint.latitude,
        checkpoint.longitude
      );

      if (distance <= 100) {
        const checkpointKey = `checkpoint_${checkpoint._id}`;
        const isAlreadyProcessed = await AsyncStorage.getItem(checkpointKey);

        if (!isAlreadyProcessed) {
          // Log the checkpoint reached
          const logEntry = {
            checkpointId: checkpoint?._id,
            userLocation: location,
            message: `User reached checkpoint: ${checkpoint?.name}`,
            timestamp: new Date().toISOString(),
          };
          await AsyncStorage.setItem(
            `log_${checkpoint?._id}`,
            JSON.stringify(logEntry)
          );

          // Notify and store the checkpoint
          await sendNotification(checkpoint);
          await AsyncStorage.setItem(checkpointKey, JSON.stringify(checkpoint));

          unprocessedCheckpoints.push({
            email: user?.email,
            tourId: checkpoint.tourId,
            checkPointId: checkpoint._id,
          });
        }
      }
    }

    // Process each unprocessed checkpoint (check-in)
    for (const body of unprocessedCheckpoints) {
      console.log("Checking in for:", body);
      await checkInUser(body); // Call the check-in function

      // Log the check-in attempt
      const logEntry = {
        checkInAttempt: true,
        body: body,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        `log_checkin_${body.checkPointId}`,
        JSON.stringify(logEntry)
      );
    }
  };
  
  // Function to track user's live location
  const trackUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (location) => {
          setUserLocation(location.coords);
          checkProximity(location.coords);
        }
      );
    } catch (error) {
      console.error("Error tracking location:", error);
    }
  };

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Notification access is required.");
    }
  };

  useEffect(() => {
    requestNotificationPermissions();
    trackUserLocation();
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
        paddingHorizontal: 5,
      }}
    >
      <View>
        {checkPoints && checkPoints.length > 0 ? (
          checkPoints.map((points, index) => (
            <CheckPointElement
              key={index}
              points={points}
              index={index}
              handleGetCheckPoints={handleGetCheckPoints}
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
            <Ionicons
              name="navigate-circle-outline"
              size={48}
              color={"green"}
            />
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 4 }}>
              No checkpoints added yet
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default MyTourCheckPointsListView;
