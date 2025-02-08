import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setProfile, setRole, setUser } from "../redux/slices/userSlice";
import Loader from "../components/common/Loader";
import { Redirect } from "expo-router";
import { Alert } from "react-native";
import { setBookedTour, setTour } from "../redux/slices/tourSlice";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const Index = () => {
  const [showLoader, setShowLoader] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const dispatch = useDispatch();

  const fetchUserData = async (email) => {
    try {
      const [roleResponse, profileResponse] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }),
        fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/getProfile`, {
          method: "GET",
          headers: { "Content-Type": "application/json", email },
        }),
      ]);

      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        dispatch(setRole(roleData));
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData && !profileData.error) {
          dispatch(setProfile(profileData));
        }
      }
      getAllBookedTours(email);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        dispatch(setUser(userData));
        if (userData?.email) {
          await fetchUserData(userData.email);
        }
        setAuthenticated(true);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong. Please try again.");
      console.error("Error loading user data:", error);
    } finally {
      await SplashScreen.hideAsync();
      setShowLoader(false);
    }
  };

  const getAllBookedTours = async (email) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/get-my-tour?email=${email}`
      );
      if (!response.ok) {
        console.error("Failed to fetch booked tours", response);
        throw new Error("Failed to fetch booked tours.");
      }
      const data = await response.json();
      await AsyncStorage.setItem("bookedTours", JSON.stringify(data.data));
      dispatch(setBookedTour(data.data));
    } catch (error) {
      console.error("Error fetching booked tours:", error);
      Alert.alert("Error", error.message || "Failed to fetch booked tours. Please check your network connection.");
    }
  };

  const getAllTours = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/get-alltours`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tours due to server error.");
      }
      const tour = await response.json();
      await AsyncStorage.setItem("tours", JSON.stringify(tour));
      dispatch(setTour(tour));
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong.");
      console.log("Error fetching tours:", error);
    }
  };

  useEffect(() => {
    loadUserData();
    getAllTours();
  }, []);

  useEffect(() => {
    if (authenticated) {
      setRedirect(true);
    }
  }, [authenticated]);

  if (showLoader) return <Loader />;
  if (redirect) return <Redirect href="/(tabs)" />;
  return <Redirect href="/login" />;
};

export default Index;