import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons, FontAwesome, Feather } from "@expo/vector-icons";

const Contact = () => {
  return (
    <View style={styles.container}>
      <View style={styles.contactItem}>
        <MaterialIcons name="email" size={24} color="green" />
        <Text
          style={styles.contactText}
          onPress={() => Linking.openURL("mailto:mahiti@payanisu.com")}
        >
          mahiti@payanisu.com
        </Text>
      </View>
      <View style={styles.contactItem}>
        <MaterialIcons name="phone" size={24} color="green" />
        <Text
          style={styles.contactText}
          onPress={() => Linking.openURL("tel:+919845741910")}
        >
          +91 9845 741910
        </Text>
      </View>
      <View style={styles.contactItem}>
        <FontAwesome name="whatsapp" size={24} color="green" />
        <Text
          style={styles.contactText}
          onPress={() => Linking.openURL("https://wa.me/919845741910")}
        >
          +91 9845 741910
        </Text>
      </View>
      <View style={styles.contactItem}>
        <Feather name="map-pin" size={24} color="green" />
        <Text style={styles.contactText}>
          #6, 6th A Cross, Balaji Layout, BSK 3rd Stage, Bengaluru, Karnataka
          560085
        </Text>
      </View>
      <View style={styles.contactItem}>
        <FontAwesome name="map" size={20} color="green" />
        <TouchableOpacity
          onPress={() => Linking.openURL("https://bit.ly/4dKmoGF")}
        >
          <Text style={[styles.contactText, styles.link]}>
            View on Google Maps
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 3,
    margin: 15,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    flexWrap: "wrap",
  },
  link: {
    color: "green",
  },
});

export default Contact;
