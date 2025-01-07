import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { exportDataToExcel } from "../../../utils/helpers";
import { ActivityIndicator } from "react-native-paper";

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
      console.log("Error:", error);
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
      console.log("Failed to export tranport details", error);
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
        <View>
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
              }}
            >
              <Ionicons name="trash-bin-outline" color={"green"} size={28} />
              <Text
                style={{
                  marginTop: 20,
                  fontSize: 16,
                  fontWeight: "600",
                  color: "green",
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
          style={[styles.buttons, { backgroundColor: "white", borderWidth: 1 }]}
          activeOpacity={0.6}
          onPress={handleExport}
        >
          {exporting ? (
            <ActivityIndicator color="green" size={"small"} />
          ) : (
            <Text style={styles.buttonText}>Export Excel</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttons, { backgroundColor: "green" }]}
          activeOpacity={0.6}
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

const TransportDetailButton = ({ id, name, totalCapacity, filled, tourId }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push(`(addTourDetails)/transportDetails/${id}?tourId=${tourId}`)
      }
      style={{ width: "100%", marginBottom: 10 }}
    >
      <View style={styles.transportButtonContainer}>
        <Text style={{ fontWeight: "500" }}>{name}</Text>
        <View style={[styles.commonFlexBox, { justifyContent: "flex-end" }]}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "green" }}>
            {filled}/
          </Text>
          <Text>{totalCapacity}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    position: "absolute",
    bottom: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  buttons: {
    width: width * 0.4,
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
    paddingHorizontal: 5,
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
