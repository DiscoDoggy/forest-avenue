import { MpgRecord } from '@/app/services/mpgPollingService';
import { convertUnixTimeToLocalDateTime } from '@/app/utils/dateTimeConversion';
import { LocationObject } from 'expo-location';
import * as SQLite from 'expo-sqlite'

export type TripAggregatedResults = {
    geoJson: string,
    distanceTraveled: number,
    avgMpg: number,
    avgSpeed: number
}

export type TripRawMpgResults = {
    instMpg: number[],
    MAF: number[],
    VSS: number[],
    LTFT?: number[],
    STFT?: number[],
    recorded_at: number[]
}

export type TripRawGPSResults = {
    latitude: number,
    longitude: number,
    location_accuracy?: number,
    altitude?: number,
    altitude_accuracy?: number
}

export type Trip = {
    id: string,
    vehicleId: string,
    userId?: string,
    tripName?: string,
    startTime: number | string,
    endTime: number | string,

    tripAggResults: TripAggregatedResults,
    // tripRawMpgStats: TripRawMpgResults,
    tripRawMpgStats?: MpgRecord[],
    tripGPSRaws?: LocationObject[] 
}

interface TripsDAOInterface {
    getAllTrips(): Promise<Trip[]>,
    getTripById(id: string): Promise<Trip | null> ,

    createTrip(trip: Trip): Promise<void>,
    deleteTrip(id: string): Promise<void>,
}

export class TripsDAO implements TripsDAOInterface {
    private dbConn: SQLite.SQLiteDatabase;

    constructor(dbConn: SQLite.SQLiteDatabase) {
        this.dbConn = dbConn;
    }

    async getAllTrips() {
        const statement = await this.dbConn.prepareAsync(`
            SELECT * 
            FROM trips t
            JOIN trip_results_aggregated tra ON t.id = tra.trip_id
        `);
        
        let resultingTrips;
        try {
            resultingTrips = await statement.executeAsync();
            resultingTrips = await resultingTrips.getAllAsync();
        } finally {
            await statement.finalizeAsync();
        }

        if(!resultingTrips) {
            return [];
        }

        let resultingTripObjects = [];
        for (const trip of resultingTrips) {
            const processedTrip = this.convertSQLTripToObject(trip);
            resultingTripObjects.push(processedTrip);
        }

        return resultingTripObjects;
    }

    async getTripById(id: string) {
        const statement = await this.dbConn.prepareAsync(`
            SELECT * 
            FROM trips t
            JOIN trip_results_aggregated tra ON t.id = tra.trip_id
            WHERE t.id = ?
        `);

        let resultingTrip;
        try {
            resultingTrip = await statement.executeAsync([id]);
            resultingTrip = await resultingTrip.getFirstAsync();
        } finally {
            await statement.finalizeAsync();
        }

        if(!resultingTrip) {
            return null;
        }

        const processedTrip: Trip = this.convertSQLTripToObject(resultingTrip);
        return processedTrip;
    }

    async createTrip(trip: Trip) {
        const tripInsertStmt = await this.dbConn.prepareAsync(`
            INSERT INTO trips(id, vin, trip_name, start_time, end_time) VALUES($id, $vin, $trip_name, $start_time, $end_time)
        `);

        const tripAggStatsStmt = await this.dbConn.prepareAsync(`
            INSERT INTO trip_results_aggregated(
                trip_id, 
                geo_json_line_segments, 
                avg_mpg, 
                avg_speed, 
                distance_traveled
            ) VALUES(
                $trip_id,
                $geo_json_line_segments,
                $avg_mpg,
                $avg_speed,
                $distance_traveled 
            )  
        `);
        
        const tripMPGStatsRawInsertStmt = await this.dbConn.prepareAsync(`
            INSERT INTO trip_mpg_stats_raw (trip_id, inst_mpg, recorded_at, MAF, VSS, LTFT, STFT)
            VALUES ($trip_id, $inst_mpg, $recorded_at, $MAF, $VSS, $LTFT, $STFT)
        `);

        const tripGPSStatsRawInsertStmt = await this.dbConn.prepareAsync(`
            INSERT INTO trip_gps_stats_raw (trip_id, latitude, longitude, location_acc, altitude, altitude_acc, recorded_at) 
            VALUES ($trip_id, $latitude, $longitude, $location_acc, $altitude, $altitude_acc, $recorded_at)
        `)

        let tripNameToStore = '';
        if(!trip.tripName) {
            tripNameToStore = 'New Trip Name';
        } else {
            tripNameToStore = trip.tripName;
        }

        try {
            await this.dbConn.withExclusiveTransactionAsync(async () => {
                let result = await tripInsertStmt.executeAsync({
                    $id: trip.id,
                    $trip_name: tripNameToStore,
                    $vin: trip.vehicleId,
                    $start_time: trip.startTime,
                    $end_time: trip.endTime
                });

                result = await tripAggStatsStmt.executeAsync({
                    $trip_id: trip.id,
                    $geo_json_line_segments: trip.tripAggResults.geoJson,
                    $avg_mpg: trip.tripAggResults.avgMpg,
                    $avg_speed: trip.tripAggResults.avgSpeed,
                    $distance_traveled: trip.tripAggResults.distanceTraveled
                });

                //raw mpg insert
                if(trip.tripRawMpgStats) {
                    for(const record of trip.tripRawMpgStats) {
                        await tripMPGStatsRawInsertStmt.executeAsync({
                            $trip_id: trip.id,
                            $inst_mpg: record.mpg,
                            $MAF: record.maf,
                            $VSS: record.vehicleSpeed,
                            $ltft: record.ltft,
                            $stft: record.stft,
                            $recorded_at: record.mpgQueryStartTime
                        });
                    }
                }

                //gps raws
                if(trip.tripGPSRaws){
                    for (const record of trip.tripGPSRaws) {
                        await tripGPSStatsRawInsertStmt.executeAsync({
                            $trip_id: trip.id,
                            $latitude: record.coords.latitude,
                            $longitude: record.coords.longitude,
                            $location_acc: record.coords.accuracy,
                            $altitude: record.coords.altitude,
                            $altitude_acc: record.coords.altitudeAccuracy,
                            $recorded_at: record.timestamp / 1000  // unix time is in seconds
                        });
                    }
                }
            });
        } finally {
            await tripInsertStmt.finalizeAsync();
            await tripAggStatsStmt.finalizeAsync();
        }
    }

    async deleteTrip(id: string) {
        const deleteTripStmt = await this.dbConn.prepareAsync(`
            DELETE FROM trips WHERE id = $id
        `);
        
        try {
            const result = await deleteTripStmt.executeAsync({
                $id: id
            });
        } finally {
            await deleteTripStmt.finalizeAsync();
        }
    }

    private convertSQLTripToObject(trip: any) : Trip {
        const aggTripStats: TripAggregatedResults = {
            geoJson: trip.geo_json_line_segments,
            avgMpg: trip.avg_mpg,
            avgSpeed: trip.avg_speed,
            distanceTraveled: trip.distance_traveled
        };

        const processedTrip: Trip = {
            id: trip.id,
            tripName: trip.trip_name,
            vehicleId: trip.vin,
            startTime: convertUnixTimeToLocalDateTime(trip.start_time),
            endTime: convertUnixTimeToLocalDateTime(trip.end_time),
            tripAggResults: aggTripStats 
        };

        return processedTrip;
    }
}