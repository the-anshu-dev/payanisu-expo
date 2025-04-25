import { View, ScrollView, RefreshControl, Text } from "react-native";
import React, { useEffect, useState } from "react";
import Notifications from "../../components/UI/Notifications";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { showError } from "../../utils/toastHelper";
import { notificationTypes } from "../../constants/constant";
import NotificationChips from "../../components/UI/NotificationChips";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../../components/common/Loader";
import NotAvailableComponent from "../../components/UI/NotAvailableComponent";
import { notificationScreenStyles } from "../../constants/Styles";
import { useNotifications } from "../../hooks/useNotifications";
import { fetchNotifications } from "../../redux/slices/notificationsSlice";

const NotificationsScreen = () => {
  const { user } = useSelector((state) => state.user);
  const [selectedValue, setSelectedValue] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const dispatch = useDispatch();

  const { notifications, loading, error } = useNotifications(user?.email);

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

  useEffect(() => {
    if (!notifications) return;
    const filtered = notifications.filter((item) => {
      if (selectedValue === "all") return true;
      if (selectedValue === "read") return item.seen;
      if (selectedValue === "unread") return !item.seen;
    });
    setFilteredData(filtered);
  }, [selectedValue, notifications]);

  const handleSelect = async (value) => {
    setSelectedValue(value);
    await AsyncStorage.setItem("notificationType", value);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      dispatch(fetchNotifications(user?.email));
    } catch (error) {
      showError(error.message || "Failed to refresh notifications.");
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) return <Redirect href="/login" />;
  if (loading && !refreshing) return <Loader />;
  if (!notifications || notifications.length === 0)
    return (
      <NotAvailableComponent
        text={"No Notifications Available"}
        iconName={"notifications-off"}
      />
    );

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

          {filteredData.length === 0 ? (
            <NotAvailableComponent
              text={"No Notifications Available"}
              iconName={"notifications-off"}
            />
          ) : (
            filteredData.map((notification) => (
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
