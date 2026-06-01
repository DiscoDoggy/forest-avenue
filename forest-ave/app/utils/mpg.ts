import { IDEAL_AIR_FUEL_RATIO, KPH_TO_MPH_MULTIPLIER, SECONDS_PER_HOUR, GRAMS_PER_POUND, POUNDS_OF_GAS_PER_GALLON, FUEL_DENSITY, LITERS_FUEL_IN_GALLON, KILOMETERS_PER_MILE } from "@/constants/mpgConstants";

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