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

const { height, width } = Dimensions.get("window");

const EditTour = () => {
  const { tour } = useSelector((state) => state.tour);
  const { id } = useLocalSearchParams();

  const { user } = useSelector((state) => state.user);

  const tourDetails = tour.find((t) => t._id === id);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
      !tourType
    ) {
      setError("Please fill all required fields & add tour images.");
      return;
    }

    setLoading(true);
    try {
      setError("");
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
      )
      if (response.ok) {
        router.back();
        showSuccess("Tour updated successfully");
      }
    } catch (err) {
      showError(err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
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
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View className="flex justify-center items-center">
          {error && (
            <Text className="text-red-600 font-semibold text-lg">{error}</Text>
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
              Distance (km)
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

          {/* Cost Per Person */}
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
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },
  scrollViewContent: {
    paddingBottom: height * 0.1,
  },
  innerContainer: {
    paddingHorizontal: 12,
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
    paddingVertical: height * 0.009,
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
  },
  imagePickerText: {
    fontSize: width * 0.04,
    color: "green",
    marginLeft: width * 0.02,
  },
  submitButton: {
    display: "flex",
    position: "absolute",
    bottom: height * 0.02,
    width: "100%",
    backgroundColor: "#228B22",
    height: height * 0.045,
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
