import { LocationObject, LocationObjectCoords } from "expo-location";

export function HaversineDistance(source: LocationObjectCoords, destination: LocationObjectCoords) {
    /*
   The Haversine formula determines the great-circle distance between 
   two points on a sphere (like Earth) using their latitude and longitude. 
    */
    
    const sourceLongRad = convertDegsToRads(source.longitude);
    const sourceLatRad = convertDegsToRads(source.latitude) ;
    const destLongRad = convertDegsToRads(destination.longitude);
    const destLatRad = convertDegsToRads(destination.latitude);

    const EARTH_RADIUS = 3959.0 //miles

    const deltaLat = destLatRad - sourceLatRad;
    const deltaLong = destLongRad - sourceLongRad;

    const root = Math.sqrt(Math.sin(deltaLat / 2)**2 + Math.cos(sourceLatRad) * 
        Math.cos(destLatRad) * Math.sin(deltaLong / 2)**2);

    const distBetweenCoords = 2 * EARTH_RADIUS * Math.asin(root);

    //conv to meters
    return distBetweenCoords * 1609;

}

function convertDegsToRads(degree: number) {
    return degree * Math.PI / 180
}