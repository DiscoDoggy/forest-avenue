import { MpgRecord } from '@/app/services/mpgPollingService';
import { convertUnixTimeToLocalDateTimeStr, timeFrameToSQLStr } from '@/app/utils/dateTimeConversion';
import { FuelStatsOverviewTimeFrame } from '@/constants/mpgConstants';
import { LocationObject } from 'expo-location';
import * as SQLite from 'expo-sqlite'

export type TripAggregatedResults = {
    geoJson: string,
    distanceTraveled: number,
    avgMpg: number,
    avgSpeed: number,
    fuelConsumption: number | null,
    tripCost: number | null,
    currFuelPrice: number | null
}

export type TripRawMpgResult = {
    tripId: string,
    instMpg: number,
    MAF: number,
    VSS: number,
    LTFT?: number,
    STFT?: number,
    recorded_at: number
}

export type TripRawGPSResult = {
    latitude: number,
    longitude: number,
    location_accuracy?: number,
    altitude?: number,
    altitude_accuracy?: number,
    recorded_at: number
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

export type RawTripStats = {
    rawMpgStats: TripRawMpgResult[],
    rawGpsStats: TripRawGPSResult[]
}

export type AggregatedFuelStat = {
    date: string,
    totalFuelConsumption: number,
    totalCosts: number,
    avgCostsPerMile: number,
    fuelPrice: number
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
                distance_traveled,
                fuel_consumption,
                trip_cost,
                fuel_price
            ) VALUES(
                $trip_id,
                $geo_json_line_segments,
                $avg_mpg,
                $avg_speed,
                $distance_traveled,
                $fuel_consumption,
                $trip_cost,
                $regional_fuel_price
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
                    $distance_traveled: trip.tripAggResults.distanceTraveled,
                    $fuel_consumption: trip.tripAggResults.fuelConsumption,
                    $trip_cost: trip.tripAggResults.tripCost,
                    $regional_fuel_price: trip.tripAggResults.currFuelPrice
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
            await tripGPSStatsRawInsertStmt.finalizeAsync();
            await tripMPGStatsRawInsertStmt.finalizeAsync();
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

    async getRawMpgGpsStatsByTimeFrame(timeframe: FuelStatsOverviewTimeFrame) { 
        
        const sortedRawMpgStats: TripRawMpgResult[] = await this.dbConn.getAllAsync(`
            SELECT *
            FROM trip_mpg_stats_raw
            WHERE recorded_at >= unixepoch('now', ${timeFrameToSQLStr.get(timeframe)})
            ORDER BY recorded_at ASC
        `);

        const sortedGpsStats: TripRawGPSResult[] = await this.dbConn.getAllAsync(`
            SELECT * 
            FROM trip_gps_stats_raw
            WHERE recorded_at >= unixepoch('now', ${timeFrameToSQLStr.get(timeframe)})
            ORDER BY recorded_at ASC
        `);
        
        const tripRaws: RawTripStats = {
            rawMpgStats: sortedRawMpgStats,
            rawGpsStats: sortedGpsStats
        }

        return tripRaws;
    }

    async getTripAggregatedStatsByTimeFrame(timeframe: FuelStatsOverviewTimeFrame) {
        const timeFrameToSQLTimeFormat = new Map<FuelStatsOverviewTimeFrame, string>([
            // [FuelStatsOverviewTimeFrame.ONE_DAY, ``]
            [FuelStatsOverviewTimeFrame.ONE_WEEK, `strftime('%m-%d', date(t.start_time, 'unixepoch'))`],
            [FuelStatsOverviewTimeFrame.ONE_MONTH, `strftime('%m-%d', date(t.start_time, 'unixepoch'))`],
            [FuelStatsOverviewTimeFrame.THREE_MONTHS, `
                strftime('%m-%d', date(t.start_time, 'unixepoch', 'weekday 1', '-7 days')) || 
                ' - ' ||
                strftime('%m-%d', date(t.start_time, 'unixepoch', 'weekday 1', '-1 day')) 
            `],
            [FuelStatsOverviewTimeFrame.YTD, `strftime('%m', date(event_timestamp, 'unixepoch'))`]
        ]);

        const sortedStats: AggregatedFuelStat[] = await this.dbConn.getAllAsync(`
            SELECT 
                ${timeFrameToSQLStr.get(timeframe)} AS trip_dates
                SUM(tra.fuel_consumption) AS total_fuel_consumption,
                SUM(tra.trip_cost) AS total_fuel_cost,
                total_fuel_cost / SUM(tra.distance_traveled) AS avg_cost_per_mile,
                fuel_price
            FROM trip_results_aggregated tra
                JOIN trips t ON tra.trip_id = t.id
            WHERE t.start_time >= unixepoch('now', ${timeFrameToSQLStr.get(timeframe)})
            GROUP BY trip_dates
            ORDER BY trip_dates ASC;
        `);

        return sortedStats;
    }

    private convertSQLTripToObject(trip: any) : Trip {
        const aggTripStats: TripAggregatedResults = {
            geoJson: trip.geo_json_line_segments,
            avgMpg: trip.avg_mpg,
            avgSpeed: trip.avg_speed,
            distanceTraveled: trip.distance_traveled,
            fuelConsumption: trip.fuel_consumption,
            tripCost: trip.trip_cost,
            currFuelPrice: trip.regional_fuel_price
        };

        const processedTrip: Trip = {
            id: trip.id,
            tripName: trip.trip_name,
            vehicleId: trip.vin,
            startTime: convertUnixTimeToLocalDateTimeStr(trip.start_time),
            endTime: convertUnixTimeToLocalDateTimeStr(trip.end_time),
            tripAggResults: aggTripStats 
        };

        return processedTrip;
    }
}