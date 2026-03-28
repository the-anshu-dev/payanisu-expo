import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { getDistanceFromLatLonInMeters } from '../utils/location';
import { getCheckpoints, insertCheckin, initDatabase } from '../services/db';
import { submitCheckin } from '../services/api';
import { syncPendingRecords } from '../services/sync';
import * as Network from 'expo-network';

export const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task in the global scope
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('[Background Task] Error:', error);
        return;
    }

    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        console.log('[Background Task] Received locations:', locations.length);

        // Initialize DB if needed (safe to call multiple times)
        try {
            initDatabase();
        } catch (e) {
            console.log("DB might be already open");
        }

        const checkpoints = getCheckpoints();
        if (checkpoints.length === 0) {
            console.log('[Background Task] No checkpoints to monitor.');
            return;
        }

        const netInfo = await Network.getNetworkStateAsync();
        const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

        for (const location of locations) {
            const { latitude, longitude } = location.coords;
            const timestamp = location.timestamp;

            console.log(`[Background Task] Location: ${latitude}, ${longitude}`);

            for (const checkpoint of checkpoints) {
                const distance = getDistanceFromLatLonInMeters(
                    latitude,
                    longitude,
                    checkpoint.latitude,
                    checkpoint.longitude
                );

                if (distance <= checkpoint.radius) {
                    console.log(`[Background Task] Entered checkpoint: ${checkpoint.checkpoint_id} (Distance: ${distance}m)`);

                    // Logic to prevent duplicate hits could be improved with a "last_visited" table or memory cache
                    // For now, we just process. TODO: Add de-duplication logic if needed beyond basic logging.

                    if (isOnline) {
                        console.log('[Background Task] Online: Submitting checkin directly.');
                        try {
                            await submitCheckin({
                                userId: 'user_123',
                                checkpointId: checkpoint.checkpoint_id,
                                timestamp,
                                latitude,
                                longitude
                            });
                        } catch (err) {
                            console.error('[Background Task] API fail, falling back to DB.');
                            insertCheckin(checkpoint.checkpoint_id, latitude, longitude, timestamp);
                        }
                    } else {
                        console.log('[Background Task] Offline: Queuing checkin.');
                        insertCheckin(checkpoint.checkpoint_id, latitude, longitude, timestamp);
                    }
                }
            }
        }

        // Opportunistic Sync
        if (isOnline) {
            await syncPendingRecords();
        }
    }
});
