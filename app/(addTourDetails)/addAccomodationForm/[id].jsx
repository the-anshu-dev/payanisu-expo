import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

const RoomDetails = () => {
  const { id } = useLocalSearchParams();

  const [guestHouseName, setGuestHouseName] = useState("");
  const [location, setLocation] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("");
  const [totalOccupancy, setTotalOccupancy] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddGuestHouse = async () => {
    if (!guestHouseName || !location || !numberOfRooms || !totalOccupancy) {
      Alert.alert("Info", "Please fill all the fields.");
      return;
    }
    setLoading(true);
    const body = {
      tourId: id,
      guestHouseName,
      location,
      numberOfRoom: Number(numberOfRooms),
      totalOccupancy: Number(totalOccupancy),
    };
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/accommodation/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status !== 201) {
        throw new Error("Failed to add guest house");
      }

      setGuestHouseName("");
      setLocation("");
      setNumberOfRooms("");
      setTotalOccupancy("");
      Alert.alert("Success", "Guest house added successfully.");
      router.replace(`(addTourDetails)/accomodation/${id}`);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to add guest house.\nPlease try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="px-4 pt-4">
      <View
        style={{
          backgroundColor: "white",
          padding: 8,
          borderRadius: 5,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 10, color: "gray" }}>Guest House Name</Text>
        <TextInput
          style={{ fontSize: 16, marginTop: 4 }}
          placeholder="Enter guest house name"
          onChangeText={setGuestHouseName}
        />
      </View>
      <View
        style={{
          backgroundColor: "white",
          padding: 8,
          borderRadius: 5,
          marginTop: 10,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 10, color: "gray" }}>Location</Text>
        <TextInput
          style={{ fontSize: 16, marginTop: 4 }}
          placeholder="Enter location"
          onChangeText={setLocation}
        />
      </View>
      <View
        style={{
          backgroundColor: "white",
          padding: 8,
          borderRadius: 5,
          marginTop: 10,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 10, color: "gray" }}>Number of rooms</Text>
        <TextInput
          style={{ fontSize: 16, marginTop: 4 }}
          placeholder="Enter number of rooms"
          keyboardType="number-pad"
          onChangeText={setNumberOfRooms}
        />
      </View>
      <View
        style={{
          backgroundColor: "white",
          padding: 8,
          borderRadius: 5,
          marginTop: 10,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 10, color: "gray" }}>Total Occupancy</Text>
        <TextInput
          style={{ fontSize: 16, marginTop: 4 }}
          placeholder="Enter total occupancy"
          keyboardType="number-pad"
          onChangeText={setTotalOccupancy}
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleAddGuestHouse}
        style={{
          backgroundColor: "green",
          paddingVertical: 12,
          borderRadius: 5,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        {loading ? (
          <ActivityIndicator size={"small"} color={"white"} />
        ) : (
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Add Guest House
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RoomDetails;
