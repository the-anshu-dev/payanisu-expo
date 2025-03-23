import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Modalize } from "react-native-modalize";
import { TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { showError, showSuccess } from "../../../utils/toastHelper";

const { width } = Dimensions.get("window");

const AllocatedCoordinators = () => {
  const { id } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [coordinators, setCoordinators] = useState([]);
  const [filteredCoordinators, setFilteredCoordinators] = useState([]);
  const [coordinatorLoading, setCoordinatorLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const addCoordinatorRef = useRef(null);

  const handleAddCoordinator = async () => {
    setLoading(true);
    if (!name || !gender || !age || !email || !phone) {
      setLoading(false);
      return;
    }
    try {
      const body = { name, gender, age, email, phone, track_id: id };
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/lead/create-lead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (response.status !== 201) {
        throw new Error("Failed to add coordinator");
      }
      showSuccess("Coordinator added successfully");
      addCoordinatorRef.current?.close();
      getAllCoordinators();
      setName("");
      setGender("");
      setAge("");
      setEmail("");
      setPhone("");
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAllCoordinators = async () => {
    setCoordinatorLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/lead/get-leads?tourId=${id}`
      );
      if (response.status !== 200) {
        throw new Error("Failed to fetch coordinators");
      }
      const result = await response.json();
      setCoordinators(result);
      setFilteredCoordinators(result);
    } catch (error) {
      showError(error.message || "Please try again.");
      router.replace("/(addTourDetails)/tourDetails");
    } finally {
      setCoordinatorLoading(false);
    }
  };

  useEffect(() => {
    getAllCoordinators();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCoordinators(coordinators);
    } else {
      const filtered = coordinators.filter((coordinator) =>
        coordinator.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCoordinators(filtered);
    }
  }, [searchTerm, coordinators]);

  if (coordinatorLoading) {
    return (
      <View className="w-full h-full flex justify-center items-center">
        <ActivityIndicator size={"large"} color="#228B22" />
      </View>
    );
  }

  return (
    <>
      <View className="h-full w-full flex justify-between pt-4">
        <View className="px-4">
          <TextInput
            placeholder="Search by name"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{
              borderWidth: 1,
              borderColor: "gray",
              padding: 6,
              paddingHorizontal: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
          <View className="w-full">
            {filteredCoordinators.length > 0 ? (
              filteredCoordinators.map((i) => (
                <CoordinatorCard
                  key={i._id}
                  name={i.name}
                  age={i.age}
                  gender={i.gender}
                  phone={i.phone}
                />
              ))
            ) : (
              <View className="h-44 w-full flex justify-center items-center mt-10">
                <Ionicons name="document-outline" size={48} color="gray" />
                <Text className="text-xl font-semibold mt-4 text-gray-500">
                  No coordinators added yet
                </Text>
              </View>
            )}
          </View>
        </View>
        <View className="w-full flex flex-row justify-center items-center h-16 bg-white">
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              width: width*0.9,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#228B22",
            }}
            onPress={() => addCoordinatorRef.current?.open()}
          >
            <Text style={{ textAlign: "center", color: "#228B22", fontSize: 16, fontWeight: "bold" }}>
              Add Coordinator
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modalize ref={addCoordinatorRef} adjustToContentHeight>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
            Add Coordinator
          </Text>

          {/* Coordinator Form Fields */}
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={{
              borderWidth: 1,
              borderColor: "gray",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
          <TextInput
            placeholder="Gender"
            value={gender}
            autoCapitalize="words"
            onChangeText={setGender}
            style={{
              borderWidth: 1,
              borderColor: "gray",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />

          <TextInput
            placeholder="Age"
            value={age}
            keyboardType="numeric"
            onChangeText={setAge}
            style={{
              borderWidth: 1,
              borderColor: "gray",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />

          <TextInput
            placeholder="Email"
            value={email}
            keyboardType="email-address"
            onChangeText={setEmail}
            style={{
              borderWidth: 1,
              borderColor: "gray",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />

          <TextInput
            placeholder="Phone Number"
            value={phone}
            keyboardType="phone-pad"
            onChangeText={setPhone}
            style={{
              borderWidth: 1,
              borderColor: "gray",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />

          <TouchableOpacity
            onPress={handleAddCoordinator}
            style={{
              marginTop: 20,
              backgroundColor: "#228B22",
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator size={"small"} color="white" />
            ) : (
              <Text style={{ textAlign: "center", color: "white" }}>
                Submit
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modalize>
    </>
  );
};

const CoordinatorCard = ({ gender, name, age, phone }) => {
  const col =
    gender === "Male" || gender === "male"
      ? "bg-[#228B22]/20"
      : "bg-red-500/20";
  const textCol =
    gender === "Male" || gender === "male" ? "text-[#228B22]" : "text-red-700";
  return (
    <View className="w-full p-3 bg-white shadow-xl shadow-black/70 rounded-lg mt-2">
      <View className="flex flex-row justify-between items-center">
        <Text
          className={`h-6 w-6 ${col} flex justify-center items-center text-center rounded-full ${textCol} font-semibold`}
        >
          {gender.charAt(0)}
        </Text>
        <Text className="text-lg font-semibold">{name}</Text>
        <Text className="text-lg font-semibold">{age} Yrs</Text>
        <Text className="text-lg font-semibold">{phone}</Text>
      </View>
    </View>
  );
};

export default AllocatedCoordinators;
