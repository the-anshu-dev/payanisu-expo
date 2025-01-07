import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import trekkersImg from "../assets/trekkers.jpeg";

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
        Alert.alert("Success", "Member added successfully");
        router.push("/profile");
      } else {
        throw new Error(data.message || "An error occurred");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.backgroundImage} source={trekkersImg} />
      <View style={styles.overlay}>
        <Text style={styles.title}>Add Member</Text>
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
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Member</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
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
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    contentFit: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "10%",
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
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
    fontSize: 16,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderColor: "green",
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: "rgba(34, 139, 34, 0.4)",
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "rgba(34, 139, 34, 0.4)",
  },
  picker: {
    color: "white",
    height: 50,
  },
  submitButton: {
    backgroundColor: "#228B22",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#228B22",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddMember;