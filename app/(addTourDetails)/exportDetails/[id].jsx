import React from "react";
import {
  View,
  Text,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import XLSX from "xlsx";
import { useSelector } from "react-redux";

const Export = () => {
  const { id } = useLocalSearchParams();
  const { user } = useSelector((state) => state.user);

  // Custom button component with consistent styling
  const CustomButton = ({ title, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.6}
      style={{
        width: "80%",
        paddingVertical: 12,
        backgroundColor: "#28a745", // Green color
        borderRadius: 8,
        marginVertical: 8,
        alignItems: "center",
      }}
      onPress={onPress}
    >
      <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Generic function to export data
  const exportDataToExcel = async (data, fileName) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access media library is required!"
        );
        return;
      }

      // Convert JSON data to Excel format
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");

      // Write Excel file to base64
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const fileUri = FileSystem.cacheDirectory + `${fileName}.xlsx`;

      // Save the file to the file system
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert(
            "Permission required",
            "Cannot save file without permission"
          );
          return;
        }

        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          `${fileName}.xlsx`,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ).then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, wbout, {
            encoding: FileSystem.EncodingType.Base64,
          });
          Alert.alert(
            "Success",
            `${fileName} saved successfully in Downloads folder`
          );
        });
      } else {
        Alert.alert("Error", "This method is only supported on Android");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  // Functions to fetch and export different data
  const exportAccommodationDetails = async () => {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/accommodation?email=${user.email}`
    );
    const data = await response.json();
    const formattedData = data.map((item) => ({
      AccommodationName: item.name,
      Location: item.location,
      Cost: item.cost,
      Date: item.date,
    }));
    exportDataToExcel(formattedData, "AccommodationDetails");
  };

  const exportExpenseDetails = async () => {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/expenses?email=${user.email}`
    );
    const data = await response.json();
    const formattedData = data.map((item) => ({
      Description: item.description,
      Amount: item.amount,
      Date: item.date,
    }));
    exportDataToExcel(formattedData, "ExpenseDetails");
  };

  const exportGuestDetails = async () => {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/get-member?email=${user.email}`
    );
    const data = await response.json();
    const formattedData = data.map((item) => ({
      Name: item.name,
      Gender: item.gender,
      Relation: item.relation,
      Age: item.age,
      ContactNo: item.contact,
      Email: item.email,
    }));
    exportDataToExcel(formattedData, "GuestDetails");
  };

  const exportTransportDetails = async () => {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/transport?email=${user.email}`
    );
    const data = await response.json();
    const formattedData = data.map((item) => ({
      TransportType: item.type,
      Company: item.company,
      Cost: item.cost,
      Date: item.date,
    }));
    exportDataToExcel(formattedData, "TransportDetails");
  };

  const exportCheckpointsDetails = async () => {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/checkpoints?email=${user.email}`
    );
    const data = await response.json();
    const formattedData = data.map((item) => ({
      CheckpointName: item.name,
      Location: item.location,
      Time: item.time,
    }));
    exportDataToExcel(formattedData, "CheckpointsDetails");
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 24, marginBottom: 16 }}>
        Export Details
      </Text>
      <CustomButton
        title="Export Accommodation Details"
        onPress={exportAccommodationDetails}
      />
      <CustomButton
        title="Export Expense Details"
        onPress={exportExpenseDetails}
      />
      <CustomButton title="Export Guest Details" onPress={exportGuestDetails} />
      <CustomButton
        title="Export Transport Details"
        onPress={exportTransportDetails}
      />
      <CustomButton
        title="Export Checkpoints Details"
        onPress={exportCheckpointsDetails}
      />
    </ScrollView>
  );
};

export default Export;
