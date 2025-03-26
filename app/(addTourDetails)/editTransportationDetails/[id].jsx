import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ActivityIndicator } from "react-native-paper";
import { uploadFilesToS3 } from "../../../utils/uploadFileHelper";
import {
  showError,
  showSuccess,
  showWarning,
} from "../../../utils/toastHelper";

const { width, height } = Dimensions.get("window");

const EditTransport = () => {
  const { id } = useLocalSearchParams();

  const [busName, setBusName] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("");
  const [driverName, setDriver] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransportDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/transport/get?id=${id}`
        );
        const data = await response.json();
        setBusName(data.busName);
        setBusNumber(data.busNumber);
        setSeatingCapacity(data.capacity.toString());
        setDriver(data.driverName);
        setDriverContact(data.driverNumber);
        setImages(data.images || []);
      } catch (error) {
        showError("Failed to fetch transport details.");
      }
    };
    fetchTransportDetails();
  }, [id]);

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
      showWarning("Image not selected! Try again");
    }
  };

  const handleUpdateBusDetails = async () => {
    if (
      !busName ||
      !busNumber ||
      !seatingCapacity ||
      !driverName ||
      !driverContact
    ) {
      showWarning("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
        const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/transport/update?id=${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            busName,
            busNumber,
            capacity: Number(seatingCapacity),
            driverName,
            driverNumber: driverContact,
          }),
        }
      );
      
      await uploadFilesToS3(images, id, "bus");

      if (!res.ok) {
        throw new Error("Failed to update transport details");
      }
      router.back();
      showSuccess("Transport details updated successfully");
    } catch (error) {
      showError(error.message || "Update failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={{ width: "100%" }}>
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Bus Name</Text>
          <TextInput
            value={busName}
            onChangeText={setBusName}
            style={styles.formFieldInputText}
          />
        </View>
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Bus Number</Text>
          <TextInput
            value={busNumber}
            onChangeText={setBusNumber}
            style={styles.formFieldInputText}
          />
        </View>
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Seating Capacity</Text>
          <TextInput
            value={seatingCapacity}
            onChangeText={setSeatingCapacity}
            style={styles.formFieldInputText}
          />
        </View>
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Driver Name</Text>
          <TextInput
            value={driverName}
            onChangeText={setDriver}
            style={styles.formFieldInputText}
          />
        </View>
        <View style={styles.formFieldContainer}>
          <Text style={styles.formFieldText}>Driver Contact</Text>
          <TextInput
            value={driverContact}
            onChangeText={setDriverContact}
            style={styles.formFieldInputText}
          />
        </View>
        <View style={styles.busImageContainer}>
          {images.length > 0 ? (
            <View style={{ flexDirection: "row" }}>
              {images.map((img) => (
                <Image
                  key={img.fileName}
                  source={{ uri: img.uri }}
                  style={styles.images}
                />
              ))}
            </View>
          ) : (
            <TouchableOpacity style={styles.buttons} onPress={pickImage}>
              <Text style={{ color: "white" }}>Upload Bus Image</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.buttons, { backgroundColor: "gray" }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttons, { backgroundColor: "#228B22" }]}
          onPress={handleUpdateBusDetails}
        >
          {loading ? (
            <ActivityIndicator color="white" size={"small"} />
          ) : (
            <Text style={styles.buttonText}>Update</Text>
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
    backgroundColor: "#228B22",
  },
  buttonText: {
    fontWeight: "600",
    color: "white",
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
    borderColor: "#228B22",
    height: height * 0.15,
    borderRadius: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
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

export default EditTransport;
