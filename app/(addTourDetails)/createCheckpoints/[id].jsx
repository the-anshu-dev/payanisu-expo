import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { router, useLocalSearchParams } from "expo-router";
import { apiRequest } from "../../../utils/helpers";
import * as Location from "expo-location";
import {
  showError,
  showSuccess,
  showWarning,
} from "../../../utils/toastHelper";

const { width, height } = Dimensions.get("window");
const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const INITIAL_REGION = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const Page = () => {
  const { id } = useLocalSearchParams();
  const googlePlacesRef = useRef();

  const [region, setRegion] = useState(INITIAL_REGION);
  const [markerPosition, setMarkerPosition] = useState(INITIAL_REGION);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationType, setLocationType] = useState("Geo Tagging");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion((prev) => ({ ...prev, latitude, longitude }));
      setMarkerPosition({ latitude, longitude });
      setCoordinates({ latitude, longitude });
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      setErrorMsg("Failed to get current location");
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results?.[0]) {
        const address = data.results[0].formatted_address;
        setSelectedAddress(address);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const handleLocationSelect = (details) => {
    if (!details?.geometry?.location) return;

    const { lat, lng } = details.geometry.location;
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    });
    setMarkerPosition({ latitude: lat, longitude: lng });
    setCoordinates({ latitude: lat, longitude: lng });
    setSelectedAddress(details.formatted_address);
    setModalVisible(false);
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    setCoordinates({ latitude, longitude });
    setRegion((prev) => ({ ...prev, latitude, longitude }));
    await reverseGeocode(latitude, longitude);
  };

  const handleAddCheckPoint = async () => {
    if (!id || !title || !description || !locationType) {
      showWarning("All fields are required");
      return;
    }

    if (
      locationType === "Geo Tagging" &&
      (!coordinates.latitude || !coordinates.longitude)
    ) {
      showWarning("Please select a location.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/create-point`,
        "POST",
        {
          tourId: id,
          name: title,
          description,
          type: locationType,
          longitude: coordinates.longitude,
          latitude: coordinates.latitude,
        }
      );

      if (res.data) {
        showSuccess("Checkpoint created successfully.");
        router.back();
      }
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <View className="h-full flex justify-between items-center w-full relative px-2">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
        className="w-full h-full"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-3 h-full w-full flex justify-between items-center pb-12">
          {errorMsg && (
            <Text className="mt-2 font-semibold text-lg text-red-500">
              {errorMsg}
            </Text>
          )}

          <View className="w-full flex justify-start items-center gap-3">
            <View className="mt-3 p-2 rounded-sm w-full bg-white shadow-lg">
              <Text className="text-xs text-gray-500">Title</Text>
              <TextInput
                placeholder="Enter Title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="p-2 rounded-sm w-full bg-white shadow-lg">
              <Text className="text-xs text-gray-500">Description</Text>
              <TextInput
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                onChangeText={setDescription}
                value={description}
                placeholder="Enter description"
              />
            </View>
            <Picker
              selectedValue={locationType}
              onValueChange={setLocationType}
              style={{
                height: 50,
                width: "100%",
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Picker.Item label="Geo Tagging" value="Geo Tagging" />
              <Picker.Item label="QR Code" value="Qr Code" />
            </Picker>

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ padding: 10, backgroundColor: "#ddd", borderRadius: 8 }}
            >
              <Text>{selectedAddress || "Select Location"}</Text>
            </TouchableOpacity>
            <MapView
              style={{ height: height * 0.45, width: "100%" }}
              region={region}
              onPress={handleMapPress}
            >
              <Marker coordinate={markerPosition} />
            </MapView>
          </View>
        </View>
      </ScrollView>
      <View className="w-full flex justify-center items-center absolute bottom-0 mb-2">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleAddCheckPoint}
          style={{
            width: width * 0.9,
            backgroundColor: "#228B22",
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            <Text style={{ textAlign: "center", color: "#fff" }}>
              Add Check Point
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "400", marginBottom: 10 }}>
            Select Location
          </Text>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Search location"
            fetchDetails
            onPress={(data, details) => handleLocationSelect(details)}
            query={{ key: apiKey, language: "en" }}
            styles={{
              textInputContainer: {
                backgroundColor: "#fff",
                borderRadius: 8,
                padding: 2,
                marginBottom: 20,
                borderWidth: 2,
              },
              textInput: {
                height: 40,
                fontSize: 18,
              },
            }}
          />
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: "#ddd",
              borderRadius: 8,
            }}
          >
            <Text style={{ textAlign: "center" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Page;
