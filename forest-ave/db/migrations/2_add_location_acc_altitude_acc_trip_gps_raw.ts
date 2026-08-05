export const MVersion = 2

export const mUpQuery = `
    ALTER TABLE trip_gps_stats_raw ADD COLUMN location_acc REAL;
    ALTER TABLE trip_gps_stats_raw ADD COLUMN altitude REAL;
    ALTER TABLE trip_gps_stats_raw ADD COLUMN altitude_acc REAL;
`;

export const mDownQuery = `
    ALTER TABLE trip_gps_stats_raw DROP COLUMN location_acc;
    ALTER TABLE trip_gps_stats_raw DROP COLUMN altitude;
    ALTER TABLE trip_gps_stats_raw DROP COLUMN altitude_acc;
`;

