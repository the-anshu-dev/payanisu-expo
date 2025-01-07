import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setProfile, setRole, setUser } from "../redux/slices/userSlice";
import Loader from "../components/common/Loader";
import { Redirect } from "expo-router";
import { Alert } from "react-native";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const dispatch = useDispatch();

  const fetchUserData = async (userData) => {
    const { email } = userData;

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
      } else {
        console.warn("Failed to fetch role data.");
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData && !profileData.error) {
          dispatch(setProfile(profileData));
        }
      } else {
        console.warn("Failed to fetch profile data.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        dispatch(setUser(userData));
        setAuthenticated(true);

        if (userData?.email) {
          await fetchUserData(userData);
        }
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      Alert.alert(
        "Oops",
        "Something went wrong. Please try again.\n\n User Role could not be loaded."
      );
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) return <Loader />;

  return <Redirect href={authenticated ? "/(tabs)" : "/login"} />;

};

export default Index;
