import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const Terms = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
      style={styles.container}
    >
      <Text style={styles.header}>Terms & Conditions</Text>
      <Text style={styles.paragraph}>
        Thank you for joining Payanisu for your upcoming travel plans. This app
        is owned by Payanisu. By using this app, you indicate your unconditional
        acceptance of these terms & conditions. We reserve this right, in our
        sole discretion, to update or revise these terms & conditions. Continued
        use of the app following the posting of any changes to the "terms &
        conditions" constitutes your acceptance of those changes.
      </Text>
      <Text style={styles.paragraph}>
        At Payanisu App, we strive to create a safe and secure environment for
        you to explore and plan your favorite trips. All trips and information
        displayed on Payanisu App constitute an "invitation to offer."
      </Text>
      <Text style={styles.subHeader}>1. Eligibility to Use Our App</Text>
      <Text style={styles.paragraph}>
        Use of Payanisu App is available only to persons who can legally enter
        into contracts under applicable laws. Persons who are "incompetent to
        contract," within the meaning of the Indian Contract Act, 1872, are not
        eligible to use the App. Payanisu reserves the right to deactivate your
        account if it discovers non-compliance.
      </Text>
      <Text style={styles.subHeader}>2. Membership</Text>
      <Text style={styles.paragraph}>
        You need an account to travel with Payanisu App. Guests can only view
        details. Members agree to provide accurate and complete information
        during registration. Payanisu reserves the right to terminate accounts
        without notice.
      </Text>
      <Text style={styles.subHeader}>3. Electronic Communications</Text>
      <Text style={styles.paragraph}>
        By using the app, you consent to receive communications electronically
        from Payanisu. These communications may include updates, offers, or
        essential notifications.
      </Text>
      <Text style={styles.subHeader}>4. Reviews, Feedback, Submissions</Text>
      <Text style={styles.paragraph}>
        All feedback, suggestions, or reviews submitted to Payanisu become the
        property of Payanisu. You agree to refrain from submitting offensive or
        unlawful content and indemnify Payanisu against any resulting claims.
      </Text>
      <Text style={styles.subHeader}>
        5. Accuracy of Content/ Information of Products on the App
      </Text>
      <Text style={styles.paragraph}>
        While Payanisu strives to ensure accuracy, errors may occur. Payanisu
        reserves the right to correct pricing or product information errors and
        cancel incorrect orders unless already dispatched.
      </Text>
      <Text style={styles.subHeader}>6. Refunds and Cancellations</Text>
      <Text style={styles.paragraph}>
        Refund and cancellation policies are listed against each activity.
        Payanisu is not responsible for payments made outside the app.
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
});

export default Terms;
