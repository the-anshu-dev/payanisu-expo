import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import Notifications from "../../components/UI/Notifications";
import { StatusBar } from "expo-status-bar";
import { apiRequest } from "../../utils/helpers";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { showError } from "../../utils/toastHelper";
import { notificationTypes } from "../../constants/constant";
import NotificationChips from "../../components/UI/NotificationChips";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import Loader from "../../components/common/Loader";
import NotAvailableComponent from "../../components/UI/NotAvailableComponent";
import { notificationScreenStyles } from "../../constants/Styles";

const NotificationsScreen = () => {
  const { user } = useSelector((state) => state.user);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedValue, setSelectedValue] = useState("all");

  useEffect(() => {
    const loadStoredFilter = async () => {
      try {
        const savedValue = await AsyncStorage.getItem("notificationType");
        if (savedValue) setSelectedValue(savedValue);
      } catch (error) {
        showError("Failed to load filter preference.");
      }
    };
    loadStoredFilter();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const newData = await apiRequest(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/get?email=${user.email}`
      );
      setAllData(newData);
      applyFilter(selectedValue, newData);
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilter = (value, sourceData = allData) => {
    const filteredData = sourceData.filter((item) => {
      if (value === "all") return true;
      if (value === "read") return item.seen;
      if (value === "unread") return !item.seen;
    });
    setData(filteredData);
  };

  const handleSelect = async (value) => {
    setSelectedValue(value);
    await AsyncStorage.setItem("notificationType", value);
    applyFilter(value);
  };

  const onRefresh = async () => {
    try {
      await fetchData();
    } catch (error) {
      showError(error.message || "Failed to refresh notifications.");
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  if (!user) return <Redirect href="/login" />;

  if (refreshing) {
    return <Loader />;
  }

  if (allData.length === 0) {
    return (
      <NotAvailableComponent
        text={"No Posts Available"}
        iconName={"alert-circle-outline"}
      />
    );
  }

  return (
    <SafeAreaView
      style={notificationScreenStyles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#fff" translucent animated />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notificationScreenStyles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#228B22", "red", "blue"]}
          />
        }
      >
        <View style={notificationScreenStyles.notificationsContainer}>
          <View style={notificationScreenStyles.chipContainer}>
            {notificationTypes.map((item) => (
              <NotificationChips
                key={item.id}
                title={item.title}
                value={item.value}
                selectedValue={selectedValue}
                onPress={() => handleSelect(item.value)}
              />
            ))}
          </View>
          {data.length === 0 ? (
            <NotAvailableComponent
              text={"No Notifications Available"}
              iconName={"notifications-off"}
            />
          ) : (
            data?.map((notification) => (
              <Notifications
                key={notification._id}
                id={notification._id}
                title={notification.title}
                content={notification?.content}
                seen={notification.seen}
                createdAt={notification.createdAt}
                onRefresh={onRefresh}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
