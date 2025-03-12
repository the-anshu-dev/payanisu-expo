import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
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

  const [loggingOut, setLoggingOut] = React.useState(false);

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
            <Ionicons name="chevron-forward" size={24} color={"green"} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.logOutButtonContainer}>
        <TouchableOpacity
          onPress={handleLogOut}
          activeOpacity={0.9}
          style={styles.logOutButton}
        >
          {loggingOut ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            <Text style={{ color: "black", fontWeight: "600", fontSize: 18 }}>
              Log Out
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const options = [
  {
    id: "home",
    name: "Home",
    route: "/(tabs)",
  },
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
    id: "tc",
    name: "Terms and Conditions",
    route: "/terms",
  }
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
  logOutButtonContainer: {
    position: "absolute",
    bottom: 20,
    width: width,
    height: height * 0.06,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logOutButton: {
    width: "90%",
    elevation: 0.9,
    backgroundColor: "#fff",
    color: "#000",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 10,
  },
});

export default Menu;
