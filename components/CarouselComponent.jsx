import { Dimensions, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import CarouselCard from "./UI/CarouselCard";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import CardSkeleton from "./UI/CardSkeleton";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const CarouselComponent = () => {
  const { tour } = useSelector((state) => state.tour);
  const [activeTours, setActiveTours] = useState([]);

  useEffect(() => {
    setActiveTours(tour.filter((item) => item.status === true));
  }, [tour]);

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
              No Active Tours Available
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
