import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { setUser } from "../redux/slices/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const Menu = () => {
  const { user, profile } = useSelector((state) => state.user);

  const [loggingOut, setLoggingOut] = React.useState(false);

  const dispatch = useDispatch();

  const openProfile = () => {
    profile ? router.push("/profile") : router.push("/editProfile");
  };

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
      Alert.alert("Success", "You have been logged out successfully.");
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Oops", "Something went wrong.\nPlease try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.profileButtonContainer}
        onPress={openProfile}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={["rgba(240, 101, 2, 0.2)", "rgba(0, 174, 255, 0.2)"]}
          style={styles.linearGradientContainerStyle}
        >
          <Image source={user?.picture} style={styles.imageStyle} />
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            {profile?.name || user?.name}
          </Text>
          <Ionicons name="chevron-forward" size={24} color={"green"} />
        </LinearGradient>
      </TouchableOpacity>
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
            <Text style={{ color: "black", fontWeight: "600", fontSize: 16 }}>
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
    id: "edit",
    name: "Edit Profile",
    route: "/updateProfile",
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
  },
  {
    id: "ntf",
    name: "Notification",
    route: "/notification",
  },
  {
    id: "olh",
    name: "Offline Mode",
    route: "/(offlinemode)/mytours",
  },
];

const styles = StyleSheet.create({
  screenContainer: {
    width: width,
    height: "100%",
    backgroundColor: "#fff",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    position: "relative",
  },
  profileButtonContainer: {
    width: "100%",
    height: height * 0.07,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  imageStyle: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  linearGradientContainerStyle: {
    borderRadius: 10,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    alignItems: "center",
  },
  optionsContainer: {
    marginTop: 10,
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
    width: "70%",
    color: "#000",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
  },
});

export default Menu;
