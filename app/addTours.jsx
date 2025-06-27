import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { format } from "date-fns";
import { uploadFilesToS3, uploadFileToS3 } from "../utils/uploadFileHelper";
import { Picker } from "@react-native-picker/picker";
import { showError, showWarning } from "../utils/toastHelper";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { addTourScreenStyles } from "../constants/Styles";

const { width } = Dimensions.get("window");

const addTours = () => {
  const { user } = useSelector((state) => state.user);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tourName, setTourName] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [distance, setDistance] = useState("");
 

 const [tourType, setTourType] = useState(null);
  const [costPerPerson, setCostPerPerson] = useState("");
  const [adminCanReject, setAdminCanReject] = useState(false);
  const [paymentGatewayEnabled, setPaymentGatewayEnabled] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [image, setImage] = useState([]);
  const [consentForm, setConsentForm] = useState(null);

  // date range picker
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookingCloseDate, setBookingCloseDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showBookingClosePicker, setShowBookingClosePicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const googlePlacesRef = useRef(null);

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (!result.canceled) {
        setConsentForm(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking PDF:", error);
    }
  };

  const onChangeStart = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(false);
    setStartDate(currentDate);
  };

  const onChangeEnd = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(false);
    setEndDate(currentDate);
  };

  const onChangeBookingClose = (event, selectedDate) => {
    const currentDate = selectedDate || bookingCloseDate;
    setShowBookingClosePicker(false);
    setBookingCloseDate(currentDate);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets);
    }
  };

  const handleCancelImage = (fileName) => {
    setImage(image.filter((i) => i.fileName !== fileName));
  };

  const submitForm = async () => {
    if (error) {
      showError(error);
      return;
    }
  
    if (
      !tourName ||
      !location ||
      !description ||
      !totalSeats ||
      !distance ||
      !startDate ||
      !endDate ||
      !bookingCloseDate ||
      !costPerPerson ||
      !difficulty ||
      !state ||
      !tourType ||
      !(image.length > 0) ||
      !user
    ) {
      setError("Please fill all required fields & add tour images.");
      return;
    }
  
    setLoading(true);
    try {
      setError("");
  
      let consentFormUrl = null;
  
      if (consentForm) {
        try {
          consentFormUrl = await uploadFileToS3(consentForm);
        } catch (error) {
          console.warn("Consent form upload failed, continuing without it.");
          consentFormUrl = null;
        }
      }
  
      const formData = {
        name: tourName,
        location,
        description,
        total_seats: parseInt(totalSeats, 10),
        distance,
        tour_start: new Date(startDate),
        tour_end: new Date(endDate),
        booking_close: new Date(bookingCloseDate),
        tour_cost: costPerPerson,
        can_admin_reject: adminCanReject,
        enable_payment_getway: paymentGatewayEnabled,
        status: false,
        difficulty,
        state,
        tourType,
        email: user?.email,
        latitude,
        longitude,
        ...(consentFormUrl && { consentFormUrl }),
      };
  
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/create-tour`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user?.email,
          },
          body: JSON.stringify(formData),
        }
      );
  
      const result = await response.json();
  
      const notificationData = {
        notificationType: "notification",
        title: `Buckle up! New tour: ${tourName}`,
        content: description,
        id: result._id,
      };
  
      if (response.status === 201) {
        await uploadFilesToS3(image, result._id);
        await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(notificationData),
          }
        );
        router.back();
      } else {
        setError(result.message || "Something went wrong.");
        return;
      }
    } catch (err) {
      showWarning("Tour not created. Please try again.");
      setError(err.message || "Error while creating tour. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (details) => {
    if (!details?.geometry?.location) return;
    const { lat, lng } = details.geometry.location;
    setLatitude(lat);
    setLongitude(lng);
    setLocation(details.formatted_address);
    const { address_components } = details;
    const stateComponent = address_components.find(component =>
      component.types.includes("administrative_area_level_1")
    );
    set

System: State(stateComponent?.long_name);
  };

  useEffect(() => {
    if (startDate && endDate && bookingCloseDate) {
      if (startDate > endDate) {
        setError("Start date should be before the end date.");
        setEndDate(null);
      } else if (bookingCloseDate > startDate) {
        setError("Booking close date should be before the start date.");
        setBookingCloseDate(null);
      } else {
        setError(null);
      }
    }
  }, [startDate, endDate, bookingCloseDate]);

  return (
    <>
      <View style={addTourScreenStyles.container}>
        <ScrollView
          contentContainerStyle={addTourScreenStyles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={addTourScreenStyles.innerContainer}>
            {error && (
              <View style={addTourScreenStyles.errorContainer}>
                <Ionicons name="warning" size={28} color="red" />
                <Text style={addTourScreenStyles.errorText}>{error}</Text>
              </View>
            )}
            <TextInput
              placeholder="Tour Name"
              value={tourName}
              placeholderTextColor="gray"
              onChangeText={setTourName}
              style={addTourScreenStyles.input}
            />
            <TouchableOpacity
              style={addTourScreenStyles.input}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={{
                  color: location ? "black" : "gray",
                  fontSize: width * 0.04,
                }}
              >
                {location ? location : "Location"}
              </Text>
            </TouchableOpacity>
            <TextInput
              placeholder="State"
              value={state}
              placeholderTextColor="gray"
              onChangeText={setState}
              style={addTourScreenStyles.input}
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="gray"
              multiline
              style={[
                addTourScreenStyles.input,
                addTourScreenStyles.descriptionInput,
              ]}
            />
            <View style={addTourScreenStyles.pickerContainer}>
              <Picker selectedValue={difficulty} onValueChange={setDifficulty}>
                <Picker.Item label="Select Difficulty" value={null} />
                <Picker.Item label="Easy" value="Easy" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="Hard" value="Hard" />
              </Picker>
            </View>
            <View style={addTourScreenStyles.pickerContainer}>
              <Picker selectedValue={tourType} onValueChange={setTourType}>
                <Picker.Item label="Select tour type" value={null} />
                <Picker.Item label="Trekking" value="Trekking" />
                <Picker.Item label="Sun-rise Trekking" value="Sun-rise Trekking" />
                <Picker.Item label="Beach Trekking" value="Beach Trekking" />
                <Picker.Item label="Himalaya Trekking" value="Himalaya Trekking" />
                <Picker.Item label="Expedition" value="Expedition" />
                <Picker.Item label="Educational" value="Educational" />
                <Picker.Item label="Historic Place" value="Historic Place" />
                <Picker.Item label="Adventure" value="Adventure" />
                <Picker.Item label="Group Travel" value="Group Travel" />
                <Picker.Item label="Day Outing" value="Day Outing" />
              </Picker>
            </View>
            <TextInput
              placeholder="Total Seats"
              value={totalSeats}
              placeholderTextColor="gray"
              onChangeText={setTotalSeats}
              keyboardType="numeric"
              style={addTourScreenStyles.input}
            />
            <TextInput
              placeholder="Distance (KMS)"
              value={distance}
              placeholderTextColor="gray"
              onChangeText={setDistance}
              keyboardType="numeric"
              style={addTourScreenStyles.input}
            />
            <View style={{ width: "100%" }}>
              <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                <TextInput
                  editable={false}
                  className={`border py-2 mb-3 w-full border-slate-500/50 rounded-lg text-black placeholder:text-base px-3 `}
                  value={
                    startDate
                      ? (() => {
                          try {
                            return format(new Date(startDate), "dd MMM yyyy");
                          } catch (error) {
                            return "Invalid Date";
                          }
                        })()
                      : "Select Start Date"
                  }
                  placeholder="Select Start Date"
                />
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeStart}
                />
              )}
              <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                <TextInput
                  editable={false}
                  className={`border py-2 mb-3 w-full border-slate-500/50 rounded-lg text-black placeholder:text-base px-3 `}
                  value={
                    endDate
                      ? (() => {
                          try {
                            return format(new Date(endDate), "dd MMM yyyy");
                          } catch (error) {
                            return "Invalid Date";
                          }
                        })()
                      : "Select End Date"
                  }
                  placeholder="Select End Date"
                />
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeEnd}
                />
              )}
              <TouchableOpacity onPress={() => setShowBookingClosePicker(true)}>
                <TextInput
                  editable={false}
                  className={`border py-2 mb-3 w-full border-slate-500/50 rounded-lg text-black placeholder:text-base px-3 `}
                  value={
                    bookingCloseDate
                      ? (() => {
                          try {
                            return format(new Date(bookingCloseDate), "dd MMM yyyy");
                          } catch (error) {
                            return "Invalid Date";
                          }
                        })()
                      : "Select Booking Close Date"
                  }
                  placeholder="Select Booking Close Date"
                />
              </TouchableOpacity>
              {showBookingClosePicker && (
                <DateTimePicker
                  value={bookingCloseDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeBookingClose}
                />
              )}
            </View>
            <TextInput
              placeholder="Cost Per Person"
              value={costPerPerson}
              placeholderTextColor="gray"
              onChangeText={setCostPerPerson}
              keyboardType="numeric"
              style={addTourScreenStyles.input}
            />
            <View style={addTourScreenStyles.switchContainer}>
              <Text style={addTourScreenStyles.switchLabel}>
                Admin Can Reject Booking?
              </Text>
              <Switch
                trackColor={{ true: "#228B22", false: "gray" }}
                value={adminCanReject}
                onValueChange={setAdminCanReject}
                ios_backgroundColor="gray"
              />
            </View>
            <View style={addTourScreenStyles.switchContainer}>
              <Text style={addTourScreenStyles.switchLabel}>
                Payment Gateway Enabled?
              </Text>
              <Switch
                trackColor={{ true: "#228B22", false: "gray" }}
                value={paymentGatewayEnabled}
                onValueChange={setPaymentGatewayEnabled}
                ios_backgroundColor="gray"
              />
            </View>
            <View className="w-full">
              {consentForm ? (
                <View className="flex flex-row justify-between item-center border border-[#228B22] w-full rounded-lg px-4 py-2">
                  <View className="flex flex-row justify-center items-center gap-5">
                    <Ionicons
                      name="document-text-outline"
                      color={"#228B22"}
                      size={24}
                    />
                    <Text style={{ color: "#228B22", fontWeight: "400" }}>
                      {consentForm?.name}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setConsentForm(null)}>
                    <Ionicons name="close-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="w-full">
                  <TouchableOpacity
                    onPress={pickPdf}
                    style={addTourScreenStyles.imagePicker}
                  >
                    <Ionicons name="add-circle" size={20} color="#228B22" />
                    <Text style={addTourScreenStyles.imagePickerText}>
                      Add Consent Form
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View className="w-full mt-3">
              {image.length > 0 ? (
                <View style={{ width: "100%" }}>
                  {image.map((img, idx) => (
                    <View key={idx} style={addTourScreenStyles.imageWrapper}>
                      <Image
                        source={{ uri: img.uri }}
                        style={addTourScreenStyles.image}
                      />
                      <TouchableOpacity
                        onPress={() => handleCancelImage(img.fileName)}
                        style={addTourScreenStyles.closeButton}
                      >
                        <Ionicons
                          name="close-outline"
                          size={16}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  onPress={pickImage}
                  style={addTourScreenStyles.imagePicker}
                >
                  <Ionicons name="add-circle" size={20} color="#228B22" />
                  <Text style={addTourScreenStyles.imagePickerText}>
                    Add tour images
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
        <View
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={submitForm}
            style={addTourScreenStyles.submitButton}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={addTourScreenStyles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={modalVisible} animationType="fade">
        <View
          style={{
            flex: 1,
            padding: 20,
            gap: 5,
          }}
        >
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Search location"
            fetchDetails={true}
            onPress={(data, details) => handleLocationSelect(details)}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
              language: "en",
            }}
            styles={{
              textInputContainer: {
                backgroundColor: "#fff",
                borderRadius: 8,
                padding: 2,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: "black",
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
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "green",
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white" }}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default addTours;