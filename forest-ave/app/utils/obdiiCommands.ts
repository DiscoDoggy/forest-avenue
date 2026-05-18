import { BluetoothDevice } from "react-native-bluetooth-classic";
import { handleSendOBDCmd } from "./sendOBDCmds";


export type OBDPIDProcessor = (OBDHexOutput: string) => number | string;
export type OBDCmdRunner = (OBDCmd: string) => number | string;

export class OBDPIDCmd {
    name: string;
    command: string;
    processor: OBDPIDProcessor;

    constructor(name: string, command: string, processor: OBDPIDProcessor) {
        this.name = name;
        this.command = command;
        this.processor = processor;
    }

    async runCmdOnOBD(btd: BluetoothDevice | null) {
        if(btd === null) {
            throw new Error(`attempted to run ${this.name} but bluetooth device was null`);
        }
        await handleSendOBDCmd(btd, this.command);
    }
}

/*
in processing hex returned from OBD, we must keep in mind that the 
first two hexadecimals values repeat the OBD mode and the PIN that was queried.
For example, for RPM indexing starting at [2] bypasses the mode hex and PID hex returned by OBD2  

as an example, for RPM we may send 01 0C to the ELM327. In response we would get, 01 0C 27 10
where 41 0C is the repeat of the mode and PIN we requested and 27 10 is the RPM.
*/

export const OBDPIDS = {
    RPM: new OBDPIDCmd('RPM', '01 0C', (obdHexOutput) => {
        //OBD2 returns RPM in 4ths of an RPM so hex represents 4x the normal RPM
        const processedHex = processAndValidateObdIIOutputHex(obdHexOutput, 2);
        const RPM = parseInt(processedHex.slice(2).join(""), 16);
        return Math.round(RPM / 4);
    }),

    MAF: new OBDPIDCmd('MAF', '01 10', (obdHexOutput) => {
        const hexArr = processAndValidateObdIIOutputHex(obdHexOutput, 2);
        const MAF = parseInt(hexArr.slice(2).join(""), 16);
        return MAF / 100;
    }),

    MAP: new OBDPIDCmd('MAP', '01 0B', (obdHexOutput) => {
        const hexArr = processAndValidateObdIIOutputHex(obdHexOutput, 1);
        const MAP = parseInt(hexArr[2], 16);
        return MAP;
    }),

    vehicleSpeed: new OBDPIDCmd('vehicle speed', '01 0D', (obdHexOutput) => {
        const hexArr = processAndValidateObdIIOutputHex(obdHexOutput, 1);
        const VS = parseInt(hexArr[2], 16);
        return VS;
    }),

    IAT: new OBDPIDCmd('IAT', '01 0F', (obdHexOutput) => {
        const hexArr = processAndValidateObdIIOutputHex(obdHexOutput, 1);
        const IAT = parseInt(hexArr[2], 16);
        return IAT - 40; 
    }),

    STFT1: new OBDPIDCmd('Short Term Fuel Trim Bank 1', '01 06', (obdHexOutput) => {
        const hexArr = processAndValidateObdIIOutputHex(obdHexOutput, 1);
        const STFT = parseInt(hexArr[2], 16);
        return (STFT / 1.28)  - 100;
    }),

    LTFT1: new OBDPIDCmd('Long Term Fuel Trim Bank 1', '01 07', (obdHexOutput) => {
        const hexArr = processAndValidateObdIIOutputHex(obdHexOutput, 1);
        const LTFT= parseInt(hexArr[2], 16);
        return (LTFT / 1.28)  - 100;
    })
}

export enum AT_CMDS {
    ECHO_OFF = 'ATE0'
};

export const hexResToPID: Record<string, OBDPIDCmd> = {
    '41 0C': OBDPIDS.RPM,
    '41 10': OBDPIDS.MAF,
    '41 0B': OBDPIDS.MAP,
    '41 0D': OBDPIDS.vehicleSpeed,
    '41 0F': OBDPIDS.IAT
};

export enum ELM327_RESPONSES {
    UNKNOWN_CMD = "?",
    NO_DATA = "NO DATA",
    AT_CMD_SUCCESS = "OK"
};

function processAndValidateObdIIOutputHex(hex: string, maxCmdBytes: number) : string[] {
    const hexArr = hex.split(' ');
    if(hexArr.length < 2) {
        throw new Error('returned hex cannot be of less than 2 values');
    }
    else if(hexArr.length === 2) {
        throw new Error('returned hex cannot be exactly two values');
    }

    return hexArr; 
}
