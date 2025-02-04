import React, { useState, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");
const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const MyTourCheckPoints = ({ checkPoints }) => {
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);

      if (checkPoints?.length > 0) {
        const lastCheckpoint = checkPoints[checkPoints.length - 1];
        setDestination({
          latitude: lastCheckpoint.latitude,
          longitude: lastCheckpoint.longitude,
        });
      }

      setRegion({
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    };

    getUserLocation();
  }, [checkPoints]);

  return (
    <View style={styles.screenContainer}>
      <View className="rounded-xl overflow-hidden">
        <View className="w-full rounded-xl overflow-hidden mt-2 border border-gray-500/50">
          <MapView style={styles.mapViewStyle} region={region} showsUserLocation={true}>
            {checkPoints?.map((checkpoint) => (
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

            {userLocation && (
              <Marker coordinate={userLocation} title="You are here" pinColor="blue" />
            )}

            {/* {userLocation && destination && (
              <MapViewDirections
                origin={userLocation}
                destination={destination}
                apikey={apiKey}
                strokeWidth={4}
                strokeColor="red"
                optimizeWaypoints={true}
              />
            )} */}
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
