import * as Network from 'expo-network';
import { getPendingCheckins, markCheckinsAsSynced, cleanupSyncedRecords } from './db';
import { submitCheckin } from './api';

export const syncPendingRecords = async () => {
    try {
        const netInfo = await Network.getNetworkStateAsync();
        if (!netInfo.isConnected || !netInfo.isInternetReachable) {
            console.log('[Sync] Offline, skipping sync');
            return;
        }

        const pendingRecords = getPendingCheckins();
        if (pendingRecords.length === 0) {
            console.log('[Sync] No pending records');
            return;
        }

        console.log(`[Sync] Found ${pendingRecords.length} pending records`);

        // Batch upload or sequential
        // For simplicity, we'll do sequential here, but in production, simulating batch is better
        const syncedIds: number[] = [];

        for (const record of pendingRecords) {
            try {
                await submitCheckin({
                    userId: 'user_123', // TODO: Get actual user ID
                    checkpointId: record.checkpoint_id,
                    timestamp: record.timestamp,
                    latitude: record.latitude,
                    longitude: record.longitude,
                });
                syncedIds.push(record.id);
            } catch (error) {
                console.error('[Sync] Failed to sync record:', record.id, error);
            }
        }

        if (syncedIds.length > 0) {
            markCheckinsAsSynced(syncedIds);
            cleanupSyncedRecords();
            console.log('[Sync] Sync complete, cleared', syncedIds.length, 'records');
        }

    } catch (error) {
        console.error('[Sync] Error during sync:', error);
    }
};
