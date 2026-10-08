import * as Location from "expo-location";
import * as Network from "expo-network";

export const checkNetworkStatus = async () => {
  const networkState = await Network.getNetworkStateAsync();
  return networkState.isConnected;
};

export const requestLocationPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access location was denied");
    return false;
  }
  return true;
};