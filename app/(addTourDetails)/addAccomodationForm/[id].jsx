import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  showError,
  showSuccess,
  showWarning,
} from "../../../utils/toastHelper";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { uploadFilesToS3 } from "../../../utils/uploadFileHelper";

const RoomDetails = () => {
  const { id } = useLocalSearchParams();

  const [guestHouseName, setGuestHouseName] = useState("");
  const [location, setLocation] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("");
  const [totalOccupancy, setTotalOccupancy] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, ...result.assets]);
    } else {
      showWarning("Image not selected! Try again");
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const handleAddGuestHouse = async () => {
    if (!guestHouseName || !location || !numberOfRooms || !totalOccupancy) {
      showWarning("Please fill all the fields.");
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

      const res = await response.json();
      const { _id } = res;

      await uploadFilesToS3(images, _id, "accommodation");

      setGuestHouseName("");
      setLocation("");
      setNumberOfRooms("");
      setTotalOccupancy("");
      setImages([]);
      router.replace(`(addTourDetails)/accomodation/${id}`);
      showSuccess("Guest house added successfully");
    } catch (error) {
      showError(error.message || "Please try again.");
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

      {images.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 10,
            padding: 8,
            gap: 8,
          }}
        >
          {images.map((image, index) => (
            <View key={index} style={{ position: "relative" }}>
              <Image
                source={{ uri: image.uri }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 5,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              />
              <TouchableOpacity
                onPress={() => handleRemoveImage(index)}
                style={{
                  position: "absolute",
                  top: -8,
                  right: 0,
                  backgroundColor: "red",
                  borderRadius: 50,
                  padding: 3,
                }}
              >
                <Ionicons name="close" size={12} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <View style={{ alignItems: "center", marginTop: 10, width: "100%" }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={pickImage}
          style={{
            width: "100%",
            height: 50,
            backgroundColor: "#f0f0f0",
            padding: 8,
            borderRadius: 5,
            marginTop: 10,
            elevation: 8,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="add-circle" size={20} color={"#228B22"} />
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#228B22" }}>
            {images.length > 0 ? "Select More Images" : "Select Images"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleAddGuestHouse}
        style={{
          backgroundColor: "#228B22",
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
