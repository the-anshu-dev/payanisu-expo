import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Text } from "react-native";

const CarouselImageRender = ({ item }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
    
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: item }}
        style={styles.image}
        contentFit="cover"
        transition={300}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        cachePolicy="memory-disk"
      />

      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="green" />
        </View>
      )}

      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  errorText: {
    color: "#ff3b30",
    textAlign: "center",
    fontWeight: "bold",
  }
});

export default CarouselImageRender;