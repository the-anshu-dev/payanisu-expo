import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import { showSuccess } from "../utils/toastHelper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const AddMember = () => {
  const { user } = useSelector((state) => state.user);

  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [relation, setRelation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!name || !age || !gender || !relation || !contact) {
      setError("Please fill in all the fields");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/add-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: user?.email,
            name,
            email,
            age,
            gender,
            relation,
            contact,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showSuccess("Member added successfully");
        router.replace("/profile");
      } else {
        throw new Error(data.message || "An error occurred");
      }
    } catch (error) {
      showError(error.message || "Please try again.");
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={20} color="red" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <TextInput
            placeholder="Enter Name"
            textContentType="name"
            autoCapitalize="words"
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="gray"
            value={name}
          />
          <TextInput
            placeholder="Enter Email"
            textContentType="emailAddress"
            autoCapitalize="none"
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="gray"
            value={email}
          />
          <TextInput
            placeholder="Enter Age"
            keyboardType="numeric"
            onChangeText={setAge}
            style={styles.input}
            placeholderTextColor="gray"
            value={age}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              dropdownIconColor="white"
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value={null} />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
            </Picker>
          </View>
          <TextInput
            placeholder="Enter Relation"
            onChangeText={setRelation}
            style={styles.input}
            placeholderTextColor="gray"
            value={relation}
          />
          <TextInput
            placeholder="Enter Contact Number"
            keyboardType="phone-pad"
            onChangeText={setContact}
            style={styles.input}
            placeholderTextColor="gray"
            value={contact}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Member</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    backgroundColor: "white",
  },
  overlay: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginLeft: 5,
  },
  input: {
    color: "white",
    fontSize: 18,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderColor: "#228B22",
    borderWidth: 2,
    marginBottom: 12,
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#228B22",
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    height: 50,
    fontSize: 18,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#228B22",
    height: 50,
    width: width * 0.45,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    width: width * 0.45,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#228B22",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddMember;
