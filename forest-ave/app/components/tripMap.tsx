import { useEffect } from 'react';
import {View, StyleSheet, Platform, PermissionsAndroid} from 'react-native';
import Mapbox, {MapView, LocationPuck} from "@rnmapbox/maps";

Mapbox.setAccessToken("pk.eyJ1IjoidGhlZmxpZ2h0bGVzc2JpcmQiLCJhIjoiY21tazN3MTQzMWdybzJ3b2M4dHF0Y3JrZSJ9.vwuF1cIXhLfvYU-p1PL7Hw");
Mapbox.setTelemetryEnabled(false);

export default function TripMap(){ 
    useEffect(() => {
        requestLocationPermission();
    }, []);

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