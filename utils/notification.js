// Dynamic Notification Function 

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import axios from "axios";
import { showWarning } from "./toastHelper";

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    showWarning("Must use a physical device for Push Notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Permission not granted!");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Expo Push Token:", token);

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

/**
 * Send a Local Notification
 * @param {string} title - Notification Title
 * @param {string} body - Notification Body
 * @param {number} delay - Delay in seconds (optional)
 */
export async function sendLocalNotification(title, body, delay = 1) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { customData: "any data here" },
    },
    trigger: { seconds: delay },
  });
}

/**
 * Send a Push Notification
 * @param {string} expoPushToken - Receiver's Expo Push Token
 * @param {string} title - Notification Title
 * @param {string} body - Notification Body
 * @param {object} data - Additional data (optional)
 */
export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data,
  };

  await axios.post("https://exp.host/--/api/v2/push/send", message, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
  });
}
