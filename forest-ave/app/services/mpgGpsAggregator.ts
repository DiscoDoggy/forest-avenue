import { LocationObject } from "expo-location";
import { MpgRecord } from "./mpgPollingService";
import { HaversineDistance } from "../utils/distanceFormulas";
import { Feature, Geometry } from "geojson";
import { setLocationHistory, useGpsStore } from "./gpsStore";
import { getDB } from "@/db/dbConnSingletonService";
import { Trip, TripsDAO } from "@/db/trips";
import { setMpg } from "./mpgStateStore";

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

export type PreliminaryTripInfo = {
    tripId: string,
    tripName?: string,
    tripStartTime?: number,
    tripEndTime?: number
};

//so the goal of this is to pair the incoming mpg data with the incoming gps data
//once enough data is obtained, or a sufficient amount of time has passed, we want to flush buffer
// to the Zustand state so that the consumers of the zustand state can update accordingly
// we also want to keep enough data such that on occasion we can write to permanent storage throughout the routes progress
export class MpgGpsAggregator {
    tripInfo?: PreliminaryTripInfo;

    gpsData: LocationObject[];
    mpgData: MpgRecord[];

    shortBuffer: MpgAlongCoordsSegment[];
    longBuffer: AggregatedRawMpgGpsData;

    segmentGeoJson: Feature<Geometry>;

    cumulativeDist: number;
    cumulativeMpgResetable: number;
    cumulativeMpg: number;
    numMpgCalculations: number;
    totalDistance: number;

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
        this.cumulativeMpgResetable = 0;
        this.cumulativeMpg = 0;
        this.totalDistance = 0;
        this.numMpgCalculations = 0;
    }

    addGpsData(location: LocationObject) {
        console.log('entering add gps data');
        console.log(`CUMULATIVE DISTANCE: ${this.cumulativeDist}`)
        if(this.gpsData.length > 0 ) {
            const p2pDist = HaversineDistance(this.gpsData[this.gpsData.length - 1].coords, location.coords)
            this.cumulativeDist += p2pDist
            this.totalDistance +=  p2pDist;
        }

        this.gpsData.push(location);

        if(this.cumulativeDist >= 2) { // 30 meters
            this.aggregate();
            this.flushToSubs();
        }

        this.numMpgCalculations += 1;
    }

    addMpgData(mpgData: MpgRecord) {
        this.mpgData.push(mpgData);
        setMpg(mpgData.mpg);
        this.cumulativeMpgResetable += mpgData.mpg;
        this.cumulativeMpg += mpgData.mpg;
    }

    aggregate() {
        // create the geo json from gps data that has been received
        // the geo json should then be associated and assigned a color
        // based on the smoothed mpg that we have calculated

        const coordSegment: CoordinatesSegment = {
            longLatPoints: this.gpsData
        };

        const smoothedMpg = this.cumulativeMpgResetable / this.mpgData.length;

        const segmentMpg: MpgAlongCoordsSegment = {
            segment: coordSegment,
            smoothedMpg: smoothedMpg
        }

        //create geojson
        let positions = [];
        for(const position of coordSegment.longLatPoints) {
            positions.push([position.coords.longitude, position.coords.latitude]);
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
        this.cumulativeMpgResetable = 0;
        this.mpgData = [];
    }

    flushToSubs() {
        console.log('FLUSHING LOCATIONS TO FRONTEND')
        setLocationHistory(this.segmentGeoJson);
    }

    async flushToPermStorage() {
        const geoJsonStr = JSON.stringify(useGpsStore.getState().locationHistory);
        if(!this.tripInfo) {
            throw new Error('attempted to store trip but no trip information could be found');
        }

        let avgSpeed = 0;
        for(const mpgRecord of this.longBuffer.rawMpgData) {
            if(mpgRecord.vehicleSpeed) {
                avgSpeed += mpgRecord.vehicleSpeed; 
            }
        }

        avgSpeed /= this.longBuffer.rawMpgData.length;

        const newTrip: Trip = {
            id: this.tripInfo.tripId,
            tripName: this.tripInfo.tripName,
            vehicleId: 'TEST CAR 123',
            ...(this.tripInfo.tripStartTime ?  {startTime: this.tripInfo.tripStartTime} : {startTime: Date.now() - 3600}),
            ...(this.tripInfo.tripEndTime ? {endTime: this.tripInfo.tripEndTime} : {endTime: Date.now()}), 
            tripAggResults: {
                geoJson: geoJsonStr,
                distanceTraveled: this.cumulativeDist,
                avgMpg: this.cumulativeMpg / this.numMpgCalculations,
                avgSpeed: avgSpeed
            },
            tripRawMpgStats: this.longBuffer.rawMpgData,
            tripGPSRaws: this.longBuffer.rawGpsData
        }


        const db = await getDB();
        const tripDao = new TripsDAO(db)
        
        tripDao.createTrip(newTrip)
    }

    clearData() {
        this.tripInfo = undefined;
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
        this.cumulativeMpgResetable = 0;
    }
}