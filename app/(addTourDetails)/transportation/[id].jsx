import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { exportDataToExcel } from "../../../utils/helpers";
import { ActivityIndicator } from "react-native-paper";
import { showError, showSuccess } from "../../../utils/toastHelper";

const { width, height } = Dimensions.get("window");

const Transportation = () => {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [transportationDetails, setTransportationDetails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handelGetTranportationDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/transport/getByTourId?tourId=${id}`
      );

      if (!response.ok || response.status !== 200) {
        throw new Error("Failed to get transportation details.");
      }

      const result = await response.json();
      setTransportationDetails(result);
    } catch (error) {
      showError("Failed to get transportation details."); 
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await handelGetTranportationDetails();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const formattedData = transportationDetails?.map((d) => ({
        BusName: d?.busName || "",
        PlateNumber: d?.busNumber || "",
        Driver: d?.driverName || "",
        Contact: d?.driverNo || "",
        AllocatedNo: d?.allocatedCount || 0,
      }));

      await exportDataToExcel(formattedData, "tranportDetails");
    } catch (error) {
      showError("Failed to export tranport details");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: 80,
        }}
        style={{
          width: "100%",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-2 gap-3">
          {transportationDetails.length > 0 ? (
            <>
              {transportationDetails?.map((item) => (
                <TransportDetailButton
                  key={item?._id}
                  id={item?._id}
                  tourId={id}
                  name={item?.busName}
                  totalCapacity={item?.capacity}
                  filled={item?.allocatedCount}
                  onRefresh={onRefresh}
                />
              ))}
            </>
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 50,
                backgroundColor: "white",
                borderRadius: 10,
              }}
            >
              <Ionicons name="trash-bin-outline" color={"gray"} size={28} />
              <Text
                style={{
                  marginTop: 20,
                  fontSize: 16,
                  fontWeight: "600",
                  color: "gray",
                }}
              >
                No Transportation Added Yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.buttons, { backgroundColor: "#228B22" }]}
          activeOpacity={0.9}
          onPress={() =>
            router.push(`/(addTourDetails)/addTransportDetails/${id}`)
          }
        >
          <Text style={[styles.buttonText, { color: "white" }]}>
            Add Transportation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TransportDetailButton = ({ id, name, totalCapacity, filled, tourId, onRefresh }) => {

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/transport/delete?id=${id}`,
        {
          method: "DELETE",
        }
      );
      
      if (!response.ok || response.status !== 200) {
        throw new Error("Failed to delete transportation");
      }

      showSuccess("Transportation deleted successfully");
      onRefresh();
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };


  const handleLongPress = () => {
    Alert.alert(
      "Edit or Delete Transportation",
      "What would you like to do?",
      [
        { text: "Cancel", style: "destructive" },
        { text: "Edit", onPress: () => router.push(`(addTourDetails)/editTransportationDetails/${id}?tourId=${tourId}`) },
        { text: "Delete", onPress: handleDelete, style: "destructive" },
      ]
    );
  };

  return (
    <Pressable
      activeOpacity={0.95}
      onLongPress={handleLongPress}
      delayLongPress={400}
      onPress={() =>
        router.push(`(addTourDetails)/transportDetails/${id}?tourId=${tourId}`)
      }
      style={{ width: "100%" }}
    >
      <View style={styles.transportButtonContainer}>
        <Text style={{ fontWeight: "500" }}>{name}</Text>
        <View style={[styles.commonFlexBox, { justifyContent: "flex-end" }]}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#228B22" }}>
            {filled}/
          </Text>
          <Text>{totalCapacity}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    height: "100%",
    width: "100%",
    position: "relative",
  },
  buttonsContainer: {
    width: width,
    bottom: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttons: {
    width: width * 0.9,
    height: height * 0.05,
    borderRadius: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
  transportButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    height: height * 0.05,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: "white",
    elevation: 8,
  },
  commonFlexBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});

export default Transportation;
