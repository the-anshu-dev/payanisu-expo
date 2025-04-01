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
import React, { useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import {
  showError,
  showSuccess,
  showWarning,
} from "../../../utils/toastHelper";

const { width } = Dimensions.get("window");
const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const Page = () => {
  const { id } = useLocalSearchParams();
  const googlePlacesRef = useRef();

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
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

  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
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
    setLatitude(lat);
    setLongitude(lng);
    setSelectedAddress(details.formatted_address);
    setModalVisible(false);
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    setLatitude(latitude);
    setLongitude(longitude);
    setRegion((prev) => ({ ...prev, latitude, longitude }));
    await reverseGeocode(latitude, longitude);
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
      showWarning("All fields required!");
      return;
    }

    setLoading(true);

    const body = {
      transportId: id,
      longitude,
      latitude,
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok || res.status !== 201)
        throw new Error("Failed to add boarding point");

      router.back();
      showSuccess("Boarding point added successfully");
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="h-full w-full flex justify-between items-center relative px-2">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="w-full h-full"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-3 h-full w-full flex justify-between items-center">
          <View className="w-full flex justify-start items-center gap-3">
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

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border mt-2 px-2 py-1 border-gray-500/50 rounded-lg w-full"
            >
              <Text className="text-xs text-gray-500/70">Boarding Date</Text>
              <TextInput
                editable={false}
                className="py-2 text-black"
                value={format(date, "yyyy-MM-dd")}
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

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="border mt-2 px-2 py-1 border-gray-500/50 rounded-lg w-full"
            >
              <Text className="text-xs text-gray-500/70">Boarding Time</Text>
              <TextInput
                editable={false}
                className="py-2 text-black"
                value={format(time, "HH:mm")}
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

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="border mt-2 px-2 py-2 border-gray-500/50 rounded-lg w-full"
            >
              <Text className="text-xs text-gray-500/70">
                Boarding Location
              </Text>
              <Text className="text-base text-black">
                {selectedAddress || "Select Location"}
              </Text>
            </TouchableOpacity>

            <MapView
              style={{ height: 350, width: "100%" }}
              region={region}
              onPress={handleMapPress}
            >
              <Marker coordinate={markerPosition} />
            </MapView>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleAddBoardingPoint}
        style={{
          width: width * 0.9,
          backgroundColor: "#228B22",
          paddingVertical: 12,
          marginBottom: 10,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator size={"small"} color={"white"} />
        ) : (
          <Text style={{ color: "#fff" }}>Add Boarding Point</Text>
        )}
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Search location"
            fetchDetails
            onPress={(data, details) => handleLocationSelect(details)}
            query={{
              key: "AIzaSyAWiZa_f1BStr9sDkGGJdDvmOV76-SVoFo",
              language: "en",
            }}
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
            className="mt-4 p-2 bg-gray-300 rounded-lg"
          >
            <Text className="text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Page;
