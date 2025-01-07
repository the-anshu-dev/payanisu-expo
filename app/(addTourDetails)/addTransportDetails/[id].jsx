import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ActivityIndicator } from "react-native-paper";
import { uploadFilesToS3 } from "../../../utils/uploadFileHelper";

const { width, height } = Dimensions.get("window");

const TransportDetails = () => {
  const { id } = useLocalSearchParams();

  const [busName, setBusName] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("");
  const [driverName, setDriver] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets);
    } else {
      setError("Image not selected! Try again");
    }
  };

  const handleAddBusDetails = async () => {
    if (
      !busName ||
      !busNumber ||
      !seatingCapacity ||
      !driverName ||
      !driverContact ||
      images.length === 0
    ) {
      Alert.alert("Empty fields!", "Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/transport/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tourId: id,
            busName: busName,
            busNumber: busNumber,
            capacity: seatingCapacity,
            driverName: driverName,
            driverNumber: driverContact,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add bus details");
      }

      const result = await response.json();

      try {
        await uploadFilesToS3(images, id, "bus");
      } catch (error) {
        await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/transport/delete?id=${result._id}`
        );
        throw new Error("Failed to upload images.");
      }
      Alert.alert("Added", "Bus details added successfully.");
      router.back();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Oops", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          paddingBottom: 80,
        }}
        style={{
          width: "100%",
        }}
      >
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Bus Name</Text>
          <TextInput onChangeText={setBusName} style={styles.formFieldInputText} />
        </View>
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Bus Number</Text>
          <TextInput
            onChangeText={setBusNumber}
            style={styles.formFieldInputText}
          />
        </View>
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Seating Capacity</Text>
          <TextInput
            onChangeText={setSeatingCapacity}
            style={styles.formFieldInputText}
          />
        </View>
        <Text
          style={{
            paddingVertical: 10,
            fontSize: 16,
            fontWeight: 500,
            textAlign: "left",
            width: "100%",
          }}
        >
          Driver Details
        </Text>
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Driver Name</Text>
          <TextInput onChangeText={setDriver} style={styles.formFieldInputText} />
        </View>
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Driver Contact Number</Text>
          <TextInput
            onChangeText={setDriverContact}
            style={styles.formFieldInputText}
          />
        </View>
        <Text
          style={{
            paddingVertical: 10,
            fontSize: 16,
            fontWeight: 500,
            textAlign: "left",
            width: "100%",
          }}
        >
          Photo Gallery
        </Text>
        <View style={styles.busImageContainer}>
          <View>
            {images.length > 0 ? (
              <View style={{ display: "flex", flexDirection: "row" }}>
                {images.map((img) => {
                  return (
                    <Image
                      key={img.fileName}
                      source={{ uri: img.uri }}
                      style={styles.images}
                    />
                  );
                })}
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.6}
                style={[styles.buttons, { backgroundColor: "green" }]}
                onPress={pickImage}
              >
                <Text style={{ color: "white" }}>Upload Bus Image</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.buttons, { backgroundColor: "white", borderWidth: 1 }]}
          activeOpacity={0.6}
          onPress={() => {
            router.back();
          }}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttons, { backgroundColor: "green" }]}
          activeOpacity={0.6}
          onPress={handleAddBusDetails}
        >
          {loading ? (
            <ActivityIndicator color="white" size={"small"} />
          ) : (
            <Text style={[styles.buttonText, { color: "white" }]}>Add</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    height: "100%",
    width: "100%",
    position: "relative",
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  buttons: {
    width: width * 0.4,
    height: height * 0.05,
    borderRadius: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
  formFieldContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
    padding: 3,
    borderRadius: 6,
    marginTop: 10,
  },
  formFieldText: {
    color: "gray",
    fontSize: 12,
  },
  formFieldInputText: {
    fontSize: 16,
    fontWeight: "500",
  },
  busImageContainer: {
    width: "100%",
    borderWidth: 2,
    borderColor: "green",
    height: height * 0.15,
    borderRadius: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  boardingPointFormContainer: {
    width: "100%",
  },
  images: {
    width: width * 0.24,
    height: height * 0.12,
    borderRadius: 6,
    marginRight: 8,
  },
});

export default TransportDetails;
