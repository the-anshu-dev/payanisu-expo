
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Network from "expo-network";
// import Geolocation from "@react-native-community/geolocation";

export const checkNetworkStatus = async () => {
  const networkState = await Network.getNetworkStateAsync();
  return networkState.isConnected;
};

export const saveOfflineAction = async (action) => {
  try {
    const storedActions =
      JSON.parse(await AsyncStorage.getItem("offlineActions")) || [];
    storedActions.push(action);
    await AsyncStorage.setItem("offlineActions", JSON.stringify(storedActions));
  } catch (error) {
    console.error("Error saving offline action:", error);
  }
};

export const syncOfflineActions = async () => {
  try {
    const storedActions =
      JSON.parse(await AsyncStorage.getItem("offlineActions")) || [];
    if (storedActions.length > 0) {
      // Replace with your API endpoint
      await fetch("https://your-backend-api.com/sync-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storedActions),
      });
      await AsyncStorage.removeItem("offlineActions");
    }
  } catch (error) {
    console.error("Error syncing offline actions:", error);
  }
};

export const requestLocationPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access location was denied");
    return false;
  }
  return true;
};

export const getUserLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({});
    return location;
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
};

// export const isNearby = (userLocation, targetLocation, radiusInMeters) => {
//   const toRadians = (degree) => degree * (Math.PI / 180);

//   const R = 6371000; // Radius of the Earth in meters
//   const dLat = toRadians(targetLocation.latitude - userLocation.lat);
//   const dLon = toRadians(targetLocation.longitude - userLocation.long);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(userLocation.lat)) *
//       Math.cos(toRadians(targetLocation.latitude)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // Distance in meters

//   console.log(distance);

//   return distance <= radiusInMeters;
// };

// export const isWithin100Meters = (
//   currentLat,
//   currentLong,
//   checkpointLat,
//   checkPointLong
// ) => {
//   console.log(
//     "values---->",
//     currentLat,
//     currentLong,
//     checkpointLat,
//     checkPointLong
//   );
//   const earthRadiusInMeters = 6371e3;

//   const latitude1InRadians = (currentLat * Math.PI) / 180;
//   const latitude2InRadians = (checkpointLat * Math.PI) / 180;
//   const latitudeDifferenceInRadians =
//     ((checkpointLat - currentLat) * Math.PI) / 180;
//   const longitudeDifferenceInRadians =
//     ((checkPointLong - currentLong) * Math.PI) / 180;

//   const haversineFormula =
//     Math.sin(latitudeDifferenceInRadians / 2) *
//       Math.sin(latitudeDifferenceInRadians / 2) +
//     Math.cos(latitude1InRadians) *
//       Math.cos(latitude2InRadians) *
//       Math.sin(longitudeDifferenceInRadians / 2) *
//       Math.sin(longitudeDifferenceInRadians / 2);

//   const centralAngle =
//     2 *
//     Math.atan2(Math.sqrt(haversineFormula), Math.sqrt(1 - haversineFormula));
//   const distanceBetweenPoints = earthRadiusInMeters * centralAngle;

//   console.log("distance between points", distanceBetweenPoints);

//   return distanceBetweenPoints <= 100;
// };

// export const getUserLocationInOfflineMode = async () => {
//   try {
//     const position = await new Promise((resolve, reject) => {
//       Geolocation.getCurrentPosition(
//         (position) => resolve(position),
//         (error) => reject(error),
//         { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//       );
//     });
//     console.log("position---->", position);
//     return position;
//   } catch (error) {
//     console.error("Failed to get location:", error);
//     throw error;
//   }
// };
