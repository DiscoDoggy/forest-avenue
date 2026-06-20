import { calculateInstMPGWithoutFuelTrims } from "../utils/mpg";
import { OBDPIDS } from "../utils/obdiiCommands";
import { MpgGpsAggregator } from "./mpgGpsAggregator";
import { OBD2Client } from "./obd2Client";

export type MpgRecord = {
    maf: number | null
    vehicleSpeed: number | null

    stft: number | null
    ltft: number | null

    mpg: number

    mpgQueryStartTime: number | null
}

export class MpgPollingService {
    obdClient!: OBD2Client;
    isPollingEnabled: boolean;
    mpgGpsAggregator: MpgGpsAggregator;

    constructor(obdClient: OBD2Client, mpgGpsAggregator: MpgGpsAggregator) {
        this.obdClient = obdClient;
        this.mpgGpsAggregator = mpgGpsAggregator;
        this.isPollingEnabled = false;
    }

    startMPGPolling() {
        if(this.isPollingEnabled) {
            return;
        }

        this.isPollingEnabled = true;
        this.pollMPGOnce();
    }

    stopMPGPolling() {
        if(!this.isPollingEnabled) {
            return;
        }

        this.isPollingEnabled = false;
    }

    private async pollMPGOnce() {
        const startTime = Date.now();
        const mpgRecord = await this.pollMPG();
        const endTime = Date.now();

        const jobTimeElapsed = endTime - startTime;
        mpgRecord.mpgQueryStartTime = startTime;
        this.mpgGpsAggregator.addMpgData(mpgRecord);

        this.scheduleNextJob(jobTimeElapsed, 500);
    }

    private async scheduleNextJob(prevJobTime: number, delay: number) {
        if(!this.isPollingEnabled) return;

        try{
            if(prevJobTime < delay) {
                setTimeout(async () => {
                    await this.pollMPGOnce();
                }, delay - prevJobTime);
            } else {
                await this.pollMPGOnce();
            }
        } catch(error) {
            console.error('error in scheduleNextJob', error);
        }
    }

    async pollMPG() {
        let maf: string = '';
        let processedMAF: number = Infinity;

        let vss: string = '';
        let processedVSS: number = -Infinity

        try {
            maf = await this.obdClient.queryOBD2(OBDPIDS.MAF.command);
            processedMAF = OBDPIDS.MAF.processor(maf);

            vss = await this.obdClient.queryOBD2(OBDPIDS.vehicleSpeed.command);
            processedVSS = OBDPIDS.vehicleSpeed.processor(vss);
            
        } catch(error) {
            console.error('failed fetch data from obd2 client necessary for mpg calculation', error);
        }

        const mpg = calculateInstMPGWithoutFuelTrims(processedMAF, processedVSS);

        const mpgRecord: MpgRecord = {
            maf: processedMAF,
            vehicleSpeed: processedVSS,
            mpg: mpg,

            stft: null,
            ltft: null,

            mpgQueryStartTime: null
        }

        return mpgRecord;
    }

}

// TODO: we want to create an intialization that tests the different PIDs I have available to 
// determine which mpg polling method we weant to use. Right now this would only include 
// with fuel trim based calculation or using fixed fuel air ratio
