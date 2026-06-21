import * as SQLite from 'expo-sqlite';
import { createDBConnection } from './db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDB() {
    if(!dbInstance) {
        dbInstance = await createDBConnection();
    }

    console.log(`Local SQLite DB connection successful`);
    return dbInstance;
}
