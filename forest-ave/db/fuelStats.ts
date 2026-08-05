import { FuelStatsOverviewTimeFrame } from '@/constants/mpgConstants';
import * as SQLite from 'expo-sqlite';

export type FuelConsumptionByDate = {
    fuelConsumption: number,
    date: string
}

interface FuelStatsDAOInterface {
    getFuelConsumptionByTimeFrame(timeframe: FuelStatsOverviewTimeFrame): Promise<FuelConsumptionByDate[]>
}

export class FuelStatsDAO implements FuelStatsDAOInterface {
    private dbConn: SQLite.SQLiteDatabase;

    constructor(dbConn: SQLite.SQLiteDatabase) {
        this.dbConn = dbConn;
    }

    async getFuelConsumptionByTimeFrame(timeframe: FuelStatsOverviewTimeFrame) {
        // Fuel consumption is calculated through taking the distance travelled in a segment
        // and dividing it by the mpg of the segment done for every segment in the trip 
        // summed across all trips travelled and started that day
        // organized into how many ever days this was done for

        // but i would need to store the raw speed and raw 
        const statement = await this.dbConn.prepareAsync(`
            SELECT      
        `)
        return [];
    }
}