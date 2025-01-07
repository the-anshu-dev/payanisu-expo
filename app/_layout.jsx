import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import store from "@/redux/store.js";
import CustomBackButton from "@/components/UI/CustomBackButton";
import "react-native-get-random-values";
import * as Location from "expo-location";
import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("myNotificationChannel", {
        name: "A channel is needed for the permissions prompt to appear",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert(
          "Permission not granted to get push token for push notification!"
        );
        return;
      }
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error("Project ID not found");
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" backgroundColor="#000" translucent={false} />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="temp" options={{ headerShown: false }} />
          <Stack.Screen name="offline" options={{ headerShown: false }} />
          <Stack.Screen name="form" options={{ headerShown: false }} />
          <Stack.Screen name="addRoles" options={{ headerShown: false }} />
          <Stack.Screen name="addMember" options={{ headerShown: false }} />
          <Stack.Screen name="addTours" options={getOpt("Add Tour")} />
          <Stack.Screen name="addBusImg" options={getOpt("Add Bus Images")} />
          <Stack.Screen
            name="addHotelImg"
            options={getOpt("Add Hotel Images")}
          />
          <Stack.Screen
            name="addTourImgs"
            options={getOpt("Add Tour Images")}
          />
          <Stack.Screen name="editProfile" options={getOpt("Create Profile")} />
          <Stack.Screen
            name="updateProfile"
            options={getOpt("Update Profile")}
          />
          <Stack.Screen name="terms" options={getOpt("Terms & Conditions")} />
          <Stack.Screen name="contact" options={getOpt("Contact Us")} />
          <Stack.Screen name="about" options={getOpt("About Us")} />
          <Stack.Screen
            name="privacyPolicy"
            options={getOpt("Privacy Policy")}
          />
          <Stack.Screen name="Menu" options={getOpt("Menu")} />
          <Stack.Screen name="notification" options={getOpt("Notification")} />
          <Stack.Screen name="profile" options={getOpt("My Profile")} />
          <Stack.Screen name="tourmates" options={getOpt("Tour Mates")} />
          <Stack.Screen name="details/[id]" options={getOpt("Tour Details")} />
          <Stack.Screen name="postdetails/[id]" options={getOpt("Post")} />
          <Stack.Screen name="tour/[id]" options={getOpt("Tour Details")} />
          <Stack.Screen name="room-mates/[id]" options={getOpt("Room Mates")} />
          <Stack.Screen name="bus-mates/[id]" options={getOpt("Bus Mates")} />
          <Stack.Screen
            name="mytour/[id]"
            options={getOpt("My Tour Details")}
          />
          <Stack.Screen name="payment" options={getOpt("Payment")} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          <Stack.Screen
            name="(addTourDetails)/accomodation/[id]"
            options={getOpt("Accomodations", "(addTourDetails)/tourDetails")}
          />
          <Stack.Screen
            name="(addTourDetails)/allocatedCoordinators/[id]"
            options={getOpt(
              "Allocated Coordinators",
              "(addTourDetails)/allocatedCoordinators"
            )}
          />
          <Stack.Screen
            name="(addTourDetails)/checkPoints/[id]"
            options={getOpt("Check Points", "(addTourDetails)/checkPoints")}
          />
          <Stack.Screen
            name="(addTourDetails)/includedNotIncluded/[id]"
            options={getOpt(
              "Included/Not Included",
              "(addTourDetails)/includedNotIncluded"
            )}
          />
          <Stack.Screen
            name="(addTourDetails)/myNotes/[id]"
            options={getOpt("My Notes", "(addTourDetails)/myNotes")}
          />
          <Stack.Screen
            name="(addTourDetails)/tourDetails/[id]"
            options={getOpt("Tour Details", "(addTourDetails)/tourDetails")}
          />
          <Stack.Screen
            name="(addTourDetails)/transportation/[id]"
            options={getOpt(
              "Transportations",
              "(addTourDetails)/transportation"
            )}
          />
          <Stack.Screen
            name="(addTourDetails)/guestsEnrolled/[id]"
            options={getOpt("Enrolled Guests")}
          />
          <Stack.Screen
            name="(addTourDetails)/createCheckpoints/[id]"
            options={getOpt("Create Check Points")}
          />
          <Stack.Screen
            name="(addTourDetails)/luggage/[id]"
            options={getOpt("Luggage Items")}
          />
          <Stack.Screen
            name="(addTourDetails)/exportDetails/[id]"
            options={getOpt("Export Details")}
          />
          <Stack.Screen
            name="(addTourDetails)/viewCheckIns/[id]"
            options={getOpt("Checked In")}
          />
          <Stack.Screen
            name="(addTourDetails)/addAccomodationForm/[id]"
            options={getOpt("Add Accomodation Details")}
          />
          <Stack.Screen
            name="(addTourDetails)/showAccomodationDetails/[id]"
            options={getOpt("Accomodation Details")}
          />
          <Stack.Screen
            name="(addTourDetails)/RoomAllocation/[id]"
            options={getOpt("Room Allocation")}
          />
          <Stack.Screen
            name="(addTourDetails)/addTransportDetails/[id]"
            options={getOpt("AddTransport Details")}
          />
          <Stack.Screen
            name="(addTourDetails)/transportDetails/[id]"
            options={getOpt("Transport Details")}
          />
          <Stack.Screen
            name="(addTourDetails)/addBoardingPoint/[id]"
            options={getOpt("Boarding Point Details")}
          />
        </Stack>
      </GestureHandlerRootView>
    </Provider>
  );
}

function getOpt(title, backRoute) {
  return {
    headerShown: true,
    title,
    headerBackTitleVisible: false,
    headerLeft: () => (
      <CustomBackButton icon={"chevron-back-outline"} backRoute={backRoute} />
    ),
  };
}
