import { Platform, ToastAndroid } from "react-native";
import Toast from "react-native-root-toast";

const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
    });
  }
};

export const showSuccess = (message) => showToast(message);
export const showError = (message) => showToast(message);
export const showInfo = (message) => showToast(message);
export const showWarning = (message) => showToast(message);
