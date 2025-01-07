import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Notifications from "../../components/UI/Notifications";
import { StatusBar } from "expo-status-bar";
import { apiRequest } from "../../utils/helpers";
import { useSelector } from "react-redux";
import LoginReqCard from "../../components/UI/LoginReqCard";
import { Link } from "expo-router";

const { width, height } = Dimensions.get("window");

const NotificationsScreen = () => {
  const { user } = useSelector((state) => state.user);

  const [error, setError] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const newData = await apiRequest(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/get?email=${user.email}`
      );
      setData(() => {
        const updatedData = [...newData];
        return updatedData;
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Oops", "Something went wrong. Please try again later.");
      setError(error?.message);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <>
      {user ? (
        <View style={styles.container}>
          
          <StatusBar
            style="dark"
            backgroundColor="#fff"
            translucent={true}
            animated
          />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["green", "red", "blue"]}
              />
            }
          >
            <View style={styles.notificationsContainer}>
              {data.map((i, idx) => (
                <Notifications
                  key={idx}
                  id={i._id}
                  title={i.title}
                  content={i?.content}
                  seen={i.seen}
                />
              ))}
            </View>
          </ScrollView>
          
        </View>
      ) : (
        <LoginReqCard />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: height * 0.1,
    flex: 1,
    width: "100%",
    paddingHorizontal: width * 0.03,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: width * 0.05,
    marginTop: height * 0.01,
    color: "#000",
  },
  scrollContainer: {
    paddingBottom: height * 0.06,
  },
  notificationsContainer: {
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.04,
  },
});

export default NotificationsScreen;
