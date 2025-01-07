import { Tabs } from "expo-router";
import React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Octicons from "@expo/vector-icons/Octicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Header from "@/components/common/Header";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "green",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
      })}
    >
      <Tabs.Screen
        name="tours"
        options={{
          title: "Tours",
          header: () => <Header />,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="person-hiking"
              size={24}
              color={focused ? "green" : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: "Expense",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={24}
              color={focused ? "green" : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          header: () => <Header />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={focused ? "green" : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="announcement"
        options={{
          title: "Announcement",
          header: () => <Header />,
          tabBarIcon: ({ color, focused }) => (
            <Octicons
              name={focused ? "bell-fill" : "bell"}
              size={24}
              color={focused ? "green" : "black"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
