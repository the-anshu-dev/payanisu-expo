import * as Location from "expo-location";
import { showWarning } from "./toastHelper";

export const requestForegroundLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    showWarning("Location permission not granted");
    return false;
  }
  return true;
};

export const requestBackgroundLocation = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== "granted") {
    showWarning("Location permission not granted");
    return false;
  }
  return true;
};
