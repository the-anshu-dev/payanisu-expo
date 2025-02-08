import { View, Text, StyleSheet, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import TourCard from '../../components/offline/TourCard';
import { checkNetworkStatus } from '../../utils/offlineLocationHelper';
import { router } from 'expo-router';

const { height, width } = Dimensions.get("window");

const MyTours = () => {
    const [bookedTours, setBookedTour] = useState([]);
    const [isConnected, setIsConnected] = useState(true);

    const checkConnection = async () => {
        const status = await checkNetworkStatus();
        setIsConnected(status);
    };

    const getData = async () => {
        try {
            const bookedTours = await AsyncStorage.getItem("bookedTours");
            const parsedBookedTours = bookedTours ? JSON.parse(bookedTours) : [];
            setBookedTour(parsedBookedTours);
        } catch (error) {
            console.error("Error fetching data from AsyncStorage:", error);
        }
    };

    useEffect(() => {
        getData();
        if(isConnected){
            router.push("/(tabs)");
        }
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
            <StatusBar style="dark" backgroundColor="#fff" translucent animated />
            {bookedTours.length > 0 ? (
                <View style={styles.container}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContainer}
                    >
                        <View style={styles.toursContainer}>
                            {bookedTours.map((tour, idx) => (
                                <TourCard
                                    key={idx}
                                    tourName={tour?.tourDetails?.name}
                                    startDate={tour?.tourDetails?.tour_start}
                                    endDate={tour?.tourDetails?.tour_end}
                                    status={tour?.status}
                                    distance={tour?.tourDetails?.distance}
                                />
                            ))}
                        </View>
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.noTourContainer}>
                    <Text style={styles.noTourText}>No booked tours available</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        width: width,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    scrollContainer: {
        width: width,
        paddingTop: height * 0.02,
        paddingBottom: height * 0.1,
    },
    toursContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    noTourContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noTourText: {
        fontSize: 18,
        fontWeight: "500",
        color: "#666",
    },
});

export default MyTours;
