import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "../redux/slices/userSlice";
import { format, differenceInYears } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const EditProfile = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [dob, setDob] = useState(null);
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");
  const [identityProofNumber, setIdentityProofNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [gender, setGender] = useState(null);
  const [idProofType, setIdProofType] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (dob) {
      const calculatedAge = differenceInYears(new Date(), dob);
      setAge(calculatedAge.toString());
    }
  }, [dob]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const handleUpdate = async () => {
    setError("");

    if (
      !name ||
      !user?.email ||
      !dob ||
      !age ||
      !gender ||
      !contact ||
      !emergencyContact ||
      !address ||
      !idProofType ||
      !identityProofNumber
    ) {
      setError("Please fill in all the fields");
      return;
    }

    setLoading(true);

    try {

      const body = JSON.stringify({
        email: user?.email,
        name,
        dob,
        age: Number(age),
        gender,
        contact,
        emergency_contact: emergencyContact,
        address,
        id_type: idProofType,
        id_number: identityProofNumber,
        info
      })

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/users/createProfile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        }
      );

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to create profile";

        if (result?.message) {
          errorMessage = result.message;
        }

        throw new Error(errorMessage);
      }

      const { user: { email } } = result;
      await fetchProfile(email);
      Alert.alert("Success", "Profile Created!");
      router.back();
    } catch (error) {
      if (error instanceof TypeError) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (email) => {
    try {
      const profileResponse = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/getProfile`, {
        method: "GET",
        headers: { "Content-Type": "application/json", email },
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData && !profileData.error) {
          dispatch(setProfile(profileData));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };


  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer} >
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={24} color="red" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <TextInput
            placeholder="Enter Name"
            textContentType="name"
            autoCapitalize="words"
            onChangeText={setName}
            style={styles.input}
            value={name}
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              editable={false}
              style={styles.input}
              value={dob ? format(dob, "yyyy-MM-dd") : ""}
              placeholder="Enter Date of Birth"
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
          <TextInput
            placeholder="Age"
            style={styles.input}
            value={age}
            editable={false}
          />
          <View style={styles.pickerContainer}>
            <Picker selectedValue={gender} onValueChange={setGender}>
              <Picker.Item label="Select Gender" value={null} />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
            </Picker>
          </View>
          <TextInput
            placeholder="Enter Contact Number"
            keyboardType="phone-pad"
            onChangeText={setContact}
            style={styles.input}
            value={contact}
          />
          <TextInput
            placeholder="Enter Emergency Contact Number"
            keyboardType="phone-pad"
            onChangeText={setEmergencyContact}
            style={styles.input}
            value={emergencyContact}
          />
          <TextInput
            placeholder="Enter Address"
            onChangeText={setAddress}
            style={styles.input}
            value={address}
          />
          <View style={styles.pickerContainer}>
            <Picker selectedValue={idProofType} onValueChange={setIdProofType} collapsable={true}>
              <Picker.Item label="Select ID Type" value={null} />
              <Picker.Item label="Aadhar Card" value="Aadhar" />
              <Picker.Item label="Driving License" value="DL" />
              <Picker.Item label="Pan Card" value="PAN" />
              <Picker.Item label="Voter ID Card" value="VoterID" />
            </Picker>
          </View>

          <TextInput
            placeholder="Enter ID Proof Number"
            onChangeText={setIdentityProofNumber}
            style={styles.input}
            value={identityProofNumber}
          />

          <TextInput
            placeholder="How do you know about us? [ Optional ]"
            onChangeText={setInfo}
            style={styles.input}
            value={info}
          />
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelButton}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleUpdate} style={styles.submitButton} >
          {loading ? (
            <ActivityIndicator size={24} color="#fff" />
          ) : (
            <Text style={styles.submitText}>Create Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16, gap: 12 },
  errorText: { color: "red", fontSize: 16 },
  scrollContainer: { flexGrow: 1, paddingBottom: 24 },
  innerContainer: { paddingHorizontal: 16 },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginTop: 12,
  },
  pickerContainer: { marginTop: 12, borderWidth: 1, borderRadius: 10, borderColor: "gray" },
  buttonContainer: { display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 5, gap: 15 },
  submitButton: { backgroundColor: "#228B22", borderRadius: 10, width: width * 0.4, paddingVertical: 8 },
  cancelButton: { borderColor: "#228B22", borderWidth: 1, borderRadius: 10, width: width * 0.4, paddingVertical: 8 },
  submitText: { textAlign: "center", fontSize: 16, fontWeight: "600", color: "#fff" },
  cancelText: { textAlign: "center", fontSize: 16, fontWeight: "600", color: "#000" },
  textCol: { color: "#fff" }
});

export default EditProfile;
