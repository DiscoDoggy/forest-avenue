import { calculateInstMPGWithoutFuelTrims } from "../utils/mpg";
import { OBDPIDS } from "../utils/obdiiCommands";
import { OBD2Client } from "./obd2Client";

export class MpgPollingService {
    obdClient!: OBD2Client;
    isPollingEnabled: boolean;

    constructor(obdClient: OBD2Client) {
        obdClient = obdClient;
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
        const mpg = await this.pollMPG();

        // write to storage the mpg

        const endTime = Date.now();
        const jobTimeElapsed = endTime - startTime;

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

    private async pollMPG() {
        let maf: string = '';
        let vss: string = '';

        try {
            maf = await this.obdClient.queryOBD2(OBDPIDS.MAF.command);
            vss = await this.obdClient.queryOBD2(OBDPIDS.vehicleSpeed.command);
        } catch(error) {
            console.error('failed fetch data from obd2 client necessary for mpg calculation', error);
        }

        const mpg = calculateInstMPGWithoutFuelTrims(parseFloat(maf), parseInt(vss));
        return mpg;
    }

}

