import { Dimensions, View } from "react-native";
import React, { useEffect, useState } from "react";
import CarouselCard from "./UI/CarouselCard";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import CardSkeleton from "./UI/CardSkeleton";
import { StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

const CarouselComponent = () => {
  const { tour } = useSelector((state) => state.tour);
  const [activeTours, setActiveTours] = useState([]);

  useEffect(() => {
    setActiveTours(tour.filter((item) => item.status === true));
  }, [tour]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.cardContainer}>
          {activeTours.length > 0 ? (
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
