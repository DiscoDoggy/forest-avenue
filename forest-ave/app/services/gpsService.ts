import * as Location from "expo-location";
import { setCurrLocation } from "./gpsStore";
import { Platform, PermissionsAndroid } from 'react-native';
import { MpgGpsAggregator } from "./mpgGpsAggregator";

export class GpsService {
    subscription: Location.LocationSubscription | null;
    mpgGpsAggregator: MpgGpsAggregator;

    constructor(mpgGpsAggregator: MpgGpsAggregator) {
        this.subscription = null;
        this.mpgGpsAggregator = mpgGpsAggregator;
    }

//https://docs.mapbox.com/help/tutorials/getting-started-react-native/?step=7
    private async requestLocationPermission() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'This app needs access to your location to show your position on the map.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    async connect() {
        const hasLocationPerms = await this.requestLocationPermission();
        if(!hasLocationPerms) {
            throw new Error('user has not enabled location permissions');
        }

        this.subscription = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 1
        }, (location) => {
            console.log('LOCATION RECEIVED')
            this.onReceiveLocation(location);
        });
    }

    onReceiveLocation(location: Location.LocationObject) {
        this.mpgGpsAggregator.addGpsData(location);

        setCurrLocation(location);
    }

    disconnect() {
        if(this.subscription === null) return;

        this.subscription.remove();
    }
}