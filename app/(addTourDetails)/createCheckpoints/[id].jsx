import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { router, useLocalSearchParams } from "expo-router";
import { apiRequest } from "../../../utils/helpers";
import * as Location from "expo-location"

const { width, height } = Dimensions.get("window");

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
    const apiKey = "AIzaSyAWiZa_f1BStr9sDkGGJdDvmOV76-SVoFo";
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
      !locationType
    ) {
      Alert.alert("Empty field", "Please fill all the fields.");
      return;
    }

    if(locationType === "Geo Tagging" && (!latitude || !longitude)) {
      Alert.alert("Empty field", "Please select location.");
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
      const res = await apiRequest(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/create-point`,
        "POST",
        body
      );

      if (res) {
        console.log("Checkpoint created successfully:", res);
        router.replace(`/(addTourDetails)/checkPoints/${id}`);
      }
    } catch (error) {
      console.log("Failed to create checkpoint:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="h-full flex justify-between items-center w-full relative px-2">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: 1,
        }}
        style={{ width: "100%", flex: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-3 h-full w-full flex justify-between items-center pb-12">
          <View className="w-full flex justify-start items-center gap-3">
            <View className="mt-3 p-2 rounded-lg w-full bg-white shadow-lg shadow-black/50">
              <Text className="text-xs text-gray-500/70">Title</Text>
              <TextInput
                placeholder="Enter Title"
                className="text-black text-base mt-1"
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <View className="p-2 rounded-lg w-full bg-white shadow-lg shadow-black/50">
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
            <View className="w-full">
              <View className="rounded-lg w-full bg-white shadow-lg shadow-black/50">
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
            {
              locationType === "Geo Tagging" && (<View className="w-full flex justify-start items-center">
              <View className="w-full">
                <GooglePlacesAutocomplete
                  ref={googlePlacesRef}
                  placeholder="Search location"
                  minLength={2}
                  fetchDetails={true}
                  onPress={(data, details = null) =>
                    handleLocationSelect(details)
                  }
                  query={{
                    key: "AIzaSyAWiZa_f1BStr9sDkGGJdDvmOV76-SVoFo",
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
                      color: "black",
                      zIndex: 1000,
                    },
                  }}
                />
              </View>
              <View className="h-fit w-full rounded-xl overflow-hidden mt-2 border border-gray-500/50">
                <MapView
                  style={{ height: height * 0.45, width: "100%" }}
                  className="rounded-xl"
                  region={region}
                  onPress={handleMapPress}
                >
                  <Marker coordinate={markerPosition} />
                </MapView>
              </View>
            </View>)
            }
          </View>
        </View>
      </ScrollView>
      <View className="w-full flex justify-center items-center absolute bottom-0 mb-2">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddCheckPoint}
          style={{
            width: width * 0.9,
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
