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

            <View>
                <View>
                    <View>
                        <Text>
                            {trip.tripAggResults.avgMpg}
                        </Text>
                    </View>
                    <View>
                        <Text>
                            {trip.tripAggResults.avgSpeed}
                        </Text>
                    </View>
                </View>

                <View>
                    <View>
                        <Text>
                            {trip.tripAggResults.distanceTraveled}
                        </Text>
                    </View>
                    <View>
                        <Text>
                            {'some other stat'}
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