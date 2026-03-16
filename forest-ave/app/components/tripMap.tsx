import { useState, useEffect, useRef } from 'react';
import {View, StyleSheet, Platform, PermissionsAndroid} from 'react-native';
import Mapbox, {MapView, LocationPuck, Camera} from "@rnmapbox/maps";
import * as Location from 'expo-location';


Mapbox.setAccessToken("pk.eyJ1IjoidGhlZmxpZ2h0bGVzc2JpcmQiLCJhIjoiY21tazN3MTQzMWdybzJ3b2M4dHF0Y3JrZSJ9.vwuF1cIXhLfvYU-p1PL7Hw");
Mapbox.setTelemetryEnabled(false);

export default function TripMap(){ 

    const [getLocation, setLocation] = useState<Location.LocationObject | null>(null);
    const camera = useRef<Camera>(null);
    useEffect(() => {( async () => {
        let locationSub: Location.LocationSubscription | null=null;

        const hasPerms = await requestLocationPermission();
        if(!hasPerms) { 
            console.log('Permission to access location was denied');
            return;
        } 
        const subscription = await Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                distanceInterval: 5,
                timeInterval: 5000
        }, (location) => {
            setLocation(location)
            camera.current?.setCamera({
                centerCoordinate: [location.coords.longitude, location.coords.latitude]
            });
            console.log('New location update: ' + location.coords.latitude + ', ' + location.coords.longitude);
        });

        locationSub = subscription;

        return () => {
            if(subscription) {
                locationSub.remove();
                console.log("location tracking paused or stopped");
            }
        } 
    })()}, [])

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
                    zoomLevel={20.1} 
                />

            </MapView>
        </View>
    );
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
