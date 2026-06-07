import { create } from 'zustand';

type MpgState = {
    maf: number | null
    vehicleSpeed: number | null

    stft: number | null
    ltft: number | null

    mpg: number | null

    mpgQueryStartTime: number | null
}

type MpgAction = {
    updateMaf: (maf: MpgState['maf']) => void

    updateVehicleSpeed: (vehicleSpeed: MpgState['vehicleSpeed']) => void

    updateStft: (stft: MpgState['stft']) => void
    updateLtft: (ltft: MpgState['ltft']) => void

    updateMpg:  (mpg: MpgState['mpg']) => void

    updateMpgQueryStartTime: (mpgQueryStartTime: MpgState['mpgQueryStartTime']) => void
}

export const useMpgDataStore = create<MpgState & MpgAction>((set) => ({
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