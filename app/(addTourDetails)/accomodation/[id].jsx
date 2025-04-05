import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { exportDataToExcel } from "../../../utils/helpers";
import { ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { showError, showSuccess } from "../../../utils/toastHelper";

const { width } = Dimensions.get("window");

const Accomodation = () => {
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  const [guestHouses, setGuestHouses] = useState([]);

  const [exporting, setExporting] = useState();

  const getAllGuestHouses = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/accommodation/getByTourId?tourId=${id}`
      );
      if (response.status !== 200) {
        throw new Error("Failed to fetch guest houses");
      }
      const data = await response.json();
      setGuestHouses(data);
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  const handleExportDetails = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/accommodation/getByTourId?tourId=${id}`
      );
      if (response.status !== 200) {
        throw new Error("Failed to fetch guest houses");
      }
      const data = await response.json();

      if (data.length === 0) {
        throw new Error("No data to export");
      }

      const formattedData = data.map((d) => ({
        Name: d?.guestHouseName || "",
        Location: d?.location || "",
        Rooms: d?.numberOfRoom || 0,
        Occupancy: d?.totalOccupancy || 0,
        Allocated: d?.allocatedCount || 0,
      }));

      await exportDataToExcel(formattedData, "guestHouseData");
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getAllGuestHouses();
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(() => {
    getAllGuestHouses();
  });

  return (
    <View
      style={{
        paddingHorizontal: 12,
        flex: 1,
        alignItems: "center",
        width: "100%",
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
      }}
    >
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{
          paddingHorizontal: 6,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          style={{
            width: "100%",
            marginTop: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {guestHouses.length > 0 ? (
            guestHouses.map((i) => (
              <AccomodationButton key={i._id} tourId={id} {...i} />
            ))
          ) : (
            <View className="h-44 w-full flex justify-center items-center mt-10">
              <Ionicons name="document-outline" size={48} color="#228B22" />
              <Text className="text-xl font-semibold mt-4">
                No guest houses added yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
          width: "100%",
          justifyContent: "space-between",
          position: "absolute",
          bottom: 16,
          paddingHorizontal: 12,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleExportDetails}
          style={{
            flex: 1,
            backgroundColor: "#ccc",
            paddingVertical: 12,
            borderRadius: 5,
            alignItems: "center",
            marginRight: 5,
          }}
        >
          {exporting ? (
            <ActivityIndicator size={"small"} color="#228B22" />
          ) : (
            <Text style={{ color: "black", fontWeight: "400" }}>
              Export Details
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push(`(addTourDetails)/addAccomodationForm/${id}`)
          }
          style={{
            flex: 1,
            backgroundColor: "#228B22",
            paddingVertical: 12,
            borderRadius: 5,
            alignItems: "center",
            marginLeft: 5,
          }}
        >
          <Text style={{ color: "white", fontWeight: "400" }}>
            Add Accomodation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AccomodationButton = ({
  guestHouseName,
  totalOccupancy,
  _id,
  tourId,
  allocatedCount,
}) => {

  const handleDeleteAccomodation = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/accommodation/delete?id=${_id}`,
        {
          method: "DELETE",
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to delete accomodation");
      }
      showSuccess("Accomodation deleted successfully");
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  }

  return (
    <Pressable
      activeOpacity={0.9}
      onLongPress={() =>
        Alert.alert(
          "Edit or Delete Accomodation",
          "What would you like to do?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              onPress: handleDeleteAccomodation,
            },
            {
              text: "Edit",
              onPress: () =>
                router.push(
                  `(addTourDetails)/editAccomodationDetails/${_id}?tourId=${tourId}`
                ),
            },
          ]
        )    
      }
      onPress={() =>
        router.push(
          `(addTourDetails)/showAccomodationDetails/${_id}?tourId=${tourId}`
        )
      }
      style={{
        backgroundColor: "white",
        elevation: 5,
        borderRadius: 8,
        marginTop: 10,
        width: width * 0.9,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text>{guestHouseName}</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text style={{ color: "#228B22", fontSize: 16, fontWeight: "500" }}>
            {allocatedCount}
          </Text>
          <Text style={{ fontSize: 12 }}>/{totalOccupancy}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default Accomodation;
