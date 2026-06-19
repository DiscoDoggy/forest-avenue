import * as SQLite from 'expo-sqlite'

export async function createDBConnection() {
    try {
        const db = SQLite.openDatabaseAsync('forestAve.db')
    } catch (e) {
        throw Error(`could not establish connection to local database: ${e}`);
    }
}

export async function initializeDB(db: SQLite.SQLiteDatabase) {
    db.withExclusiveTransactionAsync(async () => {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;     
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS users (
                id  TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                pwd_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS vehicles (
                vin TEXT NOT NULL UNIQUE 
            );

            CREATE TABLE IF NOT EXISTS trips (
                id TEXT NOT NULL UNIQUE,
                vin TEXT NOT NULL UNIQUE,
                user_id TEXT,
                start_time DATETIME,
                end_time DATETIME,

                FOREIGN KEY (vin) REFERENCES vehicles(vin)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,
            );

            CREATE TABLE IF NOT EXISTS trip_results_aggregated(
                trip_id TEXT NOT NULL,
                geo_json_line_segments TEXT,
                avg_mpg REAL,
                avg_speed REAL,
                distance_traveled REAL,

                FOREIGN KEY (trip_id) REFERENCES trips(id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE

            );

            CREATE TABLE IF NOT EXISTS trip_mpg_stats_raw(
                trip_id TEXT NOT NULL,
                inst_mpg REAL NOT NULL,
                recorded_at DATETIME,
                MAF REAL NOT NULL,
                VSS REAL NOT NULL,
                LTFT REAL,
                STFT REAL,

                FOREIGN KEY (trip_id) REFERENCES trips(id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
                
            );

            CREATE TABLE IF NOT EXISTS trip_gps_stats_raw(
                trip_id TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                location_accuracy REAL,
                altitude REAL,
                altitude_accuracy REAL,

                FOREIGN KEY (trip_id) REFERENCES trips(id)
            );
        `);

    });
}