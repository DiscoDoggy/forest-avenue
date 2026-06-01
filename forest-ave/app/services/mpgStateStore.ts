import { create } from 'zustand';

type State = {
    maf: number | null
    vehicleSpeed: number | null

    stft: number | null
    ltft: number | null

    mpg: number | null

    mpgQueryStartTime: number | null
}

type Action = {
    updateMaf: (maf: State['maf']) => void

    updateVehicleSpeed: (vehicleSpeed: State['vehicleSpeed']) => void

    updateStft: (stft: State['stft']) => void
    updateLtft: (ltft: State['ltft']) => void

    updateMpg:  (mpg: State['mpg']) => void

    updateMpgQueryStartTime: (mpgQueryStartTime: State['mpgQueryStartTime']) => void
}

export const useMpgDataStore = create<State & Action>((set) => ({
    maf: null,
    vehicleSpeed: null,

    stft: null,
    ltft: null,

    mpg: null,

    mpgQueryStartTime: null,

    updateMaf:(maf) => set(() => ({maf: maf})),
    updateVehicleSpeed:(vehicleSpeed) => set(() => ({vehicleSpeed: vehicleSpeed})),
    updateStft:(stft) => set(() => ({stft: stft})),
    updateLtft:(ltft) => set(() => ({ltft: ltft})),
    updateMpg:(mpg) => set(() => ({mpg: mpg})),
    updateMpgQueryStartTime: (mpgQueryStartTime) => set(() => ({mpgQueryStartTime: mpgQueryStartTime})),

    updateAll: (inMaf: number | null, inVehicleSpeed: number | null, inStft: number | null, inLtft: number | null, inMpg: number | null, inMpgQueryStartTime: number | null) => {
        set({maf: inMaf, vehicleSpeed: inVehicleSpeed, stft: inStft, ltft: inLtft, mpg: inMpg, mpgQueryStartTime: inMpgQueryStartTime})
    }
}));


export const setMaf = (maf: number | null) => useMpgDataStore.setState({maf});
export const setVehicleSpeed = (vss: number | null) => useMpgDataStore.setState({vehicleSpeed: vss});
export const setStft = (stft: number | null) => useMpgDataStore.setState({stft});
export const setLtft = (ltft: number | null) => useMpgDataStore.setState({ltft});
export const setMpg = (mpg: number) => useMpgDataStore.setState({mpg});
export const setWholeState = (
    inMaf: number | null, 
    inVehicleSpeed: number | null, 
    inStft: number | null, 
    inLtft: number | null, 
    inMpg: number | null,
    inMpgQueryStartTime: number | null) => useMpgDataStore.setState({
        maf: inMaf,
        vehicleSpeed: inVehicleSpeed,
        stft: inStft,
        ltft: inLtft,
        mpg: inMpg,
        mpgQueryStartTime: inMpgQueryStartTime
    });