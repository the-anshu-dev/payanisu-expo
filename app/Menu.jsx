import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { setProfile, setUser } from "../redux/slices/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError, showSuccess } from "../utils/toastHelper";

const { width, height } = Dimensions.get("window");

const Menu = () => {
  const { profile } = useSelector((state) => state.user);

  const [loggingOut, setLoggingOut] = useState(false);

  const dispatch = useDispatch();

  const handleNavigation = (route) => {
    if (route === "/updateProfile") {
      profile ? router.push("/updateProfile") : router.push("/editProfile");
      return;
    }
    router.push(route);
  };

  const handleLogOut = async () => {
    setLoggingOut(true);
    try {
      await AsyncStorage.removeItem("user");
      dispatch(setUser(null));
      dispatch(setProfile(null));
      showSuccess("Logged Out");
      router.replace("/login");
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.9}
            onPress={() => handleNavigation(option.route)}
            style={styles.optionButtonContainer}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {option.name}
            </Text>
            <Ionicons name="chevron-forward" size={24} color={"#228B22"} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogOut}
          activeOpacity={0.9}
          style={styles.logOutButton}
        >
          {loggingOut ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color={"white"}
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
                Log Out
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.9}
          style={styles.homeButton}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color={"white"}
            style={{ marginRight: 10 }}
          />
          <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
            Go to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const options = [
  {
    id: "contact",
    name: "Contact Us",
    route: "/contact",
  },
  {
    id: "abt",
    name: "About Us",
    route: "/about",
  },
  {
    id: "pp",
    name: "Privacy Policy",
    route: "/privacyPolicy",
  },
  {
     id:"FAQ",
    name: "FAQ",
    route: "/faq",
  },
  {
    id: "tc",
    name: "Terms and Conditions",
    route: "/terms",
  },
];

const styles = StyleSheet.create({
  screenContainer: {
    width: width,
    height: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.04,
    position: "relative",
  },
  optionButtonContainer: {
    width: "100%",
    height: height * 0.07,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 10,
    width: width,
    height: height * 0.06,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.04,
  },
  logOutButton: {
    width: width * 0.42,
    elevation: 0.9,
    backgroundColor: "#e60000",
    color: "#000",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 10,
  },
  homeButton: {
    width: width * 0.42,
    elevation: 0.9,
    backgroundColor: "#228B22",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 10,
  },
});

export default Menu;
