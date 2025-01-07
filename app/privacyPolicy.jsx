import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const PrivacyPolicy = () => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Text style={styles.heading}>Privacy Policy</Text>

      <Text style={styles.paragraph}>
        We respect and are committed to protecting your privacy. Publishing,
        selling, or renting any personal data or information to any third party,
        without your consent, is against our ethics.
      </Text>

      <Text style={styles.subHeading}>Scope of Policy</Text>
      <Text style={styles.paragraph}>
        The privacy practices of this statement apply to our services/products
        available under the domain and subdomains of the App. By using this App,
        you agree to be bound by the terms and conditions of this privacy
        policy. If you do not agree, please do not use or access our app.
      </Text>

      <Text style={styles.subHeading}>Third-Party Links</Text>
      <Text style={styles.paragraph}>
        This privacy policy does not apply to sites maintained by other
        companies or organizations to which we link, and we are not responsible
        for any personal information you submit to third parties via our app.
        Please ensure that you read the privacy policy of such companies or
        organizations before submitting your details.
      </Text>

      <Text style={styles.subHeading}>Privacy Guarantee</Text>
      <Text style={styles.paragraph}>
        We agree that we will not sell or rent your personal information to
        third parties for their marketing purposes without your explicit
        consent. From time to time, we may reveal general statistical
        information about our app and users, such as the number of users or
        types of trips and meetups hosted. Employees who need access to your
        information for performing their duties are allowed such access, and
        violators of our privacy and/or security policies are subject to strict
        disciplinary actions.
      </Text>

      <Text style={styles.subHeading}>Information We Collect</Text>
      <Text style={styles.paragraph}>
        Personal Information is used to manage your trips and provide the best
        possible services. We have implemented appropriate physical, electronic,
        and managerial procedures to safeguard and secure the information we
        collect online.
      </Text>

      <Text style={styles.subHeading}>Use of Cookies</Text>
      <Text style={styles.paragraph}>
        We use data collection devices such as "cookies" to analyze page flow,
        measure promotional effectiveness, and promote trust and safety. Cookies
        help us provide information targeted to your interests. Most cookies are
        "session cookies," which are automatically deleted at the end of a
        session. You can decline our cookies if your browser permits.
      </Text>

      <Text style={styles.subHeading}>IP Address Usage</Text>
      <Text style={styles.paragraph}>
        We identify and use your IP address to diagnose server issues and
        administer our app. Your IP address also helps us identify you and
        gather demographic information.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
    marginBottom: 15,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    color: "green",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
    textAlign: "justify",
  },
});

export default PrivacyPolicy;
