import { Trip, TripsDAO } from "@/db/trips"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import Mapbox, { MapView, LocationPuck, Camera, ShapeSource, LineLayer, LineLayerStyle, CircleLayer, CircleLayerStyle, SymbolLayer, SymbolLayerStyle } from "@rnmapbox/maps";
import { MAPBOX_PUBLIC_KEY } from "@/app/configs/keys";
import { useEffect, useMemo, useRef, useState } from "react";
import { FeatureCollection, LineString } from "geojson";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useSQLiteContext } from "expo-sqlite";

Mapbox.setAccessToken(MAPBOX_PUBLIC_KEY);
Mapbox.setTelemetryEnabled(false);

// interface TripOverviewProps {
//     trip: Trip;
// } 

export default function TripOverviewScreen() {
    const camera = useRef<Camera>(null);

    const [trip, setTrip] = useState<Trip | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [didError, setDidError] = useState<boolean>(false);

    const tripId  = useLocalSearchParams<{tripId: string}>();
    console.log(`trip id ${tripId.tripId}`);

    const db = useSQLiteContext();

    useEffect( () => {
        const fetchTrip = async () => {
            setIsLoading(true);
            try {
                const tripsDao = new TripsDAO(db);
                const tripFromDB = await tripsDao.getTripById(tripId.tripId);
                if(!tripFromDB) {
                    throw new Error(`trip with id ${tripId.tripId} could not be fetched`);
                }

                setTrip(tripFromDB);
                setIsLoading(false);
            } catch(e) {
                setDidError(true);
                setIsLoading(false);
            }

        }

        fetchTrip();
    }, [db, tripId.tripId]);

    const tripGeoJson = useMemo( () => {
        if(!trip) {
            return null; 
        }
        console.log('before geojson parse');
        console.log(trip.tripAggResults.geoJson);
        const geoJson = JSON.parse(trip.tripAggResults.geoJson) as FeatureCollection;
        console.log('after geojson parse');
        return geoJson 
    }, [trip]);

    const tripCenterCoords = useMemo( () => {
        if(!tripGeoJson) {
            return null; 
        }
        const tripCoords = (tripGeoJson.features[0].geometry as LineString).coordinates;
        return tripCoords[Math.floor(tripCoords.length  / 2)];
    }, [tripGeoJson]);

    if(!trip || !tripGeoJson || isLoading || !tripCenterCoords) {
        return (
            <ActivityIndicator />
        )
    }

    return (

        <View>
            {/* <View style={styles.map}> */}
                <MapView
                    scaleBarEnabled={false}
                    style={styles.map}
                >
                    

                    <Camera 
                        ref={camera} 
                        centerCoordinate={[tripCenterCoords[0], tripCenterCoords[1]]}
                    />

                    <ShapeSource id='feature-source' shape={tripGeoJson}>

                        <LineLayer id='line-layer' style={lineLayerStyle} slot='middle'></LineLayer>
                        <SymbolLayer id='symbol-layer' style={symbolLayerStyle} slot='middle'></SymbolLayer>

                        </ShapeSource>
                </MapView>
            {/* </View> */}

            <View style={styles.statsContainer}>
                <View style={styles.topStatsContainer}>
                    <View style={styles.statContainer}>
                        <Text style={styles.statsTitle}>
                            Avg. Fuel Efficiency
                        </Text>
                        <Text style={styles.statText}>
                            {trip.tripAggResults.avgMpg}
                        </Text>
                    </View>
                    <View style={styles.statContainer}>
                        <Text style={styles.statsTitle}>
                            Fuel Used (Gal)
                        </Text>
                        <Text style={styles.statText}>
                            {trip.tripAggResults.avgSpeed}
                        </Text>
                    </View>
                </View>

                <View style={styles.topStatsContainer}>
                    <View style={styles.statContainer}>
                        <Text style={styles.statsTitle}>Distance Traveled</Text>
                        <Text style={styles.statText}>
                            {trip.tripAggResults.distanceTraveled}
                        </Text>
                    </View>
                    <View style={styles.statContainer}>
                        <Text style={styles.statsTitle}>Average Speed</Text>
                        <Text style={styles.statText}>
                            {23.6}
                        </Text>
                    </View>
                </View>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    map: {
        paddingHorizontal: 5,
        aspectRatio: 1,
        borderRadius: 12,
        width: '100%'
    },

    topStatsContainer: {
        flexDirection: 'row',
        // justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },

    statsContainer: {
        flexDirection: 'column',
        marginVertical: 8,
        marginHorizontal: 4,
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },

    statsTitle: {
        fontSize: 14,
        fontWeight: 'semibold'
    },

    statText: {
        justifyContent: 'center',
        fontSize: 24,
        fontWeight: 'bold'

    },

    statContainer: {
        flex: 1,
        marginHorizontal: 8,
        marginVertical: 8,
        padding: 16,
        borderRadius:16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,

        elevation: 9,
    }
});

const lineLayerStyle: LineLayerStyle = {
    lineColor: ['get', 'line-color'],
    lineWidth: 6.0,
    lineCap: 'round',
    lineJoin: 'round'
};

const symbolLayerStyle: SymbolLayerStyle = {
    textField: ['get', 'title']
}