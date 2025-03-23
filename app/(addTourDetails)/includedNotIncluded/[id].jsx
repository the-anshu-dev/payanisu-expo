import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import TrashIcon from "../../../assets/trash-04.svg";
import { useSelector } from "react-redux";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { showError, showSuccess } from "../../../utils/toastHelper";

const { width, height } = Dimensions.get("window");

const TourDetails = () => {
  const { id } = useLocalSearchParams();
  const { user } = useSelector((state) => state.user);

  const [includedItems, setIncludedItems] = useState([]);
  const [notIncludedItems, setNotIncludedItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [isIncludedTab, setIsIncludedTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [getLoading, setGetLoading] = useState(false);

  const handleGet = async () => {
    setGetLoading(true);
    try {
      const response1 = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/included/get?tourId=${id}`
      );

      const response2 = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notIncluded/get?tourId=${id}`
      );

      if (response1.status !== 200 || response2.status !== 200) {
        throw new Error("Failed to fetch luggage items");
      }

      const result1 = await response1.json();
      const result2 = await response2.json();

      setIncludedItems(Array.isArray(result1) ? result1 : []);
      setNotIncludedItems(Array.isArray(result2) ? result2 : []);
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setGetLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    setLoading(true);
    try {
      const url = isIncludedTab
        ? `${process.env.EXPO_PUBLIC_BASE_URL}/api/included/add`
        : `${process.env.EXPO_PUBLIC_BASE_URL}/api/notIncluded/add`;

      const body = {
        tourId: id,
        item: newItem,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify(body),
      });

      if (response.status !== 201) {
        throw new Error("Failed to add item");
      }

      showSuccess("Item added successfully.");
      handleGet();
      setNewItem("");
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const url = isIncludedTab
        ? `${process.env.EXPO_PUBLIC_BASE_URL}/api/included/delete?id=${itemId}`
        : `${process.env.EXPO_PUBLIC_BASE_URL}/api/notIncluded/delete?id=${itemId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "x-user-email": user.email,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to delete item");
      }
      showSuccess("Item deleted successfully.");
      handleGet();
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  useEffect(() => {
    handleGet();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setIsIncludedTab(true)}
          activeOpacity={0.9}
          style={isIncludedTab ? styles.activeTab : styles.tab}
        >
          <Text style={styles.tabText}>Included</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsIncludedTab(false)}
          activeOpacity={0.9}
          style={!isIncludedTab ? styles.activeTab : styles.tab}
        >
          <Text style={styles.tabText}>Not Included</Text>
        </TouchableOpacity>
      </View>
      {getLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#228B22" />
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {(isIncludedTab ? includedItems : notIncludedItems).length === 0 ? (
            <View className="h-44 w-full flex justify-center items-center mt-10">
              <Ionicons name="document-outline" size={48} color="gray" />
              <Text className="text-xl font-semibold mt-4 text-gray-400">
                No items added yet
              </Text>
            </View>
          ) : (
            (isIncludedTab ? includedItems : notIncludedItems).map((i) => (
              <View key={i?._id} style={styles.listItem}>
                <Text style={styles.itemText}>{i?.item}</Text>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleDelete(i?._id)}
                >
                  <TrashIcon height={20} width={20} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TextInput
        style={styles.input}
        placeholder="Add new item"
        value={newItem}
        onChangeText={setNewItem}
      />
      <TouchableOpacity
        onPress={handleAddItem}
        style={styles.addButton}
        disabled={newItem === "" || loading ? true : false}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
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
    backgroundColor: "#228B22",
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
    backgroundColor: "#228B22",
    alignItems: "center",
    borderRadius: 5,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TourDetails;
