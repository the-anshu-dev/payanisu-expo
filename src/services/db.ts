import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('location_tracking.db');

export interface Checkpoint {
    checkpoint_id: string;
    latitude: number;
    longitude: number;
    radius: number;
}

export interface CheckinRecord {
    id: number;
    checkpoint_id: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    status: string;
    sync_status: 'pending' | 'synced';
}

export const initDatabase = () => {
    db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS checkpoints (
      checkpoint_id TEXT PRIMARY KEY NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS checkin_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checkpoint_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      status TEXT NOT NULL,
      sync_status TEXT NOT NULL
    );
  `);
    console.log('Database initialized');
};

export const clearDatabase = () => {
    db.execSync(`
        DELETE FROM checkpoints;
        DELETE FROM checkin_queue;
    `);
}

// --- Checkpoints ---

export const insertCheckpoint = (checkpoint: Checkpoint) => {
    const { checkpoint_id, latitude, longitude, radius } = checkpoint;
    db.runSync(
        'INSERT OR REPLACE INTO checkpoints (checkpoint_id, latitude, longitude, radius) VALUES (?, ?, ?, ?)',
        [checkpoint_id, latitude, longitude, radius]
    );
};

export const getCheckpoints = (): Checkpoint[] => {
    const result = db.getAllSync('SELECT * FROM checkpoints');
    return result as Checkpoint[];
};

// --- Checkin Queue ---

export const insertCheckin = (
    checkpointId: string,
    lat: number,
    lng: number,
    timestamp: number
) => {
    db.runSync(
        'INSERT INTO checkin_queue (checkpoint_id, latitude, longitude, timestamp, status, sync_status) VALUES (?, ?, ?, ?, ?, ?)',
        [checkpointId, lat, lng, timestamp, 'Checked', 'pending']
    );
};

export const getPendingCheckins = (): CheckinRecord[] => {
    return db.getAllSync<CheckinRecord>('SELECT * FROM checkin_queue WHERE sync_status = ?', ['pending']);
};

export const markCheckinsAsSynced = (ids: number[]) => {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    db.runSync(
        `UPDATE checkin_queue SET sync_status = 'synced' WHERE id IN (${placeholders})`,
        ids
    );
};

// Optional: Delete synced records to keep DB small
export const cleanupSyncedRecords = () => {
    db.runSync(`DELETE FROM checkin_queue WHERE sync_status = 'synced'`);
}
