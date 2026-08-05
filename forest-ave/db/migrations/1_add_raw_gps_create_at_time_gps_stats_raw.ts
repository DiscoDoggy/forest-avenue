import * as SQLite from 'expo-sqlite';

export const MVersion = 1

export const mUpQuery = `
    ALTER TABLE trip_gps_stats_raw ADD COLUMN recorded_at NUMERIC;
`
export const mDownQuery = `
    ALTER TABLE trip_gps_stats_raw DROP COLUMN recorded_at;
`

