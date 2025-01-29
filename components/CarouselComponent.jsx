import { Dimensions, useWindowDimensions, View } from "react-native";
import React, { useEffect, useState } from "react";
import CarouselCard from "./UI/CarouselCard";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import CardSkeleton from "./UI/CardSkeleton";
import { StyleSheet } from "react-native";

const { height, width } = Dimensions.get("window");

const CarouselComponent = () => {
  const { tour } = useSelector((state) => state.tour);
    
  const [activeTours, setActiveTours] = useState([]);

  useEffect(() => {
    setActiveTours(tour.filter((item) => item.status === true));
  }, [tour]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ display: "flex", justifyContent: "center", alignItems: "center" }} style={styles.scrollViewContainer} >
        {activeTours && activeTours.length !== 0 ? (
          <View style={{ width: width, height: "90%" }} className="flex flex-row justify-center items-center relative">
            {activeTours.map((tour, index) => (
              <CarouselCard key={index} tour={tour} />
            ))}
          </View>
        ) : (
          <View style={{ width: width, height: "90%" }} className="flex flex-row justify-center items-center relative">
            <CardSkeleton />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    height: "60%",
    zIndex: 999,
  },
  scrollViewContainer: {
    flex: 1,
    width: width,
  }
});

export default CarouselComponent;
