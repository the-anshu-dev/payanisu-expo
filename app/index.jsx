import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setProfile, setRole, setUser } from "../redux/slices/userSlice";
import Loader from "../components/common/Loader";
import { Redirect } from "expo-router";
import { Alert } from "react-native";
import { setTour } from "../redux/slices/tourSlice";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

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
        setAuthenticated(true);
        if (userData?.email) {
          await fetchUserData(userData.email);
        }
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      Alert.alert("Oops", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      await SplashScreen.hideAsync();
      setShowLoader(true);
      setTimeout(() => setShowLoader(false), 1000);
    }
  };

  const getAllTours = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/get-alltours`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tours");
      }
      const tour = await response.json();
      dispatch(setTour(tour));
    } catch (error) {
      Alert.alert("Oops", "Something went wrong.");
      console.error("Error fetching tours:", error);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      await loadUserData();
      await getAllTours();
    };
    initApp();
  }, []);

  if (showLoader) return <Loader />;

  return <Redirect href={authenticated ? "/(tabs)" : "/login"} />;
};

export default Index;
