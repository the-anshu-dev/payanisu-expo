import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import TrashIcon from "../../../assets/trash-04.svg";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const Luggage = () => {
  const { id } = useLocalSearchParams();
  const { user } = useSelector((state) => state.user);

  const [backpackItems, setBackpackItems] = useState([]);
  const [checkInItems, setCheckInItems] = useState([]);

  const [isBackpack, setIsBackpack] = useState(true);

  const [loading, setLoading] = useState(false);
  const [getLoading, setGetLoading] = useState(false);

  const [newItem, setNewItem] = useState("");

  const handleAddItem = async () => {
    setLoading(true);
  
    try {
      if (!user?.email) {
        throw new Error("User email is missing. Please log in again.");
      }
  
      const url = isBackpack
        ? `${process.env.EXPO_PUBLIC_BASE_URL}/api/backpack/add`
        : `${process.env.EXPO_PUBLIC_BASE_URL}/api/baggage/add`;
  
      const body = { tourId: id, item: newItem };
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify(body),
      });
  
      if (response.status === 401) {
        throw new Error("Unauthorized! Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to add items.");
      }
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add item.");
      }
  
      Alert.alert("Success", "Item added successfully.");
      handleGet();
      setNewItem("");
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("Error", error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleDelete = async (itemId) => {
    try {
      if (!user?.email) {
        throw new Error("User email is missing. Please log in again.");
      }
  
      const url = isBackpack
        ? `${process.env.EXPO_PUBLIC_BASE_URL}/api/backpack/delete?id=${itemId}`
        : `${process.env.EXPO_PUBLIC_BASE_URL}/api/baggage/delete?id=${itemId}`;
  
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "x-user-email": user.email,
        },
      });
  
      if (response.status === 401) {
        throw new Error("Unauthorized! Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to delete this item.");
      }
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete item.");
      }
  
      Alert.alert("Success", "Item deleted successfully.");
      handleGet();
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", error.message || "Something went wrong. Please try again.");
    }
  };
  

  const handleGet = async () => {
    setGetLoading(true);
    try {
      const response1 = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/backpack/get?tourId=${id}`
      );
      const response2 = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/baggage/get?tourId=${id}`
      );

      if (response1.status !== 200 || response2.status !== 200) {
        throw new Error("Failed to fetch luggage items");
      }

      const result1 = await response1.json();
      const result2 = await response2.json();

      setBackpackItems(Array.isArray(result1) ? result1 : []);
      setCheckInItems(Array.isArray(result2) ? result2 : []);
    } catch (error) {
      Alert.alert(
        "Oops!",
        "Something went wrong...\n\nPlease try again later."
      );
      console.error("Error fetching luggage items:", error);
      router.back();
    } finally {
      setGetLoading(false);
    }
  };

  useState(() => {
    handleGet();
  }, []);

  if (getLoading) {
    return (
      <View className="flex justify-center items-center h-full w-full">
        <ActivityIndicator size={"large"} color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setIsBackpack(true)}
          activeOpacity={0.8}
          style={isBackpack ? styles.activeTab : styles.tab}
        >
          <Text style={styles.tabText}>Backpack</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsBackpack(false)}
          activeOpacity={0.8}
          style={!isBackpack ? styles.activeTab : styles.tab}
        >
          <Text style={styles.tabText}>Check-In Baggage</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.listContainer}>
        <ScrollView style={styles.listContainer}>
          {(isBackpack ? backpackItems : checkInItems).length === 0 ? (
            <View className="h-44 w-full flex justify-center items-center mt-10">
              <Ionicons name="document-outline" size={48} color="green" />
              <Text className="text-xl font-semibold mt-4">
                No items added yet
              </Text>
            </View>
          ) : (
            (isBackpack ? backpackItems : checkInItems).map((i, index) => (
              <View key={index} style={styles.listItem}>
                <Text>{i?.item}</Text>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => handleDelete(i?._id)}
                >
                  <TrashIcon height={20} width={20} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </ScrollView>
      <TextInput
        style={styles.input}
        placeholder="Add new item"
        value={newItem}
        onChangeText={setNewItem}
      />
      <TouchableOpacity
        disabled={newItem === "" ? true : false}
        onPress={handleAddItem}
        style={styles.addButton}
      >
        {loading ? (
          <ActivityIndicator size={"small"} color="white" />
        ) : (
          <Text style={styles.addButtonText}>Add Item</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    marginBottom: height * 0.02,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: height * 0.02,
    borderRadius: 10,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    padding: height * 0.015,
    backgroundColor: "#787878",
    alignItems: "center",
  },
  activeTab: {
    flex: 1,
    padding: height * 0.015,
    backgroundColor: "green",
    alignItems: "center",
  },
  tabText: {
    color: "white",
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
    marginBottom: height * 0.02,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  itemText: {
    flex: 1,
  },
  input: {
    padding: height * 0.015,
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: height * 0.02,
  },
  addButton: {
    padding: height * 0.015,
    backgroundColor: "green",
    alignItems: "center",
    borderRadius: 5,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Luggage;
