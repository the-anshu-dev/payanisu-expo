import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { useLocalSearchParams, router } from "expo-router";
  import { showError, showSuccess, showWarning } from "../../../utils/toastHelper";
  
  const EditAccomodationDetails = () => {
    const { id } = useLocalSearchParams();
  
    const [guestHouseName, setGuestHouseName] = useState("");
    const [location, setLocation] = useState("");
    const [numberOfRooms, setNumberOfRooms] = useState("");
    const [totalOccupancy, setTotalOccupancy] = useState("");
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
  
    useEffect(() => {
      fetchAccommodationDetails();
    }, []);
  
    const fetchAccommodationDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/accommodation/get?id=${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch accommodation details");
        }
        const data = await response.json();
        console.log("data", data);
        setGuestHouseName(data.guestHouseName);
        setLocation(data.location);
        setNumberOfRooms(data.numberOfRoom.toString());
        setTotalOccupancy(data.totalOccupancy.toString());
      } catch (error) {
        showError(error.message || "Failed to load details");
      } finally {
        setLoading(false);
      }
    };
  
    const handleUpdateGuestHouse = async () => {
      if (!guestHouseName || !location || !numberOfRooms || !totalOccupancy) {
        showWarning("Please fill all the fields.");
        return;
      }
      setIsUpdating(true);
      const body = {
        guestHouseName,
        location,
        numberOfRoom: Number(numberOfRooms),
        totalOccupancy: Number(totalOccupancy),
      };
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/accommodation/update?id=${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to update guest house");
        }
  
        showSuccess("Guest house updated successfully");
        router.back();
      } catch (error) {
        showError(error.message || "Please try again.");
      } finally {
        setIsUpdating(false);
      }
    };
  
    return (
      <View className="px-4 pt-4">
        {loading ? (
          <ActivityIndicator size="large" color="green" />
        ) : (
          <>
            <View style={{ backgroundColor: "white", padding: 8, borderRadius: 5, elevation: 8 }}>
              <Text style={{ fontSize: 10, color: "gray" }}>Guest House Name</Text>
              <TextInput
                style={{ fontSize: 16, marginTop: 4 }}
                placeholder="Enter guest house name"
                value={guestHouseName}
                onChangeText={setGuestHouseName}
              />
            </View>
            <View style={{ backgroundColor: "white", padding: 8, borderRadius: 5, marginTop: 10, elevation: 8 }}>
              <Text style={{ fontSize: 10, color: "gray" }}>Location</Text>
              <TextInput
                style={{ fontSize: 16, marginTop: 4 }}
                placeholder="Enter location"
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <View style={{ backgroundColor: "white", padding: 8, borderRadius: 5, marginTop: 10, elevation: 8 }}>
              <Text style={{ fontSize: 10, color: "gray" }}>Number of rooms</Text>
              <TextInput
                style={{ fontSize: 16, marginTop: 4 }}
                placeholder="Enter number of rooms"
                keyboardType="number-pad"
                value={numberOfRooms}
                onChangeText={setNumberOfRooms}
              />
            </View>
            <View style={{ backgroundColor: "white", padding: 8, borderRadius: 5, marginTop: 10, elevation: 8 }}>
              <Text style={{ fontSize: 10, color: "gray" }}>Total Occupancy</Text>
              <TextInput
                style={{ fontSize: 16, marginTop: 4 }}
                placeholder="Enter total occupancy"
                keyboardType="number-pad"
                value={totalOccupancy}
                onChangeText={setTotalOccupancy}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleUpdateGuestHouse}
              style={{
                backgroundColor: "green",
                paddingVertical: 12,
                borderRadius: 5,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 16,
              }}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ color: "white", fontWeight: "bold" }}>Update Guest House</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };
  
  export default EditAccomodationDetails;