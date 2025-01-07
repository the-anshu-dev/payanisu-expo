import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { shorten } from "../../utils/helpers";

const RoomMates = () => {
  const { id } = useLocalSearchParams();

  const [mates, setMates] = useState([]);

  const [refresh, setRefresh] = useState(false);

  const getMates = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocated/getByRoom?roomNumber=${id}`
      );
      if (response.status !== 200) {
        throw new Error("Failed to get bus mates.");
      }
      const result = await response.json();
      setMates(result);
    } catch (error) {
      Alert.alert("Oops", "Something went wrong.");
      console.log("error:", error);
    }
  };

  const onRefresh = async () => {
    setRefresh(true);
    try {
      await getMates();
    } finally {
      setRefresh(false);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ flex: 1, width: "100%", padding: 10 }}
      refreshControl={
        <RefreshControl onRefresh={onRefresh} refreshing={refresh} />
      }
    >
      {mates.map((mate) => (
        <MateCard key={mate._id} mate={mate.bookingData} />
      ))}
    </ScrollView>
  );
};

const MateCard = ({ mate }) => {
  return (
    <View style={styles.matesCardContainer}>
      <Text style={{ width: "30%", fontWeight: "500", color: "green" }}>
        {mate.name.split(" ")[0]}
      </Text>
      <Text style={{ width: "10%", fontWeight: "900" }}>
        {mate.gender.charAt(0)}
      </Text>
      <Text style={{ width: "10%" }}>{mate.age}</Text>
      <Text style={{ width: "50%" }}>{shorten(mate.email, 25)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    padding: 10,
  },
  matesCardContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 5,
    borderRadius: 10,
  },
});

export default RoomMates;
