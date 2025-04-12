import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { showError, showSuccess } from "../../../utils/toastHelper";
import { Image } from "expo-image";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  uploadFilesToS3,
  uploadFileToS3,
} from "../../../utils/uploadFileHelper";
import * as DocumentPicker from "expo-document-picker";

const { height, width } = Dimensions.get("window");

const EditTour = () => {
  const { tour } = useSelector((state) => state.tour);
  const { id } = useLocalSearchParams();

  const { user } = useSelector((state) => state.user);

  const tourDetails = tour.find((t) => t._id === id);

  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);

  // form data states
  const [tourName, setTourName] = useState(tourDetails?.name || "");
  const [location, setLocation] = useState(tourDetails?.location || "");
  const [state, setState] = useState(tourDetails?.state || "");
  const [description, setDescription] = useState(
    tourDetails?.description || ""
  );
  const [difficulty, setDifficulty] = useState(
    tourDetails?.difficulty || "Easy"
  );
  const [totalSeats, setTotalSeats] = useState(
    tourDetails?.total_seats?.toString() || ""
  );
  const [distance, setDistance] = useState(
    tourDetails?.distance?.toString() || ""
  );
  const [tourType, setTourType] = useState(tourDetails?.tourType || null);
  const [costPerPerson, setCostPerPerson] = useState(
    tourDetails?.tour_cost?.toString() || ""
  );
  const [adminCanReject, setAdminCanReject] = useState(
    tourDetails?.can_admin_reject || false
  );
  const [paymentGatewayEnabled, setPaymentGatewayEnabled] = useState(
    tourDetails?.enable_payment_getway || false
  );
  const [startDate, setStartDate] = useState(
    new Date(tourDetails?.tour_start || Date.now())
  );
  const [endDate, setEndDate] = useState(
    new Date(tourDetails?.tour_end || Date.now())
  );
  const [bookingCloseDate, setBookingCloseDate] = useState(
    new Date(tourDetails?.booking_close || Date.now())
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showBookingClosePicker, setShowBookingClosePicker] = useState(false);

  // consent form
  const [consentForm, setConsentForm] = useState(tourDetails?.consentFormUrl);

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
  // image states

  const tourImages = tourDetails.images.filter(
    (img) => img.type === "tour" || !img.type
  );

  const [images, setImages] = useState(tourImages || []);

  const [imageToAdd, setImageToAdd] = useState([]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled) {
      setImageToAdd((prevImages) => [...prevImages, ...result.assets]);
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

  const submitForm = async () => {
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
      !consentForm
    ) {
      setError("Please fill all required fields & add tour images.");
      return;
    }

    setLoading(true);
    try {
      setError("");

      let consentFormUrl = null;

      try {
        if (consentForm?.name) {
          consentFormUrl = await uploadFileToS3(consentForm);
        } else {
          consentFormUrl = consentForm;
        }
      } catch (error) {
        console.warn("Consent form upload failed, continuing without it.");
        consentFormUrl = null;
      }

      const formData = {
        id,
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
        difficulty,
        state,
        tourType,
        consentFormUrl,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/update-tour`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user?.email,
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        await uploadFilesToS3(imageToAdd, id);
        showSuccess("Tour updated successfully");
        router.push(`/tour/${id}`);
      }
    } catch (err) {
      showError(err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (id) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/image/delete-image?id=${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user?.email,
          },
        }
      );
      if (response.ok) {
        const updatedImages = images.filter((image) => image._id !== id);
        setImages(updatedImages);
        showSuccess("Image removed successfully");
      }
    } catch (error) {
      showError(error.message || "Failed to remove image");
    }
  };

  const handleRemoveImageToAdd = (uri) => {
    const updatedImages = imageToAdd.filter((image) => image.uri !== uri);
    setImageToAdd(updatedImages);
  };

  useEffect(() => {
    if (!startDate || !endDate || !bookingCloseDate) return;

    let newError = null;
    if (endDate < startDate) {
      newError = "End date should be greater than start date";
    } else if (bookingCloseDate >= startDate) {
      newError = "Booking close date should be before start date";
    }

    if (error !== newError) {
      setError(newError);
    }
  }, [startDate, endDate, bookingCloseDate, error]);

  return (
    <SafeAreaView edges={["left", "right", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 150,
          paddingHorizontal: 12,
          flexGrow: 1,
        }}
      >
        <View className="flex justify-center items-center">
          {error && (
            <Text className="text-red-600 font-semibold text-lg pt-3">
              {error}
            </Text>
          )}
        </View>
        <View style={styles.innerContainer}>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Tour Name
            </Text>
            <TextInput
              placeholder={tourDetails.name}
              value={tourName}
              placeholderTextColor="gray"
              onChangeText={setTourName}
              className="text-black text-lg mt-1"
            />
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Location
            </Text>
            <TextInput
              placeholder={tourDetails.location}
              value={location}
              placeholderTextColor="gray"
              onChangeText={setLocation}
              className="text-black text-lg mt-1"
            />
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">State</Text>
            <TextInput
              placeholder={tourDetails.state}
              value={state}
              placeholderTextColor="gray"
              onChangeText={setState}
              className="text-black text-lg mt-1"
            />
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Description
            </Text>
            <TextInput
              placeholder={tourDetails.description}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="gray"
              multiline
              className="text-black text-lg mt-1"
              style={styles.descriptionInput}
            />
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Difficulty
            </Text>
            <Picker selectedValue={difficulty} onValueChange={setDifficulty}>
              <Picker.Item label="Easy" value="Easy" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="Hard" value="Hard" />
            </Picker>
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Tour Type
            </Text>
            <Picker selectedValue={tourType} onValueChange={setTourType}>
              <Picker.Item label="Select tour type" value={null} />
              <Picker.Item label="Trekking" value="Trekking" />
              <Picker.Item
                label="Sun-rise Trekking"
                value="Sun-rise Trekking"
              />
              <Picker.Item label="Beach Trekking" value="Beach Trekking" />
              <Picker.Item
                label="Himalaya Trekking"
                value="Himalaya Trekking"
              />
              <Picker.Item label="Expedition" value="Expedition" />
              <Picker.Item label="Educational" value="Educational" />
              <Picker.Item label="Historic Place" value="Historic Place" />
              <Picker.Item label="Adventure" value="Adventure" />
              <Picker.Item label="Group Travel" value="Group Travel" />
              <Picker.Item label="Day Outing" value="Day Outing" />
            </Picker>
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Total Seats
            </Text>
            <TextInput
              placeholder={tourDetails?.total_seats.toString()}
              value={totalSeats}
              placeholderTextColor="gray"
              onChangeText={setTotalSeats}
              keyboardType="numeric"
              className="text-black text-lg mt-1"
            />
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Distance (KMS)
            </Text>
            <TextInput
              placeholder={tourDetails.distance.toString()}
              value={distance}
              placeholderTextColor="gray"
              onChangeText={setDistance}
              keyboardType="numeric"
              className="text-black text-lg mt-1"
            />
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Start Date
            </Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <TextInput
                editable={false}
                className="py-2 w-full rounded-lg text-black placeholder:text-base"
                value={startDate ? format(startDate, "yyyy-MM-dd") : new Date()}
                placeholder={format(tourDetails.tour_start, "yyyy-MM-dd")}
              />
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={onChangeStart}
              />
            )}
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              End Date
            </Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <TextInput
                editable={false}
                className=" py-2 w-full rounded-lg text-black placeholder:text-base"
                value={endDate ? format(endDate, "yyyy-MM-dd") : new Date()}
                placeholder={format(tourDetails.tour_end, "yyyy-MM-dd")}
              />
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={onChangeEnd}
              />
            )}
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Booking Close Date
            </Text>
            <TouchableOpacity onPress={() => setShowBookingClosePicker(true)}>
              <TextInput
                editable={false}
                className="py-2 w-full rounded-lg text-black placeholder:text-base"
                value={
                  bookingCloseDate
                    ? format(bookingCloseDate, "yyyy-MM-dd")
                    : new Date()
                }
                placeholder={format(tourDetails.booking_close, "yyyy-MM-dd")}
              />
            </TouchableOpacity>
            {showBookingClosePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={onChangeBookingClose}
              />
            )}
          </View>
          <View style={styles.input}>
            <Text className="text-base font-semibold text-gray-600">
              Cost Per Person
            </Text>
            <TextInput
              placeholder={tourDetails.tour_cost.toString()}
              value={costPerPerson}
              placeholderTextColor="gray"
              onChangeText={setCostPerPerson}
              keyboardType="numeric"
              className="text-black text-lg mt-1"
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Admin Can Reject Booking?</Text>
            <Switch
              trackColor={{ true: "#228B22", false: "gray" }}
              value={adminCanReject}
              onValueChange={setAdminCanReject}
              ios_backgroundColor="gray"
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Payment Gateway Enabled?</Text>
            <Switch
              trackColor={{ true: "#228B22", false: "gray" }}
              value={paymentGatewayEnabled}
              onValueChange={setPaymentGatewayEnabled}
              ios_backgroundColor="gray"
            />
          </View>
        </View>
        {consentForm ? (
          <View
            style={{
              borderColor: "gray",
              borderWidth: 1,
              width: "100%",
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <View className="flex flex-row justify-between item-center w-full rounded-lg px-4 py-2">
              <View className="flex flex-row justify-center items-center gap-5">
                <Ionicons
                  name="document-text-outline"
                  color={"#228B22"}
                  size={24}
                />
                <Text style={{ color: "#228B22", fontWeight: "400" }}>
                  {consentForm.name || "Consent Form"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setConsentForm(null)}>
                <Ionicons name="close-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="w-full mb-4">
            <TouchableOpacity onPress={pickPdf} style={styles.imagePicker}>
              <Ionicons name="add-circle" size={20} color="#228B22" />
              <Text style={styles.imagePickerText}>Add Consent Form</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.imageWrapper}>
          <Text className="text-lg mb-2 font-semibold text-gray-600">
            Tour Images
          </Text>
          {images.length > 0 &&
            images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: image.url }}
                  alt="tour"
                  style={styles.image}
                />
                <TouchableOpacity
                  onPress={() => handleRemoveImage(image._id)}
                  style={styles.closeButton}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          {imageToAdd.length > 0 &&
            imageToAdd.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: image.uri }}
                  alt="tour"
                  style={styles.image}
                />
                <TouchableOpacity
                  onPress={() => handleRemoveImageToAdd(image.uri)}
                  style={styles.closeButton}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          <TouchableOpacity
            onPress={pickImage}
            style={styles.imagePicker}
            activeOpacity={0.8}
          >
            <Text className="text-[#228B22] text-base font-semibold">
              Add {images.length > 0 && "more"} Images
            </Text>
            <MaterialIcons
              name="add-a-photo"
              size={24}
              color="#228B22"
              style={styles.imagePickerText}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          disabled={!!error}
          onPress={submitForm}
          activeOpacity={0.9}
          style={styles.submitButton}
        >
          {loading ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <Text className="text-xl text-white font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: height * 0.5,
    paddingHorizontal: 12,
  },
  innerContainer: {
    paddingTop: 18,
    width: "100%",
    alignItems: "center",
  },
  errorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  errorText: {
    color: "red",
    fontSize: width * 0.04,
    marginLeft: width * 0.02,
    textAlign: "center",
    fontWeight: "bold",
    gap: 5,
  },
  input: {
    width: "100%",
    borderRadius: 10,
    padding: 10,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: height * 0.015,
    fontSize: width * 0.04,
  },
  descriptionInput: {
    height: height * 0.12,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    width: "100%",
    marginBottom: height * 0.015,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: height * 0.015,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    marginBottom: height * 0.015,
  },
  switchLabel: {
    fontSize: width * 0.04,
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 156,
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "red",
    borderRadius: 12,
    padding: 4,
  },
  imagePicker: {
    height: 100,
    width: "100%",
    borderColor: "#228B22",
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  imagePickerText: {
    fontSize: width * 0.04,
    color: "#228B22",
    marginLeft: width * 0.02,
  },
  submitButton: {
    display: "flex",
    position: "absolute",
    bottom: height * 0.01,
    width: "100%",
    backgroundColor: "#228B22",
    height: height * 0.055,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  buttonWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.03,
  },
});

export default EditTour;
