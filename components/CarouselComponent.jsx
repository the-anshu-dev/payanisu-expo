import { Dimensions, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import CarouselCard from "./UI/CarouselCard";
import { ScrollView } from "react-native-gesture-handler";
import CardSkeleton from "./UI/CardSkeleton";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTours } from "../hooks/useTours";

const { width, height } = Dimensions.get("window");

const CarouselComponent = () => {
  const {tours, loading} = useTours();

  const [activeTours, setActiveTours] = useState([]);

  useEffect(() => {
    if (!Array.isArray(tours)) return;
  
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
  
    const filteredTours = tours.filter((item) => {
      const closeDateStr = new Date(item.booking_close).toISOString().split("T")[0];
      return closeDateStr >= todayStr && item.status;
    });
  
    setActiveTours(filteredTours);
  }, [tours]);
  
  if (activeTours.length === 0)
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.noTourAvailable}>
            <Ionicons name="alert-circle-outline" color="#228B22" size={80} />
            <Text style={{ fontSize: 18, marginTop: 18, fontWeight: "bold" }}>
              No Tours Available
            </Text>
          </View>
        </ScrollView>
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.cardContainer}>
          {activeTours ? (
            activeTours.map((tour, index) => (
              <CarouselCard key={index} tour={tour} />
            ))
          ) : (
            <CardSkeleton />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    height: "70%",
    zIndex: 999,
  },
  noTourAvailable: {
    width: width * 0.8,
    height: height * 0.5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    elevation: 5,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  cardContainer: {
    height: "100%",
    marginLeft: 10,
    marginRight: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

export default CarouselComponent;
