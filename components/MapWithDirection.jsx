import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const MapScreen = ({ destination }) => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={{
          latitude: userLocation?.latitude || destination.latitude,
          longitude: userLocation?.longitude || destination.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {userLocation && (
          <MapViewDirections
            origin={userLocation}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
        <Marker coordinate={destination} title="Destination" />
      </MapView>
    </View>
  );
};

export default MapScreen;
