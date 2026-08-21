import { IDEAL_AIR_FUEL_RATIO, KPH_TO_MPH_MULTIPLIER, SECONDS_PER_HOUR, GRAMS_PER_POUND, POUNDS_OF_GAS_PER_GALLON, FUEL_DENSITY, LITERS_FUEL_IN_GALLON, KILOMETERS_PER_MILE } from "@/constants/mpgConstants";
import { TripRawGPSResult, TripRawMpgResult } from "@/db/trips";

//TODO: This may eventually become a class FuelCalculator because we may need to inject settings such as controls for units like liters vs gallons
// and adjust the fuel calculation we use based off of the sensors the car may have

export function calculateInstMPG(STFT: number, LTFT: number, MAF: number, vehicleSpeed: number): number {
    const trimMultiplier = 1 + ((STFT + LTFT) / 100); 
    const fuelFlow = (MAF / IDEAL_AIR_FUEL_RATIO) *  trimMultiplier;
    const speedInMPH =  vehicleSpeed * KPH_TO_MPH_MULTIPLIER; //numerator
    const denominator = (MAF / (IDEAL_AIR_FUEL_RATIO * GRAMS_PER_POUND * POUNDS_OF_GAS_PER_GALLON) * fuelFlow) * SECONDS_PER_HOUR;

    return speedInMPH / denominator;
}

export function calculateInstMPGWithoutFuelTrims(MAF: number, VSS: number) {
    let ffr = MAF / IDEAL_AIR_FUEL_RATIO; // grams per second
    ffr = ffr / (FUEL_DENSITY * LITERS_FUEL_IN_GALLON); // gallons per second

    const distRate = VSS / (KILOMETERS_PER_MILE * SECONDS_PER_HOUR); // miles per second
    
    return distRate / ffr;
}

export function calculateFuelConsumption(mpg: number, distance: number) {
    // what if mpg is 0?
    if(mpg === 0) {
        throw new Error('Divide by 0');
    }

    return distance / mpg;
}

// export function calculateFuelConsumptionAggregated(rawMpgStats: TripRawMpgResult[], rawGPSStats:TripRawGPSResult[]) {
//     if (!rawMpgStats || !rawGPSStats) {
//         return 0;
//     }

//     // distance here is 0
//     if(rawGPSStats.length === 1) {
//         return 0; 
//     }

//     // what we are trying to record is the fuel consumption on particular days
//     // this can be a map mapping string "07/31" --> fuel consumption Gallons/KPG etc.
//     let currFuelConsumption = 0;
//     const dateToFuelConsumption = new Map<string, number>();
//     if(rawGPSStats.length > rawMpgStats.length) {
//         const firstMpgReadingTime = rawMpgStats[0].recorded_at;
//         let firstGPSReadingAfterFirstMpgIdx = 0;
//         for(let i = 0; i < rawGPSStats.length; i++) {
//             if (rawGPSStats[i].recorded_at >= firstMpgReadingTime) {
//                 firstGPSReadingAfterFirstMpgIdx = i;
//             }
//         }

//         let low = 0;
//         let high = 1;  
//         let gpsPtr = 0;
//         for(high; high < rawMpgStats.length; low++, high++) {
//             const lowerBoundMpgRecordedAt = rawMpgStats[low].recorded_at;
//             const upperBoundMpgRecordedAt = rawMpgStats[high].recorded_at;

//             // gps window represents the set of gps coordinates that fall under the current MPG 
//             let gpsWindow = [];
//             while(gpsPtr < rawGPSStats.length) {
//                 if (rawGPSStats[gpsPtr].recorded_at >= lowerBoundMpgRecordedAt && rawGPSStats[gpsPtr].recorded_at <= upperBoundMpgRecordedAt) {
//                     gpsWindow.push(rawGPSStats[gpsPtr]);
//                     gpsPtr += 1;
//                 } else {
//                     break
//                 }
//             }

            
            
//         }
//     }

// }