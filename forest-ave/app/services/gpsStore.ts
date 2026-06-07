import { LocationObject } from 'expo-location';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import { create } from 'zustand';

type GpsState = {
    currLocation: LocationObject | null//frequent updates (50ms --> a few minutes depending on movement)
    locationHistory: FeatureCollection<Geometry> | null //infrequent updates (~2 seconds or much more dpeenidng on movemnet)
};

type GpsAction = {
    updateCurrLocation: (currLocation: GpsState['currLocation']) => void
    updateLocationHistory: (locationHistory: GpsState['locationHistory']) => void
}

export const useGpsStore = create<GpsState & GpsAction>((set) => ({
    currLocation: null,
    locationHistory: null,

    updateCurrLocation: (location) => set(() => ({currLocation: location})),
    updateLocationHistory: (locationJson) => set(() => ({locationHistory: locationJson}))
}));

export const setCurrLocation = (location: LocationObject | null)  => useGpsStore.setState({currLocation: location});
export const setLocationHistory = (lineSegments: Feature<Geometry>)  => useGpsStore.setState({locationHistory: {
        type: 'FeatureCollection',
        features: [...lineSegments]
    }
}})