import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const { width, height } = Dimensions.get("window");

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const MyTourCheckPoints = () => {
  const [region, setRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [startLocation, setStartLocation] = useState(null);
  const [destination, setDestination] = useState(null);

  return (
    <View style={styles.screenContainer}>
      <View className="rounded-xl overflow-hidden">
        <View className="w-full rounded-xl overflow-hidden mt-2 border border-gray-500/50">
          <MapView style={styles.mapViewStyle} region={region}>
            {startLocation && destination && (
              <MapViewDirections
                origin={startLocation}
                destination={destination}
                apikey={apiKey}
                strokeWidth={3}
                strokeColor="blue"
                optimizeWaypoints={true}
              />
            )}
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
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MyTourCheckPoints;
