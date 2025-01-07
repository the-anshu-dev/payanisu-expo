import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { router, useLocalSearchParams } from "expo-router";
import { apiRequest } from "../../../utils/helpers";
import * as Location from "expo-location"

const Page = () => {
  const { id } = useLocalSearchParams();

  const googlePlacesRef = useRef();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationType, setLocationType] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectLocation, setSelectLocation] = useState(false);

  const [location, setLocation] = useState();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  const [region, setRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
  });

  const [selectedAddress, setSelectedAddress] = useState("");

  // Function to fetch address based on latitude and longitude
  const reverseGeocode = async (latitude, longitude) => {
    const apiKey = "AIzaSyB_EhOLUePnuFPSOSSjRyAWZRUb2jWcQ8s";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setSelectedAddress(address);
        googlePlacesRef.current?.setAddressText(address);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  // Function to handle location selection (e.g., from Google Places)
  const handleLocationSelect = (details) => {
    console.log("details-->", details);
    if (details && details.geometry) {
      const { lat, lng } = details.geometry.location;
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
      setLatitude(lat);
      setLongitude(lng);
      setMarkerPosition({ latitude: lat, longitude: lng });
      setSelectedAddress(details.formatted_address);
    } else {
      console.error("Invalid location details:", details);
    }
  };

  // Function to handle map press and update location
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Update the marker and reverse geocode to fetch the address
    setMarkerPosition({ latitude, longitude });
    setLatitude(latitude);
    setLongitude(longitude);

    // Fetch the address for the selected coordinates
    reverseGeocode(latitude, longitude);
  };

  // Function to create a checkpoint
  const handleAddCheckPoint = async () => {
    if (
      !id ||
      !title ||
      !description ||
      !locationType ||
      !longitude ||
      !latitude
    ) {
      Alert.alert("Value not found", "All fields required!");
      return;
    }

    setLoading(true);

    const body = {
      tourId: id,
      name: title,
      description,
      type: locationType,
      longitude,
      latitude,
    };

    try {
      console.log("Saving checkpoint with data:", body);

      const res = await apiRequest(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/create-point`,
        "POST",
        body
      );

      if (res) {
        console.log("Checkpoint created successfully:", res);
        router.push(`/(addTourDetails)/checkPoints/${id}`);
      }
    } catch (error) {
      console.error("Failed to create checkpoint:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="h-full flex justify-between items-center w-full relative">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: 1,
        }}
        style={{ width: "100%", flex: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-3 h-full w-full flex justify-between items-center">
          <View className="w-full flex justify-start items-center">
            <View className="border mt-3 border-gray-500/50 p-2 rounded-lg w-full">
              <Text className="text-xs text-gray-500/70">Title</Text>
              <TextInput
                placeholder="Enter Title"
                className="text-black text-base mt-1"
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <View className="border mt-2 border-gray-500/50 p-2 rounded-lg w-full">
              <Text className="text-xs text-gray-500/70">Description</Text>
              <TextInput
                multiline={true}
                numberOfLines={5}
                textAlignVertical="top"
                onChangeText={setDescription}
                value={description}
                placeholder="Enter description"
                className="text-black text-base mt-1"
              />
            </View>
            <View className="w-full mt-2">
              <View className="border border-gray-500/50 rounded-lg w-full">
                <Picker
                  selectedValue={locationType}
                  onValueChange={setLocationType}
                  className="px-3"
                >
                  <Picker.Item label="Geo Tagging" value="Geo Tagging" />
                  <Picker.Item label="QR Code" value="Qr Code" />
                </Picker>
              </View>
            </View>
            <View className="w-full flex justify-start items-center mt-2">
              <View className="w-full">
                <GooglePlacesAutocomplete
                  ref={googlePlacesRef}
                  placeholder="Search for a location"
                  minLength={2}
                  fetchDetails={true}
                  onPress={(data, details = null) =>
                    handleLocationSelect(details)
                  }
                  query={{
                    key: "AIzaSyB_EhOLUePnuFPSOSSjRyAWZRUb2jWcQ8s",
                    language: "en",
                  }}
                  styles={{
                    container: {
                      width: "100%",
                      zIndex: 1000,
                    },
                    textInput: {
                      height: 44,
                      paddingHorizontal: 10,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 5,
                      color: "black",
                      zIndex: 1000,
                    },
                  }}
                />
              </View>
              <View className="h-fit w-full rounded-xl overflow-hidden mt-2 border border-gray-500/50">
                <MapView
                  className="h-[350px] w-full rounded-xl"
                  region={region}
                  onPress={handleMapPress}
                >
                  <Marker coordinate={markerPosition} />
                </MapView>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="w-full flex justify-center items-center absolute bottom-0 mb-2">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddCheckPoint}
          style={{
            width: 350,
            backgroundColor: "green",
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
    </View>
  );
};

export default Page;
