import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import React, { useEffect, useState, useCallback } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setProfile, setRole, setUser } from "../redux/slices/userSlice";
import payanisuPoster from "../assets/payanisu.jpeg";
import { SafeAreaView } from "react-native-safe-area-context";
import { showError } from "../utils/toastHelper";
import { loginScreenStyles } from "../constants/Styles";

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [_, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  });
  
  const storeUserData = async (user) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  const getUserProfile = async (token) => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Google user data.");
      }

      const user = await response.json();
      if (!user?.email) throw new Error("User email not found.");

      dispatch(setUser(user));
      await storeUserData(user);
      const userEmail = user.email;

      try {
        const roleResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/users/signin`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
          }
        );

        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          dispatch(setRole(roleData || null));
        } else {
          console.warn("Role fetch failed:", await roleResponse.text());
        }
      } catch (error) {
        console.warn("Error fetching role:", error);
      }

      try {
        const profileResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/users/getProfile`,
          {
            method: "GET",
            headers: { email: userEmail },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          dispatch(setProfile(profileData || null));
        } else {
          console.warn("Profile fetch failed:", await profileResponse.text());
        }
      } catch (error) {
        console.warn("Error fetching profile:", error);
      }

      setSessionActive(true);
      router.replace("/(tabs)");
    } catch (error) {
      showError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (
          response?.type === "success" &&
          response.authentication?.accessToken
        ) {
          await getUserProfile(response.authentication.accessToken);
        }
      } catch (error) {
        showError("Login failed. Please try again.");
      }
    };

    fetchProfile();
  }, [response]);

  const handleLogin = useCallback(() => {
    if (!sessionActive) {
      try {
        promptAsync();
      } catch (err) {
        showError("Could not start Google login.");
      }
    }
  }, [sessionActive, promptAsync]);

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={loginScreenStyles.container}>
        <View style={loginScreenStyles.backgroundImageContainer}>
          <Image
            style={loginScreenStyles.backgroundImage}
            source={payanisuPoster}
          />
        </View>
        <View style={loginScreenStyles.contentContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleLogin}
            style={loginScreenStyles.loginButton}
            disabled={loading}
          >
            <View style={loginScreenStyles.loginButtonContent}>
              {loading ? (
                <ActivityIndicator size={24} color="#228B22" />
              ) : (
                <View style={loginScreenStyles.loginButtonTextContainer}>
                  <Ionicons name="logo-google" size={20} color="white" />
                  <Text style={loginScreenStyles.loginButtonText}>
                    Login with Google
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
