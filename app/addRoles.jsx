import { View, Text, ActivityIndicator, Alert, Dimensions, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";

const { width, height } = Dimensions.get("window");

const AddRoles = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [roles, setRoles] = useState([
    { label: "Admin", value: "admin" },
    { label: "Coordinator", value: "coordinator" },
  ]);

  const handleLogin = async () => {
    setError("");
    if (!value || !email) {
      setError("Please select a role and enter email");
      return;
    }
    setLoading(true);
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/users/signup`,
        { email, role: value }
      );
      setLoading(false);
      setEmail("");
      setValue(null);
      Alert.alert("Success", "Role added successfully");
    } catch (error) {
      console.log(error?.message);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundImageContainer}>
        <Image
          style={styles.backgroundImage}
          source="https://images.pexels.com/photos/27377328/pexels-photo-27377328/free-photo-of-people-walking-down-a-steep-hill-in-the-jungle.jpeg?auto=compress&cs=tinysrgb&w=600"
        />
      </View>
      <View style={styles.overlay}>
        <Text style={styles.title}>Trekies.</Text>
        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={width * 0.06} color="red" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <DropDownPicker
            open={open}
            value={value}
            items={roles}
            textStyle={{ color: "white", fontWeight: "bold", fontSize: width * 0.04 }}
            dropDownContainerStyle={styles.dropDownContainer}
            badgeStyle={{ backgroundColor: "green" }}
            tickIconStyle={{ color: "white" }}
            arrowIconStyle={{ color: "white" }}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setRoles}
            style={styles.dropDownPicker}
          />
          <TextInput
            placeholder="Enter Email"
            textContentType="emailAddress"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(newText) => setEmail(newText)}
            style={styles.textInput}
            placeholderTextColor="white"
            defaultValue={email}
          />
          <TouchableOpacity onPress={handleLogin} style={styles.proceedButton}>
            {loading ? (
              <ActivityIndicator size={24} color="#00ff00" />
            ) : (
              <Text style={styles.proceedButtonText}>Proceed</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImageContainer: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    contentFit: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.1,
  },
  title: {
    color: "white",
    fontSize: width * 0.1,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.05,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.02,
  },
  errorText: {
    color: "red",
    fontSize: width * 0.04,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: width * 0.02,
  },
  dropDownPicker: {
    backgroundColor: "#228B22",
    width: "100%",
    marginBottom: height * 0.02,
  },
  dropDownContainer: {
    backgroundColor: "green",
  },
  textInput: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "600",
    width: "100%",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.03,
    borderRadius: 10,
    borderColor: "green",
    borderWidth: 1,
    marginBottom: height * 0.03,
  },
  proceedButton: {
    backgroundColor: "#228B22",
    width: "100%",
    paddingVertical: height * 0.01,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  proceedButtonText: {
    color: "white",
    fontSize: width * 0.05,
    fontWeight: "bold",
  },
  cancelButton: {
    width: "100%",
    paddingVertical: height * 0.01,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#228B22",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: width * 0.05,
    fontWeight: "bold",
  },
});

export default AddRoles;