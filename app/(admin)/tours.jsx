import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import TourCard from "../../components/admin/UI/TourCard";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const Tours = () => {
  const { tour } = useSelector((state) => state.tour);

  const [refresh, setRefresh] = useState(false);

  const onRefresh = () => {
    try {
      setRefresh(true);
    } finally {
      setRefresh(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refresh} />
          }
        >
          <View style={styles.tourListContainer}>
            {tour.length > 0 ? (
              tour.map((item) => <TourCard key={item?._id} tour={item} />)
            ) : (
              <View style={styles.noToursCard}>
                <Text style={styles.noToursText}>No Tours Available</Text>
              </View>
            )}
          </View>
        </ScrollView>
        <View style={styles.createButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.createButton}
            onPress={() => router.push("/addTours")}
          >
            <Text style={styles.createButtonText}>Create Tour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: height * 0.1,
    width: "100%",
  },
  tourListContainer: {
    width: width,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap:15,
  },
  noToursCard: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: height * 0.02,
  },
  noToursText: {
    color: "gray",
    fontSize: width * 0.06,
    fontWeight: "bold",
  },
  createButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
  },
  createButton: {
    backgroundColor: "green",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height * 0.01,
    borderRadius: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
});

export default Tours;
