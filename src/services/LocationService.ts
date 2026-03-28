import * as Location from 'expo-location';
import { LOCATION_TASK_NAME } from '../tasks/BackgroundLocationTask';

export const startBackgroundTracking = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
        console.log('[Location Service] Foreground permission ignored/denied');
        return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
        console.log('[Location Service] Background permission denied');
        return false;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 50, // Update every 50 meters
        deferredUpdatesInterval: 1000 * 60 * 1, // Optional: Defer updates by 1 minute (battery saver on iOS)
        deferredUpdatesDistance: 100, // Optional: Defer until 100 meters
        showsBackgroundLocationIndicator: true, // Required for iOS foreground service-like behavior if needed, or use silent
        foregroundService: {
            notificationTitle: "Location Tracking",
            notificationBody: "Tracking your location in background",
            notificationColor: "#ffffff"
        }
    });

    console.log('[Location Service] Background tracking started');
    return true;
};

export const stopBackgroundTracking = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log('[Location Service] Background tracking stopped');
    }
};
