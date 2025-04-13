import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";
import { showError, showSuccess } from "../../../utils/toastHelper";
import { transformAllocationData } from "../../../utils/helpers";
import { height } from "../../../constants/Styles";

const AllocateRoom = () => {
  const { id: accommodationId, tourId } = useLocalSearchParams();

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [guestsToDisable, setGuestsToDisable] = useState([]);

  const [roomNumber, setRoomNumber] = useState("");
  const [occupancyValue, setOccupancyValue] = useState("");
  const [roomTypeValue, setRoomTypeValue] = useState("");
  const [guestsValue, setGuestsValue] = useState([]);

  const [modalVisible, setModalVisible] = useState({
    guest: false,
    occupancy: false,
    roomType: false,
  });

  const toggleModal = (key) => {
    setModalVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getBookedUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/get?id=${tourId}`
      );

      if (response.status !== 200)
        throw new Error("Failed to fetch booked users");

      const result = await response.json();
      const filteredData = result.data.filter((d) => d.status === 1);
      setGuests(filteredData);
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  const getAllocationsByGuestHouseId = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocated/getByAcco?accoId=${accommodationId}`
      );
      if (response.status !== 200)
        throw new Error("Failed to fetch allocations");

      const result = await response.json();
      setAllocations(transformAllocationData(result));
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  const getAllAllocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocated/get?tourId=${tourId}`
      );

      if (response.status !== 200)
        throw new Error("Failed to fetch allocations");

      const result = await response.json();
      setGuestsToDisable(result.map((d) => d.bookingId));
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestToggle = (id) => {
    if (guestsValue.includes(id)) {
      setGuestsValue(guestsValue.filter((g) => g !== id));
    } else {
      setGuestsValue([...guestsValue, id]);
    }
  };

  const handleAllocateRoom = async () => {
    if (
      !roomNumber ||
      !occupancyValue ||
      !roomTypeValue ||
      guestsValue.length === 0
    ) {
      showError("Please fill in all the fields");
      return;
    }

    setLoading(true);
    try {
      for (let item of guestsValue) {
        const body = {
          bookingId: item,
          accommodationId,
          tourId,
          roomNumber,
          roomType: roomTypeValue,
          occupancy: occupancyValue,
        };

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocated/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (response.status !== 201) {
          throw new Error("Failed to allocate room");
        }
      }

      showSuccess("Room allocated successfully.");
      router.back();
      setGuestsValue([]);
      setRoomNumber("");
      setOccupancyValue("");
      setRoomTypeValue("");
      getAllocationsByGuestHouseId();
      getAllAllocations();
      getBookedUsers();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBookedUsers();
    getAllAllocations();
    getAllocationsByGuestHouseId();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#228B22" />
      </View>
    );
  }

  const OCCUPANCY_OPTIONS = ["Single", "Double", "Triple"];
  const ROOM_TYPE_OPTIONS = ["AC", "Non-AC", "Executive", "Dormitory"];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 8,
            elevation: 5,
          }}
        >
          <Text style={{ fontSize: 12, color: "gray" }}>Room No.</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="Enter room number"
            value={roomNumber}
            onChangeText={setRoomNumber}
            style={{ fontSize: 16, marginTop: 5 }}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleModal("guest")}
          style={styles.selectorBox}
        >
          <Text style={{ fontSize: 12, color: "gray" }}>Guests</Text>
          <Text style={{ fontSize: 16, marginTop: 4 }}>
            {guestsValue.length > 0
              ? `${guestsValue.length} guest(s) selected`
              : "Select guests"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleModal("occupancy")}
          style={styles.selectorBox}
        >
          <Text style={{ fontSize: 12, color: "gray" }}>Occupancy</Text>
          <Text style={{ fontSize: 16, marginTop: 4 }}>
            {occupancyValue || "Select occupancy"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleModal("roomType")}
          style={styles.selectorBox}
        >
          <Text style={{ fontSize: 12, color: "gray" }}>Room Type</Text>
          <Text style={{ fontSize: 16, marginTop: 4 }}>
            {roomTypeValue || "Select room type"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <View
        style={{
          width: "100%",
          position: "absolute",
          backgroundColor: "white",
          bottom: 0,
          paddingVertical: 10,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={handleAllocateRoom}
          activeOpacity={0.9}
          style={{
            backgroundColor: "#228B22",
            height: height * 0.05,
            borderRadius: 8,
            width: "90%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible.guest} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ padding: 8, display: "flex", alignItems: "center" }}>
            <Text style={{ fontSize: 18, color: "green", fontWeight: "bold" }}>
              Select Guests
            </Text>
          </View>
          <FlatList
            data={guests}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => {
              const isDisabled = guestsToDisable.includes(item._id);
              const isSelected = guestsValue.includes(item._id);
              return (
                <TouchableOpacity
                  onPress={() => !isDisabled && handleGuestToggle(item._id)}
                  style={{
                    padding: 12,
                    backgroundColor: isSelected ? "#e0f7e9" : "#fff",
                    borderRadius: 8,
                    marginBottom: 8,
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  disabled={isDisabled}
                >
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            onPress={() => toggleModal("guest")}
            style={styles.doneButton}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Done</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      <Modal visible={modalVisible.occupancy} transparent animationType="slide">
        <View style={styles.modalContent}>
          {OCCUPANCY_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => {
                setOccupancyValue(opt);
                toggleModal("occupancy");
              }}
              style={styles.optionBtn}
            >
              <Text style={{ fontSize: 16 }}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
      <Modal visible={modalVisible.roomType} transparent animationType="slide">
        <View style={styles.modalContent}>
          {ROOM_TYPE_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => {
                setRoomTypeValue(opt);
                toggleModal("roomType");
              }}
              style={styles.optionBtn}
            >
              <Text style={{ fontSize: 16 }}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = {
  selectorBox: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    elevation: 5,
  },
  modalContent: {
    backgroundColor: "white",
    marginTop: "auto",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  optionBtn: {
    paddingVertical: 12,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  doneButton: {
    backgroundColor: "#228B22",
    padding: 14,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
};

export default AllocateRoom;
