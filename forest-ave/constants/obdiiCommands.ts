

type OBDPIDProcessor = (OBDHexOutput: string) => number | string;

class OBDPIDCmd {
    name: string;
    command: string;
    processor: OBDPIDProcessor;

    constructor(name: string, command: string, processor: OBDPIDProcessor) {
        this.name = name;
        this.command = command;
        this.processor = processor;
    }
}

/*
in processing hex returned from OBD, we must keep in mind that the 
first two hexadecimals values repeat the OBD mode and the PIN that was queried.
For example, for RPM indexing starting at [2] bypasses the mode hex and PID hex returned by OBD2  

as an example, for RPM we may send 01 0C to the ELM327. In response we would get, 01 0C 27 10
where 01 0C is the repeat of the mode and PIN we requested and 27 10 is the RPM.
*/

export const OBDPIDS = {
    RPM: new OBDPIDCmd('RPM', '01 0C', (obdHexOutput) => {
        //OBD2 returns RPM in 4ths of an RPM so hex represents 4x the normal RPM
        const processedHex = processAndValidateObdIIOutputHex(obdHexOutput, 2);
        const RPM = parseInt(processedHex.slice(2).join(), 16);
        return Math.round(RPM / 4);
    }),

    MAF: new OBDPIDCmd('MAF', '01 10', (obdHexOutput) => {
        const hexArr = processAndValidateObdIIOutputHex(obdHexOutput, 2);
        const MAF = parseInt(hexArr.slice(2).join(), 16);
        return Math.round(MAF / 100);
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


}

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
