import { LocationObject, LocationObjectCoords } from 'expo-location';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import { create } from 'zustand';

type GpsState = {
    currLocation: LocationObject | null//frequent updates (50ms --> a few minutes depending on movement)
    locationHistory: FeatureCollection<Geometry> //infrequent updates (~2 seconds or much more dpeenidng on movemnet)
};

type GpsAction = {
    updateCurrLocation: (currLocation: GpsState['currLocation']) => void
    updateLocationHistory: (newSegment: Feature<Geometry>) => void
}


const defaultCoords: LocationObjectCoords = {
    latitude: 39.8333,
    longitude: -98.5833,
    altitude: null,
    altitudeAccuracy: null,
    accuracy: null,
    heading: null,
    speed: null
};
const defaultLocation: LocationObject = {
    coords: defaultCoords,
    timestamp: Date.now()
};

export const useGpsStore = create<GpsState & GpsAction>((set) => ({
    currLocation: defaultLocation,
    locationHistory: {
        type: 'FeatureCollection',
        features: []
    },

    updateCurrLocation: (location) => set(() => ({currLocation: location})),
    updateLocationHistory: (newSegment) => set((state) => ({
        locationHistory: {
            type: 'FeatureCollection',
            features:[...state.locationHistory.features, newSegment]
        }
    }))
}));

export const setCurrLocation = (location: LocationObject | null)  => useGpsStore.setState({currLocation: location});
export const setLocationHistory = (newSegment: Feature<Geometry>) => {
    useGpsStore.setState((state) => ({
        locationHistory: {
            type: 'FeatureCollection',
            features: [...state.locationHistory.features, newSegment]
        }
    }));
    console.log('ENTER SET LOCATION HISTORY');
};