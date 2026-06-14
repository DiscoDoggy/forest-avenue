import { LocationObject } from "expo-location";

export function HaversineDistance(source: LocationObject, destination: LocationObject) {
    /*
   The Haversine formula determines the great-circle distance between 
   two points on a sphere (like Earth) using their latitude and longitude. 
    */
    
    const sourceLongRad = convertDegsToRads(source.coords.longitude);
    const sourceLatRad = convertDegsToRads(source.coords.latitude) ;
    const destLongRad = convertDegsToRads(destination.coords.longitude);
    const destLatRad = convertDegsToRads(destination.coords.latitude);

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