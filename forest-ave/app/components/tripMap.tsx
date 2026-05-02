import { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import Mapbox, { MapView, LocationPuck, Camera, ShapeSource, LineLayer, LineLayerStyle, CircleLayer, CircleLayerStyle, SymbolLayer, SymbolLayerStyle } from "@rnmapbox/maps";
import * as Location from 'expo-location';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import { useBluetooth } from '../contexts/bluetoothContexts';
import { OBDPIDS } from '../utils/obdiiCommands';
import { calculateInstMPGWithoutFuelTrims } from '../utils/mpg';

Mapbox.setAccessToken("pk.eyJ1IjoidGhlZmxpZ2h0bGVzc2JpcmQiLCJhIjoiY21tazN3MTQzMWdybzJ3b2M4dHF0Y3JrZSJ9.vwuF1cIXhLfvYU-p1PL7Hw");
Mapbox.setTelemetryEnabled(false);

interface TripMapProps {
    isTripStarted: boolean;
    isTripPaused: boolean;
    isTripStopped: boolean;

}

export default function TripMap({ isTripStarted, isTripPaused, isTripStopped }: TripMapProps) {

    const [getLocation, setLocation] = useState<Location.LocationObject | null>(null);
    const camera = useRef<Camera>(null);
    const [getTripCoords, setTripCoords] = useState<number[][]>([]);

    const {connectedDevice, readChannel, btdReceivedData} = useBluetooth();


    const [getGeoTripData, setGeoTripData] = useState<FeatureCollection<Geometry>>({ 
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: getTripCoords
                }
            },
        ]}
    );

    //calculate gas mileage from OBD2
    const getMPG = useCallback(async(): Promise<number> => {

        try {
            // await OBDPIDS.STFT1.runCmdOnOBD(connectedDevice);
            // const STFT= await readChannel.readWithTimeout() as number;
            // console.log(`STFT: ${STFT}`);

            // await OBDPIDS.LTFT1.runCmdOnOBD(connectedDevice);
            // const LTFT = await readChannel.readWithTimeout() as number;
            // console.log(`LTFT: ${LTFT}`);

            await OBDPIDS.vehicleSpeed.runCmdOnOBD(connectedDevice);
            const vehicleSpeed = await readChannel.readWithTimeout() as number;
            console.log(`vehicle speed: ${vehicleSpeed}`);

            await OBDPIDS.MAF.runCmdOnOBD(connectedDevice);
            const MAF = await readChannel.readWithTimeout() as number;
            console.log(`MAF: ${MAF}`);
            
            // const mpg = calculateInstMPG(STFT, LTFT, MAF, vehicleSpeed);
            const mpg = calculateInstMPGWithoutFuelTrims(MAF, vehicleSpeed);
            return mpg;

        } catch(error) {
            console.error(`error getting components for gas mileage calculation: ${error}`);
        }

        return -1;
        
    }, [connectedDevice, readChannel]);

    const updateGeoTripData = useCallback((longitude: number, latitude: number, avgMpg: number) => {
        const newPoint: Feature<Geometry> = {
            type: 'Feature',
            properties: {
                "title": avgMpg,
                "type": 'mpg_marker'
            },
            geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        }

        setGeoTripData(prev => {
            const newFeatures = [...prev.features];
            if(newFeatures[0].geometry.type === 'LineString') {
                newFeatures[0].geometry.coordinates = [...newFeatures[0].geometry.coordinates, [longitude, latitude]]
            }

            //TODO: add logic for creating a point or not
            newFeatures.push(newPoint);

            return {
                ...prev,
                features: newFeatures
            }
        });
    }, []);

    useEffect(() => {
        let locationSub: Location.LocationSubscription | null = null;
        console.log(`button states: tripStarted: ${isTripStarted} tripPaused: ${isTripPaused} tripStopped: ${isTripStopped}`);

        (async () => {

            if (isTripStarted && !isTripStopped && !isTripPaused) {
                const hasPerms = await requestLocationPermission();
                if (!hasPerms) {
                    console.log('Permission to access location was denied');
                    return;
                }

                const subscription = await Location.watchPositionAsync({
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 1,
                    timeInterval: 5000
                }, async (location) => {
                    setLocation(location)
                    camera.current?.setCamera({
                        centerCoordinate: [location.coords.longitude, location.coords.latitude]
                    });

                    const mpg = await getMPG();
                    updateGeoTripData(location.coords.longitude, location.coords.latitude, mpg);

                    console.log('New location update: ' + location.coords.latitude + ', ' + location.coords.longitude);
                });

                locationSub = subscription;
            }
        })();

        return () => {
            if (locationSub) {
                locationSub.remove();
                console.log("location tracking paused or stopped");
            }
        };

    }, [isTripStarted, isTripPaused, isTripStopped, updateGeoTripData, getMPG])

    return (
        <View style={styles.map}>
            <MapView
                scaleBarEnabled={false}
                style={styles.map}
            >
                <LocationPuck
                    puckBearingEnabled
                    puckBearing="heading"
                    pulsing={{ isEnabled: true }}
                />

                <Camera
                    ref={camera}
                    zoomLevel={17.1}

                />

                <ShapeSource id='feature-source' shape={getGeoTripData}>

                    <LineLayer id='line-layer' style={lineLayerStyle} slot='middle'></LineLayer>
                    <CircleLayer id='circle-layer' style={circleLayerStyle} slot='middle'></CircleLayer>
                    <SymbolLayer id='symbol-layer' style={symbolLayerStyle} slot='middle'></SymbolLayer>

                </ShapeSource>

            </MapView>
        </View>
    );
}

// we want to be able to dynamically put a certain amount of points on the board


const lineLayerStyle: LineLayerStyle = {
    lineColor: '#ff0000',
    lineWidth: 6.0,
};

const circleLayerStyle: CircleLayerStyle = {
    circleColor: '#1900fd',
}

const symbolLayerStyle: SymbolLayerStyle = {
    textField: ['get', 'title']
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    }
});

//https://docs.mapbox.com/help/tutorials/getting-started-react-native/?step=7
const requestLocationPermission = async () => {
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




// we want to implement the button parts. stop saves coords maybe as GEOJSON file in storage or maybe just as plain text
// on stop we store in local storage and then save to online server if wifi
// on pause we unsubscribe from location events and on resume we resubscribe
