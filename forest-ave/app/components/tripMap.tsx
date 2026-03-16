import { useState, useEffect, useRef } from 'react';
import {View, StyleSheet, Platform, PermissionsAndroid} from 'react-native';
import Mapbox, {MapView, LocationPuck, Camera, ShapeSource, LineLayer, LineLayerStyle} from "@rnmapbox/maps";
import * as Location from 'expo-location';


Mapbox.setAccessToken("pk.eyJ1IjoidGhlZmxpZ2h0bGVzc2JpcmQiLCJhIjoiY21tazN3MTQzMWdybzJ3b2M4dHF0Y3JrZSJ9.vwuF1cIXhLfvYU-p1PL7Hw");
Mapbox.setTelemetryEnabled(false);

interface TripMapProps {
    isTripStarted: boolean;
    isTripPaused: boolean;
    isTripStopped: boolean;

}

export default function TripMap({isTripStarted, isTripPaused, isTripStopped}: TripMapProps){ 

    const [getLocation, setLocation] = useState<Location.LocationObject | null>(null);
    const camera = useRef<Camera>(null);
    const [getTripCoords, setTripCoords]= useState<number[][]>([]);

    useEffect(() => {
        let locationSub: Location.LocationSubscription | null=null;
        console.log(`button states: tripStarted: ${isTripStarted} tripPaused: ${isTripPaused} tripStopped: ${isTripStopped}`);

        (async () => {

            if(isTripStarted && !isTripStopped && !isTripPaused) {
                const hasPerms = await requestLocationPermission();
                if(!hasPerms) { 
                    console.log('Permission to access location was denied');
                    return;
                }

                const subscription = await Location.watchPositionAsync({
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 1,
                    timeInterval: 5000
                }, (location) => {
                    setLocation(location)
                    camera.current?.setCamera({
                        centerCoordinate: [location.coords.longitude, location.coords.latitude]
                    });

                    //update routing
                //    setTripCoords([...getTripCoords, [location.coords.longitude, location.coords.latitude]]);
                    setTripCoords(prev => [...prev, [location.coords.longitude, location.coords.latitude]])

                    console.log('New location update: ' + location.coords.latitude + ', ' + location.coords.longitude);
                });

                locationSub = subscription;
            }
    })();

        return () => {
            if(locationSub) {
                locationSub.remove();
                console.log("location tracking paused or stopped");
            }
        };   

    }, [isTripStarted, isTripPaused, isTripStopped])

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

                <ShapeSource id='line-source' shape={{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: getTripCoords
                    }
                }}>

                    <LineLayer id='line-layer' style={lineLayerStyle} slot='middle'></LineLayer>

                </ShapeSource>

            </MapView>
        </View>
    );
}

const lineLayerStyle: LineLayerStyle = {
  lineColor: '#ff0000',
  lineWidth: 6.0,
};

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
