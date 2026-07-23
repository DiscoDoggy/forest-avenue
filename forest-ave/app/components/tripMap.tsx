import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Mapbox, { MapView, LocationPuck, Camera, ShapeSource, LineLayer, LineLayerStyle, CircleLayer, CircleLayerStyle, SymbolLayer, SymbolLayerStyle } from "@rnmapbox/maps";
import { useGpsStore } from '../services/gpsStore';
import { MAPBOX_PUBLIC_KEY } from '../configs/keys';

Mapbox.setAccessToken(MAPBOX_PUBLIC_KEY);
Mapbox.setTelemetryEnabled(false);

interface TripMapProps {
    isTripStarted: boolean;
    isTripPaused: boolean;
    isTripStopped: boolean;

}

export default function TripMap({ isTripStarted, isTripPaused, isTripStopped }: TripMapProps) {
    const camera = useRef<Camera>(null);
    const gpsMpgColoredLineSegments = useGpsStore((state) => state.locationHistory);
    const currGpsLocation = useGpsStore((state) => state.currLocation);

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
                    centerCoordinate={[currGpsLocation?.coords.longitude!, currGpsLocation?.coords.latitude!]}
                    // followUserLocation={true}
                    animationMode='moveTo'
                />

                <ShapeSource id='feature-source' shape={gpsMpgColoredLineSegments}>

                    <LineLayer id='line-layer' style={lineLayerStyle} slot='middle'></LineLayer>
                    {/* <CircleLayer id='circle-layer' style={circleLayerStyle} slot='middle'></CircleLayer> */}
                    <SymbolLayer id='symbol-layer' style={symbolLayerStyle} slot='middle'></SymbolLayer>

                </ShapeSource>

            </MapView>
        </View>
    );
}


const lineLayerStyle: LineLayerStyle = {
    lineColor: ['get', 'line-color'],
    lineWidth: 6.0,
    lineCap: 'round',
    lineJoin: 'round'
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