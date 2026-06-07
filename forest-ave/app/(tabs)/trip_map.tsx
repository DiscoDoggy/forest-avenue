import React, { useState } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Mapbox, { MapView } from "@rnmapbox/maps";
import TripMap from '../components/tripMap';
import { useMpgDataStore } from '../services/mpgStateStore';
import { vehicleService } from '../services/vehicleService';

Mapbox.setAccessToken("pk.eyJ1IjoidGhlZmxpZ2h0bGVzc2JpcmQiLCJhIjoiY21tazN3MTQzMWdybzJ3b2M4dHF0Y3JrZSJ9.vwuF1cIXhLfvYU-p1PL7Hw");
Mapbox.setTelemetryEnabled(false);

export default function TripScreen() {
    // const mpg = useMpgDataStore((state) => state.mpg);
    const [isTripStarted, setTripStarted] = useState(false);
    const [isTripPaused, setTripPaused] = useState(false);
    const [isTripStopped, setTripStopped] = useState(false);

    return (
        <View style={styles.page}>
            <View style={styles.mapContainer}>
                <TripMap
                    isTripPaused={isTripPaused}
                    isTripStarted={isTripStarted}
                    isTripStopped={isTripStopped}
                />
            </View>

            <View style={styles.controlsContainer}>
                <View style={styles.testContainer}>
                    {!isTripStarted ?
                        <View style={styles.startTripContainer}>
                            <Pressable
                                onPress={() => {
                                    setTripStarted(true);
                                    // want to start recording GPS and OBD2 stats after pressing of start trip
                                    vehicleService.mpgPollingService?.startMPGPolling();
                                }}
                            >
                                <Text>Start Trip</Text>
                            </Pressable>
                        </View>
                        :
                        <View style={styles.tripActiveControlsContainer}>
                            <View style={styles.startPauseContainer}>
                                <Pressable
                                    onPress={() => {
                                        setTripPaused(!isTripPaused);
                                        if(isTripPaused) {
                                            vehicleService.mpgPollingService?.startMPGPolling();
                                        } else {
                                            vehicleService.mpgPollingService?.stopMPGPolling();
                                        }
                                    }}
                                >
                                    <Ionicons name={!isTripPaused ? 'pause' : 'play'} size={96} />
                                </Pressable>
                            </View>

                            <View style={styles.stopContainer}>
                                <Pressable
                                    onPress={() => {
                                        setTripStopped(true);
                                        vehicleService.mpgPollingService?.stopMPGPolling();
                                    }}
                                >
                                    <Ionicons name={'stop'} size={64} />
                                </Pressable>
                            </View>
                        </View>
                    }
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: "#F5FCFF"
    },
    mapContainer: {
        flex: 11,
        backgroundColor: "red"
    },
    map: {
        flex: 1
    },

    controlsContainer: {
        flex: 2,
        flexDirection: "row",
        backgroundColor: "green",
        alignItems: "center",
        justifyContent: "center"
    },

    startTripContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },

    testContainer: {
        flex: 1,
    },

    tripActiveControlsContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "blue"
    },

    startPauseContainer: {
        flex: 1,
        backgroundColor: 'pink',
        alignItems: "center",
        justifyContent: "center"
    },

    stopContainer: {
        flex: 1,
        backgroundColor: 'grey',
        alignItems: "center"
    }
});