import * as SQLite from 'expo-sqlite'

export type TripAggregatedResults = {
    geoJson: string,
    distanceTraveled: number,
    avgMpg: number,
    avgSpeed: number
}
export type Trip = {
    id: string,
    vehicleId: string,
    userId?: string,
    startTime: number,
    endTime: number,

    tripAggResults: TripAggregatedResults,
}

export interface TripsDAOInterface {
    getAllTrips(): Promise<Trip[]>,
    getTripById(id: string): Promise<Trip | null> ,

    createTrip(trip: Trip): Promise<void>,
    deleteTrip(id: string): Promise<void>,
}

class TripsDAO implements TripsDAOInterface {
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
            INSERT INTO trips(id, vin, start_time, end_time) VALUES($id, $vin, $start_time, $end_time)
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
        
        try {
            await this.dbConn.withExclusiveTransactionAsync(async () => {
                let result = await tripInsertStmt.executeAsync({
                    $id: trip.id,
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
            vehicleId: trip.vin,
            startTime: trip.start_time,
            endTime: trip.end_time,
            tripAggResults: aggTripStats 
        };

        return processedTrip;
    }
}