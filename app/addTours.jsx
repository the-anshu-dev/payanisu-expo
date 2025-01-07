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
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { format } from "date-fns";
import { uploadFilesToS3 } from "../utils/uploadFileHelper";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from 'expo-document-picker';


const { width, height } = Dimensions.get("window");

const addTours = () => {
  const { user } = useSelector((state) => state.user);

  const [error, setError] = useState("");
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
  const [image, setImage] = useState([]);

  // date range picker
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookingCloseDate, setBookingCloseDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showBookingClosePicker, setShowBookingClosePicker] = useState(false);

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
  
      if (result.type === 'success') {
        console.log('PDF selected:', result.uri);
        return result;
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
    }
  };

  const handleUpload = async () => {
    const pdf = await pickPdf();
    if (pdf) {
      await uploadPdf(pdf.uri);
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
      !tourType
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      setError("");

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
        difficulty,
        state,
        tourType,
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
        title: `Buckle up! New tour: ${tourName}`,
        content: description,
        id: result._id,
      };

      if (response.status === 201) {
        await uploadFilesToS3(image, result._id);
        const notify = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(notificationData),
          }
        );
        await notify.json();
      } else {
        setError(result.message || "Please fill in all required fields.");
        return;
      }

      router.back();
    } catch (err) {
      console.error("Error submitting tour:", err);
      setError("Error submitting tour. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={24} color="red" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <TextInput
            placeholder="Tour Name"
            value={tourName}
            placeholderTextColor="gray"
            onChangeText={setTourName}
            style={styles.input}
          />
          <TextInput
            placeholder="Location"
            value={location}
            placeholderTextColor="gray"
            onChangeText={setLocation}
            style={styles.input}
          />
          <TextInput
            placeholder="State"
            value={state}
            placeholderTextColor="gray"
            onChangeText={setState}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="gray"
            multiline
            style={[styles.input, styles.descriptionInput]}
          />
          <TextInput
            placeholder="Difficulty [Easy, Medium, Hard]"
            value={difficulty}
            placeholderTextColor="gray"
            onChangeText={setDifficulty}
            style={styles.input}
          />
          <View style={styles.pickerContainer}>
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
          <TextInput
            placeholder="Total Seats"
            value={totalSeats}
            placeholderTextColor="gray"
            onChangeText={setTotalSeats}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Distance (kms)"
            value={distance}
            placeholderTextColor="gray"
            onChangeText={setDistance}
            keyboardType="numeric"
            style={styles.input}
          />
          <View style={{ width: "100%" }}>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <TextInput
                editable={false}
                className={`border py-2 mb-3 w-full border-slate-500/50 rounded-lg text-black placeholder:text-base  px-3 `}
                value={startDate ? format(startDate, "yyyy-MM-dd") : new Date()}
                placeholder="Select Start Date"
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
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <TextInput
                editable={false}
                className={`border py-2 mb-3 w-full border-slate-500/50 rounded-lg text-black placeholder:text-base  px-3 `}
                value={endDate ? format(endDate, "yyyy-MM-dd") : new Date()}
                placeholder="Select End Date"
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
            <TouchableOpacity onPress={() => setShowBookingClosePicker(true)}>
              <TextInput
                editable={false}
                className={`border py-2 mb-3 w-full border-slate-500/50 rounded-lg text-black placeholder:text-base  px-3 `}
                value={
                  bookingCloseDate
                    ? format(bookingCloseDate, "yyyy-MM-dd")
                    : new Date()
                }
                placeholder="Select Booking Close Date"
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
          <TextInput
            placeholder="Cost Per Person"
            value={costPerPerson}
            placeholderTextColor="gray"
            onChangeText={setCostPerPerson}
            keyboardType="numeric"
            style={styles.input}
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Admin Can Reject Booking?</Text>
            <Switch
              trackColor={{ true: "green", false: "gray" }}
              value={adminCanReject}
              onValueChange={setAdminCanReject}
              ios_backgroundColor="gray"
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Payment Gateway Enabled?</Text>
            <Switch
              trackColor={{ true: "green", false: "gray" }}
              value={paymentGatewayEnabled}
              onValueChange={setPaymentGatewayEnabled}
              ios_backgroundColor="gray"
            />
          </View>
          {image.length > 0 ? (
            <View style={styles.imageContainer}>
              {image.map((img, idx) => (
                <View key={idx} style={styles.imageWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.image} />
                  <TouchableOpacity
                    onPress={() => handleCancelImage(img.fileName)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close-outline" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              <Ionicons name="add-circle" size={20} color="green" />
              <Text style={styles.imagePickerText}>
                Upload tour images here
              </Text>
            </TouchableOpacity>
          )}
          <View>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              <Ionicons name="add-circle" size={20} color="green" />
              <Text style={styles.imagePickerText}>Add Consent Form</Text>
            </TouchableOpacity>
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
        <TouchableOpacity onPress={submitForm} style={styles.submitButton}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },
  scrollViewContent: {
    paddingBottom: height * 0.1,
    paddingTop: 15,
  },
  innerContainer: {
    width: "100%",
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  errorText: {
    color: "red",
    fontSize: width * 0.04,
    marginLeft: width * 0.02,
  },
  input: {
    width: "100%",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.03,
    borderRadius: 10,
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
  imageContainer: {
    width: "100%",
    marginTop: height * 0.015,
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 156,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
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
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: height * 0.015,
  },
  imagePickerText: {
    fontSize: width * 0.04,
    color: "green",
    marginLeft: width * 0.02,
  },
  submitButton: {
    position: "absolute",
    bottom: height * 0.02,
    width: "100%",
    backgroundColor: "#228B22",
    paddingVertical: height * 0.009,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
});

export default addTours;
