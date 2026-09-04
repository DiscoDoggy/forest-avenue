import Mapbox, { MapView, LocationPuck, Camera, ShapeSource, LineLayer, LineLayerStyle, CircleLayer, CircleLayerStyle, SymbolLayer, SymbolLayerStyle } from "@rnmapbox/maps";
import { useRef, useState } from "react";
import { View, StyleSheet, Pressable, Text, Modal } from "react-native";
import MapStatWidget from "../components/stat_widget";
import MapControlButton from "../components/mapControlButton";
import { tripRecorder } from "../services/serviceContainer";
import { useGpsStore } from "../services/gpsStore";
import { useMpgDataStore } from "../services/mpgStateStore";
import AcceptRejectModal from "../components/acceptRejectModal";
import { MAPBOX_PUBLIC_KEY } from "../configs/keys";

Mapbox.setAccessToken(MAPBOX_PUBLIC_KEY);
Mapbox.setTelemetryEnabled(false);

export default function TripMapExperiment() {
    const camera = useRef<Camera>(null);

    const [shouldFollowLoc, setShouldFollowLoc] = useState(true);

    const gpsMpgColoredLineSegments = useGpsStore((state) => state.locationHistory);
    const currGpsLocation = useGpsStore((state) => state.currLocation);
    const mpg = useMpgDataStore((state) => state.mpg);

    const [isTripStarted, setTripStarted] = useState(false);
    const [isTripPaused, setTripPaused]  = useState(false) ;
    const [isTripStopped, setTripStopped] = useState(false);

    const [isEndTripModalShowing, setEndTripModalShowing] = useState(false);

    const startTrip = () => {
        tripRecorder.startTrip();        
    };

    const pauseTrip = () => {
        tripRecorder.pauseTrip();
    };

    const stopTrip = async () => {
        tripRecorder.pauseTrip();
        setEndTripModalShowing(true);
        setShouldFollowLoc(false);
        
    };

    const onModalClose = async (tripName: string) => {
        tripRecorder.setTripName(tripName);
        await stopTrip();
        await tripRecorder.endTrip();
        setEndTripModalShowing(false);
    }

    const onRecenter = () => {
        setShouldFollowLoc(true);
    }

    return (
        <View style={styles.page}>
            {/* -- map container */}
            <AcceptRejectModal 
                isVisible={isEndTripModalShowing} 
                onClose={onModalClose}
                acceptButtonColor="#FFFFFF"
                rejectButtonColor="#FFFFFF"
                title="Would you like to name the trip?"
                description="(You can always change this later)"
            />
                 <MapView
                    scaleBarEnabled={false}
                    style={styles.map}
                    onCameraChanged={(e) => {
                        if(e.gestures.isGestureActive) {
                            setShouldFollowLoc(false);
                        }
                    }}
                >
                    <LocationPuck
                        puckBearingEnabled
                        puckBearing="heading"
                        pulsing={{ isEnabled: true }}
                    />
    
                    <Camera
                        ref={camera}
                        zoomLevel={17.1}
                        followUserLocation={shouldFollowLoc}
                        // centerCoordinate={[currGpsLocation?.coords.longitude!, currGpsLocation?.coords.latitude!]}
                        animationMode='moveTo'
                    />
                    <ShapeSource id='feature-source' shape={gpsMpgColoredLineSegments}>

                        <LineLayer id='line-layer' style={lineLayerStyle} slot='middle'></LineLayer>
                        {/* <CircleLayer id='circle-layer' style={circleLayerStyle} slot='middle'></CircleLayer> */}
                        <SymbolLayer id='symbol-layer' style={symbolLayerStyle} slot='middle'></SymbolLayer>

                    </ShapeSource>
                </MapView>

                {/* -- top stats */}
                <View style={styles.topBarStats}>
                    <MapStatWidget 
                        value={mpg ? Number(mpg.toFixed(2)) : -1} 
                        title="Avg MPG"
                    />
                    <MapStatWidget 
                        value={mpg ? Number(mpg.toFixed(2)) : -1} 
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

                {/* -- obd2 connection status */}
                <View>

                </View>

                 {/* bottom controls */}
                <View style={styles.tripControls}>
                    <View style={styles.tripRecenter}>
                        <Pressable
                            onPressOut={onRecenter} 
                        >
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

                        {!isTripStopped && (<Pressable 
                            onPress={() => {
                                setTripPaused(!isTripPaused);
                                setTripStarted(true);
                                if(isTripPaused) {
                                    startTrip()
                                } else {
                                    pauseTrip();
                                }
                            }}
                        >
                            <MapControlButton 
                                name= {!isTripStarted || isTripPaused ? 'Start trip' : 'Pause trip'}
                                iconName="paper-plane-sharp"
                                iconColor="#16a2ff"
                                horizPadding={32}
                                vertPadding={32}
                                iconSize={32}
                            />
                        </Pressable>)}

                        {!isTripStopped && (<Pressable
                            disabled={!isTripStarted ? true : false}
                            onPress={async () => {
                                setTripStopped(true);
                                setTripPaused(false);
                                setTripStarted(false);
                                await stopTrip();
                            }}
                        >
                            <MapControlButton
                                name="Stop trip"
                                iconName="stop-circle-sharp"
                                iconColor="rgb(255,10,10)"
                                horizPadding={32}
                                vertPadding={32}
                                iconSize={32}
                            />
                        </Pressable>)}
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
        
        rowGap: 16,
        columnGap: 16,
        width: '100%',
    },

    tripRecenter: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },

    tripStartStop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
})


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
