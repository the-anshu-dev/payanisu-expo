import { Tabs } from "expo-router";
import React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Octicons from "@expo/vector-icons/Octicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Header from "@/components/common/Header";

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: "green",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
          paddingBottom: 5,
        },
        tabBarStyle: {
          height: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 10,
        },
        header: () => <Header />,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <FontAwesome6
              name={focused ? "house" : "house"}
              size={24}
              color={focused ? "green" : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mytours"
        options={{
          title: "My Tours",
          tabBarIcon: ({ focused }) => (
            <FontAwesome6
              name="person-hiking"
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
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={"chatbubbles"}
              size={24}
              color={focused ? "green" : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ focused }) => (
            <Octicons
              name={"bell-fill"}
              size={24}
              color={focused ? "green" : "black"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
