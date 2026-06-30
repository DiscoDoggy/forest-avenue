import { Trip } from "@/db/trips"
import { StyleSheet, Text, View } from "react-native"
import Mapbox, { MapView, LocationPuck, Camera, ShapeSource, LineLayer, LineLayerStyle, CircleLayer, CircleLayerStyle, SymbolLayer, SymbolLayerStyle } from "@rnmapbox/maps";
import { MAPBOX_PUBLIC_KEY } from "@/app/configs/keys";
import { useRef } from "react";
import { FeatureCollection, LineString } from "geojson";

Mapbox.setAccessToken(MAPBOX_PUBLIC_KEY);
Mapbox.setTelemetryEnabled(false);

interface TripOverviewProps {
    trip: Trip;
} 

export default function TripOverviewScreen({trip} : TripOverviewProps) {
    const camera = useRef<Camera>(null);
    const tripGeoJson = JSON.parse(trip.tripAggResults.geoJson) as FeatureCollection; 
    const tripCoordinates = (tripGeoJson.features[0].geometry as LineString).coordinates;
    const centerCoordiantes =  tripCoordinates[tripCoordinates.length / 2];

    
    return (
        <View style={styles.map}>
            <MapView>
                scaleBarEnabled={false}

                <Camera 
                    ref={camera} 
                    centerCoordinate={[centerCoordiantes[0], centerCoordiantes[1]]}
                />

                <ShapeSource id='feature-source' shape={tripGeoJson}>

                    <LineLayer id='line-layer' style={lineLayerStyle} slot='middle'></LineLayer>
                    <SymbolLayer id='symbol-layer' style={symbolLayerStyle} slot='middle'></SymbolLayer>

                    </ShapeSource>
            </MapView>
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