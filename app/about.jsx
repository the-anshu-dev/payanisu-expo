import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const About = () => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={styles.header}>Welcome to Payanisu</Text>
      <Text style={styles.paragraph}>
        **XYZ Pvt Ltd**, your trusted travel companion in India! We are a
        passionate team of travel enthusiasts dedicated to crafting
        unforgettable journeys for individuals and groups alike. Our mission is
        to deliver top-quality travel experiences at budget-friendly prices,
        ensuring that everyone can explore the world in style and comfort.
      </Text>
      <Text style={styles.subHeader}>Our Commitment</Text>
      <Text style={styles.paragraph}>
        At "Payanisu," we believe in the magic of travel, where strangers become
        friends for life. We specialize in group trips that foster bonds and
        create memories to last a lifetime. Whether you're an intrepid solo
        traveler, a couple seeking unique adventures, or a group of like-minded
        explorers, "Payanisu" is your gateway to forming connections that
        transcend borders. We curate end-to-end travel packages that promise not
        only incredible destinations but also seamless, worry-free journeys.
      </Text>
      <Text style={styles.subHeader}>Exceptional Trip Coordinators</Text>
      <Text style={styles.paragraph}>
        Our experienced and highly trained trip coordinators are the heart of
        "Payanisu." They bring a wealth of knowledge and expertise to each
        expedition, ensuring your travel experience is enriched with local
        insights and a touch of adventure. They are your trusted companions,
        creating an atmosphere where friendships flourish.
      </Text>
      <Text style={styles.subHeader}>Curated Itineraries</Text>
      <Text style={styles.paragraph}>
        Our itineraries are meticulously designed to showcase the best of each
        destination. From hidden gems to iconic landmarks, we ensure you get the
        most out of every place you visit. Whether it's a bustling city or
        nature's wonders, "Payanisu" promises an enriching and well-planned
        adventure.
      </Text>
      <Text style={styles.subHeader}>Professional Excellence</Text>
      <Text style={styles.paragraph}>
        At Payanisu: XYZ Pvt Ltd, professionalism is our hallmark. We are
        committed to transparency, reliability, and excellence in every aspect
        of our service. From booking to your safe return, you can trust us to
        deliver the highest standards of customer care.
      </Text>
      <Text style={styles.subHeader}>Join Us Today</Text>
      <Text style={styles.paragraph}>
        Embark on your next adventure with "Payanisu," where travel is more than
        a journey; it's a chance to forge lifelong friendships. Join our growing
        community of explorers and discover the world with new friends who share
        your passion for adventure.
      </Text>
      <Text style={styles.subHeader}>Contact Us</Text>
      <View style={styles.contactSection}>
        <Text style={styles.contactLabel}>Email:</Text>
        <Text style={styles.contactDetail}>mahiti@Payanisu.com</Text>

        <Text style={styles.contactLabel}>Phone:</Text>
        <Text style={styles.contactDetail}>+91 98457 41910</Text>

        <Text style={styles.contactLabel}>Office Address:</Text>
        <Text style={styles.contactDetail}>
          #6, 6th A Cross, Balaji Layout, BSK 3rd Stage, Bengaluru, Karnataka
          560085
        </Text>
      </View>

      <Text style={styles.footer}>
        Please share your feedback at mahiti@Payanisu.com and rate us on the
        Playstore!
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
    marginBottom: 10,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "green",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "justify",
  },
  footer: {
    fontSize: 14,
    color: "#888",
    marginTop: 20,
    textAlign: "center",
  },
  contactSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginTop: 10,
  },
  contactDetail: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    marginTop: 5,
  },
});

export default About;
