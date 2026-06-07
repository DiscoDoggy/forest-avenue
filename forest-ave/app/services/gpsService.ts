import * as Location from "expo-location";
import { mpgGpsAggregator } from "./serviceContainer";

export class GpsService {
    subscription: Location.LocationSubscription | null;

    constructor() {
        this.subscription = null;
    }

    async connect() {
        this.subscription = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 10
        }, (location) => {
            this.onReceiveLocation(location);
        }) 
    }

    onReceiveLocation(location: Location.LocationObject) {
        mpgGpsAggregator.addGpsData(location);

        //we also want to flush to the frontend so some state needs to flush the location to the front end
        // immediatly
    }

    disconnect() {
        if(this.subscription === null) return;

        this.subscription.remove();
    }
}