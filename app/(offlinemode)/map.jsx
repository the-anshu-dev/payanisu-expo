import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import * as Network from "expo-network";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError } from "../../utils/toastHelper";

const { height, width } = Dimensions.get("window");

const Map = () => {
  const [location, setLocation] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const [checkPoints, setCheckPoints] = useState([]);

  const [completedCheckpoints, setCompletedCheckpoints] = useState([]);

  const getData = async () => {
    try {
      const geoTaggedCheckPoints = await AsyncStorage.getItem(
        "geoTaggedCheckPoints"
      );
      const parsedGeoTaggedCheckPoints = geoTaggedCheckPoints
        ? JSON.parse(geoTaggedCheckPoints)
        : [];
      setCheckPoints(parsedGeoTaggedCheckPoints);
    } catch (error) {
      console.error("Error fetching data from AsyncStorage:", error);
    }
  };

  const saveCheckpoint = async (checkPoint) => {
    try {
      const existingCheckpoints = await AsyncStorage.getItem(
        "completedCheckpoints"
      );
      const parsedCheckpoints = existingCheckpoints
        ? JSON.parse(existingCheckpoints)
        : [];
      const updatedCheckpoints = [...parsedCheckpoints, checkPoint];
      await AsyncStorage.setItem(
        "completedCheckpoints",
        JSON.stringify(updatedCheckpoints)
      );
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    let locationSubscription;
    let countdownTimer;

    const requestLocationPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    };

    const ensureGPSEnabled = async () => {
      const isGPSEnabled = await Location.hasServicesEnabledAsync();
      if (!isGPSEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable GPS to continue using this feature.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "android") {
                  Linking.openSettings();
                } else {
                  Alert.alert(
                    "Manual Action Required",
                    "Go to Settings > Privacy > Location Services to enable GPS."
                  );
                }
              },
            },
          ]
        );
      }
      return isGPSEnabled;
    };

    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsOffline(!networkState.isConnected);
      } catch (error) {
        console.log("Network status check failed", error);
        setIsOffline(true);
      }
    };

    const startLocationTracking = async () => {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) return;

      const isGPSEnabled = await ensureGPSEnabled();
      if (!isGPSEnabled) return;

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 5,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const checkPoint = checkPoints.find(
            (point) =>
              point.latitude === latitude && point.longitude === longitude
          );
          if (checkPoint) {
            saveCheckpoint(checkPoint);
          }
          setLocation({
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          });
        }
      );
    };

    startLocationTracking();
    checkNetworkStatus();

    countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => {
      if (locationSubscription) locationSubscription.remove();
      clearInterval(countdownTimer);
    };
  }, []);

  useEffect(() => {
    const getCompletedCheckpoints = async () => {
      try {
        const completedCheckpoints = await AsyncStorage.getItem(
          "completedCheckpoints"
        );
        const parsedCheckpoints = completedCheckpoints
          ? JSON.parse(completedCheckpoints)
          : [];
        setCompletedCheckpoints(parsedCheckpoints);
      } catch (error) {
        console.error("Error getting completed checkpoints:", error);
        setCompletedCheckpoints([]);
      }
    };
    getCompletedCheckpoints();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.container}>
          {location && (
            <View style={{ height: height * 0.6 }} className="p-2">
              <View className="rounded-md overflow-hidden h-full">
                <MapView
                  style={styles.map}
                  showsUserLocation={true}
                  region={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                    title="Current Location"
                    description={`Status: ${isOffline ? "Offline" : "Online"}`}
                  />
                </MapView>
              </View>
            </View>
          )}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Location updates in: {countdown}s
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoBox}>
              <Text className="font-semibold">
                Latitude: {location?.latitude.toFixed(4) || "N/A"}
              </Text>
              <Text className="font-semibold">
                Longitude: {location?.longitude.toFixed(4) || "N/A"}
              </Text>
              <Text className="font-semibold">
                Network Status: {isOffline ? "Offline" : "Online"}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            padding: 10,
            height: height * 0.6,
            borderWidth: 1,
            borderColor: "#228B22",
            borderRadius: 10,
            margin: 10,
          }}
        >
          <Text className="font-semibold text-center">Captured Lat-Long</Text>
          {completedCheckpoints.length > 0 &&
            completedCheckpoints.map((checkpoint) => (
              <Text key={checkpoint._id}>
                {checkpoint.latitude}, {checkpoint.longitude}
              </Text>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  timerContainer: {
    width: width,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#e0e0e0",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#228B22",
  },
  infoContainer: {
    width: width,
    padding: 10,
    backgroundColor: "#f0f0f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: {
    elevation: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
  },
});

export default Map;

// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Dimensions } from 'react-native';
// import * as Location from 'expo-location';
// import * as Network from 'expo-network';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MapView, { Marker } from 'react-native-maps';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const { height, width } = Dimensions.get('window');

// const Map = () => {
//     const [location, setLocation] = useState(null);
//     const [isOffline, setIsOffline] = useState(false);
//     const [storedLocations, setStoredLocations] = useState([]);
//     const [countdown, setCountdown] = useState(10);

//     const requestLocationPermissions = async () => {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         return status === 'granted';
//     };

//     const checkNetworkStatus = async () => {
//         try {
//             const networkState = await Network.getNetworkStateAsync();
//             setIsOffline(!networkState.isConnected);
//         } catch (error) {
//             console.log('Network status check failed', error);
//             setIsOffline(true);
//         }
//     };

//     const getCurrentLocation = async () => {
//         try {
//             const hasPermission = await requestLocationPermissions();
//             if (!hasPermission) return;

//             const location = await Location.getCurrentPositionAsync({});
//             const { latitude, longitude } = location.coords;

//             const newLocation = {
//                 latitude,
//                 longitude,
//                 timestamp: new Date().toISOString()
//             };
//             setLocation(newLocation);
//             await saveLocationToStorage(newLocation);
//         } catch (error) {
//             console.error('Location tracking error', error);
//         }
//     };

//     const saveLocationToStorage = async (location) => {
//         try {
//             const existingLocations = await AsyncStorage.getItem('offlineLocations');
//             const locations = existingLocations
//                 ? JSON.parse(existingLocations)
//                 : [];

//             const updatedLocations = [...locations, location].slice(-50);

//             await AsyncStorage.setItem(
//                 'offlineLocations',
//                 JSON.stringify(updatedLocations)
//             );

//             setStoredLocations(updatedLocations);
//         } catch (error) {
//             console.error('Storage error', error);
//         }
//     };

//     useEffect(() => {
//         const locationTracker = setInterval(() => {
//             checkNetworkStatus();
//             getCurrentLocation();
//             setCountdown(10);
//         }, 10000);

//         const countdownTimer = setInterval(() => {
//             setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
//         }, 1000);

//         return () => {
//             clearInterval(locationTracker);
//             clearInterval(countdownTimer);
//         };
//     }, []);

//     return (
//         <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
//             <View style={styles.container}>
//                 {location &&
//                     <View style={{ height: height * 0.7 }} className="p-2">
//                         <View className="rounded-md overflow-hidden h-full">
//                             <MapView
//                                 style={styles.map}
//                                 initialRegion={{
//                                     latitude: location?.latitude,
//                                     longitude: location?.longitude,
//                                     latitudeDelta: 0.0922,
//                                     longitudeDelta: 0.0421,
//                                 }}
//                             >
//                                 <Marker
//                                     coordinate={{
//                                         latitude: location?.latitude,
//                                         longitude: location?.longitude
//                                     }}
//                                     title="Current Location"
//                                     description={`Status: ${isOffline ? 'Offline' : 'Online'}`}
//                                 />
//                             </MapView>
//                         </View>
//                     </View>
//                 }
//                 <View style={styles.timerContainer}>
//                     <Text style={styles.timerText}>
//                         Location updates in : {countdown}
//                     </Text>
//                 </View>
//                 <View style={styles.infoContainer}>
//                     <View style={{ elevation: 1 }} className="flex flex-row justify-between items-center px-5 w-full py-2 bg-white rounded-lg">
//                         <Text className="font-semibold">
//                             Latitude : {location?.latitude.toFixed(4) || 'N/A'}
//                         </Text>
//                         <Text className="font-semibold">
//                             Longitude : {location?.longitude.toFixed(4) || 'N/A'}
//                         </Text>
//                     </View>
//                 </View>
//             </View>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     map: {
//         width: '100%',
//         height: '100%',
//         borderRadius: 10
//     },
//     timerContainer: {
//         width: width,
//         alignItems: 'center',
//         paddingVertical: 10,
//         backgroundColor: '#e0e0e0',
//     },
//     timerText: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#228B22',
//     },
//     infoContainer: {
//         width: width,
//         padding: 10,
//         backgroundColor: '#f0f0f0',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });

// export default Map;
