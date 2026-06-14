import { LocationObject } from "expo-location";
import { MpgRecord } from "./mpgPollingService";
import { HaversineDistance } from "../utils/distanceFormulas";
import { Feature, Geometry } from "geojson";
import { setLocationHistory } from "./gpsStore";

// type Coordinates = {
//     longitude: number
//     latitude: number
//     timestamp: number
// }

type CoordinatesSegment = {
    longLatPoints: LocationObject[]
}

type MpgAlongCoordsSegment = {
    segment: CoordinatesSegment
    smoothedMpg: number
}

type AggregatedRawMpgGpsData = {
    rawMpgData: MpgRecord[]
    rawGpsData: LocationObject[]
    smoothedLinkedMpgGpsSegments: MpgAlongCoordsSegment[]
}

//so the goal of this is to pair the incoming mpg data with the incoming gps data
//once enough data is obtained, or a sufficient amount of time has passed, we want to flush buffer
// to the Zustand state so that the consumers of the zustand state can update accordingly
// we also want to keep enough data such that on occasion we can write to permanent storage throughout the routes progress
export class MpgGpsAggregator {

    gpsData: LocationObject[];
    mpgData: MpgRecord[];

    shortBuffer: MpgAlongCoordsSegment[];
    longBuffer: AggregatedRawMpgGpsData;

    segmentGeoJson: Feature<Geometry>;

    cumulativeDist: number;
    cumulativeMpg: number;

    constructor() {
        this.gpsData = [];
        this.mpgData = [];

        this.shortBuffer = [];

        this.longBuffer = {
            rawMpgData: [],
            rawGpsData: [],
            smoothedLinkedMpgGpsSegments: []
        };

        this.segmentGeoJson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates:[]
            }
        };

        this.cumulativeDist = 0;
        this.cumulativeMpg = 0;
        
    }

    addGpsData(location: LocationObject) {
        console.log('entering add gps data');
        console.log(`CUMULATIVE DISTANCE: ${this.cumulativeDist}`)
        if(this.gpsData.length > 0 ) {
            this.cumulativeDist += HaversineDistance(this.gpsData[this.gpsData.length - 1], location);
        }

        this.gpsData.push(location);

        if(this.cumulativeDist >= 2) { // 30 meters
            this.aggregate();
            this.flushToSubs();
        }
    }

    addMpgData(mpgData: MpgRecord) {
        this.mpgData.push(mpgData);
        this.cumulativeMpg += mpgData.mpg;
    }

    aggregate() {
        // create the geo json from gps data that has been received
        // the geo json should then be associated and assigned a color
        // based on the smoothed mpg that we have calculated

        const coordSegment: CoordinatesSegment = {
            longLatPoints: this.gpsData
        };

        const smoothedMpg = this.cumulativeMpg / this.mpgData.length;

        const segmentMpg: MpgAlongCoordsSegment = {
            segment: coordSegment,
            smoothedMpg: smoothedMpg
        }

        //create geojson
        let positions = [];
        for(const position of coordSegment.longLatPoints) {
            positions.push([position.coords.longitude, position.coords.latitude,]);
        }

        let lineColor = ''
        if(smoothedMpg <= 20) {
            lineColor = '#DB4437';
        } else if(smoothedMpg > 20 && smoothedMpg <= 27) {
            lineColor = '#F4B400';
        }  else {
            lineColor = '#0F9D58';
        }

        const newGeoJson: Feature<Geometry> = {
            type: 'Feature',
            properties: {
                'line-color': lineColor 
            },
            geometry: {
                type: 'LineString',
                coordinates: positions 
            }
        };

        this.segmentGeoJson = newGeoJson;

        this.longBuffer.rawMpgData = this.longBuffer.rawMpgData.concat(this.mpgData);
        this.longBuffer.rawGpsData = this.longBuffer.rawGpsData.concat(this.gpsData);
        this.longBuffer.smoothedLinkedMpgGpsSegments.push(segmentMpg);

        //clear raw data thats been aggregated already
        this.gpsData = [this.gpsData[this.gpsData.length - 1]];
        this.cumulativeDist = 0;
        this.mpgData = [];
    }

    flushToSubs() {
        console.log('FLUSHING LOCATIONS TO FRONTEND')
        setLocationHistory(this.segmentGeoJson);
    }

    flushToPermStorage() {
        return;
    }
}