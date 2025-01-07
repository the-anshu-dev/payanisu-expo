import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "../redux/slices/userSlice";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

const { height } = Dimensions.get("window");

const UpdateProfile = () => {
  const router = useRouter();

  const data = useSelector((state) => state.user);
  const { user, profile } = data;

  const dispatch = useDispatch();

  const [name, setName] = useState(profile.name);
  const [dob, setDob] = useState(profile.dob);
  const [age, setAge] = useState(profile.age);
  const [contact, setContact] = useState(profile.contact);
  const [emergencyContact, setEmergencyContact] = useState(
    profile.emergency_contact
  );
  const [address, setAddress] = useState(profile.address);
  const [identityProofNumber, setIdentityProofNumber] = useState(
    profile.id_number
  );
  const [gender, setGender] = useState(profile.gender);
  const [idProofType, setIdProofType] = useState(profile.id_type);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeStart = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowDatePicker(false);
    setDob(currentDate);
  };

  const handleUpdate = async () => {
    setError("");
    if (
      !name &&
      !dob &&
      !age &&
      !gender &&
      !contact &&
      !emergencyContact &&
      !address &&
      !idProofType &&
      !identityProofNumber
    ) {
      setError("Change at least one field to update !");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/users/updateProfile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: profile._id,
            name,
            dob,
            age,
            gender,
            contact,
            emergency_contact: emergencyContact,
            address,
            id_type: idProofType,
            id_number: identityProofNumber,
          }),
        }
      );
      const profileData = await res.json();

      if (profileData && !profileData.error) {
        dispatch(setProfile(profileData));
      }
      setLoading(false);
      router.push("/Menu");
    } catch (error) {
      console.log(error?.message);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16 }}>
          {error && (
            <View style={{ paddingVertical: 5 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 10,
                }}
              >
                <Ionicons name="warning-outline" size={20} color="red" />
                <Text
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {error}
                </Text>
              </View>
            </View>
          )}
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
              paddingVertical: 5,
              fontWeight: "600",
            }}
          >
            Enter Updates
          </Text>
          <TextInput
            placeholder={profile?.name || user?.name}
            textContentType="name"
            autoCapitalize="words"
            onChangeText={setName}
            style={styles.input}
          />
          <View>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                editable={false}
                className={`border py-3 mt-3 w-full border-slate-500/50 rounded-lg text-black placeholder:text-base  px-3 `}
                value={dob && format(dob, "yyyy-MM-dd")}
                placeholder={format(profile.dob, "yyyy-MM-dd")}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={onChangeStart}
              />
            )}
          </View>
          <TextInput
            placeholder={profile.age}
            keyboardType="numeric"
            onChangeText={setAge}
            style={styles.input}
          />
          <View style={styles.pickerContainer}>
            <Picker selectedValue={gender} onValueChange={setGender}>
              <Picker.Item label="Select Gender" value={null} />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
            </Picker>
          </View>
          <TextInput
            placeholder={profile.contact}
            keyboardType="phone-pad"
            onChangeText={setContact}
            style={styles.input}
          />
          <TextInput
            placeholder={profile.emergency_contact}
            keyboardType="phone-pad"
            onChangeText={setEmergencyContact}
            style={styles.input}
          />
          <TextInput
            placeholder={profile.address}
            onChangeText={setAddress}
            style={styles.input}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profile.idProofType}
              onValueChange={setIdProofType}
            >
              <Picker.Item label="Select tour type" value={null} />
              <Picker.Item label="Aadhar Card" value="Aadhar" />
              <Picker.Item label="Driving License" value="Driving License" />
              <Picker.Item label="Pan Card" value="Pan Card" />
              <Picker.Item label="Voter ID Card" value="Voter ID Card" />
            </Picker>
          </View>
          <TextInput
            placeholder={profile.id_number}
            onChangeText={setIdentityProofNumber}
            style={styles.input}
          />
        </View>
      </ScrollView>
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity
          onPress={handleUpdate}
          style={{
            backgroundColor: "#228B22",
            padding: 12,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 16 }}>Update Profile</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back("")}
          style={{
            marginTop: 10,
            padding: 8,
            borderRadius: 10,
            borderColor: "#228B22",
            borderWidth: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16, color: "#228B22" }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    width: "100%",
    marginBottom: height * 0.002,
    marginTop: height * 0.02,
  },
};

export default UpdateProfile;
