import { useDispatch } from "react-redux";
import { setTour } from "../redux/slices/tourSlice";
import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";
import * as MediaLibrary from "expo-media-library";


export const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  const options = { day: "numeric", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

export const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffInMilliseconds = Math.abs(end - start);
  const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const diffInNights = diffInDays - 1;

  return `${diffInDays} days ${diffInNights} nights`;
};

export const apiRequest = async (
  url,
  method = "GET",
  body = null,
  headers = {}
) => {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) throw new Error(`Error: ${data.message || res.statusText}`);

    return data;
  } catch (error) {
    console.error(`API request failed at ${url}:`, error);
    throw error;
  }
};

export const transformAllocationData = (data) => {
  const roomMap = {};

  data.forEach((entry) => {
    const roomNo = entry.roomNumber;

    // Initialize room data if it doesn't exist
    if (!roomMap[roomNo]) {
      roomMap[roomNo] = {
        roomNo,
        occupancy: entry.occupancy,
        guestNames: [],
        roomType: entry.roomType,
        accommodationIds: [],
        allocationIds: [],
        bookingIds: [],
        tourId: entry.tourId,
      };
    }

    // Add guest name to the room's guestNames array
    roomMap[roomNo].guestNames.push(entry.bookingData.name);
    roomMap[roomNo].allocationIds.push(entry._id);
    roomMap[roomNo].bookingIds.push(entry.bookingId);
    roomMap[roomNo].accommodationIds.push(entry.accommodationId);
  });

  // Convert the map values to an array
  return Object.values(roomMap);
};

export const getAllTours = async () => {
  const dispatch = useDispatch();
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/get-alltours`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch tours");
    }
    const tour = await response.json();
    dispatch(setTour(tour));
  } catch (error) {
    Alert.alert("Oops", "Something went wrong.");
    console.error("Error fetching tours:", error);
  }
};


export const exportDataToExcel = async (data, fileName) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access media library is required!"
      );
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const fileUri = FileSystem.cacheDirectory + `${fileName}.xlsx`;

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
    Alert.alert("Oops!", "Something went wrong. Please try again.");
  }
};

export const shorten = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

export const checkInUser = async (body) => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (response.status !== 200) {
      throw new Error("Failed to check in");
    }
    Alert.alert("Successful", "You are checked in.");
  } catch (error) {
    console.log("Error:", error);
    Alert.alert("Failed to check-in", "Please try again.");
  }
};