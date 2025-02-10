import React, { useState, useEffect } from "react";
import { Alert, Dimensions, Platform, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useDispatch } from "react-redux";
import { setMapLink } from "../redux/slices/mapSlice";

const { height } = Dimensions.get("window");
const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const MyTourCheckPoints = ({ checkPoints = [] }) => {
  const [userLocation, setUserLocation] = useState(null);
  const dispatch = useDispatch();

  const filteredCheckPoints = checkPoints.filter(
    (cp) => cp.type === "Geo Tagging"
  );

  useEffect(() => {
    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05, 
        longitudeDelta: 0.05,
      });
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    if (!userLocation || filteredCheckPoints.length === 0) return;

    const destination = filteredCheckPoints[filteredCheckPoints.length - 1];
    const mapsUrl = Platform.select({
      ios: `maps://?daddr=${destination.latitude},${destination.longitude}&dirflg=d`,
      android: `google.navigation:q=${destination.latitude},${destination.longitude}&mode=d`,
    });

    dispatch(setMapLink(mapsUrl));
  }, [userLocation, filteredCheckPoints, dispatch]);

  return (
    <View style={styles.screenContainer}>
      <View className="rounded-xl overflow-hidden">
        <View className="w-full rounded-xl overflow-hidden mt-2 border border-gray-500/50">
          <MapView
            style={styles.mapViewStyle}
            region={
              userLocation || {
                latitude: 12.9716,
                longitude: 77.5946,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            }
            showsUserLocation={true}
          >
            {filteredCheckPoints.map((checkpoint) => (
              <Marker
                key={checkpoint._id}
                coordinate={{
                  latitude: checkpoint.latitude,
                  longitude: checkpoint.longitude,
                }}
                title={checkpoint.name}
                description={checkpoint.description}
                pinColor="red"
              />
            ))}

            {userLocation &&
              filteredCheckPoints.map((checkpoint, index) => (
                <MapViewDirections
                  key={index}
                  origin={userLocation}
                  destination={{
                    latitude: checkpoint.latitude,
                    longitude: checkpoint.longitude,
                  }}
                  apikey={apiKey}
                  strokeWidth={6}
                  strokeColor="green"
                  onError={(errorMessage) => {
                    if (errorMessage.includes("ZERO_RESULTS")) {
                      Alert.alert(
                        "No Route Found",
                        "No available route between your location and the destination."
                      );
                    }
                  }}
                />
              ))}
          </MapView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    height: "100%",
    width: "100%",
  },
  mapViewStyle: {
    height: height * 0.75,
    width: "100%",
    borderRadius: 10,
  },
});

export default MyTourCheckPoints;
