import {
  View,
  Text,
  Modal,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import AllocatedRoomCard from "../../../components/UI/AllocatedRoomCard";
import ModalBody from "../../../components/UI/ModalBody";
import { transformAllocationData } from "../../../utils/helpers";
import EditModal from "../../../components/UI/EditModal";

const { width, height } = Dimensions.get("window");

const showAccomodationDetails = () => {
  const { id, tourId } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);

  const [guests, setGuests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [guestsToDisable, setGuestsToDisable] = useState([]);

  const getBookedUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/get?id=${tourId}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch booked users");
      }

      const result = await response.json();
      setGuests(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllocationsByGuestHouseId = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocated/getByAcco?accoId=${id}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch allocations");
      }

      const result = await response.json();
      const data = transformAllocationData(result);
      setAllocations(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Something Went Wrong.", "Failed to fetch allocations.");
    }
  };

  const getAllAllocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocated/get?tourId=${tourId}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch allocations");
      }

      const result = await response.json();
      setGuestsToDisable(result);
    } catch (error) {
      console.log(error);
      Alert.alert("Something Went Wrong.", "Failed to fetch allocations.");
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View className="h-full w-full justify-start items-center relative">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        style={{ width: "100%", paddingHorizontal: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {allocations.length === 0 ? (
          <View className="w-full flex justify-center items-center mt-4">
            <Text className="text-gray-500">No allocations yet.</Text>
          </View>
        ) : (
          <>
            {allocations.map((allocation) => (
              <AllocatedRoomCard
                key={`${allocation.roomNo}-${allocation.roomType}`}
                allocation={allocation}
                getAllocationsByGuestHouseId={getAllocationsByGuestHouseId}
                getBookedUsers={getBookedUsers}
                getAllAllocations={getAllAllocations}
                setEditModalVisible={setEditModalVisible}
              />
            ))}
          </>
        )}
      </ScrollView>
      <View className="w-full absolute bottom-2 h-12 flex justify-center items-center">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setModalVisible(true)}
          style={{
            width: 270,
            backgroundColor: "green",
            borderRadius: 6,
            paddingVertical: 12,
            display: "flex",
            justifyContentL: "center",
            alignItems: "center",
          }}
        >
          <Text className="text-white font-medium">Allocate Room</Text>
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: width * 0.9,
              padding: 16,
              backgroundColor: "white",
              borderRadius: 10,
              elevation: 8,
            }}
          >
            <ModalBody
              guests={guests}
              setModalVisible={setModalVisible}
              tourId={tourId}
              accommodationId={id}
              getAllocationsByGuestHouseId={getAllocationsByGuestHouseId}
              getBookedUsers={getBookedUsers}
              getAllAllocations={getAllAllocations}
              guestsToDisable={guestsToDisable}
            />
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        animationType="fade"
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: width * 0.9,
              padding: 16,
              backgroundColor: "white",
              borderRadius: 10,
              elevation: 8,
            }}
          >
            <EditModal
              guests={guests}
              tourId={tourId}
              allocations={allocations}
              accommodationId={id}
              getAllocationsByGuestHouseId={getAllocationsByGuestHouseId}
              getBookedUsers={getBookedUsers}
              getAllAllocations={getAllAllocations}
              guestsToDisable={guestsToDisable}
              setEditModalVisible={setEditModalVisible}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default showAccomodationDetails;
