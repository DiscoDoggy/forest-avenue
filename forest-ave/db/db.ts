import * as SQLite from 'expo-sqlite';

//migrations
import * as MV1 from './migrations/1_add_raw_gps_create_at_time_gps_stats_raw';
import * as MV2 from './migrations/2_add_location_acc_altitude_acc_trip_gps_raw'
import * as MV3 from './migrations/3_add_fuel_consumption_trip_costs_trip_results_aggregated'

const migrations = [MV1, MV2, MV3];

type UserVersion = {
    user_version: number;
}

export async function createDBConnection() {
    try {
        const db = SQLite.openDatabaseAsync('forestAve.db');
        return db;
    } catch (e) {
        throw Error(`could not establish connection to local database: ${e}`);
    }
}

export async function initializeDB(db: SQLite.SQLiteDatabase) {
    await db.withExclusiveTransactionAsync(async () => {
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
                vin TEXT PRIMARY KEY 
            );

            CREATE TABLE IF NOT EXISTS trips (
                id TEXT NOT NULL UNIQUE,
                trip_name TEXT,
                vin TEXT NOT NULL,
                user_id TEXT,
                start_time DATETIME,
                end_time DATETIME,

                FOREIGN KEY (vin) REFERENCES vehicles(vin)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
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
                altitude_acc REAL,

                FOREIGN KEY (trip_id) REFERENCES trips(id)
            );
        `); 
    });

    await db.withExclusiveTransactionAsync(async () => {
        const dbVersion: UserVersion | null = await db.getFirstAsync(`
            PRAGMA user_version;
        `);

        if(!dbVersion) {
            throw new Error('PRAGMA user_version cannot be null');
        }
        
        console.log(`DATA BASE VERSION ${dbVersion.user_version}`);

        for(const migration of migrations) {

            if(migration.MVersion > dbVersion.user_version) {
                console.log(`\t Executing migration version ${migration.MVersion}`);
                await db.execAsync(migration.mUpQuery);

                await db.runAsync(`PRAGMA user_version = ${migration.MVersion}`)
            }
        }
    });
}