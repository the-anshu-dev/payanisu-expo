import React, { useState, useEffect } from "react";
import { Dimensions, Platform, StyleSheet, View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useDispatch } from "react-redux";
import { setMapLink } from "../redux/slices/mapSlice";
import { showError } from "../utils/toastHelper";

const { height } = Dimensions.get("window");

const MyTourCheckPoints = ({ checkPoints = [] }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeError, setRouteError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showError("Permission denied");
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
    if (!userLocation || checkPoints.length === 0) return;

    const destination = checkPoints[checkPoints.length - 1];
    const mapsUrl = Platform.select({
      ios: `maps://?daddr=${destination.latitude},${destination.longitude}&dirflg=d`,
      android: `google.navigation:q=${destination.latitude},${destination.longitude}&mode=d`,
    });

    dispatch(setMapLink(mapsUrl));
  }, [userLocation, checkPoints, dispatch]);

  return (
    <View style={styles.screenContainer}>
      {routeError && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            No Routes between given checkpoints
          </Text>
        </View>
      )}
      <View className="rounded-xl overflow-hidden px-4">
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
            {checkPoints.map((cp) => (
              <Marker
                key={cp._id}
                coordinate={{
                  latitude: cp.latitude,
                  longitude: cp.longitude,
                }}
                title={cp.name}
                description={cp.description}
                pinColor="red"
              />
            ))}
            {checkPoints.map((cp, index) => {
              if (index < checkPoints.length - 1) {
                const origin = {
                  latitude: cp.latitude,
                  longitude: cp.longitude,
                };
                const destination = {
                  latitude: checkPoints[index + 1].latitude,
                  longitude: checkPoints[index + 1].longitude,
                };

                return (
                  <MapViewDirections
                    key={index}
                    origin={origin}
                    destination={destination}
                    apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY}
                    strokeWidth={6}
                    strokeColor="#228B22"
                    onError={(errorMessage) => {
                      if (errorMessage.includes("ZERO_RESULTS")) {
                        setRouteError(true);
                      }
                    }}
                  />
                );
              }
              return null;
            })}
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
    height: height * 0.7,
    width: "100%",
    borderRadius: 10,
  },
  warningBanner: {
    padding: 10,
    backgroundColor: "#FFF3CD",
    borderBottomWidth: 1,
    borderColor: "#FFD966",
    alignItems: "center",
  },
  warningText: {
    color: "#856404",
    fontWeight: "600",
  },
});

export default MyTourCheckPoints;
