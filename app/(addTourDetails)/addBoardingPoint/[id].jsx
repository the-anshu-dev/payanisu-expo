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
import React, { useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

const { width } = Dimensions.get("window");

const Page = () => {
  const { id } = useLocalSearchParams();

  const googlePlacesRef = useRef();

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLogitude] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowTimePicker(false);
    setTime(currentDate);
  };

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

  const handleLocationSelect = (details) => {
    if (details && details.geometry) {
      const { lat, lng } = details.geometry.location;
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
      setLatitude(lat);
      setLogitude(lng);
      setMarkerPosition({ latitude: lat, longitude: lng });
      setSelectedAddress(details.formatted_address);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({
      latitude,
      longitude,
    });
    setLatitude(latitude);
    setLogitude(longitude);
    reverseGeocode(latitude, longitude);
  };

  const handleAddBoardingPoint = async () => {
    if (
      !id ||
      !name ||
      !date ||
      !time ||
      !selectedAddress ||
      !latitude ||
      !longitude
    ) {
      Alert.alert("Empty field!", "All fields required!");
      return;
    }

    setLoading(true);

    const body = {
      transportId: id,
      longitude: longitude,
      latitude: latitude,
      location: selectedAddress,
      boardingPointName: name,
      boardingPointTime: time,
      boardingPointDate: date,
    };

    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/board/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok || res.status !== 201) {
        throw new Error("Failed to add boarding point");
      }

      Alert.alert("Added!", "Boarding point added successfully");
      router.back();
    } catch (error) {
      console.log("Failed to create checkpoint", error?.message);
      Alert.alert("Oops", "Something went wrong.\n Please try again");
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
              <Text className="text-xs text-gray-500/70">
                Boarding Point Name
              </Text>
              <TextInput
                placeholder="Enter Boarding Point Name"
                className="text-black text-base mt-1"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="border mt-2 px-2 py-1 border-gray-500/50 rounded-lg w-full">
              <Text className="text-xs text-gray-500/70">Boarding Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                  editable={false}
                  className={`py-2 w-full border-slate-500/50 rounded-lg text-black placeholder:text-base`}
                  value={date ? format(date, "yyyy-MM-dd") : new Date()}
                  placeholder="Select Date"
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>
            <View className="border mt-2 px-2 py-1 border-gray-500/50 rounded-lg w-full">
              <Text className="text-xs text-gray-500/70">Boarding Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <TextInput
                  editable={false}
                  className={`py-2 w-full border-slate-500/50 rounded-lg text-black placeholder:text-base`}
                  value={time ? format(time, "HH:mm") : new Date()}
                  placeholder="Select Date"
                />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              )}
            </View>
            <View className="w-full flex justify-start items-center mt-2">
              <View
                style={{
                  width: "100%",
                  borderWidth: 0.5,
                  borderRadius: 6,
                  border: "gray",
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                }}
              >
                <Text className="text-xs text-gray-500/70">
                  Boarding Location
                </Text>
                <GooglePlacesAutocomplete
                  ref={googlePlacesRef}
                  placeholder="Search for a location"
                  minLength={3}
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
                      height: 40,
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
          onPress={handleAddBoardingPoint}
          style={{
            width: width * 0.7,
            backgroundColor: "green",
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            <Text style={{ textAlign: "center", color: "#fff" }}>
              Add Boarding Point
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;
