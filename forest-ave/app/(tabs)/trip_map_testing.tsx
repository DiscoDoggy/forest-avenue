import Mapbox, { MapView, LocationPuck, Camera, ShapeSource, LineLayer, LineLayerStyle, CircleLayer, CircleLayerStyle, SymbolLayer, SymbolLayerStyle } from "@rnmapbox/maps";
import { useRef } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import MapStatWidget from "../components/stat_widget";
import Ionicons from "@expo/vector-icons/Ionicons";
import MapControlButton from "../components/mapControlButton";

Mapbox.setAccessToken("pk.eyJ1IjoidGhlZmxpZ2h0bGVzc2JpcmQiLCJhIjoiY21tazN3MTQzMWdybzJ3b2M4dHF0Y3JrZSJ9.vwuF1cIXhLfvYU-p1PL7Hw");
Mapbox.setTelemetryEnabled(false);

export default function TripMapExperiment() {
    const camera = useRef<Camera>(null);

    return (
        <View style={styles.page}>
            -- map container
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
                        followUserLocation={true}
                        animationMode='moveTo'
                    />
                </MapView>

                -- top stats
                <View style={styles.topBarStats}>
                    <MapStatWidget 
                        value={28} 
                        title="Avg MPG"
                    />
                    <MapStatWidget 
                        value={24} 
                        title="Curr MPG"
                    />
                    <MapStatWidget 
                        value={23} 
                        title="Miles"
                    />
                    <MapStatWidget 
                        value={35} 
                        title="Avg MPH"
                    />
                </View>

                -- obd2 connection status
                <View>

                </View>

                -- bottom controls
                <View style={styles.tripControls}>
                    <View style={styles.tripRecenter}>
                        <Pressable>
                            <MapControlButton 
                                name="Recenter"
                                iconName="location-sharp"
                                iconColor="rgb(255,10,10)"
                                horizPadding={16}
                                vertPadding={16}
                                iconSize={24}
                            />
                        </Pressable>
                    </View>

                    <View style={styles.tripStartStop}>
                        <Pressable>
                            <MapControlButton 
                                name="Start trip "
                                iconName="paper-plane-sharp"
                                iconColor="#16a2ff"
                                horizPadding={32}
                                vertPadding={32}
                                iconSize={32}
                            />
                        </Pressable>

                        <Pressable>
                            <MapControlButton
                                name="Stop trip"
                                iconName="stop-circle-sharp"
                                iconColor="rgb(255,10,10)"
                                horizPadding={32}
                                vertPadding={32}
                                iconSize={32}
                            />
                        </Pressable>
                    </View>
                </View>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: "#F5FCFF"
    },
    map: {
        flex: 1
    },

    topBarStats: {
        flexDirection: 'row',
        gap:8,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingHorizontal: 8,
        top: 10,
        left: 0,
        right: 0
    },

    tripControls: {
        position: 'absolute',
        bottom: 16,
        
        // gap: 16,
        rowGap: 16,
        columnGap: 16,
        width: '100%',
        // backgroundColor: '#FFFFFF'
    },

    tripRecenter: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },

    tripStartStop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // width: '100%'
        // backgroundColor: '#ffffff',
    }
})