import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import Notifications from "../../components/UI/Notifications";
import { StatusBar } from "expo-status-bar";
import { apiRequest } from "../../utils/helpers";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { showError } from "../../utils/toastHelper";

const NotificationsScreen = () => {
  const { user } = useSelector((state) => state.user);
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const newData = await apiRequest(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/get?email=${user.email}`
      );
      setData(newData);
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  if (!user) return <Redirect href="/login" />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#fff" translucent={true} animated />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} colors={["#228B22", "red", "blue"]} />
        }
      >
        <View style={styles.notificationsContainer}>
          {data.map((notification) => (
            <Notifications
              key={notification._id}
              id={notification._id}
              title={notification.title}
              content={notification?.content}
              seen={notification.seen}
              createdAt={notification.createdAt}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { paddingBottom: 20 },
  notificationsContainer: { marginTop: 10, paddingHorizontal: 16 },
});

export default NotificationsScreen;
