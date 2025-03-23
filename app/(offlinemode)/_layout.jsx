import { Tabs } from "expo-router";
import React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import Header from "@/components/common/Header";

export default function OfflineLayout() {
    return <Tabs
        screenOptions={({ route }) => ({
            tabBarActiveTintColor: "#228B22",
            tabBarInactiveTintColor: "gray",
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
        })}
    >
        <Tabs.Screen
            name="mytours"
            options={{
                title: "My Tours",
                header: () => <Header />,
                tabBarIcon: ({ color, focused }) => (
                    <FontAwesome6
                        name="person-hiking"
                        size={24}
                        color={focused ? "#228B22" : "black"}
                    />
                ),
            }}
        />
        <Tabs.Screen
            name="map"
            options={{
                title: "Map",
                header: () => <Header />,
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons
                        name={focused ? "navigate-circle" : "navigate-circle-outline"}
                        size={24}
                        color={focused ? "#228B22" : "black"}
                    />
                ),
            }}
        />
    </Tabs>
}